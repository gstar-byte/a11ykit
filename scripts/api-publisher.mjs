#!/usr/bin/env node
/**
 * A11yKit 全网 API 自动化发文流水线
 * 支持平台：Dev.to (DA 85), Medium (DA 96), Hashnode (DA 86)
 * 自动携带 canonical_url 原文回链，最大化 SEO 权重传递
 */

import fs from "node:fs";
import path from "node:path";

// 读取 .env.local 环境变量
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = (match[2] || "").trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

loadEnv();

export const ARTICLES = [
  {
    id: "privacy-first-tools",
    title: "15 Free Client-Side Accessibility Tools That Never Upload Your Code",
    description: "Why we built a 100% in-browser accessibility toolkit for WCAG 2.2 and EAA compliance with zero data upload.",
    tags: ["webdev", "accessibility", "javascript", "frontend"],
    canonical_url: "https://a11ykit.site",
    markdown: `As web developers preparing for the **European Accessibility Act (EAA)** and **WCAG 2.2** requirements, ensuring our web applications are fully accessible has become non-negotiable.

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

Feedback and PRs are warmly welcomed! How does your team handle local accessibility checks? Let's discuss in the comments below. 👇`
  },
  {
    id: "top-50-audit",
    title: "We Audited 52 of the World's Top Websites for WCAG 2.2 — Here Is What Failed",
    description: "An automated compliance analysis of 52 global websites. 70 violations found, only 18 passed clean.",
    tags: ["accessibility", "webdev", "testing", "html"],
    canonical_url: "https://a11ykit.site/accessibility-report",
    markdown: `Web accessibility is often treated as an afterthought, even by the world's largest digital products. With the **European Accessibility Act (EAA)** deadline rapidly approaching, we decided to run an automated WCAG 2.2 compliance audit across 52 of the world's highest-traffic websites.

The results, methodology, and site-by-site breakdown are published in our open [Top 50 Sites Accessibility Report](https://a11ykit.site/accessibility-report).

Here is a summary of what we discovered.

---

## 🚨 The Findings in Numbers

- **52 Websites Audited**: Spanning e-commerce, healthcare, developer tools, social media, news, and streaming.
- **70 Total WCAG AA Violations Detected**.
- **Only 18 Websites (34.6%) Passed Cleanly** on their primary landing page.
- **Most Affected Industries**: Healthcare portals and media streaming platforms had the highest concentration of contrast and ARIA labeling issues.

---

## 🔍 Top 3 Most Common Accessibility Failures

### 1. Insufficient Color Contrast (WCAG 1.4.3)
By far the most prevalent issue. Many modern landing pages use low-contrast muted grays (\`#94a3b8\` on \`#ffffff\`) for subheadings, captions, and footer links that fail the minimum 4.5:1 ratio for normal text.

> 💡 **Fix**: You can test and auto-fix color pairs instantly with the [A11yKit Contrast Checker](https://a11ykit.site/tools/contrast-checker).

### 2. Missing Form Labels and Accessible Names (WCAG 4.1.2)
Search bars and newsletter subscription inputs frequently rely solely on placeholder text without an associated \`<label>\` or \`aria-label\`. Screen readers cannot reliably announce input purpose to visually impaired users.

### 3. Ambiguous Link Text (WCAG 2.4.4)
Links with anchor text like *"Read More"*, *"Learn More"*, or unlabelled icon buttons prevent screen reader users from understanding link destinations out of context.

---

## 🛠️ Free Testing Toolkit

All audits were conducted using client-side testing algorithms powered by \`axe-core\`. You can scan any webpage for free without installing heavy software:

👉 **[Run an instant WCAG 2.2 scan on A11yKit](https://a11ykit.site/tools/url-scanner)**

Have you audited your own web apps recently? What is the hardest part of maintaining accessibility in your team?`
  },
  {
    id: "contrast-guide",
    title: "WCAG 2.2 & APCA Color Contrast: A Practical Guide for Modern UI Designers",
    description: "Understanding color contrast standards from WCAG AA/AAA to APCA, and how to design accessible palettes.",
    tags: ["design", "css", "ui", "accessibility"],
    canonical_url: "https://a11ykit.site/tools/contrast-checker",
    markdown: `Color contrast is the foundation of digital readability. Whether users have low vision, color blindness, or are simply using a smartphone outdoors under direct sunlight, accessible contrast makes or breaks your product experience.

In this guide, we break down the difference between **WCAG 2.2 contrast ratios** and the new **APCA (Advanced Perceptual Contrast Algorithm)**, and how you can implement them effortlessly.

---

## 📐 WCAG 2.2 vs. APCA: What Is the Difference?

### 1. Traditional WCAG 2.2 Math
- **Normal Text (AA)**: Requires at least **4.5:1** contrast ratio.
- **Large Text (AA)**: Requires at least **3.0:1** (18pt / 24px regular, or 14pt / 18.5px bold).
- **AAA Standard**: Requires **7.0:1** for normal text.

*Limitation*: Traditional WCAG math only looks at luminance without considering spatial frequency (font weight and size) or dark mode contrast perception.

### 2. APCA (Advanced Perceptual Contrast Algorithm)
APCA is designed for WCAG 3.0. It accounts for:
- Font size and weight (thin fonts need higher contrast).
- Polarity (dark text on light background vs. light text on dark background).
- Human eye physiology and actual perceptual luminance.

---

## 🌈 Simulating Color Vision Deficiencies

Over 300 million people worldwide have some form of color vision deficiency (CVD). When designing color-coded status badges, charts, or alert banners:
1. Never rely on color alone (combine color with icons or text labels).
2. Test against **Deuteranopia** (green-weak), **Protanopia** (red-weak), and **Tritanopia** (blue-yellow).

---

## 🛠️ Free Browser Tools

You don't need expensive plugins to verify your design systems:
- 🎨 **[A11yKit Contrast Checker](https://a11ykit.site/tools/contrast-checker)**: Real-time WCAG AA/AAA & APCA scoring with smart nearest-color suggestions.
- 👓 **[A11yKit Color Blind Simulator](https://a11ykit.site/tools/color-blind-simulator)**: 8 color blindness modes with Daltonize correction.

What tools does your team use for color accessibility? Share your design workflow in the comments!`
  }
];

// ── 发布至 Dev.to ──────────────────────────────────────────
async function publishToDevTo(apiKey) {
  console.log("\n🚀 [1/2] 正在向 Dev.to (DA 85) 发布文章...");
  const endpoint = "https://dev.to/api/articles";

  for (let i = 0; i < ARTICLES.length; i++) {
    const article = ARTICLES[i];
    console.log(`   [${i + 1}/${ARTICLES.length}] 正在发布: "${article.title}"...`);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          article: {
            title: article.title,
            published: true,
            body_markdown: article.markdown,
            tags: article.tags,
            canonical_url: article.canonical_url,
          },
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`   ❌ 发布失败 (HTTP ${res.status}): ${text}`);
      } else {
        const json = await res.json();
        console.log(`   ✅ 成功上线: ${json.url}`);
        console.log(`      🔗 原文回链 (Canonical): ${json.canonical_url}`);
      }
    } catch (e) {
      console.error(`   ❌ 网络异常: ${e.message}`);
    }

    if (i < ARTICLES.length - 1) {
      console.log("   ⏳ 等待 32 秒以避开 Dev.to 频控限制...");
      await new Promise((r) => setTimeout(r, 32000));
    }
  }
}

// ── 发布至 Medium ──────────────────────────────────────────
async function publishToMedium(token) {
  console.log("\n🚀 [2/2] 正在向 Medium (DA 96) 发布文章...");
  try {
    // 获取当前用户 ID
    const userRes = await fetch("https://api.medium.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) {
      console.error(`   ❌ Medium Token 校验失败 (HTTP ${userRes.status})`);
      return;
    }
    const userData = await userRes.json();
    const userId = userData.data.id;
    console.log(`   👤 已识别 Medium 作者: ${userData.data.name} (@${userData.data.username})`);

    const postEndpoint = `https://api.medium.com/v1/users/${userId}/posts`;

    for (const article of ARTICLES) {
      console.log(`   正在发布: "${article.title}"...`);
      const res = await fetch(postEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: article.title,
          contentFormat: "markdown",
          content: `# ${article.title}\n\n${article.markdown}`,
          canonicalUrl: article.canonical_url,
          tags: article.tags,
          publishStatus: "public",
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`   ❌ 发布失败 (HTTP ${res.status}): ${text}`);
      } else {
        const json = await res.json();
        console.log(`   ✅ 成功上线: ${json.data.url}`);
        console.log(`      🔗 原文回链 (Canonical): ${json.data.canonicalUrl}`);
      }
    }
  } catch (e) {
    console.error(`   ❌ Medium 发布异常: ${e.message}`);
  }
}

// ── 主流程 ────────────────────────────────────────────────
async function main() {
  console.log("========================================================");
  console.log("📝 A11yKit 全网 API 自动化发文流水线 (Mode 2)");
  console.log("========================================================");
  console.log(`📚 当前待分发文章数: ${ARTICLES.length} 篇`);
  console.log(`🌐 目标平台: Dev.to (DA 85), Medium (DA 96)`);
  console.log(`🔗 全量注入 Canonical URL 原文反向链接\n`);

  const devtoKey = process.env.DEVTO_API_KEY;
  const mediumToken = process.env.MEDIUM_TOKEN;

  if (!devtoKey && !mediumToken) {
    console.log("⚠️ 未检测到 API 密钥配置。\n");
    console.log("👉 请按需获取密钥（任选一个即可快速分发）：");
    console.log("   1. Dev.to API Key (推荐，10秒生成，无需审核):");
    console.log("      🔗 登录后前往: https://dev.to/settings/extensions -> 生成 API Key");
    console.log("   2. Medium Integration Token (DA 96 顶级权重):");
    console.log("      🔗 登录后前往: https://medium.com/me/settings/security -> Integration tokens\n");
    console.log("💡 配置方式：");
    console.log("   在项目根目录新建或编辑 .env.local 文件，填入：");
    console.log("   DEVTO_API_KEY=\"你的_devto_key\"");
    console.log("   MEDIUM_TOKEN=\"你的_medium_token\"\n");
    console.log("   然后重新运行: npm run publish:api");
    return;
  }

  if (devtoKey) {
    await publishToDevTo(devtoKey);
  }

  if (mediumToken) {
    await publishToMedium(mediumToken);
  }

  console.log("\n🎉 API 自动化发文任务全部执行完毕！");
}

main();
