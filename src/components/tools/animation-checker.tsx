"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle, Info, Download } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────── */

interface AnimationIssue {
  type: "error" | "warning" | "info";
  message: string;
  line: number;
  code: string;
  fix: string;
  wcag: string;
}

/* ─── CSS parser / analyzer ──────────────────────────────────── */

// Patterns that indicate animation/transition usage
const ANIMATION_PATTERNS = [
  { pattern: /animation\s*:/gi, name: "animation shorthand" },
  { pattern: /animation-name\s*:/gi, name: "animation-name" },
  { pattern: /animation-duration\s*:/gi, name: "animation-duration" },
  { pattern: /animation-iteration-count\s*:\s*infinite/gi, name: "infinite animation" },
  { pattern: /transition\s*:/gi, name: "transition shorthand" },
  { pattern: /@keyframes/gi, name: "@keyframes" },
  { pattern: /transform\s*:/gi, name: "transform" },
  { pattern: /scroll-behavior\s*:\s*smooth/gi, name: "smooth scroll" },
  { pattern: /parallax/gi, name: "parallax" },
];

// Patterns that indicate prefers-reduced-motion handling
const REDUCED_MOTION_PATTERNS = [
  /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/gi,
  /@media\s*\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/gi,
  /@media\s*screen\s*and\s*\(\s*prefers-reduced-motion/gi,
];

function getLineNumber(text: string, index: number): number {
  return text.substring(0, index).split("\n").length;
}

function getLineContent(text: string, lineNumber: number): string {
  const lines = text.split("\n");
  return (lines[lineNumber - 1] || "").trim().slice(0, 80);
}

function analyzeCSS(css: string): AnimationIssue[] {
  const issues: AnimationIssue[] = [];

  // Check for prefers-reduced-motion
  const hasPRM = REDUCED_MOTION_PATTERNS.some((p) => p.test(css));

  // Reset lastIndex for all patterns
  ANIMATION_PATTERNS.forEach((p) => { p.pattern.lastIndex = 0; });

  // Detect animations / transitions
  const foundAnimations: { name: string; line: number; code: string }[] = [];

  for (const { pattern, name } of ANIMATION_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(css)) !== null) {
      const line = getLineNumber(css, match.index);
      foundAnimations.push({ name, line, code: getLineContent(css, line) });
    }
  }

  if (foundAnimations.length === 0) {
    issues.push({
      type: "info",
      message: "No animations or transitions detected in this CSS.",
      line: 0,
      code: "",
      fix: "",
      wcag: "2.3.3",
    });
    return issues;
  }

  // Check for infinite animations
  const infinitePattern = /animation-iteration-count\s*:\s*infinite/gi;
  let infiniteMatch;
  while ((infiniteMatch = infinitePattern.exec(css)) !== null) {
    const line = getLineNumber(css, infiniteMatch.index);
    issues.push({
      type: "error",
      message: "Infinite animation detected without reduced-motion check.",
      line,
      code: getLineContent(css, line),
      fix: `@media (prefers-reduced-motion: reduce) {\n  .your-element {\n    animation: none;\n  }\n}`,
      wcag: "2.3.3",
    });
  }

  // Check for smooth scroll without reduced-motion
  const smoothPattern = /scroll-behavior\s*:\s*smooth/gi;
  let smoothMatch;
  while ((smoothMatch = smoothPattern.exec(css)) !== null) {
    const line = getLineNumber(css, smoothMatch.index);
    issues.push({
      type: "warning",
      message: "`scroll-behavior: smooth` can cause vestibular issues for some users.",
      line,
      code: getLineContent(css, line),
      fix: `@media (prefers-reduced-motion: reduce) {\n  html {\n    scroll-behavior: auto;\n  }\n}`,
      wcag: "2.3.3",
    });
  }

  // Check: transitions without reduced-motion handling
  const transitionPattern = /transition\s*:/gi;
  const hasTransitions = transitionPattern.test(css);

  if (!hasPRM) {
    if (hasTransitions || foundAnimations.length > 0) {
      issues.push({
        type: "error",
        message: `Found ${foundAnimations.length} animation/transition propert${foundAnimations.length === 1 ? "y" : "ies"} but NO @media (prefers-reduced-motion) block detected.`,
        line: 0,
        code: "",
        fix: `/* Add this to your CSS */\n@media (prefers-reduced-motion: reduce) {\n  *,\n  *::before,\n  *::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n    scroll-behavior: auto !important;\n  }\n}`,
        wcag: "2.3.3",
      });
    }
  } else {
    // Has PRM — check if it's comprehensive
    const prmBlockMatch = css.match(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/gi);
    if (!prmBlockMatch || prmBlockMatch.length === 0) {
      issues.push({
        type: "warning",
        message: "`prefers-reduced-motion` media query found but the block content could not be verified. Ensure it disables all animations.",
        line: 0,
        code: "",
        fix: "",
        wcag: "2.3.3",
      });
    } else {
      issues.push({
        type: "info",
        message: `✓ @media (prefers-reduced-motion) block found. ${foundAnimations.length} animation/transition properties are used in this file.`,
        line: 0,
        code: "",
        fix: "",
        wcag: "2.3.3",
      });
    }
  }

  // Check for very short durations (< 100ms) — usually fine, but flag for review
  const durationPattern = /(?:animation|transition)-duration\s*:\s*([\d.]+)(ms|s)/gi;
  let durationMatch;
  while ((durationMatch = durationPattern.exec(css)) !== null) {
    const value = parseFloat(durationMatch[1]);
    const unit = durationMatch[2];
    const ms = unit === "s" ? value * 1000 : value;
    if (ms >= 5000) {
      const line = getLineNumber(css, durationMatch.index);
      issues.push({
        type: "warning",
        message: `Very long animation duration (${ms}ms). Animations longer than 5 seconds should have a way to pause or stop (WCAG 2.2.2).`,
        line,
        code: getLineContent(css, line),
        fix: 'Add pause/stop controls, or use `animation-play-state: paused` on user interaction.',
        wcag: "2.2.2",
      });
    }
  }

  // Check @keyframes for motion-based transforms
  const keyframePattern = /@keyframes\s+\S+\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/gi;
  let kfMatch;
  while ((kfMatch = keyframePattern.exec(css)) !== null) {
    const body = kfMatch[1];
    const hasMotion = /transform|translate|rotate|scale|skew|top|left|right|bottom|margin|padding/.test(body);
    if (hasMotion && !hasPRM) {
      const line = getLineNumber(css, kfMatch.index);
      issues.push({
        type: "warning",
        message: `@keyframes with motion transforms found without prefers-reduced-motion handling.`,
        line,
        code: getLineContent(css, line),
        fix: `@media (prefers-reduced-motion: reduce) {\n  .animated-element {\n    animation: none;\n    /* Or provide a fade-only alternative */\n  }\n}`,
        wcag: "2.3.3",
      });
    }
  }

  return issues;
}

/* ─── Safe fix template ──────────────────────────────────────── */

const SAFE_FIX = `/* ─── Safe default: disable all motion for reduced-motion users ─── */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* ─── Alternatively: opt-in approach (WCAG best practice) ─── */
/* 
@media (prefers-reduced-motion: no-preference) {
  .animated-element {
    animation: slide-in 0.3s ease-out;
    transition: transform 0.2s;
  }
}
*/`;

/* ─── Sample CSS ─────────────────────────────────────────────── */

const sampleCSS = `/* Example CSS with animation issues */

.hero-banner {
  animation: pulse 2s infinite;
  transition: opacity 0.3s ease;
}

.spinner {
  animation: spin 1s linear infinite;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}

.page {
  scroll-behavior: smooth;
}

@keyframes pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Missing: @media (prefers-reduced-motion: reduce) block! */`;

const sampleCSSGood = `/* Example CSS with proper reduced-motion handling */

.hero-banner {
  animation: pulse 2s infinite;
  transition: opacity 0.3s ease;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Correct: prefers-reduced-motion handled */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`;

/* ─── Component ──────────────────────────────────────────────── */

export function AnimationChecker() {
  const [css, setCss] = useState("");

  const issues = useMemo(() => (css.trim() ? analyzeCSS(css) : []), [css]);

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warnCount = issues.filter((i) => i.type === "warning").length;
  const infoCount = issues.filter((i) => i.type === "info").length;

  const allGood = errorCount === 0 && warnCount === 0;

  function downloadFix() {
    const blob = new Blob([SAFE_FIX], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prefers-reduced-motion.css";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">WCAG 2.3.3 — Animation from Interactions (AAA) &amp; 2.2.2 — Pause, Stop, Hide (AA)</p>
          <p className="mt-0.5">
            Motion, animation, and transitions can trigger vestibular disorders, nausea, and seizures.
            Always provide a <code className="text-xs bg-blue-100 px-1 rounded">@media (prefers-reduced-motion: reduce)</code> block
            to disable non-essential animations for users who request it.
          </p>
        </div>
      </div>

      {/* Input */}
      <div>
        <label htmlFor="animation-css-input" className="block text-sm font-semibold text-slate-700 mb-2">
          Paste your CSS
        </label>
        <textarea
          id="animation-css-input"
          value={css}
          onChange={(e) => setCss(e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-4 font-mono text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          rows={12}
          placeholder="Paste your CSS here to check for animation accessibility issues…"
        />
        <div className="mt-2 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setCss(sampleCSS)}
            className="text-sm text-teal-700 hover:text-teal-600 font-medium"
          >
            Load problematic example
          </button>
          <button
            type="button"
            onClick={() => setCss(sampleCSSGood)}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium"
          >
            Load compliant example
          </button>
        </div>
      </div>

      {issues.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`rounded-xl border p-4 text-center ${errorCount > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
              <p className={`text-3xl font-bold ${errorCount > 0 ? "text-red-700" : "text-slate-900"}`}>{errorCount}</p>
              <p className={`text-sm mt-0.5 ${errorCount > 0 ? "text-red-600" : "text-slate-600"}`}>Errors</p>
            </div>
            <div className={`rounded-xl border p-4 text-center ${warnCount > 0 ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
              <p className={`text-3xl font-bold ${warnCount > 0 ? "text-amber-700" : "text-slate-900"}`}>{warnCount}</p>
              <p className={`text-sm mt-0.5 ${warnCount > 0 ? "text-amber-600" : "text-slate-600"}`}>Warnings</p>
            </div>
            <div className={`rounded-xl border p-4 text-center ${allGood ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"}`}>
              <p className={`text-3xl font-bold ${allGood ? "text-green-700" : "text-slate-900"}`}>
                {allGood ? "✓" : infoCount}
              </p>
              <p className={`text-sm mt-0.5 ${allGood ? "text-green-600" : "text-slate-600"}`}>
                {allGood ? "All good!" : "Info"}
              </p>
            </div>
          </div>

          {/* Issues list */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Analysis Results</h3>
            <ul className="space-y-5">
              {issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-3">
                  {issue.type === "error" && (
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  {issue.type === "warning" && (
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  {issue.type === "info" && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      issue.type === "error" ? "text-red-700" :
                      issue.type === "warning" ? "text-amber-700" : "text-green-700"
                    }`}>
                      {issue.message}
                    </p>
                    {issue.line > 0 && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Line {issue.line}: <code className="font-mono">{issue.code}</code>
                      </p>
                    )}
                    {issue.wcag && (
                      <p className="text-xs text-slate-400 mt-0.5">WCAG {issue.wcag}</p>
                    )}
                    {issue.fix && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Suggested fix:</p>
                        <pre className="text-xs font-mono bg-slate-50 border border-slate-200 rounded p-3 overflow-x-auto whitespace-pre">
                          {issue.fix}
                        </pre>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Universal fix */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Universal Reduced-Motion Fix</h3>
          <button
            type="button"
            onClick={downloadFix}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Download CSS
          </button>
        </div>
        <p className="text-xs text-slate-600 mb-3">
          Add this snippet to the top of your global CSS file to ensure all animations are disabled for users who request it:
        </p>
        <pre className="text-xs font-mono bg-slate-50 border border-slate-200 rounded p-4 overflow-x-auto whitespace-pre">
          {SAFE_FIX}
        </pre>
      </div>
    </div>
  );
}
