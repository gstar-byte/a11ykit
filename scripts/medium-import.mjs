import { exec } from "node:child_process";
import puppeteer from "puppeteer";

export const DEVTO_ARTICLES = [
  {
    title: "15 Free Client-Side Accessibility Tools That Never Upload Your Code",
    url: "https://dev.to/willsun/15-free-client-side-accessibility-tools-that-never-upload-your-code-jom",
  },
  {
    title: "We Audited 52 of the World's Top Websites for WCAG 2.2 — Here Is What Failed",
    url: "https://dev.to/willsun/we-audited-52-of-the-worlds-top-websites-for-wcag-22-here-is-what-failed-34kn",
  },
  {
    title: "WCAG 2.2 & APCA Color Contrast: A Practical Guide for Modern UI Designers",
    url: "https://dev.to/willsun/wcag-22-apca-color-contrast-a-practical-guide-for-modern-ui-designers-82a",
  },
];

async function main() {
  console.log("========================================================");
  console.log("🚀 Medium 真实浏览器直通助手 (使用当前已登录 Edge)");
  console.log("========================================================");

  // 尝试连接正在运行的 Edge 远程调试端口（如果有）
  try {
    const browser = await puppeteer.connect({
      browserURL: "http://127.0.0.1:9222",
      defaultViewport: null,
    });
    console.log("✅ 成功接管当前运行中的 Edge 浏览器！正在全自动导入...");

    for (const art of DEVTO_ARTICLES) {
      console.log(`正在导入: "${art.title}"...`);
      const page = await browser.newPage();
      await page.goto("https://medium.com/p/import", { waitUntil: "domcontentloaded" });
      await new Promise((r) => setTimeout(r, 1500));
      const input = await page.waitForSelector('input[type="url"], input[type="text"], input');
      await input.type(art.url, { delay: 10 });
      const btns = await page.$$("button");
      for (const btn of btns) {
        const text = await page.evaluate((el) => el.textContent, btn);
        if (text && text.toLowerCase().includes("import")) {
          await btn.click();
          break;
        }
      }
    }
    console.log("\n🎉 全量导入完成！请在 Edge 窗口中点击【Publish】发布即可。");
    return;
  } catch (e) {
    // 未开启 9222 端口时，直接使用系统原生 Edge 命令在当前已登录的 Edge 窗口中打开
    console.log("💡 正在直接唤起你的原生 Edge 浏览器（100% 保持当前 Medium 登录态）...\n");

    for (let i = 0; i < DEVTO_ARTICLES.length; i++) {
      const art = DEVTO_ARTICLES[i];
      console.log(`[${i + 1}/${DEVTO_ARTICLES.length}] 正在当前 Edge 中打开导入页: "${art.title}"`);
      console.log(`   源链接: ${art.url}`);
      exec(`start msedge "https://medium.com/p/import"`);
      await new Promise((r) => setTimeout(r, 1000));
    }

    console.log("\n✨ 已在你的日常 Edge 浏览器中打开了 Medium 导入标签页！");
    console.log("📋 3 篇文章链接已备好在下方（复制即可粘贴导入）：");
    DEVTO_ARTICLES.forEach((art, idx) => {
      console.log(`\n【文章 ${idx + 1}】${art.title}`);
      console.log(`👉 复制链接: ${art.url}`);
    });
  }
}

main();
