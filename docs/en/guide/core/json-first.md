# Adjusting Default Parameter Attributes

WebApiClientCore executes requests and handles responses based on metadata. You can customize API method descriptions by applying desired attributes.

## UseJsonFirstApiActionDescriptor

In modern web APIs, JSON is the most common request format, so client interfaces often need to submit JSON content.

The `UseJsonFirstApiActionDescriptor` behavior automatically applies `JsonContentAttribute` to complex parameter types for non-GET or HEAD requests.

```csharp
services
    .AddWebApiClient()
    .UseJsonFirstApiActionDescriptor();
```

After configuration, the `User` parameter in the following interface will automatically have `[JsonContent]` applied:

```csharp
public interface IUserApi
{
    [HttpPost("api/users")]
    Task<User> PostAsync(User user);  // No need to explicitly annotate [JsonContent]
}
```

## Verifying Auto-Application

You can apply a custom `ApiFilterAttribute` subclass to `IUserApi` to observe the parameter attributes when calling `PostAsync`:

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

You will see that `JsonContentAttribute` has been automatically added to the attribute collection.

## When to Use

- Most APIs use JSON as the request body format
- You want to reduce repetitive `[JsonContent]` annotations
- Recommended for new projects by default
