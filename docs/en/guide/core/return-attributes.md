> This document is machine translated and requires review.

# Return Attributes

Return attributes are used to process response content into corresponding .NET data models.

## Rules

Return attributes follow these rules:

1. When the attribute's `EnsureMatchAcceptContentType` property is true (default is false), the attribute only takes effect when its `AcceptContentType` property value matches the response's Content-Type value.
2. When none of the Return attributes' `AcceptContentType` property values match the response's Content-Type value, `ApiReturnNotSupportedException` is thrown.
3. When the attribute's `EnsureSuccessStatusCode` property is true (default is true), and the response status code is not between 200 and 299, `ApiResponseStatusException` is thrown.
4. For multiple Return attributes with the same `AcceptContentType` property value, only the attribute with the highest `AcceptQuality` property value takes effect.

## Default Return Attributes

By default, each interface already has multiple Return attributes with AcceptQuality of 0.1 implicitly present, which can handle raw types, json, and xml response content simultaneously.

**When you want to use a specific Return attribute to handle response content without caring about Content-Type matching, you just need to declare a specific Return attribute with default parameters.**

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

## RawReturnAttribute

Represents a result attribute for raw types, supporting result types of `string`, `byte[]`, `Stream`, and `HttpResponseMessage`:

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

Represents a result attribute for json content, using `System.Text.Json` for serialization and deserialization:

```csharp
[JsonReturn]
Task<JsonResultClass> DemoApiMethod();
```

### Handling Non-standard Content-Type

When the response Content-Type is not `application/json`:

```csharp
[JsonReturn(EnsureMatchAcceptContentType = false)]
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

## XmlReturnAttribute

Represents a result attribute for xml content, using `System.Xml.Serialization` for serialization and deserialization:

```csharp
[XmlReturn]
Task<XmlResultClass> DemoApiMethod();
```

## NoneReturnAttribute

Represents an attribute that sets the result to the return type's default value when the response status is 204:

```csharp
[NoneReturn] 
Task<int> DemoApiMethod(); // If response status code is 204, returns 0

[NoneReturn]
Task<User?> DeleteAsync(string id); // If response status code is 204, returns null
```

## Custom Return Attributes

### Custom JSON Serialization Options

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

### ProtoBuf Return Attribute

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

## Related Documentation

- [HTTP Attributes](http-attributes.md)
- [Content Attributes](content-attributes.md)
- [Exception Handling](../configuration/exception-handling.md)
