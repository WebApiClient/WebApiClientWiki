# Request URI

## URI Format

Regardless of the HTTP request method, such as GET or POST, the URI follows the following format:
{Scheme}://{UserName}:{Password}@{Host}:{Port}{Path}{Query}{Fragment}
For example: `<http://account:password@www.example.com/path1/?p1=abc#tag>`

## Dynamic PATH

```csharp
public interface IMyWebApi : IHttpApi
{
    // GET <http://www.webapiclient.com/laojiu>
    [HttpGet("http://www.webapiclient.com/{account}"]
    ITask<string> GetUserByAccountAsync(string account);
}
```

Some interface methods semantically segment the path, such as GET `<http://www.webapiclient.com/{account}`. Here, different `{account}` represents personal information under different accounts. The path is declared using `{parameter name}`. The value is automatically replaced from the parameter (or the same-named property of the parameter model) before the request.

## Dynamic URI

```csharp
public interface IMyWebApi : IHttpApi
{
    // GET {URI}
    [HttpGet]
    ITask<string> GetUserByAccountAsync([Uri] string url);

    // GET {URI}?account=laojiu
    [HttpGet]
    ITask<string> GetUserByAccountAsync([Uri] string url, string account);
}
```

If the request URI is determined at runtime, you can pass the request URI as a parameter and decorate it with the `[Uri]` attribute as the first parameter.

## Query Parameters

### Multiple query parameters flattened

```csharp
// GET /webapi/user?account=laojiu&password=123456
[HttpGet("webapi/user")]
ITask<UserInfo> GetUserAsync(string account, string password);
```

### Multiple query parameters merged into a model

```csharp
public class LoginInfo
{
    public string Account { get; set; }
    public string Password { get; set; }
}

// GET /webapi/user?account=laojiu&password=123456
[HttpGet("webapi/user")]
ITask<UserInfo> GetUserAsync(LoginInfo loginInfo);
```

### Multiple query parameters flattened + partially merged into a model

```csharp
public class LoginInfo
{
    public string Account { get; set; }
    public string Password { get; set; }
}

// GET /webapi/user?account=laojiu&password=123456&role=admin
[HttpGet("webapi/user")]
ITask<UserInfo> GetUserAsync(LoginInfo loginInfo, string role);
```

### Explicitly declare the `[PathQuery]` attribute

```csharp
// GET /webapi/user?account=laojiu&password=123456&role=admin
[HttpGet("webapi/user")]
ITask<UserInfo> GetUserAsync(
    [PathQuery]LoginInfo loginInfo,
    [PathQuery]string role);
```

For each parameter without any attribute decoration, it is automatically decorated with `[PathQuery]`, indicating that it is treated as a request path or request parameter. The `[PathQuery]` attribute can set multiple properties such as `Encoding`, `IgnoreWhenNull`, and `DateTimeFormat`.

### Using the `[Parameter(Kind.Query)]` attribute

```csharp
// GET /webapi/user?account=laojiu&password=123456&role=admin
[HttpGet("webapi/user")]
ITask<UserInfo> GetUserAsync(
    [Parameter(Kind.Query)]LoginInfo loginInfo,
    [Parameter(Kind.Query)]string role);
```
