> This document is machine translated and requires review.

# Getting Started

## Prerequisites

`WebApiClientCore` requires your project's `.NET` version to support `.NET Standard2.1` and have a dependency injection environment.

## Install from Nuget

| Package Name | Description |
|--------------|-------------|
| [WebApiClientCore](https://www.nuget.org/packages/WebApiClientCore) | Base package |
| [WebApiClientCore.Extensions.OAuths](https://www.nuget.org/packages/WebApiClientCore.Extensions.OAuths) | OAuth2 and token management extension package |
| [WebApiClientCore.Extensions.NewtonsoftJson](https://www.nuget.org/packages/WebApiClientCore.Extensions.NewtonsoftJson) | Newtonsoft Json.NET extension package |
| [WebApiClientCore.Extensions.JsonRpc](https://www.nuget.org/packages/WebApiClientCore.Extensions.JsonRpc) | JsonRpc invocation extension package |
| [WebApiClientCore.OpenApi.SourceGenerator](https://www.nuget.org/packages/WebApiClientCore.OpenApi.SourceGenerator) | dotnet tool that parses local or remote OpenApi documents to generate WebApiClientCore interface code |

## Declare Interface

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

## Register Services

### ASP.NET Core

```csharp
// Program.cs
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.HttpHost = new Uri("http://localhost:5000/");
});
```

### Console Application

```csharp
var services = new ServiceCollection();
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.HttpHost = new Uri("http://localhost:5000/");
});

var provider = services.BuildServiceProvider();
var userApi = provider.GetRequiredService<IUserApi>();
```

## Using the Interface

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
            // Handle exception
            Console.WriteLine($"Request failed: {ex.Message}");
            return null;
        }
    }
}
```

## Common Attributes Quick Reference

| Attribute | Purpose |
|-----------|---------|
| `[HttpGet]` | GET request |
| `[HttpPost]` | POST request |
| `[HttpPut]` | PUT request |
| `[HttpDelete]` | DELETE request |
| `[JsonContent]` | JSON request body |
| `[FormContent]` | Form request body |
| `[PathQuery]` | Path or query parameter |
| `[HttpHost]` | Interface base address |
| `[LoggingFilter]` | Request logging |

## Next Steps

- [Architecture Overview](architecture.md)
- [HTTP Attributes](../core/http-attributes.md)
- [Content Attributes](../core/content-attributes.md)
- [Exception Handling](../configuration/exception-handling.md)
