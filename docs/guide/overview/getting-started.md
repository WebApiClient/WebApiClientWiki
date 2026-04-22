# 快速上手

## 依赖环境

`WebApiClientCore` 要求项目的 `.NET` 版本支持 `.NET Standard2.1`，并且具备依赖注入的环境。

## 从 Nuget 安装

| 包名 | 描述 |
|------|------|
| [WebApiClientCore](https://www.nuget.org/packages/WebApiClientCore) | 基础包 |
| [WebApiClientCore.Extensions.OAuths](https://www.nuget.org/packages/WebApiClientCore.Extensions.OAuths) | OAuth2 与 token 管理扩展包 |
| [WebApiClientCore.Extensions.NewtonsoftJson](https://www.nuget.org/packages/WebApiClientCore.Extensions.NewtonsoftJson) | Newtonsoft 的 Json.NET 扩展包 |
| [WebApiClientCore.Extensions.JsonRpc](https://www.nuget.org/packages/WebApiClientCore.Extensions.JsonRpc) | JsonRpc 调用扩展包 |
| [WebApiClientCore.OpenApi.SourceGenerator](https://www.nuget.org/packages/WebApiClientCore.OpenApi.SourceGenerator) | 将本地或远程 OpenApi 文档解析生成 WebApiClientCore 接口代码的 dotnet tool |

## 声明接口

```csharp
[LoggingFilter]
[HttpHost("http://localhost:5000/")]
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id, CancellationToken token = default);

    // POST application/json content
    [HttpPost("api/users")]
    Task<User> PostJsonAsync([JsonContent] User user, CancellationToken token = default);

    // POST application/xml content
    [HttpPost("api/users")]
    Task<User> PostXmlAsync([XmlContent] User user, CancellationToken token = default);

    // POST x-www-form-urlencoded content
    [HttpPost("api/users")]
    Task<User> PostFormAsync([FormContent] User user, CancellationToken token = default);

    // POST multipart/form-data content
    [HttpPost("api/users")]
    Task<User> PostFormDataAsync([FormDataContent] User user, FormDataFile avatar, CancellationToken token = default);
}

public class User
{ 
    [JsonPropertyName("account")]
    public string Account { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}
```

## 注册服务

### ASP.NET Core

```csharp
// Program.cs
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.HttpHost = new Uri("http://localhost:5000/");
});
```

### 控制台应用

```csharp
var services = new ServiceCollection();
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.HttpHost = new Uri("http://localhost:5000/");
});

var provider = services.BuildServiceProvider();
var userApi = provider.GetRequiredService<IUserApi>();
```

## 使用接口

```csharp
public class UserService
{
    private readonly IUserApi _userApi;

    public UserService(IUserApi userApi)
    {
        _userApi = userApi;
    }

    public async Task<User?> GetUserAsync(string id)
    {
        try
        {
            return await _userApi.GetAsync(id);
        }
        catch (HttpRequestException ex)
        {
            // 处理异常
            Console.WriteLine($"请求失败: {ex.Message}");
            return null;
        }
    }
}
```

## 常用特性速查

| 特性 | 用途 |
|------|------|
| `[HttpGet]` | GET 请求 |
| `[HttpPost]` | POST 请求 |
| `[HttpPut]` | PUT 请求 |
| `[HttpDelete]` | DELETE 请求 |
| `[JsonContent]` | JSON 请求体 |
| `[FormContent]` | 表单请求体 |
| `[PathQuery]` | 路径或查询参数 |
| `[HttpHost]` | 接口基础地址 |
| `[LoggingFilter]` | 请求日志 |

## 下一步

- [架构概览](architecture.md)
- [HTTP 特性](../core/http-attributes.md)
- [内容特性](../core/content-attributes.md)
- [异常处理](../configuration/exception-handling.md)
