# 自定义自解释参数类型

在某些极限情况下，比如人脸比对的接口，我们输入模型与传输模型未必是对等的。

## 问题场景

服务端要求的 json 模型：

```json
{
  "image1": "图片1的base64",
  "image2": "图片2的base64"
}
```

客户端期望的业务模型：

```csharp
public class FaceModel
{
    public Bitmap Image1 { get; set; }
    public Bitmap Image2 { get; set; }
}
```

我们希望构造模型实例时传入 Bitmap 对象，但传输的时候变成 Bitmap 的 base64 值。

## 解决方案：实现 IApiParameter

改造 FaceModel，让它实现 `IApiParameter` 接口：

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
        context.HttpContext.RequestMessage.Content = new JsonContent(model, options);
        
        return Task.CompletedTask;
    }

    private static string GetImageBase64(Bitmap image)
    {
        using var stream = new MemoryStream();
        image.Save(stream, System.Drawing.Imaging.ImageFormat.Jpeg);
        return Convert.ToBase64String(stream.ToArray());
    }
}
```

## 使用

```csharp
public interface IFaceApi
{
    [HttpPost("/api/face/compare")]
    Task<CompareResult> CompareAsync(FaceModel faces);
}

// 调用
var result = await faceApi.CompareAsync(new FaceModel
{
    Image1 = bitmap1,
    Image2 = bitmap2
});
```

## 更多应用场景

### 文件上传模型

```csharp
public class FileUploadModel : IApiParameter
{
    public string FileName { get; set; }
    public Stream FileContent { get; set; }

    public Task OnRequestAsync(ApiParameterContext context)
    {
        var content = new MultipartFormDataContent();
        content.Add(new StringContent(FileName), "fileName");
        content.Add(new StreamContent(FileContent), "file", FileName);
        
        context.HttpContext.RequestMessage.Content = content;
        return Task.CompletedTask;
    }
}
```

### 加密参数

```csharp
public class EncryptedParameter : IApiParameter
{
    public object Data { get; set; }

    public Task OnRequestAsync(ApiParameterContext context)
    {
        var json = JsonSerializer.Serialize(Data);
        var encrypted = Encrypt(json);
        
        context.HttpContext.RequestMessage.Content = new StringContent(encrypted);
        return Task.CompletedTask;
    }

    private string Encrypt(string content)
    {
        // 加密逻辑
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(content));
    }
}
```

### 动态请求构建

```csharp
public class DynamicFormParameter : IApiParameter
{
    public Dictionary<string, object> Fields { get; set; }

    public Task OnRequestAsync(ApiParameterContext context)
    {
        var form = new FormUrlEncodedContent(
            Fields.Select(kv => new KeyValuePair<string, string>(
                kv.Key, 
                kv.Value?.ToString() ?? string.Empty)));
        
        context.HttpContext.RequestMessage.Content = form;
        return Task.CompletedTask;
    }
}
```

## 相关文档

- [特殊参数类型](../core/special-types.md)
- [自定义内容处理](custom-content.md)
