# HttpMessageHandler 配置

## Http 代理配置

```csharp
services
    .AddHttpApi<IUserApi>(o =>
    {
        o.HttpHost = new Uri("http://localhost:6000/");
    })
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
    {
        UseProxy = true,
        Proxy = new WebProxy
        {
            Address = new Uri("http://proxy.com"),
            Credentials = new NetworkCredential
            {
                UserName = "useranme",
                Password = "pasword"
            }
        }
    });
```

## 客户端证书配置

有些服务器为了限制客户端的连接，开启了 https 双向验证，只允许它执有它颁发的证书的客户端进行连接

```csharp
services
    .AddHttpApi<IUserApi>(o =>
    {
        o.HttpHost = new Uri("http://localhost:6000/");
    })
    .ConfigurePrimaryHttpMessageHandler(() =>
    {
        var handler = new HttpClientHandler();
        handler.ClientCertificates.Add(yourCert);
        return handler;
    });
```

## 维持 CookieContainer 不变

如果请求的接口不幸使用了 Cookie 保存身份信息机制，那么就要考虑维持 CookieContainer 实例不要跟随 HttpMessageHandler 的生命周期，默认的 HttpMessageHandler 最短只有 2 分钟的生命周期。

```csharp
var cookieContainer = new CookieContainer();
services
    .AddHttpApi<IUserApi>(o =>
    {
        o.HttpHost = new Uri("http://localhost:6000/");
    })
    .ConfigurePrimaryHttpMessageHandler(() =>
    {
        var handler = new HttpClientHandler();
        handler.CookieContainer = cookieContainer;
        return handler;
    });
```

## Cookie 过期自动刷新

对于使用 Cookie 机制的接口，只有在接口请求之后，才知道 Cookie 是否已失效。通过自定义 CookieAuthorizationHandler，可以做在请求某个接口过程中，遇到 Cookie 失效时自动刷新 Cookie 再重试请求接口。

首先，我们需要把登录接口与某它业务接口拆分在不同的接口定义，例如 IUserApi 和 IUserLoginApi

```csharp
[HttpHost("http://localhost:5000/")]
public interface IUserLoginApi
{
    [HttpPost("/users")]
    Task<HttpResponseMessage> LoginAsync([JsonContent] Account account);
}
```

然后实现自动登录的 CookieAuthorizationHandler

```csharp
public class AutoRefreshCookieHandler : CookieAuthorizationHandler
{
    private readonly IUserLoginApi api;

    public AutoRefreshCookieHandler(IUserLoginApi api)
    {
        this.api = api;
    }

    /// <summary>
    /// 登录并刷新Cookie
    /// </summary>
    /// <returns>返回登录响应消息</returns>
    protected override Task<HttpResponseMessage> RefreshCookieAsync()
    {
        return this.api.LoginAsync(new Account
        {
            account = "admin",
            password = "123456"
        });
    }
}
```

最后，注册 IUserApi、IUserLoginApi，并为 IUserApi 配置 AutoRefreshCookieHandler

```csharp
services
    .AddHttpApi<IUserLoginApi>();

services
    .AddHttpApi<IUserApi>()
    .AddHttpMessageHandler(s => new AutoRefreshCookieHandler(s.GetService<IUserLoginApi>()));
```

现在，调用 IUserApi 的任意接口，只要响应的状态码为 401，就触发 IUserLoginApi 登录，然后将登录得到的 cookie 来重试请求接口，最终响应为正确的结果。你也可以重写 CookieAuthorizationHandler 的 IsUnauthorizedAsync(HttpResponseMessage)方法来指示响应是未授权状态。
