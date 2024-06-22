# Data Validation

Use ValidationAttribute subclasses to validate request parameter values and response results.

## Parameter Value Validation

```csharp
public interface IUserApi
{    
    [HttpGet("api/users/{email}")]
    Task<User> GetAsync(        
        [EmailAddress, Required] // These validation attributes are used to validate this parameter before the request
        string email);
}
```

## Request or Response Model Validation

Both properties of the User used in the request and response are validated.

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([Required][JsonContent] User user);
}

public class User
{
    [Required]
    [StringLength(10, MinimumLength = 1)]
    public string Account { get; set; }

    [Required]
    [StringLength(10, MinimumLength = 1)]
    public string Password { get; set; }
}
```

## Disable Data Validation

Data validation is enabled by default, but you can disable it by configuring the HttpApiOptions of the interface.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
    {
        // Disable data validation, even if validation attributes are used.
        o.UseParameterPropertyValidate = false;
        o.UseReturnValuePropertyValidate = false;
    }); 
}
```
