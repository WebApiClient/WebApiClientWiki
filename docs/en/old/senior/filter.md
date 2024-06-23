# 1. Filters

The interface for filters is IApiActionFilterAttribute. WebApiClient provides an abstract base class called ApiActionFilterAttribute, which is much simpler to use than implementing a filter from IApiActionFilterAttribute.

## 1.1 TraceFilterAttribute

This is a filter used for debugging and tracing. It can write the request and response content to a specified output target. If the output target is LoggerFactory, you need to configure a LoggerFactory instance or a ServiceProvider instance in HttpApiConfig.

Interface or method using [TraceFilter]

```csharp
[TraceFilter(OutputTarget = OutputTarget.Console)] // Output to the console window
public interface IUserApi : IHttpApi
{
    // GET {url}?account={account}&password={password}&something={something}
    [HttpGet]
    [Timeout(10 * 1000)] // 10s timeout
    Task<string> GetAboutAsync(
        [Url] string url,
        UserInfo user,
        string something);
}
```

Output request information after the request

```csharp
var userApi = HttpApi.Resolve<IUserApi>();
var about = await userApi.GetAboutAsync("webapi/user/about", user, "somevalue");
```

```text
IUserApi.GetAboutAsync
[REQUEST] 2018-10-08 23:55:25.775
GET /webapi/user/about?Account=laojiu&password=123456&BirthDay=2018-01-01&Gender=1&something=somevalue HTTP/1.1
Host: localhost:9999
[RESPONSE] 2018-10-08 23:55:27.047
This is from NetworkSocket.Http
[TIMESPAN] 00:00:01.2722715
```

## 1.2 Custom Filters

```csharp
[SignFilter]
public interface IUserApi : IHttpApi
{
    ...
}

class SignFilter : ApiActionFilterAttribute
{
    public override Task OnBeginRequestAsync(ApiActionContext context)
    {
        var sign = DateTime.Now.Ticks.ToString();
        context.RequestMessage.AddUrlQuery("sign", sign);
        return base.OnBeginRequestAsync(context);
    }
}
```

When we need to dynamically add an additional parameter called "sign" to each request's URL, which may be related to configuration files, and needs to be calculated every time, we can design and apply a SignFilter as shown above.
