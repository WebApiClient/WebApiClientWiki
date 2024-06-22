# OAuths & Token Extension

With the WebApiClientCore.Extensions.OAuths extension, it is easy to support token acquisition, refresh, and application.

## Objects and Concepts

### ITokenProviderFactory

The factory for creating ITokenProvider, providing the ability to get or create ITokenProvider through the HttpApi interface type.

### ITokenProvider

The token provider used to obtain tokens. It triggers a re-request or token refresh in the first request after the token expires.

### OAuthTokenAttribute

The attribute for applying tokens. It creates an ITokenProvider using the ITokenProviderFactory, then uses the ITokenProvider to obtain the token, and finally applies the token to the request message.

### OAuthTokenHandler

A HTTP message handler that functions similarly to OAuthTokenAttribute. In addition, if the server still returns unauthorized (401 status code) due to unexpected reasons, it will discard the old token and request a new token to retry the request.

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

#### Using the OAuthToken attribute

OAuthTokenAttribute belongs to the WebApiClientCore framework layer, making it easy to manipulate request content and response models. For example, it is convenient to add the token as a form field to an existing request form or read the corresponding business model after deserializing the response message. However, it cannot implement the effect of retrying requests within the request when the token is lost after the server issues the token. Using OAuthTokenAttribute will result in a failed request that cannot be avoided.

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

The default implementation of OAuthTokenAttribute puts the token in the Authorization request header. If your interface needs to put the token in another place, such as the query of the URI, you need to override OAuthTokenAttribute:

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

The strength of OAuthTokenHandler is its support for multiple attempts within a single request. After the server issues the token, if the server loses the token, OAuthTokenHandler will discard and re-request the token within the same request when it receives a 401 status code. It will use the new token to retry the request, making it appear as a normal request. However, OAuthTokenHandler is not an object of the WebApiClientCore framework layer. It can only access the original HttpRequestMessage and HttpResponseMessage. If you need to append the token to the Content of the HttpRequestMessage, it is very difficult. Similarly, if you want to use a field in the HttpResponseMessage's Content corresponding to the business model as the basis for determining the token's validity instead of using HTTP status codes (such as 401), it is also a challenging task.

```csharp
// Register OAuthTokenHandler when registering the interface
services
    .AddHttpApi<IUserApi>()
    .AddOAuthTokenHandler();
```

The default implementation of OAuthTokenHandler puts the token in the Authorization request header. If your interface needs to put the token in another place, such as the query of the URI, you need to override OAuthTokenHandler:

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

You can set a base interface for the HTTP interface and configure the TokenProvider for the base interface. For example, the xxx and yyy interfaces below both belong to IBaidu, and you only need to configure the TokenProvider for IBaidu.

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
// Register and configure the token provider for the password mode
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

The extension package already includes two standard token request modes: OAuth Client and Password. However, there are still many interface providers that only embody the spirit of OAuth in their implementation. In this case, you need to customize the TokenProvider. Assuming the interface provider's token request interface is as follows:

```csharp
public interface ITokenApi
{
    [HttpPost("http://xxx.com/token")]
    Task<TokenResult> RequestTokenAsync([Parameter(Kind.Form)] string clientId, [Parameter(Kind.Form)] string clientSecret);
}
```

### Delegate TokenProvider

Delegate TokenProvider is the simplest implementation. It uses the delegate for requesting the token as the implementation logic of the custom TokenProvider:

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

Each TokenProvider has a Name property, which is the same value as the Name of the ITokenProviderBuilder returned by service.AddTokenProvider(). You can use the GetOptionsValue() method of TokenProvider to read the Options value, and configure the Options using the Name of ITokenProviderBuilder.
