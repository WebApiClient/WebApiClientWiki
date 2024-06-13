# 日志

## 请求和响应日志

在整个 Interface 或某个 Method 上声明`[LoggingFilter]`，即可把请求和响应的内容输出到 LoggingFactory 中。如果要排除某个 Method 不打印日志，在该 Method 上声明`[LoggingFilter(Enable = false)]`，即可将本 Method 排除。

## 默认日志

```csharp
[LoggingFilter]
public interface IUserApi
{
    [HttpGet("api/users/{account}")]
    ITask<HttpResponseMessage> GetAsync([Required]string account);

    // 禁用日志
    [LoggingFilter(Enable =false)]
    [HttpPost("api/users/body")]
    Task<User> PostByJsonAsync([Required, JsonContent]User user, CancellationToken token = default);
}
```

## 自定义日志输出目标

```csharp
class MyLoggingAttribute : LoggingFilterAttribute
{
    protected override Task WriteLogAsync(ApiResponseContext context, LogMessage logMessage)
    {
        xxlogger.Log(logMessage.ToIndentedString(spaceCount: 4));
        return Task.CompletedTask;
    }
}

[MyLogging]
public interface IUserApi
{
}
```
