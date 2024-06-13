﻿# 特殊参数类型
特殊参数类型是指不需要任何特性来修饰就能工作的一些系统特殊类型的处理。
 
## CancellationToken 类型
每个接口都支持声明一个或多个 CancellationToken 类型的参数，用于支持取消请求操作。CancellationToken.None 表示永不取消，创建一个 CancellationTokenSource，可以提供一个 CancellationToken。

```csharp 
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id, CancellationToken token = default); 
}
```

## FileInfo 类型
做为 multipart/form-data 表单的一个文件项
```csharp 
public interface IUserApi
{
    [HttpPost("api/users")] 
    Task<User> PostAsync([FormDataContent] User user, FileInfo headImage);
}
```

## HttpContent 的子类型
```csharp 
public interface IUserApi
{
    [HttpPost("api/users/{id}")]
    Task PostAsync(StringContent text);

    [HttpPost("api/users/{id}")]
    Task PostAsync(StreamContent stream);

    [HttpPost("api/users/{id}")]
    Task PostAsync(ByteArrayContent bytes);
}
```

## IApiParameter 的子类型
实现IApiParameter的类型，称为自解释参数类型，它可以弥补特性(Attribute)不能解决的一些复杂参数。

### FormDataFile 类型
做为 multipart/form-data 表单的一个文件项，等效于 FileInfo 类型。
```csharp 
public interface IUserApi
{
    [HttpPost("api/users")] 
    Task<User> PostAsync([FormDataContent] User user, FormDataFile headImage);
}
```

### JsonPatchDocument 类型
表示 JsonPatch 请求文档。
```csharp 
public interface IUserApi
{
    [HttpPatch("api/users/{id}")]
    Task<UserInfo> PatchAsync(string id, JsonPatchDocument<User> doc);
}

var doc = new JsonPatchDocument<User>();
doc.Replace(item => item.Account, "laojiu");
doc.Replace(item => item.Email, "laojiu@qq.com");
```