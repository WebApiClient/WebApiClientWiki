# Migrating from WebApiClient to WebApiClientCore

This document helps you migrate from the legacy WebApiClient to the new WebApiClientCore.

## Version Overview

| Item | Legacy WebApiClient | New WebApiClientCore |
|------|---------------------|----------------------|
| Target Framework | .NET Framework / .NET Standard 2.0 | .NET Standard 2.1+ / .NET Core 3.1+ |
| Dependency Injection | Optional | Required |
| Serialization | Newtonsoft.Json | System.Text.Json |
| AOT Support | JIT / AOT packages | AOT via Source Generators |

## Package Name Changes

| Legacy Package | New Package | Description |
|---------------|-------------|-------------|
| WebApiClient.JIT | WebApiClientCore | Base package |
| WebApiClient.AOT | WebApiClientCore | Unified to base package with AOT via source generators |
| - | WebApiClientCore.Extensions.OAuths | OAuth & Token management extension |
| - | WebApiClientCore.Extensions.NewtonsoftJson | Newtonsoft.Json extension |
| - | WebApiClientCore.Extensions.JsonRpc | JsonRpc extension |
| - | WebApiClientCore.OpenApi.SourceGenerator | OpenApi code generation tool |

## Namespace Changes

| Feature | Legacy Namespace | New Namespace |
|---------|-----------------|---------------|
| Core Interface | WebApiClient | WebApiClientCore |
| Attributes | WebApiClient.Attributes | WebApiClientCore |
| Data Annotations | WebApiClient.DataAnnotations | Use System.Text.Json serialization attributes |
| Parameter Attributes | WebApiClient.Parameterables | WebApiClientCore |

## Core Feature Changes

### Return Types

| Feature | Legacy | New |
|---------|--------|-----|
| Async Return Type | `ITask<T>` | `Task<T>` |
| Retry Support | `ITask<T>` built-in Retry | `ITask<T>` retains retry functionality |
| Cancellation Token | Explicit declaration | Explicit declaration, default value recommended |

### Interface Declaration

| Feature | Legacy | New |
|---------|--------|-----|
| Base Interface | `IHttpApi` | Not required |
| Logging Filter | `[TraceFilter]` | `[LoggingFilter]` |
| Multipart File | `MulitpartFile` | `FormDataFile` |
| Multipart Content | `[MulitpartContent]` | `[FormDataContent]` |
| Multipart Text | `[MulitpartText]` | `[FormDataText]` |

### Parameter Attributes

| Legacy Attribute | New Attribute | Description |
|-----------------|---------------|-------------|
| `[Parameter(Kind.Query)]` | `[PathQuery]` | More intuitive naming |
| `[Parameter(Kind.Form)]` | `[FormContent]` / `[FormField]` | Split into two attributes |
| `[Parameter(Kind.FormData)]` | `[FormDataContent]` / `[FormDataText]` | Split into two attributes |
| `[Parameter(Kind.JsonBody)]` | `[JsonContent]` | More intuitive naming |
| `[Parameter(Kind.XmlBody)]` | `[XmlContent]` | More intuitive naming |
| `[Url]` | `[Uri]` | More standard naming |

## Configuration Changes

### Legacy: Static Configuration

```csharp
// Legacy: Register and configure using static methods
HttpApi.Register<IUserApi>().ConfigureHttpApiConfig(c =>
{
    c.HttpHost = new Uri("http://www.webapiclient.com/");
    c.FormatOptions.DateTimeFormat = DateTimeFormats.ISO8601_WithMillisecond;
});

// Legacy: Get instance using static method
var api = HttpApi.Resolve<IUserApi>();
```

### New: Dependency Injection Configuration

```csharp
// New: Configure in Startup or ServiceCollection
public void ConfigureServices(IServiceCollection services)
{
    services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
    {
        o.HttpHost = new Uri("http://www.webapiclient.com/");
        o.UseLogging = Environment.IsDevelopment();
        
        // json serialization options
        o.JsonSerializeOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        o.JsonDeserializeOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });
}

// New: Inject via constructor
public class YourService
{
    private readonly IUserApi userApi;
    
    public YourService(IUserApi userApi)
    {
        this.userApi = userApi;
    }
}
```

## Interface Declaration Migration Examples

### Basic Interface

**Legacy Code:**

```csharp
using WebApiClient;
using WebApiClient.Attributes;

public interface IUserApi : IHttpApi
{
    [HttpGet("api/user")]
    ITask<UserInfo> GetAsync(string account);

    [HttpPost("api/user")]
    ITask<bool> AddAsync([FormContent] UserInfo user);
}
```

**New Code:**

```csharp
using WebApiClientCore;

[LoggingFilter]
[HttpHost("http://localhost:5000/")]
public interface IUserApi
{
    [HttpGet("api/user")]
    Task<UserInfo> GetAsync(string account, CancellationToken token = default);

    [HttpPost("api/user")]
    Task<bool> AddAsync([FormContent] UserInfo user, CancellationToken token = default);
}
```

### Complete Example

**Legacy Code:**

```csharp
using WebApiClient;
using WebApiClient.Attributes;
using WebApiClient.Parameterables;

[TraceFilter]
[HttpHost("https://petstore.swagger.io/v2/")]
public interface IPetApi : IHttpApi
{
    [HttpPost("pet")]
    ITask<HttpResponseMessage> AddPetAsync([Required] [JsonContent] Pet body);

    [HttpGet("pet/findByStatus")]
    ITask<List<Pet>> FindPetsByStatusAsync([Required] IEnumerable<Anonymous> status);

    [HttpGet("pet/{petId}")]
    ITask<Pet> GetPetByIdAsync([Required] long petId);

    [HttpPost("pet/{petId}/uploadImage")]
    ITask<ApiResponse> UploadFileAsync([Required] long petId, [MulitpartContent] string additionalMetadata, MulitpartFile file);
}
```

**New Code:**

```csharp
using WebApiClientCore;
using System.Text.Json.Serialization;

[LoggingFilter]
[HttpHost("https://petstore.swagger.io/v2/")]
public interface IPetApi
{
    [HttpPost("pet")]
    Task<HttpResponseMessage> AddPetAsync([JsonContent] Pet body, CancellationToken token = default);

    [HttpGet("pet/findByStatus")]
    Task<List<Pet>> FindPetsByStatusAsync(IEnumerable<string> status, CancellationToken token = default);

    [HttpGet("pet/{petId}")]
    Task<Pet> GetPetByIdAsync(long petId, CancellationToken token = default);

    [HttpPost("pet/{petId}/uploadImage")]
    Task<ApiResponse> UploadFileAsync(long petId, [FormDataText] string additionalMetadata, FormDataFile file, CancellationToken token = default);
}
```

### Data Model Migration

**Legacy Code:**

```csharp
using WebApiClient.DataAnnotations;

public class UserInfo
{
    public string Account { get; set; }

    [AliasAs("a_password")]
    public string Password { get; set; }

    [DateTimeFormat("yyyy-MM-dd")]
    [IgnoreWhenNull]
    public DateTime? BirthDay { get; set; }

    [IgnoreSerialized]
    public string Email { get; set; }
}
```

**New Code:**

```csharp
using System.Text.Json.Serialization;

public class UserInfo
{
    [JsonPropertyName("account")]
    public string Account { get; set; } = string.Empty;

    [JsonPropertyName("a_password")]
    public string Password { get; set; } = string.Empty;

    [JsonPropertyName("birthDay")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public DateTime? BirthDay { get; set; }

    [JsonIgnore]
    public string Email { get; set; } = string.Empty;
}
```

## Filter Migration

### Legacy Filter

```csharp
// Legacy
using WebApiClient.Filters;

[TraceFilter(OutputTarget = OutputTarget.Console)]
public interface IUserApi : IHttpApi
{
    // ...
}

// Legacy custom filter
class SignFilter : ApiActionFilterAttribute
{
    public override Task OnBeginRequestAsync(ApiActionContext context)
    {
        var sign = DateTime.Now.Ticks.ToString();
        context.RequestMessage.AddUrlQuery("sign", sign);
        return base.OnBeginRequestAsync(context);
    }
}
```

### New Filter

```csharp
// New
using WebApiClientCore;

[LoggingFilter]
public interface IUserApi
{
    // ...
}

// New custom filter
class SignFilterAttribute : ApiFilterAttribute
{
    public override Task OnRequestAsync(ApiRequestContext context)
    {
        var signService = context.HttpContext.ServiceProvider.GetRequiredService<SignService>();
        var sign = signService.SignValue(DateTime.Now);
        context.HttpContext.RequestMessage.AddUrlQuery("sign", sign);
        return Task.CompletedTask;
    }
}
```

## OAuth/Token Migration

### Legacy Approach

Legacy version required implementing token management logic manually through filters or interceptors.

### New Approach

New version provides a complete OAuth extension package:

```csharp
// Register TokenProvider
services.AddClientCredentialsTokenProvider<IUserApi>(o =>
{
    o.Endpoint = new Uri("http://localhost:6000/api/tokens");
    o.Credentials.Client_id = "clientId";
    o.Credentials.Client_secret = "xxyyzz";
});

// Use OAuthToken attribute
[OAuthToken]
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

## Common Migration Issues and Solutions

### 1. Serialization Behavior Differences

**Issue:** System.Text.Json default behavior differs from Newtonsoft.Json

**Solution:**

```csharp
// Use Newtonsoft.Json extension package
// Install WebApiClientCore.Extensions.NewtonsoftJson

services.AddHttpApi<IUserApi>()
    .ConfigureHttpApi(o =>
    {
        o.UseNewtonsoftJson();
    });
```

### 2. Date Format Handling

**Issue:** Date serialization format differs

**Solution:**

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.JsonSerializeOptions.Converters.Add(new JsonStringDateTimeConverter());
    o.JsonDeserializeOptions.Converters.Add(new JsonStringDateTimeConverter());
});
```

### 3. Unable to Get Interface Instance

**Issue:** Legacy used `HttpApi.Resolve<T>()` to get instance

**Solution:**

```csharp
// New version gets via dependency injection
public class YourService
{
    private readonly IUserApi userApi;
    
    public YourService(IUserApi userApi)
    {
        this.userApi = userApi;
    }
}

// Or in console application
var services = new ServiceCollection();
services.AddHttpApi<IUserApi>();
var provider = services.BuildServiceProvider();
var userApi = provider.GetRequiredService<IUserApi>();
```

### 4. Console Application Migration

**Legacy:**

```csharp
var api = HttpApi.Create<IMyWebApi>();
var result = await api.GetUserAsync("id001");
```

**New:**

```csharp
var services = new ServiceCollection();
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.HttpHost = new Uri("http://localhost:5000/");
});

var provider = services.BuildServiceProvider();
var api = provider.GetRequiredService<IUserApi>();
var result = await api.GetAsync("id001");
```

### 5. ITask vs Task Conversion

**Issue:** Legacy returns `ITask<T>`, new returns `Task<T>`

**Solution:**

If retry functionality is needed, the new version still supports `ITask<T>`:

```csharp
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    ITask<User> GetAsync(string id);
}

// Use retry
var result = await userApi.GetAsync("id001")
    .Retry(maxCount: 3)
    .WhenCatch<HttpRequestException>();
```

## No Longer Supported Features

| Feature | Description | Alternative |
|---------|-------------|-------------|
| `HttpApi.Create<T>()` | Static factory method | Use dependency injection |
| `HttpApi.Register<T>()` | Static registration | Use `services.AddHttpApi<T>()` |
| `HttpApi.Resolve<T>()` | Static resolution | Use constructor injection |
| `IHttpApi` interface | Marker interface | No longer needed |
| `TraceFilterAttribute` | Debug filter | Use `LoggingFilterAttribute` |
| `OutputTarget.Console` | Console output | Configure via logging framework |
| `MulitpartFile` | File type | Use `FormDataFile` |
| WebApiClient.JIT package | JIT version | Use WebApiClientCore |
| WebApiClient.AOT package | AOT version | Use source generators for AOT |

## New Features

### 1. Global Configuration

```csharp
services.AddWebApiClient().ConfigureHttpApi(o =>
{
    o.JsonSerializeOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    o.JsonDeserializeOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});
```

### 2. JSON-First Configuration

```csharp
services
    .AddWebApiClient()
    .UseJsonFirstApiActionDescriptor();
```

### 3. HttpClient Configuration

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpClient(httpClient =>
{
    httpClient.Timeout = TimeSpan.FromMinutes(1d);
    httpClient.DefaultRequestVersion = HttpVersion.Version20;
});
```

### 4. HttpMessageHandler Configuration

```csharp
services.AddHttpApi<IUserApi>()
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
    {
        UseProxy = true,
        Proxy = new WebProxy("http://proxy.com")
    });
```

### 5. Cache Attribute

```csharp
public interface IUserApi
{
    [Cache(60 * 1000)] // Cache for one minute
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

### 6. AOT Support

```csharp
// Define source generator context
[JsonSerializable(typeof(User[]))]
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}

// Configure to use
services.AddWebApiClient()
    .ConfigureHttpApi(options =>
    {
        options.PrependJsonSerializerContext(AppJsonSerializerContext.Default);
    });
```

### 7. Custom Cache Provider

```csharp
public class RedisResponseCacheProvider : IResponseCacheProvider
{
    public string Name => nameof(RedisResponseCacheProvider);

    public Task<ResponseCacheResult> GetAsync(string key)
    {
        // Get cache from Redis
    }

    public Task SetAsync(string key, ResponseCacheEntry entry, TimeSpan expiration)
    {
        // Write cache to Redis
    }
}
```

## Migration Checklist

- [ ] Update NuGet package references
  - [ ] Remove `WebApiClient.JIT` or `WebApiClient.AOT`
  - [ ] Add `WebApiClientCore`
  - [ ] Add extension packages as needed

- [ ] Update namespaces
  - [ ] `using WebApiClient` → `using WebApiClientCore`
  - [ ] Remove `using WebApiClient.Attributes`
  - [ ] Remove `using WebApiClient.Parameterables`
  - [ ] Remove `using WebApiClient.DataAnnotations`

- [ ] Update interface declarations
  - [ ] Remove `: IHttpApi` inheritance
  - [ ] `ITask<T>` → `Task<T>` (or keep `ITask<T>` for retry)
  - [ ] `[TraceFilter]` → `[LoggingFilter]`
  - [ ] `[MulitpartContent]` → `[FormDataContent]`
  - [ ] `[MulitpartText]` → `[FormDataText]`
  - [ ] `MulitpartFile` → `FormDataFile`

- [ ] Update data models
  - [ ] Use `System.Text.Json` attributes instead of `DataAnnotations`
  - [ ] `[AliasAs]` → `[JsonPropertyName]`
  - [ ] `[IgnoreSerialized]` → `[JsonIgnore]`
  - [ ] `[IgnoreWhenNull]` → `[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]`

- [ ] Update configuration approach
  - [ ] Remove `HttpApi.Register<T>()` static registration
  - [ ] Remove `HttpApi.Resolve<T>()` static resolution
  - [ ] Use `services.AddHttpApi<T>()` for registration
  - [ ] Use dependency injection to get instances

- [ ] Update filters
  - [ ] `ApiActionFilterAttribute` → `ApiFilterAttribute`
  - [ ] `OnBeginRequestAsync` → `OnRequestAsync`
  - [ ] Update `ApiActionContext` → `ApiRequestContext`

- [ ] Handle serialization differences
  - [ ] Test date format serialization
  - [ ] Test enum serialization
  - [ ] Install `WebApiClientCore.Extensions.NewtonsoftJson` if needed

- [ ] Testing and validation
  - [ ] Unit tests pass
  - [ ] Integration tests pass
  - [ ] Performance tests pass
