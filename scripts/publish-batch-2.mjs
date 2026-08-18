import fs from "node:fs";
import path from "node:path";

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

// 新一批（第 2 批）针对具体工具页面的高转化深度技术长文
export const NEW_BATCH_ARTICLES = [
  {
    id: "aria-patterns-guide",
    title: "10 Common ARIA Mistakes in React & Next.js (And How to Fix Them)",
    description: "Avoid bad ARIA patterns that break screen readers. A practical developer guide with copy-pasteable accessible components.",
    tags: ["react", "accessibility", "javascript", "webdev"],
    canonical_url: "https://a11ykit.site/tools/aria-generator",
    markdown: `As web applications become more dynamic, developers increasingly reach for ARIA (Accessible Rich Internet Applications) attributes to make complex widgets accessible.

However, the **First Rule of ARIA** is famously: *"Don't use ARIA if you can use native HTML."* Misusing ARIA can actually make an interface **less accessible** than having no ARIA at all.

Here are the 10 most frequent ARIA anti-patterns we see in modern React and Next.js codebases, and how to fix them.

---

## 1. The Fake Button: \`<div onClick={...}>\`
\`\`\`jsx
// ❌ WRONG
<div className="btn" onClick={handleClick}>Submit</div>

// ✅ RIGHT
<button type="button" onClick={handleClick}>Submit</button>
\`\`\`
Native \`<button>\` elements come for free with keyboard focus (\`Tab\`), activation via \`Enter\` and \`Space\`, and proper accessibility tree roles.

---

## 2. Redundant ARIA Roles
\`\`\`jsx
// ❌ Redundant
<button role="button">Click me</button>
<nav role="navigation">...</nav>
\`\`\`
Modern screen readers already understand HTML5 semantic tags. Adding duplicate roles creates noise and bloat.

---

## 3. Missing \`aria-expanded\` on Collapsible Accordions & Dropdowns
Screen reader users need to know whether an accordion panel or mobile menu is currently open or closed:
\`\`\`jsx
// ✅ Accessible Accordion Trigger
<button
  type="button"
  aria-expanded={isOpen}
  aria-controls="faq-content-1"
  onClick={() => setIsOpen(!isOpen)}
>
  What is WCAG 2.2?
</button>
<div id="faq-content-1" hidden={!isOpen}>
  WCAG 2.2 is the latest W3C accessibility recommendation...
</div>
\`\`\`

---

## 4. Unlabelled Icon Buttons
\`\`\`jsx
// ❌ Screen reader announces: "Button" (No context!)
<button onClick={handleSearch}><SearchIcon /></button>

// ✅ Accessible
<button onClick={handleSearch} aria-label="Search articles">
  <SearchIcon aria-hidden="true" />
</button>
\`\`\`

---

## 5. Misusing \`aria-hidden="true"\` on Focusable Elements
If an element is focusable via keyboard, hiding it from the accessibility tree causes a "ghost focus" trap:
\`\`\`jsx
// ❌ Confusing keyboard trap
<button aria-hidden="true" onClick={openModal}>Open</button>
\`\`\`

---

## 🛠️ Need Pre-Built Accessible ARIA Markup?

Instead of guessing ARIA attributes from scratch, you can generate verified, copy-pasteable HTML/JSX patterns for 20+ UI components (tabs, modals, tooltips, comboboxes, breadcrumbs):

👉 **[Generate verified ARIA patterns with A11yKit ARIA Generator](https://a11ykit.site/tools/aria-generator)**

What's the trickiest accessible widget you've had to build in React? Let's discuss below!`
  },
  {
    id: "eaa-compliance-guide",
    title: "European Accessibility Act (EAA) 2026: The Essential Developer Compliance Checklist",
    description: "Everything engineering and product teams need to know to comply with the European Accessibility Act (EAA) and avoid penalties.",
    tags: ["webdev", "accessibility", "frontend", "legal"],
    canonical_url: "https://a11ykit.site/tools/wcag-checklist",
    markdown: `The **European Accessibility Act (EAA - Directive 2019/882)** represents the most sweeping digital accessibility legislation in European history. Unlike previous public sector mandates, the EAA applies directly to **private sector businesses and e-commerce websites** doing business in the European Union.

If your web application, SaaS product, or online store serves EU customers, here is what your engineering team must prepare.

---

## 📅 Who Does the EAA Apply To?

The EAA covers:
- E-commerce platforms and online checkout flows
- Banking, payment services, and financial apps
- E-books, digital media, and streaming services
- Operating systems, consumer hardware, and self-service terminals
- Transport services (ticketing, schedules, mobile apps)

*Microenterprises (fewer than 10 employees and under €2M turnover) may qualify for exemptions, but enterprise supply chains are already requiring full compliance from all software vendors.*

---

## 🎯 Which Technical Standard Must You Meet?

Under EN 301 549 (the harmonized European standard), web applications must conform to **WCAG 2.1 Level AA** (with WCAG 2.2 AA strongly recommended for future-proofing).

Key requirements include:
1. **Perceivable**: All UI elements must have sufficient color contrast (4.5:1 for normal text) and descriptive alternative text for non-decorative media.
2. **Operable**: Full keyboard accessibility with visible focus rings and no keyboard traps.
3. **Understandable**: Predictable navigation, clear form error identification, and descriptive labels.
4. **Robust**: Clean HTML semantics that work reliably across screen readers, speech input, and braille displays.
5. **Accessibility Statement**: An openly published, updated declaration of your compliance status.

---

## 📋 The 5-Step Developer Action Plan

1. **Audit Your Landing & Checkout Flows**: Run an automated baseline scan across all public pages.
2. **Fix Color Contrast & Form Labels**: These account for over 70% of low-hanging violations.
3. **Implement Full Keyboard Navigation**: Unplug your mouse and attempt to complete your entire core user journey using only \`Tab\`, \`Enter\`, and \`Esc\`.
4. **Generate Your Legal Accessibility Statement**: Document your accessibility support and provide a feedback contact channel.

---

## 🛠️ Free EAA Compliance Toolkit

You can track your compliance progress interactively with zero data uploads:
- ✅ **[Interactive WCAG 2.2 & EAA Checklist](https://a11ykit.site/tools/wcag-checklist)**
- 📄 **[Free Accessibility Statement Generator](https://a11ykit.site/tools/accessibility-statement)**

Has your company started preparing for the EAA deadline? What challenges is your team facing?`
  },
  {
    id: "accessible-forms-guide",
    title: "How to Build 100% Accessible Forms: Labels, Focus Traps, and Error States",
    description: "A complete guide to designing accessible web forms that pass WCAG 2.2 AA without sacrificing UI aesthetics.",
    tags: ["html", "css", "webdev", "accessibility"],
    canonical_url: "https://a11ykit.site/tools/form-label-checker",
    markdown: `Forms are the lifeblood of the web — they are where signups, checkouts, and customer interactions happen. Yet forms remain the single biggest source of digital accessibility barriers.

According to web accessibility audits, **over 58% of form inputs on top websites lack valid programmatic labels**.

Here is how to build completely accessible forms that pass **WCAG 2.2 Level AA** while looking modern and sleek.

---

## 🏷️ 1. Explicit Labels Are Mandatory

Never rely on \`placeholder\` text as a label. Placeholders vanish upon typing, have low contrast by default, and are not consistently voiced by screen readers.

\`\`\`html
<!-- ❌ WRONG -->
<input type="email" placeholder="Enter your email" />

<!-- ✅ RIGHT: Explicit association via id and for -->
<label for="user-email" class="form-label">Email address</label>
<input id="user-email" type="email" name="email" required />
\`\`\`

---

## 🚨 2. Accessible Error States & Validation

When a user submits invalid data:
1. Don't rely on color alone (a red border is invisible to users with red-green color blindness).
2. Announce errors programmatically using \`aria-invalid\` and \`aria-describedby\`:

\`\`\`html
<label for="password-input">Password</label>
<input
  id="password-input"
  type="password"
  aria-invalid="true"
  aria-describedby="password-error-msg"
/>
<p id="password-error-msg" class="error-text" role="alert">
  ⚠️ Password must be at least 8 characters long.
</p>
\`\`\`

---

## 🎯 3. Grouping Related Inputs with Fieldset & Legend

For radio button groups or multi-checkbox questions, group them with \`<fieldset>\` so screen readers announce the group context before each individual choice:

\`\`\`html
<fieldset>
  <legend>Preferred contact method</legend>
  <label><input type="radio" name="contact" value="email" /> Email</label>
  <label><input type="radio" name="contact" value="phone" /> Phone</label>
</fieldset>
\`\`\`

---

## 🛠️ Instant Form Audit Tool

Want to verify whether your current website has missing labels, broken \`for/id\` associations, or unlabelled inputs?

👉 **[Scan your forms with the A11yKit Form Label Checker](https://a11ykit.site/tools/form-label-checker)**

What's the biggest headache your team encounters when styling accessible forms? Share your tips below!`
  }
];

async function publishBatch() {
  const apiKey = process.env.DEVTO_API_KEY || "hd31xweRq1x3qVmGwWfk1qXk";
  const endpoint = "https://dev.to/api/articles";

  console.log("=================================================");
  console.log("🚀 A11yKit API 批量自动发文流水线（第 2 批）");
  console.log("=================================================");
  console.log(`📚 本批待发文章数: ${NEW_BATCH_ARTICLES.length} 篇\n`);

  for (let i = 0; i < NEW_BATCH_ARTICLES.length; i++) {
    const article = NEW_BATCH_ARTICLES[i];
    console.log(`[${i + 1}/${NEW_BATCH_ARTICLES.length}] 正在发布: "${article.title}"...`);

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
        const errText = await res.text();
        console.error(`   ❌ 发布失败 (HTTP ${res.status}): ${errText}`);
      } else {
        const json = await res.json();
        console.log(`   ✅ 成功上线: ${json.url}`);
        console.log(`      🔗 原文回链 (Canonical): ${json.canonical_url}`);
      }
    } catch (e) {
      console.error(`   ❌ 网络异常: ${e.message}`);
    }

    if (i < NEW_BATCH_ARTICLES.length - 1) {
      console.log("   ⏳ 正在等待 32 秒（避开 Dev.to API 频控保护）...");
      await new Promise((r) => setTimeout(r, 32000));
    }
  }

  console.log("\n🎉 第 2 批 API 自动化发文全部完成！");
}

publishBatch();
