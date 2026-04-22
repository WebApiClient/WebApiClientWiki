# Dynamic HttpHost

> This document is machine translated and requires review.

In some scenarios, the host address of an API needs to be determined dynamically at runtime rather than fixed at compile time.

## Using UriAttribute for Absolute Uri

```csharp
[LoggingFilter]
public interface IUserApi
{
    [HttpGet]
    ITask<User> GetAsync([Uri] string urlString, [PathQuery] string id);
}
```

Pass in the complete URL when calling:

```csharp
var user = await userApi.GetAsync("http://api.example.com/detail", "id001");
```

## Custom HttpHostBaseAttribute

A more flexible approach is to customize HttpHostBaseAttribute to implement dynamic host resolution:

```csharp
[ServiceNameHost("baidu")]
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);

    [HttpPost("api/users")]
    Task<User> PostAsync([JsonContent] User user);
}

public class ServiceNameHostAttribute : HttpHostBaseAttribute
{
    public string ServiceName { get; }

    public ServiceNameHostAttribute(string serviceName)
    {
        this.ServiceName = serviceName;
    }

    public override Task OnRequestAsync(ApiRequestContext context)
    {
        // HostProvider is your own service, data source can be database or configuration center, etc.
        var hostProvider = context.HttpContext.ServiceProvider.GetRequiredService<HostProvider>();
        string host = hostProvider.ResolveHost(this.ServiceName);

        // Set RequestUri of the request message
        context.HttpContext.RequestMessage.RequestUri = new Uri(host);
        return Task.CompletedTask;
    }
}
```

## Combining with Service Discovery

In microservices architecture, you can combine with service discovery components to implement dynamic host resolution:

```csharp
public class ServiceDiscoveryHostAttribute : HttpHostBaseAttribute
{
    private readonly string _serviceName;

    public ServiceDiscoveryHostAttribute(string serviceName)
    {
        _serviceName = serviceName;
    }

    public override async Task OnRequestAsync(ApiRequestContext context)
    {
        var discovery = context.HttpContext.ServiceProvider.GetRequiredService<IServiceDiscovery>();
        var instances = await discovery.GetInstancesAsync(_serviceName);
        
        // Load balancing to select an instance
        var instance = instances.First();
        context.HttpContext.RequestMessage.RequestUri = new Uri(instance.Address);
    }
}
```

## Switching Host by Tenant

In multi-tenant scenarios, you can dynamically switch API hosts based on the current tenant:

```csharp
[TenantHost]
public interface IOrderApi
{
    [HttpGet("orders/{id}")]
    Task<Order> GetAsync(string id);
}

public class TenantHostAttribute : HttpHostBaseAttribute
{
    public override Task OnRequestAsync(ApiRequestContext context)
    {
        var tenantContext = context.HttpContext.ServiceProvider.GetRequiredService<ITenantContext>();
        var host = tenantContext.GetCurrentTenantHost();
        
        context.HttpContext.RequestMessage.RequestUri = new Uri(host);
        return Task.CompletedTask;
    }
}
```
