import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { mdContentIncludePlugin } from "./plugins/md-content-include.mts";

const docsDir = path.resolve(fileURLToPath(new URL("../", import.meta.url)));

// dev server https 证书：仓库根 devssl/test.key 与 devssl/test.crt。
// 证书缺失时降级为 http，仅影响 `vitepress dev`，绝不能影响 build。
const devSslKey = fileURLToPath(new URL("../../devssl/test.key", import.meta.url));
const devSslCert = fileURLToPath(new URL("../../devssl/test.crt", import.meta.url));

let devServerHttps: { key: Buffer; cert: Buffer } | undefined;
try {
  devServerHttps = {
    key: fs.readFileSync(devSslKey),
    cert: fs.readFileSync(devSslCert),
  };
} catch {
  // 证书不存在或不可读：降级为普通 http dev server
  devServerHttps = undefined;
}

const editLinkPattern =
  "https://github.com/WebApiClient/WebApiClientWiki/edit/main/docs/:path";

// ---------------------------------------------------------------- zh navbar

const zhNav = [
  { text: "指南", link: "/guide/", activeMatch: "^/guide/" },
  { text: "性能测试", link: "/benchmarks/", activeMatch: "^/benchmarks/" },
  { text: "旧版本[不再更新]", link: "/old/", activeMatch: "^/old/" },
  { text: "支持我们", link: "/reference/donate", activeMatch: "^/reference/donate" },
];

const enNav = [
  { text: "Guide", link: "/en/guide/", activeMatch: "^/en/guide/" },
  { text: "Legacy[EOL]", link: "/en/old/", activeMatch: "^/en/old/" },
  { text: "Donate", link: "/en/reference/donate", activeMatch: "^/en/reference/donate" },
];

// -------------------------------------------------------------- zh sidebar

const zhSidebar = {
  "/guide/": [
    {
      text: "概览",
      collapsed: false,
      items: [
        { text: "架构概览", link: "/guide/overview/architecture" },
        { text: "快速上手", link: "/guide/overview/getting-started" },
      ],
    },
    {
      text: "核心功能",
      collapsed: false,
      items: [
        { text: "HTTP 特性", link: "/guide/core/http-attributes" },
        { text: "内容特性", link: "/guide/core/content-attributes" },
        { text: "返回特性", link: "/guide/core/return-attributes" },
        { text: "过滤器特性", link: "/guide/core/filter-attributes" },
        { text: "特殊参数类型", link: "/guide/core/special-types" },
        { text: "数据验证", link: "/guide/core/data-validation" },
        { text: "Uri 拼接规则", link: "/guide/core/uri-routing" },
        { text: "表单集合处理", link: "/guide/core/form-collection" },
        { text: "适配畸形接口", link: "/guide/core/unusual-api" },
        { text: "动态 HttpHost", link: "/guide/core/dynamic-host" },
        { text: "请求签名", link: "/guide/core/request-signature" },
        { text: "JSON 优先模式", link: "/guide/core/json-first" },
      ],
    },
    {
      text: "配置与诊断",
      collapsed: true,
      items: [
        { text: "HttpClient 配置", link: "/guide/configuration/httpclient" },
        { text: "HttpMessageHandler 配置", link: "/guide/configuration/httpmessage-handler" },
        { text: "全局过滤器", link: "/guide/configuration/global-filters" },
        { text: "重试策略", link: "/guide/configuration/retry-policy" },
        { text: "异常处理", link: "/guide/configuration/exception-handling" },
      ],
    },
    {
      text: "扩展包",
      collapsed: true,
      items: [
        { text: "OAuth 与 Token 管理", link: "/guide/extensions/oauth-extension" },
        { text: "Newtonsoft.Json 扩展", link: "/guide/extensions/jsonnet-extension" },
        { text: "JSON-RPC 扩展", link: "/guide/extensions/jsonrpc-extension" },
        { text: "OpenApi 代码生成", link: "/guide/extensions/openapi-generator" },
      ],
    },
    {
      text: "高级主题",
      collapsed: true,
      items: [
        { text: "自定义内容处理", link: "/guide/advanced/custom-content" },
        { text: "Cookie 自动刷新", link: "/guide/advanced/cookie-auth" },
        { text: "自定义日志和缓存", link: "/guide/advanced/custom-logging-cache" },
        { text: "自解释参数类型", link: "/guide/advanced/self-describing-param" },
        { text: "AOT 发布", link: "/guide/advanced/aot-publishing" },
        { text: "AI 辅助开发", link: "/guide/advanced/ai-agent-skill" },
        { text: "迁移指南", link: "/guide/advanced/migration-guide" },
      ],
    },
  ],
  "/reference/": [
    {
      text: "参考",
      collapsed: false,
      // api-reference.md 已被 rewrite 为 /reference/ 本体，
      // 侧栏直接指向它，链接旧地址只保留 buildEnd 的硬加载跳转
      items: [{ text: "API 参考", link: "/reference/" }],
    },
  ],
  "/old/": [
    {
      text: "旧版本[不再更新]",
      collapsed: true,
      items: [
        { text: "getting-started", link: "/old/getting-started" },
        { text: "qa", link: "/old/qa" },
        {
          text: "基础",
          collapsed: true,
          items: [
            { text: "get-head", link: "/old/basic/get-head" },
            { text: "request-url", link: "/old/basic/request-url" },
            { text: "post-put-delete", link: "/old/basic/post-put-delete" },
            { text: "patch", link: "/old/basic/patch" },
            { text: "parameter-attribute", link: "/old/basic/parameter-attribute" },
            { text: "parameter-validation", link: "/old/basic/parameter-validation" },
            { text: "attribute-scope-features", link: "/old/basic/attribute-scope-features" },
            { text: "full-demo", link: "/old/basic/full-demo" },
          ],
        },
        {
          text: "进阶",
          collapsed: true,
          items: [
            { text: "env-without-di", link: "/old/advanced/env-without-di" },
            { text: "env-with-di", link: "/old/advanced/env-with-di" },
          ],
        },
        {
          text: "高级",
          collapsed: true,
          items: [
            { text: "filter", link: "/old/senior/filter" },
            { text: "global-filter", link: "/old/senior/global-filter" },
            { text: "diy-attribute", link: "/old/senior/diy-attribute" },
            { text: "exception-retry", link: "/old/senior/exception-retry" },
          ],
        },
      ],
    },
  ],
};

// -------------------------------------------------------------- en sidebar

const enSidebar = {
  "/en/guide/": [
    {
      text: "Overview",
      collapsed: false,
      items: [
        { text: "Architecture Overview", link: "/en/guide/overview/architecture" },
        { text: "Getting Started", link: "/en/guide/overview/getting-started" },
      ],
    },
    {
      text: "Core Features",
      collapsed: false,
      items: [
        { text: "HTTP Attributes", link: "/en/guide/core/http-attributes" },
        { text: "Content Attributes", link: "/en/guide/core/content-attributes" },
        { text: "Return Attributes", link: "/en/guide/core/return-attributes" },
        { text: "Filter Attributes", link: "/en/guide/core/filter-attributes" },
        { text: "Special Parameter Types", link: "/en/guide/core/special-types" },
        { text: "Data Validation", link: "/en/guide/core/data-validation" },
        { text: "Uri Routing Rules", link: "/en/guide/core/uri-routing" },
        { text: "Form Collection Handling", link: "/en/guide/core/form-collection" },
        { text: "Adapting Unusual APIs", link: "/en/guide/core/unusual-api" },
        { text: "Dynamic HttpHost", link: "/en/guide/core/dynamic-host" },
        { text: "Request Signing", link: "/en/guide/core/request-signature" },
        { text: "JSON First Mode", link: "/en/guide/core/json-first" },
      ],
    },
    {
      text: "Configuration & Diagnostics",
      collapsed: true,
      items: [
        { text: "HttpClient Configuration", link: "/en/guide/configuration/httpclient" },
        { text: "HttpMessageHandler Configuration", link: "/en/guide/configuration/httpmessage-handler" },
        { text: "Global Filters", link: "/en/guide/configuration/global-filters" },
        { text: "Retry Policy", link: "/en/guide/configuration/retry-policy" },
        { text: "Exception Handling", link: "/en/guide/configuration/exception-handling" },
      ],
    },
    {
      text: "Extensions",
      collapsed: true,
      items: [
        { text: "OAuth & Token Management", link: "/en/guide/extensions/oauth-extension" },
        { text: "Newtonsoft.Json Extension", link: "/en/guide/extensions/jsonnet-extension" },
        { text: "JSON-RPC Extension", link: "/en/guide/extensions/jsonrpc-extension" },
        { text: "OpenApi Code Generator", link: "/en/guide/extensions/openapi-generator" },
      ],
    },
    {
      text: "Advanced Topics",
      collapsed: true,
      items: [
        { text: "Custom Content Handling", link: "/en/guide/advanced/custom-content" },
        { text: "Cookie Auto Refresh", link: "/en/guide/advanced/cookie-auth" },
        { text: "Custom Logging & Cache", link: "/en/guide/advanced/custom-logging-cache" },
        { text: "Self-Describing Parameters", link: "/en/guide/advanced/self-describing-param" },
        { text: "AOT Publishing", link: "/en/guide/advanced/aot-publishing" },
        { text: "AI-Assisted Development", link: "/en/guide/advanced/ai-agent-skill" },
        { text: "Migration Guide", link: "/en/guide/advanced/migration-guide" },
      ],
    },
  ],
  "/en/reference/": [
    {
      text: "Reference",
      collapsed: false,
      items: [{ text: "API Reference", link: "/en/reference/" }],
    },
  ],
  "/en/old/": [
    {
      text: "Legacy [EOL]",
      collapsed: true,
      items: [
        { text: "getting-started", link: "/en/old/getting-started" },
        { text: "qa", link: "/en/old/qa" },
        {
          text: "Basic",
          collapsed: true,
          items: [
            { text: "get-head", link: "/en/old/basic/get-head" },
            { text: "request-url", link: "/en/old/basic/request-url" },
            { text: "post-put-delete", link: "/en/old/basic/post-put-delete" },
            { text: "patch", link: "/en/old/basic/patch" },
            { text: "parameter-attribute", link: "/en/old/basic/parameter-attribute" },
            { text: "parameter-validation", link: "/en/old/basic/parameter-validation" },
            { text: "attribute-scope-features", link: "/en/old/basic/attribute-scope-features" },
            { text: "full-demo", link: "/en/old/basic/full-demo" },
          ],
        },
        {
          text: "Advanced",
          collapsed: true,
          items: [
            { text: "env-without-di", link: "/en/old/advanced/env-without-di" },
            { text: "env-with-di", link: "/en/old/advanced/env-with-di" },
          ],
        },
        {
          text: "Senior",
          collapsed: true,
          items: [
            { text: "filter", link: "/en/old/senior/filter" },
            { text: "global-filter", link: "/en/old/senior/global-filter" },
            { text: "diy-attribute", link: "/en/old/senior/diy-attribute" },
            { text: "exception-retry", link: "/en/old/senior/exception-retry" },
          ],
        },
      ],
    },
  ],
};

export default withMermaid(
  defineConfig({
    lang: "zh-CN",
    title: "WebApiClient",
    description: "声明式调用Http接口",
    base: "/",

    head: [
      ["link", { rel: "icon", href: "/favicon.ico" }],
      // 版式开关的首屏恢复：在渲染前把用户选择的全屏档挂到 <html>，避免闪烁
      [
        "script",
        {},
        "(function(){try{if(localStorage.getItem('wac-width-mode')==='full'){document.documentElement.classList.add('wac-full')}}catch(e){}})();",
      ],
    ],

    // VitePress 不会像 VuePress 那样把 README.md 自动作为目录 index，
    // 这里显式重写，保证 /、/guide/、/en/ 等目录式链接可达。
    rewrites: {
      "README.md": "index.md",
      "guide/readme.md": "guide/index.md",
      "old/readme.md": "old/index.md",
      "reference/api-reference.md": "reference/index.md",
      "benchmarks/README.md": "benchmarks/index.md",
      "en/README.md": "en/index.md",
      "en/guide/readme.md": "en/guide/index.md",
      "en/old/readme.md": "en/old/index.md",
      "en/reference/api-reference.md": "en/reference/index.md",
    },

    sitemap: {
      hostname: "https://webapiclient.github.io/",
    },

    locales: {
      root: {
        label: "简体中文",
        lang: "zh-CN",
        title: "WebApiClient",
        description: "WebApiClient 的文档站点",
        themeConfig: {
          logo: "/icon.png",
          nav: zhNav,
          sidebar: zhSidebar,
          editLink: {
            pattern: editLinkPattern,
            text: "在 GitHub 上编辑此页",
          },
          outline: { level: [2, 3], label: "本页目录" },
          docFooter: {
            prev: "上一页",
            next: "下一页",
          },
          lastUpdated: {
            text: "最后更新于",
          },
          returnToTopLabel: "回到顶部",
          sidebarMenuLabel: "菜单",
          darkModeSwitchLabel: "主题",
          lightModeSwitchTitle: "切换到浅色模式",
          darkModeSwitchTitle: "切换到深色模式",
        },
      },
      en: {
        label: "English",
        lang: "en-US",
        title: "WebApiClient",
        description: "WebApiClient Docs",
        themeConfig: {
          logo: "/icon.png",
          nav: enNav,
          sidebar: enSidebar,
          editLink: {
            pattern: editLinkPattern,
            text: "Edit this page",
          },
          outline: { level: [2, 3], label: "On this page" },
          docFooter: {
            prev: "Previous page",
            next: "Next page",
          },
          lastUpdated: {
            text: "Last updated",
          },
        },
      },
    },

    markdown: {
      lineNumbers: true,
      theme: { light: "github-light", dark: "github-dark" },
      config(md) {
        // VuePress 2 风格的 <Content path="/xxx.md" /> 内联（VitePress 全局
        // Content 组件不支持 path，需在 markdown 层展开）
        mdContentIncludePlugin(md, docsDir);
      },
    },

    lastUpdated: true,

    themeConfig: {
      socialLinks: [
        { icon: "github", link: "https://github.com/dotnetcore/WebApiClient" },
      ],
      search: {
        provider: "local",
        // VitePress 内置本地搜索默认使用 Intl.Segmenter 处理中文分词
      },
    },

    vite: {
      server: devServerHttps ? { https: devServerHttps } : {},
    },

    // api-reference.md 被 rewrite 为各语言 reference 的 index 后，
    // 文档正文里历史存在的 /reference/api-reference.html 深链会失效，
    // 这里在构建产物中补一个跳转页保持旧链接可达。
    buildEnd() {
      const redirects: Array<[string, string]> = [
        ["reference/api-reference.html", "/reference/"],
        ["en/reference/api-reference.html", "/en/reference/"],
      ];
      for (const [file, to] of redirects) {
        const target = path.join(docsDir, ".vitepress/dist", file);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(
          target,
          `<!DOCTYPE html><html><head><meta charset="utf-8">` +
            `<meta http-equiv="refresh" content="0;url=${to}">` +
            `<link rel="canonical" href="${to}">` +
            `</head><body><script>location.replace(${JSON.stringify(to)})</script>` +
            `<a href="${to}">Redirecting…</a></body></html>\n`
        );
      }
    },

    mermaid: {
      // 中文标签按字符估宽容易溢出节点框：显式给 CJK 字体栈修正测量，
      // 并拉大节点/层级间距，解决图太挤的问题
      themeVariables: {
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
        fontSize: "15px",
      },
      flowchart: {
        // 溢出的真凶是 .vp-doc p 段落样式穿透进 html 标签的 <p>（见 custom.css 的隔离规则），
        // htmlLabels 保持默认 true 渲染质量更好
        htmlLabels: true,
        nodeSpacing: 64,
        rankSpacing: 80,
        padding: 14,
        useMaxWidth: true,
        curve: "basis",
      },
    },
    mermaidPlugin: {},
  })
);
