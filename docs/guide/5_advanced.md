# 进阶功能
## Uri 拼接规则

所有的 Uri 拼接都是通过 Uri(Uri baseUri, Uri relativeUri)这个构造器生成。

**带`/`结尾的 baseUri**

- `http://a.com/` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1/` + `b/c/d` = `http://a.com/path1/b/c/d`
- `http://a.com/path1/path2/` + `b/c/d` = `http://a.com/path1/path2/b/c/d`

**不带`/`结尾的 baseUri**

- `http://a.com` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1/path2` + `b/c/d` = `http://a.com/path1/b/c/d`

事实上`http://a.com`与`http://a.com/`是完全一样的，他们的 path 都是`/`，所以才会表现一样。为了避免低级错误的出现，请使用的标准 baseUri 书写方式，即使用`/`作为 baseUri 的结尾的第一种方式。

## 请求异常处理

请求一个接口，不管出现何种异常，最终都抛出 HttpRequestException，HttpRequestException 的内部异常为实际具体异常，之所以设计为内部异常，是为了完好的保存内部异常的堆栈信息。

WebApiClient 内部的很多异常都基于 ApiException 这个抽象异常，也就是很多情况下，抛出的异常都是内为某个 ApiException 的 HttpRequestException。

```csharp
try
{
    var model = await api.GetAsync();
}
catch (HttpRequestException ex) when (ex.InnerException is ApiInvalidConfigException configException)
{
    // 请求配置异常
}
catch (HttpRequestException ex) when (ex.InnerException is ApiResponseStatusException statusException)
{
    // 响应状态码异常
}
catch (HttpRequestException ex) when (ex.InnerException is ApiException apiException)
{
    // 抽象的api异常
}
catch (HttpRequestException ex) when (ex.InnerException is SocketException socketException)
{
    // socket连接层异常
}
catch (HttpRequestException ex)
{
    // 请求异常
}
catch (Exception ex)
{
    // 异常
}
```


## 请求条件性重试

使用 ITask<>异步声明，就有 Retry 的扩展，Retry 的条件可以为捕获到某种 Exception 或响应模型符合某种条件。

```csharp
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    ITask<User> GetAsync(string id);
}

var result = await userApi.GetAsync(id: "id001")
    .Retry(maxCount: 3)
    .WhenCatch<HttpRequestException>()
    .WhenResult(r => r.Age <= 0);
```

## 表单集合处理
按照 OpenApi，一个集合在 Uri 的 Query 或表单中支持 5 种表述方式，分别是：

- Csv // 逗号分隔
- Ssv // 空格分隔
- Tsv // 反斜杠分隔
- Pipes // 竖线分隔
- Multi // 多个同名键的键值对

对于 id = new string []{"001","002"} 这样的值，在 PathQueryAttribute 与 FormContentAttribute 处理后分别是：

| CollectionFormat                                       | Data            |
| ------------------------------------------------------ | --------------- |
| [PathQuery(CollectionFormat = CollectionFormat.Csv)]   | `id=001,002`    |
| [PathQuery(CollectionFormat = CollectionFormat.Ssv)]   | `id=001 002`    |
| [PathQuery(CollectionFormat = CollectionFormat.Tsv)]   | `id=001\002`    |
| [PathQuery(CollectionFormat = CollectionFormat.Pipes)] | `id=001\|002`   |
| [PathQuery(CollectionFormat = CollectionFormat.Multi)] | `id=001&id=002` |


## 适配畸形接口
### 不友好的参数名别名

例如服务器要求一个 Query 参数的名字为`field-Name`，这个是 c#关键字或变量命名不允许的，我们可以使用`[AliasAsAttribute]`来达到这个要求：

```csharp
public interface IDeformedApi
{
    [HttpGet("api/users")]
    ITask<string> GetAsync([AliasAs("field-Name")] string fieldName);
}
```

然后最终请求 uri 变为 api/users/?field-name=`fileNameValue`

### Form 的某个字段为 json 文本

| 字段   | 值                     |
| ------ | ---------------------- |
| field1 | someValue              |
| field2 | {"name":"sb","age":18} |

对应强类型模型是

```csharp
class Field2
{
    public string Name {get; set;}

    public int Age {get; set;}
}
```

常规下我们得把 field2 的实例 json 序列化得到 json 文本，然后赋值给 field2 这个 string 属性，使用[JsonFormField]特性可以轻松帮我们自动完成 Field2 类型的 json 序列化并将结果字符串作为表单的一个字段。

```csharp
public interface IDeformedApi
{
    Task PostAsync([FormField] string field1, [JsonFormField] Field2 field2)
}
```

### Form 提交嵌套的模型

| 字段        | 值        |
| ----------- | --------- |
| filed1      | someValue |
| field2.name | sb        |
| field2.age  | 18        |

其对应的 json 格式为

```json
{
  "field1": "someValue",
  "filed2": {
    "name": "sb",
    "age": 18
  }
}
```

合理情况下，对于复杂嵌套结构的数据模型，应当使用 applicaiton/json，但接口要求必须使用 Form 提交，我可以配置 KeyValueSerializeOptions 来达到这个格式要求：

```csharp
services.AddHttpApi<IDeformedApi>(o =>
{
    o.KeyValueSerializeOptions.KeyNamingStyle = KeyNamingStyle.FullName;
});
```


### 响应未指明 ContentType

明明响应的内容肉眼看上是 json 内容，但服务响应头里没有 ContentType 告诉客户端这内容是 json，这好比客户端使用 Form 或 json 提交时就不在请求头告诉服务器内容格式是什么，而是让服务器猜测一样的道理。

解决办法是在 Interface 或 Method 声明`[JsonReturn]`特性，并设置其 EnsureMatchAcceptContentType 属性为 false，表示 ContentType 不是期望值匹配也要处理。

```csharp
[JsonReturn(EnsureMatchAcceptContentType = false)]
public interface IDeformedApi
{
}
```

## 动态 Host
### 使用 UriAttribute 传绝对 Uri 参
```csharp
[LoggingFilter]
public interface IDynamicHostDemo
{
    [HttpGet]
    ITask<HttpResponseMessage> ByUrlString([Uri] string urlString);
}
```

### 自定义 HttpHostBaseAttribute 实现
```csharp
[ServiceNameHost("baidu")] // 使用自定义的ServiceNameHostAttribute
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);

    [HttpPost("api/users")]
    Task<User> PostAsync([JsonContent] User user);
}

/// <summary>
/// 以服务名来确定主机的特性
/// </summary>
public class ServiceNameHostAttribute : HttpHostBaseAttribute
{
    public string ServiceName { get; }

    public ServiceNameHostAttribute(string serviceName)
    {
        this.ServiceName = serviceName;
    }

    public override Task OnRequestAsync(ApiRequestContext context)
    {
        // HostProvider是你自己的服务，数据来源可以是db或其它等等，要求此服务已经注入了DI
        HostProvider hostProvider = context.HttpContext.ServiceProvider.GetRequiredService<HostProvider>();
        string host = hostProvider.ResolveHost(this.ServiceName);

        // 最终目的是设置请求消息的RequestUri的属性
        context.HttpContext.RequestMessage.RequestUri = new Uri(host);
    }
}
```

## 请求签名
### 请求动态签名
例如每个请求的 url 额外的动态添加一个叫 sign 的参数，这个 sign 可能和请求参数值有关联，每次都需要计算。
我们可以自定义 ApiFilterAttribute 来实现自己的 sign 功能，然后把自定义 Filter 声明到 Interface 或 Method 即可

```csharp
class SignFilterAttribute : ApiFilterAttribute
{
    public override Task OnRequestAsync(ApiRequestContext context)
    {
        var signService = context.HttpContext.ServiceProvider.GetService<SignService>();
        var sign = signService.SignValue(DateTime.Now);
        context.HttpContext.RequestMessage.AddUrlQuery("sign", sign);
        return Task.CompletedTask;
    }
}

[SignFilter]
public interface IDeformedApi
{
    ...
}
```

### 表单字段排序

不知道是哪门公司起的所谓的“签名算法”，往往要字段排序等。

```csharp
class SortedFormContentAttribute : FormContentAttribute
{
    protected override IEnumerable<KeyValue> SerializeToKeyValues(ApiParameterContext context)
    {
        这里可以排序、加上其它衍生字段等
        return base.SerializeToKeyValues(context).OrderBy(item => item.Key);
    }
}

public interface IDeformedApi
{
    [HttpGet("/path")]
    Task<HttpResponseMessage> PostAsync([SortedFormContent] Model model);
}
```


## PrimaryHttpMessageHandler 配置

### Http 代理配置

```csharp
services.AddHttpApi<IUserApi>(o =>
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
            UserName = "useranme",
            Password = "pasword"
        }
    }
});
```

### 客户端证书配置

有些服务器为了限制客户端的连接，开启了 https 双向验证，只允许它执有它颁发的证书的客户端进行连接

```csharp
services.AddHttpApi<IUserApi>(o =>
{
    o.HttpHost = new Uri("http://localhost:5000/");
})
.ConfigurePrimaryHttpMessageHandler(() =>
{
    var handler = new HttpClientHandler();
    handler.ClientCertificates.Add(yourCert);
    return handler;
});
```

### 维持 CookieContainer 不变

如果请求的接口不幸使用了 Cookie 保存身份信息机制，那么就要考虑维持 CookieContainer 实例不要跟随 HttpMessageHandler 的生命周期，默认的 HttpMessageHandler 最短只有 2 分钟的生命周期。

```csharp
var cookieContainer = new CookieContainer();
services.AddHttpApi<IUserApi>(o =>
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

## 自定义请求内容与响应内容解析

除了常见的 xml 或 json 响应内容要反序列化为强类型结果模型，你可能会遇到其它的二进制协议响应内容，比如 google 的 ProtoBuf 二进制内容。
 
**自定义请求内容处理特性**

```csharp
public class ProtobufContentAttribute : HttpContentAttribute
{
    public string ContentType { get; set; } = "application/x-protobuf";

    protected override Task SetHttpContentAsync(ApiParameterContext context)
    {
        var stream = new MemoryStream();
        if (context.ParameterValue != null)
        {
            Serializer.NonGeneric.Serialize(stream, context.ParameterValue);
            stream.Position = 0L;
        }

        var content = new StreamContent(stream);
        content.Headers.ContentType = new MediaTypeHeaderValue(this.ContentType);
        context.HttpContext.RequestMessage.Content = content;
        return Task.CompletedTask;
    }
}
```

**自定义响应内容解析特性**

```csharp
public class ProtobufReturnAttribute : ApiReturnAttribute
{
    public ProtobufReturnAttribute(string acceptContentType = "application/x-protobuf")
        : base(new MediaTypeWithQualityHeaderValue(acceptContentType))
    {
    }

    public override async Task SetResultAsync(ApiResponseContext context)
    {
        var stream = await context.HttpContext.ResponseMessage.Content.ReadAsStreamAsync();
        context.Result = Serializer.NonGeneric.Deserialize(context.ApiAction.Return.DataType.Type, stream);
    }
}
```

**应用相关自定义特性**

```csharp
[ProtobufReturn]
public interface IProtobufApi
{
    [HttpPut("/users/{id}")]
    Task<User> UpdateAsync([Required, PathQuery] string id, [ProtobufContent] User user);
}
```



## 自定义 CookieAuthorizationHandler 

对于使用 Cookie 机制的接口，只有在接口请求之后，才知道 Cookie 是否已失效。通过自定义 CookieAuthorizationHandler，可以做在请求某个接口过程中，遇到 Cookie 失效时自动刷新 Cookie 再重试请求接口。

首先，我们需要把登录接口与某它业务接口拆分在不同的接口定义，例如 IUserApi 和 IUserLoginApi

```csharp
[HttpHost("http://localhost:5000/")]
public interface IUserLoginApi
{
    [HttpPost("/users")]
    Task<HttpResponseMessage> LoginAsync([JsonContent] Account account);
}
```

然后实现自动登录的 CookieAuthorizationHandler

```csharp
public class AutoRefreshCookieHandler : CookieAuthorizationHandler
{
    private readonly IUserLoginApi api;

    public AutoRefreshCookieHandler(IUserLoginApi api)
    {
        this.api = api;
    }

    /// <summary>
    /// 登录并刷新Cookie
    /// </summary>
    /// <returns>返回登录响应消息</returns>
    protected override Task<HttpResponseMessage> RefreshCookieAsync()
    {
        return this.api.LoginAsync(new Account
        {
            account = "admin",
            password = "123456"
        });
    }
}
```

最后，注册 IUserApi、IUserLoginApi，并为 IUserApi 配置 AutoRefreshCookieHandler

```csharp
services
    .AddHttpApi<IUserLoginApi>();

services
    .AddHttpApi<IUserApi>()
    .AddHttpMessageHandler(s => new AutoRefreshCookieHandler(s.GetService<IUserLoginApi>()));
```

现在，调用 IUserApi 的任意接口，只要响应的状态码为 401，就触发 IUserLoginApi 登录，然后将登录得到的 cookie 来重试请求接口，最终响应为正确的结果。你也可以重写 CookieAuthorizationHandler 的 IsUnauthorizedAsync(HttpResponseMessage)方法来指示响应是未授权状态。


## 自定义日志输出目标

```csharp
[MyLogging]
public interface IUserApi
{
}


public class MyLoggingAttribute : LoggingFilterAttribute
{
    protected override Task WriteLogAsync(ApiResponseContext context, LogMessage logMessage)
    {
        // 这里把logMessage输出到你的目标
        return Task.CompletedTask;
    }
}

```


## 自定义缓存提供者

默认的缓存提供者为内存缓存，如果希望将缓存保存到其它存储位置，则需要自定义 缓存提者，并注册替换默认的缓存提供者。 

```csharp
public static IWebApiClientBuilder UseRedisResponseCacheProvider(this IWebApiClientBuilder builder)
{
    builder.Services.AddSingleton<IResponseCacheProvider, RedisResponseCacheProvider>();
    return builder;
}
 
public class RedisResponseCacheProvider : IResponseCacheProvider
{
    public string Name => nameof(RedisResponseCacheProvider);

    public Task<ResponseCacheResult> GetAsync(string key)
    {
        // 从redis获取缓存
        throw new NotImplementedException();
    }

    public Task SetAsync(string key, ResponseCacheEntry entry, TimeSpan expiration)
    {
        // 把缓存内容写入redis
        throw new NotImplementedException();
    }
}
```

## 自定义自解释的参数类型

在某些极限情况下，比如人脸比对的接口，我们输入模型与传输模型未必是对等的，例如：

服务端要求的 json 模型

```json
{
  "image1": "图片1的base64",
  "image2": "图片2的base64"
}
```

客户端期望的业务模型

```csharp
class FaceModel
{
    public Bitmap Image1 {get; set;}
    public Bitmap Image2 {get; set;}
}
```

我们希望构造模型实例时传入 Bitmap 对象，但传输的时候变成 Bitmap 的 base64 值，所以我们要改造 FaceModel，让它实现 IApiParameter 接口：

```csharp
class FaceModel : IApiParameter
{
    public Bitmap Image1 { get; set; }

    public Bitmap Image2 { get; set; }


    public Task OnRequestAsync(ApiParameterContext context)
    {
        var image1 = GetImageBase64(this.Image1);
        var image2 = GetImageBase64(this.Image2);
        var model = new { image1, image2 };

        var options = context.HttpContext.HttpApiOptions.JsonSerializeOptions;
        context.HttpContext.RequestMessage.Content = new JsonContent(model,options);
    }

    private static string GetImageBase64(Bitmap image)
    {
        using var stream = new MemoryStream();
        image.Save(stream, System.Drawing.Imaging.ImageFormat.Jpeg);
        return Convert.ToBase64String(stream.ToArray());
    }
}
```

最后，我们在使用改进后的 FaceModel 来请求

```csharp
public interface IFaceApi
{
    [HttpPost("/somePath")]
    Task<HttpResponseMessage> PostAsync(FaceModel faces);
}
```