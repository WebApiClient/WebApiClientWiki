# AOT 发布指南

## 什么是 .NET AOT

.NET AOT (Ahead-of-Time) 编译是一种将 .NET 应用程序在编译时直接编译为原生代码的技术。与传统的 JIT (Just-in-Time) 编译不同，AOT 在发布时就将 IL 代码转换为特定平台的本地机器码。

### AOT 的优势

| 优势 | 说明 |
|------|------|
| **启动速度快** | 无需 JIT 编译，应用启动时间大幅缩短 |
| **内存占用低** | 去除了 JIT 编译器和 IL 代码，减少内存使用 |
| **部署体积小** | 只包含必要的运行时代码，生成单一可执行文件 |
| **无需 .NET 运行时** | 目标机器不需要安装 .NET Runtime |
| **更好的安全性** | 原生代码比 IL 更难逆向工程 |

## WebApiClientCore 的 AOT 支持原理

传统反射机制的 WebApiClientCore 依赖运行时反射来创建接口代理类，这在 AOT 环境下不可行，因为：

1. **裁剪 (Trimming)** - AOT 发布会裁剪未使用的代码，反射相关的类型信息可能丢失
2. **无 JIT** - 运行时无法动态生成代理类代码

为解决这些问题，WebApiClientCore 提供了 **Source Generator** 支持，在编译时生成代理类代码。

### 架构对比

```
传统模式：
┌─────────────────┐     反射      ┌──────────────────┐
│   IHttpApi 接口  │ ──────────→  │   运行时代理类    │
└─────────────────┘              └──────────────────┘

AOT 模式：
┌─────────────────┐   Source     ┌──────────────────┐
│   IHttpApi 接口  │ ──────────→  │   编译时代理类    │
└─────────────────┘   Generator  └──────────────────┘
```

## Source Generator 工作机制

### 代理类生成

WebApiClientCore.Analyzers 包含一个 Source Generator，在编译时：

1. **扫描接口** - 查找所有继承自 `IHttpApi` 的接口
2. **生成代理类** - 为每个接口生成一个实现类
3. **注册初始化器** - 使用 `[ModuleInitializer]` 自动注册代理类类型

### 生成的代码示例

对于以下接口：

```csharp
public interface IUserApi : IHttpApi
{
    [HttpGet("api/users/{id}")]
    Task<User> GetAsync(string id);
}
```

Source Generator 会生成类似以下代码：

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

### ModuleInitializer 注册

生成的初始化代码确保 AOT 裁剪时保留代理类类型：

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

## 项目配置步骤

### 前置要求

> [!important] .NET 版本要求
> - **AOT 发布**：需要 .NET 8.0 或更高版本
> - **JSON 源生成器**：`PrependJsonSerializerContext` 方法仅支持 .NET 8.0+
> - **Source Generator**：支持 .NET Standard 2.1+ 和 .NET 5.0+

### 1. 添加 NuGet 包引用

```xml
<ItemGroup>
    <!-- WebApiClientCore 核心包 -->
    <PackageReference Include="WebApiClientCore" Version="3.0.0" />
    
    <!-- Source Generator 包（必须作为 Analyzer 引用） -->
    <PackageReference Include="WebApiClientCore.Analyzers" Version="3.0.0" OutputItemType="Analyzer" ReferenceOutputAssembly="false" />
</ItemGroup>
```

### 2. 配置 AOT 发布属性

编辑 `.csproj` 文件：

```xml
<PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    
    <!-- 启用 AOT 发布 -->
    <PublishAot>true</PublishAot>
    
    <!-- 启用裁剪（AOT 隐含启用，但显式声明更清晰） -->
    <PublishTrimmed>true</PublishTrimmed>
    
    <!-- 可选：全球化不变模式（减小体积） -->
    <InvariantGlobalization>true</InvariantGlobalization>
    
    <!-- 可选：启用单文件发布 -->
    <!-- <PublishSingleFile>true</PublishSingleFile> -->
</PropertyGroup>
```

### 3. 完整的项目文件示例

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

## JSON 源生成器配置

AOT 环境下，`System.Text.Json` 也需要使用源生成器来避免反射。

### 创建 JsonSerializerContext 派生类

```csharp
using System.Text.Json.Serialization;

[JsonSerializable(typeof(User))]
[JsonSerializable(typeof(User[]))]
[JsonSerializable(typeof(Order))]
[JsonSerializable(typeof(Order[]))]
// 添加所有接口中使用的 JSON 模型类型
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}
```

### 重要提示

- 必须声明所有在接口中使用的 JSON 数据类型
- 对于集合类型，需要分别声明元素类型和集合类型
- 对于泛型类型，需要为每个具体泛型参数单独声明

```csharp
// 示例：完整的 JSON 类型声明
[JsonSerializable(typeof(User))]
[JsonSerializable(typeof(User[]))]
[JsonSerializable(typeof(List<User>))]
[JsonSerializable(typeof(ApiResponse<User>))]
[JsonSerializable(typeof(ApiResponse<List<User>>))]
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}
```

## WebApiClientCore 配置

### 注册 JSON 源生成上下文

在依赖注入配置中注册 `JsonSerializerContext`：

```csharp
using Microsoft.Extensions.DependencyInjection;

services
    .AddWebApiClient()
    .ConfigureHttpApi(options =>
    {
        // 注册 JSON 源生成上下文
        options.PrependJsonSerializerContext(AppJsonSerializerContext.Default);
    });
```

### 完整配置示例

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
                // 配置 WebApiClientCore
                services
                    .AddWebApiClient()
                    .ConfigureHttpApi(options =>
                    {
                        options.PrependJsonSerializerContext(AppJsonSerializerContext.Default);
                    });

                // 注册 HTTP API 接口
                services.AddHttpApi<IUserApi>();
                
                // 注册后台服务
                services.AddHostedService<AppService>();
            })
            .Build()
            .Run();
    }
}
```

## 发布命令和选项

### 基本发布命令

```bash
# 发布为当前平台的 AOT 应用
dotnet publish -c Release

# 指定目标平台
dotnet publish -c Release -r win-x64
dotnet publish -c Release -r linux-x64
dotnet publish -c Release -r osx-x64
dotnet publish -c Release -r osx-arm64
```

### 常用发布选项

```bash
# 完整发布命令示例
dotnet publish -c Release -r linux-x64 \
    -p:PublishAot=true \
    -p:PublishTrimmed=true \
    -p:InvariantGlobalization=true \
    -p:StripSymbols=true \
    -p:OptimizationPreference=Speed
```

### 发布选项说明

| 选项 | 说明 |
|------|------|
| `-r <RID>` | 目标运行时标识符 |
| `-p:PublishAot=true` | 启用 AOT 发布 |
| `-p:PublishTrimmed=true` | 启用裁剪 |
| `-p:InvariantGlobalization=true` | 使用不变全球化模式 |
| `-p:StripSymbols=true` | 剥离调试符号（减小体积） |
| `-p:OptimizationPreference=Speed` | 优化速度（可选 `Size`） |
| `-p:IlcOptimizationPreference=Speed` | ILC 编译器优化偏好 |

### 查看生成的文件

```bash
# 发布输出位于
bin/Release/net8.0/<RID>/publish/

# 主要文件
# - <应用名> (可执行文件)
# - <应用名>.pdb (调试符号，如果未剥离)
```

## 完整代码示例

### 项目结构

```
AppAot/
├── AppAot.csproj
├── Program.cs
├── AppJsonSerializerContext.cs
├── IUserApi.cs
├── User.cs
└── AppService.cs
```

### 接口定义

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

### 数据模型

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

### JSON 源生成器

```csharp
// AppJsonSerializerContext.cs
using System.Text.Json.Serialization;

[JsonSerializable(typeof(User))]
[JsonSerializable(typeof(User[]))]
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}
```

### 主程序

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

### 后台服务

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
            _logger.LogInformation("获取到 {Count} 个用户", users.Length);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "调用 API 失败");
        }
    }
}
```

## 常见问题和解决方案

### 问题 1：找不到代理类

**错误信息**：`找不到 XXX 接口的代理类`

**原因**：Source Generator 未正确配置或未执行

**解决方案**：
1. 确保 `WebApiClientCore.Analyzers` 作为 Analyzer 引用
2. 检查 `.csproj` 中是否设置了 `OutputItemType="Analyzer" ReferenceOutputAssembly="false"`
3. 清理并重新构建项目：`dotnet clean && dotnet build`
4. 检查编译输出中是否有生成的 `HttpApiProxyClass.*.g.cs` 文件

### 问题 2：JSON 序列化失败

**错误信息**：`JsonSerializerContext 未注册类型 XXX`

**原因**：未在 `JsonSerializerContext` 中声明所需类型

**解决方案**：
1. 在 `AppJsonSerializerContext` 中添加缺失的类型声明
2. 注意集合类型需要单独声明
3. 泛型类型需要为每个具体参数声明

```csharp
// 错误：只声明了 User
[JsonSerializable(typeof(User))]

// 正确：同时声明集合类型
[JsonSerializable(typeof(User))]
[JsonSerializable(typeof(User[]))]
[JsonSerializable(typeof(List<User>))]
```

### 问题 3：AOT 裁剪警告

**错误信息**：`ILTrim warnings` 或 `ILC warnings`

**原因**：某些代码使用了不兼容 AOT 的模式

**解决方案**：
1. 使用 `[DynamicallyAccessedMembers]` 特性标注反射访问的类型
2. 检查是否使用了动态代码生成（如 `System.Reflection.Emit`）
3. 使用 `[UnconditionalSuppressMessage]` 抑制已知安全的警告

### 问题 4：类型被裁剪

**错误信息**：运行时找不到某些类型或成员

**原因**：AOT 裁剪器认为类型未被使用而移除

**解决方案**：
1. 使用 `[DynamicDependency]` 保持依赖
2. 使用 `[DynamicallyAccessedMembers]` 标注需要保留的成员
3. 在项目文件中配置裁剪选项：

```xml
<ItemGroup>
    <!-- 裁剪时保留所有框架库 -->
    <TrimmerRootAssembly Include="Microsoft.Extensions.DependencyInjection" />
</ItemGroup>
```

### 问题 5：发布体积过大

**原因**：包含了不必要的依赖或调试信息

**解决方案**：
1. 启用 `InvariantGlobalization` 减小全球化数据
2. 启用 `StripSymbols` 剥离调试符号
3. 使用 `OptimizationPreference=Size` 优化体积
4. 检查并移除不必要的 NuGet 包

```xml
<PropertyGroup>
    <InvariantGlobalization>true</InvariantGlobalization>
    <StripSymbols>true</StripSymbols>
    <OptimizationPreference>Size</OptimizationPreference>
</PropertyGroup>
```

## AOT 限制和注意事项

### 功能限制

| 限制 | 说明 | 替代方案 |
|------|------|----------|
| 无 JIT 编译 | 运行时无法生成新代码 | 使用 Source Generator |
| 无动态加载 | 无法加载外部程序集 | 静态引用所有依赖 |
| 有限反射 | 部分反射操作受限 | 使用源生成或标注 |
| 无 COM 互操作 | 部分 COM 场景不支持 | 使用 P/Invoke 替代 |
| 跨平台限制 | 需要为每个平台单独编译 | CI/CD 多目标发布 |

### WebApiClientCore 特定限制

1. **不支持运行时动态接口** - 所有 `IHttpApi` 接口必须在编译时定义
2. **不支持动态特性修改** - 特性配置必须在编译时确定
3. **JSON 序列化需要源生成** - 必须使用 `System.Text.Json` 源生成器
4. **不支持 Newtonsoft.Json** - `WebApiClientCore.Extensions.NewtonsoftJson` 不兼容 AOT

### 最佳实践

1. **开发阶段测试**
   - 使用 `dotnet run` 测试应用功能
   - AOT 发布前验证所有 API 调用正常

2. **发布前检查**
   - 检查编译警告，特别是 ILTrim/ILC 警告
   - 测试发布后的应用功能完整性
   - 验证 JSON 序列化/反序列化

3. **版本管理**
   - 保持 `WebApiClientCore` 和 `WebApiClientCore.Analyzers` 版本一致
   - 版本不兼容会导致代理类生成失败

4. **调试技巧**
   - 使用 `<PublishAot>false</PublishAot>` 临时禁用 AOT 进行调试
   - 检查 `obj/Release/netX.X/generated/` 目录下的生成代码

## 参考资料

- [.NET AOT 官方文档](https://learn.microsoft.com/dotnet/core/deploying/native-aot/)
- [System.Text.Json 源生成](https://learn.microsoft.com/dotnet/standard/serialization/system-text-json/source-generation)
- [Source Generators 概述](https://learn.microsoft.com/dotnet/csharp/roslyn-sdk/source-generators-overview)
- [裁剪 .NET 应用程序](https://learn.microsoft.com/dotnet/core/deploying/trimming/trimming-options)
