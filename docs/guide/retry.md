# 请求条件性重试

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
