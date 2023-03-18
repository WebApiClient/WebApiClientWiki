import { defineUserConfig } from "vuepress";

export default defineUserConfig({
  port: 3000, // 将端口号从原来的8080修改为3000
  lang: "zh-CN",
  title: "WebApiClient",
  description: "声明，调用！",
  base: "/WebApiClientWiki/", // 或者 '/'
});
