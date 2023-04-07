import { defineUserConfig } from "vuepress";
import { defaultTheme } from "@vuepress/theme-default";
import { navbarZh, sidebarZh } from "./configs/index.js";
const isProd = process.env.NODE_ENV === "production";

export default defineUserConfig({
  port: 3000, // 将端口号从原来的8080修改为3000
  lang: "zh-CN",
  title: "WebApiClient",
  description: "声明，调用！",
  base: "/WebApiClientWiki/", // 或者 '/'
  // configure default theme
  theme: defaultTheme({
    logo: "/logo.png",
    repo: "dotnetcore/WebApiClient",
    docsDir: "docs",

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
        notFound: [
          "这里什么都没有",
          "我们怎么到这来了？",
          "这是一个 404 页面",
          "看起来我们进入了错误的链接",
        ],
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
  // head: [
  //   // 在 BootCDN 上引入 Prism.js 核心库
  //   [
  //     "script",
  //     {
  //       src: "https://cdn.bootcdn.net/ajax/libs/prism/1.29.0/components/prism-core.min.js",
  //     },
  //   ],
  //   // 在 BootCDN 上引入 JavaScript 语言库
  //   [
  //     "script",
  //     {
  //       src: "https://cdn.bootcdn.net/ajax/libs/prism/1.29.0/components/prism-javascript.min.js",
  //     },
  //   ],
  //   // 在 BootCDN 上引入 CSS 样式文件
  //   [
  //     "link",
  //     {
  //       rel: "stylesheet",
  //       href: "https://cdn.bootcdn.net/ajax/libs/prism/1.29.0/themes/prism.min.css",
  //     },
  //   ],
  // ],
  plugins: [
    "@vuepress/plugin-prismjs",
    //暂时只需要使用默认的Prism.js
    // [
    //   "@vuepress/plugin-shiki",
    //   {
    //     theme: "nord",
    //   },
    // ],
  ],
});
