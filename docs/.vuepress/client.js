// .vuepress/client.js
import { defineClientConfig } from "@vuepress/client";
// import Ad from "./components/ad.vue";

export default defineClientConfig({
  setup() {
    // do some initialization
  },
  // rootComponents: [Ad],
  enhance({ app, router, siteData }) {
    if (typeof window !== "undefined") {
      // 在浏览器环境中执行的代码...
      const ad = document.createElement("div");
      ad.classList.add("wwads-cn", "wwads-vertical", "wwads-sticky");
      ad.setAttribute("data-id", "233");
      ad.style.maxWidth = "180px";
      document.body.appendChild(ad);
    }
  },
});
