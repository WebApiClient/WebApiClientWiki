# Special Parameter Types

Special parameters are parameter types that work without requiring any attributes.

## CancellationToken Type

Each interface supports declaring one or more CancellationToken type parameters for canceling request operations.

```csharp
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id, CancellationToken token = default); 
}
```

## FileInfo Type

Used as a file item in multipart/form-data form to implement file upload functionality.

```csharp
public interface IUserApi
{
    [HttpPost("api/users")] 
    Task<User> PostAsync([FormDataContent] User user, FileInfo headImage);
}
```

## HttpContent Subtypes

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

## IApiParameter Subtypes

Types implementing IApiParameter are called self-describing parameter types, which can handle complex parameters that attributes cannot solve.

### FormDataFile Type

Used as a file item in multipart/form-data form to implement file upload functionality, equivalent to the FileInfo type.

```csharp
public interface IUserApi
{
    [HttpPost("api/users")] 
    Task<User> PostAsync([FormDataContent] User user, FormDataFile headImage);
}
```

### JsonPatchDocument Type

Represents a JsonPatch request document.

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
