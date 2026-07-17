"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

interface FocusableElement {
  tag: string;
  type: string;
  text: string;
  index: number;
  tabIndex: number | null;
  issues: string[];
}

const sampleHTML = `<nav>
  <a href="/home">Home</a>
  <a href="/about">About</a>
</nav>
<main>
  <h1>Welcome</h1>
  <button>Click me</button>
  <input type="text" placeholder="Search" />
  <a href="/help" tabindex="5">Help</a>
  <div tabindex="3">Custom focusable div</div>
  <button tabindex="-1">Skip me</button>
  <a href="/contact" tabindex="1">Contact</a>
</main>`;

export function FocusOrderChecker() {
  const [html, setHtml] = useState("");

  const { elements, issues } = useMemo(() => {
    if (!html.trim()) return { elements: [] as FocusableElement[], issues: [] as { type: string; message: string; wcag?: string }[] };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const foundIssues: { type: string; message: string; wcag?: string }[] = [];

    const focusableSelectors = [
      "a[href]", "button:not([disabled])", "input:not([disabled]):not([type='hidden'])",
      "select:not([disabled])", "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])", "details summary", "[contenteditable='true']",
      "audio[controls]", "video[controls]",
    ];

    const allFocusable = Array.from(doc.querySelectorAll(focusableSelectors.join(", ")));

    const items: FocusableElement[] = allFocusable.map((el, i) => {
      const tag = el.tagName.toLowerCase();
      const type = el.getAttribute("type") || "";
      const text = (el.textContent || "").trim().slice(0, 40) || el.getAttribute("aria-label") || el.getAttribute("placeholder") || el.getAttribute("title") || "";
      const tabIndexAttr = el.getAttribute("tabindex");
      const tabIndex = tabIndexAttr !== null ? parseInt(tabIndexAttr) : null;
      const elIssues: string[] = [];

      if (tabIndex !== null && tabIndex > 0) {
        elIssues.push(`Positive tabindex (${tabIndex}) can disrupt natural focus order`);
      }

      return { tag, type, text, index: i, tabIndex, issues: elIssues };
    });

    const positiveTabindex = items.filter((el) => el.tabIndex !== null && el.tabIndex > 0);
    if (positiveTabindex.length > 0) {
      foundIssues.push({
        type: "error",
        message: `${positiveTabindex.length} element(s) use positive tabindex values. This forces a specific tab order that often conflicts with the DOM order and is error-prone.`,
        wcag: "2.4.3",
      });
    }

    const tabOrder = items
      .filter((el) => el.tabIndex !== null && el.tabIndex >= 0)
      .sort((a, b) => (a.tabIndex || 0) - (b.tabIndex || 0));

    if (tabOrder.length > 0) {
      const domIndices = items.filter((el) => el.tabIndex !== null && el.tabIndex >= 0).map((el) => el.index);
      const sortedIndices = [...domIndices].sort((a, b) => a - b);
      const isDifferent = domIndices.some((val, i) => val !== sortedIndices[i]);
      if (isDifferent) {
        foundIssues.push({
          type: "warning",
          message: "Tab order differs from DOM order due to tabindex values. This can confuse keyboard users.",
          wcag: "2.4.3",
        });
      }
    }

    if (items.length === 0) {
      foundIssues.push({
        type: "info",
        message: "No focusable elements found in the provided HTML.",
      });
    } else if (foundIssues.length === 0) {
      foundIssues.push({
        type: "info",
        message: "Focus order follows the natural DOM order. No issues found.",
      });
    }

    return { elements: items, issues: foundIssues };
  }, [html]);

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warningCount = issues.filter((i) => i.type === "warning").length;

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="focus-html-input" className="block text-sm font-semibold text-slate-700 mb-2">
          Paste your HTML
        </label>
        <textarea
          id="focus-html-input"
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
              <p className="text-3xl font-bold text-slate-900">{elements.length}</p>
              <p className="text-sm text-slate-600">Focusable</p>
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

          {elements.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Focus Order (Tab Sequence)</h3>
              <ol className="space-y-2">
                {elements.map((el, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-300 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-mono text-slate-700">
                        &lt;{el.tag}{el.type && ` type="${el.type}"`}&gt;
                      </span>
                      {el.text && (
                        <span className="ml-2 text-sm text-slate-600">"{el.text}"</span>
                      )}
                      {el.tabIndex !== null && (
                        <span className={`ml-2 rounded px-1.5 py-0.5 text-xs font-medium ${
                          el.tabIndex > 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          tabindex={el.tabIndex}
                        </span>
                      )}
                    </div>
                    {el.issues.length > 0 && (
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" aria-hidden="true" />
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Issues Found</h3>
            <ul className="space-y-3">
              {issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-3">
                  {issue.type === "error" && (
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  {issue.type === "warning" && (
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  {issue.type === "info" && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div>
                    <p className={`text-sm ${issue.type === "error" ? "text-red-700" : issue.type === "warning" ? "text-amber-700" : "text-green-700"}`}>
                      {issue.message}
                    </p>
                    {issue.wcag && (
                      <p className="text-xs text-slate-500 mt-0.5">WCAG {issue.wcag}</p>
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
