# Global Filters

> This document is machine translated and requires review.

In addition to using `IApiFilterAttribute` subclass attributes in interface declarations, you can also add `IApiFilter` type filters during interface registration configuration.

These filters will apply to the entire interface and execute before `IApiFilterAttribute` type filters applied via attributes.

## Configuring Global Filters

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.GlobalFilters.Add(new UserFilter());
});
```

## Implementing Custom Filters

```csharp
public class UserFilter : IApiFilter
{
    public async Task OnRequestAsync(ApiRequestContext context)
    {
        // Pre-request processing
        var userContext = context.HttpContext.ServiceProvider.GetRequiredService<IUserContext>();
        context.HttpContext.RequestMessage.Headers.Add("X-User-Id", userContext.UserId);
    }

    public async Task OnResponseAsync(ApiResponseContext context)
    {
        // Post-response processing
        var response = context.HttpContext.ResponseMessage;
        // Logging, monitoring, etc.
    }
}
```

## Filter Execution Order

1. Interface-level `GlobalFilters` (in order of addition)
2. Interface-declared `IApiFilterAttribute` attributes
3. Method-declared `IApiFilterAttribute` attributes

## Common Use Cases

### Request Signing

```csharp
public class SignFilter : IApiFilter
{
    public async Task OnRequestAsync(ApiRequestContext context)
    {
        var signService = context.HttpContext.ServiceProvider.GetRequiredService<SignService>();
        var sign = signService.SignValue(DateTime.Now);
        context.HttpContext.RequestMessage.AddUrlQuery("sign", sign);
    }

    public Task OnResponseAsync(ApiResponseContext context) => Task.CompletedTask;
}

services.AddHttpApi<IExternalApi>().ConfigureHttpApi(o =>
{
    o.GlobalFilters.Add(new SignFilter());
});
```

### Request Logging

```csharp
public class RequestLoggingFilter : IApiFilter
{
    private readonly ILogger<RequestLoggingFilter> _logger;

    public RequestLoggingFilter(ILogger<RequestLoggingFilter> logger)
    {
        _logger = logger;
    }

    public async Task OnRequestAsync(ApiRequestContext context)
    {
        var request = context.HttpContext.RequestMessage;
        _logger.LogInformation("Request: {Method} {Uri}", request.Method, request.RequestUri);
    }

    public async Task OnResponseAsync(ApiResponseContext context)
    {
        var response = context.HttpContext.ResponseMessage;
        _logger.LogInformation("Response: {StatusCode}", response.StatusCode);
    }
}
```

### Tenant Context Injection

```csharp
public class TenantFilter : IApiFilter
{
    public async Task OnRequestAsync(ApiRequestContext context)
    {
        var tenantContext = context.HttpContext.ServiceProvider.GetRequiredService<ITenantContext>();
        context.HttpContext.RequestMessage.Headers.Add("X-Tenant-Id", tenantContext.TenantId);
    }

    public Task OnResponseAsync(ApiResponseContext context) => Task.CompletedTask;
}
```

## Dependency Injection

Global filters support constructor injection:

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.GlobalFilters.Add(new SignFilter());  // If SignFilter has dependencies, register it in DI first
});

// Or use factory method
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.GlobalFilters.Add(sp => sp.GetRequiredService<SignFilter>());
});
```

## Related Documentation

- [Request Signing](../core/request-signature.md)
- [Custom Logging Output](../advanced/custom-logging-cache.md)
