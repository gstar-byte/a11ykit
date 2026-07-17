"use client";

import { useState, useCallback } from "react";
import { Globe, AlertTriangle, CheckCircle, Info, Download, Loader2, LinkIcon } from "lucide-react";
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

export function UrlScanner() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [issues, setIssues] = useState<ScanIssue[]>([]);
  const [scanned, setScanned] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [error, setError] = useState("");

  const scanHtml = useCallback((html: string, sourceUrl: string): ScanIssue[] => {
    const found: ScanIssue[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    setPageTitle(doc.title || "(no title)");

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
