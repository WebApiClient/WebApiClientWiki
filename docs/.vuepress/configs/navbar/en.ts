import { navbar } from "vuepress-theme-hope";

const navbarEn = [
    {
        text: "Guide",
        link: "/guide/",
    },
    {
        text: "Q&A",
        link: "/qa/",
    },
    {
        text: "Legacy[EOL]",
        link: "/old/",
    },
    {
        text: "Donate",
        link: "/reference/donate",
    },
];

export const enNavbar = navbar(navbarEn);