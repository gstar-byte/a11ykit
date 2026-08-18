import fs from "node:fs";
import path from "node:path";
import { ALL_ARTICLES } from "./articles-data.mjs";

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

// ── 1. Telegra.ph (DA 93 - Telegram 顶级极速发布平台，无需用户提供 Key，纯 API 自动生成) ──
async function publishToTelegraph() {
  console.log("\n========================================================");
  console.log("🌐 [1/2] 正在向 Telegra.ph (DA 93) 极速发布...");
  console.log("========================================================");

  try {
    const accRes = await fetch("https://api.telegra.ph/createAccount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        short_name: "a11ykit",
        author_name: "A11yKit Team",
        author_url: "https://a11ykit.site",
      }),
    });
    const accData = await accRes.json();
    if (!accData.ok) {
      console.error("Telegra.ph 账号创建失败:", accData.error);
      return;
    }
    const token = accData.result.access_token;
    console.log("✅ Telegra.ph 官方 API 会话建立成功！");

    for (const art of ALL_ARTICLES) {
      console.log(`   正在发布: "${art.title}"...`);

      const paragraphs = art.markdown.split("\n\n").map((p) => {
        if (p.startsWith("## ")) {
          return { tag: "h3", children: [p.replace("## ", "")] };
        }
        if (p.startsWith("### ")) {
          return { tag: "h4", children: [p.replace("### ", "")] };
        }
        return { tag: "p", children: [p] };
      });

      paragraphs.push({
        tag: "p",
        children: [
          "Original Source: ",
          { tag: "a", attrs: { href: art.canonical_url }, children: [`A11yKit - ${art.title}`] },
        ],
      });

      const pageRes = await fetch("https://api.telegra.ph/createPage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: token,
          title: art.title,
          author_name: "A11yKit Team",
          author_url: "https://a11ykit.site",
          content: paragraphs,
          return_content: false,
        }),
      });

      const pageData = await pageRes.json();
      if (pageData.ok) {
        console.log(`   ✅ 成功上线: ${pageData.result.url}`);
        console.log(`      🔗 原文反向链接: ${art.canonical_url}`);
      } else {
        console.error(`   ❌ 发布失败: ${pageData.error}`);
      }
    }
  } catch (e) {
    console.error("Telegraph 发布异常:", e.message);
  }
}

// ── 2. Hashnode (DA 86 - 顶级海外开发者博客，GraphQL API) ────────────────
async function publishToHashnode(token) {
  console.log("\n========================================================");
  console.log("🌐 [2/2] 正在向 Hashnode (DA 86) 发布文章...");
  console.log("========================================================");

  try {
    const userQuery = `
      query {
        me {
          username
          publications(first: 1) {
            edges {
              node {
                id
                title
                url
              }
            }
          }
        }
      }
    `;

    const meRes = await fetch("https://gql.hashnode.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ query: userQuery }),
    });

    const meData = await meRes.json();
    const pubEdge = meData.data?.me?.publications?.edges?.[0];

    if (!pubEdge) {
      console.error("❌ 未找到你的 Hashnode Publication 博客主页，请确保在 Hashnode 创建了一个 Blog。");
      return;
    }

    const publicationId = pubEdge.node.id;
    console.log(`✅ 成功识别 Hashnode 博客: "${pubEdge.node.title}" (${pubEdge.node.url})`);

    const publishMutation = `
      mutation PublishPost($input: PublishPostInput!) {
        publishPost(input: $input) {
          post {
            id
            title
            url
            canonicalUrl
          }
        }
      }
    `;

    for (const art of ALL_ARTICLES) {
      console.log(`   正在发布: "${art.title}"...`);
      const res = await fetch("https://gql.hashnode.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          query: publishMutation,
          variables: {
            input: {
              title: art.title,
              subtitle: art.description,
              publicationId: publicationId,
              contentMarkdown: art.markdown,
              originalArticleURL: art.canonical_url,
              tags: [{ slug: "web-development", name: "Web Development" }, { slug: "accessibility", name: "Accessibility" }],
            },
          },
        }),
      });

      const data = await res.json();
      if (data.errors) {
        console.error(`   ❌ 发布失败: ${JSON.stringify(data.errors)}`);
      } else {
        const post = data.data.publishPost.post;
        console.log(`   ✅ 成功上线: ${post.url}`);
        console.log(`      🔗 原文回链 (Canonical): ${post.canonicalUrl}`);
      }
    }
  } catch (e) {
    console.error("Hashnode 发布异常:", e.message);
  }
}

async function main() {
  console.log("========================================================");
  console.log("🚀 A11yKit 全网多平台 API 自动化内容分发矩阵");
  console.log("========================================================");

  // 1. 先执行 Telegra.ph (DA 93) 100% 自动化全量分发
  await publishToTelegraph();

  // 2. 检查 Hashnode Token
  const hashnodeToken = process.env.HASHNODE_TOKEN;
  if (hashnodeToken) {
    await publishToHashnode(hashnodeToken);
  } else {
    console.log("\n💡 提示: 配置 HASHNODE_TOKEN 可一键分发至 Hashnode (DA 86)");
  }
}

main();
