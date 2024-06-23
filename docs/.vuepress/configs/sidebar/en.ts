import { sidebar } from "vuepress-theme-hope";


const sidebarEn = {

    "/en/guide/": [
        {
            text: "Guide[Machine translation]",
            prefix: "/en/guide/",
            link: "/en/guide/",
            collapsible: false,
            children: [
                "1_getting-started",
                "2_attributes",
                "3_special-type",
                "4_data-validation",
                "5_advanced",
                "6_auth-token-extension",
                "7_json-net-extension",
                "8_jsonrpc-extension",
                "9_openapi-to-code",
            ]
        }],
    "/en/old/": [{
        text: "Legacy[EOL]",
        prefix: "/en/old/",
        children: [
            "getting-started.md",
            "qa.md",
            {
                text: "Basic",
                prefix: "basic/",
                children: [
                    "get-head.md",
                    "request-url.md",
                    "post-put-delete.md",
                    "patch.md",
                    "parameter-attribute.md",
                    "parameter-validation.md",
                    "attribute-scope-features.md",
                    "full-demo.md"
                ],
            },
            {
                text: "Advanced",
                prefix: "advanced/",
                children: [
                    "env-without-di.md",
                    "env-with-di.md"
                ],
            },
            {
                text: "Senior",
                prefix: "senior/",
                children: [
                    "filter.md",
                    "global-filter.md",
                    "diy-attribute.md",
                    "exception-retry.md"
                ],
            },
        ],
    }],
};

export const enSidebar = sidebar(sidebarEn);
