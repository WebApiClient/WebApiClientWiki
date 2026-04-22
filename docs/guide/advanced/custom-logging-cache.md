# 自定义日志和缓存

## 自定义日志输出目标

默认的日志输出到控制台或文件，可以通过继承 `LoggingFilterAttribute` 来自定义日志输出目标：

```csharp
[CustomLogging]
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}

public class CustomLoggingAttribute : LoggingFilterAttribute
{
    protected override Task WriteLogAsync(ApiResponseContext context, LogMessage logMessage)
    {
        // 输出到自定义目标
        var logger = context.HttpContext.ServiceProvider.GetRequiredService<ILogger<IUserApi>>();
        
        logger.LogInformation(
            "Request: {Method} {Uri}\nResponse: {StatusCode}\nDuration: {Duration}ms",
            logMessage.Request?.Method,
            logMessage.Request?.RequestUri,
            logMessage.Response?.StatusCode,
            logMessage.Duration.TotalMilliseconds);
            
        return Task.CompletedTask;
    }
}
```

### 输出到数据库

```csharp
public class DatabaseLoggingAttribute : LoggingFilterAttribute
{
    protected override async Task WriteLogAsync(ApiResponseContext context, LogMessage logMessage)
    {
        var db = context.HttpContext.ServiceProvider.GetRequiredService<AppDbContext>();
        
        var log = new ApiLog
        {
            Method = logMessage.Request?.Method?.Method,
            Uri = logMessage.Request?.RequestUri?.ToString(),
            StatusCode = (int?)logMessage.Response?.StatusCode,
            DurationMs = logMessage.Duration.TotalMilliseconds,
            Timestamp = DateTime.UtcNow
        };
        
        db.ApiLogs.Add(log);
        await db.SaveChangesAsync();
    }
}
```

### 结构化日志（Serilog）

```csharp
public class SerilogLoggingAttribute : LoggingFilterAttribute
{
    protected override Task WriteLogAsync(ApiResponseContext context, LogMessage logMessage)
    {
        Log.Information(
            "{Method} {Uri} responded {StatusCode} in {Duration}ms",
            logMessage.Request?.Method,
            logMessage.Request?.RequestUri,
            (int?)logMessage.Response?.StatusCode,
            logMessage.Duration.TotalMilliseconds);
            
        return Task.CompletedTask;
    }
}
```

## 自定义缓存提供者

默认的缓存提供者为内存缓存，如果希望将缓存保存到其它存储位置，则需要自定义缓存提供者。

### Redis 缓存提供者

```csharp
public static class WebApiClientBuilderExtensions
{
    public static IWebApiClientBuilder UseRedisResponseCacheProvider(this IWebApiClientBuilder builder)
    {
        builder.Services.AddSingleton<IResponseCacheProvider, RedisResponseCacheProvider>();
        return builder;
    }
}

public class RedisResponseCacheProvider : IResponseCacheProvider
{
    private readonly IConnectionMultiplexer _redis;
    
    public RedisResponseCacheProvider(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public string Name => nameof(RedisResponseCacheProvider);

    public async Task<ResponseCacheResult> GetAsync(string key)
    {
        var db = _redis.GetDatabase();
        var value = await db.StringGetAsync(key);
        
        if (value.IsNullOrEmpty)
            return new ResponseCacheResult(null, false);
            
        var entry = JsonSerializer.Deserialize<ResponseCacheEntry>(value);
        return new ResponseCacheResult(entry, true);
    }

    public async Task SetAsync(string key, ResponseCacheEntry entry, TimeSpan expiration)
    {
        var db = _redis.GetDatabase();
        var value = JsonSerializer.Serialize(entry);
        await db.StringSetAsync(key, value, expiration);
    }
}
```

### 使用

```csharp
services
    .AddWebApiClient()
    .UseRedisResponseCacheProvider();
```

### 分布式缓存提供者

```csharp
public class DistributedCacheProvider : IResponseCacheProvider
{
    private readonly IDistributedCache _cache;

    public DistributedCacheProvider(IDistributedCache cache)
    {
        _cache = cache;
    }

    public string Name => nameof(DistributedCacheProvider);

    public async Task<ResponseCacheResult> GetAsync(string key)
    {
        var bytes = await _cache.GetAsync(key);
        if (bytes == null)
            return new ResponseCacheResult(null, false);

        using var stream = new MemoryStream(bytes);
        var entry = await JsonSerializer.DeserializeAsync<ResponseCacheEntry>(stream);
        return new ResponseCacheResult(entry, true);
    }

    public async Task SetAsync(string key, ResponseCacheEntry entry, TimeSpan expiration)
    {
        using var stream = new MemoryStream();
        await JsonSerializer.SerializeAsync(stream, entry);
        await _cache.SetAsync(key, stream.ToArray(), new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiration
        });
    }
}
```

## 相关文档

- [全局过滤器](../configuration/global-filters.md)
- [HttpClient 配置](../configuration/httpclient.md)
