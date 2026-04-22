# Complete Guide to Exception Handling

WebApiClientCore provides a comprehensive exception system to help developers precisely catch and handle various error scenarios. This document details all exception types, trigger conditions, and best practices.

## Exception Hierarchy

```
Exception
├── ApiException (Abstract Base Class)
│   ├── ApiInvalidConfigException      // Configuration error
│   ├── ApiResponseStatusException     // Response status code error
│   ├── ApiResultNotMatchException     // Result mismatch error
│   ├── ApiRetryException              // Retry exhausted error
│   └── ApiReturnNotSupportedException // Unsupported response type
│       └── ApiReturnNotSupportedExteption (Internal use)
│
├── ProxyTypeException                 // Proxy type error
│   └── ProxyTypeCreateException       // Proxy creation error
│
├── TypeInstanceCreateException        // Type instance creation error
│
└── HttpContentBufferedException       // HttpContent buffered error
```

## Exception Wrapping Mechanism

All request exceptions are wrapped as `HttpRequestException`, with the actual specific exception as the inner exception (`InnerException`). This design preserves the complete exception stack trace.

```csharp
try
{
    var data = await api.GetAsync();
}
catch (HttpRequestException ex)
{
    // ex.InnerException is the actual exception
    Console.WriteLine($"Actual exception type: {ex.InnerException?.GetType().Name}");
}
```

## Exception Types in Detail

### 1. ApiException (Abstract Base Class)

The base class for all API-related exceptions, inheriting from `Exception`.

**Purpose**: Serves as a unified catch point for all API exceptions.

```csharp
catch (HttpRequestException ex) when (ex.InnerException is ApiException apiException)
{
    // Catch all WebApiClientCore internal exceptions
    logger.LogError(apiException, "API call failed");
}
```

---

### 2. ApiInvalidConfigException

**Description**: Thrown when request configuration is invalid.

**Trigger Conditions**:
- Missing required request URI
- Missing HTTP Host configuration
- Invalid or out-of-range timeout parameter
- URI parameter cannot be converted to a valid URI
- Invalid Content-Type configuration
- Improper use of Patch method

**Typical Scenarios**:

```csharp
// Scenario 1: HttpHost not configured
public interface IMyApi
{
    [HttpGet("api/users")]  // Missing Host prefix
    Task<User> GetUserAsync();
}

// Scenario 2: Invalid timeout value
public interface IMyApi
{
    [HttpGet("api/users")]
    [Timeout(-1)]  // Invalid timeout value
    Task<User> GetUserAsync();
}
```

**Handling Example**:

```csharp
try
{
    var user = await api.GetUserAsync();
}
catch (HttpRequestException ex) when (ex.InnerException is ApiInvalidConfigException configEx)
{
    Console.WriteLine($"Configuration error: {configEx.Message}");
    // Configuration errors should be fixed during development, not caught and ignored at runtime
    throw;
}
```

---

### 3. ApiResponseStatusException

**Description**: Thrown when HTTP response status code indicates failure.

**Trigger Conditions**:
- Response status code is not in the 2xx range
- Using attributes like `[JsonReturn]` or `[XmlReturn]` with `EnsureSuccessStatusCode = true`

**Properties**:
| Property | Type | Description |
|----------|------|-------------|
| `ResponseMessage` | `HttpResponseMessage` | Complete response message |
| `StatusCode` | `HttpStatusCode` | HTTP status code |
| `Message` | `string` | Formatted error message |

**Typical Scenario**:

```csharp
// Interface declaration
public interface IMyApi
{
    [HttpGet("api/users/{id}")]
    [JsonReturn(EnsureSuccessStatusCode = true)]  // Automatically check status code
    Task<User> GetUserAsync(int id);
}

// Trigger scenario: Server returns 404, 500, or other error status codes
```

**Handling Example**:

```csharp
try
{
    var user = await api.GetUserAsync(1);
}
catch (HttpRequestException ex) when (ex.InnerException is ApiResponseStatusException statusEx)
{
    var statusCode = (int)statusEx.StatusCode;
    var reasonPhrase = statusEx.ResponseMessage.ReasonPhrase;
    
    Console.WriteLine($"HTTP Error: {statusCode} {reasonPhrase}");
    
    // Read response content for detailed error information
    var errorContent = await statusEx.ResponseMessage.Content.ReadAsStringAsync();
    Console.WriteLine($"Error details: {errorContent}");
    
    // Handle by status code category
    switch (statusCode)
    {
        case 401:
            // Unauthorized, may need to re-login
            break;
        case 403:
            // Forbidden
            break;
        case 404:
            // Resource not found
            break;
        case >= 500:
            // Server error
            break;
    }
}
```

---

### 4. ApiResultNotMatchException

**Description**: Used when result validation fails in retry mechanism (mainly for internal retry logic).

**Trigger Conditions**:
- Using `ITask<>` return type with `WhenResult()` for conditional retry
- Result meets retry condition, but retry count is exhausted

**Properties**:
| Property | Type | Description |
|----------|------|-------------|
| `Result` | `object?` | The result value that triggered retry |

**Typical Scenario**:

```csharp
public interface IMyApi
{
    [HttpGet("api/data")]
    ITask<DataResponse> GetDataAsync();
}

// Retry when result needs validation
var result = await api.GetDataAsync()
    .Retry(3)
    .WhenResult(r => r.Success == false)  // Retry when Success is false
    .WhenCatch<HttpRequestException>();
```

**Handling Example**:

```csharp
try
{
    var result = await api.GetDataAsync()
        .Retry(3)
        .WhenResult(r => r.Success == false);
}
catch (HttpRequestException ex) when (ex.InnerException is ApiResultNotMatchException resultEx)
{
    Console.WriteLine($"Result validation failed, retries exhausted");
    Console.WriteLine($"Last result: {resultEx.Result}");
}
```

---

### 5. ApiRetryException

**Description**: Thrown when retry count is exhausted.

**Trigger Conditions**:
- Using `ITask<>` return type
- Retry mechanism configured
- All retry attempts failed

**Properties**:
| Property | Type | Description |
|----------|------|-------------|
| `MaxRetryCount` | `int` | Configured maximum retry count |
| `InnerException` | `Exception?` | The last failed exception |

**Typical Scenario**:

```csharp
public interface IMyApi
{
    [HttpGet("api/data")]
    ITask<Data> GetDataAsync();
}

// Configure retry
try
{
    var result = await api.GetDataAsync()
        .Retry(3, TimeSpan.FromSeconds(1))
        .WhenCatch<HttpRequestException>();
}
catch (HttpRequestException ex) when (ex.InnerException is ApiRetryException retryEx)
{
    Console.WriteLine($"Failed after {retryEx.MaxRetryCount} retries");
    Console.WriteLine($"Last exception: {retryEx.InnerException?.Message}");
}
```

**Complete Retry Handling Example**:

```csharp
public async Task<Data> GetDataWithRetryAsync(IMyApi api, CancellationToken cancellationToken = default)
{
    try
    {
        return await api.GetDataAsync()
            .Retry(3, retryIndex => TimeSpan.FromSeconds(Math.Pow(2, retryIndex)))  // Exponential backoff
            .WhenCatch<HttpRequestException>(ex =>
            {
                logger.LogWarning(ex, "Request failed, preparing to retry");
            })
            .WhenCatch<SocketException>(ex =>
            {
                logger.LogWarning(ex, "Network connection failed, preparing to retry");
            });
    }
    catch (HttpRequestException ex) when (ex.InnerException is ApiRetryException retryEx)
    {
        logger.LogError(retryEx.InnerException, "Retries exhausted, request ultimately failed");
        throw;
    }
}
```

---

### 6. ApiReturnNotSupportedException

**Description**: Thrown when Content-Type of response cannot be handled.

**Trigger Conditions**:
- No corresponding handler for response Content-Type
- Example: Server returns XML, but interface only configured with JSON handler

**Typical Scenario**:

```csharp
// Interface expects JSON, but server returns XML
public interface IMyApi
{
    [HttpGet("api/data")]
    [JsonReturn]  // Only supports JSON
    Task<Data> GetDataAsync();
}

// Server returns Content-Type: application/xml
// Will trigger ApiReturnNotSupportedException
```

**Handling Example**:

```csharp
try
{
    var data = await api.GetDataAsync();
}
catch (HttpRequestException ex) when (ex.InnerException is ApiReturnNotSupportedException notSupportedEx)
{
    var context = notSupportedEx.Context;
    var contentType = context.HttpContext.ResponseMessage?.Content.Headers.ContentType;
    
    Console.WriteLine($"Unsupported Content-Type: {contentType}");
    Console.WriteLine($"Expected return type: {context.ActionDescriptor.Return.DataType.Type}");
    
    // Solution: Add corresponding content handler or modify interface declaration
}
```

---

### 7. ProxyTypeException / ProxyTypeCreateException

**Description**: Error during proxy type creation or usage.

**Trigger Conditions**:
- Interface definition doesn't conform to specifications (e.g., interface contains generic methods)
- Dynamic proxy generation fails
- Invalid interface type

**Properties**:
| Property | Type | Description |
|----------|------|-------------|
| `InterfaceType` | `Type` | The interface type that caused the problem |

**Typical Scenario**:

```csharp
// Scenario: Non-compliant interface definition
public interface IInvalidApi
{
    // Generic methods may cause proxy creation to fail
    Task<T> GetDataAsync<T>();
}
```

**Handling Example**:

```csharp
try
{
    var api = httpApiFactory.CreateHttpApi<IMyApi>();
}
catch (ProxyTypeCreateException proxyEx)
{
    Console.WriteLine($"Proxy creation failed, interface type: {proxyEx.InterfaceType}");
    Console.WriteLine($"Error message: {proxyEx.Message}");
    // Check if interface definition conforms to specifications
}
```

---

### 8. TypeInstanceCreateException

**Description**: Thrown when creating a type instance via reflection fails.

**Trigger Conditions**:
- Attribute or filter instantiation fails
- Type has no parameterless constructor
- Constructor throws an exception

**Properties**:
| Property | Type | Description |
|----------|------|-------------|
| `InstanceType` | `Type` | The type that failed to create |

**Typical Scenario**:

```csharp
// Custom attribute missing parameterless constructor
public class MyCustomAttribute : ApiActionAttribute
{
    public MyCustomAttribute(string requiredParam)  // Missing parameterless constructor
    {
    }
}
```

---

### 9. HttpContentBufferedException

**Description**: Thrown when attempting non-buffered operations on already buffered HttpContent.

**Trigger Conditions**:
- HttpContent has been read and buffered
- Attempting streaming operations on it

**Typical Scenario**:

```csharp
// In custom filter or return handler
public class MyReturnAttribute : ApiReturnAttribute
{
    public override async Task SetResultAsync(ApiResponseContext context)
    {
        var content = context.HttpContext.ResponseMessage.Content;
        
        // If content is already buffered, exception will be thrown
        content.EnsureNotBuffered();
        
        // Stream reading...
    }
}
```

---

## Best Practices

### 1. Layered Exception Handling

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
        _logger.LogCritical(ex, "Configuration error, please check interface definition");
        throw ex;  // Configuration errors should be thrown directly for developers to fix
    }

    private User? HandleStatusError(ApiResponseStatusException ex)
    {
        if ((int)ex.StatusCode == 404)
        {
            _logger.LogInformation("User not found: {StatusCode}", ex.StatusCode);
            return null;
        }
        
        _logger.LogError("API returned error status code: {StatusCode}", ex.StatusCode);
        throw new BusinessException($"Service temporarily unavailable: {ex.StatusCode}");
    }

    private User? HandleRetryError(ApiRetryException ex)
    {
        _logger.LogWarning(ex.InnerException, "Retries exhausted");
        throw new TransientException("Service temporarily unavailable, please try again later");
    }

    private User? HandleApiError(ApiException ex)
    {
        _logger.LogError(ex, "API call exception");
        throw new BusinessException("Service call failed");
    }

    private User? HandleSocketError(SocketException ex)
    {
        _logger.LogWarning(ex, "Network connection failed");
        throw new TransientException("Network connection failed, please check your network");
    }

    private User? HandleUnknownError(Exception ex)
    {
        _logger.LogError(ex, "Unknown error");
        throw new BusinessException("System error");
    }
}
```

### 2. Global Exception Filter

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
            _logger.LogError(apiException, "API call exception");
            
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
                    Message = "Service temporarily unavailable, please try again later"
                })
                {
                    StatusCode = 503
                },
                
                _ => new ObjectResult(new
                {
                    Code = 500,
                    Message = "Service call failed"
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

### 3. Logging Best Practices

```csharp
public class LoggingHttpApiInterceptor : IHttpApiInterceptor
{
    private readonly ILogger<LoggingHttpApiInterceptor> _logger;

    public async Task OnRequestAsync(HttpRequestMessage request)
    {
        _logger.LogInformation("Request: {Method} {Uri}", request.Method, request.RequestUri);
    }

    public async Task OnResponseAsync(HttpResponseMessage response)
    {
        _logger.LogInformation("Response: {StatusCode}", response.StatusCode);
    }

    public Task OnExceptionAsync(Exception exception)
    {
        if (exception is HttpRequestException { InnerException: ApiException apiException })
        {
            _logger.LogError(apiException, "API Exception: {ExceptionType}", 
                apiException.GetType().Name);
            
            // Log more context information
            if (apiException is ApiResponseStatusException statusEx)
            {
                _logger.LogError("Status code: {StatusCode}, Reason: {Reason}", 
                    statusEx.StatusCode, 
                    statusEx.ResponseMessage.ReasonPhrase);
            }
        }
        
        return Task.CompletedTask;
    }
}
```

### 4. Getting Detailed Error Information

```csharp
public static class ExceptionExtensions
{
    public static string GetDetailedMessage(this HttpRequestException ex)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"Request exception: {ex.Message}");
        
        if (ex.InnerException == null)
        {
            return sb.ToString();
        }
        
        var inner = ex.InnerException;
        sb.AppendLine($"Inner exception type: {inner.GetType().FullName}");
        sb.AppendLine($"Inner exception message: {inner.Message}");
        
        if (inner is ApiResponseStatusException statusEx)
        {
            sb.AppendLine($"Status code: {(int)statusEx.StatusCode} {statusEx.StatusCode}");
            sb.AppendLine($"Response headers: {string.Join(", ", statusEx.ResponseMessage.Headers.Select(h => $"{h.Key}={string.Join(",", h.Value)}"))}");
        }
        else if (inner is ApiRetryException retryEx)
        {
            sb.AppendLine($"Retry count: {retryEx.MaxRetryCount}");
            if (retryEx.InnerException != null)
            {
                sb.AppendLine($"Final exception: {retryEx.InnerException.Message}");
            }
        }
        else if (inner is ApiInvalidConfigException configEx)
        {
            sb.AppendLine($"Configuration error: {configEx.Message}");
        }
        
        sb.AppendLine($"Stack trace: {inner.StackTrace}");
        
        return sb.ToString();
    }
}
```

---

## Quick Reference Table

| Exception Type | Trigger Stage | Typical Cause | Handling Suggestion |
|---------------|--------------|---------------|---------------------|
| `ApiInvalidConfigException` | Before request | Configuration error | Fix during development, don't catch and ignore |
| `ApiResponseStatusException` | After response | HTTP status code not 2xx | Handle by status code category |
| `ApiRetryException` | After retry | Retries exhausted | Prompt user to retry later |
| `ApiReturnNotSupportedException` | Response parsing | Content-Type not supported | Add corresponding handler |
| `ProxyTypeCreateException` | Proxy creation | Non-compliant interface definition | Check interface definition |
| `TypeInstanceCreateException` | Instantiation | Reflection creation failed | Check type constructor |
| `HttpContentBufferedException` | Content handling | Content already buffered | Adjust processing logic |

---

## FAQ

### Q: Why are all exceptions wrapped as HttpRequestException?

A: This design preserves the complete stack trace of inner exceptions while providing a unified exception catch point. Specific inner exception types can be precisely caught using the `when` keyword.

### Q: How to distinguish between network errors and business errors?

A: 
- Network errors: `SocketException`, `HttpRequestException` (without inner exception or with network-related inner exception)
- Business errors: `ApiResponseStatusException` (server returned non-2xx status code)

### Q: How to avoid losing information from the first error during retries?

A: `ApiRetryException.InnerException` stores the last failed exception, which can be logged.

### Q: How to customize exception handling?

A: You can implement the `IHttpApiInterceptor` interface and handle exceptions uniformly in the `OnExceptionAsync` method.
