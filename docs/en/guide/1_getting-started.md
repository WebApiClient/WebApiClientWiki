# Getting Started

## Prerequisites

`WebApiClientCore` requires the project to support `.NET Standard 2.1` and have a dependency injection environment.

## Installation via NuGet

| Package Name                                                                                                            | NuGet                                                                                   | Description                                                               |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [WebApiClientCore](https://www.nuget.org/packages/WebApiClientCore)                                                     | ![NuGet logo](https://buildstats.info/nuget/WebApiClientCore)                           | Base package                                                              |
| [WebApiClientCore.Extensions.OAuths](https://www.nuget.org/packages/WebApiClientCore.Extensions.OAuths)                 | ![NuGet logo](https://buildstats.info/nuget/WebApiClientCore.Extensions.OAuths)         | OAuth2 and token management extensions package                             |
| [WebApiClientCore.Extensions.NewtonsoftJson](https://www.nuget.org/packages/WebApiClientCore.Extensions.NewtonsoftJson) | ![NuGet logo](https://buildstats.info/nuget/WebApiClientCore.Extensions.NewtonsoftJson) | Newtonsoft's Json.NET extensions package                                  |
| [WebApiClientCore.Extensions.JsonRpc](https://www.nuget.org/packages/WebApiClientCore.Extensions.JsonRpc)               | ![NuGet logo](https://buildstats.info/nuget/WebApiClientCore.Extensions.JsonRpc)        | JsonRpc calling extensions package                                        |
| [WebApiClientCore.OpenApi.SourceGenerator](https://www.nuget.org/packages/WebApiClientCore.OpenApi.SourceGenerator)     | ![NuGet logo](https://buildstats.info/nuget/WebApiClientCore.OpenApi.SourceGenerator)   | dotnet tool to parse and generate WebApiClientCore interface code from local or remote OpenApi documents |

## Declare Interfaces

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

## Register and Configure Interfaces

AspNetCore Startup

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
    {
        o.UseLogging = Environment.IsDevelopment();
        o.HttpHost = new Uri("http://localhost:5000/");

        // o.JsonSerializeOptions -> json serialization options
        // o.JsonDeserializeOptions -> json deserialization options
        // o.KeyValueSerializeOptions -> key-value serialization options
        // o.XmlSerializeOptions -> xml serialization options
        // o.XmlDeserializeOptions -> xml deserialization options
        // o.GlobalFilters -> global filter collection
    });
}
```

Console

```csharp
public static void Main(string[] args)
{
    // Create manually in an environment without dependency injection
    var services = new ServiceCollection();
    services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
    {       
        o.UseLogging = Environment.IsDevelopment();
        o.HttpHost = new Uri("http://localhost:5000/");
    });
}
```

Prism.Unity

```xml
<PackageReference Include="Unity.Microsoft.DependencyInjection" Version="5.11.5" />
```

```csharp
public partial class App
{      
    protected override IContainerExtension CreateContainerExtension()
    {
        var services = new ServiceCollection();
        services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
        {       
            o.UseLogging = Environment.IsDevelopment();
            o.HttpHost = new Uri("http://localhost:5000/");
        });

        var container = new Unity.UnityContainer();
        Unity.Microsoft.DependencyInjection.ServiceProviderExtensions.BuildServiceProvider(services, container);
        return new Prism.Unity.UnityContainerExtension(container);
    } 
    
    protected override void RegisterTypes(IContainerRegistry containerRegistry)
    {
    }    
}
```

## Global Configuration

Global configuration can be used as the default initial configuration for all interfaces, which is useful when there are many interfaces in the project.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddWebApiClient().ConfigureHttpApi(o =>
    {
        o.JsonSerializeOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        o.JsonDeserializeOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        o.KeyValueSerializeOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });
}
```

## Inject and Invoke Interfaces

Inject in Scoped or Transient services

```csharp
public class YourService
{
    private readonly IUserApi userApi;
    public YourService(IUserApi userApi)
    {
        this.userApi = userApi;
    }

    public async Task GetAsync()
    {
        // Invoke the interface
        var user = await this.userApi.GetAsync(id:"id001");
        ...
    }
}
```

Inject in Singleton services

```csharp
public class YourService
{
    private readonly IServiceScopeFactory serviceScopeFactory;
    public YourService(IServiceScopeFactory serviceScopeFactory)
    {
        this.serviceScopeFactory = serviceScopeFactory;
    }

    public async Task GetAsync()
    {
        // Get the interface instance from the created scope
        using var scope = this.serviceScopeFactory.CreateScope();
        var userApi = scope.ServiceProvider.GetRequiredService<IUserApi>();
        var user = await userApi.GetAsync(id:"id001");
        ...
    }
}
```
