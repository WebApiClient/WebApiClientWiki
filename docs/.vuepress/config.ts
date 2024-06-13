import { defineUserConfig } from "vuepress"; import { viteBundler } from '@vuepress/bundler-vite';
import theme from "./theme.js";
import { plugins } from "./plugins.js";
import bundler from "./vite.js";

export default defineUserConfig({
  base: "/",
  port: 3000,
  lang: "zh-CN",
  title: "WebApiClient",
  description: "声明式调用Http接口",
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
    ["link", { rel: "icon", href: "/favicon.ico" }],
  ],
  locales: {

    "/": {
      lang: "zh-CN",
      title: "WebApiClient",
      description: "WebApiClient 的文档站点",
    },
    "/en/": {
      lang: "en-US",
      title: "Docs Demo",
      description: "A docs demo for vuepress-theme-hope",
    },
  },

  theme,
  plugins,
  bundler
  // Enable it with pwa
  // shouldPrefetch: false,
});
