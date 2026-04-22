# Uri Routing Rules

> This document is machine translated and requires review.

All Uri routing is done through the `new Uri(Uri baseUri, Uri relativeUri)` constructor.

## baseUri with trailing `/`

- `http://a.com/` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1/` + `b/c/d` = `http://a.com/path1/b/c/d`
- `http://a.com/path1/path2/` + `b/c/d` = `http://a.com/path1/path2/b/c/d`

## baseUri without trailing `/`

- `http://a.com` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1/path2` + `b/c/d` = `http://a.com/path1/b/c/d`

In fact, `http://a.com` and `http://a.com/` are exactly the same, their paths are both `/`, so they behave identically.

## Best Practices

To avoid basic errors, use the standard baseUri format with `/` as the suffix:

```csharp
[HttpHost("http://api.example.com/")]  // Recommended: ends with /
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

## Dynamic Uri

### Using UriAttribute for Absolute Uri Parameter

```csharp
[LoggingFilter]
public interface IUserApi
{
    [HttpGet]
    ITask<User> GetAsync([Uri] string urlString, [PathQuery] string id);
}
```

### Custom HttpHostBaseAttribute Implementation

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
