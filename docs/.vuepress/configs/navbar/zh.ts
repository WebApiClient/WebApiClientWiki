import { navbar } from "vuepress-theme-hope";

const navbarZh = [
    {
        text: "指南",
        link: "/guide/",
    },
    {
        text: "社区Q&A",
        link: "/qa/",
    },
    {
        text: "旧版本[不再更新]",
        link: "/old/",
    },
    {
        text: "支持我们",
        link: "/reference/donate",
    },
];
export const zhNavbar = navbar(navbarZh);
