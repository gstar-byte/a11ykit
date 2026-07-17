"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";

interface LinkIssue {
  type: "error" | "warning" | "info";
  message: string;
  linkText: string;
  href: string;
  suggestion?: string;
  wcag?: string;
}

const badLinkTexts = [
  "click here", "click here to continue", "click here to read more",
  "read more", "more", "learn more", "continue", "here",
  "this link", "this page", "link", "go", "start", "next", "previous",
  "download", "view", "see more", "see details", "get started",
];

const sampleHTML = `<a href="/about">About Us</a>
<a href="/blog/post-1">Read more</a>
<a href="https://example.com">click here</a>
<a href="/page"></a>
<a href="https://example.com">https://example.com</a>
<a href="/download">Download</a>
<a href="/contact" aria-label="Contact our support team">Contact</a>`;

export function LinkTextChecker() {
  const [html, setHtml] = useState("");

  const { issues, stats } = useMemo(() => {
    if (!html.trim()) return { issues: [] as LinkIssue[], stats: { total: 0, issues: 0 } };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const links = Array.from(doc.querySelectorAll("a[href]"));
    const foundIssues: LinkIssue[] = [];

    links.forEach((link, i) => {
      const text = (link.textContent || "").trim();
      const href = link.getAttribute("href") || "";
      const ariaLabel = link.getAttribute("aria-label");
      const title = link.getAttribute("title");
      const accessibleName = (ariaLabel || text).trim().toLowerCase();

      if (!text && !ariaLabel) {
        foundIssues.push({
          type: "error",
          message: `Link #${i + 1} has no text content and no aria-label.`,
          linkText: "(empty)",
          href,
          suggestion: "Add descriptive text inside the <a> tag or use aria-label.",
          wcag: "2.4.4",
        });
        return;
      }

      if (badLinkTexts.includes(accessibleName)) {
        foundIssues.push({
          type: "warning",
          message: `Link #${i + 1} uses non-descriptive text: "${accessibleName}".`,
          linkText: text || ariaLabel || "",
          href,
          suggestion: `Use more descriptive text, e.g., "Read more about our services" instead of "Read more".`,
          wcag: "2.4.4",
        });
        return;
      }

      if (text && href && text.trim() === href.trim()) {
        foundIssues.push({
          type: "warning",
          message: `Link #${i + 1} uses the URL as link text.`,
          linkText: text,
          href,
          suggestion: "Replace URL text with a descriptive label.",
          wcag: "2.4.4",
        });
        return;
      }

      if (text && /^https?:\/\//i.test(text.trim()) && text.trim().length > 30) {
        foundIssues.push({
          type: "warning",
          message: `Link #${i + 1} uses a long URL as link text, which is hard for screen reader users.`,
          linkText: text,
          href,
          suggestion: "Use descriptive text and place the URL in the href attribute.",
          wcag: "2.4.4",
        });
        return;
      }

      if (text && text.length > 100) {
        foundIssues.push({
          type: "info",
          message: `Link #${i + 1} has very long link text (${text.length} chars). Consider shortening.`,
          linkText: text.slice(0, 50) + "...",
          href,
          wcag: "2.4.4",
        });
      }
    });

    const duplicateTexts = new Map<string, number>();
    links.forEach((link) => {
      const text = (link.textContent || "").trim().toLowerCase();
      if (text && badLinkTexts.includes(text)) return;
      if (text) {
        duplicateTexts.set(text, (duplicateTexts.get(text) || 0) + 1);
      }
    });
    duplicateTexts.forEach((count, text) => {
      if (count > 1) {
        const sample = links.find((l) => (l.textContent || "").trim().toLowerCase() === text);
        foundIssues.push({
          type: "warning",
          message: `Multiple links (${count}) use the same text "${text}" but may point to different destinations.`,
          linkText: text,
          href: sample?.getAttribute("href") || "",
          suggestion: "If links go to different pages, make their text unique. If they go to the same page, this is fine.",
          wcag: "2.4.4",
        });
      }
    });

    if (foundIssues.length === 0) {
      foundIssues.push({
        type: "info",
        message: "No link text issues found. All links appear to have descriptive text.",
        linkText: "",
        href: "",
      });
    }

    return {
      issues: foundIssues,
      stats: { total: links.length, issues: foundIssues.filter((i) => i.type !== "info").length },
    };
  }, [html]);

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warningCount = issues.filter((i) => i.type === "warning").length;

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="link-html-input" className="block text-sm font-semibold text-slate-700 mb-2">
          Paste your HTML
        </label>
        <textarea
          id="link-html-input"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-4 font-mono text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          rows={8}
          placeholder={sampleHTML}
        />
        <button
          type="button"
          onClick={() => setHtml(sampleHTML)}
          className="mt-2 text-sm text-teal-700 hover:text-teal-600 font-medium"
        >
          Load sample HTML
        </button>
      </div>

      {html.trim() && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-600">Links</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{errorCount}</p>
              <p className="text-sm text-red-600">Errors</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-700">{warningCount}</p>
              <p className="text-sm text-amber-600">Warnings</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Link Text Issues</h3>
            <ul className="space-y-4">
              {issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0">
                  {issue.type === "error" && (
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  {issue.type === "warning" && (
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  {issue.type === "info" && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${issue.type === "error" ? "text-red-700" : issue.type === "warning" ? "text-amber-700" : "text-green-700"}`}>
                      {issue.message}
                    </p>
                    {issue.linkText && (
                      <p className="mt-1 text-xs text-slate-500">
                        Link text: <code className="rounded bg-slate-100 px-1 py-0.5">{issue.linkText}</code>
                        {issue.href && (
                          <> · href: <code className="rounded bg-slate-100 px-1 py-0.5">{issue.href}</code></>
                        )}
                      </p>
                    )}
                    {issue.suggestion && (
                      <p className="mt-1 text-xs text-teal-700">
                        <strong>Suggestion:</strong> {issue.suggestion}
                      </p>
                    )}
                    {issue.wcag && (
                      <p className="mt-0.5 text-xs text-slate-400">WCAG {issue.wcag}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
