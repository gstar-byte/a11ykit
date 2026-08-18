#!/usr/bin/env node
/**
 * Dev.to 文章自动化发布脚本 (Mode 2 API 驱动)
 * 
 * 使用方式：
 *   DEVTO_API_KEY=your_key node scripts/devto-publish.mjs
 *   或者在 .env.local 中配置 DEVTO_API_KEY
 */

import fs from "node:fs";
import path from "node:path";

const DEVTO_API_ENDPOINT = "https://dev.to/api/articles";
const API_KEY = process.env.DEVTO_API_KEY;

const ARTICLE_DATA = {
  article: {
    title: "15 Free Client-Side Accessibility Tools That Never Upload Your Code",
    published: true,
    body_markdown: `As web developers preparing for the **European Accessibility Act (EAA)** and **WCAG 2.2** requirements, ensuring our web applications are fully accessible has become non-negotiable.

However, nearly all mainstream accessibility scanners require uploading entire HTML trees, private staging URLs, or component source code to their cloud servers. For engineers working with proprietary code, confidential client portals, or intranet systems, that presents a massive compliance and privacy risk.

To solve this, I built **[A11yKit](https://a11ykit.site)** — a completely free, open-source collection of 15 accessibility tools that run **100% in your browser**.

---

## 🛠️ What's Inside A11yKit?

Everything runs locally via client-side algorithms and \`axe-core\`, meaning **zero data ever leaves your machine**:

1. **🎨 Contrast Checker (WCAG 2.1 AA/AAA + APCA)**: Test text and background pairs with automated smart suggestions for the nearest passing hue.
2. **🌈 Color Blind Simulator**: Instant preview under 8 color vision deficiencies with Daltonize color correction algorithms.
3. **🏷️ ARIA Pattern Generator**: Copy-paste production-ready accessible markup for accordions, modals, tabs, dropdowns, and comboboxes.
4. **🔍 In-Browser URL Scanner**: Audit any public web page against WCAG 2.2 criteria with plain-English fix recommendations.
5. **✅ Interactive WCAG 2.2 Checklist**: Filterable checklist mapped directly to official W3C success criteria.
6. **📄 Accessibility Statement Generator**: Pre-built compliant templates ready for EAA filing.
7. **🖼️ AI Alt Text Generator**: Batch-generate descriptive image alt text locally or using your own API keys.

---

## 📊 Top 50 Sites Web Accessibility Audit

We also ran an automated compliance audit across 52 of the world's most visited websites (including WebMD, Zoom, Reddit, and GitHub) and published our findings in the [Top Sites Accessibility Report](https://a11ykit.site/accessibility-report).

**Key Takeaways:**
- 70+ total WCAG AA violations were detected across high-traffic platforms.
- Low-contrast text and missing form labels remain the two most common failures.
- Only 18 out of 52 sites passed clean on their landing pages.

---

## 🔗 Try It Out

- **Live Web App**: [https://a11ykit.site](https://a11ykit.site)
- **GitHub Repository**: [https://github.com/gstar-byte/a11ykit](https://github.com/gstar-byte/a11ykit)
- **Offline / PWA**: Installable as a progressive web app for offline testing.

Feedback and PRs are warmly welcomed! How does your team handle local accessibility checks? Let's discuss in the comments below. 👇`,
    tags: ["webdev", "accessibility", "javascript", "frontend"],
    canonical_url: "https://a11ykit.site",
  },
};

async function publishArticle() {
  console.log("=================================================");
  console.log("📝 Dev.to 技术长文自动发布流水线 (Mode 2 API)");
  console.log("=================================================");

  if (!API_KEY) {
    console.log("⚠️ 未检测到 DEVTO_API_KEY 环境变量。");
    console.log("💡 提示：前往 https://dev.to/settings/extensions 生成 API Key，并在运行时注入：");
    console.log("   $env:DEVTO_API_KEY=\"your_key\"; node scripts/devto-publish.mjs\n");
    console.log("📄 文章内容预览（已配置 canonical_url 指向 https://a11ykit.site）：");
    console.log(`   标题: ${ARTICLE_DATA.article.title}`);
    console.log(`   标签: ${ARTICLE_DATA.article.tags.join(", ")}`);
    console.log(`   原文回链: ${ARTICLE_DATA.article.canonical_url}`);
    return;
  }

  console.log(`🚀 正在向 Dev.to 发布文章: "${ARTICLE_DATA.article.title}"...`);

  try {
    const res = await fetch(DEVTO_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": API_KEY,
      },
      body: JSON.stringify(ARTICLE_DATA),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ 发布失败 (HTTP ${res.status}): ${errText}`);
      process.exit(1);
    }

    const result = await res.json();
    console.log(`\n🎉 发布成功！`);
    console.log(`🔗 文章上线地址: ${result.url}`);
    console.log(`⭐ Canonical URL: ${result.canonical_url}`);
  } catch (err) {
    console.error("❌ 请求失败:", err.message);
    process.exit(1);
  }
}

publishArticle();
