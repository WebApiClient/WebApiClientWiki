# 全局过滤器

除了能在接口声明中使用 `IApiFilterAttribute` 子类的特性标注之外，还可以在接口注册时的配置添加 `IApiFilter` 类型的过滤器。

这些过滤器将对整个接口生效，且优先于通过特性标注的 `IApiFilterAttribute` 类型执行。

## 配置全局过滤器

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.GlobalFilters.Add(new UserFilter());
});
```

## 实现自定义过滤器

```csharp
public class UserFilter : IApiFilter
{
    public async Task OnRequestAsync(ApiRequestContext context)
    {
        // 请求前处理
        var userContext = context.HttpContext.ServiceProvider.GetRequiredService<IUserContext>();
        context.HttpContext.RequestMessage.Headers.Add("X-User-Id", userContext.UserId);
    }

    public async Task OnResponseAsync(ApiResponseContext context)
    {
        // 响应后处理
        var response = context.HttpContext.ResponseMessage;
        // 记录日志、监控等
    }
}
```

## 过滤器执行顺序

1. 接口级别的 `GlobalFilters`（按添加顺序）
2. 接口声明的 `IApiFilterAttribute` 特性
3. 方法声明的 `IApiFilterAttribute` 特性

## 常见应用场景

### 请求签名

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

### 请求日志

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

### 租户上下文注入

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

## 依赖注入

全局过滤器支持构造函数注入：

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.GlobalFilters.Add(new SignFilter());  // 如果 SignFilter 有依赖，需要先注册到 DI
});

// 或者使用工厂方法
services.AddHttpApi<IUserApi>().ConfigureHttpApi((o, sp) =>
{
    o.GlobalFilters.Add(sp.GetRequiredService<SignFilter>());
});
```

## 相关文档

- [请求签名](../core/request-signature.md)
- [自定义日志输出](../advanced/custom-logging-cache.md)
