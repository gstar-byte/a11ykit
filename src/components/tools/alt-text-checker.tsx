"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle, Download } from "lucide-react";
import { exportAsJSON, exportAsMarkdown, exportAsHTML } from "@/lib/export-utils";

interface AltTextIssue {
  type: "error" | "warning" | "info";
  message: string;
  src: string;
  alt: string;
  suggestion?: string;
  wcag?: string;
}

const sampleHTML = `<img src="/hero.jpg" alt="Team meeting in the office" />
<img src="/logo.png" alt="" />
<img src="/photo.jpeg" />
<img src="/icon-menu.svg" alt="icon" />
<img src="/products/widget-300x200.jpg" alt="widget-300x200" />
<img src="/decorative-bg.png" alt="" role="presentation" />`;

export function AltTextChecker() {
  const [html, setHtml] = useState("");

  const { issues, stats } = useMemo(() => {
    if (!html.trim()) return { issues: [] as AltTextIssue[], stats: { total: 0, missing: 0, empty: 0, ok: 0 } };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const images = Array.from(doc.querySelectorAll("img"));
    const foundIssues: AltTextIssue[] = [];
    let missing = 0, empty = 0, ok = 0;

    images.forEach((img, i) => {
      const src = img.getAttribute("src") || "(no src)";
      const alt = img.getAttribute("alt");
      const role = img.getAttribute("role");

      if (alt === null) {
        missing++;
        foundIssues.push({
          type: "error",
          message: `Image #${i + 1} is missing the alt attribute entirely.`,
          src,
          alt: "(missing)",
          suggestion: 'Add alt="description" for informative images, or alt="" for decorative images.',
          wcag: "1.1.1",
        });
        return;
      }

      if (alt === "") {
        if (role === "presentation" || role === "none") {
          ok++;
          foundIssues.push({
            type: "info",
            message: `Image #${i + 1} is marked as decorative (alt="" + role="presentation"). This is correct for decorative images.`,
            src,
            alt: '""',
          });
        } else {
          empty++;
          foundIssues.push({
            type: "warning",
            message: `Image #${i + 1} has empty alt text (alt="") without role="presentation". This may be intentional for decorative images, but could also be an oversight.`,
            src,
            alt: '""',
            suggestion: 'If decorative, add role="presentation". If informative, provide descriptive alt text.',
            wcag: "1.1.1",
          });
        }
        return;
      }

      const filenameMatch = src.match(/([^\/]+?)(\.\w+)?$/);
      const filename = filenameMatch ? filenameMatch[1].replace(/[-_]/g, " ").toLowerCase() : "";
      if (filename && alt.toLowerCase().trim() === filename.trim()) {
        foundIssues.push({
          type: "warning",
          message: `Image #${i + 1} appears to use the filename as alt text: "${alt}".`,
          src,
          alt,
          suggestion: "Describe the content of the image, not its filename.",
          wcag: "1.1.1",
        });
        return;
      }

      if (alt.length > 125) {
        foundIssues.push({
          type: "warning",
          message: `Image #${i + 1} has very long alt text (${alt.length} chars). Consider shortening to under 125 characters.`,
          src,
          alt: alt.slice(0, 50) + "...",
          suggestion: "Keep alt text concise. For complex images, use a longer description via aria-describedby.",
          wcag: "1.1.1",
        });
        return;
      }

      const genericAlt = ["image", "img", "picture", "photo", "icon", "graphic", "placeholder", "spacer"];
      if (genericAlt.includes(alt.toLowerCase().trim())) {
        foundIssues.push({
          type: "warning",
          message: `Image #${i + 1} uses generic alt text: "${alt}".`,
          src,
          alt,
          suggestion: 'Describe what the image conveys, e.g., "Shopping cart icon" instead of just "icon".',
          wcag: "1.1.1",
        });
        return;
      }

      ok++;
      foundIssues.push({
        type: "info",
        message: `Image #${i + 1} has appropriate alt text.`,
        src,
        alt,
      });
    });

    if (images.length === 0) {
      foundIssues.push({
        type: "info",
        message: "No images found in the provided HTML.",
        src: "",
        alt: "",
      });
    }

    return {
      issues: foundIssues,
      stats: { total: images.length, missing, empty, ok },
    };
  }, [html]);

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warningCount = issues.filter((i) => i.type === "warning").length;

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="alt-html-input" className="block text-sm font-semibold text-slate-700 mb-2">
          Paste your HTML
        </label>
        <textarea
          id="alt-html-input"
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
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-600">Images</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{stats.missing}</p>
              <p className="text-sm text-red-600">Missing alt</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-700">{stats.empty}</p>
              <p className="text-sm text-amber-600">Empty alt</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{stats.ok}</p>
              <p className="text-sm text-green-600">OK</p>
            </div>
          </div>

          {(errorCount > 0 || warningCount > 0) && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              <strong>{errorCount}</strong> error(s) and <strong>{warningCount}</strong> warning(s) found.
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Image Alt Text Analysis</h3>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => exportAsJSON(issues, "alt-text-checker")} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"><Download className="h-3.5 w-3.5" aria-hidden="true" /> JSON</button>
                <button type="button" onClick={() => exportAsMarkdown(issues, "alt-text-checker")} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"><Download className="h-3.5 w-3.5" aria-hidden="true" /> MD</button>
                <button type="button" onClick={() => exportAsHTML(issues, "alt-text-checker")} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"><Download className="h-3.5 w-3.5" aria-hidden="true" /> HTML</button>
              </div>
            </div>
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
                    {issue.src && (
                      <p className="mt-1 text-xs text-slate-500">
                        src: <code className="rounded bg-slate-100 px-1 py-0.5">{issue.src}</code>
                        {issue.alt && (
                          <> · alt: <code className="rounded bg-slate-100 px-1 py-0.5">{issue.alt}</code></>
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
