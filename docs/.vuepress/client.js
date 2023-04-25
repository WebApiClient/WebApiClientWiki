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
      ad.classList.add("wwads-cn", "wwads-vertical");
      ad.setAttribute("data-id", "233");
      // 判断屏幕PPI
      if (window.devicePixelRatio <= 2 && window.innerWidth > 480) {
        ad.style.maxWidth = "160px";
        ad.classList.add("wwads-sticky");
        // ad.style.position = "fixed";
        // ad.style.bottom = "0";
        // ad.style.right = "0";
        // ad.style.zIndex = "999";
        const body = document.querySelector("body");
        const firstChild = body.firstElementChild;
        body.insertBefore(ad, firstChild);
      } else {
        document.body.appendChild(ad);
      }
    }
  },
});
