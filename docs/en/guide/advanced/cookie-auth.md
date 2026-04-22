> This document is machine translated and requires review.

# Cookie Auto-Refresh

For APIs that use Cookie-based authentication, you only know if the Cookie has expired after making a request. By implementing a custom `CookieAuthorizationHandler`, you can automatically refresh the Cookie when it expires during a request and retry the API call.

## Separate Login Interface

First, we need to separate the login interface from other business interfaces into different interface definitions:

```csharp
[HttpHost("http://localhost:5000/")]
public interface IUserLoginApi
{
    [HttpPost("/users/login")]
    Task<HttpResponseMessage> LoginAsync([JsonContent] LoginRequest request);
}
```

## Implementing Auto-Refresh Handler

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

Now, when calling any method on `IUserApi`, if the response status code is 401, it will trigger `IUserLoginApi` login, then retry the request with the newly obtained Cookie, and finally return the correct result.

## Custom Unauthorized Detection

By default, refresh is triggered when the response status code is 401. You can override the `IsUnauthorizedAsync` method to customize the detection logic:

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
        // Custom detection logic
        if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            return Task.FromResult(true);

        // Can also check response content
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
