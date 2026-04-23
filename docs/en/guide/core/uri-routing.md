# URI Routing Rules

All URI routing is handled through the `new Uri(Uri baseUri, Uri relativeUri)` constructor.

## baseUri with Trailing `/`

- `http://a.com/` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1/` + `b/c/d` = `http://a.com/path1/b/c/d`
- `http://a.com/path1/path2/` + `b/c/d` = `http://a.com/path1/path2/b/c/d`

## baseUri without Trailing `/`

- `http://a.com` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1/path2` + `b/c/d` = `http://a.com/path1/b/c/d`

In fact, `http://a.com` and `http://a.com/` are identical—both have a path of `/`—so they behave the same way.

## Best Practices

To avoid routing errors, use the standard baseUri format with a trailing `/`:

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
