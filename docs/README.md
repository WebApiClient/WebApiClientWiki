---
home: true
heroImage: /icon.png
heroHeight: 800
heroText: WebApiClient
tagline: 高性能高可扩展性的声明式http客户端库
actions:
  - text: 快速开始 💡
    link: /guide/
    type: primary
  - text: Nuget安装
    link: /reference/nuget
    type: default
  - text: 旧版文档
    link: /old/
    type: default
  - text: 支持我们
    link: /reference/donate
    type: default
features:
  - title: 语义化声明
    details: ⛳ 客户端的开发，只需语义化的声明接口
    link: /guide/1_getting-started.md#声明接口
  - title: 多样序列化
    details: 🛠 支持json、xml、form等序列化和其它自定义序列化方式
    link: /guide/7_json-net-extension.md
  - title: 裁剪与AOT
    details: 🤖 支持.NET8的代码完全裁剪和AOT发布。
    link: /guide/5_advanced.md#net8-aot-发布
  - title: 面向切面
    details: 🎉 支持多种拦截器、过滤器、日志、重试、缓存自定义等功能
    link: /guide/2_attributes.md
  - title: 语法分析
    details: 🤔 提供接口声明的语法分析与提示，帮助开发者声明接口时避免使用不当的语法
  - title: 快速接入
    details: 🔒 支持OAuth2与token管理扩展包，方便实现身份认证和授权
    link: /guide/6_auth-token-extension.md
  - title: 自动代码
    details: 💻 支持将本地或远程OpenApi文档解析生成WebApiClientCore接口代码的dotnet tool，简化接口声明的工作量
    link: /guide/9_openapi-to-code.md
  - title: 性能强劲
    details: 🚀 在BenchmarkDotNet中，各种请求下性能和分配2.X倍领先于同类产品Refit  
    link: /benchmarks/
footer: MIT Licensed | Copyright © WebApiClient.
---

<Content path="/reference/contributors.md" />
<Content path="/reference/donate.md" />
