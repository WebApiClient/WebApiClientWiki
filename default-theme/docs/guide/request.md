# 请求声明

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

## CancellationToken 参数

每个接口都支持声明一个或多个 CancellationToken 类型的参数，用于支持取消请求操作。CancellationToken.None 表示永不取消，创建一个 CancellationTokenSource，可以提供一个 CancellationToken。

```csharp
[HttpGet("api/users/{id}")]
ITask<User> GetAsync([Required]string id, CancellationToken token = default);
```

## ContentType CharSet

对于非表单的 body 内容，默认或缺省时的 charset 值，对应的是 UTF8 编码，可以根据服务器要求调整编码。

| Attribute                         | ContentType                                    |
| --------------------------------- | ---------------------------------------------- |
| [JsonContent]                     | Content-Type: application/json; charset=utf-8  |
| [JsonContent(CharSet ="utf-8")]   | Content-Type: application/json; charset=utf-8  |
| [JsonContent(CharSet ="unicode")] | Content-Type: application/json; charset=utf-16 |

## Accpet ContentType

这个用于控制客户端希望服务器返回什么样的内容格式，比如 json 或 xml。

## PATCH 请求

json patch 是为客户端能够局部更新服务端已存在的资源而设计的一种标准交互，在 RFC6902 里有详细的介绍 json patch，通俗来讲有以下几个要点：

1. 使用 HTTP PATCH 请求方法；
2. 请求 body 为描述多个 opration 的数据 json 内容；
3. 请求的 Content-Type 为 application/json-patch+json；

### 声明 Patch 方法

```csharp
public interface IUserApi
{
    [HttpPatch("api/users/{id}")]
    Task<UserInfo> PatchAsync(string id, JsonPatchDocument<User> doc);
}
```

### 实例化 JsonPatchDocument

```csharp
var doc = new JsonPatchDocument<User>();
doc.Replace(item => item.Account, "laojiu");
doc.Replace(item => item.Email, "laojiu@qq.com");
```

### 请求内容

```csharp
PATCH /api/users/id001 HTTP/1.1
Host: localhost:6000
User-Agent: WebApiClientCore/1.0.0.0
Accept: application/json; q=0.01, application/xml; q=0.01
Content-Type: application/json-patch+json

[{"op":"replace","path":"/account","value":"laojiu"},{"op":"replace","path":"/email","value":"laojiu@qq.com"}]
```

## 非模型请求

有时候我们未必需要强模型，假设我们已经有原始的 form 文本内容，或原始的 json 文本内容，甚至是 System.Net.Http.HttpContent 对象，只需要把这些原始内请求到远程远程器。

### 原始文本

```csharp
[HttpPost]
Task PostAsync([RawStringContent("txt/plain")] string text);

[HttpPost]
Task PostAsync(StringContent text);
```

### 原始 json

```csharp
[HttpPost]
Task PostAsync([RawJsonContent] string json);
```

### 原始 xml

```csharp
[HttpPost]
Task PostAsync([RawXmlContent] string xml);
```

### 原始表单内容

```csharp
[HttpPost]
Task PostAsync([RawFormContent] string form);
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
