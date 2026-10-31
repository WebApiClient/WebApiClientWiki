---
layout: home

hero:
  name: WebApiClient
  tagline: A declarative HTTP client library that combines high performance and scalability
  image: /icon.png
  actions:
    - theme: brand
      text: Quick Start
      link: /en/guide/
    - theme: alt
      text: Install
      link: /en/reference/nuget
    - theme: alt
      text: Legacy[EOL]
      link: /en/old/
    - theme: alt
      text: Donate
      link: /en/reference/donate

features:
  - icon: { src: '/icons/declarative.svg', width: 22, height: 22, alt: Declarative Syntax }
    title: Declarative Syntax
    details: Developing client-side code only requires semantic declaration of interfaces.
  - icon: { src: '/icons/serialization.svg', width: 22, height: 22, alt: Multi-format Serialization }
    title: Multi-format Serialization
    details: Supports json, xml, form and other custom serializations.
  - icon: { src: '/icons/trimming.svg', width: 22, height: 22, alt: Trimming & AOT }
    title: Trimming & AOT
    details: Supports full code trimming and AOT publishing for .NET 8.
  - icon: { src: '/icons/aop.svg', width: 22, height: 22, alt: Aspect Oriented }
    title: Aspect Oriented
    details: Supports multiple interceptors, filters, logs, retries, cache customization and other functions.
  - icon: { src: '/icons/syntax-analysis.svg', width: 22, height: 22, alt: Syntax Analysis }
    title: Syntax Analysis
    details: Provides syntax analysis and prompts for interface declarations to help developers avoid using improper syntax.
  - icon: { src: '/icons/auth.svg', width: 22, height: 22, alt: Authentication }
    title: Authentication
    details: Supports OAuth2 and token management extension packages to facilitate identity authentication and authorization.
  - icon: { src: '/icons/codegen.svg', width: 22, height: 22, alt: Code Generation }
    title: Code Generation
    details: Provides a dotnet tool that parses local or remote OpenAPI documents into WebApiClientCore interface code, simplifying the workload of interface declaration.
  - icon: { src: '/icons/performance.svg', width: 22, height: 22, alt: Performance }
    title: Performance
    details: In BenchmarkDotNet, performance and allocation under various requests are 2.X times ahead of the similar product Refit.
---
