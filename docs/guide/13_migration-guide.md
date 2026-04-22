# 从 WebApiClient 迁移到 WebApiClientCore

本文档帮助你从旧版 WebApiClient 迁移到新版 WebApiClientCore。

## 版本概览

| 项目 | 旧版 WebApiClient | 新版 WebApiClientCore |
|------|------------------|----------------------|
| 目标框架 | .NET Framework / .NET Standard 2.0 | .NET Standard 2.1+ / .NET Core 3.1+ |
| 依赖注入 | 可选 | 必须依赖 |
| 序列化 | Newtonsoft.Json | System.Text.Json |
| AOT 支持 | JIT / AOT 两种包 | 通过源生成支持 AOT |

## 包名变更

| 旧版包名 | 新版包名 | 说明 |
|---------|---------|------|
| WebApiClient.JIT | WebApiClientCore | 基础包 |
| WebApiClient.AOT | WebApiClientCore | 统一为基础包，通过源生成支持 AOT |
| - | WebApiClientCore.Extensions.OAuths | OAuth 与 Token 管理扩展 |
| - | WebApiClientCore.Extensions.NewtonsoftJson | Newtonsoft.Json 扩展 |
| - | WebApiClientCore.Extensions.JsonRpc | JsonRpc 调用扩展 |
| - | WebApiClientCore.OpenApi.SourceGenerator | OpenApi 代码生成工具 |

## 命名空间变更

| 功能 | 旧版命名空间 | 新版命名空间 |
|------|-------------|-------------|
| 核心接口 | WebApiClient | WebApiClientCore |
| 特性 | WebApiClient.Attributes | WebApiClientCore |
| 数据注解 | WebApiClient.DataAnnotations | 使用 System.Text.Json 序列化特性 |
| 参数特性 | WebApiClient.Parameterables | WebApiClientCore |

## 核心特性变更对比

### 返回类型

| 特性 | 旧版 | 新版 |
|------|------|------|
| 异步返回类型 | `ITask<T>` | `Task<T>` |
| 支持重试 | `ITask<T>` 内置 Retry | `ITask<T>` 保留重试功能 |
| 取消令牌 | 显式声明 | 显式声明，推荐默认值 |

### 接口声明

| 特性 | 旧版 | 新版 |
|------|------|------|
| 基接口 | `IHttpApi` | 无需继承 |
| 日志过滤 | `[TraceFilter]` | `[LoggingFilter]` |
| 多部分文件 | `MulitpartFile` | `FormDataFile` |
| 多部分内容 | `[MulitpartContent]` | `[FormDataContent]` |
| 多部分文本 | `[MulitpartText]` | `[FormDataText]` |

### 参数特性

| 旧版特性 | 新版特性 | 说明 |
|---------|---------|------|
| `[Parameter(Kind.Query)]` | `[PathQuery]` | 更直观的命名 |
| `[Parameter(Kind.Form)]` | `[FormContent]` / `[FormField]` | 拆分为两个特性 |
| `[Parameter(Kind.FormData)]` | `[FormDataContent]` / `[FormDataText]` | 拆分为两个特性 |
| `[Parameter(Kind.JsonBody)]` | `[JsonContent]` | 更直观的命名 |
| `[Parameter(Kind.XmlBody)]` | `[XmlContent]` | 更直观的命名 |
| `[Url]` | `[Uri]` | 命名更规范 |

## 配置方式变更

### 旧版：静态配置

```csharp
// 旧版：使用静态方法注册和配置
HttpApi.Register<IUserApi>().ConfigureHttpApiConfig(c =>
{
    c.HttpHost = new Uri("http://www.webapiclient.com/");
    c.FormatOptions.DateTimeFormat = DateTimeFormats.ISO8601_WithMillisecond;
});

// 旧版：使用静态方法获取实例
var api = HttpApi.Resolve<IUserApi>();
```

### 新版：依赖注入配置

```csharp
// 新版：在 Startup 或 ServiceCollection 中配置
public void ConfigureServices(IServiceCollection services)
{
    services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
    {
        o.HttpHost = new Uri("http://www.webapiclient.com/");
        o.UseLogging = Environment.IsDevelopment();
        
        // json 序列化选项
        o.JsonSerializeOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        o.JsonDeserializeOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });
}

// 新版：通过构造函数注入
public class YourService
{
    private readonly IUserApi userApi;
    
    public YourService(IUserApi userApi)
    {
        this.userApi = userApi;
    }
}
```

## 接口声明迁移示例

### 基本接口

**旧版代码：**

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

**新版代码：**

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

### 完整示例

**旧版代码：**

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

**新版代码：**

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

### 数据模型迁移

**旧版代码：**

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

**新版代码：**

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

## 过滤器迁移

### 旧版过滤器

```csharp
// 旧版
using WebApiClient.Filters;

[TraceFilter(OutputTarget = OutputTarget.Console)]
public interface IUserApi : IHttpApi
{
    // ...
}

// 旧版自定义过滤器
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

### 新版过滤器

```csharp
// 新版
using WebApiClientCore;

[LoggingFilter]
public interface IUserApi
{
    // ...
}

// 新版自定义过滤器
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

## OAuth/Token 迁移

### 旧版方式

旧版需要自行实现 token 管理逻辑，通过过滤器或拦截器处理。

### 新版方式

新版提供完整的 OAuth 扩展包：

```csharp
// 注册 TokenProvider
services.AddClientCredentialsTokenProvider<IUserApi>(o =>
{
    o.Endpoint = new Uri("http://localhost:6000/api/tokens");
    o.Credentials.Client_id = "clientId";
    o.Credentials.Client_secret = "xxyyzz";
});

// 使用 OAuthToken 特性
[OAuthToken]
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

## 常见迁移问题和解决方案

### 1. 序列化行为差异

**问题：** System.Text.Json 默认行为与 Newtonsoft.Json 不同

**解决方案：**

```csharp
// 使用 Newtonsoft.Json 扩展包
// 安装 WebApiClientCore.Extensions.NewtonsoftJson

services.AddHttpApi<IUserApi>()
    .ConfigureHttpApi(o =>
    {
        o.UseNewtonsoftJson();
    });
```

### 2. 日期格式处理

**问题：** 日期序列化格式不同

**解决方案：**

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.JsonSerializeOptions.Converters.Add(new JsonStringDateTimeConverter());
    o.JsonDeserializeOptions.Converters.Add(new JsonStringDateTimeConverter());
});
```

### 3. 无法获取接口实例

**问题：** 旧版使用 `HttpApi.Resolve<T>()` 获取实例

**解决方案：**

```csharp
// 新版通过依赖注入获取
public class YourService
{
    private readonly IUserApi userApi;
    
    public YourService(IUserApi userApi)
    {
        this.userApi = userApi;
    }
}

// 或在控制台应用中
var services = new ServiceCollection();
services.AddHttpApi<IUserApi>();
var provider = services.BuildServiceProvider();
var userApi = provider.GetRequiredService<IUserApi>();
```

### 4. 控制台应用迁移

**旧版：**

```csharp
var api = HttpApi.Create<IMyWebApi>();
var result = await api.GetUserAsync("id001");
```

**新版：**

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

### 5. ITask 与 Task 的转换

**问题：** 旧版返回 `ITask<T>`，新版返回 `Task<T>`

**解决方案：**

如果需要重试功能，新版仍可使用 `ITask<T>`：

```csharp
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    ITask<User> GetAsync(string id);
}

// 使用重试
var result = await userApi.GetAsync("id001")
    .Retry(maxCount: 3)
    .WhenCatch<HttpRequestException>();
```

## 不再支持的特性

| 特性 | 说明 | 替代方案 |
|------|------|---------|
| `HttpApi.Create<T>()` | 静态工厂方法 | 使用依赖注入 |
| `HttpApi.Register<T>()` | 静态注册 | 使用 `services.AddHttpApi<T>()` |
| `HttpApi.Resolve<T>()` | 静态解析 | 使用构造函数注入 |
| `IHttpApi` 接口 | 标记接口 | 不再需要 |
| `TraceFilterAttribute` | 调试过滤器 | 使用 `LoggingFilterAttribute` |
| `OutputTarget.Console` | 控制台输出 | 通过日志框架配置 |
| `MulitpartFile` | 文件类型 | 使用 `FormDataFile` |
| WebApiClient.JIT 包 | JIT 版本 | 统一使用 WebApiClientCore |
| WebApiClient.AOT 包 | AOT 版本 | 使用源生成支持 AOT |

## 新增特性

### 1. 全局配置

```csharp
services.AddWebApiClient().ConfigureHttpApi(o =>
{
    o.JsonSerializeOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    o.JsonDeserializeOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});
```

### 2. JSON 优先配置

```csharp
services
    .AddWebApiClient()
    .UseJsonFirstApiActionDescriptor();
```

### 3. HttpClient 配置

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpClient(httpClient =>
{
    httpClient.Timeout = TimeSpan.FromMinutes(1d);
    httpClient.DefaultRequestVersion = HttpVersion.Version20;
});
```

### 4. HttpMessageHandler 配置

```csharp
services.AddHttpApi<IUserApi>()
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
    {
        UseProxy = true,
        Proxy = new WebProxy("http://proxy.com")
    });
```

### 5. 缓存特性

```csharp
public interface IUserApi
{
    [Cache(60 * 1000)] // 缓存一分钟
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

### 6. AOT 支持

```csharp
// 定义源生成上下文
[JsonSerializable(typeof(User[]))]
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}

// 配置使用
services.AddWebApiClient()
    .ConfigureHttpApi(options =>
    {
        options.PrependJsonSerializerContext(AppJsonSerializerContext.Default);
    });
```

### 7. 自定义缓存提供者

```csharp
public class RedisResponseCacheProvider : IResponseCacheProvider
{
    public string Name => nameof(RedisResponseCacheProvider);

    public Task<ResponseCacheResult> GetAsync(string key)
    {
        // 从 Redis 获取缓存
    }

    public Task SetAsync(string key, ResponseCacheEntry entry, TimeSpan expiration)
    {
        // 写入 Redis 缓存
    }
}
```

## 迁移检查清单

- [ ] 更新 NuGet 包引用
  - [ ] 移除 `WebApiClient.JIT` 或 `WebApiClient.AOT`
  - [ ] 添加 `WebApiClientCore`
  - [ ] 按需添加扩展包

- [ ] 更新命名空间
  - [ ] `using WebApiClient` → `using WebApiClientCore`
  - [ ] 移除 `using WebApiClient.Attributes`
  - [ ] 移除 `using WebApiClient.Parameterables`
  - [ ] 移除 `using WebApiClient.DataAnnotations`

- [ ] 更新接口声明
  - [ ] 移除 `: IHttpApi` 继承
  - [ ] `ITask<T>` → `Task<T>`（或保留 `ITask<T>` 用于重试）
  - [ ] `[TraceFilter]` → `[LoggingFilter]`
  - [ ] `[MulitpartContent]` → `[FormDataContent]`
  - [ ] `[MulitpartText]` → `[FormDataText]`
  - [ ] `MulitpartFile` → `FormDataFile`

- [ ] 更新数据模型
  - [ ] 使用 `System.Text.Json` 特性替代 `DataAnnotations`
  - [ ] `[AliasAs]` → `[JsonPropertyName]`
  - [ ] `[IgnoreSerialized]` → `[JsonIgnore]`
  - [ ] `[IgnoreWhenNull]` → `[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]`

- [ ] 更新配置方式
  - [ ] 移除 `HttpApi.Register<T>()` 静态注册
  - [ ] 移除 `HttpApi.Resolve<T>()` 静态获取
  - [ ] 使用 `services.AddHttpApi<T>()` 注册
  - [ ] 使用依赖注入获取实例

- [ ] 更新过滤器
  - [ ] `ApiActionFilterAttribute` → `ApiFilterAttribute`
  - [ ] `OnBeginRequestAsync` → `OnRequestAsync`
  - [ ] 更新 `ApiActionContext` → `ApiRequestContext`

- [ ] 处理序列化差异
  - [ ] 测试日期格式序列化
  - [ ] 测试枚举序列化
  - [ ] 如需要，安装 `WebApiClientCore.Extensions.NewtonsoftJson`

- [ ] 测试验证
  - [ ] 单元测试通过
  - [ ] 集成测试通过
  - [ ] 性能测试通过
