# Custom Request Content and Response Content Parsing

Besides common XML or JSON response content that needs deserialization into strongly-typed result models, you may encounter other binary protocol response content, such as Google's Protocol Buffers.

## Custom Request Content Attribute

```csharp
public class ProtobufContentAttribute : HttpContentAttribute
{
    public string ContentType { get; set; } = "application/x-protobuf";

    protected override Task SetHttpContentAsync(ApiParameterContext context)
    {
        var stream = new MemoryStream();
        if (context.ParameterValue != null)
        {
            Serializer.NonGeneric.Serialize(stream, context.ParameterValue);
            stream.Position = 0L;
        }

        var content = new StreamContent(stream);
        content.Headers.ContentType = new MediaTypeHeaderValue(this.ContentType);
        context.HttpContext.RequestMessage.Content = content;
        return Task.CompletedTask;
    }
}
```

## Custom Response Content Attribute

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
        context.Result = Serializer.NonGeneric.Deserialize(context.ApiAction.Return.DataType.Type, stream);
    }
}
```

## Applying Custom Attributes

```csharp
[ProtobufReturn]
public interface IProtobufApi
{
    [HttpPut("/users/{id}")]
    Task<User> UpdateAsync([Required, PathQuery] string id, [ProtobufContent] User user);
}
```

## Custom JSON Handling

If you need to customize JSON serialization behavior:

```csharp
public class CustomJsonContentAttribute : JsonContentAttribute
{
    protected override JsonSerializerOptions GetSerializerOptions(ApiParameterContext context)
    {
        var options = base.GetSerializerOptions(context);
        options.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
        return options;
    }
}
```

## Custom XML Handling

```csharp
public class CustomXmlContentAttribute : XmlContentAttribute
{
    protected override XmlWriterSettings GetXmlWriterSettings(ApiParameterContext context)
    {
        return new XmlWriterSettings
        {
            Encoding = Encoding.UTF8,
            OmitXmlDeclaration = true
        };
    }
}
```

## Handling Multiple Content Types

Automatically select an appropriate parser based on the response Content-Type:

```csharp
public class SmartReturnAttribute : ApiReturnAttribute
{
    public SmartReturnAttribute()
        : base("application/json", "application/xml", "application/x-protobuf")
    {
    }

    public override async Task SetResultAsync(ApiResponseContext context)
    {
        var contentType = context.HttpContext.ResponseMessage.Content.Headers.ContentType?.MediaType;
        var stream = await context.HttpContext.ResponseMessage.Content.ReadAsStreamAsync();

        context.Result = contentType switch
        {
            "application/json" => await JsonSerializer.DeserializeAsync(
                context.ApiAction.Return.DataType.Type, stream),
            "application/xml" => DeserializeXml(context.ApiAction.Return.DataType.Type, stream),
            "application/x-protobuf" => Serializer.NonGeneric.Deserialize(
                context.ApiAction.Return.DataType.Type, stream),
            _ => throw new NotSupportedException($"Content-Type {contentType} not supported")
        };
    }
}
```

## Related Documentation

- [Special Parameter Types](../core/special-types.md)
- [Custom Logging and Cache](../advanced/custom-logging-cache.md)
