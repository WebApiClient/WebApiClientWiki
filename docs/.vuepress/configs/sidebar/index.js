import { log } from "console";
import fs from "fs";
import path from "path";

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

export const sidebarZh = {
  "/guide/": [
    {
      text: "指南[以下菜单可以点击展开]",
      children: [
        "/guide/README.md",
        "/guide/getting-started.md",
        "/guide/core-analyzers.md",
        "/guide/config.md",
        "/guide/data-validation.md",
        "/guide/attribute.md",
        "/guide/request.md",
        "/guide/response.md",
        "/guide/log.md",
        "/guide/file-download.md",
        "/guide/interface-demo.md",
        "/guide/retry.md",
        "/guide/source-generator.md",
        "/guide/exception-process.md",
        "/guide/deformed-interface.md",
        "/guide/diy-request-response.md",
        "/guide/http-message-handler.md",
        "/guide/oauths-token.md",
        "/guide/jsonnet.md",
        "/guide/json-rpc.md",
        "/guide/dynamic-host.md",
        "/guide/openapi-sg.md",
      ],
    },
  ],
  "/old/": [
    {
      text: "旧版本[不再更新]",
      children: [
        "/old/README.md",
        "/old/getting-started.md",
        "/old/qa.md",
        {
          text: "基础",
          children: ["/old/basic/get-head.md", "/old/basic/request-url.md", "/old/basic/post-put-delete.md", "/old/basic/patch.md", "/old/basic/parameter-attribute.md", "/old/basic/parameter-validation.md", "/old/basic/attribute-scope-features.md", "/old/basic/full-demo.md"],
        },
        {
          text: "进阶",
          children: ["/old/advanced/env-without-di.md", "/old/advanced/env-with-di.md"],
        },
        {
          text: "高级",
          children: ["/old/senior/filter.md", "/old/senior/global-filter.md", "/old/senior/diy-attribute.md", "/old/senior/exception-retry.md"],
        },
      ],
    },
  ],
  "/reference/": [],
  "/qa/": [
    {
      text: "社区QA",
      // children: ["/qa/README.md", "/qa/1.md"],
      children: readmeFirst(readDirectoryFiles(path.resolve(__dirname, "../../../qa"))).map((file) => `/qa/${file}`),
    },
  ],
};
