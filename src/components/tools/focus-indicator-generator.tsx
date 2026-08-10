"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Download, Info } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────── */

type OutlineStyle = "solid" | "dashed" | "dotted" | "double";
type FocusStyle = "outline" | "box-shadow" | "border" | "background" | "combined";

interface FocusConfig {
  style: FocusStyle;
  outlineColor: string;
  outlineWidth: number;
  outlineOffset: number;
  outlineStyle: OutlineStyle;
  shadowColor: string;
  shadowBlur: number;
  shadowSpread: number;
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  bgFocus: string;
  removeDefault: boolean;
}

/* ─── Defaults ────────────────────────────────────────────────  */

const DEFAULT_CONFIG: FocusConfig = {
  style: "outline",
  outlineColor: "#0f766e",
  outlineWidth: 3,
  outlineOffset: 2,
  outlineStyle: "solid",
  shadowColor: "#0f766e",
  shadowBlur: 0,
  shadowSpread: 3,
  bgColor: "#fef3c7",
  borderColor: "#0f766e",
  borderWidth: 2,
  borderRadius: 4,
  bgFocus: "#fef3c7",
  removeDefault: true,
};

/* ─── WCAG 2.4.11 / 2.4.13 checker ──────────────────────────── */

// WCAG 2.4.11: Focus Not Obscured (min: visible)
// WCAG 2.4.13: Focus Appearance — outline area ≥ CSS pixels * perimeter
// We check: outline width ≥ 2px AND contrasts with adjacent colors

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  return [
    parseInt(m[1].slice(0, 2), 16),
    parseInt(m[1].slice(2, 4), 16),
    parseInt(m[1].slice(4, 6), 16),
  ];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function contrastRatio(hex1: string, hex2: string): number | null {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return null;
  const L1 = relativeLuminance(rgb1);
  const L2 = relativeLuminance(rgb2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function wcagChecks(cfg: FocusConfig) {
  const checks: { label: string; pass: boolean; detail: string }[] = [];

  const outlineWidthOk = cfg.outlineWidth >= 2;
  checks.push({
    label: "WCAG 2.4.13 — Outline width ≥ 2px",
    pass: outlineWidthOk,
    detail: outlineWidthOk
      ? `${cfg.outlineWidth}px meets the minimum 2px requirement.`
      : `${cfg.outlineWidth}px is below the 2px minimum for WCAG 2.4.13.`,
  });

  const outlineOffsetOk = cfg.outlineOffset >= 0;
  checks.push({
    label: "WCAG 2.4.13 — Outline not clipped",
    pass: outlineOffsetOk,
    detail: outlineOffsetOk
      ? "Positive offset ensures the outline is not clipped by overflow."
      : "Negative offset may clip the focus indicator.",
  });

  // Contrast check: outline color vs background (approximate with white)
  const contrast = contrastRatio(cfg.outlineColor, "#ffffff");
  const contrastOk = contrast !== null && contrast >= 3;
  checks.push({
    label: "WCAG 2.4.13 — Focus indicator contrast ≥ 3:1",
    pass: contrastOk,
    detail: contrast !== null
      ? `Contrast with white background: ${contrast.toFixed(2)}:1 (minimum: 3:1).`
      : "Could not calculate contrast ratio.",
  });

  return checks;
}

/* ─── CSS generator ───────────────────────────────────────────  */

function generateCSS(cfg: FocusConfig, selector: string = "*:focus-visible"): string {
  const lines: string[] = [];

  if (cfg.removeDefault) {
    lines.push(`/* Remove browser default */`);
    lines.push(`${selector} {`);
    lines.push(`  outline: none;`);
    lines.push(`}`);
    lines.push(``);
  }

  lines.push(`${selector} {`);

  switch (cfg.style) {
    case "outline":
      lines.push(`  outline: ${cfg.outlineWidth}px ${cfg.outlineStyle} ${cfg.outlineColor};`);
      lines.push(`  outline-offset: ${cfg.outlineOffset}px;`);
      break;
    case "box-shadow":
      lines.push(`  box-shadow: 0 0 0 ${cfg.shadowSpread}px ${cfg.shadowColor};`);
      if (cfg.shadowBlur > 0) {
        lines.push(`  /* With blur: 0 0 ${cfg.shadowBlur}px ${cfg.shadowSpread}px ${cfg.shadowColor}; */`);
      }
      break;
    case "border":
      lines.push(`  border: ${cfg.borderWidth}px ${cfg.outlineStyle} ${cfg.borderColor};`);
      lines.push(`  border-radius: ${cfg.borderRadius}px;`);
      break;
    case "background":
      lines.push(`  background-color: ${cfg.bgColor};`);
      lines.push(`  outline: 2px solid ${cfg.outlineColor};`);
      lines.push(`  outline-offset: 0;`);
      break;
    case "combined":
      lines.push(`  outline: ${cfg.outlineWidth}px ${cfg.outlineStyle} ${cfg.outlineColor};`);
      lines.push(`  outline-offset: ${cfg.outlineOffset}px;`);
      lines.push(`  box-shadow: 0 0 0 ${cfg.shadowSpread}px ${cfg.shadowColor}40;`);
      break;
  }

  lines.push(`}`);

  return lines.join("\n");
}

/* ─── Component ──────────────────────────────────────────────── */

const STYLE_OPTIONS: { value: FocusStyle; label: string; desc: string }[] = [
  { value: "outline", label: "CSS Outline", desc: "Standard, recommended. Works across all browsers." },
  { value: "box-shadow", label: "Box Shadow", desc: "Useful when overflow: hidden clips outlines." },
  { value: "border", label: "Border", desc: "Requires adjusting layout to avoid reflow." },
  { value: "background", label: "Background Highlight", desc: "UK Gov style — good for inline text links." },
  { value: "combined", label: "Combined", desc: "Outline + shadow glow — high visibility." },
];

export function FocusIndicatorGenerator() {
  const [cfg, setCfg] = useState<FocusConfig>(DEFAULT_CONFIG);
  const [selector, setSelector] = useState("*:focus-visible");
  const [copied, setCopied] = useState(false);

  const css = useMemo(() => generateCSS(cfg, selector), [cfg, selector]);
  const checks = useMemo(() => wcagChecks(cfg), [cfg]);
  const allPass = checks.every((c) => c.pass);

  function update<K extends keyof FocusConfig>(key: K, value: FocusConfig[K]) {
    setCfg((prev) => ({ ...prev, [key]: value }));
  }

  async function copyCSS() {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadCSS() {
    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "focus-indicator.css";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Preview style
  const previewStyle: React.CSSProperties = {
    outline:
      cfg.style === "outline" || cfg.style === "background" || cfg.style === "combined"
        ? `${cfg.outlineWidth}px ${cfg.outlineStyle} ${cfg.outlineColor}`
        : "none",
    outlineOffset:
      cfg.style === "outline" || cfg.style === "combined"
        ? `${cfg.outlineOffset}px`
        : "0",
    boxShadow:
      cfg.style === "box-shadow"
        ? `0 0 ${cfg.shadowBlur}px ${cfg.shadowSpread}px ${cfg.shadowColor}`
        : cfg.style === "combined"
        ? `0 0 0 ${cfg.shadowSpread}px ${cfg.shadowColor}40`
        : "none",
    border:
      cfg.style === "border"
        ? `${cfg.borderWidth}px ${cfg.outlineStyle} ${cfg.borderColor}`
        : undefined,
    borderRadius:
      cfg.style === "border" ? `${cfg.borderRadius}px` : undefined,
    backgroundColor:
      cfg.style === "background" ? cfg.bgColor : undefined,
  };

  return (
    <div className="space-y-6">
      {/* WCAG info */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">WCAG 2.4.11 &amp; 2.4.13 — Focus Indicators (New in WCAG 2.2)</p>
          <p className="mt-0.5">
            2.4.11 (AA): Keyboard focus indicator must not be entirely hidden. 
            2.4.13 (AAA): The focus indicator must have ≥2px outline and ≥3:1 contrast against adjacent colors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Configuration</h3>

          {/* Selector */}
          <div>
            <label htmlFor="focus-selector" className="block text-xs font-semibold text-slate-600 mb-1">
              CSS Selector
            </label>
            <input
              id="focus-selector"
              type="text"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Style type */}
          <fieldset>
            <legend className="text-xs font-semibold text-slate-600 mb-2">Focus Style</legend>
            <div className="space-y-2">
              {STYLE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="focus-style"
                    value={opt.value}
                    checked={cfg.style === opt.value}
                    onChange={() => update("style", opt.value)}
                    className="mt-0.5 accent-teal-700"
                  />
                  <span>
                    <span className="text-sm font-medium text-slate-800">{opt.label}</span>
                    <span className="text-xs text-slate-500 ml-2">{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Outline controls */}
          {(cfg.style === "outline" || cfg.style === "combined" || cfg.style === "background") && (
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label htmlFor="outline-color" className="block text-xs font-semibold text-slate-600 mb-1">
                    Outline Color
                  </label>
                  <input
                    id="outline-color"
                    type="color"
                    value={cfg.outlineColor}
                    onChange={(e) => update("outlineColor", e.target.value)}
                    className="h-9 w-full cursor-pointer rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label htmlFor="outline-style" className="block text-xs font-semibold text-slate-600 mb-1">
                    Style
                  </label>
                  <select
                    id="outline-style"
                    value={cfg.outlineStyle}
                    onChange={(e) => update("outlineStyle", e.target.value as OutlineStyle)}
                    className="rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-teal-500 focus:outline-none"
                  >
                    {(["solid", "dashed", "dotted", "double"] as OutlineStyle[]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="outline-width" className="block text-xs font-semibold text-slate-600 mb-1">
                    Width: {cfg.outlineWidth}px
                  </label>
                  <input
                    id="outline-width"
                    type="range"
                    min={1}
                    max={8}
                    value={cfg.outlineWidth}
                    onChange={(e) => update("outlineWidth", Number(e.target.value))}
                    className="w-full accent-teal-700"
                  />
                </div>
                <div>
                  <label htmlFor="outline-offset" className="block text-xs font-semibold text-slate-600 mb-1">
                    Offset: {cfg.outlineOffset}px
                  </label>
                  <input
                    id="outline-offset"
                    type="range"
                    min={0}
                    max={8}
                    value={cfg.outlineOffset}
                    onChange={(e) => update("outlineOffset", Number(e.target.value))}
                    className="w-full accent-teal-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Box shadow controls */}
          {(cfg.style === "box-shadow" || cfg.style === "combined") && (
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div>
                <label htmlFor="shadow-color" className="block text-xs font-semibold text-slate-600 mb-1">
                  Shadow Color
                </label>
                <input
                  id="shadow-color"
                  type="color"
                  value={cfg.shadowColor}
                  onChange={(e) => update("shadowColor", e.target.value)}
                  className="h-9 w-full cursor-pointer rounded border border-slate-300"
                />
              </div>
              <div>
                <label htmlFor="shadow-spread" className="block text-xs font-semibold text-slate-600 mb-1">
                  Spread: {cfg.shadowSpread}px
                </label>
                <input
                  id="shadow-spread"
                  type="range"
                  min={1}
                  max={10}
                  value={cfg.shadowSpread}
                  onChange={(e) => update("shadowSpread", Number(e.target.value))}
                  className="w-full accent-teal-700"
                />
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={cfg.removeDefault}
              onChange={(e) => update("removeDefault", e.target.checked)}
              className="accent-teal-700"
            />
            <span className="text-slate-700">Remove browser default outline first</span>
          </label>
        </div>

        {/* Preview + checks */}
        <div className="space-y-5">
          {/* Preview */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Preview</h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  style={previewStyle}
                  className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white"
                >
                  Button
                </button>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={previewStyle}
                  className="text-teal-700 underline text-sm"
                >
                  Link text
                </a>
                <input
                  type="text"
                  placeholder="Text input"
                  style={previewStyle}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <p className="text-xs text-slate-500">
                These previews show the focus style applied statically. Tab through the page to see it on actual focus.
              </p>
            </div>
          </div>

          {/* WCAG checks */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              WCAG Compliance Checks
              <span className={`ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs font-bold ${
                allPass ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}>
                {allPass ? "All Pass" : "Issues Found"}
              </span>
            </h3>
            <ul className="space-y-2">
              {checks.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`text-base flex-shrink-0 ${c.pass ? "text-green-600" : "text-red-600"}`}>
                    {c.pass ? "✓" : "✗"}
                  </span>
                  <div>
                    <p className={`text-sm font-medium ${c.pass ? "text-slate-800" : "text-red-700"}`}>
                      {c.label}
                    </p>
                    <p className="text-xs text-slate-500">{c.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Generated CSS */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Generated CSS</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyCSS}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy CSS"}
            </button>
            <button
              type="button"
              onClick={downloadCSS}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download
            </button>
          </div>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-700 bg-slate-50 overflow-x-auto whitespace-pre">
          {css}
        </pre>
      </div>
    </div>
  );
}
