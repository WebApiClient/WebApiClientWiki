# HttpClient Configuration

This section covers [HttpClient Factory](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory) integration. WebApiClientCore fully supports all HttpClient configuration options.

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

## Shared HttpClient Configuration

If multiple interfaces need to share the same HttpClient configuration (such as BaseAddress, default headers, etc.), you can configure them uniformly during registration:

```csharp
// Unified configuration for multiple interfaces
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

> Tip: For complex shared configuration scenarios, consider encapsulating as extension methods or using a configuration center for unified management.

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
