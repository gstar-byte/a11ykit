import fs from 'fs';

const API_KEY = 'AIzaSyCTpQxzKYA8OyZ-AaaQHNXB0JCY2Nk0Fa8';
const BASE = 'https://a11ykit.site';
const URLS_TO_TEST = [
  '/',
  '/tools',
  '/tools/contrast-checker',
  '/tools/html-scanner',
  '/accessibility-report',
];

async function runAudit(path, strategy) {
  const url = `${BASE}${path}`;
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${API_KEY}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;
  
  const startTime = Date.now();
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`PSI API failed (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  const lh = data.lighthouseResult;
  
  const categories = {
    performance: Math.round(lh.categories.performance?.score * 100),
    accessibility: Math.round(lh.categories.accessibility?.score * 100),
    bestPractices: Math.round(lh.categories['best-practices']?.score * 100),
    seo: Math.round(lh.categories.seo?.score * 100),
  };

  const getMetric = (id) => {
    const audit = lh.audits[id];
    if (!audit) return null;
    return {
      score: audit.score,
      displayValue: audit.displayValue,
      numericValue: audit.numericValue ? Math.round(audit.numericValue) : undefined,
    };
  };

  const metrics = {
    fcp: getMetric('first-contentful-paint'),
    lcp: getMetric('largest-contentful-paint'),
    tbt: getMetric('total-blocking-time'),
    cls: getMetric('cumulative-layout-shift'),
    si: getMetric('speed-index'),
  };

  // Audits failing or with score < 1
  const failingAudits = [];
  for (const [id, a] of Object.entries(lh.audits)) {
    if (a.score !== 1 && a.score !== null) {
      failingAudits.push({
        id,
        title: a.title,
        score: a.score,
        displayValue: a.displayValue,
        details: a.details?.items?.slice(0, 3),
      });
    }
  }

  return {
    path,
    strategy,
    durationMs: Date.now() - startTime,
    categories,
    metrics,
    failingAudits,
  };
}

async function main() {
  console.log(`🚀 Starting Parallel PageSpeed Insights audit for ${BASE} ...\n`);
  
  const tasks = [];
  for (const path of URLS_TO_TEST) {
    for (const strategy of ['mobile', 'desktop']) {
      tasks.push(
        runAudit(path, strategy)
          .then((r) => {
            console.log(`✅ [${strategy.toUpperCase()}] ${path.padEnd(25)} => Perf: ${r.categories.performance} | A11y: ${r.categories.accessibility} | Best: ${r.categories.bestPractices} | SEO: ${r.categories.seo} | LCP: ${r.metrics.lcp?.displayValue} | TBT: ${r.metrics.tbt?.displayValue}`);
            return r;
          })
          .catch((e) => {
            console.error(`❌ [${strategy.toUpperCase()}] ${path} failed:`, e.message);
            return null;
          })
      );
    }
  }

  const results = (await Promise.all(tasks)).filter(Boolean);
  fs.writeFileSync('scripts/psi-results.json', JSON.stringify(results, null, 2));
  console.log('\n📄 Complete results saved to scripts/psi-results.json');
}

main();
