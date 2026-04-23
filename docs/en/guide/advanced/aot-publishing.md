# AOT Publishing Guide

## What is .NET AOT

.NET AOT (Ahead-of-Time) compilation compiles .NET applications directly into native code at build time. Unlike traditional JIT (Just-in-Time) compilation, AOT converts IL code into platform-specific native machine code during publishing.

### Benefits of AOT

| Benefit | Description |
|---------|-------------|
| **Fast Startup** | No JIT compilation required; significantly reduces startup time |
| **Low Memory** | Removes JIT compiler and IL code, reducing memory footprint |
| **Small Deployment** | Contains only necessary runtime code; generates a single executable |
| **No Runtime Required** | Target machine does not require .NET Runtime installation |
| **Better Security** | Native code is more difficult to reverse engineer than IL |

## How WebApiClientCore Supports AOT

Traditional WebApiClientCore relies on runtime reflection to create interface proxy classes, which is not feasible in AOT environments because:

1. **Trimming** - AOT publishing trims unused code; reflection-related type information may be lost
2. **No JIT** - The runtime cannot dynamically generate proxy class code

To address these issues, WebApiClientCore provides **Source Generator** support to generate proxy class code at compile time.

### Architecture Comparison

```
Traditional Mode:
┌─────────────────┐   Reflection   ┌──────────────────┐
│   IHttpApi      │ ──────────→    │ Runtime Proxy    │
│   Interface     │                │ Class            │
└─────────────────┘                └──────────────────┘

AOT Mode:
┌─────────────────┐   Source       ┌──────────────────┐
│   IHttpApi      │ ──────────→    │ Compile-time     │
│   Interface     │ Generator      │ Proxy Class      │
└─────────────────┘                └──────────────────┘
```

## Source Generator Mechanism

### Proxy Class Generation

The WebApiClientCore.Analyzers package contains a Source Generator that:

1. **Scans Interfaces** - Finds all interfaces inheriting from `IHttpApi`
2. **Generates Proxy Classes** - Creates an implementation class for each interface
3. **Registers Initializers** - Uses `[ModuleInitializer]` to automatically register proxy class types

### Generated Code Example

For the following interface:

```csharp
public interface IUserApi : IHttpApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

The Source Generator will produce code similar to:

```csharp
// HttpApiProxyClass.IUserApi.g.cs
namespace WebApiClientCore
{
    partial class HttpApiProxyClass
    {
        [HttpApiProxyClass(typeof(IUserApi))]
        sealed partial class IUserApi : IUserApi
        {
            private readonly IHttpApiInterceptor _apiInterceptor;
            private readonly ApiActionInvoker[] _actionInvokers;

            public IUserApi(IHttpApiInterceptor apiInterceptor, ApiActionInvoker[] actionInvokers)
            {
                _apiInterceptor = apiInterceptor;
                _actionInvokers = actionInvokers;
            }

            [HttpApiProxyMethod(0, "GetAsync", typeof(IUserApi))]
            Task<User> IUserApi.GetAsync(string p0)
            {
                return (Task<User>)_apiInterceptor.Intercept(_actionInvokers[0], new object[] { p0 });
            }
        }
    }
}
```

### ModuleInitializer Registration

The generated initialization code ensures proxy class types are preserved during AOT trimming:

```csharp
// HttpApiProxyClass.g.cs
static partial class HttpApiProxyClass
{
    [ModuleInitializer]
    [DynamicDependency(DynamicallyAccessedMemberTypes.All, typeof(HttpApiProxyClass))]
    public static void Initialize()
    {
    }
}
```

## Project Configuration Steps

### Prerequisites

> [!important] .NET Version Requirements
> - **AOT Publishing**: Requires .NET 8.0 or later
> - **JSON Source Generator**: `PrependJsonSerializerContext` method only supports .NET 8.0+
> - **Source Generator**: Supports .NET Standard 2.1+ and .NET 5.0+

### 1. Add NuGet Package References

```xml
<ItemGroup>
    <!-- WebApiClientCore core package -->
    <PackageReference Include="WebApiClientCore" Version="3.0.0" />
    
    <!-- Source Generator package (must be referenced as Analyzer) -->
    <PackageReference Include="WebApiClientCore.Analyzers" Version="3.0.0" OutputItemType="Analyzer" ReferenceOutputAssembly="false" />
</ItemGroup>
```

### 2. Configure AOT Publishing Properties

Edit your `.csproj` file:

```xml
<PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    
    <!-- Enable AOT publishing -->
    <PublishAot>true</PublishAot>
    
    <!-- Enable trimming (implicitly enabled by AOT, but explicit is clearer) -->
    <PublishTrimmed>true</PublishTrimmed>
    
    <!-- Optional: Invariant globalization mode (reduces size) -->
    <InvariantGlobalization>true</InvariantGlobalization>
    
    <!-- Optional: Enable single file publishing -->
    <!-- <PublishSingleFile>true</PublishSingleFile> -->
</PropertyGroup>
```

### 3. Complete Project File Example

```xml
<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <OutputType>Exe</OutputType>
        <TargetFramework>net8.0</TargetFramework>
        <Nullable>enable</Nullable>
        <PublishAot>true</PublishAot>
        <PublishTrimmed>true</PublishTrimmed>
        <InvariantGlobalization>true</InvariantGlobalization>
    </PropertyGroup>

    <ItemGroup>
        <PackageReference Include="Microsoft.Extensions.Hosting" Version="8.0.0" />
    </ItemGroup>

    <ItemGroup>
        <PackageReference Include="WebApiClientCore" Version="3.0.0" />
        <PackageReference Include="WebApiClientCore.Analyzers" Version="3.0.0" OutputItemType="Analyzer" ReferenceOutputAssembly="false" />
    </ItemGroup>
</Project>
```

## JSON Source Generator Configuration

In AOT environments, `System.Text.Json` also requires using source generators to avoid reflection.

### Create JsonSerializerContext Derived Class

```csharp
using System.Text.Json.Serialization;

[JsonSerializable(typeof(User))]
[JsonSerializable(typeof(User[]))]
[JsonSerializable(typeof(Order))]
[JsonSerializable(typeof(Order[]))]
// Add all JSON model types used in interfaces
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}
```

### Important Notes

- Must declare all JSON data types used in interfaces
- For collection types, declare both element type and collection type separately
- For generic types, declare each concrete generic parameter separately

```csharp
// Example: Complete JSON type declarations
[JsonSerializable(typeof(User))]
[JsonSerializable(typeof(User[]))]
[JsonSerializable(typeof(List<User>))]
[JsonSerializable(typeof(ApiResponse<User>))]
[JsonSerializable(typeof(ApiResponse<List<User>>))]
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}
```

## WebApiClientCore Configuration

### Register JSON Source Generation Context

Register `JsonSerializerContext` in dependency injection configuration:

```csharp
using Microsoft.Extensions.DependencyInjection;

services
    .AddWebApiClient()
    .ConfigureHttpApi(options =>
    {
        // Register JSON source generation context
        options.PrependJsonSerializerContext(AppJsonSerializerContext.Default);
    });
```

### Complete Configuration Example

```csharp
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

class Program
{
    static void Main(string[] args)
    {
        Host.CreateDefaultBuilder(args)
            .ConfigureServices(services =>
            {
                // Configure WebApiClientCore
                services
                    .AddWebApiClient()
                    .ConfigureHttpApi(options =>
                    {
                        options.PrependJsonSerializerContext(AppJsonSerializerContext.Default);
                    });

                // Register HTTP API interface
                services.AddHttpApi<IUserApi>();
                
                // Register background service
                services.AddHostedService<AppService>();
            })
            .Build()
            .Run();
    }
}
```

## Publishing Commands and Options

### Basic Publishing Command

```bash
# Publish as AOT application for current platform
dotnet publish -c Release

# Specify target platform
dotnet publish -c Release -r win-x64
dotnet publish -c Release -r linux-x64
dotnet publish -c Release -r osx-x64
dotnet publish -c Release -r osx-arm64
```

### Common Publishing Options

```bash
# Complete publishing command example
dotnet publish -c Release -r linux-x64 \
    -p:PublishAot=true \
    -p:PublishTrimmed=true \
    -p:InvariantGlobalization=true \
    -p:StripSymbols=true \
    -p:OptimizationPreference=Speed
```

### Publishing Options Explanation

| Option | Description |
|--------|-------------|
| `-r <RID>` | Target Runtime Identifier |
| `-p:PublishAot=true` | Enable AOT publishing |
| `-p:PublishTrimmed=true` | Enable trimming |
| `-p:InvariantGlobalization=true` | Use invariant globalization mode |
| `-p:StripSymbols=true` | Strip debug symbols (reduces size) |
| `-p:OptimizationPreference=Speed` | Optimize for speed (or `Size`) |
| `-p:IlcOptimizationPreference=Speed` | ILC compiler optimization preference |

### Viewing Generated Files

```bash
# Publishing output directory
bin/Release/net8.0/<RID>/publish/

# Main files:
# - <app_name> (executable)
# - <app_name>.pdb (debug symbols, if not stripped)
```

## Complete Code Example

### Project Structure

```
AppAot/
├── AppAot.csproj
├── Program.cs
├── AppJsonSerializerContext.cs
├── IUserApi.cs
├── User.cs
└── AppService.cs
```

### Interface Definition

```csharp
// IUserApi.cs
using WebApiClientCore.Attributes;

[LoggingFilter]
[HttpHost("https://api.example.com")]
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetUserAsync(string id);

    [HttpPost("api/users")]
    Task<User> CreateUserAsync([JsonContent] User user);

    [HttpGet("api/users")]
    Task<User[]> ListUsersAsync();
}
```

### Data Model

```csharp
// User.cs
using System.Text.Json.Serialization;

public class User
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string? Email { get; set; }
}
```

### JSON Source Generator

```csharp
// AppJsonSerializerContext.cs
using System.Text.Json.Serialization;

[JsonSerializable(typeof(User))]
[JsonSerializable(typeof(User[]))]
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}
```

### Main Program

```csharp
// Program.cs
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

class Program
{
    static void Main(string[] args)
    {
        Host.CreateDefaultBuilder(args)
            .ConfigureServices(services =>
            {
                services
                    .AddWebApiClient()
                    .ConfigureHttpApi(options =>
                    {
                        options.PrependJsonSerializerContext(AppJsonSerializerContext.Default);
                    });

                services.AddHttpApi<IUserApi>();
                services.AddHostedService<AppService>();
            })
            .Build()
            .Run();
    }
}
```

### Background Service

```csharp
// AppService.cs
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

class AppService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AppService> _logger;

    public AppService(IServiceScopeFactory scopeFactory, ILogger<AppService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var userApi = scope.ServiceProvider.GetRequiredService<IUserApi>();

        try
        {
            var users = await userApi.ListUsersAsync(stoppingToken);
            _logger.LogInformation("Retrieved {Count} users", users.Length);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API call failed");
        }
    }
}
```

## Common Issues and Solutions

### Issue 1: Proxy Class Not Found

**Error**: `Cannot find proxy class for interface XXX`

**Cause**: Source Generator not configured correctly or did not execute

**Solution**:
1. Ensure `WebApiClientCore.Analyzers` is referenced as Analyzer
2. Check `.csproj` has `OutputItemType="Analyzer" ReferenceOutputAssembly="false"`
3. Clean and rebuild: `dotnet clean && dotnet build`
4. Check compilation output for generated `HttpApiProxyClass.*.g.cs` files

### Issue 2: JSON Serialization Fails

**Error**: `JsonSerializerContext has not registered type XXX`

**Cause**: Missing type declaration in `JsonSerializerContext`

**Solution**:
1. Add missing type declarations in `AppJsonSerializerContext`
2. Note that collection types need separate declarations
3. Generic types need declarations for each concrete parameter

```csharp
// Wrong: Only declared User
[JsonSerializable(typeof(User))]

// Correct: Also declare collection types
[JsonSerializable(typeof(User))]
[JsonSerializable(typeof(User[]))]
[JsonSerializable(typeof(List<User>))]
```

### Issue 3: AOT Trimming Warnings

**Error**: `ILTrim warnings` or `ILC warnings`

**Cause**: Code uses patterns that are incompatible with AOT

**Solution**:
1. Use `[DynamicallyAccessedMembers]` attribute to annotate types accessed via reflection
2. Check for dynamic code generation usage (e.g., `System.Reflection.Emit`)
3. Use `[UnconditionalSuppressMessage]` to suppress known-safe warnings

### Issue 4: Types Being Trimmed

**Error**: Types or members not found at runtime

**Cause**: The AOT trimmer removes types deemed unused

**Solution**:
1. Use `[DynamicDependency]` to preserve dependencies
2. Use `[DynamicallyAccessedMembers]` to annotate members to preserve
3. Configure trimming options in project file:

```xml
<ItemGroup>
    <!-- Preserve framework libraries during trimming -->
    <TrimmerRootAssembly Include="Microsoft.Extensions.DependencyInjection" />
</ItemGroup>
```

### Issue 5: Large Publishing Size

**Cause**: Unnecessary dependencies or debug information are included

**Solution**:
1. Enable `InvariantGlobalization` to reduce globalization data
2. Enable `StripSymbols` to strip debug symbols
3. Use `OptimizationPreference=Size` for size optimization
4. Review and remove unnecessary NuGet packages

```xml
<PropertyGroup>
    <InvariantGlobalization>true</InvariantGlobalization>
    <StripSymbols>true</StripSymbols>
    <OptimizationPreference>Size</OptimizationPreference>
</PropertyGroup>
```

## AOT Limitations and Considerations

### Feature Limitations

| Limitation | Description | Alternative |
|------------|-------------|-------------|
| No JIT Compilation | Runtime cannot generate new code | Use Source Generators |
| No Dynamic Loading | Cannot load external assemblies | Statically reference all dependencies |
| Limited Reflection | Some reflection operations are restricted | Use source generation or annotations |
| No COM Interop | Some COM scenarios not supported | Use P/Invoke instead |
| Cross-platform | Requires separate compilation per platform | CI/CD multi-target publishing |

### WebApiClientCore Specific Limitations

1. **No Runtime Dynamic Interfaces** - All `IHttpApi` interfaces must be defined at compile time
2. **No Dynamic Attribute Modification** - Attribute configuration must be finalized at compile time
3. **JSON Serialization Requires Source Generation** - Must use the `System.Text.Json` source generator
4. **No Newtonsoft.Json Support** - `WebApiClientCore.Extensions.NewtonsoftJson` is incompatible with AOT

### Best Practices

1. **Development Phase Testing**
   - Test application functionality with `dotnet run`
   - Verify all API calls work correctly before AOT publishing

2. **Pre-publish Checks**
   - Check compilation warnings, especially ILTrim/ILC warnings
   - Test published application functionality
   - Verify JSON serialization/deserialization

3. **Version Management**
   - Keep `WebApiClientCore` and `WebApiClientCore.Analyzers` versions consistent
    - Version incompatibility will cause proxy class generation to fail

4. **Debugging Tips**
   - Use `<PublishAot>false</PublishAot>` to temporarily disable AOT for debugging
    - Check the generated code in the `obj/Release/netX.X/generated/` directory

## References

- [.NET AOT Official Documentation](https://learn.microsoft.com/dotnet/core/deploying/native-aot/)
- [System.Text.Json Source Generation](https://learn.microsoft.com/dotnet/standard/serialization/system-text-json/source-generation)
- [Source Generators Overview](https://learn.microsoft.com/dotnet/csharp/roslyn-sdk/source-generators-overview)
- [Trimming .NET Applications](https://learn.microsoft.com/dotnet/core/deploying/trimming/trimming-options)
