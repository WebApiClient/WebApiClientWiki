# Request Signature

Some APIs require request signing to ensure request authenticity and integrity.

## Dynamically Appending Request Signature

For example, if each request URI needs a dynamically added query parameter named `sign`, and this value depends on request parameters and must be calculated each time, you can create a custom subclass of `ApiFilterAttribute`:

```csharp
public class SignFilterAttribute : ApiFilterAttribute
{
    public override Task OnRequestAsync(ApiRequestContext context)
    {
        var signService = context.HttpContext.ServiceProvider.GetRequiredService<SignService>();
        var sign = signService.SignValue(DateTime.Now);
        context.HttpContext.RequestMessage.AddUrlQuery("sign", sign);
        return Task.CompletedTask;
    }
}

[SignFilter]
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

## Request Form Field Sorting

Some signature algorithms require form fields to be sorted in a specific order:

```csharp
public interface IUserApi
{
    [HttpPost("/api/submit")]
    Task<HttpResponseMessage> SubmitAsync([SortedFormContent] Model model);
}

public class SortedFormContentAttribute : FormContentAttribute
{
    protected override IEnumerable<KeyValue> SerializeToKeyValues(ApiParameterContext context)
    {
        // Sorting, adding derived fields, etc.
        return base.SerializeToKeyValues(context).OrderBy(item => item.Key);
    }
}
```

## Complete Signature Example

```csharp
public class ApiSignAttribute : ApiFilterAttribute
{
    private readonly string _appId;
    private readonly string _appSecret;

    public ApiSignAttribute(string appId, string appSecret)
    {
        _appId = appId;
        _appSecret = appSecret;
    }

    public override Task OnRequestAsync(ApiRequestContext context)
    {
        var request = context.HttpContext.RequestMessage;
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        
        // Build signature string
        var signContent = BuildSignContent(request, timestamp);
        var sign = ComputeHmacSha256(signContent, _appSecret);
        
        // Add signature-related parameters
        request.Headers.Add("X-App-Id", _appId);
        request.Headers.Add("X-Timestamp", timestamp);
        request.Headers.Add("X-Sign", sign);
        
        return Task.CompletedTask;
    }

    private string BuildSignContent(HttpRequestMessage request, string timestamp)
    {
        // Build signature string based on business rules
        var method = request.Method.Method;
        var path = request.RequestUri?.AbsolutePath ?? "/";
        return $"{method}{path}{timestamp}";
    }

    private string ComputeHmacSha256(string content, string key)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(content));
        return Convert.ToBase64String(hash);
    }
}

// Usage
[ApiSign("your-app-id", "your-app-secret")]
public interface IPaymentApi
{
    [HttpPost("api/payment/create")]
    Task<PaymentResult> CreateAsync([JsonContent] PaymentRequest request);
}
```

## Integration with Global Filters

If all APIs require signatures, you can use global filters:

```csharp
public class GlobalSignFilter : IApiFilter
{
    private readonly IConfiguration _config;
    private readonly ILogger<GlobalSignFilter> _logger;

    public GlobalSignFilter(IConfiguration config, ILogger<GlobalSignFilter> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task OnRequestAsync(ApiRequestContext context)
    {
        var appId = _config["Api:AppId"];
        var appSecret = _config["Api:AppSecret"];
        // ... signature logic
    }

    public Task OnResponseAsync(ApiResponseContext context) => Task.CompletedTask;
}

services.AddHttpApi<IExternalApi>().ConfigureHttpApi(o =>
{
    o.GlobalFilters.Add<GlobalSignFilter>();
});
```

## Related Documentation

- [Global Filters](../configuration/global-filters.md)
- [Dynamic HttpHost](../core/dynamic-host.md)
