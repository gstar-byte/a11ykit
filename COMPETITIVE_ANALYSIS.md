# A11yKit 竞品对比分析（2026-07-17）

## 10 个搜索关键词

1. accessibility checker tool online free
2. WCAG compliance checker tool
3. color contrast checker WCAG
4. accessibility statement generator
5. ARIA generator accessibility tool
6. color blind simulator online tool
7. website accessibility scanner URL
8. WCAG checklist tool online
9. PDF accessibility checker online
10. alt text generator AI image accessibility

---

## Top 10 竞争对手

| # | 竞品 | URL | 核心定位 |
|---|------|-----|----------|
| 1 | accessibility-check.ai | accessibility-check.ai | 多工具平台（扫描+对比度+声明+PDF+alt text+EAA检查） |
| 2 | accessibility.build | accessibility.build | AI 驱动多工具（代码生成+alt text+声明生成） |
| 3 | WAVE / WebAIM | wave.webaim.org | 行业标杆（浏览器插件+在线扫描+API+对比度） |
| 4 | WCAGKit | wcagkit.com | 多工具平台（扫描+声明+WCAG参考） |
| 5 | AccessibilityChecker.org (ACE) | accessibilitychecker.org | 企业级扫描（100+规则+域名爬虫+AI修复） |
| 6 | accessiBe (accessScan) | accessibe.com/accessscan | AI 扫描+修复生态 |
| 7 | DaltonLens | daltonlens.org | 最专业色盲模拟（多算法+Pyodide+桌面版） |
| 8 | AltText.ai | alttext.ai | 最强 alt text 生成（130+语言+WordPress/Shopify插件+API） |
| 9 | WebAccessIQ | webaccessiq.com | 最全 PDF 检查（veraPDF+PDF/UA-1+URL上传+站点爬虫） |
| 10 | Tembrica | tembrica.com | 色盲模拟（7种+严重度+Daltonize+分屏对比+PNG下载） |

---

## 详细功能对比矩阵

### 1. URL/网站扫描

| 功能 | A11yKit | accessibility-check.ai | WAVE | ACE | accessiBe | WCAGKit | A11yScope |
|------|---------|------------------------|------|-----|-----------|---------|-----------|
| 单页 URL 扫描 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 多页爬虫扫描 | ✅ (10页) | ✅ (100页) | ✅ (API) | ✅ (全域名) | ❌ | ❌ | ❌ |
| WCAG 2.2 规则 | ✅ (20+规则) | ✅ (55条) | ✅ | ✅ (100+) | ✅ | ✅ | ✅ (38+) |
| axe-core 引擎 | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| 无需注册 | ✅ | ✅ (5次/月) | ✅ | ✅ | ✅ | ✅ | ✅ |
| 无扫描次数限制 | ✅ | ❌ (5次/月) | ✅ | ✅ | ✅ | ✅ | ✅ |
| 纯客户端 | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| 导出 JSON/MD/HTML | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| EAA 合规检查 | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| 扫描结果存 localStorage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**A11yKit 优势**：纯客户端、无限制、扫描结果可导入声明生成器
**A11yKit 劣势**：扫描规则少于 ACE(100+) 和 accessibility-check.ai(55条)，无 axe-core 引擎

### 2. 颜色对比度检查

| 功能 | A11yKit | WebAIM | W3Schools | BrowserUtils | colorconvert.net | contrast-finder.org |
|------|---------|--------|-----------|--------------|-------------------|---------------------|
| WCAG AA/AAA | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| APCA 评分 (WCAG 3) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Alpha 透明度 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 合规色建议 | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| 亮度滑块 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| EyeDropper 吸管 | ✅ | ✅ (浏览器原生) | ❌ | ❌ | ❌ | ❌ |
| 批量测试 | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| API | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 纯客户端 | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |

**A11yKit 优势**：唯一同时提供 APCA + 合规色建议 + 亮度滑块 + 吸管的免费工具
**A11yKit 劣势**：无批量测试、无 API

### 3. 无障碍声明生成器

| 功能 | A11yKit | W3C WAI | WCAGKit | AccessProof | accessibility.build | Nomensa |
|------|---------|---------|--------|-------------|---------------------|---------|
| HTML 导出 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Markdown 导出 | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| TXT 导出 | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| PDF 导出 | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| 多模板 | ✅ (4种) | ❌ | ❌ | ❌ | ✅ (4种) | ❌ |
| 合规证书 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 扫描结果导入 | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| AI 自动生成 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 多法规支持 | ✅ (EAA/ADA/508/AODA) | ✅ | ✅ (WCAG) | ✅ (EAA/ADA) | ✅ | ✅ |
| 多语言 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 纯客户端 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

**A11yKit 优势**：唯一提供 AI 自动生成 + 合规证书 + 4 种模板 + 扫描结果导入的免费工具
**A11yKit 劣势**：无 PDF 导出、无多语言

### 4. ARIA 生成器

| 功能 | A11yKit | InvernessDesignStudio | Infyways | accessibility.build | Workik AI |
|------|---------|----------------------|----------|---------------------|-----------|
| 预定义模式 | ✅ (10+) | ✅ (6) | ✅ (11) | ❌ (AI生成) | ❌ (AI生成) |
| HTML/JSX 切换 | ✅ | ✅ | ❌ | ❌ | ✅ |
| 自定义 ID/class | ✅ | ❌ | ✅ | ❌ | ❌ |
| 必填属性验证 | ✅ | ❌ | ✅ | ❌ | ❌ |
| Live Region 模式 | ✅ (4种) | ❌ | ❌ | ❌ | ✅ |
| 键盘交互说明 | ✅ | ❌ | ✅ | ✅ | ✅ |
| AI 生成任意组件 | ❌ | ❌ | ❌ | ✅ (2 credits) | ✅ |
| ARIA 参考文档 | ❌ | ❌ | ✅ | ✅ | ❌ |
| 纯客户端 | ✅ | ✅ | ✅ | ❌ | ❌ |

**A11yKit 优势**：最全面的免费 ARIA 模式库 + Live Region + HTML/JSX + 自定义 ID/class
**A11yKit 劣势**：无 AI 生成任意组件、无 ARIA 参考文档

### 5. 色盲模拟器

| 功能 | A11yKit | DaltonLens | colorblindsimulator.app | Tembrica | W3Schools | Visiblytics |
|------|---------|------------|------------------------|----------|-----------|-------------|
| 8 种视觉类型 | ✅ | ✅ | ✅ | ✅ (7) | ✅ (4) | ✅ (8) |
| 严重度滑块 | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Daltonize 校正 | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| PNG 下载 | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| 调色板模式 | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| CSS 变量输出 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| UI 预览模式 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 图片上传 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 摄像头实时 | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| 网站截图模拟 | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| 分屏对比 | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| 多算法选择 | ❌ | ✅ (6种) | ❌ | ❌ | ❌ | ❌ |
| 色盲测试 | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| 纯客户端 | ✅ | ✅ (Pyodide) | ✅ | ✅ | ✅ | ✅ |

**A11yKit 优势**：唯一同时提供 3 种模式（图片/调色板/UI预览）+ Daltonize + CSS 变量输出
**A11yKit 劣势**：无摄像头、无网站截图、无分屏对比、无多算法选择

### 6. WCAG 检查清单

| 功能 | A11yKit | WebAbility | ToolBolt | DevToolbox | a11ychecklists | thefrontkit |
|------|---------|------------|----------|-----------|----------------|-------------|
| WCAG 2.2 | ✅ (86条) | ❌ (2.1) | ❌ (2.1) | ❌ (2.1) | ✅ (2.2) | ✅ (2.2) |
| A/AA/AAA 分级 | ✅ | ✅ (AA) | ✅ | ✅ | ✅ | ✅ (A/AA) |
| POUR 原则筛选 | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| localStorage 保存 | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| 导出 JSON/MD | ✅ | ✅ (PDF) | ✅ (TXT) | ✅ (JSON/MD) | ✅ | ❌ |
| Pass/Fail/N/A | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| 进度条 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**A11yKit 优势**：WCAG 2.2 最新版 + 86 条全覆盖 + POUR 筛选 + JSON/MD 导出
**A11yKit 劣势**：无 Pass/Fail/N/A 三态标记（仅勾选/未勾选）

### 7. PDF 无障碍检查

| 功能 | A11yKit | WebAccessIQ | ReflowPDF | thelatexlab | PDFAudit |
|------|---------|-------------|-----------|-------------|----------|
| 标签结构检查 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 文档语言 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 标题元数据 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 书签/大纲 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 可提取文本 | ✅ | ✅ | ✅ | ✅ | ✅ |
| PDF/UA-1 完整验证 | ❌ | ✅ (veraPDF) | ✅ (veraPDF) | ✅ | ✅ (veraPDF) |
| URL 上传 | ❌ | ✅ | ❌ | ❌ | ✅ |
| 页面缩略图 | ❌ | ❌ | ✅ | ❌ | ❌ |
| MathML 检查 | ❌ | ❌ | ❌ | ✅ | ❌ |
| API | ❌ | ❌ | ❌ | ❌ | ✅ |
| 纯客户端 | ✅ | ❌ | ❌ | ✅ | ❌ |

**A11yKit 优势**：纯客户端、无需上传到服务器
**A11yKit 劣势**：无 veraPDF 完整 PDF/UA 验证、无 URL 上传、无 MathML 检查、无 API

### 8. AI Alt Text 生成

| 功能 | A11yKit | AltText.ai | AltCore | AutoAlt.ai | accessibility.build |
|------|---------|------------|---------|------------|---------------------|
| OpenAI Vision API | ✅ | ✅ | ✅ | ✅ (OpenAI+Gemini) | ✅ |
| 用户自带 API key | ✅ | ❌ (平台付费) | ❌ (credits) | ❌ (平台付费) | ❌ (credits) |
| 批量处理 | ❌ | ✅ (500张) | ✅ (500张) | ✅ (批量) | ❌ |
| 多语言 | ❌ | ✅ (130+) | ✅ (109+) | ✅ (25+) | ❌ |
| WordPress 插件 | ❌ | ✅ | ❌ | ❌ | ❌ |
| Shopify 应用 | ❌ | ✅ | ❌ | ❌ | ❌ |
| 浏览器插件 | ❌ | ✅ | ❌ | ❌ | ❌ |
| 网站爬虫找缺失 alt | ❌ | ✅ (25页) | ❌ | ✅ (50张) | ❌ |
| SEO 优化 | ❌ | ✅ | ✅ | ✅ | ❌ |
| 上下文输入 | ❌ | ✅ | ✅ | ✅ | ✅ |
| 导出格式 | ❌ | ✅ (6种) | ✅ (6种) | ❌ | ❌ |
| 纯客户端 | ✅ | ❌ | ❌ | ❌ | ❌ |

**A11yKit 优势**：唯一纯客户端、用户自带 key 无需付费
**A11yKit 劣势**：无批量、无多语言、无插件、无 SEO 优化、无网站爬虫

### 9. HTML 扫描器

| 功能 | A11yKit | WCAGKit | FrontendTools |
|------|---------|---------|---------------|
| 粘贴 HTML 扫描 | ✅ | ✅ | ❌ |
| axe-core 引擎 | ❌ | ❌ | ✅ (50+规则) |
| 纯客户端 | ✅ | ✅ | ❌ |

### 10. 其他工具（标题/表单/链接/焦点/Alt Text 检查器）

这些细分检查器是 A11yKit 独有的，没有竞品提供单独的标题结构分析器、表单标签检查器、链接文本检查器、焦点顺序检查器或 alt text 检查器作为独立工具。竞品通常将这些检查整合在综合扫描器中。

---

## 总结：A11yKit vs 竞品

### A11yKit 独有优势（别人没有的）

1. **15 个独立工具** — 竞品最多 5-6 个工具
2. **纯客户端** — 数据不上传，无服务器依赖
3. **APCA 对比度评分** — 唯一支持 WCAG 3 草案
4. **合规证书下载** — 唯一提供可视化证书
5. **AI 自动撰写声明** — 唯一用 AI 生成声明内容
6. **扫描结果→声明导入** — 唯一工具间数据流通
7. **色盲 CSS 变量输出** — 唯一直接输出 CSS
8. **色盲 UI 预览模式** — 唯一提供真实 UI 组件预览
9. **ARIA Live Region 生成** — 唯一提供 4 种 Live Region 模式
10. **全站爬虫 + 纯客户端** — 唯一不依赖服务器的爬虫扫描
11. **Accessibility Monitor** — 唯一提供历史趋势追踪
12. **用户自带 API key** — AI alt text 无平台费用
13. **无扫描次数限制** — 多数竞品有月度限制

### A11yKit 仍缺失的（别人有我没有）

| # | 功能 | 哪些竞品有 | 优先级 | 实现难度 |
|---|------|-----------|--------|----------|
| 1 | axe-core 引擎集成 | ACE, A11yScope, WCAGsafe, FrontendTools | 高 | 中 — npm 包，可客户端运行 |
| 2 | 浏览器插件 | WAVE, AltText.ai | 高 | 中 |
| 3 | veraPDF 完整 PDF/UA 验证 | WebAccessIQ, ReflowPDF, PDFAudit | 中 | 大 — WASM 移植或服务端 |
| 4 | 摄像头实时色盲模拟 | colorblindsimulator.app | 低 | 小 |
| 5 | 网站截图色盲模拟 | colorblindsimulator.app | 低 | 中 — 需截图 API |
| 6 | 分屏对比滑块 | Tembrica, Visiblytics | 低 | 小 |
| 7 | 多语言 alt text | AltText.ai (130+), AltCore (109+) | 中 | 小 — 改 prompt 即可 |
| 8 | 批量 alt text 生成 | AltText.ai, AltCore, AutoAlt.ai | 中 | 小 |
| 9 | alt text SEO 优化 | AltText.ai, AutoAlt.ai | 低 | 小 — 改 prompt |
| 10 | 声明 PDF 导出 | accessibility.build | 低 | 中 |
| 11 | 对比度批量测试 | colorconvert.net | 低 | 小 |
| 12 | 对比度 API | WebAIM | 低 | 中 — 需后端 |
| 13 | ARIA 参考文档 | Infyways, accessibility.build | 低 | 小 — 静态内容 |
| 14 | Pass/Fail/N/A 三态检查清单 | DevToolbox | 低 | 小 |
| 15 | 网站爬虫找缺失 alt | AltText.ai, AutoAlt.ai | 中 | 小 — 已有爬虫基础 |
| 16 | AI 生成任意 ARIA 组件 | accessibility.build, Workik AI | 中 | 小 — 已有 OpenAI 集成 |
| 17 | 多语言声明 | W3C WAI | 低 | 大 |
| 18 | Figma 插件 | Stark, Able | 低 | 大 |
| 19 | 团队协作 | Stark, accessibility-check.ai | 低 | 很大 |
| 20 | MathML PDF 检查 | thelatexlab | 低 | 中 |

### 建议优先实现（低成本高收益）

| 优先级 | 功能 | 预计耗时 | 理由 |
|--------|------|----------|------|
| 🔴 P0 | axe-core 引擎集成 | 2-3h | 扫描规则从 20+ 提升到 50+，直接对标竞品 |
| 🔴 P0 | 多语言 alt text | 30min | 改 prompt 加语言选择，立刻支持 130+ 语言 |
| 🔴 P0 | 批量 alt text 生成 | 1h | 支持多图上传，竞品核心卖点 |
| 🟡 P1 | AI 生成任意 ARIA 组件 | 1h | 复用 OpenAI 集成，超越 accessibility.build |
| 🟡 P1 | 摄像头实时色盲模拟 | 30min | getUserMedia + Canvas，竞品有 |
| 🟡 P1 | 分屏对比滑块 | 30min | CSS clip-path 实现 |
| 🟡 P1 | Pass/Fail/N/A 三态检查清单 | 30min | 改 UI 交互 |
| 🟡 P1 | 网站爬虫找缺失 alt | 1h | 复用已有爬虫逻辑 |
| 🟢 P2 | 对比度批量测试 | 1h | 多组颜色同时检查 |
| 🟢 P2 | ARIA 参考文档 | 2h | 静态内容页面 |
