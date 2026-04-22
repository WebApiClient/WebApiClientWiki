import { sidebar } from "vuepress-theme-hope";

const sidebarZh = {
  "/guide/": [
    {
      text: "概览",
      prefix: "/guide/overview/",
      collapsible: false,
      children: [
        { text: "架构概览", link: "architecture" },
        { text: "快速上手", link: "getting-started" },
      ]
    },
    {
      text: "核心功能",
      prefix: "/guide/core/",
      collapsible: false,
      children: [
        { text: "HTTP 特性", link: "http-attributes" },
        { text: "内容特性", link: "content-attributes" },
        { text: "返回特性", link: "return-attributes" },
        { text: "过滤器特性", link: "filter-attributes" },
        { text: "特殊参数类型", link: "special-types" },
        { text: "数据验证", link: "data-validation" },
        { text: "Uri 拼接规则", link: "uri-routing" },
        { text: "表单集合处理", link: "form-collection" },
        { text: "适配畸形接口", link: "unusual-api" },
        { text: "动态 HttpHost", link: "dynamic-host" },
        { text: "请求签名", link: "request-signature" },
        { text: "JSON 优先模式", link: "json-first" },
      ]
    },
    {
      text: "配置与诊断",
      prefix: "/guide/configuration/",
      collapsible: true,
      children: [
        { text: "HttpClient 配置", link: "httpclient" },
        { text: "HttpMessageHandler 配置", link: "httpmessage-handler" },
        { text: "全局过滤器", link: "global-filters" },
        { text: "重试策略", link: "retry-policy" },
        { text: "异常处理", link: "exception-handling" },
      ]
    },
    {
      text: "扩展包",
      prefix: "/guide/extensions/",
      collapsible: true,
      children: [
        { text: "OAuth 与 Token 管理", link: "oauth-extension" },
        { text: "Newtonsoft.Json 扩展", link: "jsonnet-extension" },
        { text: "JSON-RPC 扩展", link: "jsonrpc-extension" },
        { text: "OpenApi 代码生成", link: "openapi-generator" },
      ]
    },
    {
      text: "高级主题",
      prefix: "/guide/advanced/",
      collapsible: true,
      children: [
        { text: "自定义内容处理", link: "custom-content" },
        { text: "Cookie 自动刷新", link: "cookie-auth" },
        { text: "自定义日志和缓存", link: "custom-logging-cache" },
        { text: "自解释参数类型", link: "self-describing-param" },
        { text: "AOT 发布", link: "aot-publishing" },
        { text: "迁移指南", link: "migration-guide" },
      ]
    }],
  "/reference/": [
    {
      text: "参考",
      prefix: "/reference/",
      link: "/reference/",
      collapsible: false,
      children: [
        "api-reference",
      ]
    }],
  "/old/": [{
    text: "旧版本[不再更新]",
    prefix: "/old/",
    collapsible: true,
    children: [
      "getting-started.md",
      "qa.md",
      {
        text: "基础",
        prefix: "basic/",
        children: [
          "get-head.md",
          "request-url.md",
          "post-put-delete.md",
          "patch.md",
          "parameter-attribute.md",
          "parameter-validation.md",
          "attribute-scope-features.md",
          "full-demo.md"
        ],
      },
      {
        text: "进阶",
        prefix: "advanced/",
        children: [
          "env-without-di.md",
          "env-with-di.md"
        ],
      },
      {
        text: "高级",
        prefix: "senior/",
        children: [
          "filter.md",
          "global-filter.md",
          "diy-attribute.md",
          "exception-retry.md"
        ],
      },
    ],
  }],
};

export const zhSidebar = sidebar(sidebarZh);
