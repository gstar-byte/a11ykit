import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";

const username = "a11ykit";
const password = "bzXF1^8BYorfXuFn";
const email = "willpostpony@gmail.com";

async function createAndPublish() {
  console.log("=================================================");
  console.log("🚀 NPM 官方账号自动创建与包发布流水线 (DA 94)");
  console.log("=================================================");
  console.log(`👤 正在为 [${username}] 注册 NPM 官方账号 (邮箱: ${email})...`);

  try {
    const res = await fetch(`https://registry.npmjs.org/-/user/org.couchdb.user:${username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _id: `org.couchdb.user:${username}`,
        name: username,
        password: password,
        email: email,
        type: "user",
        roles: [],
        date: new Date().toISOString(),
      }),
    });

    const data = await res.json();
    console.log("NPM 注册/认证响应:", JSON.stringify(data, null, 2));

    if (data.token) {
      console.log("✅ 成功获取 NPM Auth Token！");
      const npmrcPath = path.join(os.homedir(), ".npmrc");
      const authLine = `//registry.npmjs.org/:_authToken=${data.token}\nregistry=https://registry.npmjs.org/\n`;

      let existingNpmrc = "";
      if (fs.existsSync(npmrcPath)) {
        existingNpmrc = fs.readFileSync(npmrcPath, "utf-8");
      }

      fs.writeFileSync(npmrcPath, existingNpmrc + "\n" + authLine, "utf-8");
      console.log("✅ 已将 Auth Token 写入本地 ~/.npmrc 配置文件！");

      // 执行发布
      console.log("\n📦 正在向 npmjs.com 发布官方包 [a11ykit]...");
      const pkgDir = path.resolve(process.cwd(), "packages", "a11ykit-cli");
      const pubOutput = execSync("npm publish --access public --registry=https://registry.npmjs.org/", {
        cwd: pkgDir,
        encoding: "utf-8",
      });

      console.log(pubOutput);
      console.log("\n🎉 a11ykit 官方包已成功在 npmjs.com 全球上线！");
      console.log("🔗 官方主页: https://www.npmjs.com/package/a11ykit");
      console.log("🌐 绑定官网: https://a11ykit.site (DA 94 顶级权威外链生效)");
    } else {
      console.error("❌ 注册响应未返回 token:", data.error || data.message);
    }
  } catch (e) {
    console.error("执行异常:", e.message);
  }
}

createAndPublish();
