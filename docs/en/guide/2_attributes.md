# Built-in Attributes

Built-in attributes refer to some features provided within the framework that can be used out of the box to meet various application requirements. Developers can also write custom attributes to meet specific scenario needs and then apply them to interfaces, methods, or parameters.

> Execution Order Before

Parameter value validation -> IApiActionAttribute -> IApiParameterAttribute -> IApiReturnAttribute -> IApiFilterAttribute

> Execution Order After

IApiReturnAttribute -> Return value validation -> IApiFilterAttribute

## Positions of Each Attribute

```csharp
[IApiFilterAttribute]/*Applied to all methods within the interface*/
[IApiReturnAttribute]/*Applied to all methods within the interface*/
public interface DemoApiInterface
{
    [IApiActionAttribute]
    [IApiFilterAttribute]/*Applied to this method*/
    [IApiReturnAttribute]/*Applied to this method*/
    Task<HttpResponseMessage> DemoApiMethod([IApiParameterAttribute] ParameterClass parameterClass);
}
```

## Return Attribute

The return attribute is used to handle the response content as the corresponding .NET data model. It follows the following rules:

1. When the EnsureMatchAcceptContentType property of the attribute is true (default is false), it only takes effect when the AcceptContentType property value matches the Content-Type value of the response.
2. When none of the AcceptContentType property values of the return attributes match the Content-Type value of the response, it throws an `ApiReturnNotSupportedException`.
3. When the EnsureSuccessStatusCode property of the attribute is true (default is true), and the response status code is not between 200 and 299, it throws an `ApiResponseStatusException`.
4. For multiple return attributes with the same AcceptContentType property value, only the attribute with the highest AcceptQuality property value takes effect.

### Default Return Attribute

By default, each interface already has multiple return attributes with an AcceptQuality of 0.1, which can handle multiple response contents such as raw types, JSON, and XML at the same time.

**If you want to handle the response content with a specific return attribute without considering the matching of the Content-Type, you need to declare the default parameter of the specific return attribute.**

```csharp
[JsonReturn] // (.AcceptQuality = MAX, .EnsureSuccessStatusCode = true, .EnsureMatchAcceptContentType = false)
/* The following attributes are implicitly present
[RawReturn(0.1, EnsureSuccessStatusCode = true, EnsureMatchAcceptContentType = true)] 
[NoneReturn(0.1, EnsureSuccessStatusCode = true, EnsureMatchAcceptContentType = true)]
[JsonReturn(0.1, EnsureSuccessStatusCode = true, EnsureMatchAcceptContentType = true)]
[XmlReturn(0.1, EnsureSuccessStatusCode = true, EnsureMatchAcceptContentType = true)]
*/
Task<SpecialResultClass> DemoApiMethod();
```

### RawReturnAttribute

Represents the result attribute of the raw type, supports result types such as `string`, `byte[]`, `Stream`, and `HttpResponseMessage`.

```csharp
[RawReturnAttribute]
Task<HttpResponseMessage> DemoApiMethod();
```

### JsonReturnAttribute

Represents the result attribute of JSON content, uses `System.Text.Json` for serialization and deserialization.

```csharp
[JsonReturnAttribute]
Task<JsonResultClass> DemoApiMethod();
```

### XmlReturnAttribute

Represents the result attribute of XML content, uses `System.Xml.Serialization` for serialization and deserialization.

```csharp
[XmlReturnAttribute]
Task<XmlResultClass> DemoApiMethod();
```

### NoneReturnAttribute

Represents the result attribute that sets the result to the default value of the return type when the response status is 204.

```csharp
// if response status code is 204, return default value of return type
[NoneReturnAttribute] 
Task<int> DemoApiMethod();
```

## Action Attributes

### HttpHostAttribute

The HttpHost attribute can only be used when the request domain is a known constant.

```csharp
[HttpHost("http://localhost:5000/")] // Applies to all methods under the interface
public interface IUserApi
{   
    Task<User> GetAsync(string id);

    [HttpHost("http://localhost:8000/")] // Overrides the HttpHost declared in the interface   
    Task<User> PostAsync(User user);
}
```

### HttpGetAttribute

GET request

```csharp
public interface IUserApi
{   
    [HttpGet("api/users/{id}")] // Supports null, absolute, or relative paths
    Task<User> GetAsync(string id);
}
```

### HttpPostAttribute

POST request

```csharp
public interface IUserApi
{
    [HttpPost("api/users")] // Supports null, absolute, or relative paths
    Task<User> PostAsync([JsonContent] User user);
}
```

### HttpPutAttribute

PUT request

```csharp
public interface IUserApi
{
    [HttpPut("api/users")] // Supports null, absolute, or relative paths
    Task<User> PutAsync([JsonContent] User user);
}
```

### HttpDeleteAttribute

DELETE request

```csharp
public interface IUserApi
{
    [HttpDelete("api/users")] // Supports null, absolute, or relative paths
    Task<User> DeleteAsync([JsonContent] User user);
}
```

### HttpPatchAttribute

PATCH request

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

Constant value request header.

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

Constant value request timeout duration.

```csharp
public interface IUserApi
{   
    [Timeout(10 * 1000)] // Timeout duration is 10 seconds
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

### FormFieldAttribute

Constant value x-www-form-urlencoded form field.

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

Constant value multipart/form-data form field.

```csharp
public interface IUserApi
{
    [FormDataText("fieldName1", "fieldValue1")]
    [FormDataText("fieldName2", "fieldValue2")]
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user);
}
```

## Parameter Attributes

### PathQueryAttribute

The key-value pair of the parameter value is used as the request URL path parameter or query parameter. For general types of parameters, the PathQueryAttribute implicitly takes effect when no attribute is specified.

```csharp
public interface IUserApi
{   
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync([PathQuery] string id);
}
```

### FormContentAttribute

The key-value pair of the parameter value is used as x-www-form-urlencoded form.

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user);
}
```

### FormFieldAttribute

The parameter value is used as x-www-form-urlencoded form field and value.

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user, [FormField] string field1);
}
```

### FormDataContentAttribute

The key-value pair of the parameter value is used as multipart/form-data form.

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user, /*Form file*/ FormDataFile headImage);
}
```

### FormDataTextAttribute

The parameter value is used as multipart/form-data form field and value.

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user, /*Form file*/ FormDataFile headImage, [FormDataText] string field1);
}
```

### JsonContentAttribute

The parameter value is serialized as the request JSON content.

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([JsonContent] User user);
}
```

### XmlContentAttribute

The parameter value is serialized as the request XML content.

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([XmlContent] User user);
}
```

### UriAttribute

The parameter value is used as the request URI, can only be applied to the first parameter, and can be a relative URI or an absolute URI.

```csharp
public interface IUserApi
{
    [HttpGet]
    Task<User> GetAsync([Uri] Uri uri);
}
```

### TimeoutAttribute

The parameter value is used as the timeout duration in milliseconds, and the value cannot be greater than the Timeout property of HttpClient.

```csharp
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id, [Timeout] int timeout);
}
```

### HeaderAttribute

The parameter value is used as the request header.

```csharp
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id, [Header] string headerName1);
}
```

### HeadersAttribute

The key-value pairs of the parameter value are used as the request headers.

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

Raw text content.

```csharp
public interface IUserApi
{
    [HttpPost]
    Task PostAsync([RawStringContent("text/plain")] string text);
}
```

### RawJsonContentAttribute

Raw JSON content.

```csharp
public interface IUserApi
{
    [HttpPost]
    Task PostAsync([RawJsonContent] string json);
}
```

### RawXmlContentAttribute

Raw XML content.

```csharp
public interface IUserApi
{
    [HttpPost]
    Task PostAsync([RawXmlContent] string xml);
}
```

### RawFormContentAttribute

Raw x-www-form-urlencoded form content, which requires the content to be form-encoded.

```csharp
public interface IUserApi
{
    [HttpPost]
    Task PostAsync([RawFormContent] string form);
}
```

## Filter Attributes

Filter attributes can be used for the final content modification before sending or viewing the response data.

### LoggingFilterAttribute

Outputs the request and response content as logs to the LoggingFactory.

```csharp
[LoggingFilter] // Records request logs for all methods
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
    
    [LoggingFilter(Enable = false)] // Disables logging for this method
    [HttpPost("api/users")]
    Task<User> PostAsync([JsonContent] User user);
}
```

## Cache Attributes

Caches the response content of this request. If the next request meets the expected conditions, it will not request the remote server again but retrieve the cached content from the IResponseCacheProvider. Developers can implement their own ResponseCacheProvider.

### CacheAttribute

Applies caching using the complete URI of the request as the cache key.

```csharp
public interface IUserApi
{
    [Cache(60 * 1000)] // Cache for one minute
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id); 
}
```
