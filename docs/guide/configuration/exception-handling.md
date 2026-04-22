# 异常处理完整指南

WebApiClientCore 提供了完整的异常体系，帮助开发者精确捕获和处理各种错误场景。本文档详细介绍所有异常类型、触发条件及最佳实践。

## 异常体系结构

```
Exception
├── ApiException (抽象基类)
│   ├── ApiInvalidConfigException      // 配置异常
│   ├── ApiResponseStatusException     // 响应状态码异常
│   ├── ApiResultNotMatchException     // 结果不匹配异常
│   ├── ApiRetryException              // 重试耗尽异常
│   └── ApiReturnNotSupportedException // 不支持的响应类型异常
│       └── ApiReturnNotSupportedExteption (内部使用)
│
├── ProxyTypeException                 // 代理类型异常
│   └── ProxyTypeCreateException       // 代理创建异常
│
├── TypeInstanceCreateException        // 类型实例创建异常
│
└── HttpContentBufferedException       // HttpContent已缓存异常
```

## 异常封装机制

所有请求异常都会被封装为 `HttpRequestException`，内部异常（`InnerException`）为实际的具体异常。这种设计可以完整保留异常堆栈信息。

```csharp
try
{
    var data = await api.GetAsync();
}
catch (HttpRequestException ex)
{
    // ex.InnerException 为实际异常
    Console.WriteLine($"实际异常类型: {ex.InnerException?.GetType().Name}");
}
```

## 异常类型详解

### 1. ApiException（抽象基类）

所有 API 相关异常的基类，继承自 `Exception`。

**用途**：作为所有 API 异常的统一捕获入口。

```csharp
catch (HttpRequestException ex) when (ex.InnerException is ApiException apiException)
{
    // 捕获所有 WebApiClientCore 内部异常
    logger.LogError(apiException, "API 调用失败");
}
```

---

### 2. ApiInvalidConfigException

**说明**：请求配置无效时抛出。

**触发条件**：
- 缺少必需的请求 URI
- 缺少 HTTP Host 配置
- 超时参数值无效或超出范围
- URI 参数无法转换为有效的 URI
- Content-Type 配置无效
- Patch 方法使用不当

**典型场景**：

```csharp
// 场景1：未配置 HttpHost
public interface IMyApi
{
    [HttpGet("api/users")]  // 缺少 Host 前缀
    Task<User> GetUserAsync();
}

// 场景2：超时值无效
public interface IMyApi
{
    [HttpGet("api/users")]
    [Timeout(-1)]  // 无效的超时值
    Task<User> GetUserAsync();
}
```

**处理示例**：

```csharp
try
{
    var user = await api.GetUserAsync();
}
catch (HttpRequestException ex) when (ex.InnerException is ApiInvalidConfigException configEx)
{
    Console.WriteLine($"配置错误: {configEx.Message}");
    // 配置错误通常需要在开发阶段修复，不应在运行时捕获后忽略
    throw;
}
```

---

### 3. ApiResponseStatusException

**说明**：HTTP 响应状态码表示失败时抛出。

**触发条件**：
- 响应状态码不在 2xx 范围内
- 使用了 `[JsonReturn]` 或 `[XmlReturn]` 等特性且 `EnsureSuccessStatusCode = true`

**属性**：
| 属性 | 类型 | 说明 |
|------|------|------|
| `ResponseMessage` | `HttpResponseMessage` | 完整的响应消息 |
| `StatusCode` | `HttpStatusCode` | HTTP 状态码 |
| `Message` | `string` | 格式化的错误消息 |

**典型场景**：

```csharp
// 接口声明
public interface IMyApi
{
    [HttpGet("api/users/{id}")]
    [JsonReturn(EnsureSuccessStatusCode = true)]  // 自动检查状态码
    Task<User> GetUserAsync(int id);
}

// 触发场景：服务端返回 404、500 等错误状态码
```

**处理示例**：

```csharp
try
{
    var user = await api.GetUserAsync(1);
}
catch (HttpRequestException ex) when (ex.InnerException is ApiResponseStatusException statusEx)
{
    var statusCode = (int)statusEx.StatusCode;
    var reasonPhrase = statusEx.ResponseMessage.ReasonPhrase;
    
    Console.WriteLine($"HTTP 错误: {statusCode} {reasonPhrase}");
    
    // 可以读取响应内容获取详细错误信息
    var errorContent = await statusEx.ResponseMessage.Content.ReadAsStringAsync();
    Console.WriteLine($"错误详情: {errorContent}");
    
    // 根据状态码分类处理
    switch (statusCode)
    {
        case 401:
            // 未授权，可能需要重新登录
            break;
        case 403:
            // 禁止访问
            break;
        case 404:
            // 资源不存在
            break;
        case >= 500:
            // 服务器错误
            break;
    }
}
```

---

### 4. ApiResultNotMatchException

**说明**：重试机制中结果验证失败时使用（主要用于内部重试逻辑）。

**触发条件**：
- 使用 `ITask<>` 返回类型配合 `WhenResult()` 进行条件重试
- 结果满足重试条件，但重试次数耗尽

**属性**：
| 属性 | 类型 | 说明 |
|------|------|------|
| `Result` | `object?` | 导致重试的结果值 |

**典型场景**：

```csharp
public interface IMyApi
{
    [HttpGet("api/data")]
    ITask<DataResponse> GetDataAsync();
}

// 当返回结果需要验证并重试
var result = await api.GetDataAsync()
    .Retry(3)
    .WhenResult(r => r.Success == false)  // 成功为 false 时重试
    .WhenCatch<HttpRequestException>();
```

**处理示例**：

```csharp
try
{
    var result = await api.GetDataAsync()
        .Retry(3)
        .WhenResult(r => r.Success == false);
}
catch (HttpRequestException ex) when (ex.InnerException is ApiResultNotMatchException resultEx)
{
    Console.WriteLine($"结果验证失败，重试耗尽");
    Console.WriteLine($"最后的结果: {resultEx.Result}");
}
```

---

### 5. ApiRetryException

**说明**：重试次数耗尽后抛出。

**触发条件**：
- 使用 `ITask<>` 返回类型
- 配置了重试机制
- 所有重试尝试都失败

**属性**：
| 属性 | 类型 | 说明 |
|------|------|------|
| `MaxRetryCount` | `int` | 配置的最大重试次数 |
| `InnerException` | `Exception?` | 最后一次失败的异常 |

**典型场景**：

```csharp
public interface IMyApi
{
    [HttpGet("api/data")]
    ITask<Data> GetDataAsync();
}

// 配置重试
try
{
    var result = await api.GetDataAsync()
        .Retry(3, TimeSpan.FromSeconds(1))
        .WhenCatch<HttpRequestException>();
}
catch (HttpRequestException ex) when (ex.InnerException is ApiRetryException retryEx)
{
    Console.WriteLine($"重试 {retryEx.MaxRetryCount} 次后仍失败");
    Console.WriteLine($"最后一次异常: {retryEx.InnerException?.Message}");
}
```

**完整重试处理示例**：

```csharp
public async Task<Data> GetDataWithRetryAsync(IMyApi api, CancellationToken cancellationToken = default)
{
    try
    {
        return await api.GetDataAsync()
            .Retry(3, retryIndex => TimeSpan.FromSeconds(Math.Pow(2, retryIndex)))  // 指数退避
            .WhenCatch<HttpRequestException>(ex =>
            {
                logger.LogWarning(ex, "请求失败，准备重试");
            })
            .WhenCatch<SocketException>(ex =>
            {
                logger.LogWarning(ex, "网络连接失败，准备重试");
            });
    }
    catch (HttpRequestException ex) when (ex.InnerException is ApiRetryException retryEx)
    {
        logger.LogError(retryEx.InnerException, "重试耗尽，请求最终失败");
        throw;
    }
}
```

---

### 6. ApiReturnNotSupportedException

**说明**：无法处理响应内容的 Content-Type 时抛出。

**触发条件**：
- 响应的 Content-Type 没有对应的处理器
- 例如：服务端返回 XML，但接口只配置了 JSON 处理器

**典型场景**：

```csharp
// 接口声明期望 JSON，但服务端返回了 XML
public interface IMyApi
{
    [HttpGet("api/data")]
    [JsonReturn]  // 只支持 JSON
    Task<Data> GetDataAsync();
}

// 服务端返回 Content-Type: application/xml
// 将触发 ApiReturnNotSupportedException
```

**处理示例**：

```csharp
try
{
    var data = await api.GetDataAsync();
}
catch (HttpRequestException ex) when (ex.InnerException is ApiReturnNotSupportedException notSupportedEx)
{
    var context = notSupportedEx.Context;
    var contentType = context.HttpContext.ResponseMessage?.Content.Headers.ContentType;
    
    Console.WriteLine($"不支持的 Content-Type: {contentType}");
    Console.WriteLine($"期望的返回类型: {context.ActionDescriptor.Return.DataType.Type}");
    
    // 解决方案：添加对应的内容处理器或修改接口声明
}
```

---

### 7. ProxyTypeException / ProxyTypeCreateException

**说明**：代理类型创建或使用时发生错误。

**触发条件**：
- 接口定义不符合规范（如接口包含泛型方法）
- 动态代理生成失败
- 接口类型无效

**属性**：
| 属性 | 类型 | 说明 |
|------|------|------|
| `InterfaceType` | `Type` | 发生问题的接口类型 |

**典型场景**：

```csharp
// 场景：接口定义不规范
public interface IInvalidApi
{
    // 泛型方法可能导致代理创建失败
    Task<T> GetDataAsync<T>();
}
```

**处理示例**：

```csharp
try
{
    var api = httpApiFactory.CreateHttpApi<IMyApi>();
}
catch (ProxyTypeCreateException proxyEx)
{
    Console.WriteLine($"代理创建失败，接口类型: {proxyEx.InterfaceType}");
    Console.WriteLine($"错误信息: {proxyEx.Message}");
    // 检查接口定义是否符合规范
}
```

---

### 8. TypeInstanceCreateException

**说明**：通过反射创建类型实例失败时抛出。

**触发条件**：
- 特性或过滤器实例化失败
- 类型没有无参构造函数
- 构造函数抛出异常

**属性**：
| 属性 | 类型 | 说明 |
|------|------|------|
| `InstanceType` | `Type` | 创建失败的类型 |

**典型场景**：

```csharp
// 自定义特性缺少无参构造函数
public class MyCustomAttribute : ApiActionAttribute
{
    public MyCustomAttribute(string requiredParam)  // 缺少无参构造
    {
    }
}
```

---

### 9. HttpContentBufferedException

**说明**：尝试对已缓存的 HttpContent 进行非缓存操作时抛出。

**触发条件**：
- HttpContent 已被读取并缓存
- 尝试对其进行流式操作

**典型场景**：

```csharp
// 在自定义过滤器或返回处理器中
public class MyReturnAttribute : ApiReturnAttribute
{
    public override async Task SetResultAsync(ApiResponseContext context)
    {
        var content = context.HttpContext.ResponseMessage.Content;
        
        // 如果 content 已被缓存，将抛出异常
        content.EnsureNotBuffered();
        
        // 流式读取...
    }
}
```

---

## 最佳实践

### 1. 分层异常处理

```csharp
public class ApiService
{
    private readonly IMyApi _api;
    private readonly ILogger<ApiService> _logger;

    public async Task<User?> GetUserAsync(int id)
    {
        try
        {
            return await _api.GetUserAsync(id);
        }
        catch (HttpRequestException ex)
        {
            return ex.InnerException switch
            {
                ApiInvalidConfigException configEx => HandleConfigError(configEx),
                ApiResponseStatusException statusEx => HandleStatusError(statusEx),
                ApiRetryException retryEx => HandleRetryError(retryEx),
                ApiException apiEx => HandleApiError(apiEx),
                SocketException socketEx => HandleSocketError(socketEx),
                _ => HandleUnknownError(ex)
            };
        }
    }

    private User? HandleConfigError(ApiInvalidConfigException ex)
    {
        _logger.LogCritical(ex, "配置错误，请检查接口定义");
        throw ex;  // 配置错误应该直接抛出，由开发人员修复
    }

    private User? HandleStatusError(ApiResponseStatusException ex)
    {
        if ((int)ex.StatusCode == 404)
        {
            _logger.LogInformation("用户不存在: {StatusCode}", ex.StatusCode);
            return null;
        }
        
        _logger.LogError("API 返回错误状态码: {StatusCode}", ex.StatusCode);
        throw new BusinessException($"服务暂时不可用: {ex.StatusCode}");
    }

    private User? HandleRetryError(ApiRetryException ex)
    {
        _logger.LogWarning(ex.InnerException, "重试耗尽");
        throw new TransientException("服务暂时不可用，请稍后重试");
    }

    private User? HandleApiError(ApiException ex)
    {
        _logger.LogError(ex, "API 调用异常");
        throw new BusinessException("服务调用失败");
    }

    private User? HandleSocketError(SocketException ex)
    {
        _logger.LogWarning(ex, "网络连接失败");
        throw new TransientException("网络连接失败，请检查网络");
    }

    private User? HandleUnknownError(Exception ex)
    {
        _logger.LogError(ex, "未知错误");
        throw new BusinessException("系统错误");
    }
}
```

### 2. 全局异常过滤器

```csharp
public class GlobalExceptionFilter : IAsyncActionFilter
{
    private readonly ILogger<GlobalExceptionFilter> _logger;

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        try
        {
            await next();
        }
        catch (HttpRequestException ex) when (ex.InnerException is ApiException apiException)
        {
            _logger.LogError(apiException, "API 调用异常");
            
            var response = apiException switch
            {
                ApiResponseStatusException statusEx => new ObjectResult(new
                {
                    Code = (int)statusEx.StatusCode,
                    Message = statusEx.Message
                })
                {
                    StatusCode = (int)statusEx.StatusCode
                },
                
                ApiRetryException => new ObjectResult(new
                {
                    Code = 503,
                    Message = "服务暂时不可用，请稍后重试"
                })
                {
                    StatusCode = 503
                },
                
                _ => new ObjectResult(new
                {
                    Code = 500,
                    Message = "服务调用失败"
                })
                {
                    StatusCode = 500
                }
            };
            
            context.Result = response;
        }
    }
}
```

### 3. 日志记录最佳实践

```csharp
public class LoggingHttpApiInterceptor : IHttpApiInterceptor
{
    private readonly ILogger<LoggingHttpApiInterceptor> _logger;

    public async Task OnRequestAsync(HttpRequestMessage request)
    {
        _logger.LogInformation("请求: {Method} {Uri}", request.Method, request.RequestUri);
    }

    public async Task OnResponseAsync(HttpResponseMessage response)
    {
        _logger.LogInformation("响应: {StatusCode}", response.StatusCode);
    }

    public Task OnExceptionAsync(Exception exception)
    {
        if (exception is HttpRequestException { InnerException: ApiException apiException })
        {
            _logger.LogError(apiException, "API 异常: {ExceptionType}", 
                apiException.GetType().Name);
            
            // 记录更多上下文信息
            if (apiException is ApiResponseStatusException statusEx)
            {
                _logger.LogError("状态码: {StatusCode}, 原因: {Reason}", 
                    statusEx.StatusCode, 
                    statusEx.ResponseMessage.ReasonPhrase);
            }
        }
        
        return Task.CompletedTask;
    }
}
```

### 4. 获取详细错误信息

```csharp
public static class ExceptionExtensions
{
    public static string GetDetailedMessage(this HttpRequestException ex)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"请求异常: {ex.Message}");
        
        if (ex.InnerException == null)
        {
            return sb.ToString();
        }
        
        var inner = ex.InnerException;
        sb.AppendLine($"内部异常类型: {inner.GetType().FullName}");
        sb.AppendLine($"内部异常消息: {inner.Message}");
        
        if (inner is ApiResponseStatusException statusEx)
        {
            sb.AppendLine($"状态码: {(int)statusEx.StatusCode} {statusEx.StatusCode}");
            sb.AppendLine($"响应头: {string.Join(", ", statusEx.ResponseMessage.Headers.Select(h => $"{h.Key}={string.Join(",", h.Value)}"))}");
        }
        else if (inner is ApiRetryException retryEx)
        {
            sb.AppendLine($"重试次数: {retryEx.MaxRetryCount}");
            if (retryEx.InnerException != null)
            {
                sb.AppendLine($"最终异常: {retryEx.InnerException.Message}");
            }
        }
        else if (inner is ApiInvalidConfigException configEx)
        {
            sb.AppendLine($"配置错误: {configEx.Message}");
        }
        
        sb.AppendLine($"堆栈跟踪: {inner.StackTrace}");
        
        return sb.ToString();
    }
}
```

---

## 异常处理速查表

| 异常类型 | 触发阶段 | 典型原因 | 处理建议 |
|---------|---------|---------|---------|
| `ApiInvalidConfigException` | 请求前 | 配置错误 | 开发阶段修复，不应捕获忽略 |
| `ApiResponseStatusException` | 响应后 | HTTP 状态码非 2xx | 根据状态码分类处理 |
| `ApiRetryException` | 重试后 | 重试耗尽 | 提示用户稍后重试 |
| `ApiReturnNotSupportedException` | 响应解析 | Content-Type 不支持 | 添加对应处理器 |
| `ProxyTypeCreateException` | 代理创建 | 接口定义不规范 | 检查接口定义 |
| `TypeInstanceCreateException` | 实例化 | 反射创建失败 | 检查类型构造函数 |
| `HttpContentBufferedException` | 内容处理 | Content 已缓存 | 调整处理逻辑 |

---

## 常见问题

### Q: 为什么所有异常都被包装为 HttpRequestException？

A: 这样设计是为了完整保留内部异常的堆栈信息，同时提供统一的异常捕获入口。通过 `when` 关键字可以精确捕获特定类型的内部异常。

### Q: 如何区分网络错误和业务错误？

A: 
- 网络错误：`SocketException`、`HttpRequestException`（无内部异常或内部为网络相关异常）
- 业务错误：`ApiResponseStatusException`（服务端返回了非 2xx 状态码）

### Q: 重试时如何避免丢失第一次错误的信息？

A: `ApiRetryException.InnerException` 保存了最后一次失败的异常，可以在日志中记录。

### Q: 如何自定义异常处理？

A: 可以通过实现 `IHttpApiInterceptor` 接口，在 `OnExceptionAsync` 方法中进行统一的异常处理。
