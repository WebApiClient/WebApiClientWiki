# Custom Logging and Cache

## Custom Log Output Target

By default, logs are output to the console or files. You can customize the log output target by inheriting from `LoggingFilterAttribute`:

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
        // Output to custom target
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

### Output to Database

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

### Structured Logging (Serilog)

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

## Custom Cache Provider

The default cache provider uses in-memory caching. To store cache in other storage backends, implement a custom cache provider.

### Redis Cache Provider

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

### Using Redis Cache

```csharp
services
    .AddWebApiClient()
    .UseRedisResponseCacheProvider();
```

### Distributed Cache Provider

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

## Related Documentation

- [Global Filters](../configuration/global-filters.md)
- [HttpClient Configuration](../configuration/httpclient.md)
