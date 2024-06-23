# GET/HEAD Request

## Simple Example of GET Request

```csharp
public interface IMyWebApi : IHttpApi
{
    // GET <http://www.mywebapi.com/webapi/user?account=laojiu>
    [HttpGet("http://www.mywebapi.com/webapi/user")]
    ITask<HttpResponseMessage> GetUserByAccountAsync(string account);
}

var api = HttpApi.Create<IMyWebApi>();
var response = await api.GetUserByAccountAsync("laojiu");
```

## Using the `[HttpHost]` Attribute

```csharp

[HttpHost("http://www.mywebapi.com/")]
public interface IMyWebApi : IHttpApi
{
    // GET /webapi/user?account=laojiu
    [HttpGet("webapi/user")]
    ITask<HttpResponseMessage> GetUserByAccountAsync(string account);
}
```

If the IMyWebApi interface has multiple methods that all point to the same server, you can extract the domain of the request and place it in the HttpHost attribute.

## Converting Response JSON/XML Content to Strongly Typed Models

### Implicit Conversion to Strongly Typed Model

```csharp

[HttpHost("http://www.mywebapi.com/")]
public interface IMyWebApi : IHttpApi
{
    // GET /webapi/user?account=laojiu
    [HttpGet("webapi/user")]
    ITask<UserInfo> GetUserByAccountAsync(string account);
}
```

When the return data of the method is JSON or XML text of type UserInfo, and the response Content-Type is application/json or application/xml, the original return type ITask<HttpResponseMessage> can be declared as ITask<UserInfo>.

### Explicit Conversion to Strongly Typed Model

```csharp
[HttpHost("http://www.mywebapi.com/")]
public interface IMyWebApi : IHttpApi
{
    // GET /webapi/user?account=laojiu
    [HttpGet("webapi/user")]  
    [JsonReturn] // Indicates using Json to process the return value of type UserInfo
    ITask<UserInfo> GetUserByAccountAsync(string account);
}
```

When the return data of the method is JSON or XML text of type UserInfo, but the response Content-Type may not be the expected application/json or application/xml, you need to explicitly declare the [JsonReturn] or [XmlReturn] attribute.

## Request Cancellation Token Parameter

```csharp
[HttpHost("http://www.mywebapi.com/")]
public interface IMyWebApi : IHttpApi
{
    // GET /webapi/user?account=laojiu
    ITask<UserInfo> GetUserByAccountAsync(string account, CancellationToken token);
}
```

CancellationToken.None represents no cancellation; creating a CancellationTokenSource can provide a CancellationToken.
