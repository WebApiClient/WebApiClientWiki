# Getting Started

## NuGet Packages

| Package Name | Description | NuGet |
---|---|--|
| WebApiClient.JIT | Stable for non-AOT compiled platforms | [![NuGet](https://buildstats.info/nuget/WebApiClient.JIT)](https://www.nuget.org/packages/WebApiClient.JIT) |
| WebApiClient.AOT | Supports all platforms including IOS and UWP | [![NuGet](https://buildstats.info/nuget/WebApiClient.AOT)](https://www.nuget.org/packages/WebApiClient.AOT) |

## HTTP Requests
>
> Interface declaration

```csharp
public interface IUserApi : IHttpApi
{
    // GET api/user?account=laojiu
    // Return json or xml content
    [HttpGet("api/user")]
    ITask<UserInfo> GetAsync(string account);

    // POST api/user  
    // Body Account=laojiu&password=123456
    // Return json or xml content
    [HttpPost("api/user")]
    ITask<boo> AddAsync([FormContent] UserInfo user);
}
```

> Interface configuration

```csharp
HttpApi.Register<IUserApi>().ConfigureHttpApiConfig(c =>
{
    c.HttpHost = new Uri("http://www.webapiclient.com/");
    c.FormatOptions.DateTimeFormat = DateTimeFormats.ISO8601_WithMillisecond;
});;
```

> Interface invocation

```csharp
var api = HttpApi.Resolve<IUserApi>();
var user = new UserInfo { Account = "laojiu", Password = "123456" }; 
var user1 = await api.GetAsync("laojiu");
var state = await api.AddAsync(user);
```
