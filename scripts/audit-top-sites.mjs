import puppeteer from "puppeteer";
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load axe-core from local node_modules to avoid CSP issues
const AXE_SOURCE = readFileSync(
  join(__dirname, "..", "node_modules", "axe-core", "axe.min.js"),
  "utf-8"
);

const SITES = [
  // Search & Portals
  { url: "https://www.google.com", name: "Google", category: "Search" },
  { url: "https://www.youtube.com", name: "YouTube", category: "Streaming" },
  { url: "https://www.wikipedia.org", name: "Wikipedia", category: "Reference" },
  // Social
  { url: "https://www.facebook.com", name: "Facebook", category: "Social" },
  { url: "https://www.twitter.com", name: "Twitter/X", category: "Social" },
  { url: "https://www.instagram.com", name: "Instagram", category: "Social" },
  { url: "https://www.linkedin.com", name: "LinkedIn", category: "Social" },
  { url: "https://www.reddit.com", name: "Reddit", category: "Social" },
  { url: "https://www.pinterest.com", name: "Pinterest", category: "Social" },
  { url: "https://www.tiktok.com", name: "TikTok", category: "Social" },
  // E-commerce
  { url: "https://www.amazon.com", name: "Amazon", category: "E-commerce" },
  { url: "https://www.ebay.com", name: "eBay", category: "E-commerce" },
  { url: "https://www.walmart.com", name: "Walmart", category: "E-commerce" },
  { url: "https://www.shopify.com", name: "Shopify", category: "E-commerce" },
  { url: "https://www.etsy.com", name: "Etsy", category: "E-commerce" },
  { url: "https://www.aliexpress.com", name: "AliExpress", category: "E-commerce" },
  { url: "https://www.target.com", name: "Target", category: "E-commerce" },
  { url: "https://www.homedepot.com", name: "Home Depot", category: "E-commerce" },
  // News & Media
  { url: "https://www.cnn.com", name: "CNN", category: "News" },
  { url: "https://www.bbc.com", name: "BBC", category: "News" },
  { url: "https://www.nytimes.com", name: "NY Times", category: "News" },
  { url: "https://www.theguardian.com", name: "The Guardian", category: "News" },
  { url: "https://www.reuters.com", name: "Reuters", category: "News" },
  { url: "https://www.washingtonpost.com", name: "Washington Post", category: "News" },
  { url: "https://www.bloomberg.com", name: "Bloomberg", category: "News" },
  // Tech & Dev
  { url: "https://www.github.com", name: "GitHub", category: "Tech" },
  { url: "https://www.stackoverflow.com", name: "Stack Overflow", category: "Tech" },
  { url: "https://www.microsoft.com", name: "Microsoft", category: "Tech" },
  { url: "https://www.apple.com", name: "Apple", category: "Tech" },
  { url: "https://www.mozilla.org", name: "Mozilla", category: "Tech" },
  { url: "https://www.cloudflare.com", name: "Cloudflare", category: "Tech" },
  { url: "https://www.openai.com", name: "OpenAI", category: "Tech" },
  { url: "https://www.anthropic.com", name: "Anthropic", category: "Tech" },
  // Streaming & Entertainment
  { url: "https://www.netflix.com", name: "Netflix", category: "Streaming" },
  { url: "https://www.spotify.com", name: "Spotify", category: "Streaming" },
  { url: "https://www.twitch.tv", name: "Twitch", category: "Streaming" },
  { url: "https://www.disney.com", name: "Disney", category: "Streaming" },
  // Productivity & Cloud
  { url: "https://www.google.com/docs", name: "Google Docs", category: "Productivity" },
  { url: "https://www.notion.so", name: "Notion", category: "Productivity" },
  { url: "https://www.figma.com", name: "Figma", category: "Productivity" },
  { url: "https://www.slack.com", name: "Slack", category: "Productivity" },
  { url: "https://www.zoom.us", name: "Zoom", category: "Productivity" },
  { url: "https://www.dropbox.com", name: "Dropbox", category: "Productivity" },
  // Finance
  { url: "https://www.paypal.com", name: "PayPal", category: "Finance" },
  { url: "https://www.stripe.com", name: "Stripe", category: "Finance" },
  { url: "https://www.chase.com", name: "Chase Bank", category: "Finance" },
  { url: "https://www.bankofamerica.com", name: "Bank of America", category: "Finance" },
  // Travel
  { url: "https://www.booking.com", name: "Booking.com", category: "Travel" },
  { url: "https://www.airbnb.com", name: "Airbnb", category: "Travel" },
  { url: "https://www.expedia.com", name: "Expedia", category: "Travel" },
  // Health & Education
  { url: "https://www.webmd.com", name: "WebMD", category: "Health" },
  { url: "https://www.coursera.org", name: "Coursera", category: "Education" },
];

async function scanSite(browser, site) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setBypassCSP(true);

  let result = {
    ...site,
    scannedAt: new Date().toISOString(),
    status: "pending",
    violations: [],
    violationCount: 0,
    errorCount: 0,
    warningCount: 0,
    byImpact: { critical: 0, serious: 0, moderate: 0, minor: 0 },
    byRule: {},
    loadTime: 0,
    pageTitle: "",
    error: null,
  };

  try {
    const startTime = Date.now();
    await page.goto(site.url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
    result.loadTime = Date.now() - startTime;
    result.pageTitle = await page.title();

    // Inject axe-core locally (bypass CSP) and run scan
    await page.addScriptTag({ content: AXE_SOURCE });
    const violations = await page.evaluate(async () => {
      const results = await axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        },
        resultTypes: ['violations'],
      });
      return results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        description: v.description,
        helpUrl: v.helpUrl,
        tags: v.tags.filter(t => t.startsWith('wcag')),
        nodeCount: v.nodes.length,
        nodes: v.nodes.slice(0, 3).map(n => ({
          target: n.target,
          html: n.html.substring(0, 200),
          failureSummary: n.failureSummary,
        })),
      }));
    });

    result.violations = violations;
    result.violationCount = violations.length;
    result.errorCount = violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    ).length;
    result.warningCount = violations.filter(
      (v) => v.impact === "moderate" || v.impact === "minor"
    ).length;

    for (const v of violations) {
      result.byImpact[v.impact] = (result.byImpact[v.impact] || 0) + 1;
      result.byRule[v.id] = (result.byRule[v.id] || 0) + v.nodeCount;
    }

    result.status = "completed";
    console.log(
      `✓ ${site.name.padEnd(20)} ${String(violations.length).padStart(2)} violations, ${result.loadTime}ms`
    );
  } catch (err) {
    result.status = "error";
    result.error = err.message;
    console.log(`✗ ${site.name.padEnd(20)} ERROR: ${err.message.substring(0, 80)}`);
  } finally {
    await page.close();
  }

  return result;
}

async function main() {
  console.log(`\n🔍 A11yKit Top 50 Sites Accessibility Audit`);
  console.log(`   ${SITES.length} sites · axe-core WCAG 2.2 ruleset\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results = [];
  const batchSize = 5;

  for (let i = 0; i < SITES.length; i += batchSize) {
    const batch = SITES.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((site) => scanSite(browser, site))
    );
    results.push(...batchResults);
    console.log(`   Progress: ${Math.min(i + batchSize, SITES.length)}/${SITES.length}\n`);
  }

  await browser.close();

  // Generate summary
  const summary = {
    scanDate: new Date().toISOString(),
    totalSites: results.length,
    successfulScans: results.filter((r) => r.status === "completed").length,
    failedScans: results.filter((r) => r.status === "error").length,
    totalViolations: results.reduce((sum, r) => sum + r.violationCount, 0),
    totalErrors: results.reduce((sum, r) => sum + r.errorCount, 0),
    totalWarnings: results.reduce((sum, r) => sum + r.warningCount, 0),
    avgViolationsPerSite:
      results.filter((r) => r.status === "completed").length > 0
        ? (
            results
              .filter((r) => r.status === "completed")
              .reduce((sum, r) => sum + r.violationCount, 0) /
            results.filter((r) => r.status === "completed").length
          ).toFixed(1)
        : 0,
    mostCommonViolations: {},
    byCategory: {},
    byImpact: { critical: 0, serious: 0, moderate: 0, minor: 0 },
  };

  for (const r of results) {
    if (r.status !== "completed") continue;

    // By category
    if (!summary.byCategory[r.category]) {
      summary.byCategory[r.category] = {
        sites: 0,
        totalViolations: 0,
        avgViolations: 0,
      };
    }
    summary.byCategory[r.category].sites++;
    summary.byCategory[r.category].totalViolations += r.violationCount;

    // By impact
    for (const [impact, count] of Object.entries(r.byImpact)) {
      summary.byImpact[impact] += count;
    }

    // Most common violations
    for (const [ruleId, count] of Object.entries(r.byRule)) {
      summary.mostCommonViolations[ruleId] =
        (summary.mostCommonViolations[ruleId] || 0) + 1;
    }
  }

  // Calculate averages per category
  for (const cat of Object.keys(summary.byCategory)) {
    const c = summary.byCategory[cat];
    c.avgViolations = (c.totalViolations / c.sites).toFixed(1);
  }

  // Sort most common violations
  const sortedViolations = Object.entries(summary.mostCommonViolations)
    .sort((a, b) => b[1] - a[1])
    .reduce((obj, [key, val]) => {
      obj[key] = val;
      return obj;
    }, {});
  summary.mostCommonViolations = sortedViolations;

  // Write results
  const outputDir = join(__dirname, "..", "data");
  mkdirSync(outputDir, { recursive: true });

  writeFileSync(
    join(outputDir, "audit-results.json"),
    JSON.stringify({ summary, sites: results }, null, 2)
  );

  console.log(`\n📊 Summary:`);
  console.log(`   Sites scanned: ${summary.successfulScans}/${summary.totalSites}`);
  console.log(`   Total violations: ${summary.totalViolations}`);
  console.log(`   Avg per site: ${summary.avgViolationsPerSite}`);
  console.log(`   Errors: ${summary.totalErrors} · Warnings: ${summary.totalWarnings}`);
  console.log(`\n   Top 5 most common violations:`);
  Object.entries(sortedViolations)
    .slice(0, 5)
    .forEach(([rule, count]) =>
      console.log(`     ${rule.padEnd(30)} ${count} sites`)
    );
  console.log(`\n✅ Results saved to data/audit-results.json\n`);
}

main().catch(console.error);
