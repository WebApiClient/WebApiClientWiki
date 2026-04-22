# Adjusting Default Parameter Attributes

> This document is machine translated and requires review.

WebApiClientCore executes requests and handles responses based on metadata. You can customize Api method descriptions by populating them with desired attributes.

## UseJsonFirstApiActionDescriptor

In modern Web interfaces, JSON requests occupy most scenarios, so your client interface submitted content is often JSON content.

The `UseJsonFirstApiActionDescriptor` behavior automatically applies `JsonContentAttribute` to complex parameter types when declaring default parameter attributes for non-GET or HEAD requests.

```csharp
services
    .AddWebApiClient()
    .UseJsonFirstApiActionDescriptor();
```

After configuration, the `User` parameter of the following interface will automatically have the `[JsonContent]` attribute applied:

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync(User user);  // No need to explicitly annotate [JsonContent]
}
```

## Verifying the Auto-Application Effect

You can annotate `IUserApi` with a custom `ApiFilterAttribute` subclass to observe the parameter attributes when calling `PostAsync`:

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

You will find that `JsonContentAttribute` is automatically added to the collection.

## When to Use

- Most APIs use JSON as the request body format
- Want to reduce repetitive `[JsonContent]` attribute annotations
- Recommended to enable by default for new projects
