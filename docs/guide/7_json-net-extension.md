# Json.NET 扩展

不可否认，System.Text.Json 由于性能的优势，会越来越得到广泛使用，但 Newtonsoft 的 Json.NET 也不会因此而退出舞台。

System.Text.Json 在默认情况下十分严格，避免代表调用方进行任何猜测或解释，强调确定性行为，该库是为了实现性能和安全性而特意这样设计的。Newtonsoft 的 Json.NET 默认情况下十分灵活，默认的配置下，你几乎不会遇到反序列化的种种问题，虽然这些问题很多情况下是由于不严谨的 json 结构或类型声明造成的。

默认的基础包是不包含 Json.NET 功能的，需要额外引用 WebApiClientCore.Extensions.NewtonsoftJson 这个扩展包。

## 配置[可选]

```csharp
// ConfigureNewtonsoftJson
services.AddHttpApi<IUserApi>().ConfigureNewtonsoftJson(o =>
{
    o.JsonSerializeOptions.NullValueHandling = NullValueHandling.Ignore;
});
```

## 声明特性

使用[JsonNetReturn]替换内置的[JsonReturn]，[JsonNetContent]替换内置[JsonContent]

```csharp
/// <summary>
/// 用户操作接口
/// </summary>
[JsonNetReturn]
public interface IUserApi
{
    [HttpPost("/users")]
    Task PostAsync([JsonNetContent] User user);
}
```
