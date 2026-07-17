"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle, Info, Download } from "lucide-react";
import { exportAsJSON, exportAsMarkdown, exportAsHTML } from "@/lib/export-utils";

interface ScanIssue {
  type: "error" | "warning" | "info" | "pass";
  message: string;
  wcag?: string;
}

const sampleHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Sample Page</title>
</head>
<body>
  <a href="#main">Skip to content</a>
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
  </header>
  <main id="main">
    <h1>Welcome</h1>
    <img src="/banner.jpg" />
    <p>Click <a href="/more">here</a> to learn more.</p>
    <button></button>
    <input type="text" placeholder="Search" />
    <div onclick="doSomething()">Click me</div>
  </main>
  <footer>
    <p>&copy; 2025</p>
  </footer>
</body>
</html>`;

export function HtmlScanner() {
  const [html, setHtml] = useState("");

  const { issues, stats } = useMemo(() => {
    if (!html.trim()) return { issues: [] as ScanIssue[], stats: { errors: 0, warnings: 0, passes: 0 } };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const foundIssues: ScanIssue[] = [];

    // Check html lang
    const htmlEl = doc.documentElement;
    const lang = htmlEl.getAttribute("lang");
    if (!lang) {
      foundIssues.push({ type: "error", message: "Missing lang attribute on <html>. Screen readers need this to determine pronunciation.", wcag: "3.1.1" });
    } else {
      foundIssues.push({ type: "pass", message: `Language specified: lang="${lang}".` });
    }

    // Check title
    const title = doc.querySelector("title");
    if (!title || !title.textContent?.trim()) {
      foundIssues.push({ type: "error", message: "Missing or empty <title> element.", wcag: "2.4.2" });
    } else {
      foundIssues.push({ type: "pass", message: `Page title: "${title.textContent.trim()}".` });
    }

    // Check skip link
    const firstLink = doc.querySelector("a");
    const hasSkipLink = firstLink && firstLink.getAttribute("href")?.startsWith("#");
    if (hasSkipLink) {
      foundIssues.push({ type: "pass", message: "Skip link detected." });
    } else {
      foundIssues.push({ type: "warning", message: "No skip link found. Add a 'Skip to content' link as the first focusable element.", wcag: "2.4.1" });
    }

    // Check landmarks
    const landmarks = doc.querySelectorAll("main, [role='main'], nav, [role='navigation'], header, [role='banner'], footer, [role='contentinfo'], aside, [role='complementary']");
    if (landmarks.length === 0) {
      foundIssues.push({ type: "warning", message: "No landmark elements found. Use <header>, <nav>, <main>, <footer>, <aside> for page structure.", wcag: "1.3.1" });
    } else {
      foundIssues.push({ type: "pass", message: `${landmarks.length} landmark element(s) found.` });
    }

    // Check main
    const mainEl = doc.querySelector("main, [role='main']");
    if (!mainEl) {
      foundIssues.push({ type: "error", message: "No <main> element or role='main' found.", wcag: "1.3.1" });
    }

    // Check headings
    const headings = Array.from(doc.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    if (headings.length === 0) {
      foundIssues.push({ type: "warning", message: "No heading elements found.", wcag: "1.3.1" });
    } else {
      const h1s = headings.filter((h) => h.tagName === "H1");
      if (h1s.length === 0) {
        foundIssues.push({ type: "error", message: "No H1 found.", wcag: "1.3.1" });
      } else if (h1s.length > 1) {
        foundIssues.push({ type: "warning", message: `Multiple H1s found (${h1s.length}). Best practice: one H1 per page.`, wcag: "1.3.1" });
      } else {
        foundIssues.push({ type: "pass", message: "Exactly one H1 found." });
      }
      for (let i = 1; i < headings.length; i++) {
        const prev = parseInt(headings[i - 1].tagName[1]);
        const curr = parseInt(headings[i].tagName[1]);
        if (curr > prev + 1) {
          foundIssues.push({ type: "error", message: `Skipped heading level: H${prev} to H${curr}.`, wcag: "1.3.1" });
        }
      }
    }

    // Check images
    const images = Array.from(doc.querySelectorAll("img"));
    const imgsWithoutAlt = images.filter((img) => img.getAttribute("alt") === null);
    if (images.length > 0) {
      if (imgsWithoutAlt.length > 0) {
        foundIssues.push({ type: "error", message: `${imgsWithoutAlt.length} image(s) missing alt attribute.`, wcag: "1.1.1" });
      } else {
        foundIssues.push({ type: "pass", message: `All ${images.length} image(s) have alt attributes.` });
      }
    }

    // Check form labels
    const inputs = Array.from(doc.querySelectorAll("input, select, textarea")).filter((el) => {
      const type = el.getAttribute("type") || "text";
      return !["hidden", "submit", "button", "reset"].includes(type);
    });
    const labels = Array.from(doc.querySelectorAll("label"));
    let unlabeledCount = 0;
    inputs.forEach((input) => {
      const id = input.getAttribute("id");
      const ariaLabel = input.getAttribute("aria-label");
      const ariaLabelledBy = input.getAttribute("aria-labelledby");
      let hasLabel = false;
      if (id && labels.some((l) => l.getAttribute("for") === id)) hasLabel = true;
      if (!hasLabel) {
        let parent = input.parentElement;
        while (parent) {
          if (parent.tagName === "LABEL") { hasLabel = true; break; }
          parent = parent.parentElement;
        }
      }
      if (!hasLabel && (ariaLabel || ariaLabelledBy)) hasLabel = true;
      if (!hasLabel) unlabeledCount++;
    });
    if (inputs.length > 0) {
      if (unlabeledCount > 0) {
        foundIssues.push({ type: "error", message: `${unlabeledCount} form control(s) without accessible label.`, wcag: "1.3.1 / 3.3.2 / 4.1.2" });
      } else {
        foundIssues.push({ type: "pass", message: `All ${inputs.length} form control(s) have labels.` });
      }
    }

    // Check buttons
    const buttons = Array.from(doc.querySelectorAll("button"));
    const emptyButtons = buttons.filter((b) => !b.textContent?.trim() && !b.getAttribute("aria-label") && !b.getAttribute("aria-labelledby"));
    if (buttons.length > 0 && emptyButtons.length > 0) {
      foundIssues.push({ type: "error", message: `${emptyButtons.length} button(s) without accessible name.`, wcag: "4.1.2" });
    }

    // Check links
    const links = Array.from(doc.querySelectorAll("a[href]"));
    const badTexts = ["click here", "here", "read more", "more", "learn more", "continue"];
    const badLinks = links.filter((l) => {
      const text = (l.textContent || "").trim().toLowerCase();
      return badTexts.includes(text);
    });
    const emptyLinks = links.filter((l) => !l.textContent?.trim() && !l.getAttribute("aria-label"));
    if (badLinks.length > 0) {
      foundIssues.push({ type: "warning", message: `${badLinks.length} link(s) with non-descriptive text (e.g., "click here").`, wcag: "2.4.4" });
    }
    if (emptyLinks.length > 0) {
      foundIssues.push({ type: "error", message: `${emptyLinks.length} link(s) with no text content.`, wcag: "2.4.4" });
    }

    // Check inline event handlers (onclick on non-interactive elements)
    const interactiveElements = Array.from(doc.querySelectorAll("[onclick], [onkeydown], [onkeypress], [onmousedown], [onmouseup], [ontouchstart]"));
    const nonInteractiveWithEvents = interactiveElements.filter((el) => {
      const tag = el.tagName.toLowerCase();
      return !["a", "button", "input", "select", "textarea", "summary"].includes(tag) &&
             !el.hasAttribute("tabindex") && !el.hasAttribute("role");
    });
    if (nonInteractiveWithEvents.length > 0) {
      foundIssues.push({ type: "warning", message: `${nonInteractiveWithEvents.length} element(s) with event handlers (onclick, etc.) that are not keyboard accessible. Add role and tabindex, or use a <button>.`, wcag: "2.1.1" });
    }

    // Check ARIA roles
    const ariaRoles = Array.from(doc.querySelectorAll("[role]"));
    const validRoles = ["alert", "alertdialog", "application", "article", "banner", "button", "cell", "checkbox", "columnheader", "combobox", "complementary", "contentinfo", "dialog", "directory", "document", "feed", "figure", "form", "grid", "gridcell", "group", "heading", "img", "link", "list", "listbox", "listitem", "log", "main", "marquee", "math", "menu", "menubar", "menuitem", "menuitemcheckbox", "menuitemradio", "navigation", "none", "note", "option", "presentation", "progressbar", "radio", "radiogroup", "region", "row", "rowgroup", "rowheader", "scrollbar", "search", "searchbox", "separator", "slider", "spinbutton", "status", "switch", "tab", "table", "tablist", "tabpanel", "term", "textbox", "timer", "toolbar", "tooltip", "tree", "treegrid", "treeitem"];
    const invalidRoles = ariaRoles.filter((el) => !validRoles.includes(el.getAttribute("role") || ""));
    if (invalidRoles.length > 0) {
      foundIssues.push({ type: "warning", message: `${invalidRoles.length} element(s) with invalid ARIA role(s): ${invalidRoles.map((el) => `"${el.getAttribute("role")}"`).join(", ")}.`, wcag: "4.1.2" });
    }

    // Check for duplicate IDs
    const allIds = Array.from(doc.querySelectorAll("[id]"));
    const idMap = new Map<string, number>();
    allIds.forEach((el) => {
      const id = el.getAttribute("id") || "";
      idMap.set(id, (idMap.get(id) || 0) + 1);
    });
    const duplicateIds = Array.from(idMap.entries()).filter(([_, count]) => count > 1);
    if (duplicateIds.length > 0) {
      foundIssues.push({ type: "error", message: `Duplicate IDs found: ${duplicateIds.map(([id, count]) => `"${id}" (${count}x)`).join(", ")}.`, wcag: "4.1.1" });
    }

    // Check table headers
    const tables = Array.from(doc.querySelectorAll("table"));
    const tablesWithoutHeaders = tables.filter((t) => t.querySelectorAll("th").length === 0);
    if (tablesWithoutHeaders.length > 0) {
      foundIssues.push({ type: "warning", message: `${tablesWithoutHeaders.length} table(s) without header cells (<th>).`, wcag: "1.3.1" });
    }

    // Check iframe titles
    const iframes = Array.from(doc.querySelectorAll("iframe"));
    const iframesWithoutTitle = iframes.filter((f) => !f.getAttribute("title"));
    if (iframesWithoutTitle.length > 0) {
      foundIssues.push({ type: "error", message: `${iframesWithoutTitle.length} iframe(s) without title attribute.`, wcag: "2.4.1 / 4.1.2" });
    }

    if (foundIssues.filter((i) => i.type !== "pass" && i.type !== "info").length === 0) {
      foundIssues.push({ type: "info", message: "No accessibility issues found in the scanned HTML." });
    }

    return {
      issues: foundIssues,
      stats: {
        errors: foundIssues.filter((i) => i.type === "error").length,
        warnings: foundIssues.filter((i) => i.type === "warning").length,
        passes: foundIssues.filter((i) => i.type === "pass").length,
      },
    };
  }, [html]);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="scanner-html-input" className="block text-sm font-semibold text-slate-700 mb-2">
          Paste your HTML
        </label>
        <textarea
          id="scanner-html-input"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-4 font-mono text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          rows={10}
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
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{stats.errors}</p>
              <p className="text-sm text-red-600">Errors</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-700">{stats.warnings}</p>
              <p className="text-sm text-amber-600">Warnings</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{stats.passes}</p>
              <p className="text-sm text-green-600">Passed</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Scan Results</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => exportAsJSON(issues, "html-scanner")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" /> JSON
                </button>
                <button
                  type="button"
                  onClick={() => exportAsMarkdown(issues, "html-scanner")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" /> MD
                </button>
                <button
                  type="button"
                  onClick={() => exportAsHTML(issues, "html-scanner")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" /> HTML
                </button>
              </div>
            </div>
            <ul className="space-y-3">
              {issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-3">
                  {issue.type === "error" && (
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  {issue.type === "warning" && (
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  {issue.type === "pass" && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  {issue.type === "info" && (
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div>
                    <p className={`text-sm ${
                      issue.type === "error" ? "text-red-700" :
                      issue.type === "warning" ? "text-amber-700" :
                      issue.type === "pass" ? "text-green-700" : "text-blue-700"
                    }`}>
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
