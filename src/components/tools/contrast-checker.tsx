"use client";

import { useState, useCallback } from "react";
import { Check, X, Copy, RotateCcw, Pipette, Lightbulb } from "lucide-react";

function sRGBToLinear(c: number): number {
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

function computeAPCA(fg: [number, number, number], bg: [number, number, number]): number {
  const fgL = 0.2126 * sRGBToLinear(fg[0]) + 0.7152 * sRGBToLinear(fg[1]) + 0.0722 * sRGBToLinear(fg[2]);
  const bgL = 0.2126 * sRGBToLinear(bg[0]) + 0.7152 * sRGBToLinear(bg[1]) + 0.0722 * sRGBToLinear(bg[2]);
  const fgY = Math.pow(fgL, 0.59);
  const bgY = Math.pow(bgL, 0.59);
  const contrast = bgY - fgY;
  const scale = 1.14;
  const offset = 0.027;
  if (Math.abs(contrast) < offset) return 0;
  const apca = contrast < 0
    ? (contrast * scale - offset) * 100
    : (contrast * scale + offset) * 100;
  return Math.round(apca * 10) / 10;
}

function adjustLuminance(hex: string, delta: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const adjusted = rgb.map((v) => Math.min(255, Math.max(0, Math.round(v + delta)))) as [number, number, number];
  return "#" + adjusted.map((v) => v.toString(16).padStart(2, "0")).join("");
}

function findNearestPassing(fg: string, bg: string, threshold: number, isFg: boolean): string | null {
  let best: string | null = null;
  let bestDist = Infinity;
  for (let delta = 1; delta <= 255; delta++) {
    for (const sign of [1, -1]) {
      const candidate = adjustLuminance(isFg ? fg : bg, delta * sign);
      const candidateRgb = hexToRgb(candidate);
      const otherRgb = hexToRgb(isFg ? bg : fg);
      if (!candidateRgb || !otherRgb) continue;
      const ratio = getContrastRatio(isFg ? candidateRgb : otherRgb, isFg ? otherRgb : candidateRgb);
      if (ratio >= threshold) {
        const origRgb = hexToRgb(isFg ? fg : bg)!;
        const dist = Math.abs(candidateRgb[0] - origRgb[0]) + Math.abs(candidateRgb[1] - origRgb[1]) + Math.abs(candidateRgb[2] - origRgb[2]);
        if (dist < bestDist) {
          bestDist = dist;
          best = candidate;
        }
      }
    }
    if (best) break;
  }
  return best;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.replace("#", "");
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return [r, g, b];
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

function getLuminance(r: number, g: number, b: number): number {
  const srgb = [r, g, b].map((v) => {
    const cs = v / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function getContrastRatio(
  fg: [number, number, number],
  bg: [number, number, number]
): number {
  const l1 = getLuminance(fg[0], fg[1], fg[2]);
  const l2 = getLuminance(bg[0], bg[1], bg[2]);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function compositeAlpha(
  fg: [number, number, number],
  fgAlpha: number,
  bg: [number, number, number]
): [number, number, number] {
  const a = fgAlpha / 100;
  return [
    Math.round(fg[0] * a + bg[0] * (1 - a)),
    Math.round(fg[1] * a + bg[1] * (1 - a)),
    Math.round(fg[2] * a + bg[2] * (1 - a)),
  ];
}

function isValidHex(hex: string): boolean {
  return /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex);
}

interface CheckResult {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
  uiComponent: boolean;
}

function evaluateContrast(ratio: number): CheckResult {
  return {
    ratio: Math.round(ratio * 100) / 100,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
    uiComponent: ratio >= 3,
  };
}

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog.",
  "Heading Text",
  "Button",
  "AaBbCcDdEeFf 1234567890",
];

function PassFail({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {pass ? (
        <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
      ) : (
        <X className="h-4 w-4 text-red-600" aria-hidden="true" />
      )}
      <span className={pass ? "text-green-700" : "text-red-700"}>
        {label}
      </span>
    </div>
  );
}

export function ContrastChecker() {
  const [fg, setFg] = useState("#1e1b4b");
  const [bg, setBg] = useState("#ffffff");
  const [fgAlpha, setFgAlpha] = useState(100);
  const [fontSize, setFontSize] = useState(18);
  const [fontWeight, setFontWeight] = useState(400);
  const [copied, setCopied] = useState(false);
  const [lightness, setLightness] = useState(0);
  const [eyedropperSupported] = useState(typeof window !== "undefined" && "EyeDropper" in window);

  const fgValid = isValidHex(fg);
  const bgValid = isValidHex(bg);

  const effectiveFgHex = lightness !== 0 ? adjustLuminance(fg, lightness) : fg;
  const effectiveFgValid = isValidHex(effectiveFgHex);

  const result = useCallback((): CheckResult | null => {
    if (!fgValid || !bgValid || !effectiveFgValid) return null;
    const fgRgb = hexToRgb(effectiveFgHex);
    const bgRgb = hexToRgb(bg);
    if (!fgRgb || !bgRgb) return null;
    const composited = fgAlpha < 100 ? compositeAlpha(fgRgb, fgAlpha, bgRgb) : fgRgb;
    const ratio = getContrastRatio(composited, bgRgb);
    return evaluateContrast(ratio);
  }, [effectiveFgHex, bg, fgAlpha, fgValid, bgValid, effectiveFgValid])();

  const apcaScore = useCallback((): number | null => {
    if (!fgValid || !bgValid) return null;
    const fgRgb = hexToRgb(effectiveFgHex);
    const bgRgb = hexToRgb(bg);
    if (!fgRgb || !bgRgb) return null;
    const composited = fgAlpha < 100 ? compositeAlpha(fgRgb, fgAlpha, bgRgb) : fgRgb;
    return computeAPCA(composited, bgRgb);
  }, [effectiveFgHex, bg, fgAlpha, fgValid, bgValid])();

  const suggestions = useCallback(() => {
    if (!result || result.aaNormal) return null;
    const fgSuggestion = findNearestPassing(effectiveFgHex, bg, 4.5, true);
    const bgSuggestion = findNearestPassing(effectiveFgHex, bg, 4.5, false);
    return { fg: fgSuggestion, bg: bgSuggestion };
  }, [result, effectiveFgHex, bg])();

  const handleEyedrop = async (target: "fg" | "bg") => {
    try {
      const eyeDropper = new (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper();
      const result = await eyeDropper.open();
      if (target === "fg") setFg(result.sRGBHex);
      else setBg(result.sRGBHex);
    } catch {
      // 用户取消
    }
  };

  const isLargeText = fontSize >= 18 && fontWeight >= 400 || fontSize >= 14 && fontWeight >= 700;

  const handleCopy = () => {
    if (!result) return;
    const fgRgb = hexToRgb(fg);
    const colorValue = fgAlpha < 100 && fgRgb
      ? `rgba(${fgRgb.join(", ")}, ${fgAlpha / 100})`
      : fg;
    const css = `color: ${colorValue};\nbackground-color: ${bg};\n/* Contrast ratio: ${result.ratio}:1 */`;
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    setFg(bg);
    setBg(fg);
  };

  const handleReset = () => {
    setFg("#1e1b4b");
    setBg("#ffffff");
    setFgAlpha(100);
    setFontSize(18);
    setFontWeight(400);
    setLightness(0);
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div
        className="rounded-xl border border-slate-200 p-8 shadow-sm"
        style={{ backgroundColor: bgValid ? bg : "#ffffff" }}
      >
        <p
          className="mb-2"
          style={{
            color: fgValid ? (fgAlpha < 100 ? `rgba(${hexToRgb(fg)?.join(", ")}, ${fgAlpha / 100})` : fg) : "#000000",
            fontSize: `${fontSize}px`,
            fontWeight: fontWeight,
          }}
        >
          {sampleTexts[0]}
        </p>
        <p
          className="mb-2"
          style={{
            color: fgValid ? (fgAlpha < 100 ? `rgba(${hexToRgb(fg)?.join(", ")}, ${fgAlpha / 100})` : fg) : "#000000",
            fontSize: `${Math.max(fontSize - 4, 12)}px`,
            fontWeight: 400,
          }}
        >
          {sampleTexts[3]}
        </p>
        <button
          className="rounded-md px-4 py-2 text-sm font-medium"
          style={{
            color: fgValid ? (fgAlpha < 100 ? `rgba(${hexToRgb(fg)?.join(", ")}, ${fgAlpha / 100})` : fg) : "#000000",
            backgroundColor: bgValid ? bg : "#ffffff",
            border: `2px solid ${fgValid ? (fgAlpha < 100 ? `rgba(${hexToRgb(fg)?.join(", ")}, ${fgAlpha / 100})` : fg) : "#000000"}`,
          }}
        >
          {sampleTexts[2]}
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <fieldset className="rounded-lg border border-slate-200 p-4">
          <legend className="px-2 text-sm font-semibold text-slate-700">
            Foreground (Text)
          </legend>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={fgValid ? fg : "#000000"}
              onChange={(e) => setFg(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded border border-slate-300"
              aria-label="Foreground color picker"
            />
            <input
              type="text"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm uppercase focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="#000000"
              aria-label="Foreground hex value"
              maxLength={7}
            />
          </div>
          {!fgValid && (
            <p className="mt-2 text-xs text-red-600">Invalid hex color</p>
          )}
          <div className="mt-3">
            <label htmlFor="fg-alpha" className="block text-xs font-medium text-slate-600">
              Foreground opacity: <span className="text-teal-700 font-semibold">{fgAlpha}%</span>
            </label>
            <input id="fg-alpha" type="range" min={0} max={100} value={fgAlpha} onChange={(e) => setFgAlpha(Number(e.target.value))} className="mt-1 w-full accent-teal-700" />
          </div>
          <div className="mt-3">
            <label htmlFor="lightness" className="block text-xs font-medium text-slate-600">
              Lightness adjust: <span className="text-teal-700 font-semibold">{lightness > 0 ? "+" : ""}{lightness}</span>
            </label>
            <input id="lightness" type="range" min={-100} max={100} value={lightness} onChange={(e) => setLightness(Number(e.target.value))} className="mt-1 w-full accent-teal-700" />
          </div>
          {eyedropperSupported && (
            <button type="button" onClick={() => handleEyedrop("fg")} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800">
              <Pipette className="h-3.5 w-3.5" aria-hidden="true" /> Pick from screen
            </button>
          )}
        </fieldset>

        <fieldset className="rounded-lg border border-slate-200 p-4">
          <legend className="px-2 text-sm font-semibold text-slate-700">
            Background
          </legend>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={bgValid ? bg : "#ffffff"}
              onChange={(e) => setBg(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded border border-slate-300"
              aria-label="Background color picker"
            />
            <input
              type="text"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm uppercase focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="#FFFFFF"
              aria-label="Background hex value"
              maxLength={7}
            />
          </div>
          {!bgValid && (
            <p className="mt-2 text-xs text-red-600">Invalid hex color</p>
          )}
          {eyedropperSupported && (
            <button type="button" onClick={() => handleEyedrop("bg")} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800">
              <Pipette className="h-3.5 w-3.5" aria-hidden="true" /> Pick from screen
            </button>
          )}
        </fieldset>
      </div>

      {/* Font controls */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="font-size" className="block text-sm font-medium text-slate-700">
            Font size: <span className="text-teal-700 font-semibold">{fontSize}px</span>
          </label>
          <input
            id="font-size"
            type="range"
            min={12}
            max={48}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="mt-2 w-full accent-teal-700"
          />
          <div className="mt-3 text-sm font-medium text-slate-700">
            Font weight: <span className="text-teal-700 font-semibold">{fontWeight}</span>
          </div>
          <div className="mt-1 flex gap-2">
            {([400, 700] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setFontWeight(w)}
                className={`rounded-md px-3 py-1 text-xs font-medium border ${
                  fontWeight === w
                    ? "border-teal-700 bg-teal-50 text-teal-800 font-semibold"
                    : "border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {w === 400 ? "Regular (400)" : "Bold (700)"}
              </button>
            ))}
          </div>
        </div>

        {/* Copy CSS */}
        <div className="flex items-end justify-end gap-2">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Reset to defaults"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Contrast Ratio</p>
              <p className="text-4xl font-bold text-slate-900">
                {result.ratio}:1
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden="true" /> Copy CSS
                </>
              )}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                WCAG 2.1 Level AA
              </h3>
              <div className="mt-3 space-y-2">
                <PassFail
                  pass={result.aaNormal}
                  label={`Normal text (≥ 4.5:1) ${isLargeText ? "— n/a (large)" : ""}`}
                />
                <PassFail
                  pass={result.aaLarge}
                  label={`Large text (≥ 3:1) ${!isLargeText ? "— n/a (normal)" : ""}`}
                />
                <PassFail
                  pass={result.uiComponent}
                  label="UI components (≥ 3:1)"
                />
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                WCAG 2.1 Level AAA
              </h3>
              <div className="mt-3 space-y-2">
                <PassFail
                  pass={result.aaaNormal}
                  label={`Normal text (≥ 7:1) ${isLargeText ? "— n/a (large)" : ""}`}
                />
                <PassFail
                  pass={result.aaaLarge}
                  label={`Large text (≥ 4.5:1) ${!isLargeText ? "— n/a (normal)" : ""}`}
                />
              </div>
            </div>
          </div>

          {apcaScore !== null && (
            <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-slate-700">
              <p>
                <strong>APCA Lc score:</strong> <span className={`font-bold ${Math.abs(apcaScore) >= 75 ? "text-green-700" : Math.abs(apcaScore) >= 60 ? "text-amber-700" : "text-red-700"}`}>{apcaScore}</span>
                <span className="ml-2 text-xs text-slate-500">
                  (WCAG 3 draft — Lc 90+ preferred body, Lc 75+ minimum, Lc 60+ large text)
                </span>
              </p>
            </div>
          )}

          {suggestions && (suggestions.fg || suggestions.bg) && (
            <div className="mt-4 rounded-lg bg-amber-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <Lightbulb className="h-4 w-4" aria-hidden="true" /> Suggested nearest passing colors (AA 4.5:1):
              </p>
              <div className="mt-3 flex flex-wrap gap-4">
                {suggestions.fg && (
                  <button type="button" onClick={() => { setFg(suggestions.fg!); setLightness(0); }} className="flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm hover:bg-amber-100">
                    <div className="h-6 w-6 rounded border border-slate-200" style={{ backgroundColor: suggestions.fg }} />
                    <span className="font-mono text-xs">FG: {suggestions.fg}</span>
                  </button>
                )}
                {suggestions.bg && (
                  <button type="button" onClick={() => setBg(suggestions.bg!)} className="flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm hover:bg-amber-100">
                    <div className="h-6 w-6 rounded border border-slate-200" style={{ backgroundColor: suggestions.bg }} />
                    <span className="font-mono text-xs">BG: {suggestions.bg}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 rounded-lg bg-teal-50 p-4 text-sm text-slate-700">
            <p>
              <strong>Current text size:</strong> {fontSize}px, weight {fontWeight} —
              classified as {isLargeText ? "large text" : "normal text"} per WCAG 1.4.3.
              Large text = ≥18px (or ≥14px bold).
              {fgAlpha < 100 && (
                <span className="block mt-1">
                  <strong>Alpha note:</strong> Foreground opacity is {fgAlpha}%. Contrast is calculated against the composited (blended) color over the background, per WCAG guidance on transparency.
                </span>
              )}
              {lightness !== 0 && (
                <span className="block mt-1">
                  <strong>Lightness note:</strong> Foreground adjusted by {lightness > 0 ? "+" : ""}{lightness} units.
                </span>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
          Please enter valid hex color values for both foreground and background.
        </div>
      )}
    </div>
  );
}
