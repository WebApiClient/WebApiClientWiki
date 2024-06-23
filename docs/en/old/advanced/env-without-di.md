# Environment without Dependency Injection

## Using HttpApi.Register/Resolve

Interface declaration

```csharp
public interface IMyWebApi : IHttpApi
{
    [HttpGet("user/{id}")]
    ITask<UserInfo> GetUserAsync(string id);
}
```

Initialization code (can only be called once)

```csharp
HttpApi.Register<IMyWebApi>().ConfigureHttpApiConfig(c =>
{
    // Replacable serialization tools
    c.JsonFormatter = null;
    c.XmlFormatter = null;
    c.KeyValueFormatter = null;

    // Parameter and return value validation using System.ComponentModel.DataAnnotations validation attributes
    c.UseParameterPropertyValidate = false;
    c.UseReturnValuePropertyValidate = false;

    // Request host and HttpClient related configurations
    c.HttpHost = new Uri("http://localhost:9999/");
    c.HttpClient.Timeout = TimeSpan.FromMinutes(2d);               

    // Format related configurations
    c.FormatOptions.UseCamelCase = true;
    c.FormatOptions.DateTimeFormat = DateTimeFormats.ISO8601_WithMillisecond;

    // Response cache provider configuration, used in conjunction with [CacheAttribute]
    c.ResponseCacheProvider = null; 

    // Service provider, the instance is generally obtained from DI
    // For Asp.net core, this ServiceProvider should be the one created during the request, not the root ServiceProvider created by ConfigureServices()
    c.ServiceProvider = null;
    // Log factory, can be created and assigned independently, if kept as null, the instance is obtained from ServiceProvider 
    c.LoggerFactory = null;
});
```

Code for making http requests

```csharp
var myWebApi = HttpApi.Resolve<IMyWebApi>();
var user = await myWebApi.GetUserAsync("id001");
```

The advantage of using Register/Resolve is that you only need to register IMyWebApi once at the entry point, and HttpApiFactory automatically handles the lifecycle management of IMyWebApi. In usage, you don't need to deal with releasing the myWebApi instance (even manually disposing won't release it), you will always get the same myWebApi instance within a certain period of time. When the instance exceeds the configured lifespan, it is automatically tracked and released, and a new myWebApi instance with the same configuration is provided.
