# HTTP 特性

HTTP 特性用于定义 HTTP 请求的方法、路径和基础配置。

## 执行顺序

> 执行前顺序

参数值验证 -> IApiActionAttribute -> IApiParameterAttribute -> IApiReturnAttribute -> IApiFilterAttribute

> 执行后顺序

IApiReturnAttribute -> 返回值验证 -> IApiFilterAttribute

## 特性位置

```csharp
[IApiFilterAttribute]/*作用于接口内所有方法的Filter*/
[IApiReturnAttribute]/*作用于接口内所有方法的ReturnAttribute*/
public interface DemoApiInterface
{
    [IApiActionAttribute]
    [IApiFilterAttribute]/*作用于本方法的Filter*/
    [IApiReturnAttribute]/*作用于本方法的ReturnAttribute*/
    Task<HttpResponseMessage> DemoApiMethod([IApiParameterAttribute] ParameterClass parameterClass);
}
```

## HTTP 方法特性

### HttpHostAttribute

当请求域名是已知的常量时，使用 HttpHost 特性。

```csharp
[HttpHost("http://localhost:5000/")] // 对接口下所有方法适用
public interface IUserApi
{   
    Task<User> GetAsync(string id);

    [HttpHost("http://localhost:8000/")] // 会覆盖接口声明的HttpHost   
    Task<User> PostAsync(User user);
}
```

### HttpGetAttribute

GET 请求：

```csharp
public interface IUserApi
{   
    [HttpGet("api/users/{id}")] // 支持 null、绝对或相对路径
    Task<User> GetAsync(string id);
}
```

### HttpPostAttribute

POST 请求：

```csharp
public interface IUserApi
{
    [HttpPost("api/users")] // 支持 null、绝对或相对路径
    Task<User> PostAsync([JsonContent] User user);
}
```

### HttpPutAttribute

PUT 请求：

```csharp
public interface IUserApi
{
    [HttpPut("api/users")] // 支持 null、绝对或相对路径
    Task<User> PutAsync([JsonContent] User user);
}
```

### HttpDeleteAttribute

DELETE 请求：

```csharp
public interface IUserApi
{
    [HttpDelete("api/users")] // 支持 null、绝对或相对路径
    Task<User> DeleteAsync([JsonContent] User user);
}
```

### HttpPatchAttribute

PATCH 请求：

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

## 请求头特性

### HeaderAttribute

常量值请求头：

```csharp
public interface IUserApi
{   
    [Header("headerName1", "headerValue1")]
    [Header("headerName2", "headerValue2")]
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

参数值作为请求头：

```csharp
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id, [Header] string headerName1);
}
```

### HeadersAttribute

参数值的键值对作为请求头：

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

## 其他特性

### TimeoutAttribute

常量值请求超时时长：

```csharp
public interface IUserApi
{   
    [Timeout(10 * 1000)] // 超时时长为10秒
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

参数值作为超时时间的毫秒数：

```csharp
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id, [Timeout] int timeout);
}
```

### UriAttribute

参数值作为请求Uri，只能修饰第一个参数，可以是相对 Uri 或绝对 Uri：

```csharp
public interface IUserApi
{
    [HttpGet]
    Task<User> GetAsync([Uri] Uri uri);
}
```

### PathQueryAttribute

参数值的键值对作为请求 url 路径参数或 query 参数。一般类型的参数，缺省特性时 PathQueryAttribute 会隐性生效：

```csharp
public interface IUserApi
{   
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync([PathQuery] string id);
}
```

## 相关文档

- [内容特性](content-attributes.md)
- [返回特性](return-attributes.md)
- [过滤器特性](filter-attributes.md)
