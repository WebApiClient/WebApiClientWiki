# Uri 拼接规则

所有的 Uri 拼接都是通过 `new Uri(Uri baseUri, Uri relativeUri)` 这个构造器生成。

## 带 `/` 结尾的 baseUri

- `http://a.com/` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1/` + `b/c/d` = `http://a.com/path1/b/c/d`
- `http://a.com/path1/path2/` + `b/c/d` = `http://a.com/path1/path2/b/c/d`

## 不带 `/` 结尾的 baseUri

- `http://a.com` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1/path2` + `b/c/d` = `http://a.com/path1/b/c/d`

事实上 `http://a.com` 与 `http://a.com/` 是完全一样的，他们的 path 都是 `/`，所以才会表现一样。

## 最佳实践

为了避免低级错误的出现，请使用标准的 baseUri 书写方式，即使用 `/` 作为 baseUri 的结尾：

```csharp
[HttpHost("http://api.example.com/")]  // 推荐：以 / 结尾
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

## 动态 Uri

### 使用 UriAttribute 传绝对 Uri 参

```csharp
[LoggingFilter]
public interface IUserApi
{
    [HttpGet]
    ITask<User> GetAsync([Uri] string urlString, [PathQuery] string id);
}
```

### 自定义 HttpHostBaseAttribute 实现

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
        var hostProvider = context.HttpContext.ServiceProvider.GetRequiredService<HostProvider>();
        string host = hostProvider.ResolveHost(this.ServiceName);
        context.HttpContext.RequestMessage.RequestUri = new Uri(host);
        return Task.CompletedTask;
    }
}
```
