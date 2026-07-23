import type { Metadata } from "next";
import auditData from "@/data/audit-results.json";

export const metadata: Metadata = {
  title: "Top 50 Websites Accessibility Audit 2026 — A11yKit",
  description:
    "We scanned 52 of the world's most visited websites with axe-core WCAG 2.2 rules. 70 violations found across 48 sites. See which sites failed, the most common issues, and what it means for the web.",
  alternates: { canonical: "https://a11ykit.site/accessibility-report" },
  openGraph: {
    title: "Top 50 Websites Accessibility Audit 2026",
    description:
      "52 sites scanned with axe-core WCAG 2.2. 70 violations. 95.7% error-level severity. See the full results.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Top 50 Websites Accessibility Audit 2026" }],
  },
};

const RULE_LABELS: Record<string, string> = {
  "color-contrast": "Insufficient Color Contrast",
  "image-alt": "Missing Image Alt Text",
  "link-name": "Empty or Missing Link Text",
  "aria-allowed-attr": "Invalid ARIA Attributes",
  "target-size": "Tap Target Too Small",
  "list": "Improper List Structure",
  "html-has-lang": "Missing Document Language",
  "meta-viewport": "Viewport Meta Tag Issues",
  "nested-interactive": "Nested Interactive Elements",
  "document-title": "Missing Document Title",
  "button-name": "Empty Button Name",
  "listitem": "List Item Outside List",
  "aria-required-children": "Missing Required ARIA Children",
  "aria-required-parent": "Missing Required ARIA Parent",
  "label": "Missing Form Label",
  "html-lang-valid": "Invalid Language Code",
  "blink": "Blink Element (Deprecated)",
  "meta-refresh": "Meta Refresh Redirect",
  "aria-roles": "Invalid ARIA Role",
  "autocomplete-valid": "Invalid Autocomplete Attribute",
  "frame-title": "Missing Frame Title",
  "role-img-alt": "Missing Alt on Role=img",
  "select-name": "Empty Select Element Name",
  "link-in-text-block": "Link Not Distinguishable",
  "aria-valid-attr-value": "Invalid ARIA Attribute Value",
};

const IMPACT_COLORS: Record<string, string> = {
  critical: "bg-red-500",
  serious: "bg-orange-500",
  moderate: "bg-yellow-500",
  minor: "bg-blue-400",
};

const IMPACT_TEXT: Record<string, string> = {
  critical: "text-red-600",
  serious: "text-orange-600",
  moderate: "text-yellow-600",
  minor: "text-blue-500",
};

function SeverityBadge({ impact }: { impact: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-100 text-red-700 border-red-300",
    serious: "bg-orange-100 text-orange-700 border-orange-300",
    moderate: "bg-yellow-100 text-yellow-700 border-yellow-300",
    minor: "bg-blue-100 text-blue-700 border-blue-300",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${colors[impact] || ""}`}>
      {impact}
    </span>
  );
}

export default function AccessibilityReportPage() {
  const { summary, sites } = auditData as any;
  const completedSites = sites.filter((s: any) => s.status === "completed");
  const failedSites = sites.filter((s: any) => s.status === "error");

  // Sort by violation count descending
  const ranked = [...completedSites].sort((a: any, b: any) => b.violationCount - a.violationCount);

  // Top violations with labels
  const topViolations = Object.entries(summary.mostCommonViolations)
    .slice(0, 10)
    .map(([rule, count]) => ({
      rule,
      label: RULE_LABELS[rule] || rule,
      count: count as number,
      percent: (((count as number) / summary.successfulScans) * 100).toFixed(0),
    }));

  // Category data
  const categoryData = Object.entries(summary.byCategory)
    .map(([cat, data]: any) => ({
      category: cat,
      sites: data.sites,
      avg: parseFloat(data.avgViolations),
      total: data.totalViolations,
    }))
    .sort((a, b) => b.avg - a.avg);

  const maxAvg = Math.max(...categoryData.map((c) => c.avg));

  const cleanSites = completedSites.filter((s: any) => s.violationCount === 0);
  const worstSites = ranked.filter((s: any) => s.violationCount >= 3).slice(0, 10);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: "Top 50 Websites Accessibility Audit 2026",
            description: `Accessibility audit of ${summary.totalSites} top websites using axe-core WCAG 2.2 ruleset. ${summary.totalViolations} violations found across ${summary.successfulScans} sites.`,
            creator: { "@type": "Organization", name: "A11yKit", url: "https://a11ykit.site" },
            datePublished: summary.scanDate,
            keywords: ["accessibility", "WCAG 2.2", "web audit", "axe-core", "EAA compliance"],
            variableMeasured: ["violation count", "violation type", "impact level", "WCAG criteria"],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Top 50 Websites Accessibility Audit 2026",
            description: metadata.description,
            author: { "@type": "Organization", name: "A11yKit", url: "https://a11ykit.site" },
            datePublished: summary.scanDate,
            publisher: {
              "@type": "Organization",
              name: "A11yKit",
              url: "https://a11ykit.site",
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://a11ykit.site/accessibility-report",
            },
          }),
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-sm text-blue-300 font-medium mb-3">
              Research Report · {new Date(summary.scanDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Top 50 Websites Accessibility Audit 2026
            </h1>
            <p className="text-lg text-gray-300 mb-6 max-w-2xl">
              We scanned {summary.totalSites} of the world&apos;s most visited websites with axe-core&apos;s
              WCAG 2.2 ruleset. Here&apos;s what we found — and what it means for the state of web accessibility.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-white/10 rounded-lg px-4 py-2 backdrop-blur">
                <span className="text-2xl font-bold">{summary.successfulScans}</span>
                <span className="text-gray-400 ml-2">sites scanned</span>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 backdrop-blur">
                <span className="text-2xl font-bold">{summary.totalViolations}</span>
                <span className="text-gray-400 ml-2">violations found</span>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 backdrop-blur">
                <span className="text-2xl font-bold">{summary.avgViolationsPerSite}</span>
                <span className="text-gray-400 ml-2">avg per site</span>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 backdrop-blur">
                <span className="text-2xl font-bold text-red-400">
                  {Math.round((summary.totalErrors / summary.totalViolations) * 100)}%
                </span>
                <span className="text-gray-400 ml-2">error severity</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
          {/* Key Findings */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Findings</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {Math.round((1 - cleanSites.length / summary.successfulScans) * 100)}%
                </div>
                <div className="text-sm text-gray-600">
                  of scanned sites have at least one WCAG 2.2 violation. Only {cleanSites.length} sites passed with zero violations.
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {summary.byImpact.critical + summary.byImpact.serious}
                </div>
                <div className="text-sm text-gray-600">
                  violations are critical or serious severity — issues that directly prevent users with disabilities from accessing content.
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {topViolations[0]?.percent}%
                </div>
                <div className="text-sm text-gray-600">
                  of sites have {topViolations[0]?.label.toLowerCase()} — the most common violation, affecting {topViolations[0]?.count} sites.
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {categoryData[0]?.avg.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">
                  avg violations in the {categoryData[0]?.category} category — the worst-performing sector.
                </div>
              </div>
            </div>
          </section>

          {/* Most Common Violations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Most Common Violations</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Violation</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">Sites Affected</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">% of Sites</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 hidden md:table-cell">Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topViolations.map((v, i) => (
                    <tr key={v.rule} className={i < 3 ? "bg-red-50/50" : ""}>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{v.label}</div>
                        <div className="text-xs text-gray-500 font-mono">{v.rule}</div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">{v.count}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{v.percent}%</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${(v.count / summary.successfulScans) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* By Category */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Violations by Industry Category</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              {categoryData.map((cat) => (
                <div key={cat.category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                    <span className="text-sm text-gray-500">
                      {cat.total} total · {cat.avg.toFixed(1)} avg
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${cat.avg >= 2 ? "bg-red-500" : cat.avg >= 1 ? "bg-orange-400" : "bg-green-400"}`}
                      style={{ width: `${(cat.avg / maxAvg) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Worst Sites */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Worst Performing Sites</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Site</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">Violations</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">Errors</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 hidden md:table-cell">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {worstSites.map((site: any) => (
                    <tr key={site.url}>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{site.name}</div>
                        <div className="text-xs text-gray-500">{site.category}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 text-sm font-bold">
                          {site.violationCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{site.errorCount}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {site.violations.slice(0, 4).map((v: any) => (
                            <span key={v.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {v.id}
                            </span>
                          ))}
                          {site.violations.length > 4 && (
                            <span className="text-xs text-gray-400">+{site.violations.length - 4}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Clean Sites */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sites With Zero Violations</h2>
            <p className="text-gray-600 mb-4">
              These {cleanSites.length} sites passed the axe-core WCAG 2.2 scan with zero violations. This means their
              homepage meets the automated accessibility checks — though manual testing may still reveal issues.
            </p>
            <div className="flex flex-wrap gap-2">
              {cleanSites.map((site: any) => (
                <span key={site.url} className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {site.name}
                </span>
              ))}
            </div>
          </section>

          {/* Full Results Table */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Full Results</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">#</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Site</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 hidden sm:table-cell">Category</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">Violations</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700 hidden md:table-cell">Load Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ranked.map((site: any, i: number) => (
                    <tr key={site.url} className={site.violationCount === 0 ? "bg-green-50/30" : ""}>
                      <td className="px-4 py-2 text-sm text-gray-400">{i + 1}</td>
                      <td className="px-4 py-2 text-sm">
                        <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                          {site.name}
                        </a>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500 hidden sm:table-cell">{site.category}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`text-sm font-bold ${site.violationCount === 0 ? "text-green-600" : site.violationCount >= 3 ? "text-red-600" : "text-orange-600"}`}>
                          {site.violationCount}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center text-sm text-gray-500 hidden md:table-cell">
                        {site.loadTime ? `${(site.loadTime / 1000).toFixed(1)}s` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {failedSites.length > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                <strong>Failed to scan ({failedSites.length}):</strong>{" "}
                {failedSites.map((s: any) => s.name).join(", ")}
              </div>
            )}
          </section>

          {/* Methodology */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Methodology</h2>
            <div className="prose prose-sm max-w-none text-gray-600 space-y-3">
              <p>
                We selected {summary.totalSites} of the world&apos;s most visited websites across 11 categories
                (search, social, e-commerce, news, tech, streaming, productivity, finance, travel, health, education).
              </p>
              <p>
                Each site was loaded in a headless Chromium browser using Puppeteer with a 1280×800 viewport.
                After the page loaded, <a href="https://github.com/dequelabs/axe-core" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">axe-core v4.12</a> was
                injected to run the WCAG 2.2 ruleset (tags: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa).
              </p>
              <p>
                Violations are categorized by impact: <strong>critical</strong> (blocks access entirely),
                <strong> serious</strong> (partial barrier), <strong>moderate</strong> (inconvenience),
                and <strong>minor</strong> (minor annoyance).
              </p>
              <p className="text-xs text-gray-400">
                Automated tools detect approximately 30-40% of WCAG issues. A clean scan does not guarantee
                full accessibility — manual testing with screen readers, keyboard navigation, and real users
                is always needed. This report captures a snapshot of each site&apos;s homepage at the time of scanning.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Test Your Own Website</h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto">
              Run the same WCAG 2.2 accessibility scan on any URL — free, in your browser, no upload required.
            </p>
            <a
              href="/tools/url-scanner"
              className="inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition"
            >
              Open URL Scanner →
            </a>
          </section>
        </div>
      </div>
    </>
  );
}
