# 3. Custom Attributes

WebApiClient provides many built-in attributes, including interface-level, method-level, and parameter-level attributes. They respectively implement the `IApiActionAttribute`, `IApiActionFilterAttribute`, `IApiParameterAttribute`, `IApiParameterable`, and `IApiReturnAttribute` interfaces.

## 3.1 Customizing IApiParameterAttribute

For example, if the server requires submission in `x-www-form-urlencoded` format, and the interface design is not ideal, the current requirement is to submit a JSON text `fieldX={X}` and `fieldY={Y}`. Here is how we design the corresponding interface:

```csharp
[HttpHost("/upload")]
ITask<bool> UploadAsync(
    [FormField][AliasAs("fieldX")] string xJson,
    [FormField][AliasAs("fieldY")] string yJson);
```

Clearly, the parameter type `string` for our interface is too broad and lacks constraints. We would like it to be like this:

```csharp
[HttpHost("/upload")]
ITask<bool> UploadAsync([FormFieldJson] X fieldX, [FormFieldJson] Y fieldY);
```

The `[FormFieldJson]` attribute serializes the parameter value into JSON and uses it as a field content in the form.

```csharp
[AttributeUsage(AttributeTargets.Parameter, AllowMultiple = false)]
class FormFieldJson: Attribute, IApiParameterAttribute
{
    public async Task BeforeRequestAsync(ApiActionContext context, ApiParameterDescriptor parameter)
    {
      var options = context.HttpApiConfig.FormatOptions;
      var json = context.HttpApiConfig.JsonFormatter.Serialize(parameter.Value, options);
      var fieldName = parameter.Name;
      await context.RequestMessage.AddFormFieldAsync(fieldName, json);
    }
}
```
