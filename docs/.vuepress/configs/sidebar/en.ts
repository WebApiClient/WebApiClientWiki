import fs from "fs";
import path from "path";
import { sidebar } from "vuepress-theme-hope";


function readDirectoryFiles(directoryPath) {
    const folderPath = path.resolve(directoryPath); // 解析为绝对路径
    // console.log(folderPath);
    try {
        const files = fs.readdirSync(folderPath);
        return files;
    } catch (error) {
        console.error("Error reading folder:", error);
        return [];
    }
}
function readmeFirst(array) {
    const index = array.indexOf("README.md");
    if (index != -1) {
        array.splice(index, 1);
        array.unshift("README.md");
    }
    return array;
}

const sidebarEn = {

    "/guide/": [
        {
            text: "Guide",
            prefix: "/guide/",
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
    "/old/": [{
        text: "Legacy[EOL]",
        prefix: "/old/",
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
                text: "Intermediate",
                prefix: "advanced/",
                children: [
                    "env-without-di.md",
                    "env-with-di.md"
                ],
            },
            {
                text: "Advanced",
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
