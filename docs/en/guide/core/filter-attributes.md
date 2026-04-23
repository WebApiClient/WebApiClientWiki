# Filter Attributes

Filter attributes can be used for final content modification before sending a request, or to view response data content.

## LoggingFilterAttribute

Output request and response content as logs to `LoggingFactory`:

```csharp
[LoggingFilter] // All methods log requests
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
    
    [LoggingFilter(Enable = false)] // Disable logging for this method
    [HttpPost("api/users")]
    Task<User> PostAsync([JsonContent] User user);
}
```

## CacheAttribute

Cache the current response content. If the conditions are met next time, the request will not be sent to the remote server; instead, the cached content will be retrieved from `IResponseCacheProvider`. Developers can implement their own `ResponseCacheProvider`.

```csharp
public interface IUserApi
{
    [Cache(60 * 1000)] // Cache for one minute
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id); 
}
```

### Cache Conditions

```csharp
public interface IUserApi
{
    // Only cache responses with status code 200
    [Cache(60 * 1000, MaxStatusCode = 200)]
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

## Custom Filter Attributes

### Request Signing

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

### Request Header Injection

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

### Response Logging

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

## Filter Execution Order

1. Interface-level GlobalFilters (in order of addition)
2. IApiFilterAttribute attributes declared on the interface
3. IApiFilterAttribute attributes declared on the method

## Related Documentation

- [Global Filters](../configuration/global-filters.md)
- [Custom Logging and Cache](../advanced/custom-logging-cache.md)
