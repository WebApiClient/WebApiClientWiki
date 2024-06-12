import { log } from "console";
import fs from "fs";
import path from "path";
import { sidebar } from "vuepress-theme-hope";


function readDirectoryFiles(directoryPath) {
    const folderPath = path.resolve(directoryPath); // 解析为绝对路径
    console.log(folderPath);
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
    console.log(array);
    return array;
}

const sidebarEn = [
    {
        text: "Guide",
        prefix: "/guide/",
        children: [
            { link: "README.md" },
            { link: "getting-started.md" },
            { link: "core-analyzers.md" },
            { link: "config.md" },
            { link: "data-validation.md" },
            { link: "attribute.md" },
            { link: "request.md" },
            { link: "response.md" },
            { link: "log.md" },
            { link: "file-download.md" },
            { link: "interface-demo.md" },
            { link: "retry.md" },
            { link: "source-generator.md" },
            { link: "exception-process.md" },
            { link: "deformed-interface.md" },
            { link: "diy-request-response.md" },
            { link: "http-message-handler.md" },
            { link: "oauths-token.md" },
            { link: "jsonnet.md" },
            { link: "json-rpc.md" },
            { link: "dynamic-host.md" },
            { link: "openapi-sg.md" },
        ],
    },
    {
        text: "Legacy[EOL]",
        prefix: "/old/",
        children: [
            { link: "README.md" },
            { link: "getting-started.md" },
            { link: "qa.md" },
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
                text: "Master",
                prefix: "senior/",
                children: [
                    "filter.md",
                    "global-filter.md",
                    "diy-attribute.md",
                    "exception-retry.md"
                ],
            },
        ],
    },
    {
        text: "Q&A",
        // children: ["/qa/README.md", "/qa/1.md"],
        prefix: "/qa/",
        children: readmeFirst(readDirectoryFiles(path.resolve(__dirname, "../../../qa"))),
    },
];

export const enSidebar = sidebar(sidebarEn);
