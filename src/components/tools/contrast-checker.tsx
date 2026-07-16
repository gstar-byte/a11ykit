"use client";

import { useState, useCallback } from "react";
import { Check, X, Copy, RotateCcw } from "lucide-react";

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
  const [fontSize, setFontSize] = useState(18);
  const [fontWeight, setFontWeight] = useState(400);
  const [copied, setCopied] = useState(false);

  const fgValid = isValidHex(fg);
  const bgValid = isValidHex(bg);

  const result = useCallback((): CheckResult | null => {
    if (!fgValid || !bgValid) return null;
    const fgRgb = hexToRgb(fg);
    const bgRgb = hexToRgb(bg);
    if (!fgRgb || !bgRgb) return null;
    const ratio = getContrastRatio(fgRgb, bgRgb);
    return evaluateContrast(ratio);
  }, [fg, bg, fgValid, bgValid])();

  const isLargeText = fontSize >= 18 && fontWeight >= 400 || fontSize >= 14 && fontWeight >= 700;

  const handleCopy = () => {
    if (!result) return;
    const css = `color: ${fg};\nbackground-color: ${bg};\n/* Contrast ratio: ${result.ratio}:1 */`;
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
    setFontSize(18);
    setFontWeight(400);
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
            color: fgValid ? fg : "#000000",
            fontSize: `${fontSize}px`,
            fontWeight: fontWeight,
          }}
        >
          {sampleTexts[0]}
        </p>
        <p
          className="mb-2"
          style={{
            color: fgValid ? fg : "#000000",
            fontSize: `${Math.max(fontSize - 4, 12)}px`,
            fontWeight: 400,
          }}
        >
          {sampleTexts[3]}
        </p>
        <button
          className="rounded-md px-4 py-2 text-sm font-medium"
          style={{
            color: fgValid ? fg : "#000000",
            backgroundColor: bgValid ? bg : "#ffffff",
            border: `2px solid ${fgValid ? fg : "#000000"}`,
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
        </fieldset>
      </div>

      {/* Font controls */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="font-size" className="block text-sm font-medium text-slate-700">
            Font size: <span className="text-teal-600">{fontSize}px</span>
          </label>
          <input
            id="font-size"
            type="range"
            min={12}
            max={48}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </div>
        <div>
          <label htmlFor="font-weight" className="block text-sm font-medium text-slate-700">
            Font weight: <span className="text-teal-600">{fontWeight}</span>
          </label>
          <input
            id="font-weight"
            type="range"
            min={400}
            max={700}
            step={300}
            value={fontWeight}
            onChange={(e) => setFontWeight(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={handleSwap}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Swap colors
          </button>
          <button
            onClick={handleReset}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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

          <div className="mt-4 rounded-lg bg-teal-50 p-4 text-sm text-slate-700">
            <p>
              <strong>Current text size:</strong> {fontSize}px, weight {fontWeight} —
              classified as {isLargeText ? "large text" : "normal text"} per WCAG 1.4.3.
              Large text = ≥18px (or ≥14px bold).
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
