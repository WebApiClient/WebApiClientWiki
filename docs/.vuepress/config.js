import { defineUserConfig } from "vuepress";
import { path } from "@vuepress/utils";
import { defaultTheme } from "@vuepress/theme-default";
import { navbarZh, sidebarZh } from "./configs/index.js";
import { prismjsPlugin } from "@vuepress/plugin-prismjs";
const isProd = process.env.NODE_ENV === "production";

export default defineUserConfig({
  port: 3000, // 将端口号从原来的8080修改为3000
  lang: "zh-CN",
  title: "WebApiClient",
  description: "声明，调用！",
  base: "/", // 或者 '/'
  head: [
    [
      "script",
      {
        src: "https://cdn.wwads.cn/js/makemoney.js",
        type: "text/javascript",
        charset: "UTF-8",
        async: true,
      },
    ],
  ],
  // configure default theme
  theme: defaultTheme({
    logo: "/logo.png",
    repo: "dotnetcore/WebApiClient",
    docsRepo: "WebApiClient/WebApiClientWiki",
    docsDir: "docs",
    docsBranch: "main",

    // theme-level locales config
    locales: {
      // /**
      //  * English locale config
      //  */
      // "/en/": {
      //   // navbar
      //   navbar: navbarEn,
      //   // sidebar
      //   sidebar: sidebarEn,
      //   // page meta
      //   editLinkText: "Edit this page on GitHub",
      // },

      /**
       * Chinese locale config
       */
      "/": {
        // navbar
        navbar: navbarZh,
        selectLanguageName: "简体中文",
        selectLanguageText: "选择语言",
        selectLanguageAriaLabel: "选择语言",
        // sidebar
        sidebar: sidebarZh,
        // page meta
        editLinkText: "在 GitHub 上编辑此页",
        lastUpdatedText: "上次更新",
        contributorsText: "贡献者",
        // custom containers
        tip: "提示",
        warning: "注意",
        danger: "警告",
        // 404 page
        notFound: ["这里什么都没有", "我们怎么到这来了？", "这是一个 404 页面", "看起来我们进入了错误的链接"],
        backToHome: "返回首页",
        // a11y
        openInNewWindow: "在新窗口打开",
        toggleColorMode: "切换颜色模式",
        toggleSidebar: "切换侧边栏",
      },
    },

    themePlugins: {
      // only enable git plugin in production mode
      git: isProd,
      // use shiki plugin in production mode instead
      prismjs: !isProd,
    },
  }),
  plugins: [
    prismjsPlugin({
      preloadLanguages: ["markdown", "csharp", "javascript"],
      // 配置项
    }),
  ],
  clientConfigFile: path.resolve(__dirname, "./client.js"),
});
