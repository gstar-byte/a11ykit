"use client";

import { useState, useMemo, useRef } from "react";
import { Plus, Trash2, Download, Copy, Check, Info } from "lucide-react";

/* ─── Color math ──────────────────────────────────────────────── */

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  return [r, g, b]
    .map((v) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    })
    .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);
}

function contrastRatio(fg: string, bg: string): number | null {
  const rgb1 = hexToRgb(fg);
  const rgb2 = hexToRgb(bg);
  if (!rgb1 || !rgb2) return null;
  const L1 = relativeLuminance(rgb1);
  const L2 = relativeLuminance(rgb2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

type WcagLevel = "AAA" | "AA" | "AA Large" | "FAIL";

function getLevel(ratio: number | null): WcagLevel {
  if (ratio === null) return "FAIL";
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "FAIL";
}

const LEVEL_STYLES: Record<WcagLevel, string> = {
  AAA: "bg-green-100 text-green-800",
  AA: "bg-blue-100 text-blue-700",
  "AA Large": "bg-amber-100 text-amber-700",
  FAIL: "bg-red-100 text-red-700",
};

/* ─── Types ───────────────────────────────────────────────────── */

interface ColorPair {
  id: string;
  label: string;
  fg: string;
  bg: string;
}

const DEFAULT_PAIRS: ColorPair[] = [
  { id: "1", label: "Body text", fg: "#1e293b", bg: "#ffffff" },
  { id: "2", label: "Primary button", fg: "#ffffff", bg: "#0f766e" },
  { id: "3", label: "Link on white", fg: "#0369a1", bg: "#ffffff" },
  { id: "4", label: "Placeholder text", fg: "#94a3b8", bg: "#ffffff" },
  { id: "5", label: "Error message", fg: "#dc2626", bg: "#ffffff" },
  { id: "6", label: "Warning on yellow", fg: "#78350f", bg: "#fef3c7" },
];

/* ─── CSV export ──────────────────────────────────────────────── */

function toCSV(pairs: ColorPair[]): string {
  const header = "Label,Foreground,Background,Contrast Ratio,WCAG Level";
  const rows = pairs.map((p) => {
    const ratio = contrastRatio(p.fg, p.bg);
    const level = getLevel(ratio);
    return `"${p.label}",${p.fg},${p.bg},${ratio ?? "invalid"},${level}`;
  });
  return [header, ...rows].join("\n");
}

/* ─── Component ───────────────────────────────────────────────── */

export function ContrastBatchTester() {
  const [pairs, setPairs] = useState<ColorPair[]>(DEFAULT_PAIRS);
  const [copied, setCopied] = useState(false);
  const nextId = useRef(DEFAULT_PAIRS.length + 1);

  const results = useMemo(
    () =>
      pairs.map((p) => {
        const ratio = contrastRatio(p.fg, p.bg);
        return { ...p, ratio, level: getLevel(ratio) };
      }),
    [pairs]
  );

  const passCount = results.filter((r) => r.level !== "FAIL").length;
  const aaCount = results.filter((r) => r.level === "AA" || r.level === "AAA").length;
  const aaaCount = results.filter((r) => r.level === "AAA").length;

  function addPair() {
    const id = String(nextId.current++);
    setPairs((prev) => [...prev, { id, label: "New pair", fg: "#000000", bg: "#ffffff" }]);
  }

  function removePair(id: string) {
    setPairs((prev) => prev.filter((p) => p.id !== id));
  }

  function updatePair<K extends keyof ColorPair>(id: string, key: K, value: ColorPair[K]) {
    setPairs((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
  }

  function downloadCSV() {
    const blob = new Blob([toCSV(pairs)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contrast-batch-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyCSV() {
    await navigator.clipboard.writeText(toCSV(pairs));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">WCAG 1.4.3 — Contrast (Minimum) &amp; 1.4.6 — Contrast (Enhanced)</p>
          <p className="mt-0.5">
            <strong>AA</strong>: ≥4.5:1 normal text, ≥3:1 large text (18pt+ or 14pt bold) &nbsp;·&nbsp;
            <strong>AAA</strong>: ≥7:1 normal text &nbsp;·&nbsp;
            <strong>AA Large</strong>: ≥3:1 (passes only for large text)
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total pairs", value: pairs.length, cls: "bg-slate-50 border-slate-200 text-slate-900" },
          { label: "Pass (any level)", value: passCount, cls: "bg-green-50 border-green-200 text-green-800" },
          { label: "Pass AA+", value: aaCount, cls: "bg-blue-50 border-blue-200 text-blue-800" },
          { label: "Pass AAA", value: aaaCount, cls: "bg-purple-50 border-purple-200 text-purple-800" },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`rounded-xl border p-4 text-center ${cls}`}>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addPair}
          className="inline-flex items-center gap-1.5 rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-600 transition-colors"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add pair
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyCSV}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy CSV"}
          </button>
          <button
            type="button"
            onClick={downloadCSV}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download CSV
          </button>
        </div>
      </div>

      {/* Pairs table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Label</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Foreground</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Background</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Preview</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Ratio</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Level</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  {/* Label */}
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={r.label}
                      onChange={(e) => updatePair(r.id, "label", e.target.value)}
                      className="w-32 rounded border border-slate-200 px-2 py-1 text-xs focus:border-teal-500 focus:outline-none"
                      aria-label="Color pair label"
                    />
                  </td>
                  {/* Foreground */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={r.fg}
                        onChange={(e) => updatePair(r.id, "fg", e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded border border-slate-200 p-0.5"
                        aria-label="Foreground color"
                      />
                      <input
                        type="text"
                        value={r.fg}
                        onChange={(e) => updatePair(r.id, "fg", e.target.value)}
                        className="w-20 rounded border border-slate-200 px-2 py-1 text-xs font-mono focus:border-teal-500 focus:outline-none"
                        aria-label="Foreground hex"
                      />
                    </div>
                  </td>
                  {/* Background */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={r.bg}
                        onChange={(e) => updatePair(r.id, "bg", e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded border border-slate-200 p-0.5"
                        aria-label="Background color"
                      />
                      <input
                        type="text"
                        value={r.bg}
                        onChange={(e) => updatePair(r.id, "bg", e.target.value)}
                        className="w-20 rounded border border-slate-200 px-2 py-1 text-xs font-mono focus:border-teal-500 focus:outline-none"
                        aria-label="Background hex"
                      />
                    </div>
                  </td>
                  {/* Preview */}
                  <td className="px-4 py-3">
                    <div
                      className="rounded px-3 py-1.5 text-xs font-medium whitespace-nowrap"
                      style={{ backgroundColor: r.bg, color: r.fg, border: `1px solid ${r.bg}` }}
                    >
                      Sample text Aa
                    </div>
                  </td>
                  {/* Ratio */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-semibold text-slate-800">
                      {r.ratio !== null ? `${r.ratio}:1` : "—"}
                    </span>
                  </td>
                  {/* Level */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-bold ${LEVEL_STYLES[r.level]}`}>
                      {r.level}
                    </span>
                  </td>
                  {/* Remove */}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => removePair(r.id)}
                      aria-label={`Remove ${r.label}`}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick guide */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Reference</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
          {[
            { level: "AAA", ratio: "≥7:1", desc: "Enhanced — normal text" },
            { level: "AA", ratio: "≥4.5:1", desc: "Minimum — normal text" },
            { level: "AA Large", ratio: "≥3:1", desc: "Large text (18pt+)" },
            { level: "FAIL", ratio: "<3:1", desc: "Does not pass any level" },
          ].map(({ level, ratio, desc }) => (
            <div key={level} className={`rounded-lg p-3 ${LEVEL_STYLES[level as WcagLevel]}`}>
              <p className="font-bold">{level}</p>
              <p className="font-mono">{ratio}</p>
              <p className="mt-0.5 opacity-80">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
