# 架构概览

WebApiClientCore 是一个基于 .NET 的 HTTP 客户端声明式框架，通过接口和特性声明来定义 HTTP 请求，无需手动构建 HttpRequestMessage。

## 核心设计理念

### 声明式编程

传统的 HTTP 客户端代码：

```csharp
// 传统方式
public async Task<User> GetUserAsync(string id)
{
    var client = _httpClientFactory.CreateClient();
    var response = await client.GetAsync($"http://api.example.com/users/{id}");
    response.EnsureSuccessStatusCode();
    var json = await response.Content.ReadAsStringAsync();
    return JsonSerializer.Deserialize<User>(json);
}
```

使用 WebApiClientCore：

```csharp
// 声明式
public interface IUserApi
{
    [HttpGet("users/{id}")]
    Task<User> GetAsync(string id);
}
```

### 核心概念

```
┌─────────────────────────────────────────────────────────────┐
│                        Your Interface                        │
│  public interface IUserApi { [HttpGet...] Task<User> Get() }│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    HttpApiProxy (运行时生成)                  │
│         解析特性 → 构建 HttpRequestMessage → 执行请求         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    HttpClient (底层传输)                      │
│              HttpClientFactory → HttpMessageHandler          │
└─────────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. 特性系统 (Attributes)

| 特性类别 | 说明 | 示例 |
|---------|------|------|
| HTTP 方法 | 定义请求方法和路径 | `[HttpGet]`, `[HttpPost]` |
| 内容特性 | 定义请求体格式 | `[JsonContent]`, `[FormContent]` |
| 返回特性 | 定义响应解析方式 | `[JsonReturn]`, `[XmlReturn]` |
| 过滤器 | 请求/响应拦截处理 | `[LoggingFilter]`, `[Timeout]` |
| 主机特性 | 定义基础 URL | `[HttpHost]` |

### 2. IApiParameter

自解释参数类型，允许参数自己决定如何序列化和传输：

```csharp
public class FaceModel : IApiParameter
{
    public Bitmap Image { get; set; }
    
    public Task OnRequestAsync(ApiParameterContext context)
    {
        // 自定义序列化逻辑
    }
}
```

### 3. IApiFilter

过滤器，用于请求前后的拦截处理：

```csharp
public class SignFilter : IApiFilter
{
    public Task OnRequestAsync(ApiRequestContext context)
    {
        // 请求前：添加签名
    }
    
    public Task OnResponseAsync(ApiResponseContext context)
    {
        // 响应后：记录日志
    }
}
```

### 4. ITask\<T\>

支持条件重试的异步任务：

```csharp
public interface IUserApi
{
    [HttpGet("users/{id}")]
    ITask<User> GetAsync(string id);
}

var user = await userApi.GetAsync(id)
    .Retry(3)
    .WhenCatch<HttpRequestException>();
```

## 请求处理流程

```
1. 接口调用
   │
   ▼
2. 解析接口元数据（方法、参数、特性）
   │
   ▼
3. 构建 HttpRequestMessage
   │  - 解析 URL 路径参数
   │  - 添加 Query 参数
   │  - 设置请求体内容
   │  - 添加请求头
   │
   ▼
4. 执行 GlobalFilters.OnRequestAsync
   │
   ▼
5. 执行 Attribute Filters.OnRequestAsync
   │
   ▼
6. 发送 HTTP 请求
   │
   ▼
7. 执行 Attribute Filters.OnResponseAsync
   │
   ▼
8. 执行 GlobalFilters.OnResponseAsync
   │
   ▼
9. 解析响应内容 → 返回结果
```

## 依赖注入

WebApiClientCore 与 ASP.NET Core 的依赖注入系统深度集成：

```csharp
// 注册接口
services.AddHttpApi<IUserApi>()
    .ConfigureHttpApi(o =>
    {
        o.HttpHost = new Uri("http://api.example.com/");
    })
    .ConfigureHttpClient(c =>
    {
        c.Timeout = TimeSpan.FromSeconds(30);
    });

// 使用
public class UserService
{
    private readonly IUserApi _userApi;
    
    public UserService(IUserApi userApi)
    {
        _userApi = userApi;
    }
}
```

## 扩展包

| 包名 | 功能 |
|------|------|
| WebApiClientCore | 核心包 |
| WebApiClientCore.Extensions.OAuths | OAuth2 与 Token 管理 |
| WebApiClientCore.Extensions.NewtonsoftJson | Newtonsoft.Json 支持 |
| WebApiClientCore.Extensions.JsonRpc | JSON-RPC 协议支持 |
| WebApiClientCore.OpenApi.SourceGenerator | OpenApi 代码生成工具 |

## 与其他方案对比

| 特性 | WebApiClientCore | Refit | HttpClient |
|------|------------------|-------|------------|
| 声明式接口 | ✅ | ✅ | ❌ |
| 编译时检查 | ✅ | ✅ | ❌ |
| 条件重试 | ✅ ITask | ❌ | ❌ |
| 自定义参数序列化 | ✅ IApiParameter | ❌ | ✅ |
| OAuth 扩展 | ✅ | 需自行实现 | 需自行实现 |
| AOT 支持 | ✅ | ❌ | ✅ |

## 下一步

- [快速上手](../overview/getting-started.md)
- [HTTP 特性](../core/http-attributes.md)
- [内容特性](../core/content-attributes.md)
- [异常处理](../configuration/exception-handling.md)
