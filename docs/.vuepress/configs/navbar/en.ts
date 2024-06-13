import { navbar } from "vuepress-theme-hope";

const navbarEn = [
    {
        text: "Guide",
        link: "/guide/",
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