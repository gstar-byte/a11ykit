"use client";

import { useState, useEffect, useCallback } from "react";
import { Globe, Trash2, TrendingUp, TrendingDown, Minus, History, AlertTriangle, CheckCircle } from "lucide-react";

interface ScanRecord {
  id: string;
  url: string;
  date: string;
  errors: number;
  warnings: number;
  passes: number;
  score: number;
}

const STORAGE_KEY = "a11ykit-monitor-history";

export function AccessibilityMonitor() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<ScanRecord[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const saveHistory = useCallback((records: ScanRecord[]) => {
    setHistory(records);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // ignore
    }
  }, []);

  const handleScan = useCallback(async () => {
    if (!url.trim()) return;
    setError("");
    setScanning(true);

    let scanUrl = url.trim();
    if (!scanUrl.startsWith("http://") && !scanUrl.startsWith("https://")) {
      scanUrl = "https://" + scanUrl;
    }

    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(scanUrl)}`;
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error("Fetch failed");
      const html = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      let errors = 0;
      let warnings = 0;
      let passes = 0;

      if (!doc.documentElement.getAttribute("lang")) errors++; else passes++;
      if (!doc.title) errors++; else passes++;
      if (!doc.querySelector("main, [role='main']")) warnings++; else passes++;
      if (!doc.querySelector("a[href='#main'], a[href='#content'], a[class*='skip']")) warnings++; else passes++;

      const h1s = doc.querySelectorAll("h1");
      if (h1s.length === 0) errors++; else if (h1s.length > 1) warnings++; else passes++;

      const imgs = Array.from(doc.querySelectorAll("img"));
      const missingAlt = imgs.filter((img) => !img.hasAttribute("alt"));
      if (imgs.length > 0) { if (missingAlt.length > 0) errors++; else passes++; }

      const inputs = Array.from(doc.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset']), select, textarea"));
      const unlabeled = inputs.filter((input) => {
        const id = input.getAttribute("id");
        return !input.getAttribute("aria-label") && !input.getAttribute("aria-labelledby") &&
          !input.getAttribute("title") && !input.closest("label") &&
          !(id && doc.querySelector(`label[for="${id}"]`));
      });
      if (inputs.length > 0) { if (unlabeled.length > 0) errors++; else passes++; }

      const links = Array.from(doc.querySelectorAll("a[href]"));
      const badLinks = links.filter((a) => {
        const text = a.textContent?.trim().toLowerCase() || "";
        return ["click here", "read more", "learn more", "more", "here", ""].includes(text);
      });
      if (links.length > 0) { if (badLinks.length > 0) warnings++; else passes++; }

      const total = errors + warnings + passes;
      const score = total > 0 ? Math.round((passes / total) * 100) : 0;

      const record: ScanRecord = {
        id: `${Date.now()}`,
        url: scanUrl,
        date: new Date().toISOString(),
        errors,
        warnings,
        passes,
        score,
      };

      const updated = [record, ...history].slice(0, 50);
      saveHistory(updated);
    } catch {
      setError("Failed to scan the URL. The site may block cross-origin requests.");
    }
    setScanning(false);
  }, [url, history, saveHistory]);

  const handleDelete = (id: string) => {
    saveHistory(history.filter((r) => r.id !== id));
  };

  const handleClear = () => {
    saveHistory([]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-700 bg-green-50";
    if (score >= 50) return "text-amber-700 bg-amber-50";
    return "text-red-700 bg-red-50";
  };

  const getTrend = (idx: number): "up" | "down" | "same" | null => {
    if (idx >= history.length - 1) return null;
    const current = history[idx];
    const prev = history[idx + 1];
    if (current.url !== prev.url) return null;
    if (current.score > prev.score) return "up";
    if (current.score < prev.score) return "down";
    return "same";
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label htmlFor="monitor-url" className="block text-sm font-semibold text-slate-900 mb-2">
          Website URL to monitor
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="monitor-url"
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
            {scanning ? "Scanning..." : "Scan & Save"}
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Each scan is saved to your browser's local storage. Scan the same URL over time to track your accessibility progress.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          {error}
        </div>
      )}

      {history.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <History className="h-4 w-4 text-teal-700" aria-hidden="true" />
              Scan History ({history.length})
            </h3>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Clear All
            </button>
          </div>

          <div className="space-y-3">
            {history.map((record, idx) => {
              const trend = getTrend(idx);
              return (
                <div key={record.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className={`flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-lg ${getScoreColor(record.score)}`}>
                    <span className="text-lg font-bold">{record.score}</span>
                    <span className="text-[10px] uppercase">score</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{record.url}</p>
                    <p className="text-xs text-slate-500">{new Date(record.date).toLocaleString()}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-red-600"><AlertTriangle className="h-3 w-3" aria-hidden="true" />{record.errors}</span>
                      <span className="flex items-center gap-1 text-amber-600"><AlertTriangle className="h-3 w-3" aria-hidden="true" />{record.warnings}</span>
                      <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-3 w-3" aria-hidden="true" />{record.passes}</span>
                    </div>
                  </div>
                  {trend && (
                    <div className="flex-shrink-0">
                      {trend === "up" && <TrendingUp className="h-5 w-5 text-green-600" aria-label="Score improved" />}
                      {trend === "down" && <TrendingDown className="h-5 w-5 text-red-600" aria-label="Score decreased" />}
                      {trend === "same" && <Minus className="h-5 w-5 text-slate-400" aria-label="No change" />}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(record.id)}
                    className="flex-shrink-0 rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                    aria-label="Delete this scan record"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {history.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center">
          <History className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
          <p className="mt-4 text-sm text-slate-500">No scans yet. Run your first scan above to start tracking.</p>
        </div>
      )}
    </div>
  );
}
