# 返回特性

Return 特性用于处理响应内容为对应的 .NET 数据模型。

## 规则

Return 特性存在以下规则：

1. 当特性的 `EnsureMatchAcceptContentType` 属性为 true 时（默认为 false），其 `AcceptContentType` 属性值与响应的 Content-Type 值匹配时才生效。
2. 当所有 Return 特性的 `AcceptContentType` 属性值都不匹配响应的 Content-Type 值时，引发 `ApiReturnNotSupportedException`
3. 当特性的 `EnsureSuccessStatusCode` 属性为 true 时（默认值为 true），且响应的状态码不在 200 到 299 之间时，引发 `ApiResponseStatusException`。
4. 同一种 `AcceptContentType` 属性值的多个 Return 特性，只有 `AcceptQuality` 属性值最大的特性生效。

## 缺省的 Return 特性

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

## RawReturnAttribute

表示原始类型的结果特性，支持结果类型为 `string`、`byte[]`、`Stream` 和 `HttpResponseMessage`：

```csharp
[RawReturn]
Task<HttpResponseMessage> DemoApiMethod();

[RawReturn]
Task<byte[]> GetBytesAsync();

[RawReturn]
Task<Stream> GetStreamAsync();

[RawReturn]
Task<string> GetStringAsync();
```

## JsonReturnAttribute

表示 json 内容的结果特性，使用 `System.Text.Json` 进行序列化和反序列化：

```csharp
[JsonReturn]
Task<JsonResultClass> DemoApiMethod();
```

### 处理非标准 Content-Type

当响应的 Content-Type 不是 `application/json` 时：

```csharp
[JsonReturn(EnsureMatchAcceptContentType = false)]
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

## XmlReturnAttribute

表示 xml 内容的结果特性，使用 `System.Xml.Serialization` 进行序列化和反序列化：

```csharp
[XmlReturn]
Task<XmlResultClass> DemoApiMethod();
```

## NoneReturnAttribute

表示响应状态为 204 时将结果设置为返回类型的默认值特性：

```csharp
[NoneReturn] 
Task<int> DemoApiMethod(); // 如果响应状态码是 204，返回 0

[NoneReturn]
Task<User?> DeleteAsync(string id); // 如果响应状态码是 204，返回 null
```

## 自定义 Return 特性

### 自定义 JSON 序列化选项

```csharp
public class CustomJsonReturnAttribute : JsonReturnAttribute
{
    public CustomJsonReturnAttribute()
    {
        this.EnsureMatchAcceptContentType = false;
    }

    protected override JsonSerializerOptions GetSerializerOptions(ApiResponseContext context)
    {
        var options = base.GetSerializerOptions(context);
        options.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
        return options;
    }
}
```

### ProtoBuf 返回特性

```csharp
public class ProtobufReturnAttribute : ApiReturnAttribute
{
    public ProtobufReturnAttribute(string acceptContentType = "application/x-protobuf")
        : base(new MediaTypeWithQualityHeaderValue(acceptContentType))
    {
    }

    public override async Task SetResultAsync(ApiResponseContext context)
    {
        var stream = await context.HttpContext.ResponseMessage.Content.ReadAsStreamAsync();
        context.Result = Serializer.NonGeneric.Deserialize(
            context.ApiAction.Return.DataType.Type, 
            stream);
    }
}
```

## 相关文档

- [HTTP 特性](http-attributes.md)
- [内容特性](content-attributes.md)
- [异常处理](../configuration/exception-handling.md)
