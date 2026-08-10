"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle, Info, Download, MousePointerClick } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────── */

interface TargetResult {
  tag: string;
  text: string;
  type: string;
  width: number | null;
  height: number | null;
  hasExplicitSize: boolean;
  issue: "fail" | "warn" | "pass" | "unknown";
  detail: string;
  wcag: string;
  selector: string;
}

/* ─── Interactive element selectors ─────────────────────────── */

const INTERACTIVE_SELECTORS = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  '[role="button"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="tab"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
];

/* ─── Extract inline size ─────────────────────────────────────  */

function parseSize(value: string | null): number | null {
  if (!value) return null;
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}

function getInlineSize(el: Element): { width: number | null; height: number | null } {
  const style = (el as HTMLElement).style;
  const width = parseSize(style?.width || el.getAttribute("width"));
  const height = parseSize(style?.height || el.getAttribute("height"));
  return { width, height };
}

function getInputType(el: Element): string {
  return el.getAttribute("type") || "text";
}

function getLabel(el: Element): string {
  const text = el.textContent?.trim() || "";
  const aria = el.getAttribute("aria-label") || "";
  const placeholder = el.getAttribute("placeholder") || "";
  const value = el.getAttribute("value") || "";
  const type = el.getAttribute("type") || "";
  const href = el.getAttribute("href") || "";
  return (
    text || aria || placeholder || value || type || href || "(no label)"
  ).slice(0, 60);
}

function getSelector(el: Element, index: number): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls = Array.from(el.classList)
    .slice(0, 2)
    .map((c) => `.${c}`)
    .join("");
  return `${tag}${id}${cls} [${index + 1}]`;
}

/* ─── Analysis logic ─────────────────────────────────────────── */

const SKIP_INPUT_TYPES = new Set(["hidden", "file"]);
const MIN_WCAG_AA = 24; // WCAG 2.5.8 AA minimum
const MIN_RECOMMENDED = 44; // Recommended / AAA-ish

function analyzeElement(el: Element, index: number): TargetResult | null {
  const tag = el.tagName.toLowerCase();

  // Skip hidden inputs
  if (tag === "input" && SKIP_INPUT_TYPES.has(getInputType(el))) return null;
  // Skip hidden elements
  if ((el as HTMLElement).style?.display === "none") return null;

  const { width, height } = getInlineSize(el);
  const hasExplicitSize = width !== null || height !== null;
  const text = getLabel(el);
  const selector = getSelector(el, index);
  const type = tag === "input" ? getInputType(el) : tag;

  // Determine issue level
  let issue: TargetResult["issue"] = "unknown";
  let detail = "";
  let wcag = "";

  if (hasExplicitSize && (width !== null || height !== null)) {
    const w = width ?? Infinity;
    const h = height ?? Infinity;

    if (w < MIN_WCAG_AA || h < MIN_WCAG_AA) {
      issue = "fail";
      detail = `Size ${w ?? "?"}×${h ?? "?"}px — below 24×24px minimum (WCAG 2.5.8 AA)`;
      wcag = "2.5.8";
    } else if (w < MIN_RECOMMENDED || h < MIN_RECOMMENDED) {
      issue = "warn";
      detail = `Size ${w ?? "?"}×${h ?? "?"}px — below 44×44px recommended minimum`;
      wcag = "2.5.8";
    } else {
      issue = "pass";
      detail = `Size ${w ?? "?"}×${h ?? "?"}px — meets target size requirements`;
      wcag = "2.5.8";
    }
  } else {
    // No explicit size — flag as needs-manual-check
    issue = "unknown";
    detail = "No explicit width/height found — verify rendered size manually (≥24×24px for WCAG 2.5.8)";
    wcag = "2.5.8";
  }

  return { tag, text, type, width, height, hasExplicitSize, issue, detail, wcag, selector };
}

/* ─── Sample HTML ─────────────────────────────────────────────  */

const sampleHTML = `<nav>
  <a href="/home">Home</a>
  <a href="/about" style="width: 16px; height: 16px;">About</a>
  <button style="width: 44px; height: 44px;">Menu</button>
</nav>
<form>
  <input type="text" placeholder="Search" style="width: 200px; height: 20px;" />
  <button type="submit" style="width: 32px; height: 32px;">Go</button>
  <input type="checkbox" style="width: 12px; height: 12px;" />
  <label for="check">Subscribe</label>
</form>
<div role="button" style="width: 48px; height: 48px;">Click me</div>`;

/* ─── Component ──────────────────────────────────────────────── */

export function TouchTargetChecker() {
  const [html, setHtml] = useState("");

  const results = useMemo((): TargetResult[] => {
    if (!html.trim()) return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const elements = doc.querySelectorAll(INTERACTIVE_SELECTORS.join(","));
      const results: TargetResult[] = [];
      elements.forEach((el, i) => {
        const r = analyzeElement(el, i);
        if (r) results.push(r);
      });
      return results;
    } catch {
      return [];
    }
  }, [html]);

  const failCount = results.filter((r) => r.issue === "fail").length;
  const warnCount = results.filter((r) => r.issue === "warn").length;
  const unknownCount = results.filter((r) => r.issue === "unknown").length;
  const passCount = results.filter((r) => r.issue === "pass").length;

  function handleExport() {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "touch-target-report.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const issueBadge = (issue: TargetResult["issue"]) => {
    switch (issue) {
      case "fail":
        return (
          <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700">
            FAIL
          </span>
        );
      case "warn":
        return (
          <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700">
            WARN
          </span>
        );
      case "pass":
        return (
          <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700">
            PASS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-600">
            CHECK
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">WCAG 2.5.8 — Target Size (Minimum)</p>
          <p className="mt-0.5">
            New in WCAG 2.2 (Level AA): All interactive targets must be at least{" "}
            <strong>24×24 CSS pixels</strong>, unless spacing compensates or the target is inline text.
            The recommended best-practice size is <strong>44×44px</strong>.
          </p>
        </div>
      </div>

      {/* Input */}
      <div>
        <label
          htmlFor="touch-target-html"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Paste your HTML (buttons, links, inputs, form controls)
        </label>
        <textarea
          id="touch-target-html"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-4 font-mono text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          rows={10}
          placeholder="Paste HTML containing interactive elements…"
        />
        <button
          type="button"
          onClick={() => setHtml(sampleHTML)}
          className="mt-2 text-sm text-teal-700 hover:text-teal-600 font-medium"
        >
          Load sample HTML
        </button>
      </div>

      {results.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Fail (< 24px)", value: failCount, cls: "bg-red-50 text-red-700 border-red-200" },
              { label: "Warn (< 44px)", value: warnCount, cls: "bg-amber-50 text-amber-700 border-amber-200" },
              { label: "Needs Check", value: unknownCount, cls: "bg-slate-50 text-slate-700 border-slate-200" },
              { label: "Pass (≥ 44px)", value: passCount, cls: "bg-green-50 text-green-700 border-green-200" },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`rounded-xl border p-4 text-center ${cls}`}>
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Results Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-teal-700" aria-hidden="true" />
                {results.length} Interactive Element{results.length !== 1 ? "s" : ""} Found
              </h3>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Export JSON
              </button>
            </div>

            <ul className="divide-y divide-slate-100">
              {results.map((r, i) => (
                <li key={i} className="px-6 py-4 flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">{issueBadge(r.issue)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                        &lt;{r.type}&gt;
                      </code>
                      <span className="text-sm text-slate-800 font-medium truncate">
                        {r.text}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{r.detail}</p>
                    {r.wcag && (
                      <p className="text-xs text-slate-400 mt-0.5">WCAG {r.wcag}</p>
                    )}
                  </div>
                  {r.issue === "fail" && (
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  {r.issue === "warn" && (
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  {r.issue === "pass" && (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Fix guide */}
          {(failCount > 0 || warnCount > 0) && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">How to Fix</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div>
                  <p className="font-medium text-slate-800">For buttons:</p>
                  <code className="block mt-1 bg-slate-50 rounded p-3 font-mono text-xs text-slate-700 whitespace-pre">
                    {`button {
  min-width: 44px;
  min-height: 44px;
  /* Or add padding to reach target size */
  padding: 12px 16px;
}`}
                  </code>
                </div>
                <div>
                  <p className="font-medium text-slate-800">For inline links:</p>
                  <code className="block mt-1 bg-slate-50 rounded p-3 font-mono text-xs text-slate-700 whitespace-pre">
                    {`a {
  display: inline-block;
  padding: 8px 4px; /* Ensures ≥24px height */
}`}
                  </code>
                </div>
                <div>
                  <p className="font-medium text-slate-800">For checkboxes / radios:</p>
                  <code className="block mt-1 bg-slate-50 rounded p-3 font-mono text-xs text-slate-700 whitespace-pre">
                    {`input[type="checkbox"],
input[type="radio"] {
  width: 24px;
  height: 24px;
}`}
                  </code>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {html.trim() && results.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600 text-sm">
            No interactive elements found. Make sure your HTML includes{" "}
            <code className="text-xs bg-slate-200 px-1 rounded">
              &lt;a&gt;, &lt;button&gt;, &lt;input&gt;
            </code>{" "}
            or ARIA role elements.
          </p>
        </div>
      )}
    </div>
  );
}
