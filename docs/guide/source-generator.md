# SourceGenerator

SourceGenerator 是一种新的 c#编译时代码补充生成技术，可以非常方便的为 WebApiClient 生成接口的代理实现类，使用 SourceGenerator 扩展包，可以替换默认的内置 Emit 生成代理类的方案，支持需要完全 AOT 编译的平台。

引用 WebApiClientCore.Extensions.SourceGenerator，并在项目启用如下配置:

```csharp
// 应用编译时生成接口的代理类型代码
services
    .AddWebApiClient()
    .UseSourceGeneratorHttpApiActivator();
```

## 确保正确的代码裁剪

同时使用SourceGenerator和代码裁剪`PublishTrimmed`时，需要额外添加`AddDynamicDependencyApp`才能确保生成的代理类不被裁剪。

**此特性从扩展包`WebApiClientCore.Extensions.SourceGenerator 2.0.5.1`版本开始支持**

```csharp
services
    .AddWebApiClient()
    .UseSourceGeneratorHttpApiActivator()
    .AddDynamicDependencyApp();
```
