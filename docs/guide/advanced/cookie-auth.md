# Cookie 自动刷新

对于使用 Cookie 机制的接口，只有在接口请求之后，才知道 Cookie 是否已失效。通过自定义 `CookieAuthorizationHandler`，可以在请求某个接口过程中，遇到 Cookie 失效时自动刷新 Cookie 再重试请求接口。

## 分离登录接口

首先，我们需要把登录接口与其他业务接口拆分在不同的接口定义：

```csharp
[HttpHost("http://localhost:5000/")]
public interface IUserLoginApi
{
    [HttpPost("/users/login")]
    Task<HttpResponseMessage> LoginAsync([JsonContent] LoginRequest request);
}
```

## 实现自动刷新 Handler

```csharp
public class AutoRefreshCookieHandler : CookieAuthorizationHandler
{
    private readonly IUserLoginApi _loginApi;

    public AutoRefreshCookieHandler(IUserLoginApi loginApi)
    {
        _loginApi = loginApi;
    }

    protected override Task<HttpResponseMessage> RefreshCookieAsync()
    {
        return _loginApi.LoginAsync(new LoginRequest
        {
            Username = "admin",
            Password = "123456"
        });
    }
}
```

## 注册和配置

```csharp
// 注册登录接口
services.AddHttpApi<IUserLoginApi>();

// 注册业务接口并配置 Handler
services
    .AddHttpApi<IUserApi>()
    .AddHttpMessageHandler(sp => new AutoRefreshCookieHandler(
        sp.GetRequiredService<IUserLoginApi>()));
```

现在，调用 `IUserApi` 的任意接口，只要响应的状态码为 401，就触发 `IUserLoginApi` 登录，然后将登录得到的 Cookie 来重试请求接口，最终响应为正确的结果。

## 自定义未授权判断

默认情况下，响应状态码为 401 时触发刷新。可以重写 `IsUnauthorizedAsync` 方法来自定义判断逻辑：

```csharp
public class CustomCookieHandler : CookieAuthorizationHandler
{
    private readonly IUserLoginApi _loginApi;

    public CustomCookieHandler(IUserLoginApi loginApi)
    {
        _loginApi = loginApi;
    }

    protected override Task<bool> IsUnauthorizedAsync(HttpResponseMessage response)
    {
        // 自定义判断逻辑
        if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            return Task.FromResult(true);

        // 也可以根据响应内容判断
        if (response.Headers.Contains("X-Session-Expired"))
            return Task.FromResult(true);

        return Task.FromResult(false);
    }

    protected override Task<HttpResponseMessage> RefreshCookieAsync()
    {
        return _loginApi.LoginAsync(new LoginRequest
        {
            Username = "admin",
            Password = "123456"
        });
    }
}
```

## 从配置读取凭据

```csharp
public class ConfigurableCookieHandler : CookieAuthorizationHandler
{
    private readonly IUserLoginApi _loginApi;
    private readonly IConfiguration _config;

    public ConfigurableCookieHandler(
        IUserLoginApi loginApi,
        IConfiguration config)
    {
        _loginApi = loginApi;
        _config = config;
    }

    protected override Task<HttpResponseMessage> RefreshCookieAsync()
    {
        return _loginApi.LoginAsync(new LoginRequest
        {
            Username = _config["Api:Username"],
            Password = _config["Api:Password"]
        });
    }
}
```

## 相关文档

- [HttpMessageHandler 配置](../configuration/httpmessage-handler.md)
- [异常处理](../configuration/exception-handling.md)
