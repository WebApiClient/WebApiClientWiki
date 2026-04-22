# Adapting Unconventional APIs

> This document is machine translated and requires review.

Some server API designs may not conform to standard conventions. WebApiClientCore provides multiple ways to adapt to these situations.

## Unfriendly Parameter Name Aliases

For example, if the server requires a Query parameter named `field-Name`, which contains characters not allowed in C# keywords or variable naming, we can use `[AliasAsAttribute]` to achieve this:

```csharp
public interface IUserApi
{
    [HttpGet("api/users")]
    ITask<string> GetAsync([AliasAs("field-Name")] string fieldName);
}
```

The final request uri becomes `api/users/?field-name=fileNameValue`

## Form Field as JSON Text

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

Conventionally, we would need to JSON serialize the field2 instance to get JSON text, then assign it to the field2 string property. Using the `[JsonFormField]` attribute can automatically complete JSON serialization of the Field2 type and use the resulting string as a form field.

```csharp
public interface IUserApi
{
    Task PostAsync([FormField] string field1, [JsonFormField] Field2 field2);
}
```

## Form Field with Multi-level Nesting

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

Under reasonable circumstances, for complex nested data models, it should be designed to submit FormModel using `application/json`. However, the service provider designed it to submit FormModel using `x-www-form-urlencoded`. We can configure KeyValueSerializeOptions to achieve this format requirement:

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.KeyValueSerializeOptions.KeyNamingStyle = KeyNamingStyle.FullName;
});
```

## Response Content-Type Not Matching Expected Value

The response content appears to be JSON visually, but the Content-Type in the response header is not the expected `application/json` or `application/xml`, but something like `text/html`. This is like when a client submits JSON content with the Content-Type value in the request header set to `text/plain`, making it impossible for the server to process.

The solution is to declare the `[JsonReturn]` attribute on the Interface or Method, and set its EnsureMatchAcceptContentType property to false, indicating that Content-Type processing should proceed even if it doesn't match the expected value:

```csharp
[JsonReturn(EnsureMatchAcceptContentType = false)]
public interface IUserApi
{
}
```
