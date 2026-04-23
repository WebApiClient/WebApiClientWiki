# Custom Self-Describing Parameter Types

In certain scenarios, such as face comparison APIs, the input model may differ from the transmission model.

## Problem Scenario

JSON model required by the server:

```json
{
  "image1": "base64 of image 1",
  "image2": "base64 of image 2"
}
```

Business model on the client side:

```csharp
public class FaceModel
{
    public Bitmap Image1 { get; set; }
    public Bitmap Image2 { get; set; }
}
```

We want to pass Bitmap objects when constructing the model, but have them converted to base64 strings during transmission.

## Solution: Implement IApiParameter

Modify `FaceModel` to implement the `IApiParameter` interface:

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

## Usage

```csharp
public interface IFaceApi
{
    [HttpPost("/api/face/compare")]
    Task<CompareResult> CompareAsync(FaceModel faces);
}

// Usage
var result = await faceApi.CompareAsync(new FaceModel
{
    Image1 = bitmap1,
    Image2 = bitmap2
});
```

## Additional Application Scenarios

### File Upload Model

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

### Encrypted Parameter

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
        // Implement encryption logic
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(content));
    }
}
```

### Dynamic Request Building

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

## Related Documentation

- [Special Parameter Types](../core/special-types.md)
- [Custom Content Handling](custom-content.md)
