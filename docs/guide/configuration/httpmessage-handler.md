# HttpMessageHandler 配置

HttpMessageHandler 是 HttpClient 的核心组件，用于处理 HTTP 请求和响应。通过配置 HttpMessageHandler，可以实现代理、证书、Cookie 等高级功能。

## Http 代理配置

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.HttpHost = new Uri("http://localhost:5000/");
})
.ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
{
    UseProxy = true,
    Proxy = new WebProxy
    {
        Address = new Uri("http://proxy.com"),
        Credentials = new NetworkCredential
        {
            UserName = "username",
            Password = "password"
        }
    }
});
```

## 客户端证书配置

有些服务器为了限制客户端的连接，开启了 HTTPS 双向验证，只允许持有特定证书的客户端进行连接：

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.HttpHost = new Uri("https://localhost:5001/");
})
.ConfigurePrimaryHttpMessageHandler(() =>
{
    var handler = new HttpClientHandler();
    handler.ClientCertificates.Add(yourCert);
    return handler;
});
```

## 维持 CookieContainer 不变

如果请求的接口使用了 Cookie 保存身份信息机制，那么就要考虑维持 CookieContainer 实例不要跟随 HttpMessageHandler 的生命周期。默认的 HttpMessageHandler 最短只有 2 分钟的生命周期。

```csharp
var cookieContainer = new CookieContainer();

services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.HttpHost = new Uri("http://localhost:5000/");
})
.ConfigurePrimaryHttpMessageHandler(() =>
{
    var handler = new HttpClientHandler();
    handler.CookieContainer = cookieContainer;
    return handler;
});
```

## 跳过 SSL 证书验证（仅开发环境）

```csharp
services.AddHttpApi<IUserApi>().ConfigurePrimaryHttpMessageHandler(() =>
{
    var handler = new HttpClientHandler
    {
        ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
    };
    return handler;
});
```

::: warning 警告
跳过 SSL 证书验证仅应在开发环境中使用，生产环境必须使用有效证书。
:::

## 添加自定义 DelegatingHandler

```csharp
services.AddHttpApi<IUserApi>()
    .AddHttpMessageHandler(() => new CustomDelegatingHandler());

public class CustomDelegatingHandler : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, 
        CancellationToken cancellationToken)
    {
        // 请求前处理
        request.Headers.Add("X-Request-Id", Guid.NewGuid().ToString());
        
        var response = await base.SendAsync(request, cancellationToken);
        
        // 响应后处理
        return response;
    }
}
```

## 相关文档

- [HttpClient 配置](httpclient.md)
- [Cookie 自动刷新](../advanced/cookie-auth.md)
