# PATCH Request

Json patch is a standard interaction designed for clients to partially update existing resources on the server. RFC6902 provides a detailed introduction to json patch, which can be summarized as follows:

- Use the HTTP PATCH request method.
- The request body contains json content that describes multiple operations.
- The Content-Type of the request is application/json-patch+json.

## WebApiClient Example

```csharp
public interface IMyWebApi : IHttpApi
{
    [HttpPatch("webapi/user")]
    Task<UserInfo> PatchAsync(string id, JsonPatchDocument<UserInfo> doc);
}

var doc = new JsonPatchDocument<UserInfo>();
doc.Replace(item => item.Account, "laojiu");
doc.Replace(item => item.Email, "laojiu@qq.com");
var api = HttpApi.Create<IMyWebApi>();
await api.PatchAsync("id001", doc);
```

## Asp.net Server Example

```csharp
[HttpPatch]
public async Task<UserInfo> Patch(string id, [FromBody] JsonPatchDocument<UserInfo> doc)
{
    // The user is obtained from the database query
    var user = await GetUserInfoFromDbAsync(id);
    doc.ApplyTo(user);
    return user;
}
```
