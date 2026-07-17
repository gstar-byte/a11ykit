"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle, Info, ChevronRight } from "lucide-react";

interface HeadingItem {
  level: number;
  text: string;
  index: number;
}

interface HeadingIssue {
  type: "error" | "warning" | "info";
  message: string;
  wcag?: string;
}

const sampleHTML = `<h1>Website Title</h1>
<h2>About Us</h2>
<h3>Our Mission</h3>
<h3>Our Team</h3>
<h2>Services</h2>
<h4>Web Design</h4>
<h3>Development</h3>
<h2>Contact</h2>`;

export function HeadingAnalyzer() {
  const [html, setHtml] = useState("");

  const { headings, issues } = useMemo(() => {
    if (!html.trim()) return { headings: [] as HeadingItem[], issues: [] as HeadingIssue[] };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const headingElements = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const items: HeadingItem[] = [];
    const foundIssues: HeadingIssue[] = [];

    headingElements.forEach((el, i) => {
      const level = parseInt(el.tagName[1]);
      items.push({
        level,
        text: el.textContent?.trim() || "(empty)",
        index: i,
      });
    });

    if (items.length === 0) {
      foundIssues.push({
        type: "error",
        message: "No headings found in the provided HTML.",
        wcag: "1.3.1",
      });
      return { headings: items, issues: foundIssues };
    }

    const h1Count = items.filter((h) => h.level === 1).length;
    if (h1Count === 0) {
      foundIssues.push({
        type: "error",
        message: "No H1 found. Every page should have exactly one H1.",
        wcag: "1.3.1",
      });
    } else if (h1Count > 1) {
      foundIssues.push({
        type: "warning",
        message: `Multiple H1s found (${h1Count}). Best practice is exactly one H1 per page.`,
        wcag: "1.3.1",
      });
    }

    if (items[0].level !== 1) {
      foundIssues.push({
        type: "warning",
        message: `First heading is H${items[0].level}, not H1. The page should start with an H1.`,
        wcag: "1.3.1",
      });
    }

    for (let i = 1; i < items.length; i++) {
      const prev = items[i - 1];
      const curr = items[i];
      if (curr.level > prev.level + 1) {
        foundIssues.push({
          type: "error",
          message: `Skipped heading level: H${prev.level} → H${curr.level} ("${curr.text}"). Headings should not skip levels.`,
          wcag: "1.3.1",
        });
      }
    }

    items.forEach((h) => {
      if (h.text === "(empty)") {
        foundIssues.push({
          type: "error",
          message: `H${h.level} at position ${h.index + 1} is empty.`,
          wcag: "1.3.1",
        });
      }
    });

    if (foundIssues.length === 0) {
      foundIssues.push({
        type: "info",
        message: "Heading structure looks good! No issues found.",
      });
    }

    return { headings: items, issues: foundIssues };
  }, [html]);

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warningCount = issues.filter((i) => i.type === "warning").length;

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="heading-html-input" className="block text-sm font-semibold text-slate-700 mb-2">
          Paste your HTML
        </label>
        <textarea
          id="heading-html-input"
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
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-3xl font-bold text-slate-900">{headings.length}</p>
              <p className="text-sm text-slate-600">Headings</p>
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

          {/* Heading Tree */}
          {headings.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Heading Outline</h3>
              <ul className="space-y-1">
                {headings.map((h) => (
                  <li
                    key={h.index}
                    className="flex items-center gap-2 text-sm"
                    style={{ paddingLeft: `${(h.level - 1) * 1.5}rem` }}
                  >
                    <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
                    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold text-white"
                      style={{
                        backgroundColor: h.level === 1 ? "#0f766e" : h.level === 2 ? "#0891b2" : h.level === 3 ? "#0284c7" : "#6366f1"
                      }}
                    >
                      H{h.level}
                    </span>
                    <span className="text-slate-700">{h.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Issues */}
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
