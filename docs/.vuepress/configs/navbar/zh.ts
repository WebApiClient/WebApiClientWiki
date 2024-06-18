import { navbar } from "vuepress-theme-hope";

const navbarZh = [
    {
        text: "指南",
        icon: "home",
        link: "/guide/",
    },
    {
        text: "旧版本[不再更新]",
        icon: "folder",
        link: "/old/",
    },
    {
        text: "支持我们",
        icon: "donate",
        link: "/reference/donate",
    },
];
export const zhNavbar = navbar(navbarZh);
