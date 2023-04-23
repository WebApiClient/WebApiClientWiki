// .vuepress/client.js
import { defineClientConfig } from "@vuepress/client";
import Ad from "./components/ad.vue";

export default defineClientConfig({
  setup() {
    // do some initialization
  },
  rootComponents: [Ad],
  enhance({ app, router, siteData }) {
    // register Ad as a global component
    app.component("Ad", Ad);
  },
});
