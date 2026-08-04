#!/usr/bin/env node
/**
 * IndexNow URL 提交脚本
 * 向 Bing / IndexNow 搜索引擎通知最新页面变更
 * 
 * 使用方式：
 *   node scripts/indexnow.mjs
 *   node scripts/indexnow.mjs --dry-run   # 仅打印 URL，不实际提交
 */

const HOST = "a11ykit.site";
const BASE_URL = `https://${HOST}`;
const INDEXNOW_KEY = "6408d33f0ebe4da1b5b4fefaf549c17c";
const KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;
const API_ENDPOINT = "https://api.indexnow.org/IndexNow";

// 站点所有 URL（与 sitemap.ts 保持同步）
const TOOL_SLUGS = [
  "contrast-checker",
  "wcag-checklist",
  "accessibility-statement",
  "aria-generator",
  "heading-analyzer",
  "form-label-checker",
  "color-blind-simulator",
  "html-scanner",
  "link-text-checker",
  "focus-order-checker",
  "alt-text-checker",
  "url-scanner",
  "pdf-checker",
  "alt-text-generator",
  "accessibility-monitor",
];

const STATIC_URLS = [
  `${BASE_URL}/`,
  `${BASE_URL}/tools`,
  `${BASE_URL}/about`,
  `${BASE_URL}/accessibility-report`,
  `${BASE_URL}/privacy`,
  `${BASE_URL}/terms`,
];

const TOOL_URLS = TOOL_SLUGS.map((slug) => `${BASE_URL}/tools/${slug}`);

const ALL_URLS = [...STATIC_URLS, ...TOOL_URLS];

// ── 主函数 ────────────────────────────────────────────────
async function main() {
  const isDryRun = process.argv.includes("--dry-run");

  console.log("🔍 IndexNow URL 提交脚本");
  console.log(`   站点: ${BASE_URL}`);
  console.log(`   Key:  ${INDEXNOW_KEY}`);
  console.log(`   共 ${ALL_URLS.length} 个 URL\n`);

  if (isDryRun) {
    console.log("📋 [Dry Run] 将提交以下 URL：");
    ALL_URLS.forEach((url) => console.log(`   ${url}`));
    console.log("\n✅ Dry run 完成，未实际提交。");
    return;
  }

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: ALL_URLS,
  };

  console.log("📤 正在提交至 api.indexnow.org ...");

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const statusMessages = {
      200: "✅ 提交成功！搜索引擎已收到通知。",
      202: "✅ 已接受（搜索引擎将在后台处理）。",
      400: "❌ 请求格式错误（Bad Request）。",
      403: "❌ Key 无效，请检查 key 文件是否已部署到站点根目录。",
      422: "❌ URL 不属于该 host，或 key 格式不匹配。",
      429: "⚠️  请求过于频繁，请稍后再试。",
    };

    const message = statusMessages[response.status] ?? `HTTP ${response.status}`;
    console.log(`\n   状态码: ${response.status}`);
    console.log(`   结果: ${message}`);

    if (!response.ok && response.status !== 202) {
      const body = await response.text().catch(() => "");
      if (body) console.log(`   响应体: ${body}`);
      process.exit(1);
    }

    console.log("\n🎉 完成！可前往 https://www.bing.com/webmasters 验证收录情况。");
  } catch (err) {
    console.error("\n❌ 网络请求失败：", err.message);
    process.exit(1);
  }
}

main();
