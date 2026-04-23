import { sidebar } from "vuepress-theme-hope";

const sidebarEn = {
  "/en/guide/": [
    {
      text: "Overview",
      prefix: "/en/guide/overview/",
      collapsible: true,
      expanded: true,
      children: [
        { text: "Architecture Overview", link: "architecture" },
        { text: "Getting Started", link: "getting-started" },
      ]
    },
    {
      text: "Core Features",
      prefix: "/en/guide/core/",
      collapsible: true,
      expanded: true,
      children: [
        { text: "HTTP Attributes", link: "http-attributes" },
        { text: "Content Attributes", link: "content-attributes" },
        { text: "Return Attributes", link: "return-attributes" },
        { text: "Filter Attributes", link: "filter-attributes" },
        { text: "Special Parameter Types", link: "special-types" },
        { text: "Data Validation", link: "data-validation" },
        { text: "Uri Routing Rules", link: "uri-routing" },
        { text: "Form Collection Handling", link: "form-collection" },
        { text: "Adapting Unusual APIs", link: "unusual-api" },
        { text: "Dynamic HttpHost", link: "dynamic-host" },
        { text: "Request Signing", link: "request-signature" },
        { text: "JSON First Mode", link: "json-first" },
      ]
    },
    {
      text: "Configuration & Diagnostics",
      prefix: "/en/guide/configuration/",
      collapsible: true,
      children: [
        { text: "HttpClient Configuration", link: "httpclient" },
        { text: "HttpMessageHandler Configuration", link: "httpmessage-handler" },
        { text: "Global Filters", link: "global-filters" },
        { text: "Retry Policy", link: "retry-policy" },
        { text: "Exception Handling", link: "exception-handling" },
      ]
    },
    {
      text: "Extensions",
      prefix: "/en/guide/extensions/",
      collapsible: true,
      children: [
        { text: "OAuth & Token Management", link: "oauth-extension" },
        { text: "Newtonsoft.Json Extension", link: "jsonnet-extension" },
        { text: "JSON-RPC Extension", link: "jsonrpc-extension" },
        { text: "OpenApi Code Generator", link: "openapi-generator" },
      ]
    },
    {
      text: "Advanced Topics",
      prefix: "/en/guide/advanced/",
      collapsible: true,
      children: [
        { text: "Custom Content Handling", link: "custom-content" },
        { text: "Cookie Auto Refresh", link: "cookie-auth" },
        { text: "Custom Logging & Cache", link: "custom-logging-cache" },
        { text: "Self-Describing Parameters", link: "self-describing-param" },
        { text: "AOT Publishing", link: "aot-publishing" },
        { text: "Migration Guide", link: "migration-guide" },
      ]
    }],
  "/en/reference/": [
    {
      text: "Reference",
      prefix: "/en/reference/",
      link: "/en/reference/",
      collapsible: true,
      expanded: true,
      children: [
        "api-reference",
      ]
    }],
  "/en/old/": [{
    text: "Legacy [EOL]",
    prefix: "/en/old/",
    collapsible: true,
    children: [
      "getting-started.md",
      "qa.md",
      {
        text: "Basic",
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
        text: "Advanced",
        prefix: "advanced/",
        children: [
          "env-without-di.md",
          "env-with-di.md"
        ],
      },
      {
        text: "Senior",
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

export const enSidebar = sidebar(sidebarEn);
