# Content Attributes

Content attributes are used to define the format and serialization method of the HTTP request body.

## Request Body Attributes

### JsonContentAttribute

Serialize parameter value as JSON content of the request:

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([JsonContent] User user);
}
```

Supported properties:
- `CharSet`: Encoding name, default is utf-8
- `AllowChunked`: Whether to allow chunked transfer, default is true

### XmlContentAttribute

Serialize parameter value as XML content of the request:

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([XmlContent] User user);
}
```

Supported properties:
- `CharSet`: Encoding name, default is utf-8

## Form Attributes

### FormContentAttribute

Use parameter value key-value pairs as x-www-form-urlencoded form:

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormContent] User user);
}
```

Supported properties:
- `CollectionFormat`: Collection format style, default is Multi

### FormFieldAttribute

Constant value for x-www-form-urlencoded form field:

```csharp
public interface IUserApi
{
    [FormField("fieldName1", "fieldValue1")]
    [FormField("fieldName2", "fieldValue2")]
    [HttpPost("api/users")]
    Task<User> PostAsync([FormContent] User user);
}
```

Use parameter value as x-www-form-urlencoded form field:

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormContent] User user, [FormField] string field1);
}
```

### FormDataContentAttribute

Use parameter value key-value pairs as multipart/form-data form:

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user, FormDataFile headImage);
}
```

Supported properties:
- `CollectionFormat`: Collection format style, default is Multi

### FormDataTextAttribute

Constant value for multipart/form-data form field:

```csharp
public interface IUserApi
{
    [FormDataText("fieldName1", "fieldValue1")]
    [FormDataText("fieldName2", "fieldValue2")]
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user);
}
```

Use parameter value as multipart/form-data form field:

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user, FormDataFile headImage, [FormDataText] string field1);
}
```

### JsonFormFieldAttribute

Serialize parameter value as JSON string for form field:

```csharp
public interface IUserApi
{
    [HttpPost("api/submit")]
    Task PostAsync([FormField] string field1, [JsonFormField] ComplexData field2);
}
```

### JsonFormDataTextAttribute

Serialize parameter value as JSON string for multipart/form-data form field:

```csharp
public interface IUserApi
{
    [HttpPost("api/submit")]
    Task PostAsync([FormDataContent] User user, [JsonFormDataText] ComplexData metadata);
}
```

## Raw Content Attributes

### RawStringContentAttribute

Raw text content:

```csharp
public interface IUserApi
{
    [HttpPost]
    Task PostAsync([RawStringContent("text/plain")] string text);
}
```

Supported properties:
- `CharSet`: Encoding name, default is utf-8

### RawJsonContentAttribute

Raw json content:

```csharp
public interface IUserApi
{
    [HttpPost]
    Task PostAsync([RawJsonContent] string json);
}
```

### RawXmlContentAttribute

Raw xml content:

```csharp
public interface IUserApi
{
    [HttpPost]
    Task PostAsync([RawXmlContent] string xml);
}
```

### RawFormContentAttribute

Raw x-www-form-urlencoded form content. This content needs to be form-encoded:

```csharp
public interface IUserApi
{
    [HttpPost]
    Task PostAsync([RawFormContent] string form);
}
```

## Content Type Reference Table

| Attribute | Content-Type |
|-----------|--------------|
| `[JsonContent]` | application/json |
| `[XmlContent]` | application/xml |
| `[FormContent]` | application/x-www-form-urlencoded |
| `[FormDataContent]` | multipart/form-data |
| `[JsonFormField]` | As form field, value is JSON string |
| `[JsonFormDataText]` | As multipart field, value is JSON string |
| `[RawStringContent]` | Custom |
| `[RawJsonContent]` | application/json |
| `[RawXmlContent]` | application/xml |
| `[RawFormContent]` | application/x-www-form-urlencoded |

## Related Documentation

- [HTTP Attributes](http-attributes.md)
- [Return Attributes](return-attributes.md)
- [Form Collection Processing](form-collection.md)
