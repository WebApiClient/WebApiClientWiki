---
title: API Reference
---

# API Reference

This document serves as the API index page for WebApiClientCore, providing an overview of core namespaces and types.

::: tip Note

This document is an API index. Detailed API documentation can be obtained through:

- Use F12 (Go to Definition) in your IDE to view complete XML documentation
- Use [docfx](https://dotnet.github.io/docfx/) tool to automatically generate complete API documentation
- View dependency information on [NuGet](https://www.nuget.org/packages/WebApiClientCore)

:::

## Core Namespaces

### WebApiClientCore

Core namespace containing core interfaces and base types for HTTP API declarations.

#### Core Interfaces

| Type | Description |
|------|-------------|
| `IHttpApi` | Marker interface for HTTP API interfaces, all API interfaces should inherit from this |
| `ITask<T>` | Async task wrapper supporting chained calls and retry mechanisms |
| `IRetryTask<T>` | Interface for tasks supporting retry |
| `IHandleTask` | Cancellable task handle interface |
| `IChunkedable` | Interface supporting chunked transfer |

#### Core Classes

| Type | Description |
|------|-------------|
| `HttpApi` | Static factory class for HTTP API, used to create API instances |
| `HttpRequestHeader` | Constants for HTTP request headers |
| `HttpPath` | HTTP path parsing and processing utilities |
| `JsonString` | Wrapper type for JSON strings |
| `CollectionFormat` | Collection formatting options (CSV, SSV, TSV, PIPES, MULTI) |

#### Extension Methods

| Type | Description |
|------|-------------|
| `ApiParameterContextExtensions` | Extension methods for API parameter context |
| `ApiRequestContextExtensions` | Extension methods for API request context |
| `ApiResponseContextExtensions` | Extension methods for API response context |
| `TaskExtensions` | Task-related extension methods |

#### Exception Types

| Type | Description |
|------|-------------|
| `ApiException` | Base exception class for API calls |
| `ApiRetryException` | Exception thrown after retry failures |
| `ApiInvalidConfigException` | Exception thrown for invalid configuration |
| `ApiResultNotMatchException` | Exception thrown when result doesn't match |
| `ApiResponseStatusException` | Response status exception |
| `ApiReturnNotSupportedException` | Exception for unsupported return types |
| `ProxyTypeException` | Proxy type creation exception |
| `ProxyTypeCreateException` | Proxy type creation failure exception |
| `TypeInstanceCreateException` | Type instance creation exception |

#### HttpContent Types

| Type | Description |
|------|-------------|
| `JsonContent` | JSON format HTTP content |
| `XmlContent` | XML format HTTP content |
| `FormContent` | Form format HTTP content |
| `FormDataContent` | multipart/form-data format HTTP content |
| `FormDataTextContent` | Form text content |
| `FormDataFileContent` | Form file content |
| `JsonPatchContent` | JSON Patch format HTTP content |
| `BufferContent` | Buffer content wrapper |

---

### WebApiClientCore.Attributes

Attribute namespace containing various attributes for declarative HTTP requests.

#### Method-Level Attributes (HTTP Methods)

| Type | Description |
|------|-------------|
| `HttpGetAttribute` | Marks HTTP GET request |
| `HttpPostAttribute` | Marks HTTP POST request |
| `HttpPutAttribute` | Marks HTTP PUT request |
| `HttpDeleteAttribute` | Marks HTTP DELETE request |
| `HttpPatchAttribute` | Marks HTTP PATCH request |
| `HttpHeadAttribute` | Marks HTTP HEAD request |
| `HttpOptionsAttribute` | Marks HTTP OPTIONS request |
| `HttpMethodAttribute` | Base class for custom HTTP method attributes |

#### Method-Level Attributes (Request Configuration)

| Type | Description |
|------|-------------|
| `HttpHostAttribute` | Sets the base address for API |
| `HttpHostBaseAttribute` | Base class for host attributes |
| `TimeoutAttribute` | Sets request timeout |
| `HeaderAttribute` | Sets request header |
| `FormFieldAttribute` | Adds form field |
| `FormDataTextAttribute` | Adds form text data |
| `BasicAuthAttribute` | Sets Basic authentication header |
| `HttpCompletionOptionAttribute` | Sets HTTP completion option |

#### Parameter-Level Attributes

| Type | Description |
|------|-------------|
| `UriAttribute` | Specifies request URI |
| `PathQueryAttribute` | Path query parameter |
| `HeaderAttribute` | Request header parameter |
| `HeadersAttribute` | Multiple request headers parameter |
| `JsonContentAttribute` | JSON body parameter |
| `XmlContentAttribute` | XML body parameter |
| `HttpContentAttribute` | Raw HttpContent parameter |
| `FormContentAttribute` | Form body parameter |
| `FormDataContentAttribute` | Multipart form parameter |
| `FormFieldAttribute` | Form field parameter |
| `FormDataTextAttribute` | Form text parameter |
| `JsonFormFieldAttribute` | JSON form field |
| `JsonFormDataTextAttribute` | JSON form text |
| `RawJsonContentAttribute` | Raw JSON string content |
| `RawXmlContentAttribute` | Raw XML string content |
| `RawStringContentAttribute` | Raw string content |
| `RawFormContentAttribute` | Raw form content |
| `TimeoutAttribute` | Parameter-level timeout setting |

#### Return Value Attributes

| Type | Description |
|------|-------------|
| `JsonReturnAttribute` | JSON response handler |
| `XmlReturnAttribute` | XML response handler |
| `RawReturnAttribute` | Raw response handler |
| `DefaultValueReturnAttribute` | Default value return handler |
| `CustomValueReturnAttribute` | Custom value return handler |
| `NoneReturnAttribute` | No return value handler |
| `SpecialReturnAttribute` | Special return handler |

#### Filter Attributes

| Type | Description |
|------|-------------|
| `ApiFilterAttribute` | API filter base attribute |
| `LoggingFilterAttribute` | Logging filter |
| `LogMessage` | Log message configuration |

#### Cache Attributes

| Type | Description |
|------|-------------|
| `ApiCacheAttribute` | API response cache attribute |

---

### WebApiClientCore.Contexts

Context namespace containing various context types during API calls.

#### Core Contexts

| Type | Description |
|------|-------------|
| `HttpContext` | HTTP context containing request and response |
| `HttpClientContext` | HttpClient related context |
| `ApiRequestContext` | API request context |
| `ApiParameterContext` | API parameter context |
| `ApiResponseContext` | API response context |

---

### WebApiClientCore.Serialization

Serialization namespace containing JSON, XML and other serialization-related types.

#### Serializers

| Type | Description |
|------|-------------|
| `JsonBufferSerializer` | JSON buffer serializer |
| `XmlSerializer` | XML serializer |
| `KeyValueSerializer` | Key-value pair serializer |
| `Utf8JsonWriterCache` | UTF-8 JSON writer cache |

#### JSON Converters

| Type | Description |
|------|-------------|
| `JsonDateTimeConverter` | JSON date time converter |
| `JsonDateTimeAttribute` | JSON date time attribute |
| `JsonLocalDateTimeConverter` | JSON local date time converter |
| `JsonStringTypeConverter` | JSON string type converter |

#### Serialization Options

| Type | Description |
|------|-------------|
| `KeyValueSerializerOptions` | Key-value serialization options |
| `KeyNamingOptions` | Key naming options |
| `KeyNamingStyle` | Key naming style (CamelCase, PascalCase, SnakeCase, etc.) |

---

### WebApiClientCore.Abstractions

Abstraction namespace defining core abstract interfaces and descriptor types.

#### Core Interfaces

| Type | Description |
|------|-------------|
| `IApiFilter` | API filter interface |
| `IApiParameter` | API parameter interface |
| `IHttpApiActivator` | HTTP API activator interface |
| `IHttpApiInterceptor` | HTTP API interceptor interface |
| `IResponseCacheProvider` | Response cache provider interface |
| `IApiActionDescriptorProvider` | API action descriptor provider interface |
| `IApiActionInvokerProvider` | API action invoker provider interface |

#### Descriptor Types

| Type | Description |
|------|-------------|
| `ApiActionDescriptor` | API action descriptor |
| `ApiParameterDescriptor` | API parameter descriptor |
| `ApiReturnDescriptor` | API return value descriptor |
| `ApiDataTypeDescriptor` | API data type descriptor |

#### Configuration Types

| Type | Description |
|------|-------------|
| `HttpApiOptions` | HTTP API configuration options |
| `HttpApiRequestMessage` | HTTP API request message |
| `CachePolicy` | Cache policy |
| `ResultStatus` | Result status enum |
| `ResponseCacheEntry` | Response cache entry |
| `ResponseCacheResult` | Response cache result |
| `KeyValue` | Key-value pair |
| `IDataCollection` | Data collection interface |

---

### WebApiClientCore.HttpMessageHandlers

HTTP message handler namespace.

| Type | Description |
|------|-------------|
| `AuthorizationHandler` | Authorization handler base class |
| `CookieAuthorizationHandler` | Cookie authorization handler |

---

### WebApiClientCore.DependencyInjection

Dependency injection namespace providing service registration and configuration.

---

## NuGet Packages

WebApiClientCore is distributed as NuGet packages:

- [WebApiClientCore](https://www.nuget.org/packages/WebApiClientCore) - Core library
- [WebApiClientCore.Extensions.OAuths](https://www.nuget.org/packages/WebApiClientCore.Extensions.OAuths) - OAuth extension
- [WebApiClientCore.Extensions.NewtonsoftJson](https://www.nuget.org/packages/WebApiClientCore.Extensions.NewtonsoftJson) - Newtonsoft.Json extension
- [WebApiClientCore.Extensions.JsonRpc](https://www.nuget.org/packages/WebApiClientCore.Extensions.JsonRpc) - JSON-RPC extension

## Viewing Complete API in IDE

In IDEs (such as Visual Studio, JetBrains Rider, VS Code), view complete API documentation through:

1. **Go to Definition**: Press F12 or Ctrl+Click on type name
2. **Object Browser**: Open "View > Object Browser" in Visual Studio
3. **IntelliSense**: API hints are displayed automatically while typing

All public APIs include complete XML documentation comments that can be viewed directly in your IDE.

## Auto-Generating API Documentation

To generate a complete API reference documentation website, use the [docfx](https://dotnet.github.io/docfx/) tool:

```bash
# Install docfx
dotnet tool install -g docfx

# Generate documentation
docfx init -q
docfx docfx.json --serve
```

docfx automatically reads assembly XML documentation and generates a complete API reference website.
