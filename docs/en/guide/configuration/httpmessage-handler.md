# HttpMessageHandler Configuration

> This document is machine translated and requires review.

HttpMessageHandler is the core component of HttpClient, used to handle HTTP requests and responses. By configuring HttpMessageHandler, you can implement advanced features such as proxy, certificates, and cookies.

## HTTP Proxy Configuration

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

## Client Certificate Configuration

Some servers enable HTTPS mutual authentication to restrict client connections, only allowing clients with specific certificates to connect:

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

## Maintaining CookieContainer Persistence

If the requested API uses cookies to store authentication information, you need to consider maintaining the CookieContainer instance so it doesn't follow the HttpMessageHandler lifecycle. The default HttpMessageHandler has a minimum lifecycle of only 2 minutes.

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

## Skip SSL Certificate Validation (Development Only)

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

::: warning Warning
Skipping SSL certificate validation should only be used in development environments. Production environments must use valid certificates.
:::

## Adding Custom DelegatingHandler

```csharp
services.AddHttpApi<IUserApi>()
    .AddHttpMessageHandler(() => new CustomDelegatingHandler());

public class CustomDelegatingHandler : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, 
        CancellationToken cancellationToken)
    {
        // Pre-request processing
        request.Headers.Add("X-Request-Id", Guid.NewGuid().ToString());
        
        var response = await base.SendAsync(request, cancellationToken);
        
        // Post-response processing
        return response;
    }
}
```

## Related Documentation

- [HttpClient Configuration](httpclient.md)
- [Cookie Auto Refresh](../advanced/cookie-auth.md)
