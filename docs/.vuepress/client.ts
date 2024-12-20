// .vuepress/client.js
import { defineClientConfig } from "vuepress/client";
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
        ad.style.position = "fixed";
        ad.style.bottom = "10px";
        ad.style.left = "10px";
        ad.style.zIndex = "999";
        const body = document.querySelector("body");
        if (body) {
          const firstChild = body.firstElementChild;
          body.insertBefore(ad, firstChild);
        }
      } else {
        ad.style.margin = "60px 20px 0px 20px";
        const app = document.getElementById("app");
        // ad.style.position = "fixed";
        // ad.style.top = "0";
        // ad.style.left = "0";
        // ad.style.zIndex = "999";
        document.body.insertBefore(ad, app);
      }
      // 创建一个新的script元素
      const adhelper = document.createElement('script');
      // 设置script的src属性为你的js文件路径
      adhelper.src = '/js/adhelper.js';
      // 将script元素添加到body的末尾
      document.body.appendChild(adhelper);
    }
  },
});
