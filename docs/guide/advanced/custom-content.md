# 自定义请求内容与响应内容解析

除了常见的 XML 或 JSON 响应内容要反序列化为强类型结果模型，你可能会遇到其它的二进制协议响应内容，比如 Google 的 ProtoBuf 二进制内容。

## 自定义请求内容处理特性

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

## 自定义响应内容解析特性

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

## 应用自定义特性

```csharp
[ProtobufReturn]
public interface IProtobufApi
{
    [HttpPut("/users/{id}")]
    Task<User> UpdateAsync([Required, PathQuery] string id, [ProtobufContent] User user);
}
```

## 自定义 JSON 处理

如果需要自定义 JSON 序列化行为：

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

## 自定义 XML 处理

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

## 处理多 Content-Type

根据响应 Content-Type 自动选择解析器：

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

## 相关文档

- [特殊参数类型](../core/special-types.md)
- [自定义日志和缓存](custom-logging-cache.md)
