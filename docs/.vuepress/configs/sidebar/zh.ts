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

const sidebarZh = {

  "/guide/": [
    "1_getting-started",
    "2_attributes",
    "3_special-type",
    "4_data-validation",
    "5_advanced",
    "6_auth-token-extension",
    "7_json-net-extension",
    "8_jsonrpc-extension",
    "9_openapi-to-code",
  ],
  "/old/": [{
    text: "旧版本[不再更新]",
    prefix: "/old/",
    children: [
      "getting-started.md",
      "qa.md",
      {
        text: "基础",
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
        text: "进阶",
        prefix: "advanced/",
        children: [
          "env-without-di.md",
          "env-with-di.md"
        ],
      },
      {
        text: "高级",
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
  "/qa/": [{
    text: "社区QA",
    // children: ["/qa/README.md", "/qa/1.md"],
    prefix: "/qa/",
    children: readmeFirst(readDirectoryFiles(path.resolve(__dirname, "../../../qa"))),
  }]
};

export const zhSidebar = sidebar(sidebarZh);
