# Parameters and Attribute Annotations

These annotation attributes are in the namespace WebApiClient.DataAnnotations and are used to influence the serialization behavior of parameters.

## Parameter Alias

```csharp
public interface IMyWebApi : IHttpApi
{
    // GET <http://www.mywebapi.com/webapi/user?_name=laojiu>
    [HttpGet("http://www.mywebapi.com/webapi/user")]
    ITask<string> GetUserByAccountAsync(
        [AliasAs("_name")] string account);
}
```

## Parameter Model Attribute Annotations

```csharp
public class UserInfo
{
    public string Account { get; set; }

    // Alias
    [AliasAs("a_password")]
    public string Password { get; set; }

    // Date format, highest priority
    [DateTimeFormat("yyyy-MM-dd")]
    [IgnoreWhenNull] // Ignore serialization if value is null
    public DateTime? BirthDay { get; set; }
    
    // Ignore serialization
    [IgnoreSerialized]
    public string Email { get; set; } 
    
    // Date format
    [DateTimeFormat("yyyy-MM-dd HH:mm:ss")]
    public DateTime CreateTime { get; set; }
}
```
