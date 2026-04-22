# Json.NET Extension

Use the WebApiClientCore.Extensions.NewtonsoftJson extension to easily support Newtonsoft's `Json.NET` for serializing and deserializing JSON.

## Configuration (optional)

```csharp
// ConfigureNewtonsoftJson
services.AddHttpApi<IUserApi>().ConfigureNewtonsoftJson(o =>
{
    o.JsonSerializeOptions.NullValueHandling = NullValueHandling.Ignore;
});
```

## Declare Attributes

Replace the built-in [JsonReturn] with [JsonNetReturn], and [JsonContent] with [JsonNetContent].

```csharp
/// <summary>
/// User operation interface
/// </summary>
[JsonNetReturn]
public interface IUserApi
{
    [HttpPost("/users")]
    Task PostAsync([JsonNetContent] User user);
}
```
