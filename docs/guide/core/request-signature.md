# 请求签名

某些 API 需要对请求进行签名验证，以确保请求的合法性和完整性。

## 动态追加请求签名

例如每个请求的 Uri 额外动态添加一个叫 `sign` 的 query 参数，这个 sign 可能和请求参数值有关联，每次都需要计算。我们可以自定义 `ApiFilterAttribute` 的子类来实现自己的签名功能：

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

## 请求表单字段排序

某些签名算法要求表单字段按特定顺序排序：

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
        // 排序、添加其他衍生字段等
        return base.SerializeToKeyValues(context).OrderBy(item => item.Key);
    }
}
```

## 完整签名示例

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
        
        // 构建签名字符串
        var signContent = BuildSignContent(request, timestamp);
        var sign = ComputeHmacSha256(signContent, _appSecret);
        
        // 添加签名相关参数
        request.Headers.Add("X-App-Id", _appId);
        request.Headers.Add("X-Timestamp", timestamp);
        request.Headers.Add("X-Sign", sign);
        
        return Task.CompletedTask;
    }

    private string BuildSignContent(HttpRequestMessage request, string timestamp)
    {
        // 根据业务规则构建签名字符串
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

// 使用
[ApiSign("your-app-id", "your-app-secret")]
public interface IPaymentApi
{
    [HttpPost("api/payment/create")]
    Task<PaymentResult> CreateAsync([JsonContent] PaymentRequest request);
}
```

## 结合全局过滤器

如果所有接口都需要签名，可以使用全局过滤器：

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
        // ... 签名逻辑
    }

    public Task OnResponseAsync(ApiResponseContext context) => Task.CompletedTask;
}

services.AddHttpApi<IExternalApi>().ConfigureHttpApi(o =>
{
    o.GlobalFilters.Add<GlobalSignFilter>();
});
```

## 相关文档

- [全局过滤器](../configuration/global-filters.md)
- [动态 HttpHost](../core/dynamic-host.md)
