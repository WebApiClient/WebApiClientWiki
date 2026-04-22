---
title: API 参考
---

# API 参考

本文档是 WebApiClientCore 的 API 索引页面，提供核心命名空间和类型的概览。

::: tip 提示

本文档为 API 索引，详细的 API 文档可通过以下方式获取：

- 在 IDE 中使用 F12 转到定义查看完整的 XML 注释文档
- 使用 [docfx](https://dotnet.github.io/docfx/) 工具自动生成完整 API 文档
- 查看 [NuGet 包](https://www.nuget.org/packages/WebApiClientCore) 的依赖说明

:::

## 核心命名空间

### WebApiClientCore

核心命名空间，包含 HTTP API 声明的核心接口和基础类型。

#### 核心接口

| 类型 | 说明 |
|------|------|
| `IHttpApi` | HTTP API 接口的标记接口，所有 API 接口应继承此接口 |
| `ITask<T>` | 异步任务包装器，支持链式调用和重试机制 |
| `IRetryTask<T>` | 支持重试的任务接口 |
| `IHandleTask` | 可取消的任务句柄接口 |
| `IChunkedable` | 支持分块传输的接口 |

#### 核心类

| 类型 | 说明 |
|------|------|
| `HttpApi` | HTTP API 的静态工厂类，用于创建 API 实例 |
| `HttpRequestHeader` | HTTP 请求头的常量定义 |
| `HttpPath` | HTTP 路径的解析和处理工具 |
| `JsonString` | JSON 字符串的包装类型 |
| `CollectionFormat` | 集合格式化选项（CSV、SSV、TSV、PIPES、MULTI） |

#### 扩展方法

| 类型 | 说明 |
|------|------|
| `ApiParameterContextExtensions` | API 参数上下文的扩展方法 |
| `ApiRequestContextExtensions` | API 请求上下文的扩展方法 |
| `ApiResponseContextExtensions` | API 响应上下文的扩展方法 |
| `TaskExtensions` | Task 相关的扩展方法 |

#### 异常类型

| 类型 | 说明 |
|------|------|
| `ApiException` | API 调用的基础异常类 |
| `ApiRetryException` | 重试失败后抛出的异常 |
| `ApiInvalidConfigException` | 配置无效时抛出的异常 |
| `ApiResultNotMatchException` | 结果不匹配时抛出的异常 |
| `ApiResponseStatusException` | 响应状态异常 |
| `ApiReturnNotSupportedException` | 不支持的返回类型异常 |
| `ProxyTypeException` | 代理类型创建异常 |
| `ProxyTypeCreateException` | 代理类型创建失败异常 |
| `TypeInstanceCreateException` | 类型实例创建异常 |

#### HttpContent 类型

| 类型 | 说明 |
|------|------|
| `JsonContent` | JSON 格式的 HTTP 内容 |
| `XmlContent` | XML 格式的 HTTP 内容 |
| `FormContent` | 表单格式的 HTTP 内容 |
| `FormDataContent` | multipart/form-data 格式的 HTTP 内容 |
| `FormDataTextContent` | 表单文本内容 |
| `FormDataFileContent` | 表单文件内容 |
| `JsonPatchContent` | JSON Patch 格式的 HTTP 内容 |
| `BufferContent` | 缓冲区内容的包装 |

---

### WebApiClientCore.Attributes

属性（Attribute）命名空间，包含用于声明式 HTTP 请求的各种特性。

#### 方法级属性（HTTP 方法）

| 类型 | 说明 |
|------|------|
| `HttpGetAttribute` | 标记 HTTP GET 请求 |
| `HttpPostAttribute` | 标记 HTTP POST 请求 |
| `HttpPutAttribute` | 标记 HTTP PUT 请求 |
| `HttpDeleteAttribute` | 标记 HTTP DELETE 请求 |
| `HttpPatchAttribute` | 标记 HTTP PATCH 请求 |
| `HttpHeadAttribute` | 标记 HTTP HEAD 请求 |
| `HttpOptionsAttribute` | 标记 HTTP OPTIONS 请求 |
| `HttpMethodAttribute` | 自定义 HTTP 方法的基类属性 |

#### 方法级属性（请求配置）

| 类型 | 说明 |
|------|------|
| `HttpHostAttribute` | 设置 API 的基础地址 |
| `HttpHostBaseAttribute` | 基础地址属性的基类 |
| `TimeoutAttribute` | 设置请求超时时间 |
| `HeaderAttribute` | 设置请求头 |
| `FormFieldAttribute` | 添加表单字段 |
| `FormDataTextAttribute` | 添加表单文本数据 |
| `BasicAuthAttribute` | 设置 Basic 认证头 |
| `HttpCompletionOptionAttribute` | 设置 HTTP 完成选项 |

#### 参数级属性

| 类型 | 说明 |
|------|------|
| `UriAttribute` | 指定请求 URI |
| `PathQueryAttribute` | 路径查询参数 |
| `HeaderAttribute` | 请求头参数 |
| `HeadersAttribute` | 多个请求头参数 |
| `JsonContentAttribute` | JSON 请求体参数 |
| `XmlContentAttribute` | XML 请求体参数 |
| `HttpContentAttribute` | 原始 HttpContent 参数 |
| `FormContentAttribute` | 表单请求体参数 |
| `FormDataContentAttribute` | multipart 表单参数 |
| `FormFieldAttribute` | 表单字段参数 |
| `FormDataTextAttribute` | 表单文本参数 |
| `JsonFormFieldAttribute` | JSON 表单字段 |
| `JsonFormDataTextAttribute` | JSON 表单文本 |
| `RawJsonContentAttribute` | 原始 JSON 字符串内容 |
| `RawXmlContentAttribute` | 原始 XML 字符串内容 |
| `RawStringContentAttribute` | 原始字符串内容 |
| `RawFormContentAttribute` | 原始表单内容 |
| `TimeoutAttribute` | 参数级超时设置 |

#### 返回值属性

| 类型 | 说明 |
|------|------|
| `JsonReturnAttribute` | JSON 响应处理 |
| `XmlReturnAttribute` | XML 响应处理 |
| `RawReturnAttribute` | 原始响应处理 |
| `DefaultValueReturnAttribute` | 默认值返回处理 |
| `CustomValueReturnAttribute` | 自定义值返回处理 |
| `NoneReturnAttribute` | 无返回值处理 |
| `SpecialReturnAttribute` | 特殊返回处理 |

#### 过滤器属性

| 类型 | 说明 |
|------|------|
| `ApiFilterAttribute` | API 过滤器基类属性 |
| `LoggingFilterAttribute` | 日志记录过滤器 |
| `LogMessage` | 日志消息配置 |

#### 缓存属性

| 类型 | 说明 |
|------|------|
| `ApiCacheAttribute` | API 响应缓存属性 |

---

### WebApiClientCore.Contexts

上下文命名空间，包含 API 调用过程中的各种上下文类型。

#### 核心上下文

| 类型 | 说明 |
|------|------|
| `HttpContext` | HTTP 上下文，包含请求和响应 |
| `HttpClientContext` | HttpClient 相关上下文 |
| `ApiRequestContext` | API 请求上下文 |
| `ApiParameterContext` | API 参数上下文 |
| `ApiResponseContext` | API 响应上下文 |

---

### WebApiClientCore.Serialization

序列化命名空间，包含 JSON、XML 等序列化相关的类型。

#### 序列化器

| 类型 | 说明 |
|------|------|
| `JsonBufferSerializer` | JSON 缓冲序列化器 |
| `XmlSerializer` | XML 序列化器 |
| `KeyValueSerializer` | 键值对序列化器 |
| `Utf8JsonWriterCache` | UTF-8 JSON 写入器缓存 |

#### JSON 转换器

| 类型 | 说明 |
|------|------|
| `JsonDateTimeConverter` | JSON 日期时间转换器 |
| `JsonDateTimeAttribute` | JSON 日期时间属性 |
| `JsonLocalDateTimeConverter` | JSON 本地日期时间转换器 |
| `JsonStringTypeConverter` | JSON 字符串类型转换器 |

#### 序列化选项

| 类型 | 说明 |
|------|------|
| `KeyValueSerializerOptions` | 键值对序列化选项 |
| `KeyNamingOptions` | 键命名选项 |
| `KeyNamingStyle` | 键命名风格（CamelCase、PascalCase、SnakeCase 等） |

---

### WebApiClientCore.Abstractions

抽象类型命名空间，定义核心抽象接口和描述符类型。

#### 核心接口

| 类型 | 说明 |
|------|------|
| `IApiFilter` | API 过滤器接口 |
| `IApiParameter` | API 参数接口 |
| `IHttpApiActivator` | HTTP API 激活器接口 |
| `IHttpApiInterceptor` | HTTP API 拦截器接口 |
| `IResponseCacheProvider` | 响应缓存提供者接口 |
| `IApiActionDescriptorProvider` | API 操作描述符提供者接口 |
| `IApiActionInvokerProvider` | API 操作调用器提供者接口 |

#### 描述符类型

| 类型 | 说明 |
|------|------|
| `ApiActionDescriptor` | API 操作描述符 |
| `ApiParameterDescriptor` | API 参数描述符 |
| `ApiReturnDescriptor` | API 返回值描述符 |
| `ApiDataTypeDescriptor` | API 数据类型描述符 |

#### 配置类型

| 类型 | 说明 |
|------|------|
| `HttpApiOptions` | HTTP API 配置选项 |
| `HttpApiRequestMessage` | HTTP API 请求消息 |
| `CachePolicy` | 缓存策略 |
| `ResultStatus` | 结果状态枚举 |
| `ResponseCacheEntry` | 响应缓存条目 |
| `ResponseCacheResult` | 响应缓存结果 |
| `KeyValue` | 键值对 |
| `IDataCollection` | 数据集合接口 |

---

### WebApiClientCore.HttpMessageHandlers

HTTP 消息处理器命名空间。

| 类型 | 说明 |
|------|------|
| `AuthorizationHandler` | 授权处理器基类 |
| `CookieAuthorizationHandler` | Cookie 授权处理器 |

---

### WebApiClientCore.DependencyInjection

依赖注入命名空间，提供服务注册和配置。

---

## NuGet 包

WebApiClientCore 以 NuGet 包形式发布，可以通过以下链接查看：

- [WebApiClientCore](https://www.nuget.org/packages/WebApiClientCore) - 核心库
- [WebApiClientCore.Extensions.OAuths](https://www.nuget.org/packages/WebApiClientCore.Extensions.OAuths) - OAuth 扩展
- [WebApiClientCore.Extensions.NewtonsoftJson](https://www.nuget.org/packages/WebApiClientCore.Extensions.NewtonsoftJson) - Newtonsoft.Json 扩展
- [WebApiClientCore.Extensions.JsonRpc](https://www.nuget.org/packages/WebApiClientCore.Extensions.JsonRpc) - JSON-RPC 扩展

## 使用 IDE 查看完整 API

在 IDE（如 Visual Studio、JetBrains Rider、VS Code）中，通过以下方式查看完整的 API 文档：

1. **转到定义**：按 F12 或 Ctrl+点击类型名称
2. **对象浏览器**：在 Visual Studio 中打开"视图 > 对象浏览器"
3. **IntelliSense**：输入代码时自动显示 API 提示

所有公共 API 都包含完整的 XML 文档注释，可以直接在 IDE 中查看使用说明。

## 自动生成 API 文档

如需生成完整的 API 参考文档网站，可以使用 [docfx](https://dotnet.github.io/docfx/) 工具：

```bash
# 安装 docfx
dotnet tool install -g docfx

# 生成文档
docfx init -q
docfx docfx.json --serve
```

docfx 会自动读取程序集的 XML 注释文档，生成完整的 API 参考网站。
