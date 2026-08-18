import puppeteer from "puppeteer";
import path from "node:path";
import fs from "node:fs";

export const PROJECT_INFO = {
  name: "A11yKit",
  url: "https://a11ykit.site",
  tagline: "15 free client-side WCAG 2.2 accessibility tools with zero data upload",
  shortDescription: "15 free, 100% client-side web accessibility tools for WCAG 2.2 and EAA compliance.",
  longDescription: `A11yKit is an open-source, privacy-first web accessibility toolkit that runs 100% in your browser. Unlike traditional accessibility tools that require uploading your source code or URLs to third-party servers, A11yKit performs all checks locally via axe-core and client-side algorithms.

Key features:
- Contrast Checker (WCAG AA/AAA + APCA)
- Interactive WCAG 2.2 Checklist
- Color Blind Simulator (8 types + Daltonize)
- ARIA Pattern Generator
- URL Scanner & HTML Scanner
- Accessibility Statement Generator (EAA ready)
- AI Alt Text Generator
- Zero signup, no data tracking, offline PWA support.`,
  category: "Developer Tools",
  pricing: "Free",
  license: "Free / Open Source",
  tags: ["accessibility", "a11y", "wcag", "developer-tools", "privacy-first", "open-source"],
  alternatives: "WAVE, axe DevTools, WebAIM Color Contrast Checker, Stark, Lighthouse",
  github: "https://github.com/gstar-byte/a11ykit",
};

const PLATFORMS = [
  {
    name: "AlternativeTo",
    url: "https://alternativeto.net/software/create/",
    da: "82",
    type: "Competitor / Alternative Directory",
  },
  {
    name: "DevHunt",
    url: "https://devhunt.org/tool/submit",
    da: "60+",
    type: "Developer Tools Launchpad",
  },
  {
    name: "Uneed.best",
    url: "https://www.uneed.best/submit-a-tool",
    da: "68",
    type: "Curated Tools Directory",
  },
  {
    name: "Launching Next",
    url: "https://www.launchingnext.com/submit/",
    da: "52",
    type: "Tech Startup Directory",
  },
  {
    name: "MicroLaunch",
    url: "https://microlaunch.net/submit",
    da: "62",
    type: "Indie Product Launchpad",
  },
  {
    name: "BetaList",
    url: "https://betalist.com/submit",
    da: "70",
    type: "Early Stage Tech Directory",
  },
];

async function launchAssistant() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const sessionDir = path.resolve(process.cwd(), ".edge-session");

  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  console.log("========================================================");
  console.log("🚀 A11yKit 自动化外链与目录填报助手 (Edge + Puppeteer)");
  console.log("========================================================");
  console.log(`📁 登录态持久化目录: ${sessionDir}`);
  console.log(`🌐 默认加载项目信息: ${PROJECT_INFO.name} (${PROJECT_INFO.url})\n`);

  const browser = await puppeteer.launch({
    executablePath: fs.existsSync(edgePath) ? edgePath : undefined,
    headless: false,
    userDataDir: sessionDir,
    defaultViewport: null,
    args: [
      "--start-maximized",
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
    ],
  });

  const pages = await browser.pages();
  const mainPage = pages[0] || (await browser.newPage());

  // 注入复制浮窗助手
  async function setupHelperWidget(page) {
    try {
      await page.evaluate((info) => {
        if (document.getElementById("a11ykit-auto-helper")) return;
        const div = document.createElement("div");
        div.id = "a11ykit-auto-helper";
        div.style.position = "fixed";
        div.style.bottom = "20px";
        div.style.right = "20px";
        div.style.zIndex = "999999";
        div.style.background = "#1e293b";
        div.style.color = "#f8fafc";
        div.style.padding = "14px";
        div.style.borderRadius = "12px";
        div.style.boxShadow = "0 10px 25px rgba(0,0,0,0.4)";
        div.style.fontFamily = "system-ui, sans-serif";
        div.style.fontSize = "12px";
        div.style.maxWidth = "320px";
        div.style.border = "1px solid #334155";

        div.innerHTML = `
          <div style="font-weight:bold;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
            <span>⚡ A11yKit 快捷填单面板</span>
            <button id="close-helper-btn" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:14px;">✕</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <button class="copy-btn" data-val="${info.name}" style="padding:4px 8px;background:#0284c7;color:#fff;border:none;border-radius:4px;cursor:pointer;text-align:left;">📋 复制名称: ${info.name}</button>
            <button class="copy-btn" data-val="${info.url}" style="padding:4px 8px;background:#0284c7;color:#fff;border:none;border-radius:4px;cursor:pointer;text-align:left;">📋 复制官网 URL</button>
            <button class="copy-btn" data-val="${info.tagline}" style="padding:4px 8px;background:#0284c7;color:#fff;border:none;border-radius:4px;cursor:pointer;text-align:left;">📋 复制标语 (Tagline)</button>
            <button class="copy-btn" data-val="${encodeURIComponent(info.shortDescription)}" style="padding:4px 8px;background:#0284c7;color:#fff;border:none;border-radius:4px;cursor:pointer;text-align:left;">📋 复制短简介 (Short Desc)</button>
            <button class="copy-btn" data-val="${encodeURIComponent(info.longDescription)}" style="padding:4px 8px;background:#0284c7;color:#fff;border:none;border-radius:4px;cursor:pointer;text-align:left;">📋 复制完整介绍 (Long Desc)</button>
            <button class="copy-btn" data-val="${info.alternatives}" style="padding:4px 8px;background:#0284c7;color:#fff;border:none;border-radius:4px;cursor:pointer;text-align:left;">📋 复制竞品关联 (Alternatives)</button>
          </div>
        `;
        document.body.appendChild(div);

        div.querySelector("#close-helper-btn").onclick = () => div.remove();
        div.querySelectorAll(".copy-btn").forEach((btn) => {
          btn.onclick = () => {
            let text = btn.getAttribute("data-val");
            try {
              text = decodeURIComponent(text);
            } catch {}
            navigator.clipboard.writeText(text);
            const oldText = btn.innerText;
            btn.innerText = "✅ 已复制到剪贴板！";
            setTimeout(() => (btn.innerText = oldText), 1500);
          };
        });
      }, PROJECT_INFO);
    } catch {}
  }

  console.log("正在打开各平台提交页面并挂载智能填单助手...\n");

  for (let i = 0; i < PLATFORMS.length; i++) {
    const p = PLATFORMS[i];
    console.log(`[${i + 1}/${PLATFORMS.length}] 正在打开: ${p.name} (DA ${p.da}) -> ${p.url}`);
    const page = i === 0 ? mainPage : await browser.newPage();
    try {
      await page.goto(p.url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await setupHelperWidget(page);
    } catch (e) {
      console.log(`   ⚠️ 页面加载超时或遇到跳转，请在打开的窗口中操作。`);
    }
  }

  console.log("\n✨ 所有平台页面已就绪！浏览器已保持打开状态。");
  console.log("💡 提示：在页面右下角有【A11yKit 快捷填单面板】，点击即可一键复制各项字段，无需切屏或人肉手敲！");
}

launchAssistant();
