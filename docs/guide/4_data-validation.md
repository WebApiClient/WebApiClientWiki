# 数据验证
支持使用 ValidationAttribute 相关特性来验证请求参数值和响应结果。

## 参数值验证
```csharp
public interface IUserApi
{    
    [HttpGet("api/users/{email}")]
    Task<User> GetAsync(
        // 这些验证特性用于请求前验证此参数
        [EmailAddress, Required] 
        string email);
}
```

## 请求或响应模型验证

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync([Required][JsonContent] User user);
}

// 支持模型的属性上声明ValidationAttribute
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

## 关闭数据验证功能
默认配置下，数据验证功能是开启的，可以在接口对接的HttpApiOptions配置关闭数据验证功能。

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddHttpApi<ICloudflareApi>().ConfigureHttpApi(o =>
    {
        o.UseParameterPropertyValidate = false;
        o.UseParameterPropertyValidate = false;
    }); 
}
```