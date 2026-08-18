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

const clientId = process.env.PH_API_KEY || "5dEIwrmYU48m7q8KD-yXAdugPR-OzHF6N5zpGWTo4-0";
const clientSecret = process.env.PH_API_SECRET || "IHSfp8rbMy5BhmD3hyzf-ceunMthM703m9gWfbZY2s8";

async function main() {
  console.log("=================================================");
  console.log("🚀 Product Hunt (DA 91) 官方 API 握手测试");
  console.log("=================================================");

  console.log("正在请求 OAuth Token...");
  try {
    const tokenRes = await fetch("https://api.producthunt.com/v2/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("❌ Token 获取失败:", tokenData);
      return;
    }

    const accessToken = tokenData.access_token;
    console.log("✅ 成功获取 Product Hunt Access Token！Token 类型:", tokenData.token_type);

    // 2. 检查 GraphQL 开放的 Mutation 接口
    const query = `
      query {
        __schema {
          mutationType {
            fields {
              name
              description
            }
          }
        }
      }
    `;

    console.log("正在查询 Product Hunt API 开放的写操作权限...");
    const gqlRes = await fetch("https://api.producthunt.com/v2/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
    });

    const gqlData = await gqlRes.json();
    console.log("GraphQL 开放的写接口 (Mutations):", JSON.stringify(gqlData.data?.__schema?.mutationType?.fields, null, 2));

    // 3. 检查相关的无障碍/A11y/开发工具现有产品排名与标签
    const postsQuery = `
      query {
        posts(first: 3) {
          edges {
            node {
              id
              name
              tagline
              url
            }
          }
        }
      }
    `;

    const postsRes = await fetch("https://api.producthunt.com/v2/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: postsQuery }),
    });

    const postsData = await postsRes.json();
    console.log("\n📊 Product Hunt API 连接通畅！今日热门示例:", JSON.stringify(postsData.data?.posts?.edges?.map(e => e.node), null, 2));

  } catch (e) {
    console.error("Product Hunt API 异常:", e.message);
  }
}

main();
