# JsonRpc 扩展

在极少数场景中，开发者可能遇到 JsonRpc 调用的接口，由于该协议不是很流行，WebApiClientCore 将该功能的支持作为 WebApiClientCore.Extensions.JsonRpc 扩展包提供。使用 `[JsonRpcMethod]` 修饰 Rpc 方法，使用 `[JsonRpcParam]` 修饰 Rpc 参数即可。

## JSON-RPC 2.0 协议简介

JSON-RPC 是一种轻量级的远程过程调用（RPC）协议，采用 JSON 作为数据格式。JSON-RPC 2.0 是当前主流版本，具有以下特点：

- **传输无关**：可在 TCP、HTTP 等多种传输协议上运行
- **单请求-单响应**：每个请求对应一个响应
- **批量调用**：支持一次发送多个请求
- **标准化错误**：定义了规范的错误码和错误信息格式

### 请求对象结构

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| jsonrpc | string | 是 | 固定为 "2.0" |
| method | string | 是 | 要调用的方法名 |
| params | array/object | 否 | 参数值 |
| id | string/number | 否 | 请求标识符（用于匹配响应） |

### 响应对象结构

**成功响应：**

| 字段 | 类型 | 说明 |
|------|------|------|
| jsonrpc | string | 固定为 "2.0" |
| result | any | 方法返回值 |
| id | string/number | 对应请求的 id |

**错误响应：**

| 字段 | 类型 | 说明 |
|------|------|------|
| jsonrpc | string | 固定为 "2.0" |
| error | object | 错误对象 |
| id | string/number | 对应请求的 id |

## 安装扩展包

```bash
dotnet add package WebApiClientCore.Extensions.JsonRpc
```

## JsonRpcMethodAttribute

`JsonRpcMethodAttribute` 用于标记接口方法为 JSON-RPC 调用，它继承自 `HttpPostAttribute` 并实现了 `IApiFilterAttribute`。

### 构造函数

| 构造函数 | 说明 |
|---------|------|
| `JsonRpcMethodAttribute()` | 使用方法名作为 RPC 方法名 |
| `JsonRpcMethodAttribute(string method)` | 指定 RPC 方法名 |
| `JsonRpcMethodAttribute(string method, string path)` | 指定 RPC 方法名和请求路径 |

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `ContentType` | string | `application/json-rpc` | 请求的 Content-Type |
| `ParamsStyle` | JsonRpcParamsStyle | `Array` | 参数序列化风格 |

### 工作原理

1. **OnRequestAsync**：初始化 `JsonRpcParameters` 容器
2. **IApiFilter.OnRequestAsync**：收集参数后构建 JSON-RPC 请求体
3. 方法名默认使用接口方法名，可通过构造函数指定

## JsonRpcParamAttribute

`JsonRpcParamAttribute` 用于标记方法参数为 JSON-RPC 参数。被标记的参数会被收集到参数列表中，最终序列化为 `params` 字段。

### 使用规则

- 必须与 `JsonRpcMethodAttribute` 配合使用
- 参数按声明顺序收集
- 未标记的参数（如 `CancellationToken`）不会参与 RPC 调用

## JsonRpcParamsStyle 参数风格

`JsonRpcParamsStyle` 枚举定义了参数序列化的三种模式：

### Array 模式（默认）

参数按位置序列化为数组：

```csharp
[JsonRpcMethod("add", ParamsStyle = JsonRpcParamsStyle.Array)]
ITask<JsonRpcResult<int>> AddAsync([JsonRpcParam] int a, [JsonRpcParam] int b);
```

生成的请求：
```json
{"jsonrpc":"2.0","method":"add","params":[1,2],"id":1}
```

### Object 模式

参数按名称序列化为对象：

```csharp
[JsonRpcMethod("getUser", ParamsStyle = JsonRpcParamsStyle.Object)]
ITask<JsonRpcResult<User>> GetUserAsync([JsonRpcParam] string name, [JsonRpcParam] int age);
```

生成的请求：
```json
{"jsonrpc":"2.0","method":"getUser","params":{"name":"张三","age":18},"id":2}
```

### 选择建议

| 模式 | 适用场景 |
|------|---------|
| Array | 服务端按位置解析参数，参数数量固定 |
| Object | 服务端按名称解析参数，参数可选或顺序不固定 |

## 响应处理：JsonRpcResult\<TResult\>

JSON-RPC 响应通过 `JsonRpcResult<TResult>` 泛型类接收：

```csharp
public class JsonRpcResult<TResult>
{
    /// <summary>
    /// 请求 id
    /// </summary>
    public int? Id { get; set; }

    /// <summary>
    /// json rpc 版本号
    /// </summary>
    public string JsonRpc { get; set; }

    /// <summary>
    /// 结果值（成功时）
    /// </summary>
    public TResult Result { get; set; }

    /// <summary>
    /// 错误内容（失败时）
    /// </summary>
    public JsonRpcError? Error { get; set; }
}
```

### 错误处理：JsonRpcError

```csharp
public class JsonRpcError
{
    /// <summary>
    /// 错误码
    /// </summary>
    public int Code { get; set; }

    /// <summary>
    /// 提示消息
    /// </summary>
    public string? Message { get; set; }

    /// <summary>
    /// 错误详情
    /// </summary>
    public object? Data { get; set; }
}
```

### 标准 JSON-RPC 错误码

| 错误码 | 含义 |
|--------|------|
| -32700 | 解析错误（Parse error） |
| -32600 | 无效请求（Invalid Request） |
| -32601 | 方法不存在（Method not found） |
| -32602 | 无效参数（Invalid params） |
| -32603 | 内部错误（Internal error） |
| -32000 ~ -32099 | 服务端自定义错误 |

## 完整示例

### 示例 1：基础调用

```csharp
// 定义用户模型
public class User
{
    public string Name { get; set; }
    public int Age { get; set; }
}

// 定义 RPC 接口
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

// 调用示例
var api = HttpApi.Create<IUserApi>();

// 添加用户
var addResult = await api.AddUserAsync("张三", 25);
if (addResult.Error == null)
{
    Console.WriteLine($"用户ID: {addResult.Result}");
}

// 获取用户
var getResult = await api.GetUserAsync(1);
if (getResult.Error == null)
{
    Console.WriteLine($"用户名: {getResult.Result.Name}");
}
```

### 示例 2：使用 Object 参数风格

```csharp
// 复杂查询场景，参数可选
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

// 调用示例
var api = HttpApi.Create<IOrderApi>();
var result = await api.QueryOrdersAsync("completed", DateTime.Today.AddDays(-7), null, 1, 20);

// 生成的请求体：
// {"jsonrpc":"2.0","method":"order.query","params":{"status":"completed","startDate":"2024-01-15T00:00:00","endDate":null,"page":1,"pageSize":20},"id":1}
```

### 示例 3：错误处理

```csharp
public static async Task<T?> SafeCallAsync<T>(ITask<JsonRpcResult<T>> task)
{
    var result = await task;
    
    if (result.Error != null)
    {
        Console.WriteLine($"RPC 错误: [{result.Error.Code}] {result.Error.Message}");
        if (result.Error.Data != null)
        {
            Console.WriteLine($"详细信息: {result.Error.Data}");
        }
        return default;
    }
    
    return result.Result;
}

// 使用示例
var api = HttpApi.Create<IUserApi>();
var user = await SafeCallAsync(api.GetUserAsync(999));

if (user != null)
{
    Console.WriteLine($"获取到用户: {user.Name}");
}
```

### 示例 4：自定义 Content-Type

某些服务端可能要求不同的 Content-Type：

```csharp
[HttpHost("http://localhost:5000/jsonrpc")]
public interface IEthereumApi
{
    [JsonRpcMethod("eth_getBalance", ContentType = "application/json")]
    ITask<JsonRpcResult<string>> GetBalanceAsync([JsonRpcParam] string address, [JsonRpcParam] string block);
}
```

### 示例 5：动态方法名

不指定方法名时，使用接口方法名作为 RPC 方法名：

```csharp
[HttpHost("http://localhost:5000/jsonrpc")]
public interface ISystemApi
{
    // RPC 方法名为 "GetServerTime"
    [JsonRpcMethod]
    ITask<JsonRpcResult<DateTime>> GetServerTimeAsync();

    // RPC 方法名为 "GetVersion"
    [JsonRpcMethod]
    ITask<JsonRpcResult<string>> GetVersionAsync();
}
```

## 请求包格式说明

### Array 参数风格

```http
POST /jsonrpc HTTP/1.1
Host: localhost:5000
Content-Type: application/json-rpc
Accept: application/json

{"jsonrpc":"2.0","method":"add","params":["laojiu",18],"id":1}
```

### Object 参数风格

```http
POST /jsonrpc HTTP/1.1
Host: localhost:5000
Content-Type: application/json-rpc
Accept: application/json

{"jsonrpc":"2.0","method":"query","params":{"name":"张三","age":18},"id":2}
```

## 响应包格式说明

### 成功响应

```json
{"jsonrpc":"2.0","result":{"name":"张三","age":18},"id":1}
```

### 错误响应

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": "参数 age 必须大于 0"
  },
  "id": 1
}
```

## 批量调用说明

JSON-RPC 2.0 协议支持批量调用，但目前 WebApiClientCore.Extensions.JsonRpc 扩展**不直接支持批量调用**。如需批量调用，可以通过以下方式实现：

### 方案 1：并行发送多个请求

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
        Console.WriteLine($"用户: {result.Result.Name}");
    }
}
```

### 方案 2：自定义批量请求

如果服务端支持批量请求，可以手动构建请求体：

```csharp
// 定义批量响应模型
public class JsonRpcBatchItem<T>
{
    public int Id { get; set; }
    public T? Result { get; set; }
    public JsonRpcError? Error { get; set; }
}

// 发送批量请求
var batchRequest = new[]
{
    new { jsonrpc = "2.0", method = "user.get", @params = new[] { 1 }, id = 1 },
    new { jsonrpc = "2.0", method = "user.get", @params = new[] { 2 }, id = 2 }
};

// 使用普通 HTTP 接口发送
[HttpHost("http://localhost:5000/jsonrpc")]
public interface IBatchApi
{
    [HttpPost]
    [JsonContent]
    ITask<List<JsonRpcBatchItem<User>>> BatchAsync([JsonContent] object[] requests);
}
```

## 与标准 HTTP API 的对比

| 特性 | JSON-RPC | RESTful API |
|------|----------|-------------|
| 调用方式 | 方法名 + 参数 | HTTP 方法 + URL 路径 |
| 传输协议 | 传输无关（通常 HTTP POST） | HTTP |
| 请求格式 | 标准化的 JSON 结构 | 多种格式（JSON、XML、Form 等） |
| 响应格式 | 统一的 result/error 结构 | HTTP 状态码 + 响应体 |
| 批量操作 | 原生支持 | 需自行设计 |
| 错误处理 | 标准错误码结构 | HTTP 状态码 |
| 缓存 | 不支持 | 支持（GET 请求） |
| 浏览器调用 | 需要库支持 | 原生支持 |
| 适用场景 | 内部服务调用、微服务 | 公开 API、Web 应用 |

### 选择建议

- **使用 JSON-RPC**：内部微服务通信、已有 JSON-RPC 服务对接、需要统一的调用模式
- **使用 RESTful API**：公开 API、需要浏览器直接调用、需要利用 HTTP 缓存机制

## 注意事项

1. **请求 ID**：扩展自动生成递增的整数 ID，无需手动指定
2. **版本号**：固定为 JSON-RPC 2.0，不支持 1.0 版本
3. **CancellationToken**：不会被序列化到 RPC 参数中，可用于取消 HTTP 请求
4. **空返回值**：如果 RPC 方法无返回值，可使用 `JsonRpcResult<object>` 或 `JsonRpcResult<JsonElement>`
