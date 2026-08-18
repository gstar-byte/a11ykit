import { ALL_ARTICLES } from "./articles-data.mjs";

const token = "41b853b7-84ae-4b98-a293-7723ef9c6b1c";

async function run() {
  console.log("=================================================");
  console.log("🚀 Hashnode (DA 86) 自动化发文流水线");
  console.log("=================================================");

  // 1. 查询当前作者与 Publication 博客
  const userQuery = `
    query {
      me {
        id
        username
        name
        publications(first: 5) {
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

  console.log("正在验证 Hashnode Token 并读取作者信息...");
  const meRes = await fetch("https://gql.hashnode.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ query: userQuery }),
  });

  const meJson = await meRes.json();
  if (meJson.errors) {
    console.error("❌ Token 验证失败:", meJson.errors);
    return;
  }

  const user = meJson.data?.me;
  console.log(`👤 作者: ${user?.name} (@${user?.username})`);

  let pub = user?.publications?.edges?.[0]?.node;
  if (!pub) {
    console.log("⚠️ 未检测到已存在的 Publication 博客，尝试自动发现或使用主博客...");
    // 很多新账户在创建时会有默认博客，如果为空，我们输出提醒
    console.log("请确保在 Hashnode 已经创建了一个博客 (Blog/Publication)。");
    return;
  }

  console.log(`🏠 目标博客: "${pub.title}" (${pub.url}) [ID: ${pub.id}]\n`);

  const mutation = `
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

  for (let i = 0; i < ALL_ARTICLES.length; i++) {
    const art = ALL_ARTICLES[i];
    console.log(`[${i + 1}/${ALL_ARTICLES.length}] 正在向 Hashnode 发布: "${art.title}"...`);

    const res = await fetch("https://gql.hashnode.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            title: art.title,
            subtitle: art.description,
            publicationId: pub.id,
            contentMarkdown: art.markdown,
            originalArticleURL: art.canonical_url,
            tags: [
              { slug: "web-development", name: "Web Development" },
              { slug: "accessibility", name: "Accessibility" },
              { slug: "javascript", name: "JavaScript" },
            ],
          },
        },
      }),
    });

    const json = await res.json();
    if (json.errors) {
      console.error(`   ❌ 发布失败:`, JSON.stringify(json.errors));
    } else {
      const post = json.data?.publishPost?.post;
      console.log(`   ✅ 成功上线: ${post?.url}`);
      console.log(`      🔗 原文 Canonical 回链: ${post?.canonicalUrl}`);
    }

    if (i < ALL_ARTICLES.length - 1) {
      console.log("   ⏳ 等待 5 秒...");
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  console.log("\n🎉 Hashnode 全量 6 篇大作已全部自动化分发完毕！");
}

run();
