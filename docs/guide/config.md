# 配置

## 全局配置

2.0 以后的版本，提供 services.AddWebApiClient()的全局配置功能，支持提供自定义的 IHttpApiActivator<>、IApiActionDescriptorProvider、IApiActionInvokerProvider 和 IResponseCacheProvider。

## 接口注册与选项

调用`services.AddHttpApi<IUserApi>()`即可完成接口注册，
每个接口的选项对应为`HttpApiOptions`，选项名称通过 HttpApi.GetName()方法获取得到。

## 在 IHttpClientBuilder 配置

```csharp
services
    .AddHttpApi<IUserApi>()
    .ConfigureHttpApi(Configuration.GetSection(nameof(IUserApi)))
    .ConfigureHttpApi(o =>
    {
        // 符合国情的不标准时间格式，有些接口就是这么要求必须不标准
        o.JsonSerializeOptions.Converters.Add(new JsonDateTimeConverter("yyyy-MM-dd HH:mm:ss"));
    });
```

配置文件的 json

```json
{
  "IUserApi": {
    "HttpHost": "http://www.webappiclient.com/",
    "UseParameterPropertyValidate": false,
    "UseReturnValuePropertyValidate": false,
    "JsonSerializeOptions": {
      "IgnoreNullValues": true,
      "WriteIndented": false
    }
  }
}
```

## 在 IServiceCollection 配置

```csharp
services
    .ConfigureHttpApi<IUserApi>(Configuration.GetSection(nameof(IUserApi)))
    .ConfigureHttpApi<IUserApi>(o =>
    {
        // 符合国情的不标准时间格式，有些接口就是这么要求必须不标准
        o.JsonSerializeOptions.Converters.Add(new JsonDateTimeConverter("yyyy-MM-dd HH:mm:ss"));
    });
```
