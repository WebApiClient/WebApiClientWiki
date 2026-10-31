---
layout: home

hero:
  name: WebApiClient
  tagline: 高性能、高可扩展的声明式 Http 客户端库
  image: /icon.png
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/
    - theme: alt
      text: Nuget安装
      link: /reference/nuget
    - theme: alt
      text: 旧版文档
      link: /old/
    - theme: alt
      text: 支持我们
      link: /reference/donate

features:
  - icon: { src: '/icons/declarative.svg', width: 22, height: 22, alt: 声明式语法 }
    title: 声明式语法
    details: 客户端的开发，只需语义化地声明接口。
    link: /guide/overview/getting-started
  - icon: { src: '/icons/serialization.svg', width: 22, height: 22, alt: 多格式序列化 }
    title: 多格式序列化
    details: 支持 json、xml、form 等序列化，以及其它自定义序列化方式。
    link: /guide/extensions/jsonnet-extension
  - icon: { src: '/icons/trimming.svg', width: 22, height: 22, alt: 裁剪与 AOT }
    title: 裁剪与 AOT
    details: 支持 .NET 8 的代码完全裁剪和 AOT 发布。
    link: /guide/advanced/aot-publishing
  - icon: { src: '/icons/aop.svg', width: 22, height: 22, alt: 面向切面 }
    title: 面向切面
    details: 支持多种拦截器、过滤器、日志、重试、缓存自定义等功能。
    link: /guide/core/filter-attributes
  - icon: { src: '/icons/syntax-analysis.svg', width: 22, height: 22, alt: 语法分析 }
    title: 语法分析
    details: 提供接口声明的语法分析与提示，帮助开发者声明接口时避免使用不当的语法。
  - icon: { src: '/icons/auth.svg', width: 22, height: 22, alt: 身份认证 }
    title: 身份认证
    details: 支持 OAuth2 与 token 管理扩展包，方便实现身份认证和授权。
    link: /guide/extensions/oauth-extension
  - icon: { src: '/icons/codegen.svg', width: 22, height: 22, alt: 代码生成 }
    title: 代码生成
    details: 支持将本地或远程 OpenApi 文档解析生成 WebApiClientCore 接口代码的 dotnet tool，简化接口声明的工作量。
    link: /guide/extensions/openapi-generator
  - icon: { src: '/icons/performance.svg', width: 22, height: 22, alt: 性能 }
    title: 性能
    details: 在 BenchmarkDotNet 中，各种请求下性能和分配 2.X 倍领先于同类产品 Refit。
    link: /benchmarks/
---
