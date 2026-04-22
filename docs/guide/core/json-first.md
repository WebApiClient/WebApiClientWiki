# 调整缺省参数特性

WebApiClientCore 是基于元数据来执行请求和处理响应，可以自定义 Api 方法的描述，填充上想要的特性即可。

## UseJsonFirstApiActionDescriptor

现代 Web 接口中，json 请求几乎占据了大部分的场景，所以你的客户端接口提交的内容往往也是 json 内容。

`UseJsonFirstApiActionDescriptor` 行为在非 GET 或 HEAD 请求的缺省参数特性声明时，为复杂参数类型的参数自动应用 `JsonContentAttribute`。

```csharp
services
    .AddWebApiClient()
    .UseJsonFirstApiActionDescriptor();
```

配置后，以下接口的 `User` 参数会自动应用 `[JsonContent]` 特性：

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync(User user);  // 无需显式标注 [JsonContent]
}
```

## 验证自动应用的效果

你可以为 `IUserApi` 标注上一个自定义 `ApiFilterAttribute` 子类，用于观察调用 `PostAsync` 时的参数特性：

```csharp
public class DebugFilterAttribute : ApiFilterAttribute
{
    public override Task OnRequestAsync(ApiRequestContext context)
    {
        var parameters = context.ActionDescriptor.Parameters;
        foreach (var param in parameters)
        {
            Console.WriteLine($"Parameter: {param.Name}");
            foreach (var attr in param.Attributes)
            {
                Console.WriteLine($"  Attribute: {attr.GetType().Name}");
            }
        }
        return Task.CompletedTask;
    }
}
```

你会发现集合里面默认加上了 `JsonContentAttribute`。

## 何时使用

- 大部分接口使用 JSON 作为请求体格式
- 希望减少重复的 `[JsonContent]` 特性标注
- 新项目推荐默认开启
