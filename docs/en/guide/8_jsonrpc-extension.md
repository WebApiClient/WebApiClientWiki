# JsonRpc Extension

In rare scenarios, developers may encounter interfaces for JsonRpc calls. Since this protocol is not very popular, WebApiClientCore provides support for this functionality through the WebApiClientCore.Extensions.JsonRpc extension package. Simply decorate the Rpc methods with [JsonRpcMethod] and the Rpc parameters with [JsonRpcParam].

## JsonRpc Declaration

```csharp
[HttpHost("http://localhost:5000/jsonrpc")]
public interface IUserApi
{
    [JsonRpcMethod("add")]
    ITask<JsonRpcResult<User>> AddAsync([JsonRpcParam] string name, [JsonRpcParam] int age, CancellationToken token = default);
}
```

## JsonRpc Data Packet

```log

POST /jsonrpc HTTP/1.1
Host: localhost:5000
User-Agent: WebApiClientCore/1.0.6.0
Accept: application/json; q=0.01, application/xml; q=0.01
Content-Type: application/json-rpc

{"jsonrpc":"2.0","method":"add","params":["laojiu",18],"id":1}
```
