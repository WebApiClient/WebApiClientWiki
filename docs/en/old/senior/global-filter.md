# 2. Global Filters

Global filters have a higher execution priority than non-global filters and affect all request methods. They require implementing the `IApiActionFilter` interface and instantiating them to be added to `HttpApiConfig`'s GlobalFilters. General filters like `[TraceFilter]` also implement the `IApiActionFilter` interface and can be added to `GlobalFilters` as global filters.

## 2.1 Custom Global Filters

```csharp
class MyGlobalFilter : IApiActionFilter
{
    public Task OnBeginRequestAsync(ApiActionContext context)
    {
        // do something
        return Task.CompletedTask;
    }

    public Task OnEndRequestAsync(ApiActionContext context)
    {
        // do something
        return Task.CompletedTask;
    }
}
```

Adding to GlobalFilters

```csharp
var myFilter = new MyGlobalFilter();
HttpApi.Register<IUserApi>().ConfigureHttpApiConfig(c =>
{
    c.GlobalFilters.Add(myFilter);
});
```

## 2.2 Custom OAuth2 Global Filter

```csharp
/// <summary>
/// Represents a token filter that provides client_credentials authentication.
/// </summary>
public class TokenFilter : AuthTokenFilter
{
    /// <summary>
    /// Gets the URL endpoint for obtaining the token.
    /// </summary>
    public string TokenEndpoint { get; private set; }

    /// <summary>
    /// Gets the client_id.
    /// </summary>
    public string ClientId { get; private set; }

    /// <summary>
    /// Gets the client_secret.
    /// </summary>
    public string ClientSecret { get; private set; }

    /// <summary>
    /// OAuth token filter for authorization.
    /// </summary>
    /// <param name="tokenEndPoint">The URL endpoint for obtaining the token.</param>
    /// <param name="client_id">The client ID.</param>
    /// <param name="client_secret">The client secret.</param>
    public TokenFilter(string tokenEndPoint, string client_id, string client_secret)
    {
        this.TokenEndpoint = tokenEndPoint ?? throw new ArgumentNullException(nameof(tokenEndPoint));
        this.ClientId = client_id ?? throw new ArgumentNullException(nameof(client_id));
        this.ClientSecret = client_secret ?? throw new ArgumentNullException(nameof(client_secret));
    }

    /// <summary>
    /// Requests the token.
    /// TokenClient can be used for the request.
    /// </summary>
    /// <returns></returns>
    protected override async Task<TokenResult> RequestTokenResultAsync()
    {
        var tokenClient = new TokenClient(this.TokenEndpoint);
        return await tokenClient.RequestClientCredentialsAsync(this.ClientId, this.ClientSecret);
    }

    /// <summary>
    /// Requests the refresh token.
    /// TokenClient can be used for the refresh.
    /// </summary>
    /// <param name="refresh_token">The refresh token returned when obtaining the token.</param>
    /// <returns></returns>
    protected override async Task<TokenResult> RequestRefreshTokenAsync(string refresh_token)
    {
        var tokenClient = new TokenClient(this.TokenEndpoint);
        return await tokenClient.RequestRefreshTokenAsync(this.ClientId, this.ClientSecret, refresh_token);
    }
}
```

Adding to GlobalFilters

```csharp
var tokenFilter = new TokenFilter("http://localhost/tokenEndpoint", "client", "secret");
HttpApi.Register<IUserApi>().ConfigureHttpApiConfig(c =>
{
    c.GlobalFilters.Add(tokenFilter);
});
```
