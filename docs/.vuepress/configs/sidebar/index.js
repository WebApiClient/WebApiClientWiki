export const sidebarZh = {
  "/guide/": [
    {
      text: "指南[以下菜单可以点击展开]",
      children: [
        "/guide/README.md",
        "/guide/getting-started.md",
        "/guide/core-analyzers.md",
        "/guide/config.md",
        "/guide/data-validation.md",
        "/guide/attribute.md",
        "/guide/request.md",
        "/guide/response.md",
        "/guide/log.md",
        "/guide/file-download.md",
        "/guide/interface-demo.md",
        "/guide/retry.md",
        "/guide/source-generator.md",
        "/guide/exception-process.md",
        "/guide/deformed-interface.md",
        "/guide/diy-request-response.md",
        "/guide/http-message-handler.md",
        "/guide/oauths-token.md",
        "/guide/jsonnet.md",
        "/guide/json-rpc.md",
        "/guide/dynamic-host.md",
        "/guide/openapi-sg.md",
      ],
    },
  ],
  "/old/": [
    {
      text: "旧版本",
      children: [
        "/old/README.md",
        "/old/getting-started.md",
        "/old/qa.md",
        {
          text: "基础",
          children: ["/old/basic/get-head.md", "/old/basic/request-url.md", "/old/basic/post-put-delete.md", "/old/basic/patch.md", "/old/basic/parameter-attribute.md", "/old/basic/parameter-validation.md", "/old/basic/attribute-scope-features.md", "/old/basic/full-demo.md"],
        },
        {
          text: "进阶",
          children: ["/old/advanced/env-without-di.md", "/old/advanced/env-with-di.md"],
        },
        {
          text: "高级",
          children: ["/old/senior/filter.md", "/old/senior/global-filter.md", "/old/senior/diy-attribute.md", "/old/senior/exception-retry.md"],
        },
      ],
    },
  ],
  "/reference/": [],
};
