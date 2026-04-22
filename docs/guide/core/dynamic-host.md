# 动态 HttpHost

在某些场景下，接口的主机地址需要在运行时动态确定，而不是在编译时固定。

## 使用 UriAttribute 传绝对 Uri

```csharp
[LoggingFilter]
public interface IUserApi
{
    [HttpGet]
    ITask<User> GetAsync([Uri] string urlString, [PathQuery] string id);
}
```

调用时传入完整的 URL：

```csharp
var user = await userApi.GetAsync("http://api.example.com/detail", "id001");
```

## 自定义 HttpHostBaseAttribute

更灵活的方式是自定义 HttpHostBaseAttribute，实现动态主机解析：

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
        // HostProvider 是你自己的服务，数据来源可以是数据库或配置中心等
        var hostProvider = context.HttpContext.ServiceProvider.GetRequiredService<HostProvider>();
        string host = hostProvider.ResolveHost(this.ServiceName);

        // 设置请求消息的 RequestUri
        context.HttpContext.RequestMessage.RequestUri = new Uri(host);
        return Task.CompletedTask;
    }
}
```

## 结合服务发现

在微服务架构中，可以结合服务发现组件实现动态主机解析：

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
        
        // 负载均衡选择一个实例
        var instance = instances.First();
        context.HttpContext.RequestMessage.RequestUri = new Uri(instance.Address);
    }
}
```

## 按租户切换主机

在多租户场景中，可以根据当前租户动态切换 API 主机：

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
