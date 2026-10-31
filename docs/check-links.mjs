#!/usr/bin/env node
/**
 * 静态站内部链接检查器（纯 Node ESM，零依赖）。
 *
 * 用法：
 *   node docs/check-links.mjs [目录]
 *   目录默认为 .vitepress/dist（相对 docs/ 或仓库根运行均可找到）。
 *
 * 规则：
 *   - 递归收集目录下所有 .html 文件；
 *   - 正则抽取每个文件中的 <a href="...">；
 *   - 只检查内部链接（以 / 开头，或相对路径），跳过
 *     http(s)://、mailto:、javascript:、tel:、data: 以及纯 #锚点；
 *   - 去掉 #anchor 与 ?query 后判定目标是否存在：
 *       1) 精确文件
 *       2) xxx/index.html
 *       3) xxx.html
 *       4) 尾斜杠目录（目录本身存在）
 *   - stdout 最后一行输出：LINKCHECK_JSON {"files":<html总数>,"broken":["page -> href",...]}
 *   - broken 非空退出码 1，否则 0。
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const arg = process.argv[2] ?? ".vitepress/dist";
const distRoot = path.resolve(arg);

if (!fs.existsSync(distRoot)) {
  console.error(`[check-links] 目录不存在: ${distRoot}`);
  process.exit(2);
}

// ---------------------------------------------------------------- 遍历 html

function collectHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectHtml(full, out);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

// ------------------------------------------------------------ 提取 <a href>

const HREF_RE = /<a\s[^>]*?href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;

// 语言切换下拉（VPMenuLink/VPLink）会生成指向对侧 locale 的镜像链接；
// 对侧没有对应页面时它天然 404，属 VitePress 已知行为，不属于内容断链，排除。
// 标签值与 .vitepress/config.mts 的 locales 保持一致。
const LOCALE_MENU_LABELS = new Set(["English", "简体中文"]);

function extractHrefs(html) {
  const hrefs = [];
  let m;
  while ((m = HREF_RE.exec(html)) !== null) {
    const href = m[1] ?? m[2] ?? m[3] ?? "";
    const text = (m[4] ?? "").replace(/<[^>]*>/g, "").trim();
    if (href && LOCALE_MENU_LABELS.has(text)) continue;
    hrefs.push(href);
  }
  return hrefs;
}

// ------------------------------------------------------------------ 判定

function isExternal(href) {
  return (
    /^(?:[a-zA-Z][a-zA-Z0-9+.-]*:)/.test(href) || // scheme: http(s) mailto javascript tel data ...
    href.startsWith("//") // 协议相对地址
  );
}

/** 将 href 解析为 dist 内的绝对路径；返回 null 表示无需检查 */
function resolveTarget(href, pagePath) {
  if (!href || isExternal(href)) return null;
  if (href.startsWith("#")) return null; // 纯锚点

  let clean = href.split("#")[0].split("?")[0];
  if (!clean || clean === "") return null; // href="?x" / href="#a" 之类
  if (isExternal(clean)) return null;

  if (clean.startsWith("/")) {
    return path.join(distRoot, clean);
  }
  // 相对路径：相对当前 html 文件所在目录解析
  return path.resolve(path.dirname(pagePath), clean);
}

function targetExists(fsPath) {
  // 1) 精确文件
  if (fs.existsSync(fsPath)) {
    const st = fs.statSync(fsPath);
    if (st.isFile()) return true;
    // 目录（无论尾斜杠）→ index.html 判定兜底
    if (st.isDirectory()) {
      return (
        fs.existsSync(path.join(fsPath, "index.html")) ||
        fs.existsSync(fsPath + ".html")
      );
    }
  }
  // 2) xxx/index.html
  if (fs.existsSync(path.join(fsPath, "index.html"))) return true;
  // 3) xxx.html
  if (fs.existsSync(fsPath + ".html")) return true;
  // 4) 尾斜杠目录：保持入参原样（含尾斜杠）检查目录本身
  const withSep = fsPath.endsWith(path.sep) ? fsPath : fsPath + path.sep;
  if (fs.existsSync(withSep)) return true;
  return false;
}

// ------------------------------------------------------------------ 主流程

const htmlFiles = collectHtml(distRoot);
const broken = [];

for (const page of htmlFiles) {
  const html = fs.readFileSync(page, "utf8");
  const relPage = path.relative(distRoot, page).split(path.sep).join("/");
  for (const href of extractHrefs(html)) {
    const target = resolveTarget(href, page);
    if (target === null) continue;
    if (!targetExists(target)) {
      broken.push({ page: relPage, href });
    }
  }
}

for (const { page, href } of broken) {
  console.error(`[broken] ${page} -> ${href}`);
}

console.log(
  "LINKCHECK_JSON " +
    JSON.stringify({
      files: htmlFiles.length,
      broken: broken.map(({ page, href }) => `${page} -> ${href}`),
    })
);

process.exit(broken.length > 0 ? 1 : 0);
