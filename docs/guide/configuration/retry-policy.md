# ITask 与 IRetryTask 详解

WebApiClientCore 提供了 `ITask<TResult>` 和 `IRetryTask<TResult>` 接口，用于实现声明式的请求重试和异常处理机制。本章将详细介绍这些接口的使用方法。

## ITask 与 Task 的区别

### 返回类型选择

在接口定义中，可以选择返回 `Task<TResult>` 或 `ITask<TResult>`：

```csharp
public interface IUserApi
{
    // 返回 Task - 标准异步模式
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);

    // 返回 ITask - 支持链式调用
    [HttpGet("api/users/{id}")]
    ITask<User> GetByIdAsync(string id);
}
```

### 选择建议

| 场景 | 推荐类型 | 原因 |
|------|----------|------|
| 简单请求，无需重试 | `Task<TResult>` | 更简洁，符合标准模式 |
| 需要条件重试 | `ITask<TResult>` | 支持 `Retry()` 扩展方法 |
| 需要异常处理返回默认值 | `ITask<TResult>` | 支持 `Handle()` 扩展方法 |
| 链式调用多个条件 | `ITask<TResult>` | 流畅 API 风格 |

### ITask 的核心特性

`ITask<TResult>` 是一个可等待的接口，与 `Task<TResult>` 完全兼容：

```csharp
// ITask 可以直接 await
ITask<User> task = userApi.GetByIdAsync("id001");
User user = await task;

// 支持 ConfigureAwait
User user = await userApi.GetByIdAsync("id001").ConfigureAwait(false);
```

## Retry 方法详解

`Retry` 是 `ITask<TResult>` 的扩展方法，返回 `IRetryTask<TResult>`，支持链式配置重试条件。

### Retry 方法重载

```csharp
// 最大重试次数
IRetryTask<TResult> Retry<TResult>(this ITask<TResult> task, int maxCount)

// 最大重试次数 + 固定延时
IRetryTask<TResult> Retry<TResult>(this ITask<TResult> task, int maxCount, TimeSpan delay)

// 最大重试次数 + 动态延时
IRetryTask<TResult> Retry<TResult>(this ITask<TResult> task, int maxCount, Func<int, TimeSpan>? delay)
```

### 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `maxCount` | `int` | 最大重试次数，必须 >= 1 |
| `delay` | `TimeSpan` | 每次重试前的固定等待时间 |
| `delay` | `Func<int, TimeSpan>` | 根据重试索引（从0开始）计算等待时间的委托 |

### 延时策略示例

```csharp
// 固定延时：每次重试前等待 1 秒
await userApi.GetByIdAsync("id001")
    .Retry(3, TimeSpan.FromSeconds(1));

// 指数退避：1s, 2s, 4s...
await userApi.GetByIdAsync("id001")
    .Retry(3, i => TimeSpan.FromSeconds(Math.Pow(2, i)));

// 线性递增：1s, 2s, 3s...
await userApi.GetByIdAsync("id001")
    .Retry(3, i => TimeSpan.FromSeconds(i + 1));

// 自定义策略：基于工作日/周末不同延时
await userApi.GetByIdAsync("id001")
    .Retry(3, i => 
    {
        var now = DateTime.Now;
        return now.DayOfWeek == DayOfWeek.Saturday || now.DayOfWeek == DayOfWeek.Sunday
            ? TimeSpan.FromSeconds(5)
            : TimeSpan.FromSeconds(1);
    });
```

## WhenCatch 异常捕获

`WhenCatch` 用于指定在捕获到特定异常时触发重试。支持多种重载形式。

### 方法签名

```csharp
// 捕获指定类型异常，直接重试
IRetryTask<TResult> WhenCatch<TException>() where TException : Exception

// 捕获异常后执行处理逻辑，然后重试
IRetryTask<TResult> WhenCatch<TException>(Action<TException> handler) where TException : Exception

// 捕获异常后判断是否需要重试
IRetryTask<TResult> WhenCatch<TException>(Func<TException, bool> predicate) where TException : Exception

// 异步版本：捕获异常后执行异步处理
IRetryTask<TResult> WhenCatchAsync<TException>(Func<TException, Task> handler) where TException : Exception

// 异步版本：捕获异常后异步判断是否需要重试
IRetryTask<TResult> WhenCatchAsync<TException>(Func<TException, Task<bool>> predicate) where TException : Exception
```

### 使用示例

```csharp
// 场景1：捕获 HttpRequestException 并重试
var result = await userApi.GetByIdAsync("id001")
    .Retry(3)
    .WhenCatch<HttpRequestException>();

// 场景2：捕获异常后记录日志
var result = await userApi.GetByIdAsync("id001")
    .Retry(3)
    .WhenCatch<HttpRequestException>(ex => 
    {
        logger.LogWarning(ex, "请求失败，准备重试");
    });

// 场景3：仅当特定条件满足时才重试
var result = await userApi.GetByIdAsync("id001")
    .Retry(3)
    .WhenCatch<HttpRequestException>(ex => 
    {
        // 仅网络相关异常重试
        return ex.InnerException is SocketException;
    });

// 场景4：捕获多种异常类型
var result = await userApi.GetByIdAsync("id001")
    .Retry(3)
    .WhenCatch<HttpRequestException>()
    .WhenCatch<TaskCanceledException>()
    .WhenCatch<SocketException>();

// 场景5：异步异常处理
var result = await userApi.GetByIdAsync("id001")
    .Retry(3)
    .WhenCatchAsync<HttpRequestException>(async ex => 
    {
        await auditService.LogRetryAttemptAsync(ex);
    });
```

## WhenResult 结果条件重试

`WhenResult` 用于根据响应结果判断是否需要重试。

### 方法签名

```csharp
// 同步判断
IRetryTask<TResult> WhenResult(Func<TResult, bool> predicate)

// 异步判断
IRetryTask<TResult> WhenResultAsync(Func<TResult, Task<bool>> predicate)
```

### 使用示例

```csharp
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    ITask<ApiResponse<User>> GetByIdAsync(string id);
}

// 场景1：业务错误码重试
var result = await userApi.GetByIdAsync("id001")
    .Retry(3, TimeSpan.FromSeconds(1))
    .WhenResult(r => r.Success == false);

// 场景2：数据有效性检查
var result = await userApi.GetByIdAsync("id001")
    .Retry(3)
    .WhenResult(r => r.Data?.Age <= 0);

// 场景3：空值重试
var result = await userApi.GetByIdAsync("id001")
    .Retry(3)
    .WhenResult(r => r == null);

// 场景4：异步条件判断（需要查询外部服务）
var result = await userApi.GetByIdAsync("id001")
    .Retry(3)
    .WhenResultAsync(async r => 
    {
        if (r.Data == null) return true;
        return await cacheService.IsStaleAsync(r.Data.Version);
    });

// 场景5：组合异常和结果条件
var result = await userApi.GetByIdAsync("id001")
    .Retry(3, TimeSpan.FromSeconds(2))
    .WhenCatch<HttpRequestException>()
    .WhenResult(r => r.Success == false);
```

## Handle 异常处理

`Handle` 方法用于优雅地处理异常，返回默认值或替代值，而不是抛出异常。

### 方法签名

```csharp
// 获取异常处理器
IHandleTask<TResult> Handle<TResult>(this ITask<TResult> task)

// 异常时返回默认值
ITask<TResult> HandleAsDefaultWhenException<TResult>(this ITask<TResult> task)
```

### IHandleTask 方法

```csharp
// 捕获异常时返回指定值
IHandleTask<TResult> WhenCatch<TException>(Func<TResult> func) where TException : Exception

// 捕获异常时根据异常返回值
IHandleTask<TResult> WhenCatch<TException>(Func<TException, TResult> func) where TException : Exception

// 异步版本
IHandleTask<TResult> WhenCatchAsync<TException>(Func<TException, Task<TResult>> func) where TException : Exception
```

### 使用示例

```csharp
// 场景1：异常时返回 null
var result = await userApi.GetByIdAsync("id001")
    .HandleAsDefaultWhenException();

// 场景2：异常时返回默认对象
var result = await userApi.GetByIdAsync("id001")
    .Handle()
    .WhenCatch<HttpRequestException>(() => new User { Id = "unknown" });

// 场景3：根据异常类型返回不同结果
var result = await userApi.GetByIdAsync("id001")
    .Handle()
    .WhenCatch<HttpRequestException>(ex => new User { Id = "error", Name = ex.Message })
    .WhenCatch<TaskCanceledException>(() => new User { Id = "timeout" });

// 场景4：异步处理异常（记录日志后返回默认值）
var result = await userApi.GetByIdAsync("id001")
    .Handle()
    .WhenCatchAsync<HttpRequestException>(async ex => 
    {
        await auditService.LogExceptionAsync(ex);
        return new User { Id = "fallback" };
    });

// 场景5：多层异常处理
var result = await userApi.GetByIdAsync("id001")
    .Handle()
    .WhenCatch<ApiInvalidConfigException>(() => throw new InvalidOperationException("配置错误"))
    .WhenCatch<HttpRequestException>(ex => new User { Id = "network-error" })
    .WhenCatch<Exception>(() => new User { Id = "unknown-error" });
```

## 完整示例场景

### 场景一：网络抖动重试

```csharp
public interface IPaymentApi
{
    [HttpPost("api/payments")]
    ITask<PaymentResult> CreateAsync([JsonContent] PaymentRequest request);
}

public class PaymentService
{
    private readonly IPaymentApi _paymentApi;
    private readonly ILogger<PaymentService> _logger;

    public async Task<PaymentResult> CreatePaymentAsync(PaymentRequest request)
    {
        return await _paymentApi.CreateAsync(request)
            .Retry(3, i => TimeSpan.FromSeconds(Math.Pow(2, i))) // 指数退避
            .WhenCatch<HttpRequestException>(ex => 
            {
                _logger.LogWarning(ex, "支付请求失败，正在重试...");
            })
            .WhenCatch<TaskCanceledException>(ex =>
            {
                _logger.LogWarning("支付请求超时，正在重试...");
            });
    }
}
```

### 场景二：Token 过期自动刷新

```csharp
public interface IAuthApi
{
    [HttpGet("api/user/profile")]
    ITask<ApiResponse<UserProfile>> GetProfileAsync();

    [HttpPost("api/auth/refresh")]
    Task<TokenResponse> RefreshTokenAsync();
}

public class AuthService
{
    private readonly IAuthApi _authApi;
    private readonly ITokenStorage _tokenStorage;

    public async Task<UserProfile?> GetProfileWithRetryAsync()
    {
        var result = await _authApi.GetProfileAsync()
            .Retry(2)
            .WhenResultAsync(async r => 
            {
                if (r.Code == 401) // Token 过期
                {
                    var newToken = await _authApi.RefreshTokenAsync();
                    _tokenStorage.Save(newToken.AccessToken);
                    return true; // 需要重试
                }
                return false;
            });
        
        return result.Success ? result.Data : null;
    }
}
```

### 场景三：服务降级

```csharp
public interface IRecommendationApi
{
    [HttpGet("api/recommendations/{userId}")]
    ITask<List<Product>> GetAsync(string userId);
}

public class RecommendationService
{
    private readonly IRecommendationApi _api;
    private readonly ICacheService _cache;

    public async Task<List<Product>> GetRecommendationsAsync(string userId)
    {
        // 优先尝试实时推荐，失败则返回缓存或默认值
        return await _api.GetAsync(userId)
            .Handle()
            .WhenCatchAsync<HttpRequestException>(async ex => 
            {
                // 尝试从缓存获取
                var cached = await _cache.GetAsync<List<Product>>($"rec:{userId}");
                if (cached != null) return cached;
                
                // 返回热门商品作为降级方案
                return await GetHotProductsAsync();
            })
            .WhenCatch<TaskCanceledException>(() => GetDefaultRecommendations());
    }

    private Task<List<Product>> GetHotProductsAsync() => /* ... */;
    private Task<List<Product>> GetDefaultRecommendations() => /* ... */;
}
```

### 场景四：幂等性重试

```csharp
public interface IOrderApi
{
    [HttpPost("api/orders")]
    ITask<OrderResult> CreateAsync([JsonContent] OrderRequest request);

    [HttpGet("api/orders/{orderId}")]
    ITask<Order?> GetAsync(string orderId);
}

public class OrderService
{
    private readonly IOrderApi _orderApi;

    public async Task<OrderResult> CreateOrderWithIdempotencyAsync(OrderRequest request)
    {
        var orderId = GenerateOrderId();
        request.OrderId = orderId;

        try
        {
            return await _orderApi.CreateAsync(request)
                .Retry(3, TimeSpan.FromSeconds(1))
                .WhenCatch<HttpRequestException>();
        }
        catch (ApiRetryException ex)
        {
            // 重试耗尽后，检查订单是否已创建成功
            var existingOrder = await _orderApi.GetAsync(orderId)
                .HandleAsDefaultWhenException();
            
            if (existingOrder != null)
            {
                return new OrderResult { Success = true, Order = existingOrder };
            }
            
            throw;
        }
    }

    private string GenerateOrderId() => Guid.NewGuid().ToString("N");
}
```

### 场景五：批量请求容错

```csharp
public interface IDataApi
{
    [HttpPost("api/data/batch")]
    ITask<BatchResult> GetBatchAsync([JsonContent] string[] ids);
}

public class DataService
{
    private readonly IDataApi _dataApi;
    private readonly ILogger<DataService> _logger;

    public async Task<Dictionary<string, DataItem>> GetDataAsync(string[] ids)
    {
        var result = await _dataApi.GetBatchAsync(ids)
            .Retry(2, TimeSpan.FromMilliseconds(500))
            .WhenCatch<HttpRequestException>(ex => 
            {
                _logger.LogWarning(ex, "批量请求失败，尝试单个请求...");
            })
            .Handle()
            .WhenCatch<Exception>(ex =>
            {
                _logger.LogError(ex, "批量请求彻底失败，尝试降级方案");
                return new BatchResult { Items = Array.Empty<DataItem>() };
            });

        // 如果批量失败，逐个请求
        if (result.Items.Length == 0 && ids.Length > 0)
        {
            return await FetchIndividuallyAsync(ids);
        }

        return result.Items.ToDictionary(x => x.Id);
    }

    private async Task<Dictionary<string, DataItem>> FetchIndividuallyAsync(string[] ids)
    {
        var results = new Dictionary<string, DataItem>();
        foreach (var id in ids)
        {
            var item = await _dataApi.GetBatchAsync(new[] { id })
                .HandleAsDefaultWhenException();
            
            if (item?.Items.Length > 0)
            {
                results[id] = item.Items[0];
            }
        }
        return results;
    }
}
```

## 性能注意事项

### 1. 重试次数与延时平衡

```csharp
// ❌ 不推荐：无延时高频重试
await api.GetAsync().Retry(10);

// ✅ 推荐：合理的延时策略
await api.GetAsync()
    .Retry(3, i => TimeSpan.FromMilliseconds(100 * Math.Pow(2, i)));
```

### 2. 避免重试风暴

```csharp
// ❌ 不推荐：对所有异常重试
await api.GetAsync()
    .Retry(3)
    .WhenCatch<Exception>();

// ✅ 推荐：仅重试可恢复的异常
await api.GetAsync()
    .Retry(3)
    .WhenCatch<HttpRequestException>(ex => ex.InnerException is SocketException)
    .WhenCatch<TaskCanceledException>();
```

### 3. 结果条件重试的开销

```csharp
// ⚠️ 注意：WhenResult 会在每次请求后执行
await api.GetAsync()
    .Retry(3)
    .WhenResult(r => HeavyComputation(r)); // 避免耗时操作

// ✅ 推荐：轻量级条件判断
await api.GetAsync()
    .Retry(3)
    .WhenResult(r => r.Success == false);
```

### 4. HttpClient 超时配置

```csharp
// 重试总时间 = (请求超时 + 重试延时) × 重试次数
// 确保 HttpClient.Timeout 大于最大预期总时间

services.AddHttpApi<IApi>().ConfigureHttpClient(c => 
{
    // 3次重试，每次最多30秒，加上延时，配置2分钟超时
    c.Timeout = TimeSpan.FromMinutes(2);
});
```

### 5. 全局重试 vs 局部重试

| 策略 | 适用场景 | 实现方式 |
|------|----------|----------|
| ITask 局部重试 | 特定接口需要特殊重试逻辑 | `ITask<TResult>` + `Retry()` |
| Polly 全局重试 | 统一的重试策略 | `AddPolicyHandler()` |
| .NET 8 Resilience | 现代化弹性策略 | `AddResilienceHandler()` |

```csharp
// 全局重试示例（Polly）
services.AddHttpApi<IApi>()
    .AddPolicyHandler(Policy.Handle<HttpRequestException>()
        .WaitAndRetryAsync(3, i => TimeSpan.FromSeconds(i)));
```

## 异常类型参考

重试过程中可能抛出的异常：

| 异常类型 | 说明 |
|----------|------|
| `ApiRetryException` | 重试次数耗尽，包含重试次数和最后一次异常 |
| `ArgumentOutOfRangeException` | `maxCount < 1` |
| `ArgumentNullException` | 参数为 null |

```csharp
try
{
    var result = await api.GetAsync()
        .Retry(3)
        .WhenCatch<HttpRequestException>();
}
catch (ApiRetryException ex)
{
    Console.WriteLine($"重试 {ex.MaxRetryCount} 次后失败");
    Console.WriteLine($"最后一次异常: {ex.InnerException?.Message}");
}
```
