"use client";

import { useState, useCallback, useRef } from "react";
import { Globe, AlertTriangle, CheckCircle, Info, Download, Loader2, LinkIcon, FileQuestion, ChevronRight } from "lucide-react";
import { exportAsJSON, exportAsMarkdown, exportAsHTML } from "@/lib/export-utils";

interface ScanIssue {
  type: "error" | "warning" | "info" | "pass";
  message: string;
  wcag?: string;
}

const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
];

const EAA_QUESTIONS = [
  "Is your organization based in or operating within the European Union?",
  "Do you provide products or services to consumers (B2C)?",
  "Do you operate an e-commerce website or online store?",
  "Do you provide digital banking, e-books, or passenger transport services?",
  "Do you have more than 10 employees and/or annual revenue above €2 million?",
  "Are your digital products (websites, apps, ATMs, ticketing machines) used by consumers?",
  "Was your product or service first placed on the market after 28 June 2025?",
];

export function UrlScanner() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [issues, setIssues] = useState<ScanIssue[]>([]);
  const [scanned, setScanned] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [error, setError] = useState("");
  const [showEaaCheck, setShowEaaCheck] = useState(false);
  const [eaaAnswers, setEaaAnswers] = useState<Record<number, boolean>>({});
  const [eaaResult, setEaaResult] = useState<null | { applies: boolean; summary: string }>(null);
  const pageTitleRef = useRef("");

  const scanHtml = useCallback((html: string, sourceUrl: string): ScanIssue[] => {
    const found: ScanIssue[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    setPageTitle(doc.title || "(no title)");
    pageTitleRef.current = doc.title || "(no title)";

    const root = doc.documentElement;
    if (!root.getAttribute("lang")) {
      found.push({ type: "error", message: "Missing lang attribute on <html> element.", wcag: "3.1.1" });
    } else {
      found.push({ type: "pass", message: `Language declared: ${root.getAttribute("lang")}.`, wcag: "3.1.1" });
    }

    if (!doc.title) {
      found.push({ type: "error", message: "Missing <title> element.", wcag: "2.4.2" });
    } else {
      found.push({ type: "pass", message: `Page title: "${doc.title}".`, wcag: "2.4.2" });
    }

    const skipLink = doc.querySelector('a[href^="#"][class*="skip"], a[href^="#"][id*="skip"], a[href="#main"], a[href="#content"]');
    if (skipLink) {
      found.push({ type: "pass", message: "Skip navigation link found.", wcag: "2.4.1" });
    } else {
      found.push({ type: "warning", message: "No skip navigation link detected.", wcag: "2.4.1" });
    }

    const landmarks = {
      header: !!doc.querySelector("header, [role='banner']"),
      nav: !!doc.querySelector("nav, [role='navigation']"),
      main: !!doc.querySelector("main, [role='main']"),
      footer: !!doc.querySelector("footer, [role='contentinfo']"),
    };
    const missingLandmarks = Object.entries(landmarks).filter(([_, v]) => !v).map(([k]) => k);
    if (missingLandmarks.length > 0) {
      found.push({ type: "warning", message: `Missing landmark(s): ${missingLandmarks.join(", ")}.`, wcag: "1.3.1" });
    } else {
      found.push({ type: "pass", message: "All key landmark regions present (header, nav, main, footer).", wcag: "1.3.1" });
    }

    const headings = Array.from(doc.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    const h1s = headings.filter((h) => h.tagName === "H1");
    if (h1s.length === 0) {
      found.push({ type: "error", message: "No H1 heading found.", wcag: "1.3.1" });
    } else if (h1s.length > 1) {
      found.push({ type: "warning", message: `${h1s.length} H1 headings found — should be exactly one.`, wcag: "1.3.1" });
    } else {
      found.push({ type: "pass", message: "Exactly one H1 heading present.", wcag: "1.3.1" });
    }

    let prevLevel = 0;
    for (const h of headings) {
      const level = parseInt(h.tagName[1]);
      if (prevLevel > 0 && level > prevLevel + 1) {
        found.push({ type: "warning", message: `Heading level skipped: H${prevLevel} to H${level} — "${h.textContent?.trim().slice(0, 50)}".`, wcag: "1.3.1" });
      }
      prevLevel = level;
    }

    const images = Array.from(doc.querySelectorAll("img"));
    const missingAlt = images.filter((img) => !img.hasAttribute("alt"));
    const emptyAlt = images.filter((img) => img.hasAttribute("alt") && img.getAttribute("alt") === "");
    if (images.length > 0) {
      if (missingAlt.length > 0) {
        found.push({ type: "error", message: `${missingAlt.length} of ${images.length} image(s) missing alt attribute.`, wcag: "1.1.1" });
      } else {
        found.push({ type: "pass", message: `All ${images.length} image(s) have alt attributes (${emptyAlt.length} decorative/empty).`, wcag: "1.1.1" });
      }
    }

    const inputs = Array.from(doc.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset']), select, textarea"));
    const unlabeled = inputs.filter((input) => {
      const id = input.getAttribute("id");
      const ariaLabel = input.getAttribute("aria-label");
      const ariaLabelledby = input.getAttribute("aria-labelledby");
      const title = input.getAttribute("title");
      const wrappedLabel = input.closest("label");
      const associatedLabel = id ? doc.querySelector(`label[for="${id}"]`) : null;
      return !ariaLabel && !ariaLabelledby && !title && !wrappedLabel && !associatedLabel;
    });
    if (inputs.length > 0) {
      if (unlabeled.length > 0) {
        found.push({ type: "error", message: `${unlabeled.length} of ${inputs.length} form field(s) missing labels.`, wcag: "3.3.2" });
      } else {
        found.push({ type: "pass", message: `All ${inputs.length} form field(s) have labels.`, wcag: "3.3.2" });
      }
    }

    const links = Array.from(doc.querySelectorAll("a[href]"));
    const badLinkTexts = ["click here", "read more", "learn more", "more", "here", "link", "continue", "go", "this page", "this link"];
    const badLinks = links.filter((a) => {
      const text = a.textContent?.trim().toLowerCase() || "";
      return badLinkTexts.includes(text) || text === "";
    });
    if (links.length > 0) {
      if (badLinks.length > 0) {
        found.push({ type: "warning", message: `${badLinks.length} of ${links.length} link(s) have non-descriptive or empty text.`, wcag: "2.4.4" });
      } else {
        found.push({ type: "pass", message: `All ${links.length} link(s) have descriptive text.`, wcag: "2.4.4" });
      }
    }

    const buttons = Array.from(doc.querySelectorAll("button"));
    const emptyButtons = buttons.filter((b) => !b.textContent?.trim() && !b.getAttribute("aria-label") && !b.getAttribute("aria-labelledby"));
    if (buttons.length > 0 && emptyButtons.length > 0) {
      found.push({ type: "error", message: `${emptyButtons.length} of ${buttons.length} button(s) have no accessible name.`, wcag: "4.1.2" });
    }

    const iframes = Array.from(doc.querySelectorAll("iframe"));
    const unlabeledIframes = iframes.filter((f) => !f.getAttribute("title") && !f.getAttribute("aria-label"));
    if (iframes.length > 0 && unlabeledIframes.length > 0) {
      found.push({ type: "warning", message: `${unlabeledIframes.length} of ${iframes.length} iframe(s) missing title attribute.`, wcag: "2.4.1" });
    }

    const positiveTabindex = Array.from(doc.querySelectorAll("[tabindex]")).filter((el) => {
      const v = el.getAttribute("tabindex");
      return v && parseInt(v) > 0;
    });
    if (positiveTabindex.length > 0) {
      found.push({ type: "warning", message: `${positiveTabindex.length} element(s) with positive tabindex found — can disrupt natural tab order.`, wcag: "2.4.3" });
    }

    const onclickDivs = Array.from(doc.querySelectorAll("div[onclick], span[onclick]"));
    if (onclickDivs.length > 0) {
      found.push({ type: "warning", message: `${onclickDivs.length} non-interactive element(s) with onclick — may not be keyboard accessible.`, wcag: "2.1.1" });
    }

    const viewport = doc.querySelector('meta[name="viewport"]');
    if (!viewport) {
      found.push({ type: "warning", message: "Missing viewport meta tag — may cause mobile accessibility issues.", wcag: "1.4.4" });
    }

    const tables = Array.from(doc.querySelectorAll("table"));
    if (tables.length > 0) {
      const tablesWithoutTh = tables.filter((t) => !t.querySelector("th"));
      if (tablesWithoutTh.length > 0) {
        found.push({ type: "warning", message: `${tablesWithoutTh.length} of ${tables.length} table(s) missing header cells (<th>).`, wcag: "1.3.1" });
      } else {
        found.push({ type: "pass", message: `All ${tables.length} table(s) have header cells.`, wcag: "1.3.1" });
      }
    }

    const ariaHiddenFocusable = Array.from(doc.querySelectorAll('[aria-hidden="true"]')).filter((el) => {
      return el.querySelector("a, button, input, select, textarea, [tabindex]") || el.matches("a, button, input, select, textarea, [tabindex]");
    });
    if (ariaHiddenFocusable.length > 0) {
      found.push({ type: "error", message: `${ariaHiddenFocusable.length} focusable element(s) inside aria-hidden="true" — keyboard users can reach them but screen readers skip them.`, wcag: "1.3.1" });
    }

    const formFields = Array.from(doc.querySelectorAll("input:not([type='hidden'])"));
    const withoutAutocomplete = formFields.filter((f) => {
      const type = f.getAttribute("type") || "text";
      return ["text", "email", "tel", "url", "password"].includes(type) && !f.getAttribute("autocomplete");
    });
    if (withoutAutocomplete.length > 3) {
      found.push({ type: "info", message: `${withoutAutocomplete.length} form field(s) without autocomplete attribute — consider adding for better UX.`, wcag: "3.3.2" });
    }

    const duplicateIds = (() => {
      const allIds = Array.from(doc.querySelectorAll("[id]")).map((el) => el.getAttribute("id"));
      const seen = new Set<string>();
      const dupes = new Set<string>();
      for (const id of allIds) {
        if (!id) continue;
        if (seen.has(id)) dupes.add(id);
        seen.add(id);
      }
      return Array.from(dupes);
    })();
    if (duplicateIds.length > 0) {
      found.push({ type: "error", message: `${duplicateIds.length} duplicate ID(s) found: ${duplicateIds.slice(0, 3).join(", ")}${duplicateIds.length > 3 ? "..." : ""} — IDs must be unique.`, wcag: "4.1.1" });
    }

    const langAttrs = Array.from(doc.querySelectorAll("[lang]"));
    const invalidLang = langAttrs.filter((el) => !/^[a-z]{2}(-[A-Z]{2})?$/.test(el.getAttribute("lang") || ""));
    if (invalidLang.length > 0) {
      found.push({ type: "warning", message: `${invalidLang.length} element(s) with invalid lang attribute value.`, wcag: "3.1.2" });
    }

    found.push({ type: "info", message: `Scan of ${sourceUrl} complete. ${found.filter((f) => f.type === "error").length} error(s), ${found.filter((f) => f.type === "warning").length} warning(s).` });

    return found;
  }, []);

  const handleScan = useCallback(async () => {
    if (!url.trim()) return;
    setError("");
    setScanning(true);
    setScanned(false);
    setIssues([]);

    let scanUrl = url.trim();
    if (!scanUrl.startsWith("http://") && !scanUrl.startsWith("https://")) {
      scanUrl = "https://" + scanUrl;
    }

    setPageUrl(scanUrl);

    try {
      let html = "";
      let success = false;

      for (let i = 0; i < CORS_PROXIES.length; i++) {
        try {
          const proxyUrl = CORS_PROXIES[i](scanUrl);
          const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
          if (res.ok) {
            html = await res.text();
            if (html && html.length > 100) {
              success = true;
              break;
            }
          }
        } catch {
          continue;
        }
      }

      if (!success) {
        setError("Failed to fetch the page. The site may block cross-origin requests. Try pasting the HTML into the HTML Scanner instead.");
        setScanning(false);
        return;
      }

      const results = scanHtml(html, scanUrl);
      setIssues(results);
      setScanned(true);

      try {
        const existing = JSON.parse(localStorage.getItem("a11ykit-scan-results") || "[]");
        existing.unshift({ url: scanUrl, title: pageTitleRef.current || scanUrl, issues: results, date: new Date().toISOString() });
        if (existing.length > 10) existing.length = 10;
        localStorage.setItem("a11ykit-scan-results", JSON.stringify(existing));
      } catch {
        // localStorage may be unavailable
      }
    } catch {
      setError("An error occurred while scanning. Please check the URL and try again.");
    }
    setScanning(false);
  }, [url, scanHtml]);

  const stats = {
    errors: issues.filter((i) => i.type === "error").length,
    warnings: issues.filter((i) => i.type === "warning").length,
    passes: issues.filter((i) => i.type === "pass").length,
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label htmlFor="url-input" className="block text-sm font-semibold text-slate-900 mb-2">
          Website URL
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="https://example.com"
            />
          </div>
          <button
            type="button"
            onClick={handleScan}
            disabled={scanning || !url.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
          >
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Scanning...
              </>
            ) : (
              <>
                <Globe className="h-4 w-4" aria-hidden="true" /> Scan
              </>
            )}
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Enter any public URL. The page HTML is fetched via a CORS proxy and scanned entirely in your browser — no data is stored.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* EAA Quick Check */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <button type="button" onClick={() => setShowEaaCheck(!showEaaCheck)} className="flex w-full items-center justify-between text-left">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FileQuestion className="h-4 w-4 text-teal-700" aria-hidden="true" />
            EAA Compliance Quick Check
          </span>
          <ChevronRight className={`h-4 w-4 text-slate-400 transition ${showEaaCheck ? "rotate-90" : ""}`} aria-hidden="true" />
        </button>
        {showEaaCheck && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-slate-600">Answer these 7 questions to determine if the European Accessibility Act (EAA) applies to your organization.</p>
            {EAA_QUESTIONS.map((q, i) => (
              <div key={i} className="rounded-lg bg-slate-50 p-3">
                <p className="text-sm font-medium text-slate-800">{i + 1}. {q}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => setEaaAnswers((prev) => ({ ...prev, [i]: true }))} className={`rounded-md px-3 py-1 text-xs font-medium ${eaaAnswers[i] === true ? "bg-teal-600 text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-100"}`}>Yes</button>
                  <button type="button" onClick={() => setEaaAnswers((prev) => ({ ...prev, [i]: false }))} className={`rounded-md px-3 py-1 text-xs font-medium ${eaaAnswers[i] === false ? "bg-teal-600 text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-100"}`}>No</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => {
              const answered = Object.keys(eaaAnswers).length;
              if (answered < 7) { setEaaResult(null); return; }
              const yesCount = Object.values(eaaAnswers).filter(Boolean).length;
              const applies = eaaAnswers[0] === true && (eaaAnswers[1] === true || eaaAnswers[2] === true || eaaAnswers[3] === true);
              setEaaResult({
                applies,
                summary: applies
                  ? `The EAA likely applies to your organization (${yesCount}/7 "Yes"). You should ensure your digital products meet WCAG 2.2 AA and publish an accessibility statement.`
                  : `The EAA may not apply (${yesCount}/7 "Yes"). However, check with legal counsel — this quick check is not legal advice.`,
              });
            }} className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500">
              Check EAA applicability
            </button>
            {eaaResult && (
              <div className={`rounded-lg p-4 text-sm ${eaaResult.applies ? "bg-amber-50 text-amber-800" : "bg-green-50 text-green-800"}`}>
                <p className="font-semibold">{eaaResult.applies ? "EAA likely applies" : "EAA may not apply"}</p>
                <p className="mt-1">{eaaResult.summary}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {scanned && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <LinkIcon className="h-4 w-4" aria-hidden="true" />
              <span>Scanned: <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-700 hover:underline">{pageUrl}</a></span>
              {pageTitle && <span className="text-slate-400">·</span>}
              {pageTitle && <span className="font-medium text-slate-700">"{pageTitle}"</span>}
            </div>
          </div>

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
                <button type="button" onClick={() => exportAsJSON(issues, "url-scanner", { url: pageUrl, title: pageTitle })} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"><Download className="h-3.5 w-3.5" aria-hidden="true" /> JSON</button>
                <button type="button" onClick={() => exportAsMarkdown(issues, "url-scanner", { url: pageUrl, title: pageTitle })} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"><Download className="h-3.5 w-3.5" aria-hidden="true" /> MD</button>
                <button type="button" onClick={() => exportAsHTML(issues, "url-scanner")} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"><Download className="h-3.5 w-3.5" aria-hidden="true" /> HTML</button>
              </div>
            </div>
            <ul className="space-y-3">
              {issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-3">
                  {issue.type === "error" && <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />}
                  {issue.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />}
                  {issue.type === "pass" && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />}
                  {issue.type === "info" && <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />}
                  <div>
                    <p className={`text-sm ${issue.type === "error" ? "text-red-700" : issue.type === "warning" ? "text-amber-700" : issue.type === "pass" ? "text-green-700" : "text-blue-700"}`}>
                      {issue.message}
                    </p>
                    {issue.wcag && (
                      <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                        WCAG {issue.wcag}
                      </span>
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
