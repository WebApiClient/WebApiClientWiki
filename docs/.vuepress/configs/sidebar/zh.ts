
import { sidebar } from "vuepress-theme-hope";



const sidebarZh = {
  "/guide/": [
    {
      text: "指南",
      prefix: "/guide/",
      link: "/guide/",
      collapsible: true,
      children: [
        "1_getting-started",
        "2_attributes",
        "3_special-type",
        "4_data-validation",
        "5_advanced",
        "6_auth-token-extension",
        "7_json-net-extension",
        "8_jsonrpc-extension",
        "9_openapi-to-code",
      ]
    }],
  "/old/": [{
    text: "旧版本[不再更新]",
    prefix: "/old/",
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
