﻿# 内置特性

内置特性指框架内提供的一些特性，拿来即用就能满足一般情况下的各种应用。当然，开发者也可以在实际应用中，编写满足特定场景需求的特性，然后将自定义特性修饰到接口、方法或参数即可。

> 执行前顺序

参数值验证 -> IApiActionAttribute -> IApiParameterAttribute -> IApiReturnAttribute -> IApiFilterAttribute

> 执行后顺序

IApiReturnAttribute -> 返回值验证 -> IApiFilterAttribute

## 各特性的位置

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

## Return 特性

Return 特性用于处理响应内容为对应的 .NET 数据模型，其存在以下规则：

1. 当特性的 EnsureMatchAcceptContentType 属性为 true 时(默认为 false)，其 AcceptContentType 属性值与响应的 Content-Type 值匹配时才生效。
2. 当所有 Return 特性的 AcceptContentType 属性值都不匹配响应的 Content-Type 值时，引发`ApiReturnNotSupportedException`
3. 当特性的 EnsureSuccessStatusCode 属性为 true 时(默认值 为true)，且响应的状态码不在 200 到 299 之间时，引发`ApiResponseStatusException`。
4. 同一种 AcceptContentType 属性值的多个 Return 特性，只有 AcceptQuality 属性值最大的特性生效。

### 缺省的Return特性

在缺省情况下，每个接口的都已经隐性存在了多个 AcceptQuality 为 0.1 的 Return 特性，能同时处理原始类型、json 和 xml 多种响应内容。

**当你想以特定的 Return 特性来处理相应内容而不关注相应的 Content-Type 的匹配性，你需要声明缺省参数的特定 Return 特性即可。**

```csharp
[JsonReturn] // (.AcceptQuality = MAX, .EnsureSuccessStatusCode = true, .EnsureMatchAcceptContentType = false)
/* 以下特性是隐性存在的
[RawReturn(0.1, EnsureSuccessStatusCode = true, EnsureMatchAcceptContentType = true)] 
[NoneReturn(0.1, EnsureSuccessStatusCode = true, EnsureMatchAcceptContentType = true)]
[JsonReturn(0.1, EnsureSuccessStatusCode = true, EnsureMatchAcceptContentType = true)]
[XmlReturn(0.1, EnsureSuccessStatusCode = true, EnsureMatchAcceptContentType = true)]
*/
Task<SpecialResultClass> DemoApiMethod();
```

### RawReturnAttribute

表示原始类型的结果特性,支持结果类型为`string`、`byte[]`、`Stream`和`HttpResponseMessage`

```csharp
[RawReturnAttribute]
Task<HttpResponseMessage> DemoApiMethod();
```

### JsonReturnAttribute

表示json内容的结果特性，使用`System.Text.Json`进行序列化和反序列化

```csharp
[JsonReturnAttribute]
Task<JsonResultClass> DemoApiMethod();
```

### XmlReturnAttribute

表示xml内容的结果特性,使用`System.Xml.Serialization`进行序列化和反序列化

```csharp
[XmlReturnAttribute]
Task<XmlResultClass> DemoApiMethod();
```

### NoneReturnAttribute

表示响应状态为204时将结果设置为返回类型的默认值特性

```csharp
// if response status code is 204, return default value of return type
[NoneReturnAttribute] 
Task<int> DemoApiMethod();
```

## Action 特性

### HttpHostAttribute

当请求域名是已知的常量时，才能使用 HttpHost 特性。

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

GET请求

```csharp
public interface IUserApi
{   
    [HttpGet("api/users/{id}")] // 支持 null、绝对或相对路径
    Task<User> GetAsync(string id);
}
```

### HttpPostAttribute

POST请求

```csharp
public interface IUserApi
{
    [HttpPost("api/users")] // 支持 null、绝对或相对路径
    Task<User> PostAsync([JsonContent] User user);
}
```

### HttpPutAttribute

PUT请求

```csharp
public interface IUserApi
{
    [HttpPut("api/users")] // 支持 null、绝对或相对路径
    Task<User> PutAsync([JsonContent] User user);
}
```

### HttpDeleteAttribute

DELETE请求

```csharp
public interface IUserApi
{
    [HttpDelete("api/users")] // 支持 null、绝对或相对路径
    Task<User> DeleteAsync([JsonContent] User user);
}
```

### HttpPatchAttribute

PATCH请求

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

### HeaderAttribute

常量值请求头。

```csharp
public interface IUserApi
{   
    [Header("headerName1", "headerValue1")]
    [Header("headerName2", "headerValue2")]
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

### TimeoutAttribute

常量值请求超时时长。

```csharp
public interface IUserApi
{   
    [Timeout(10 * 1000)] // 超时时长为10秒
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

### FormFieldAttribute

常量值 x-www-form-urlencoded 表单字段。

```csharp
public interface IUserApi
{
    [FormField("fieldName1", "fieldValue1")]
    [FormField("fieldName2", "fieldValue2")]
    [HttpPost("api/users")]
    Task<User> PostAsync([FormContent] User user);
}
```

### FormDataTextAttribute

常量值 multipart/form-data 表单字段。

```csharp
public interface IUserApi
{
    [FormDataText("fieldName1", "fieldValue1")]
    [FormDataText("fieldName2", "fieldValue2")]
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user);
}
```

## Parameter 特性

### PathQueryAttribute

参数值的键值对作为请示 url 路径参数或 query 参数的特性，一般类型的参数，缺省特性时 PathQueryAttribute 会隐性生效。

```csharp
public interface IUserApi
{   
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync([PathQuery] string id);
}
```

### FormContentAttribute

参数值的键值对作为 x-www-form-urlencoded 表单。

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormContent] User user);
}
```

### FormFieldAttribute

参数值作为 x-www-form-urlencoded 表单字段与值。

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormContent] User user, [FormField] string field1);
}
```

### FormDataContentAttribute

参数值的键值对作为 multipart/form-data 表单。

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user, /*表单文件*/ FormDataFile headImage);
}
```

### FormDataTextAttribute

参数值作为 multipart/form-data 表单字段与值。

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user, /*表单文件*/ FormDataFile headImage, [FormDataText] string field1);
}
```

### JsonContentAttribute

参数值序列化为请求的 json 内容。

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([JsonContent] User user);
}
```

### XmlContentAttribute

参数值序列化为请求的 xml 内容。

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([XmlContent] User user);
}
```

### UriAttribute

参数值作为请求Uri，只能修饰第一个参数，可以是相对 Uri 或绝对 Uri。

```csharp
public interface IUserApi
{
    [HttpGet]
    Task<User> GetAsync([Uri] Uri uri);
}
```

### TimeoutAttribute

参数值作为超时时间的毫秒数，值不能大于 HttpClient 的 Timeout 属性。

```csharp
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id, [Timeout] int timeout);
}
```

### HeaderAttribute

参数值作为请求头。

```csharp
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id, [Header] string headerName1);
}
```

### HeadersAttribute

参数值的键值对作为请求头。

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
    public string HeaderName1 { get; set; }
}
```

### RawStringContentAttribute

原始文本内容。

```csharp
public interface IUserApi
{
    [HttpPost]
    Task PostAsync([RawStringContent("text/plain")] string text);
}
```

### RawJsonContentAttribute

原始 json 内容。

```csharp
public interface IUserApi
{
    [HttpPost]
    Task PostAsync([RawJsonContent] string json);
}
```

### RawXmlContentAttribute

原始 xml 内容。

```csharp
public interface IUserApi
{
    [HttpPost]
    Task PostAsync([RawXmlContent] string xml);
}
```

### RawFormContentAttribute

原始 x-www-form-urlencoded 表单内容，这些内容要求是表单编码过的。

```csharp
public interface IUserApi
{
    [HttpPost]
    Task PostAsync([RawFormContent] string form);
}
```

## Filter 特性

Filter特性可用于发送前最后一步的内容修改，或者查看响应数据内容。

### LoggingFilterAttribute

请求和响应内容的输出为日志到 LoggingFactory。

```csharp
[LoggingFilter] // 所有方法都记录请求日志
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
    
    [LoggingFilter(Enable = false)] // 本方法禁用日志
    [HttpPost("api/users")]
    Task<User> PostAsync([JsonContent] User user);
}
```

## Cache 特性

把本次的响应内容缓存起来，下一次如果符合预期条件的话，就不会再请求到远程服务器，而是从 IResponseCacheProvider 获取缓存内容，开发者可以自己实现 ResponseCacheProvider。

### CacheAttribute

使用请求的完整 Uri 做为缓存的 Key 应用缓存。

```csharp
public interface IUserApi
{
    [Cache(60 * 1000)] // 缓存一分钟
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id); 
}
```
