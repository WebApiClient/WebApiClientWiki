# JSON-RPC Extension

In some scenarios, developers may encounter JSON-RPC interfaces. Since this protocol is not widely used, WebApiClientCore provides support through the WebApiClientCore.Extensions.JsonRpc extension package. Simply decorate RPC methods with `[JsonRpcMethod]` and RPC parameters with `[JsonRpcParam]`.

## JSON-RPC 2.0 Protocol Overview

JSON-RPC is a lightweight Remote Procedure Call (RPC) protocol that uses JSON as its data format. JSON-RPC 2.0 is the current mainstream version with the following characteristics:

- **Transport Agnostic**: Can run on TCP, HTTP, and other transport protocols
- **Single Request-Single Response**: Each request corresponds to one response
- **Batch Calls**: Supports sending multiple requests at once
- **Standardized Errors**: Defines standard error codes and error message formats

### Request Object Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| jsonrpc | string | Yes | Fixed value "2.0" |
| method | string | Yes | Method name to call |
| params | array/object | No | Parameter values |
| id | string/number | No | Request identifier (for matching responses) |

### Response Object Structure

**Success Response:**

| Field | Type | Description |
|-------|------|-------------|
| jsonrpc | string | Fixed value "2.0" |
| result | any | Method return value |
| id | string/number | Corresponding request id |

**Error Response:**

| Field | Type | Description |
|-------|------|-------------|
| jsonrpc | string | Fixed value "2.0" |
| error | object | Error object |
| id | string/number | Corresponding request id |

## Installation

```bash
dotnet add package WebApiClientCore.Extensions.JsonRpc
```

## JsonRpcMethodAttribute

`JsonRpcMethodAttribute` is used to mark interface methods as JSON-RPC calls. It inherits from `HttpPostAttribute` and implements `IApiFilterAttribute`.

### Constructors

| Constructor | Description |
|-------------|-------------|
| `JsonRpcMethodAttribute()` | Uses method name as RPC method name |
| `JsonRpcMethodAttribute(string method)` | Specifies RPC method name |
| `JsonRpcMethodAttribute(string method, string path)` | Specifies RPC method name and request path |

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `ContentType` | string | `application/json-rpc` | Request Content-Type |
| `ParamsStyle` | JsonRpcParamsStyle | `Array` | Parameter serialization style |

### How It Works

1. **OnRequestAsync**: Initializes `JsonRpcParameters` container
2. **IApiFilter.OnRequestAsync**: Builds JSON-RPC request body after collecting parameters
3. Method name defaults to interface method name, can be specified via constructor

## JsonRpcParamAttribute

`JsonRpcParamAttribute` marks method parameters as JSON-RPC parameters. Marked parameters are collected into the parameter list and serialized as the `params` field.

### Usage Rules

- Must be used with `JsonRpcMethodAttribute`
- Parameters are collected in declaration order
- Unmarked parameters (like `CancellationToken`) do not participate in RPC calls

## JsonRpcParamsStyle Parameter Styles

The `JsonRpcParamsStyle` enum defines three parameter serialization modes:

### Array Mode (Default)

Parameters are serialized as an array by position:

```csharp
[JsonRpcMethod("add", ParamsStyle = JsonRpcParamsStyle.Array)]
ITask<JsonRpcResult<int>> AddAsync([JsonRpcParam] int a, [JsonRpcParam] int b);
```

Generated request:
```json
{"jsonrpc":"2.0","method":"add","params":[1,2],"id":1}
```

### Object Mode

Parameters are serialized as an object by name:

```csharp
[JsonRpcMethod("getUser", ParamsStyle = JsonRpcParamsStyle.Object)]
ITask<JsonRpcResult<User>> GetUserAsync([JsonRpcParam] string name, [JsonRpcParam] int age);
```

Generated request:
```json
{"jsonrpc":"2.0","method":"getUser","params":{"name":"John","age":18},"id":2}
```

### Selection Guide

| Mode | Use Case |
|------|----------|
| Array | Server parses parameters by position, fixed parameter count |
| Object | Server parses parameters by name, optional parameters or variable order |

## Response Handling: JsonRpcResult\<TResult\>

JSON-RPC responses are received through the `JsonRpcResult<TResult>` generic class:

```csharp
public class JsonRpcResult<TResult>
{
    /// <summary>
    /// Request id
    /// </summary>
    public int? Id { get; set; }

    /// <summary>
    /// JSON-RPC version
    /// </summary>
    public string JsonRpc { get; set; }

    /// <summary>
    /// Result value (on success)
    /// </summary>
    public TResult Result { get; set; }

    /// <summary>
    /// Error content (on failure)
    /// </summary>
    public JsonRpcError? Error { get; set; }
}
```

### Error Handling: JsonRpcError

```csharp
public class JsonRpcError
{
    /// <summary>
    /// Error code
    /// </summary>
    public int Code { get; set; }

    /// <summary>
    /// Error message
    /// </summary>
    public string? Message { get; set; }

    /// <summary>
    /// Error details
    /// </summary>
    public object? Data { get; set; }
}
```

### Standard JSON-RPC Error Codes

| Error Code | Meaning |
|------------|---------|
| -32700 | Parse error |
| -32600 | Invalid Request |
| -32601 | Method not found |
| -32602 | Invalid params |
| -32603 | Internal error |
| -32000 ~ -32099 | Server-defined errors |

## Complete Examples

### Example 1: Basic Usage

```csharp
// Define user model
public class User
{
    public string Name { get; set; }
    public int Age { get; set; }
}

// Define RPC interface
[HttpHost("http://localhost:5000/jsonrpc")]
public interface IUserApi
{
    [JsonRpcMethod("user.add")]
    ITask<JsonRpcResult<int>> AddUserAsync([JsonRpcParam] string name, [JsonRpcParam] int age);

    [JsonRpcMethod("user.get")]
    ITask<JsonRpcResult<User>> GetUserAsync([JsonRpcParam] int id);

    [JsonRpcMethod("user.list")]
    ITask<JsonRpcResult<List<User>>> ListUsersAsync();
}

// Usage example
var api = HttpApi.Create<IUserApi>();

// Add user
var addResult = await api.AddUserAsync("John", 25);
if (addResult.Error == null)
{
    Console.WriteLine($"User ID: {addResult.Result}");
}

// Get user
var getResult = await api.GetUserAsync(1);
if (getResult.Error == null)
{
    Console.WriteLine($"User name: {getResult.Result.Name}");
}
```

### Example 2: Using Object Parameter Style

```csharp
// Complex query scenario with optional parameters
[HttpHost("http://localhost:5000/jsonrpc")]
public interface IOrderApi
{
    [JsonRpcMethod("order.query", ParamsStyle = JsonRpcParamsStyle.Object)]
    ITask<JsonRpcResult<OrderList>> QueryOrdersAsync(
        [JsonRpcParam] string? status,
        [JsonRpcParam] DateTime? startDate,
        [JsonRpcParam] DateTime? endDate,
        [JsonRpcParam] int? page,
        [JsonRpcParam] int? pageSize);
}

// Usage example
var api = HttpApi.Create<IOrderApi>();
var result = await api.QueryOrdersAsync("completed", DateTime.Today.AddDays(-7), null, 1, 20);

// Generated request body:
// {"jsonrpc":"2.0","method":"order.query","params":{"status":"completed","startDate":"2024-01-15T00:00:00","endDate":null,"page":1,"pageSize":20},"id":1}
```

### Example 3: Error Handling

```csharp
public static async Task<T?> SafeCallAsync<T>(ITask<JsonRpcResult<T>> task)
{
    var result = await task;
    
    if (result.Error != null)
    {
        Console.WriteLine($"RPC Error: [{result.Error.Code}] {result.Error.Message}");
        if (result.Error.Data != null)
        {
            Console.WriteLine($"Details: {result.Error.Data}");
        }
        return default;
    }
    
    return result.Result;
}

// Usage example
var api = HttpApi.Create<IUserApi>();
var user = await SafeCallAsync(api.GetUserAsync(999));

if (user != null)
{
    Console.WriteLine($"Got user: {user.Name}");
}
```

### Example 4: Custom Content-Type

Some servers may require a different Content-Type:

```csharp
[HttpHost("http://localhost:5000/jsonrpc")]
public interface IEthereumApi
{
    [JsonRpcMethod("eth_getBalance", ContentType = "application/json")]
    ITask<JsonRpcResult<string>> GetBalanceAsync([JsonRpcParam] string address, [JsonRpcParam] string block);
}
```

### Example 5: Dynamic Method Name

When the method name is not specified, the interface method name is used as the RPC method name:

```csharp
[HttpHost("http://localhost:5000/jsonrpc")]
public interface ISystemApi
{
    // RPC method name is "GetServerTime"
    [JsonRpcMethod]
    ITask<JsonRpcResult<DateTime>> GetServerTimeAsync();

    // RPC method name is "GetVersion"
    [JsonRpcMethod]
    ITask<JsonRpcResult<string>> GetVersionAsync();
}
```

## Request Packet Format

### Array Parameter Style

```http
POST /jsonrpc HTTP/1.1
Host: localhost:5000
Content-Type: application/json-rpc
Accept: application/json

{"jsonrpc":"2.0","method":"add","params":["john",18],"id":1}
```

### Object Parameter Style

```http
POST /jsonrpc HTTP/1.1
Host: localhost:5000
Content-Type: application/json-rpc
Accept: application/json

{"jsonrpc":"2.0","method":"query","params":{"name":"John","age":18},"id":2}
```

## Response Packet Format

### Success Response

```json
{"jsonrpc":"2.0","result":{"name":"John","age":18},"id":1}
```

### Error Response

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": "Parameter age must be greater than 0"
  },
  "id": 1
}
```

## Batch Calls

The JSON-RPC 2.0 protocol supports batch calls, but the WebApiClientCore.Extensions.JsonRpc extension **does not directly support batch calls**. You can implement batch calls using the following approaches:

### Approach 1: Parallel Requests

```csharp
var api = HttpApi.Create<IUserApi>();
var tasks = new[]
{
    api.GetUserAsync(1),
    api.GetUserAsync(2),
    api.GetUserAsync(3)
};

var results = await Task.WhenAll(tasks);
foreach (var result in results)
{
    if (result.Error == null)
    {
        Console.WriteLine($"User: {result.Result.Name}");
    }
}
```

### Approach 2: Custom Batch Request

If the server supports batch requests, you can manually build the request body:

```csharp
// Define batch response model
public class JsonRpcBatchItem<T>
{
    public int Id { get; set; }
    public T? Result { get; set; }
    public JsonRpcError? Error { get; set; }
}

// Send batch request
var batchRequest = new[]
{
    new { jsonrpc = "2.0", method = "user.get", @params = new[] { 1 }, id = 1 },
    new { jsonrpc = "2.0", method = "user.get", @params = new[] { 2 }, id = 2 }
};

// Use regular HTTP interface to send
[HttpHost("http://localhost:5000/jsonrpc")]
public interface IBatchApi
{
    [HttpPost]
    [JsonContent]
    ITask<List<JsonRpcBatchItem<User>>> BatchAsync([JsonContent] object[] requests);
}
```

## Comparison with Standard HTTP API

| Feature | JSON-RPC | RESTful API |
|---------|----------|-------------|
| Call Method | Method name + parameters | HTTP method + URL path |
| Transport Protocol | Transport agnostic (usually HTTP POST) | HTTP |
| Request Format | Standardized JSON structure | Multiple formats (JSON, XML, Form, etc.) |
| Response Format | Unified result/error structure | HTTP status code + response body |
| Batch Operations | Native support | Requires custom design |
| Error Handling | Standard error code structure | HTTP status codes |
| Caching | Not supported | Supported (GET requests) |
| Browser Calls | Requires library support | Native support |
| Use Cases | Internal service calls, microservices | Public APIs, web applications |

### Selection Guide

- **Use JSON-RPC**: Internal microservice communication, integrating with existing JSON-RPC services, need unified call pattern
- **Use RESTful API**: Public APIs, need browser direct calls, need HTTP caching mechanism

## Important Notes

1. **Request ID**: The extension automatically generates incrementing integer IDs; no manual specification needed
2. **Version**: Fixed to JSON-RPC 2.0; version 1.0 is not supported
3. **CancellationToken**: Not serialized into RPC parameters; can be used to cancel HTTP requests
4. **Void Return**: If the RPC method has no return value, use `JsonRpcResult<object>` or `JsonRpcResult<JsonElement>`
