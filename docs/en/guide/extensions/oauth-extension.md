# OAuth & Token Extension

The WebApiClientCore.Extensions.OAuths extension makes it easy to support token acquisition, refresh, and application.

## Objects and Concepts

### ITokenProviderFactory

A factory for creating `ITokenProvider` instances, providing the ability to get or create an `ITokenProvider` based on the HttpApi interface type.

### ITokenProvider

A token provider used to obtain tokens. It triggers a token re-request or refresh on the first request after the token expires.

### OAuthTokenAttribute

An attribute for applying tokens. It creates an `ITokenProvider` using `ITokenProviderFactory`, then uses the `ITokenProvider` to obtain the token, and finally applies the token to the request message.

### OAuthTokenHandler

An HTTP message handler that functions similarly to `OAuthTokenAttribute`. Additionally, if the server returns an unauthorized response (401 status code) for unexpected reasons, it discards the old token, requests a new one, and retries the request.

## OAuth Client Mode

### Register TokenProvider for the Interface

```csharp
// Register and configure the tokenProvider for the interface in client mode
services.AddClientCredentialsTokenProvider<IUserApi>(o =>
{
    o.Endpoint = new Uri("http://localhost:6000/api/tokens");
    o.Credentials.Client_id = "clientId";
    o.Credentials.Client_secret = "xxyyzz";
});
```

### Applying the Token

#### Using OAuthTokenAttribute

`OAuthTokenAttribute` belongs to the WebApiClientCore framework layer, making it easy to manipulate request content and response models. For example, you can conveniently add the token as a form field to an existing request form, or read the corresponding business model after deserializing the response message. However, it cannot retry requests within the same call if the token becomes invalid after the server issues it. Using `OAuthTokenAttribute` will result in a failed request that cannot be avoided.

```csharp
/// <summary>
/// User operation interface
/// </summary>
[OAuthToken]
public interface IUserApi
{
    ...
}
```

The default implementation of `OAuthTokenAttribute` places the token in the `Authorization` request header. If your interface needs to place the token elsewhere, such as in the URI query string, you need to override `OAuthTokenAttribute`:

```csharp
public class UriQueryTokenAttribute : OAuthTokenAttribute
{
    protected override void UseTokenResult(ApiRequestContext context, TokenResult tokenResult)
    {
        context.HttpContext.RequestMessage.AddUrlQuery("mytoken", tokenResult.Access_token);
    }
}

[UriQueryToken]
public interface IUserApi
{
    ...
}
```

#### Using OAuthTokenHandler

The strength of `OAuthTokenHandler` is its support for multiple retry attempts within a single request. If the server returns a 401 status code after issuing the token, `OAuthTokenHandler` discards the old token, requests a new one, and retries the request within the same call, making it appear as a normal request. However, `OAuthTokenHandler` is not part of the WebApiClientCore framework layer. It can only access the original `HttpRequestMessage` and `HttpResponseMessage`. Appending the token to the `HttpRequestMessage.Content` is difficult. Similarly, using a field from `HttpResponseMessage.Content` corresponding to the business model as the basis for determining token validity instead of HTTP status codes (such as 401) is also challenging.

```csharp
// Register OAuthTokenHandler when registering the interface
services
    .AddHttpApi<IUserApi>()
    .AddOAuthTokenHandler();
```

The default implementation of `OAuthTokenHandler` places the token in the `Authorization` request header. If your interface needs to place the token elsewhere, such as in the URI query string, you need to override `OAuthTokenHandler`:

```csharp
public class UriQueryOAuthTokenHandler : OAuthTokenHandler
{
    /// <summary>
    /// HTTP message handler for applying tokens
    /// </summary>
    /// <param name="tokenProvider">Token provider</param>
    public UriQueryOAuthTokenHandler(ITokenProvider tokenProvider)
        : base(tokenProvider)
    {
    }

    /// <summary>
    /// Apply the token
    /// </summary>
    /// <param name="request"></param>
    /// <param name="tokenResult"></param>
    protected override void UseTokenResult(HttpRequestMessage request, TokenResult tokenResult)
    {
        // var builder = new UriBuilder(request.RequestUri);
        // builder.Query += "mytoken=" + Uri.EscapeDataString(tokenResult.Access_token);
        // request.RequestUri = builder.Uri;

        var uriValue = new UriValue(request.RequestUri);
        uriValue = uriValue.AddQuery("myToken", tokenResult.Access_token);
        request.RequestUri = uriValue.ToUri();
    }
}


// Register UriQueryOAuthTokenHandler when registering the interface
services
    .AddHttpApi<IUserApi>()
    .AddOAuthTokenHandler((s, tp) => new UriQueryOAuthTokenHandler(tp));
```

## TokenProvider Shared by Multiple Interfaces

You can define a base interface for HTTP interfaces and configure the `TokenProvider` for the base interface. For example, the `IBaidu_XXX_Api` and `IBaidu_YYY_Api` interfaces below both inherit from `IBaidu`, so you only need to configure the `TokenProvider` for `IBaidu`.

```csharp
[OAuthToken]
public interface IBaidu
{
}

public interface IBaidu_XXX_Api : IBaidu
{
    [HttpGet]
    Task xxxAsync();
}

public interface IBaidu_YYY_Api : IBaidu
{
    [HttpGet]
    Task yyyAsync();
}
```

```csharp
// Register and configure the token provider for password mode
services.AddPasswordCredentialsTokenProvider<IBaidu>(o =>
{
    o.Endpoint = new Uri("http://localhost:5000/api/tokens");
    o.Credentials.Client_id = "clientId";
    o.Credentials.Client_secret = "xxyyzz";
    o.Credentials.Username = "username";
    o.Credentials.Password = "password";
});
```

## Custom TokenProvider

The extension package includes two standard token request modes: OAuth Client and Password. However, many interface providers only loosely follow the OAuth spirit in their implementation. In such cases, you need to customize the `TokenProvider`. Assuming the interface provider's token request interface is as follows:

```csharp
public interface ITokenApi
{
    [HttpPost("http://xxx.com/token")]
    Task<TokenResult> RequestTokenAsync([Parameter(Kind.Form)] string clientId, [Parameter(Kind.Form)] string clientSecret);
}
```

### Delegate TokenProvider

Delegate `TokenProvider` is the simplest implementation. It uses a delegate for requesting the token as the implementation logic of the custom `TokenProvider`:

```csharp
// Register a custom tokenProvider for the interface
services.AddTokenProvider<IUserApi>(s =>
{
    return s.GetRequiredService<ITokenApi>().RequestTokenAsync("id", "secret");
});
```

### Full Implementation of TokenProvider

```csharp
// Register CustomTokenProvider for the interface
services.AddTokenProvider<IUserApi, CustomTokenProvider>();
```

```csharp
public class CustomTokenProvider : TokenProvider
{
    public CustomTokenProvider(IServiceProvider serviceProvider)
        : base(serviceProvider)
    {
    }

    protected override Task<TokenResult> RequestTokenAsync(IServiceProvider serviceProvider)
    {
        return serviceProvider.GetRequiredService<ITokenApi>().RequestTokenAsync("id", "secret");
    }

    protected override Task<TokenResult> RefreshTokenAsync(IServiceProvider serviceProvider, string refresh_token)
    {
        return this.RequestTokenAsync(serviceProvider);
    }
}
```

### Options for Custom TokenProvider

Each `TokenProvider` has a `Name` property, which is the same value as the `Name` of the `ITokenProviderBuilder` returned by `service.AddTokenProvider()`. You can use the `GetOptionsValue()` method of `TokenProvider` to read the Options value, and configure the Options using the `Name` of `ITokenProviderBuilder`.
