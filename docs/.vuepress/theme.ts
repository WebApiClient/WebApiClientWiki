import { hopeTheme } from "vuepress-theme-hope";
import { enNavbar, zhNavbar } from "./configs/navbar/index.js";
import { enSidebar, zhSidebar } from "./configs/sidebar/index.js";
import { slimsearchPlugin } from '@vuepress/plugin-slimsearch'

export default hopeTheme({
  logo: "icon.png",
  favicon: "favicon.ico",
  repo: "dotnetcore/WebApiClient",
  docsRepo: "WebApiClient/WebApiClientWiki",
  docsDir: "docs",
  docsBranch: "main",
  darkmode: "toggle",
  fullscreen: true,
  locales: {
    /**
     *  Chinese locale config
     */
    "/": {
      // navbar
      navbar: zhNavbar,
      // sidebar
      sidebar: zhSidebar,
      displayFooter: false,
      // page meta
      metaLocales: {
        editLink: "在 GitHub 上编辑此页",
      },
    },
    "/en/": {
      // navbar
      navbar: enNavbar,
      // sidebar
      sidebar: enSidebar,
      displayFooter: false,
      metaLocales: {
        editLink: "Edit this page on GitHub",
      },
    },
    // All features are enabled for demo, only preserve features you need here



  },

  markdown: {
    alert: true,
    align: true,
    attrs: true,
    component: true,
    demo: true,
    figure: true,
    imgLazyload: true,
    imgSize: true,
    include: true,
    mark: true,
    plantuml: true,
    spoiler: true,
    stylize: [
      {
        matcher: "Recommended",
        replacer: ({ tag }) => {
          if (tag === "em")
            return {
              tag: "Badge",
              attrs: { type: "tip" },
              content: "Recommended",
            };
        },
      },
    ],
    sub: true,
    sup: true,
    tabs: true,
    tasklist: true,
    vPre: true,
    // Install chart.js before enabling it
    // chart: true,

    // insert component easily

    // Install echarts before enabling it
    // echarts: true,

    // Install flowchart.ts before enabling it
    // flowchart: true,

    // gfm requires mathjax-full to provide tex support
    // gfm: true,

    // Install katex before enabling it
    // katex: true,

    // Install mathjax-full before enabling it
    // mathjax: true,

    // Install mermaid before enabling it
    // mermaid: true,

    // playground: {
    //   presets: ["ts", "vue"],
    // },

    // Install reveal.js before enabling it
    // revealJs: {
    //   plugins: ["highlight", "math", "search", "notes", "zoom"],
    // },

    // Install @vue/repl before enabling it
    // vuePlayground: true,

    // Install sandpack-vue3 before enabling it
    // sandpack: true,
  },
  plugins: {
    components: {
      components: ["Badge", "VPCard"],
    },
    slimsearch: {
      filter: page => !page.path.startsWith("/old"),
      indexContent: true
    },
    icon: {
      assets: "fontawesome"
    },
    // Install @vuepress/plugin-pwa and uncomment these if you want a PWA
    // pwa: {
    //   favicon: "/favicon.ico",
    //   cacheHTML: true,
    //   cacheImage: true,
    //   appendBase: true,
    //   apple: {
    //     icon: "/assets/icon/apple-icon-152.png",
    //     statusBarColor: "black",
    //   },
    //   msTile: {
    //     image: "/assets/icon/ms-icon-144.png",
    //     color: "#ffffff",
    //   },
    //   manifest: {
    //     icons: [
    //       {
    //         src: "/assets/icon/chrome-mask-512.png",
    //         sizes: "512x512",
    //         purpose: "maskable",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-mask-192.png",
    //         sizes: "192x192",
    //         purpose: "maskable",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //     ],
    //     shortcuts: [
    //       {
    //         name: "Demo",
    //         short_name: "Demo",
    //         url: "/demo/",
    //         icons: [
    //           {
    //             src: "/assets/icon/guide-maskable.png",
    //             sizes: "192x192",
    //             purpose: "maskable",
    //             type: "image/png",
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // },
  },
});
