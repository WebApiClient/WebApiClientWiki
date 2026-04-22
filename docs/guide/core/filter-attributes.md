# 过滤器特性

Filter 特性可用于发送前最后一步的内容修改，或者查看响应数据内容。

## LoggingFilterAttribute

请求和响应内容的输出为日志到 LoggingFactory：

```csharp
[LoggingFilter] // 所有方法都记录请求日志
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
    
    [LoggingFilter(Enable = false)] // 本方法禁用日志
    [HttpPost("api/users")]
    Task<User> PostAsync([JsonContent] User user);
}
```

## CacheAttribute

把本次的响应内容缓存起来，下一次如果符合预期条件的话，就不会再请求到远程服务器，而是从 `IResponseCacheProvider` 获取缓存内容。开发者可以自己实现 ResponseCacheProvider。

```csharp
public interface IUserApi
{
    [Cache(60 * 1000)] // 缓存一分钟
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id); 
}
```

### 缓存条件

```csharp
public interface IUserApi
{
    // 只缓存状态码为 200 的响应
    [Cache(60 * 1000, MaxStatusCode = 200)]
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

## 自定义过滤器特性

### 请求签名

```csharp
public class SignFilterAttribute : ApiFilterAttribute
{
    public override Task OnRequestAsync(ApiRequestContext context)
    {
        var signService = context.HttpContext.ServiceProvider.GetRequiredService<SignService>();
        var sign = signService.SignValue(DateTime.Now);
        context.HttpContext.RequestMessage.AddUrlQuery("sign", sign);
        return Task.CompletedTask;
    }
}

[SignFilter]
public interface IExternalApi
{
    [HttpGet("api/data")]
    Task<Data> GetDataAsync();
}
```

### 请求头注入

```csharp
public class AuthHeaderAttribute : ApiFilterAttribute
{
    public override Task OnRequestAsync(ApiRequestContext context)
    {
        var authService = context.HttpContext.ServiceProvider.GetRequiredService<IAuthService>();
        var token = authService.GetToken();
        
        context.HttpContext.RequestMessage.Headers.Authorization = 
            new AuthenticationHeaderValue("Bearer", token);
            
        return Task.CompletedTask;
    }
}

[AuthHeader]
public interface ISecuredApi
{
    [HttpGet("api/protected")]
    Task<Data> GetProtectedDataAsync();
}
```

### 响应日志

```csharp
public class ResponseLoggingAttribute : ApiFilterAttribute
{
    public override async Task OnResponseAsync(ApiResponseContext context)
    {
        var logger = context.HttpContext.ServiceProvider.GetRequiredService<ILogger<ResponseLoggingAttribute>>();
        var response = context.HttpContext.ResponseMessage;
        
        logger.LogInformation(
            "Response: {StatusCode} {Uri}",
            response.StatusCode,
            context.HttpContext.RequestMessage.RequestUri);
    }
}
```

## 过滤器执行顺序

1. 接口级别的 GlobalFilters（按添加顺序）
2. 接口声明的 IApiFilterAttribute 特性
3. 方法声明的 IApiFilterAttribute 特性

## 相关文档

- [全局过滤器](../configuration/global-filters.md)
- [自定义日志和缓存](../advanced/custom-logging-cache.md)
