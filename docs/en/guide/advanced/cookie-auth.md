# Cookie Auto-Refresh

For APIs that use Cookie-based authentication, Cookie expiration is typically detected only after a request fails. By implementing a custom `CookieAuthorizationHandler`, you can automatically refresh expired cookies during a request and retry the API call.

## Separating the Login Interface

First, separate the login interface from other business interfaces:

```csharp
[HttpHost("http://localhost:5000/")]
public interface IUserLoginApi
{
    [HttpPost("/users/login")]
    Task<HttpResponseMessage> LoginAsync([JsonContent] LoginRequest request);
}
```

## Implementing the Auto-Refresh Handler

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

## Registration and Configuration

```csharp
// Register login interface
services.AddHttpApi<IUserLoginApi>();

// Register business interface and configure Handler
services
    .AddHttpApi<IUserApi>()
    .AddHttpMessageHandler(sp => new AutoRefreshCookieHandler(
        sp.GetRequiredService<IUserLoginApi>()));
```

Now, when calling any method on `IUserApi`, if the response status code is 401, the handler will trigger `IUserLoginApi.LoginAsync()`, retry the request with the newly obtained cookie, and return the result.

## Custom Unauthorized Detection

By default, refresh is triggered when the response status code is 401. Override the `IsUnauthorizedAsync` method to customize the detection logic:

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
        // Custom detection logic: check status code
        if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            return Task.FromResult(true);

        // Also check custom headers
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

## Reading Credentials from Configuration

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

## Related Documentation

- [HttpMessageHandler Configuration](../configuration/httpmessage-handler.md)
- [Exception Handling](../configuration/exception-handling.md)
