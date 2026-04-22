# HttpClient Configuration

> This document is machine translated and requires review.

This section covers [HttpClient Factory](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory) content, WebApiClientCore fully supports various HttpClient configurations.

## Basic Configuration

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpClient(httpClient =>
{
    httpClient.Timeout = TimeSpan.FromMinutes(1d);
    httpClient.DefaultRequestVersion = HttpVersion.Version20;
    httpClient.DefaultVersionPolicy = HttpVersionPolicy.RequestVersionOrLower;
});
```

## Common Configuration Options

| Configuration | Description |
|---------------|-------------|
| `Timeout` | Request timeout duration |
| `DefaultRequestVersion` | Default HTTP version |
| `DefaultVersionPolicy` | HTTP version negotiation policy |
| `BaseAddress` | Base address (can replace HttpHost attribute) |
| `DefaultRequestHeaders` | Default request headers |

## Configuring Request Headers

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpClient(httpClient =>
{
    httpClient.DefaultRequestHeaders.Add("X-Custom-Header", "value");
    httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("MyApp/1.0");
});
```

## Named HttpClient Configuration

If multiple interfaces need to share configuration, you can use named HttpClient:

```csharp
services.AddHttpClient("MyApi", client =>
{
    client.BaseAddress = new Uri("http://api.example.com/");
    client.Timeout = TimeSpan.FromSeconds(30);
});

services.AddHttpApi<IUserApi>().ConfigureHttpClient("MyApi");
```

## Typed HttpClient

```csharp
services.AddHttpApi<IOrderApi>().ConfigureHttpClient((sp, client) =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    client.BaseAddress = new Uri(config["ApiSettings:OrderApi:BaseUrl"]);
});
```

## Related Documentation

- [HttpMessageHandler Configuration](../configuration/httpmessage-handler.md)
- [Global Filters](../configuration/global-filters.md)
