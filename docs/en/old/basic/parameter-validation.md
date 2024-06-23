# Parameter and Parameter Property Validation

These validation attributes all have the same base class `ValidationAttribute` provided by `System.ComponentModel.DataAnnotations` namespace from either `netfx` or `corefx`.

## Validation of Parameter Values

```csharp
[HttpGet("webapi/user/GetById/{id}")]
ITask<HttpResponseMessage> GetByIdAsync(
    [Required, StringLength(10)] string id);
```

The `id` parameter is required and must be a string with a maximum length of 10 characters. Otherwise, a `ValidationException` will be thrown.

## Validation of Parameter Property Values

```csharp
public class UserInfo
{
    [Required]
    [StringLength(10, MinimumLength = 1)]
    public string Account { get; set; }

    [Required]
    [StringLength(10, MinimumLength = 6)]
    public string Password { get; set; }
}

[HttpPut("webapi/user/UpdateWithJson")]
ITask<UserInfo> UpdateWithJsonAsync(
    [JsonContent] UserInfo user);
```

When the `user` parameter is not null, it will validate its `Account` and `Password` properties. There is a `UseParameterPropertyValidate` property in `HttpApiConfig` that, when set to false, disables the validation of parameter property values.

## Validation of Both

For the example in the previous section, if we also want to ensure that the `user` parameter value is not null, we can declare the method as follows:

```csharp
[HttpPut("webapi/user/UpdateWithJson")]
ITask<UserInfo> UpdateWithJsonAsync(
    [Required, JsonContent] UserInfo user);
```
