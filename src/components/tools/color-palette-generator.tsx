"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Download, Info, CheckCircle, AlertTriangle } from "lucide-react";

/* ─── Color math ─────────────────────────────────────────────── */

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function contrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 0;
  const L1 = relativeLuminance(rgb1);
  const L2 = relativeLuminance(rgb2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function wcagLevel(ratio: number, isLargeText = false): "AAA" | "AA" | "FAIL" {
  if (isLargeText) {
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3) return "AA";
    return "FAIL";
  }
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "FAIL";
}

/* ─── Palette generation ─────────────────────────────────────── */

interface PaletteColor {
  name: string;
  hex: string;
  hsl: [number, number, number];
  onWhite: { ratio: number; level: "AAA" | "AA" | "FAIL" };
  onBlack: { ratio: number; level: "AAA" | "AA" | "FAIL" };
  textColor: string; // for swatch display
}

interface Palette {
  primary: PaletteColor[];
  neutrals: PaletteColor[];
  semantic: { success: PaletteColor; warning: PaletteColor; error: PaletteColor; info: PaletteColor };
}

const LIGHTNESS_STEPS = [
  { name: "50",  l: 95 },
  { name: "100", l: 90 },
  { name: "200", l: 80 },
  { name: "300", l: 70 },
  { name: "400", l: 60 },
  { name: "500", l: 50 },
  { name: "600", l: 40 },
  { name: "700", l: 30 },
  { name: "800", l: 20 },
  { name: "900", l: 12 },
];

function makeColor(name: string, hex: string): PaletteColor {
  const rgb = hexToRgb(hex) ?? [0, 0, 0];
  const hsl = rgbToHsl(...rgb);
  const onWhite = contrastRatio(hex, "#ffffff");
  const onBlack = contrastRatio(hex, "#000000");
  // Pick text color (black or white) for swatch
  const textColor = onWhite >= onBlack ? "#ffffff" : "#000000";
  return {
    name,
    hex,
    hsl,
    onWhite: { ratio: Math.round(onWhite * 100) / 100, level: wcagLevel(onWhite) },
    onBlack: { ratio: Math.round(onBlack * 100) / 100, level: wcagLevel(onBlack) },
    textColor,
  };
}

function generatePrimary(brandHex: string): PaletteColor[] {
  const rgb = hexToRgb(brandHex);
  if (!rgb) return [];
  const [h, s] = rgbToHsl(...rgb);
  return LIGHTNESS_STEPS.map(({ name, l }) => {
    const rgb2 = hslToRgb(h, Math.min(s, 95), l);
    return makeColor(name, rgbToHex(...rgb2));
  });
}

function generateNeutrals(brandHex: string): PaletteColor[] {
  const rgb = hexToRgb(brandHex);
  if (!rgb) return [];
  const [h] = rgbToHsl(...rgb);
  // Very low saturation neutrals tinted with brand hue
  return LIGHTNESS_STEPS.map(({ name, l }) => {
    const rgb2 = hslToRgb(h, 8, l);
    return makeColor(name, rgbToHex(...rgb2));
  });
}

function generateSemantic(brandHex: string): Palette["semantic"] {
  const rgb = hexToRgb(brandHex);
  const [, s] = rgb ? rgbToHsl(...rgb) : [0, 60, 50];
  const sat = Math.max(s, 60);

  return {
    success: makeColor("success", rgbToHex(...hslToRgb(142, sat, 36))),
    warning: makeColor("warning", rgbToHex(...hslToRgb(38, 95, 42))),
    error:   makeColor("error",   rgbToHex(...hslToRgb(0,  72, 42))),
    info:    makeColor("info",    rgbToHex(...hslToRgb(210, sat, 38))),
  };
}

function generatePalette(brandHex: string): Palette {
  return {
    primary:  generatePrimary(brandHex),
    neutrals: generateNeutrals(brandHex),
    semantic: generateSemantic(brandHex),
  };
}

/* ─── CSS / Tailwind export ──────────────────────────────────── */

function exportCSS(palette: Palette, prefix: string): string {
  const lines = [":root {"];
  palette.primary.forEach((c) => lines.push(`  --color-${prefix}-${c.name}: ${c.hex};`));
  lines.push("");
  palette.neutrals.forEach((c) => lines.push(`  --color-neutral-${c.name}: ${c.hex};`));
  lines.push("");
  const s = palette.semantic;
  lines.push(`  --color-success: ${s.success.hex};`);
  lines.push(`  --color-warning: ${s.warning.hex};`);
  lines.push(`  --color-error:   ${s.error.hex};`);
  lines.push(`  --color-info:    ${s.info.hex};`);
  lines.push("}");
  return lines.join("\n");
}

function exportTailwind(palette: Palette, prefix: string): string {
  const lines = ["// tailwind.config.js — colors section"];
  lines.push("colors: {");
  lines.push(`  ${prefix}: {`);
  palette.primary.forEach((c) => lines.push(`    '${c.name}': '${c.hex}',`));
  lines.push("  },");
  lines.push("  neutral: {");
  palette.neutrals.forEach((c) => lines.push(`    '${c.name}': '${c.hex}',`));
  lines.push("  },");
  const s = palette.semantic;
  lines.push("  success: '" + s.success.hex + "',");
  lines.push("  warning: '" + s.warning.hex + "',");
  lines.push("  error:   '" + s.error.hex + "',");
  lines.push("  info:    '" + s.info.hex + "',");
  lines.push("}");
  return lines.join("\n");
}

/* ─── Component ──────────────────────────────────────────────── */

type ExportFormat = "css" | "tailwind";

const LEVEL_BADGE = {
  AAA:  "bg-green-100 text-green-800",
  AA:   "bg-blue-100 text-blue-800",
  FAIL: "bg-red-100 text-red-700",
};

function ColorSwatch({ color, prefix }: { color: PaletteColor; prefix: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const bestContrast = color.onWhite.ratio >= color.onBlack.ratio ? color.onWhite : color.onBlack;
  const bestBg = color.onWhite.ratio >= color.onBlack.ratio ? "#fff" : "#000";

  return (
    <div className="group flex flex-col rounded-lg overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <button
        type="button"
        onClick={copy}
        title={`Copy ${color.hex}`}
        className="h-14 w-full flex items-center justify-center transition-opacity"
        style={{ backgroundColor: color.hex }}
        aria-label={`Copy color ${color.name}: ${color.hex}`}
      >
        {copied ? (
          <Check className="h-4 w-4" style={{ color: color.textColor }} aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4 opacity-0 group-hover:opacity-70 transition-opacity" style={{ color: color.textColor }} aria-hidden="true" />
        )}
      </button>
      <div className="px-2 py-1.5 bg-white">
        <p className="text-xs font-semibold text-slate-700">{prefix}-{color.name}</p>
        <p className="text-xs font-mono text-slate-500">{color.hex.toUpperCase()}</p>
        <div className="mt-1 flex gap-1">
          <span
            className="text-[10px] font-bold rounded px-1"
            style={{ backgroundColor: bestBg === "#fff" ? "#f1f5f9" : "#1e293b", color: bestBg === "#fff" ? "#334155" : "#e2e8f0" }}
            title={`${bestContrast.ratio}:1 contrast`}
          >
            {bestContrast.ratio}:1
          </span>
          <span className={`text-[10px] font-bold rounded px-1 ${LEVEL_BADGE[bestContrast.level]}`}>
            {bestContrast.level}
          </span>
        </div>
      </div>
    </div>
  );
}

function SemanticSwatch({ color }: { color: PaletteColor }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:shadow-sm transition-shadow w-full text-left"
      aria-label={`Copy ${color.name} color ${color.hex}`}
    >
      <div className="h-10 w-10 rounded-md flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: color.hex }}>
        {copied && <Check className="h-4 w-4" style={{ color: color.textColor }} aria-hidden="true" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800 capitalize">{color.name}</p>
        <p className="text-xs font-mono text-slate-500">{color.hex.toUpperCase()}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className={`text-[10px] font-bold rounded px-1.5 py-0.5 ${LEVEL_BADGE[color.onWhite.level]}`}>
          /{color.onWhite.ratio}:1
        </span>
      </div>
    </button>
  );
}

export function ColorPaletteGenerator() {
  const [brandHex, setBrandHex] = useState("#0f766e");
  const [brandHexInput, setBrandHexInput] = useState("#0f766e");
  const [prefix, setPrefix] = useState("brand");
  const [format, setFormat] = useState<ExportFormat>("css");
  const [copied, setCopied] = useState(false);

  const palette = useMemo(() => generatePalette(brandHex), [brandHex]);

  const code = useMemo(
    () => (format === "css" ? exportCSS(palette, prefix) : exportTailwind(palette, prefix)),
    [palette, prefix, format]
  );

  function handleHexInput(value: string) {
    setBrandHexInput(value);
    if (/^#?[0-9a-f]{6}$/i.test(value.trim())) {
      const hex = value.trim().startsWith("#") ? value.trim() : `#${value.trim()}`;
      setBrandHex(hex);
      setBrandHexInput(hex);
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadCode() {
    const ext = format === "css" ? "css" : "js";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accessible-palette.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Accessibility score: how many primary swatches pass AA on white
  const aaPassCount = palette.primary.filter((c) => c.onWhite.level !== "FAIL").length;
  const totalSwatches = palette.primary.length;

  // Find best text-on-background shades (for usage guidance)
  const darkShades = palette.primary.filter((c) => c.onWhite.level !== "FAIL").slice(-4);
  const lightShades = palette.primary.filter((c) => c.onBlack.level !== "FAIL").slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Configuration</h3>
        <div className="flex flex-wrap gap-4 items-end">
          {/* Color picker */}
          <div>
            <label htmlFor="brand-color-picker" className="block text-xs font-semibold text-slate-600 mb-1">
              Brand Color
            </label>
            <div className="flex items-center gap-2">
              <input
                id="brand-color-picker"
                type="color"
                value={brandHex}
                onChange={(e) => {
                  setBrandHex(e.target.value);
                  setBrandHexInput(e.target.value);
                }}
                className="h-10 w-12 cursor-pointer rounded border border-slate-300 p-0.5"
              />
              <input
                type="text"
                value={brandHexInput}
                onChange={(e) => handleHexInput(e.target.value)}
                placeholder="#0f766e"
                className="w-28 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                aria-label="Brand hex color value"
              />
            </div>
          </div>

          {/* Prefix */}
          <div>
            <label htmlFor="color-prefix" className="block text-xs font-semibold text-slate-600 mb-1">
              Color Name / Prefix
            </label>
            <input
              id="color-prefix"
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.replace(/\s/g, "-").toLowerCase())}
              className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Format */}
          <fieldset>
            <legend className="block text-xs font-semibold text-slate-600 mb-1">Export Format</legend>
            <div className="flex gap-2">
              {(["css", "tailwind"] as ExportFormat[]).map((f) => (
                <label key={f} className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="export-format"
                    value={f}
                    checked={format === f}
                    onChange={() => setFormat(f)}
                    className="accent-teal-700"
                  />
                  {f === "css" ? "CSS Variables" : "Tailwind Config"}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      {/* Accessibility score */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={`rounded-xl border p-4 text-center ${aaPassCount >= 4 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
          <p className={`text-3xl font-bold ${aaPassCount >= 4 ? "text-green-700" : "text-amber-700"}`}>
            {aaPassCount}/{totalSwatches}
          </p>
          <p className={`text-sm mt-0.5 ${aaPassCount >= 4 ? "text-green-600" : "text-amber-600"}`}>
            Shades pass AA on white
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-3xl font-bold text-slate-900">
            {palette.primary.filter((c) => c.onWhite.level === "AAA").length}
          </p>
          <p className="text-sm text-slate-600 mt-0.5">Shades pass AAA on white</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-3xl font-bold text-slate-900">
            {palette.primary.filter((c) => c.onBlack.level !== "FAIL").length}
          </p>
          <p className="text-sm text-slate-600 mt-0.5">Pass on dark background</p>
        </div>
      </div>

      {/* Primary palette */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Primary — <span className="font-mono">{prefix}</span>
        </h3>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {palette.primary.map((color) => (
            <ColorSwatch key={color.name} color={color} prefix={prefix} />
          ))}
        </div>
        {(darkShades.length > 0 || lightShades.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
            {darkShades.length > 0 && (
              <p>
                <strong className="text-slate-800">Text on white:</strong>{" "}
                Use {prefix}-{darkShades[0].name} or darker
              </p>
            )}
            {lightShades.length > 0 && (
              <p>
                <strong className="text-slate-800">Text on dark:</strong>{" "}
                Use {prefix}-{lightShades[lightShades.length - 1].name} or lighter
              </p>
            )}
          </div>
        )}
      </div>

      {/* Neutrals */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Neutrals — <span className="font-mono text-slate-500">brand-tinted grays</span>
        </h3>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {palette.neutrals.map((color) => (
            <ColorSwatch key={color.name} color={color} prefix="neutral" />
          ))}
        </div>
      </div>

      {/* Semantic colors */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Semantic Colors</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.values(palette.semantic).map((c) => (
            <SemanticSwatch key={c.name} color={c} />
          ))}
        </div>
        <div className="mt-3 flex items-start gap-2">
          {Object.values(palette.semantic).every((c) => c.onWhite.level !== "FAIL") ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-green-700">All semantic colors pass WCAG AA on white background.</p>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-amber-700">Some semantic colors may need adjustment for AA compliance.</p>
            </>
          )}
        </div>
      </div>

      {/* Export */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3">
          <h3 className="text-sm font-semibold text-slate-900">
            {format === "css" ? "CSS Custom Properties" : "Tailwind Config"}
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              onClick={downloadCode}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download
            </button>
          </div>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-700 bg-slate-50 overflow-x-auto whitespace-pre max-h-80">
          {code}
        </pre>
      </div>

      {/* WCAG info */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">WCAG 1.4.3 — Color Contrast</p>
          <p className="mt-0.5">
            Text must have a contrast ratio of at least <strong>4.5:1</strong> against its background for WCAG AA (Normal text),
            or <strong>3:1</strong> for large text (18pt+ or 14pt bold). Aim for AAA (7:1) for body text where possible.
            Click any swatch to copy its hex value.
          </p>
        </div>
      </div>
    </div>
  );
}
