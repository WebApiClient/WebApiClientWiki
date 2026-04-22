> This document is machine translated and requires review.

# Content Attributes

Content attributes are used to define the format and serialization method of the HTTP request body.

## Request Body Attributes

### JsonContentAttribute

Parameter value serialized as json content of the request:

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([JsonContent] User user);
}
```

### XmlContentAttribute

Parameter value serialized as xml content of the request:

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([XmlContent] User user);
}
```

## Form Attributes

### FormContentAttribute

Parameter value key-value pairs as x-www-form-urlencoded form:

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormContent] User user);
}
```

### FormFieldAttribute

Constant value x-www-form-urlencoded form field:

```csharp
public interface IUserApi
{
    [FormField("fieldName1", "fieldValue1")]
    [FormField("fieldName2", "fieldValue2")]
    [HttpPost("api/users")]
    Task<User> PostAsync([FormContent] User user);
}
```

Parameter value as x-www-form-urlencoded form field and value:

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormContent] User user, [FormField] string field1);
}
```

### FormDataContentAttribute

Parameter value key-value pairs as multipart/form-data form:

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user, FormDataFile headImage);
}
```

### FormDataTextAttribute

Constant value multipart/form-data form field:

```csharp
public interface IUserApi
{
    [FormDataText("fieldName1", "fieldValue1")]
    [FormDataText("fieldName2", "fieldValue2")]
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user);
}
```

Parameter value as multipart/form-data form field and value:

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([FormDataContent] User user, FormDataFile headImage, [FormDataText] string field1);
}
```

### JsonFormFieldAttribute

Parameter value serialized as JSON string as form field:

```csharp
public interface IUserApi
{
    [HttpPost("api/submit")]
    Task PostAsync([FormField] string field1, [JsonFormField] ComplexData field2);
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

Raw x-www-form-urlencoded form content, this content needs to be form-encoded:

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
| `[RawStringContent]` | Custom |
| `[RawJsonContent]` | application/json |
| `[RawXmlContent]` | application/xml |
| `[RawFormContent]` | application/x-www-form-urlencoded |

## Related Documentation

- [HTTP Attributes](http-attributes.md)
- [Return Attributes](return-attributes.md)
- [Form Collection Processing](form-collection.md)
