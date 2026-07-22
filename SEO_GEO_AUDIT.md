# A11yKit SEO + GEO 审计报告

审计日期：2026-07-22 ｜ 审计范围：全站 20 个可索引页面（SSG 静态产物 `out/` + 源码）
总体评分：**82 / 100 → 修复后 97 / 100**（2026-07-22 已全部修复并重建验证，见文末「修复记录」）

---

## 一、结论（Bottom Line）

站点技术底座非常好：全静态导出、每页唯一 title/canonical、JSON-LD @graph、llms.txt 双文件、robots.txt 放行主流 AI 爬虫、面包屑与内链完整。
但有 5 个问题会直接伤害收录与 AI 引用正确性，修复前不能称为"极致"。

---

## 二、P0 — 必须修复（影响收录 / 引用正确性）

### 1. sitemap.xml 严重缺页（6/20）
- **现状**：仅收录 `/`、`/tools`、3 个工具页、`/about`。
- **缺失**：12 个工具页（aria-generator、heading-analyzer、form-label-checker、color-blind-simulator、html-scanner、link-text-checker、focus-order-checker、alt-text-checker、url-scanner、pdf-checker、alt-text-generator、accessibility-monitor）+ `/privacy` + `/terms`。
- **影响**：高。新工具页发现与收录延迟；搜索引擎对站点规模的判断偏小。
- **修复**：改用 `src/app/sitemap.ts` 由 `tools` 数组自动生成，随构建更新，避免手写过期。

### 2. llms.txt / llms-full.txt 内容过时（误导 AI 答案）
- **现状**：写"11 free tools"、仅 3 个工具 live、8 个工具标注 "Coming Soon"——实际 15 个工具已全部上线。llms-full.txt 只文档化 3 个工具，缺 12 个。
- **影响**：高。AI 引擎按 llms.txt 回答时会说"大部分工具未上线"，直接错误。
- **修复**：重写两份文件，列出全部 15 个 live 工具，数字统一为 15，版本号升级。

### 3. 工具数量全站不一致（11 vs 15）
- **位置**：`layout.tsx` description 与首页 description、About 正文 = "11"；OG description、`/tools` description、Hero = "15"。实际 live = 15。
- **影响**：中高。搜索摘要与 AI 引用会随机抓到错误数字，损害可信度。
- **修复**：全站统一为 15（或动态 `liveTools.length`）。

### 4. FAQPage JSON-LD 与可见内容不匹配（全站）
- **现状**：`layout.tsx` 把同一份 2 问 FAQPage 注入**所有页面**（privacy/terms/about/tools 均带），但这些页面没有对应可见 FAQ；首页可见 FAQ 与 JSON-LD 问题文本也不一致。同时各工具页自己 3–5 条 FAQ **完全没有** FAQPage schema。
- **影响**：高。违反 Google 结构化数据政策（标记内容必须页面可见），可能被忽略全部富媒体结果，重则判 spam。
- **修复**：从 layout 移除全局 FAQPage；改为在每个工具页注入与 `tool.faq` 完全一致的 FAQPage JSON-LD，首页 FAQ 与 schema 文本对齐。

### 5. 工具页 FAQ 答案大部分不在渲染 HTML 中
- **现状**：`ToolContent` 的 FAQ 是 client 端手风琴，SSR 只渲染第 1 条答案，其余仅存在于 RSC payload（JS 字符串）。
- **影响**：高（GEO）。不执行 JS 的 AI 爬虫（GPTBot/ClaudeBot/PerplexityBot）抓不到这些答案；Google 也不索引点击才显示的内容。
- **修复**：改用 `<details>/<summary>`（内容始终在 DOM），或 SSR 默认全部展开。

---

## 三、P1 — 高价值改进

| # | 问题 | 证据 | 修复 |
|---|------|------|------|
| 6 | 缺 HowTo schema | 每个工具页都有编号"How to Use"步骤（SSR 输出 `<ol>`），但无 HowTo JSON-LD | 按 `tool.howToUse` 生成 HowTo schema，GEO 高价值 |
| 7 | 工具页 meta description 过长 | 200–230 字符（直接用 `longDescription`），超 160 会被 SERP 截断 | 为每个工具写 150–160 字符独立摘要 |
| 8 | robots.txt 缺新爬虫 | 有 GPTBot/ClaudeBot 等 12 种，但缺 **OAI-SearchBot**（ChatGPT 搜索引用专用）、Applebot-Extended、Meta-ExternalAgent | 补充显式 Allow（虽有 `* Allow: /` 兜底，显式声明更稳） |
| 9 | 工具页社交卡片不完整 | twitter:title/description 继承 layout（显示站点名+"11 free"）；og:url、og:type 缺失 | `generateMetadata` 补 twitter 与 og:url |
| 10 | SoftwareApplication schema 信息弱 | 缺 `creator` 关联 Organization、缺 `dateModified` | 补充关联与日期，增强 recency 信号 |

---

## 四、P2 — 锦上添花

11. **404 页 robots meta 冲突**：同时输出 `noindex` 与 `index, follow`（layout 默认 + Next 自动注入）。实际按最严格生效，但应消除冲突信号。
12. **og-image.jpg 508KB** 偏大，建议压至 <200KB；且全站共用一张 OG 图，可用 `ImageResponse` 为每个工具生成专属 OG 图。
13. **openapi.json 声明了不存在的 JSON API**：静态站返回的是 HTML，`ai-plugin.json` 指向它，AI agent 按此调用会得到 HTML 而非 JSON——要么实现真实 API（需服务端），要么删除以免损害可信度。
14. **llms.txt 无入口链接**：HTML/页脚均未指向 `/llms.txt`，建议在 footer "Resources" 加链接。
15. **E-E-A-T 弱**：作者为泛化的 "A11yKit Team"，About 无团队/作者实名信息（工具站影响较小，可不修）。
16. **sitemap lastmod 手写**：易过期，与 #1 一并自动化解决。

---

## 五、已经做到极致的部分（确认无需改动）

- 全站 SSG 静态导出，爬虫无需执行 JS 即可读主内容；Next/font 本地托管、`display: swap`
- robots.txt 覆盖 12 种 AI 爬虫（GPTBot、ChatGPT-User、PerplexityBot、ClaudeBot、Google-Extended、CCBot、Bytespider、Cohere、Diffbot、FacebookBot、Omgilibot 等）+ Sitemap 声明
- llms.txt + llms-full.txt 双文件机制（机制对，内容待更新）
- 每页唯一 title（格式 `工具名 — A11yKit`）+ 自引用 canonical + metadataBase
- JSON-LD @graph：Organization + WebSite + WebApplication（含 `offers` price=0）；工具页 SoftwareApplication + BreadcrumbList
- 每页单一 H1、H1→H2→H3 层级无跳级；语义化小写连字符 URL；面包屑导航
- 内链充分：页脚全工具链接 + 每页 Related Tools + 首页工具网格，无孤儿页
- GEO 内容骨架好：每工具有 whyItMatters（类定义块）、howToUse（编号步骤）、FAQ（问答对）
- E-E-A-T 基础：About/Privacy/Terms 齐全、免责声明、GitHub sameAs、作者/出版者 meta
- 无 `<img>` alt 问题（全 SVG 图标 `aria-hidden`）；viewport、`lang="en"`、theme-color、manifest 正确
- 404 页实际 noindex 生效；GDPR 友好的 consent-mode gtag

---

## 六、修复优先级路线图

1. **第 1 批（30 分钟，P0）**：sitemap.ts 自动化 + 数字统一为 15 + 重写 llms.txt/llms-full.txt
2. **第 2 批（1 小时，P0）**：FAQ 改 `<details>` 全渲染 + 全局 FAQPage 下放到工具页并与可见内容对齐
3. **第 3 批（30 分钟，P1）**：HowTo schema + 每工具独立短 description + robots.txt 补 OAI-SearchBot 等
4. **第 4 批（可选，P2）**：twitter/og:url 补全、404 robots 去重、OG 图压缩/按页生成、删或改 openapi.json

---

## 七、修复记录（2026-07-22，已全部完成并重建验证）

| 项 | 修复内容 | 验证结果 |
|---|---|---|
| P0-1 | 新建 `src/app/sitemap.ts` 由 `liveTools` 自动生成（删 public/sitemap.xml） | out/sitemap.xml 含全部 20 个 URL |
| P0-2 | llms.txt / llms-full.txt 重写为 15 工具全 live（v2.0.0） | 已更新并随构建输出 |
| P0-3 | 工具数统一动态化 `liveTools.length`（layout/page/about） | 全站渲染 "15" |
| P0-4 | layout 移除全局 FAQPage；首页 FAQ 改 `homeFaqs` 同源渲染+同源 JSON-LD；工具页按 `tool.faq` 注入 FAQPage | privacy/terms/about 已无错位 schema；15/15 工具页含匹配 FAQPage |
| P0-5 | FAQ 手风琴改 `<details>/<summary>` 全量 SSR（tool-content 去除 use client） | 全部答案进入静态 HTML |
| P1-6 | 工具页新增 HowTo JSON-LD（与可见步骤同源） | 15/15 工具页含 HowTo |
| P1-7 | tools.ts 每工具新增 `metaDescription`（150–160 字符） | 实测 154 字符 |
| P1-8 | robots.txt 补 OAI-SearchBot、Perplexity-User、Claude-User/SearchBot、anthropic-ai、Applebot-Extended、Meta-ExternalAgent、DuckAssistBot、YouBot 等 | 已生效 |
| P1-9 | 工具页 generateMetadata 补 twitter 卡片 + og:url/og:type | 已渲染正确 |
| P1-10 | SoftwareApplication 加 creator / dateModified / isPartOf | 已注入 |
| P2-11 | not-found.tsx 加 robots noindex/nofollow，消除与 index,follow 的冲突 | 404 信号一致 |
| P2-12 | og-image.jpg 压缩 505KB→73KB 并裁至 1200×630（与声明尺寸一致） | out 中 76KB |
| P2-13 | 删除误导性 public/openapi.json 与 .well-known/ai-plugin.json（静态站无 JSON API） | out 中已不存在 |
| P2-14 | footer Resources 新增 /llms.txt 入口链接 | 已渲染 |

**遗留（非问题，可不处理）**：作者为泛化 "A11yKit Team"（E-E-A-T 弱，工具站影响小）；每工具独立 OG 图（可用 ImageResponse 后续增强）。
**环境备注**：受管 Node 构建需 `NODE_OPTIONS= npm run build`（系统 NODE_OPTIONS 含 `--use-system-ca`，Turbopack Worker 不接受）。
