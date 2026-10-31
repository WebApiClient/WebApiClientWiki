import fs from "node:fs";
import path from "node:path";
import type MarkdownIt from "markdown-it";
import type Renderer from "markdown-it/lib/renderer.mjs";

/**
 * VitePress 的全局 <Content /> 组件不支持 path prop（那是 VuePress 2 的行为；
 * VitePress 1.x 中 <Content path="..."/> 会渲染当前页自身组件，导致 SSR 无限递归）。
 *
 * 本插件在 markdown 渲染期将
 *   <Content path="/reference/tags.md" />
 * 内联为目标 markdown 文件的渲染结果，等价于 VuePress 2 的语义：
 *   - 剥离目标文件的 BOM 与 frontmatter；
 *   - 嵌套 parse/render 共用同一个 env：目标文件中的 <script setup> 会被
 *     VitePress 的 sfc 插件提取并提升到外层页面的 SFC，链接与 mermaid
 *     代码块也走完全相同的渲染管线（含死链检测）；
 *   - 渲染后恢复外层 env.headers，避免污染当前页大纲；
 *   - 递归深度限制，防御 include 环。
 *
 * 说明：VitePress 的 componentPlugin 会把自闭合组件标签从 html_block
 * 规则分流为 html_inline token，因此 html_block 与 html_inline 都要覆盖。
 */

const CONTENT_RE =
  /^\s*<Content\s+path\s*=\s*(["'])([^"']+)\1\s*\/?\s*>\s*$/i;

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
const MAX_DEPTH = 5;

export function mdContentIncludePlugin(md: MarkdownIt, docsDir: string): void {
  // markdown.config 回调运行于 VitePress 内置插件（含 sfc 插件）安装之后，
  // 保存内置链末端规则，在其后继续调用以保留 <script setup>/<style> 的
  // 提取行为（html_block）。
  const nextHtmlBlock =
    md.renderer.rules.html_block ?? ((t, i) => t[i].content);
  const nextHtmlInline =
    md.renderer.rules.html_inline ?? ((t, i) => t[i].content);

  let depth = 0;

  const renderInclude = (
    rawPath: string,
    options: MarkdownIt.Options,
    env: any
  ): string => {
    const rel = rawPath.replace(/^\/+/, "");
    const file = path.resolve(docsDir, rel);

    if (!fs.existsSync(file)) {
      return `<!-- md-content-include: file not found: ${rawPath} -->`;
    }

    let src = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    src = src.replace(FRONTMATTER_RE, "");

    const savedHeaders = env.headers;
    depth++;
    try {
      const nested = md.parse(src, env);
      return md.renderer.render(nested, options, env);
    } finally {
      depth--;
      env.headers = savedHeaders;
    }
  };

  md.renderer.rules.html_inline = ((
    tokens: any[],
    idx: number,
    options: MarkdownIt.Options,
    env: any,
    self: any
  ) => {
    const token = tokens[idx];
    const m = token.content.match(CONTENT_RE);
    if (m && depth < MAX_DEPTH) {
      return renderInclude(m[2], options, env);
    }
    return nextHtmlInline(tokens, idx, options, env, self);
  }) as Renderer.RenderRule;

  md.renderer.rules.html_block = ((
    tokens: any[],
    idx: number,
    options: MarkdownIt.Options,
    env: any,
    self: any
  ) => {
    const token = tokens[idx];
    if (!token.content.includes("<Content") || depth >= MAX_DEPTH) {
      return nextHtmlBlock(tokens, idx, options, env, self);
    }

    const out: string[] = [];
    const passthrough: string[] = [];

    const flushPassthrough = () => {
      if (passthrough.length > 0) {
        out.push(passthrough.join("\n"));
        passthrough.length = 0;
      }
    };

    for (const rawLine of token.content.split(/\r?\n/)) {
      const m = rawLine.match(CONTENT_RE);
      if (!m) {
        passthrough.push(rawLine);
        continue;
      }
      flushPassthrough();
      out.push(renderInclude(m[2], options, env));
    }
    flushPassthrough();

    return out.join("\n");
  }) as Renderer.RenderRule;
}
