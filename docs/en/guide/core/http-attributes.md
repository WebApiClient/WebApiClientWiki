# HTTP Attributes

HTTP attributes are used to define the HTTP request method, path, and basic configuration.

## Execution Order

**Pre-execution order:**

Parameter value validation → IApiActionAttribute → IApiParameterAttribute → IApiReturnAttribute → IApiFilterAttribute

**Post-execution order:**

IApiReturnAttribute → Return value validation → IApiFilterAttribute

## Attribute Placement

```csharp
[IApiFilterAttribute] // Filter applied to all methods in the interface
[IApiReturnAttribute] // ReturnAttribute applied to all methods in the interface
public interface DemoApiInterface
{
    [IApiActionAttribute]
    [IApiFilterAttribute] // Filter applied to this method
    [IApiReturnAttribute] // ReturnAttribute applied to this method
    Task<HttpResponseMessage> DemoApiMethod([IApiParameterAttribute] ParameterClass parameterClass);
}
```

## HTTP Method Attributes

### HttpHostAttribute

Use the `HttpHost` attribute when the request domain is a known constant.

```csharp
[HttpHost("http://localhost:5000/")] // Applies to all methods under the interface
public interface IUserApi
{   
    Task<User> GetAsync(string id);

    [HttpHost("http://localhost:8000/")] // Overrides the HttpHost declared on the interface   
    Task<User> PostAsync(User user);
}
```

### HttpGetAttribute

GET request:

```csharp
public interface IUserApi
{   
    [HttpGet("api/users/{id}")] // Supports null, absolute or relative paths
    Task<User> GetAsync(string id);
}
```

### HttpPostAttribute

POST request:

```csharp
public interface IUserApi
{
    [HttpPost("api/users")] // Supports null, absolute or relative paths
    Task<User> PostAsync([JsonContent] User user);
}
```

### HttpPutAttribute

PUT request:

```csharp
public interface IUserApi
{
    [HttpPut("api/users")] // Supports null, absolute or relative paths
    Task<User> PutAsync([JsonContent] User user);
}
```

### HttpDeleteAttribute

DELETE request:

```csharp
public interface IUserApi
{
    [HttpDelete("api/users")] // Supports null, absolute or relative paths
    Task<User> DeleteAsync([JsonContent] User user);
}
```

### HttpPatchAttribute

PATCH request:

```csharp
public interface IUserApi
{
    [HttpPatch("api/users/{id}")]
    Task<UserInfo> PatchAsync(string id, JsonPatchDocument<User> doc);
}

var doc = new JsonPatchDocument<User>();
doc.Replace(item => item.Account, "laojiu");
doc.Replace(item => item.Email, "laojiu@qq.com");
```

## Request Header Attributes

### HeaderAttribute

Constant value request header:

```csharp
public interface IUserApi
{   
    [Header("headerName1", "headerValue1")]
    [Header("headerName2", "headerValue2")]
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

Use parameter value as request header:

```csharp
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id, [Header] string headerName1);
}
```

### HeadersAttribute

Use parameter value key-value pairs as request headers:

```csharp
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id, [Headers] CustomHeaders headers);

    [HttpGet("api/users/{id}")]
    Task<User> Get2Async(string id, [Headers] Dictionary<string,string> headers);
}

public class CustomHeaders
{
    public string HeaderName1 { get; set; }
    public string HeaderName2 { get; set; }
}
```

## Other Attributes

### TimeoutAttribute

Constant value request timeout duration:

```csharp
public interface IUserApi
{   
    [Timeout(10 * 1000)] // Timeout duration is 10 seconds
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

Use parameter value as timeout in milliseconds:

```csharp
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id, [Timeout] int timeout);
}
```

### UriAttribute

Use parameter value as request URI. Can only decorate the first parameter, and can be a relative or absolute URI:

```csharp
public interface IUserApi
{
    [HttpGet]
    Task<User> GetAsync([Uri] Uri uri);
}
```

### PathQueryAttribute

Use parameter value key-value pairs as request URL path parameters or query parameters. For general type parameters, `PathQueryAttribute` is implicitly applied when no attribute is specified:

```csharp
public interface IUserApi
{   
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync([PathQuery] string id);
}
```

## Related Documentation

- [Content Attributes](content-attributes.md)
- [Return Attributes](return-attributes.md)
- [Filter Attributes](filter-attributes.md)
