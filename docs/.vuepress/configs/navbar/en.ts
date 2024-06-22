import { navbar } from "vuepress-theme-hope";

const navbarEn = [
    {
        text: "Guide",
        link: "/en/guide/",
    },
    {
        text: "Legacy[EOL]",
        link: "/en/old/",
    },
    {
        text: "Donate",
        link: "/en/reference/donate",
    },
];

export const enNavbar = navbar(navbarEn);