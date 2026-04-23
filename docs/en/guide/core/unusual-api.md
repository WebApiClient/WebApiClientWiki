# Adapting Non-Standard APIs

Some backend API designs may not follow standard conventions. WebApiClientCore provides multiple approaches to handle these scenarios.

## Handling Unfriendly Parameter Names

For example, if the server requires a query parameter named `field-Name`, which contains characters not allowed in C# identifiers, you can use `[AliasAsAttribute]`:

```csharp
public interface IUserApi
{
    [HttpGet("api/users")]
    ITask<string> GetAsync([AliasAs("field-Name")] string fieldName);
}
```

The resulting request URI becomes: `api/users/?field-Name=fieldNameValue`

## Form Field as JSON String

| Field | Value |
|------|------|
| field1 | someValue |
| field2 | `{"name":"sb","age":18}` |

The .NET model corresponding to field2:

```csharp
public class Field2
{
    public string Name { get; set; }
    public int Age { get; set; }
}
```

Typically, you would need to serialize the field2 instance to JSON and assign the string to a form field. Using the `[JsonFormField]` attribute, you can automatically serialize the `Field2` type to JSON and use it as a form field value.

```csharp
public interface IUserApi
{
    Task PostAsync([FormField] string field1, [JsonFormField] Field2 field2);
}
```

## Form Fields with Nested Structure

| Field | Value |
|------|------|
| field1 | someValue |
| field2.name | sb |
| field2.age | 18 |

The .NET model corresponding to the Form:

```csharp
public class FormModel
{
    public string Field1 { get; set; }
    public Field2 Field2 { get; set; }
}

public class Field2
{
    public string Name { get; set; }
    public int Age { get; set; }
}
```

Ideally, complex nested data models should be submitted using `application/json`. However, if the service provider requires `x-www-form-urlencoded`, you can configure `KeyValueSerializeOptions` to achieve this format:

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.KeyValueSerializeOptions.KeyNamingStyle = KeyNamingStyle.FullName;
});
```

## Response Content-Type Mismatch

The response body appears to be JSON, but the response Content-Type header is not `application/json` or `application/xml`—it might be `text/html` instead. Similarly, a client might submit JSON content with a `text/plain` Content-Type, preventing the server from processing it correctly.

To handle this, declare the `[JsonReturn]` attribute on the interface or method and set `EnsureMatchAcceptContentType` to `false`:

```csharp
[JsonReturn(EnsureMatchAcceptContentType = false)]
public interface IUserApi
{
}
```
