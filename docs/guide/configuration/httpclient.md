# HttpClient 配置

这部分是 [HttpClient Factory](https://learn.microsoft.com/zh-cn/dotnet/core/extensions/httpclient-factory) 的内容，WebApiClientCore 完全支持 HttpClient 的各种配置。

## 基础配置

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpClient(httpClient =>
{
    httpClient.Timeout = TimeSpan.FromMinutes(1d);
    httpClient.DefaultRequestVersion = HttpVersion.Version20;
    httpClient.DefaultVersionPolicy = HttpVersionPolicy.RequestVersionOrLower;
});
```

## 常用配置项

| 配置项 | 说明 |
|--------|------|
| `Timeout` | 请求超时时间 |
| `DefaultRequestVersion` | 默认 HTTP 版本 |
| `DefaultVersionPolicy` | HTTP 版本协商策略 |
| `BaseAddress` | 基础地址（可替代 HttpHost 特性） |
| `DefaultRequestHeaders` | 默认请求头 |

## 配置请求头

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpClient(httpClient =>
{
    httpClient.DefaultRequestHeaders.Add("X-Custom-Header", "value");
    httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("MyApp/1.0");
});
```

## 共享 HttpClient 配置

如果多个接口需要共享相同的 HttpClient 配置（如 BaseAddress、默认请求头等），可以在注册时统一配置：

```csharp
// 统一配置多个接口
services.AddHttpApi<IUserApi>().ConfigureHttpClient(httpClient =>
{
    httpClient.BaseAddress = new Uri("http://api.example.com/");
    httpClient.Timeout = TimeSpan.FromSeconds(30);
});

services.AddHttpApi<IOrderApi>().ConfigureHttpClient(httpClient =>
{
    httpClient.BaseAddress = new Uri("http://api.example.com/");
    httpClient.Timeout = TimeSpan.FromSeconds(30);
});
```

> 提示：对于复杂的共享配置场景，建议封装为扩展方法或使用配置中心统一管理。

## 类型化 HttpClient

```csharp
services.AddHttpApi<IOrderApi>().ConfigureHttpClient((sp, client) =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    client.BaseAddress = new Uri(config["ApiSettings:OrderApi:BaseUrl"]);
});
```

## 相关文档

- [HttpMessageHandler 配置](../configuration/httpmessage-handler.md)
- [全局过滤器](../configuration/global-filters.md)
