# 内容特性

内容特性用于定义 HTTP 请求体的格式和序列化方式。

## 请求体特性

### JsonContentAttribute

参数值序列化为请求的 json 内容：

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([JsonContent] User user);
}
```

### XmlContentAttribute

参数值序列化为请求的 xml 内容：

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([XmlContent] User user);
}
```

## 表单特性

### FormContentAttribute

参数值的键值对作为 x-www-form-urlencoded 表单：

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormContent] User user);
}
```

### FormFieldAttribute

常量值 x-www-form-urlencoded 表单字段：

```csharp
public interface IUserApi
{
    [FormField("fieldName1", "fieldValue1")]
    [FormField("fieldName2", "fieldValue2")]
    [HttpPost("api/users")]
    Task<User> PostAsync([FormContent] User user);
}
```

参数值作为 x-www-form-urlencoded 表单字段与值：

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormContent] User user, [FormField] string field1);
}
```

### FormDataContentAttribute

参数值的键值对作为 multipart/form-data 表单：

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user, FormDataFile headImage);
}
```

### FormDataTextAttribute

常量值 multipart/form-data 表单字段：

```csharp
public interface IUserApi
{
    [FormDataText("fieldName1", "fieldValue1")]
    [FormDataText("fieldName2", "fieldValue2")]
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user);
}
```

参数值作为 multipart/form-data 表单字段与值：

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user, FormDataFile headImage, [FormDataText] string field1);
}
```

### JsonFormFieldAttribute

参数值序列化为 JSON 字符串作为表单字段：

```csharp
public interface IUserApi
{
    [HttpPost("api/submit")]
    Task PostAsync([FormField] string field1, [JsonFormField] ComplexData field2);
}
```

## 原始内容特性

### RawStringContentAttribute

原始文本内容：

```csharp
public interface IUserApi
{
    [HttpPost]
    Task PostAsync([RawStringContent("text/plain")] string text);
}
```

### RawJsonContentAttribute

原始 json 内容：

```csharp
public interface IUserApi
{
    [HttpPost]
    Task PostAsync([RawJsonContent] string json);
}
```

### RawXmlContentAttribute

原始 xml 内容：

```csharp
public interface IUserApi
{
    [HttpPost]
    Task PostAsync([RawXmlContent] string xml);
}
```

### RawFormContentAttribute

原始 x-www-form-urlencoded 表单内容，这些内容要求是表单编码过的：

```csharp
public interface IUserApi
{
    [HttpPost]
    Task PostAsync([RawFormContent] string form);
}
```

## 内容类型对照表

| 特性 | Content-Type |
|------|--------------|
| `[JsonContent]` | application/json |
| `[XmlContent]` | application/xml |
| `[FormContent]` | application/x-www-form-urlencoded |
| `[FormDataContent]` | multipart/form-data |
| `[RawStringContent]` | 自定义 |
| `[RawJsonContent]` | application/json |
| `[RawXmlContent]` | application/xml |
| `[RawFormContent]` | application/x-www-form-urlencoded |

## 相关文档

- [HTTP 特性](http-attributes.md)
- [返回特性](return-attributes.md)
- [表单集合处理](form-collection.md)
