# 4. Exception Handling and Retry Strategies

## 4.1 try-catch Exception Handling

```csharp
try
{
    var user = await userApi.GetByIdAsync("id001");
    ...
}
catch (HttpStatusFailureException ex)
{
    var error = ex.ReadAsAsync<ErrorModel>();
    ...
}
catch (HttpApiException ex)
{
    ...
}
```

## 4.2 Retry Strategy

```csharp
try
{
    var user1 = await userApi
        .GetByIdAsync("id001")
        .Retry(3, i => TimeSpan.FromSeconds(i))
        .WhenCatch<HttpStatusFailureException>();
    ...
}
catch (HttpStatusFailureException ex)
{
    var error = ex.ReadAsAsync<ErrorModel>();
    ...
}
catch (HttpApiException ex)
{
    ...
}
catch(Exception ex)
{
    ...
}
```

## 4.3 RX Extensions

In some scenarios, you may not need to use the async/await programming approach. WebApiClient provides extensions to convert Task objects to IObservable objects. Here's how to use it:

```csharp
var unSubscriber = userApi.GetByIdAsync("id001")
    .Retry(3, i => TimeSpan.FromSeconds(i))
    .WhenCatch<HttpStatusFailureException>();
    .ToObservable().Subscribe(result =>
    {
        ...
    }, ex =>
    {
         ...
    });
}
```
