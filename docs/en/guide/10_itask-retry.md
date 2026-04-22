# ITask and IRetryTask Details

WebApiClientCore provides `ITask<TResult>` and `IRetryTask<TResult>` interfaces for implementing declarative request retry and exception handling mechanisms. This chapter introduces how to use these interfaces in detail.

## Difference Between ITask and Task

### Return Type Selection

In interface definitions, you can choose to return either `Task<TResult>` or `ITask<TResult>`:

```csharp
public interface IUserApi
{
    // Returns Task - Standard async pattern
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);

    // Returns ITask - Supports fluent chaining
    [HttpGet("api/users/{id}")]
    ITask<User> GetByIdAsync(string id);
}
```

### Selection Guidelines

| Scenario | Recommended Type | Reason |
|----------|------------------|--------|
| Simple requests, no retry needed | `Task<TResult>` | Simpler, follows standard pattern |
| Conditional retry needed | `ITask<TResult>` | Supports `Retry()` extension method |
| Exception handling with default return | `ITask<TResult>` | Supports `Handle()` extension method |
| Chaining multiple conditions | `ITask<TResult>` | Fluent API style |

### Core Features of ITask

`ITask<TResult>` is an awaitable interface, fully compatible with `Task<TResult>`:

```csharp
// ITask can be directly awaited
ITask<User> task = userApi.GetByIdAsync("id001");
User user = await task;

// Supports ConfigureAwait
User user = await userApi.GetByIdAsync("id001").ConfigureAwait(false);
```

## Retry Method Details

`Retry` is an extension method of `ITask<TResult>` that returns `IRetryTask<TResult>`, supporting chained retry condition configuration.

### Retry Method Overloads

```csharp
// Maximum retry count
IRetryTask<TResult> Retry<TResult>(this ITask<TResult> task, int maxCount)

// Maximum retry count + fixed delay
IRetryTask<TResult> Retry<TResult>(this ITask<TResult> task, int maxCount, TimeSpan delay)

// Maximum retry count + dynamic delay
IRetryTask<TResult> Retry<TResult>(this ITask<TResult> task, int maxCount, Func<int, TimeSpan>? delay)
```

### Parameter Description

| Parameter | Type | Description |
|-----------|------|-------------|
| `maxCount` | `int` | Maximum retry count, must be >= 1 |
| `delay` | `TimeSpan` | Fixed wait time before each retry |
| `delay` | `Func<int, TimeSpan>` | Delegate to calculate wait time based on retry index (starting from 0) |

### Delay Strategy Examples

```csharp
// Fixed delay: Wait 1 second before each retry
await userApi.GetByIdAsync("id001")
    .Retry(3, TimeSpan.FromSeconds(1));

// Exponential backoff: 1s, 2s, 4s...
await userApi.GetByIdAsync("id001")
    .Retry(3, i => TimeSpan.FromSeconds(Math.Pow(2, i)));

// Linear increment: 1s, 2s, 3s...
await userApi.GetByIdAsync("id001")
    .Retry(3, i => TimeSpan.FromSeconds(i + 1));

// Custom strategy: Different delays for weekdays/weekends
await userApi.GetByIdAsync("id001")
    .Retry(3, i => 
    {
        var now = DateTime.Now;
        return now.DayOfWeek == DayOfWeek.Saturday || now.DayOfWeek == DayOfWeek.Sunday
            ? TimeSpan.FromSeconds(5)
            : TimeSpan.FromSeconds(1);
    });
```

## WhenCatch Exception Capturing

`WhenCatch` is used to specify retry triggers when specific exceptions are caught. Multiple overloads are supported.

### Method Signatures

```csharp
// Catch specified type of exception and retry directly
IRetryTask<TResult> WhenCatch<TException>() where TException : Exception

// Execute handler after catching exception, then retry
IRetryTask<TResult> WhenCatch<TException>(Action<TException> handler) where TException : Exception

// Determine if retry is needed after catching exception
IRetryTask<TResult> WhenCatch<TException>(Func<TException, bool> predicate) where TException : Exception

// Async version: Execute async handler after catching exception
IRetryTask<TResult> WhenCatchAsync<TException>(Func<TException, Task> handler) where TException : Exception

// Async version: Async determination if retry is needed after catching exception
IRetryTask<TResult> WhenCatchAsync<TException>(Func<TException, Task<bool>> predicate) where TException : Exception
```

### Usage Examples

```csharp
// Scenario 1: Catch HttpRequestException and retry
var result = await userApi.GetByIdAsync("id001")
    .Retry(3)
    .WhenCatch<HttpRequestException>();

// Scenario 2: Log after catching exception
var result = await userApi.GetByIdAsync("id001")
    .Retry(3)
    .WhenCatch<HttpRequestException>(ex => 
    {
        logger.LogWarning(ex, "Request failed, preparing to retry");
    });

// Scenario 3: Only retry when specific conditions are met
var result = await userApi.GetByIdAsync("id001")
    .Retry(3)
    .WhenCatch<HttpRequestException>(ex => 
    {
        // Only retry for network-related exceptions
        return ex.InnerException is SocketException;
    });

// Scenario 4: Catch multiple exception types
var result = await userApi.GetByIdAsync("id001")
    .Retry(3)
    .WhenCatch<HttpRequestException>()
    .WhenCatch<TaskCanceledException>()
    .WhenCatch<SocketException>();

// Scenario 5: Async exception handling
var result = await userApi.GetByIdAsync("id001")
    .Retry(3)
    .WhenCatchAsync<HttpRequestException>(async ex => 
    {
        await auditService.LogRetryAttemptAsync(ex);
    });
```

## WhenResult Result Condition Retry

`WhenResult` is used to determine whether a retry is needed based on the response result.

### Method Signatures

```csharp
// Synchronous judgment
IRetryTask<TResult> WhenResult(Func<TResult, bool> predicate)

// Asynchronous judgment
IRetryTask<TResult> WhenResultAsync(Func<TResult, Task<bool>> predicate)
```

### Usage Examples

```csharp
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    ITask<ApiResponse<User>> GetByIdAsync(string id);
}

// Scenario 1: Business error code retry
var result = await userApi.GetByIdAsync("id001")
    .Retry(3, TimeSpan.FromSeconds(1))
    .WhenResult(r => r.Success == false);

// Scenario 2: Data validity check
var result = await userApi.GetByIdAsync("id001")
    .Retry(3)
    .WhenResult(r => r.Data?.Age <= 0);

// Scenario 3: Null value retry
var result = await userApi.GetByIdAsync("id001")
    .Retry(3)
    .WhenResult(r => r == null);

// Scenario 4: Async condition judgment (requires external service query)
var result = await userApi.GetByIdAsync("id001")
    .Retry(3)
    .WhenResultAsync(async r => 
    {
        if (r.Data == null) return true;
        return await cacheService.IsStaleAsync(r.Data.Version);
    });

// Scenario 5: Combine exception and result conditions
var result = await userApi.GetByIdAsync("id001")
    .Retry(3, TimeSpan.FromSeconds(2))
    .WhenCatch<HttpRequestException>()
    .WhenResult(r => r.Success == false);
```

## Handle Exception Handling

The `Handle` method is used to gracefully handle exceptions, returning default or alternative values instead of throwing exceptions.

### Method Signatures

```csharp
// Get exception handler
IHandleTask<TResult> Handle<TResult>(this ITask<TResult> task)

// Return default value on exception
ITask<TResult> HandleAsDefaultWhenException<TResult>(this ITask<TResult> task)
```

### IHandleTask Methods

```csharp
// Return specified value when exception is caught
IHandleTask<TResult> WhenCatch<TException>(Func<TResult> func) where TException : Exception

// Return value based on exception when caught
IHandleTask<TResult> WhenCatch<TException>(Func<TException, TResult> func) where TException : Exception

// Async version
IHandleTask<TResult> WhenCatchAsync<TException>(Func<TException, Task<TResult>> func) where TException : Exception
```

### Usage Examples

```csharp
// Scenario 1: Return null on exception
var result = await userApi.GetByIdAsync("id001")
    .HandleAsDefaultWhenException();

// Scenario 2: Return default object on exception
var result = await userApi.GetByIdAsync("id001")
    .Handle()
    .WhenCatch<HttpRequestException>(() => new User { Id = "unknown" });

// Scenario 3: Return different results based on exception type
var result = await userApi.GetByIdAsync("id001")
    .Handle()
    .WhenCatch<HttpRequestException>(ex => new User { Id = "error", Name = ex.Message })
    .WhenCatch<TaskCanceledException>(() => new User { Id = "timeout" });

// Scenario 4: Async exception handling (return default value after logging)
var result = await userApi.GetByIdAsync("id001")
    .Handle()
    .WhenCatchAsync<HttpRequestException>(async ex => 
    {
        await auditService.LogExceptionAsync(ex);
        return new User { Id = "fallback" };
    });

// Scenario 5: Multi-layer exception handling
var result = await userApi.GetByIdAsync("id001")
    .Handle()
    .WhenCatch<ApiInvalidConfigException>(() => throw new InvalidOperationException("Configuration error"))
    .WhenCatch<HttpRequestException>(ex => new User { Id = "network-error" })
    .WhenCatch<Exception>(() => new User { Id = "unknown-error" });
```

## Complete Example Scenarios

### Scenario 1: Network Jitter Retry

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
            .Retry(3, i => TimeSpan.FromSeconds(Math.Pow(2, i))) // Exponential backoff
            .WhenCatch<HttpRequestException>(ex => 
            {
                _logger.LogWarning(ex, "Payment request failed, retrying...");
            })
            .WhenCatch<TaskCanceledException>(ex =>
            {
                _logger.LogWarning("Payment request timeout, retrying...");
            });
    }
}
```

### Scenario 2: Token Expiration Auto-Refresh

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
                if (r.Code == 401) // Token expired
                {
                    var newToken = await _authApi.RefreshTokenAsync();
                    _tokenStorage.Save(newToken.AccessToken);
                    return true; // Need retry
                }
                return false;
            });
        
        return result.Success ? result.Data : null;
    }
}
```

### Scenario 3: Service Degradation

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
        // Try real-time recommendations first, return cache or default on failure
        return await _api.GetAsync(userId)
            .Handle()
            .WhenCatchAsync<HttpRequestException>(async ex => 
            {
                // Try to get from cache
                var cached = await _cache.GetAsync<List<Product>>($"rec:{userId}");
                if (cached != null) return cached;
                
                // Return hot products as degradation fallback
                return await GetHotProductsAsync();
            })
            .WhenCatch<TaskCanceledException>(() => GetDefaultRecommendations());
    }

    private Task<List<Product>> GetHotProductsAsync() => /* ... */;
    private Task<List<Product>> GetDefaultRecommendations() => /* ... */;
}
```

### Scenario 4: Idempotent Retry

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
            // After retries exhausted, check if order was created successfully
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

### Scenario 5: Batch Request Fault Tolerance

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
                _logger.LogWarning(ex, "Batch request failed, trying individual requests...");
            })
            .Handle()
            .WhenCatch<Exception>(ex =>
            {
                _logger.LogError(ex, "Batch request completely failed, trying degradation");
                return new BatchResult { Items = Array.Empty<DataItem>() };
            });

        // If batch failed, fetch individually
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

## Performance Considerations

### 1. Balance Retry Count and Delay

```csharp
// ❌ Not recommended: High-frequency retry without delay
await api.GetAsync().Retry(10);

// ✅ Recommended: Reasonable delay strategy
await api.GetAsync()
    .Retry(3, i => TimeSpan.FromMilliseconds(100 * Math.Pow(2, i)));
```

### 2. Avoid Retry Storms

```csharp
// ❌ Not recommended: Retry on all exceptions
await api.GetAsync()
    .Retry(3)
    .WhenCatch<Exception>();

// ✅ Recommended: Only retry recoverable exceptions
await api.GetAsync()
    .Retry(3)
    .WhenCatch<HttpRequestException>(ex => ex.InnerException is SocketException)
    .WhenCatch<TaskCanceledException>();
```

### 3. Overhead of Result Condition Retry

```csharp
// ⚠️ Note: WhenResult executes after every request
await api.GetAsync()
    .Retry(3)
    .WhenResult(r => HeavyComputation(r)); // Avoid expensive operations

// ✅ Recommended: Lightweight condition judgment
await api.GetAsync()
    .Retry(3)
    .WhenResult(r => r.Success == false);
```

### 4. HttpClient Timeout Configuration

```csharp
// Total retry time = (request timeout + retry delay) × retry count
// Ensure HttpClient.Timeout is greater than maximum expected total time

services.AddHttpApi<IApi>().ConfigureHttpClient(c => 
{
    // 3 retries, max 30 seconds each, plus delays, configure 2 minute timeout
    c.Timeout = TimeSpan.FromMinutes(2);
});
```

### 5. Global Retry vs Local Retry

| Strategy | Use Case | Implementation |
|----------|----------|----------------|
| ITask local retry | Specific interface needs special retry logic | `ITask<TResult>` + `Retry()` |
| Polly global retry | Unified retry policy | `AddPolicyHandler()` |
| .NET 8 Resilience | Modern resilience strategy | `AddResilienceHandler()` |

```csharp
// Global retry example (Polly)
services.AddHttpApi<IApi>()
    .AddPolicyHandler(Policy.Handle<HttpRequestException>()
        .WaitAndRetryAsync(3, i => TimeSpan.FromSeconds(i)));
```

## Exception Type Reference

Exceptions that may be thrown during retry:

| Exception Type | Description |
|----------------|-------------|
| `ApiRetryException` | Retry count exhausted, contains retry count and last exception |
| `ArgumentOutOfRangeException` | `maxCount < 1` |
| `ArgumentNullException` | Parameter is null |

```csharp
try
{
    var result = await api.GetAsync()
        .Retry(3)
        .WhenCatch<HttpRequestException>();
}
catch (ApiRetryException ex)
{
    Console.WriteLine($"Failed after {ex.MaxRetryCount} retries");
    Console.WriteLine($"Last exception: {ex.InnerException?.Message}");
}
```
