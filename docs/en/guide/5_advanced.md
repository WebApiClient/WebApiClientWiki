# Advanced Features

## Uri Concatenation Rules

All Uri concatenations are generated using the constructor `new Uri(Uri baseUri, Uri relativeUri)`.

**BaseUri with a trailing `/`**

- `http://a.com/` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1/` + `b/c/d` = `http://a.com/path1/b/c/d`
- `http://a.com/path1/path2/` + `b/c/d` = `http://a.com/path1/path2/b/c/d`

**BaseUri without a trailing `/`**

- `http://a.com` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1/path2` + `b/c/d` = `http://a.com/path1/b/c/d`

In fact, `http://a.com` and `http://a.com/` are exactly the same. Their paths are both `/`, which is why they behave the same. To avoid common mistakes, it is recommended to use the standard baseUri format, which includes a trailing `/`.

## Handling Request Exceptions

When making a request to an API, regardless of the type of exception encountered, an `HttpRequestException` is always thrown. The inner exception of `HttpRequestException` contains the specific exception that occurred. Many of the internal exceptions in WebApiClientCore are based on the `ApiException` abstract class. In many cases, the `HttpRequestException` has an inner exception of type `ApiException`.

```csharp
try
{
    var data = await api.GetAsync();
}
catch (HttpRequestException ex) when (ex.InnerException is ApiInvalidConfigException configException)
{
    // Handle request configuration exception
}
catch (HttpRequestException ex) when (ex.InnerException is ApiResponseStatusException statusException)
{
    // Handle response status code exception
}
catch (HttpRequestException ex) when (ex.InnerException is ApiException apiException)
{
    // Handle abstract API exception
}
catch (HttpRequestException ex) when (ex.InnerException is SocketException socketException)
{
    // Handle socket connection layer exception
}
catch (HttpRequestException ex)
{
    // Handle request exception
}
catch (Exception ex)
{
    // Handle other exceptions
}
```

## Conditional Request Retries

By using the `ITask<>` asynchronous declaration, you have access to the `Retry` extension, which allows you to specify retry conditions based on catching specific exceptions or evaluating the response model.

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

With `ITask<>`, you can precisely control the retry logic for a specific method. If you want to implement retries globally, consider using [Polly](https://learn.microsoft.com/zh-cn/dotnet/architecture/microservices/implement-resilient-applications/implement-http-call-retries-exponential-backoff-polly).

## Handling Form Collections

According to OpenApi, a collection can be represented in the URI query or form in five different formats:

- Csv (comma-separated values)
- Ssv (space-separated values)
- Tsv (tab-separated values)
- Pipes (pipe-separated values)
- Multi (multiple key-value pairs with the same name)

For an array value like `id = ["001","002"]`, the representations after processing with `PathQueryAttribute` and `FormContentAttribute` are as follows:

| CollectionFormat                                       | Data            |
| ------------------------------------------------------ | --------------- |
| [PathQuery(CollectionFormat = CollectionFormat.Csv)]   | `id=001,002`    |
| [PathQuery(CollectionFormat = CollectionFormat.Ssv)]   | `id=001 002`    |
| [PathQuery(CollectionFormat = CollectionFormat.Tsv)]   | `id=001\002`    |
| [PathQuery(CollectionFormat = CollectionFormat.Pipes)] | `id=001\|002`   |
| [PathQuery(CollectionFormat = CollectionFormat.Multi)] | `id=001&id=002` |

## Adjusting Default Parameter Attributes

WebApiClientCore executes requests and handles responses based on metadata. You can customize the description of an API method by adding the desired attributes. In modern web interfaces, JSON requests are commonly used. Therefore, when declaring default parameter attributes for non-GET or HEAD requests, the `UseJsonFirstApiActionDescriptor` behavior applies the `JsonContentAttribute` to complex parameter types.

```csharp
services
    .AddWebApiClient()
    .UseJsonFirstApiActionDescriptor();
```

*You can annotate `IUserApi` with your own subclass of `ApiFilterAttribute` to observe the `ApiRequestContext.ActionDescriptor.Parameters[0].Attributes` when calling `PostAsync`. You will see that the collection now includes the `JsonContentAttribute` by default.*

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync(/*[JsonContent]*/ User user);
}
```

## Adapting to Irregular Interfaces

### Unfriendly Parameter Name Aliases

For example, if the server requires a query parameter with the name `field-Name`, which is not allowed in C# as it is a reserved keyword or variable name, you can use the `[AliasAsAttribute]` to meet this requirement:

```csharp
public interface IUserApi
{
    [HttpGet("api/users")]
    ITask<string> GetAsync([AliasAs("field-Name")] string fieldName);
}
```

The resulting request URI will be `api/users/?field-name=fileNameValue`.

### Form Field as JSON Text

| Field   | Value                    |
| ------- | ------------------------ |
| field1  | someValue                |
| field2  | `{"name":"sb","age":18}` |

The .NET model for field2 is:

```csharp
public class Field2
{
    public string Name {get; set;}

    public int Age {get; set;}
}
```

Normally, we would have to serialize the instance of field2 to JSON text and assign it to the field2 string property. By using the `[JsonFormField]` attribute, the JSON serialization of the Field2 type and the resulting string are automatically handled as a form field.

```csharp
public interface IUserApi
{
    Task PostAsync([FormField] string field1, [JsonFormField] Field2 field2)
}
```

### Nested Form Fields

| Field        | Value      |
| ------------ | ---------- |
| field1       | someValue  |
| field2.name  | sb         |
| field2.age   | 18         |

The corresponding .NET model for the form is:

```csharp
public class FormModel
{
    public string Field1 {get; set;}

    public Field2 Field2 {get; set;}
}

public class Field2
{
    public string Name {get; set;}

    public int Age {get; set;}
}
```

In a proper scenario, for complex nested data models, it is recommended to submit the FormModel using `application/json`. However, if the service provider requires the FormModel to be submitted using `x-www-form-urlencoded`, you can configure `KeyValueSerializeOptions` to meet this format requirement:

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.KeyValueSerializeOptions.KeyNamingStyle = KeyNamingStyle.FullName;
});

```

### Unexpected Content-Type in Response

The response content appears to be JSON, but the Content-Type in the response header is not the expected value of application/json or application/xml, but something like text/html instead. This is similar to a client submitting JSON content with a Content-Type value of text/plain in the request header, which would make it difficult for the server to process.

The solution is to declare the `[JsonReturn]` attribute on the Interface or Method, and set its `EnsureMatchAcceptContentType` property to false, indicating that the content type does not have to match the expected value in order to be processed.

```csharp
[JsonReturn(EnsureMatchAcceptContentType = false)]
```

## Dynamic HttpHost

### Passing Absolute Uri with UriAttribute

```csharp
[LoggingFilter]
public interface IUserApi
{
    [HttpGet]
    ITask<User> GetAsync([Uri] string urlString, [PathQuery] string id);
}
```

### Custom implementation of HttpHostBaseAttribute
```csharp
[ServiceNameHost("baidu")] // Using custom ServiceNameHostAttribute
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);

    [HttpPost("api/users")]
    Task<User> PostAsync([JsonContent] User user);
}

/// <summary>
/// Attribute to determine the host based on the service name
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
        // HostProvider is your own service, the data source can be a db or other, etc., and it is required that this service has been injected with DI
        HostProvider hostProvider = context.HttpContext.ServiceProvider.GetRequiredService<HostProvider>();
        string host = hostProvider.ResolveHost(this.ServiceName);

        context.HttpContext.RequestMessage.RequestUri = new Uri(host);
    }
}
```

## Request Signing

### Dynamically Appending Request Signature

For example, adding an additional query parameter called "sign" to each request's URI, which may be related to the request parameter values and needs to be calculated each time. We can implement our own sign functionality by creating a custom subclass of `ApiFilterAttribute` and then declaring the custom filter on the Interface or Method.

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
    ...
}
```

### Sorting Form Fields

In some cases, a so-called "signature algorithm" requires sorting the form fields, etc.

```csharp
public class SortedFormContentAttribute : FormContentAttribute
{
    protected override IEnumerable<KeyValue> SerializeToKeyValues(ApiParameterContext context)
    {
        // Sort, add other derived fields, etc. here
        return base.SerializeToKeyValues(context).OrderBy(item => item.Key);
    }
}
```

## .NET 8 AOT Publishing

After using [source generation](https://learn.microsoft.com/zh-cn/dotnet/standard/serialization/system-text-json/source-generation?pivots=dotnet-8-0) in System.Text.Json, it is possible to AOT publish projects.

Example of json serialization source generation:

```csharp
[JsonSerializable(typeof(User[]))] // Add all json model types used in the interfaces here
[JsonSerializable(typeof(YourModel[]))]
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}
```

Add the json source generation context to the global configuration of WebApiClientCore:

```csharp
services
    .AddWebApiClient()
    .ConfigureHttpApi(options => // json SG generator configuration
    {
        options.PrependJsonSerializerContext(AppJsonSerializerContext.Default);
    });
```

## HttpClient Configuration

This section covers [HttpClient Factory](https://learn.microsoft.com/zh-cn/dotnet/core/extensions/httpclient-factory) content, which will not be discussed in detail here.

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpClient(httpClient =>
{
    httpClient.Timeout = TimeSpan.FromMinutes(1d);
    httpClient.DefaultRequestVersion = HttpVersion.Version20;
    httpClient.DefaultVersionPolicy = HttpVersionPolicy.RequestVersionOrLower;
});
```

## Primary HttpMessageHandler Configuration

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
    }
});
```

### Client Certificate Configuration

Some servers enable HTTPS mutual authentication to restrict client connections, allowing only clients with certificates issued by them to connect.

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
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

### Maintaining CookieContainer

If the requested interface uses cookie-based authentication, it is important to maintain the CookieContainer instance and not let it follow the lifecycle of the HttpMessageHandler, as the default HttpMessageHandler has a minimum lifecycle of 2 minutes.

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

## Using Filters in Interface Configuration

In addition to using IApiFilterAttribute subclasses as attributes in the interface declaration, filters of type IApiFilter can also be added to the interface configuration, which will be applied to the entire interface and take precedence over IApiFilterAttribute types annotated with attributes.

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.GlobalFilters.Add(new UserFilter());
});
```

```csharp
public class UserFilter : IApiFilter
{
    public Task OnRequestAsync(ApiRequestContext context)
    {
        throw new System.NotImplementedException();
    }

    public Task OnResponseAsync(ApiResponseContext context)
    {
        throw new System.NotImplementedException();
    }
}
```

## Custom Request and Response Content Parsing

In addition to deserializing common XML or JSON response content into strongly-typed result models, you may encounter other binary protocol response content, such as Google's Protobuf binary content.

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

{
}

public override async Task SetResultAsync(ApiResponseContext context)
{
    var stream = await context.HttpContext.ResponseMessage.Content.ReadAsStreamAsync();
    context.Result = Serializer.NonGeneric.Deserialize(context.ApiAction.Return.DataType.Type, stream);
}
```

Apply the relevant custom attributes:

```csharp
[ProtobufReturn]
public interface IProtobufApi
{...}

/// <summary>
/// Login and refresh the cookie
/// </summary>
/// <returns>Returns the login response message</returns>
protected override Task<HttpResponseMessage> RefreshCookieAsync()
{
    return this.api.LoginAsync(new Account
    {
        account = "admin",
        password = "123456"
    });
}
```

Finally, register IUserApi and IUserLoginApi, and configure AutoRefreshCookieHandler for IUserApi:

```csharp
services
    .AddHttpApi<IUserLoginApi>();

services
    .AddHttpApi<IUserApi>()
    .AddHttpMessageHandler(s => new AutoRefreshCookieHandler(s.GetRequiredService<IUserLoginApi>()));
```

```csharp
{
    protected override Task WriteLogAsync(ApiResponseContext context, LogMessage logMessage)
    {
        // Output logMessage to your target here
        return Task.CompletedTask;
    }
}
```

## Custom Cache Provider

The default cache provider is in-memory cache. If you want to store the cache in a different storage location, you need to customize the cache provider and register it to replace the default cache provider.

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
        // Get cache from Redis
        throw new NotImplementedException();
    }

    public Task SetAsync(string key, ResponseCacheEntry entry, TimeSpan expiration)
    {
        // Write cache content to Redis
        throw new NotImplementedException();
    }
}
```

## Custom Self-Explanatory Parameter Types

In some extreme cases, such as face comparison interfaces, the input model may not be equivalent to the transmission model. For example:

JSON model required by the server:

```json


```csharp
public class FaceModel
{
    public Bitmap Image1 {get; set;}
    public Bitmap Image2 {get; set;}
}
```

We want to pass Bitmap objects when constructing the model, but convert them to base64 values of Bitmap during transmission. So we need to modify the FaceModel to implement the `IApiParameter` interface:

```csharp
public class FaceModel : IApiParameter
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

Finally, we use the improved FaceModel to make requests:

```csharp
public interface IFaceApi
{
    [HttpPost("/somePath")]
    Task<HttpResponseMessage> PostAsync(FaceModel faces);
}
```
