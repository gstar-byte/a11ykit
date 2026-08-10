"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle, Info, Download, BookOpen } from "lucide-react";

/* ─── Readability algorithms ─────────────────────────────────── */

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function tokenize(text: string) {
  // Split into sentences (rough heuristic)
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const words = text
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z']/g, ""))
    .filter((w) => w.length > 0);

  return { sentences, words };
}

function computeMetrics(text: string) {
  const { sentences, words } = tokenize(text);
  if (words.length === 0) return null;

  const numSentences = Math.max(sentences.length, 1);
  const numWords = words.length;
  const numSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const asl = numWords / numSentences; // average sentence length
  const asw = numSyllables / numWords; // average syllables per word

  // Flesch Reading Ease: 206.835 - 1.015 * ASL - 84.6 * ASW
  const flesch = 206.835 - 1.015 * asl - 84.6 * asw;
  const fleschClamped = Math.max(0, Math.min(100, Math.round(flesch * 10) / 10));

  // Flesch-Kincaid Grade Level: 0.39 * ASL + 11.8 * ASW - 15.59
  const fkGrade = 0.39 * asl + 11.8 * asw - 15.59;
  const fkGradeClamped = Math.max(0, Math.round(fkGrade * 10) / 10);

  // Gunning Fog: 0.4 * (ASL + 100 * complexWordsRatio)
  const complexWords = words.filter((w) => countSyllables(w) >= 3).length;
  const gunningFog = 0.4 * (asl + (100 * complexWords) / numWords);
  const gunningFogClamped = Math.max(0, Math.round(gunningFog * 10) / 10);

  // Long sentences (>25 words)
  const longSentences = sentences.filter((s) => {
    const sw = s.split(/\s+/).filter((w) => w.length > 0);
    return sw.length > 25;
  });

  // Passive voice detection (simple heuristic)
  const passivePattern = /\b(am|is|are|was|were|be|been|being)\s+\w+ed\b/gi;
  const passiveMatches = text.match(passivePattern) || [];

  return {
    numSentences,
    numWords,
    numSyllables,
    asl: Math.round(asl * 10) / 10,
    asw: Math.round(asw * 100) / 100,
    flesch: fleschClamped,
    fkGrade: fkGradeClamped,
    gunningFog: gunningFogClamped,
    complexWords,
    longSentences,
    passiveCount: passiveMatches.length,
  };
}

function fleschLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Very Easy (5th grade)", color: "text-green-700" };
  if (score >= 80) return { label: "Easy (6th grade)", color: "text-green-600" };
  if (score >= 70) return { label: "Fairly Easy (7th grade)", color: "text-emerald-600" };
  if (score >= 60) return { label: "Standard (8–9th grade)", color: "text-yellow-600" };
  if (score >= 50) return { label: "Fairly Difficult (10–12th grade)", color: "text-orange-600" };
  if (score >= 30) return { label: "Difficult (College)", color: "text-red-600" };
  return { label: "Very Confusing (Professional)", color: "text-red-700" };
}

function gradeLabel(grade: number): string {
  if (grade <= 6) return `Grade ${Math.round(grade)} (Ages 11–12)`;
  if (grade <= 8) return `Grade ${Math.round(grade)} (Ages 13–14)`;
  if (grade <= 12) return `Grade ${Math.round(grade)} (Ages 15–17)`;
  if (grade <= 16) return `College (Ages 18+)`;
  return `Graduate level`;
}

/* ─── Sentence highlighter ───────────────────────────────────── */

function getHighlightedSentences(text: string, longSentences: string[]) {
  const longSet = new Set(longSentences.map((s) => s.trim()));
  // Split preserving punctuation
  const parts = text.split(/([.!?]+(?:\s+|$))/).filter(Boolean);
  const result: { text: string; isLong: boolean }[] = [];
  let buffer = "";
  for (const part of parts) {
    if (/[.!?]+/.test(part)) {
      buffer += part;
      const trimmed = buffer.replace(/[.!?\s]+$/, "").trim();
      result.push({ text: buffer, isLong: longSet.has(trimmed) });
      buffer = "";
    } else {
      buffer += part;
    }
  }
  if (buffer.trim()) result.push({ text: buffer, isLong: false });
  return result;
}

/* ─── Sample text ────────────────────────────────────────────── */

const sampleText = `Accessibility is the practice of making your websites usable by as many people as possible. We traditionally think of this as being about people with disabilities, but the practice of making sites accessible also benefits other groups such as those using mobile devices, or those with slow network connections.

You might also think of accessibility as treating everyone the same, and giving them equal opportunities, no matter what their ability or circumstances. Just as it is wrong to exclude someone from a physical building because they are in a wheelchair (modern public buildings generally have wheelchair ramps or elevators), it is also not right to exclude someone from a website because they have a visual impairment. We are all different, but we are all human, and therefore have the same human rights.

Accessibility is the right thing to do. Providing accessible sites is part of the law in some countries, which can open up some significant markets that otherwise would not be able to use your services or buy your products.`;

/* ─── Component ──────────────────────────────────────────────── */

export function ReadingLevelAnalyzer() {
  const [text, setText] = useState("");

  const metrics = useMemo(() => (text.trim() ? computeMetrics(text) : null), [text]);

  const wcagCompliant = metrics ? metrics.fkGrade <= 9 : null;
  const wcagStatus =
    wcagCompliant === null
      ? null
      : wcagCompliant
      ? { pass: true, label: "Passes WCAG 3.1.5 (Grade ≤ 9)", color: "text-green-700", bg: "bg-green-50 border-green-200" }
      : { pass: false, label: "May fail WCAG 3.1.5 (Grade > 9 — consider simplifying)", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" };

  const fleschInfo = metrics ? fleschLabel(metrics.flesch) : null;

  const highlighted = metrics
    ? getHighlightedSentences(text, metrics.longSentences)
    : [];

  function handleExport() {
    if (!metrics) return;
    const data = {
      fleschReadingEase: metrics.flesch,
      fleschKincaidGrade: metrics.fkGrade,
      gunningFog: metrics.gunningFog,
      sentences: metrics.numSentences,
      words: metrics.numWords,
      avgSentenceLength: metrics.asl,
      passivePhrases: metrics.passiveCount,
      longSentences: metrics.longSentences.length,
      wcag315Compliant: wcagCompliant,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reading-level-report.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label
          htmlFor="reading-level-input"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Paste your text content
        </label>
        <textarea
          id="reading-level-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          rows={10}
          placeholder="Paste your website copy, blog post, or any text here to analyze its reading level…"
          aria-describedby="reading-level-hint"
        />
        <div className="mt-2 flex items-center justify-between">
          <p id="reading-level-hint" className="text-xs text-slate-500">
            {text.trim()
              ? `${text.split(/\s+/).filter((w) => w.length > 0).length} words`
              : "Minimum 50 words recommended for accurate scoring"}
          </p>
          <button
            type="button"
            onClick={() => setText(sampleText)}
            className="text-sm text-teal-700 hover:text-teal-600 font-medium"
          >
            Load sample text
          </button>
        </div>
      </div>

      {metrics && (
        <>
          {/* WCAG Status Banner */}
          {wcagStatus && (
            <div
              className={`flex items-start gap-3 rounded-xl border p-4 ${wcagStatus.bg}`}
              role="status"
              aria-live="polite"
            >
              {wcagStatus.pass ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <div>
                <p className={`text-sm font-semibold ${wcagStatus.color}`}>
                  {wcagStatus.label}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  WCAG SC 3.1.5 Reading Level recommends content readable at lower secondary education level (approximately Grade 9 or below) when supplemental content is not provided.
                </p>
              </div>
            </div>
          )}

          {/* Score Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Flesch Reading Ease */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Flesch Reading Ease
              </p>
              <p className="text-5xl font-bold text-slate-900 mb-1">{metrics.flesch}</p>
              <p className={`text-sm font-medium ${fleschInfo?.color}`}>{fleschInfo?.label}</p>
              <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${metrics.flesch}%`,
                    backgroundColor:
                      metrics.flesch >= 70
                        ? "#10b981"
                        : metrics.flesch >= 50
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                  role="presentation"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">0 = Hardest · 100 = Easiest</p>
            </div>

            {/* FK Grade */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Flesch-Kincaid Grade
              </p>
              <p
                className={`text-5xl font-bold mb-1 ${
                  metrics.fkGrade <= 9 ? "text-green-700" : metrics.fkGrade <= 12 ? "text-amber-700" : "text-red-700"
                }`}
              >
                {metrics.fkGrade}
              </p>
              <p className="text-sm font-medium text-slate-600">{gradeLabel(metrics.fkGrade)}</p>
              <p className="text-xs text-slate-400 mt-3">Target: ≤ 9 for WCAG 3.1.5</p>
            </div>

            {/* Gunning Fog */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Gunning Fog Index
              </p>
              <p
                className={`text-5xl font-bold mb-1 ${
                  metrics.gunningFog <= 8 ? "text-green-700" : metrics.gunningFog <= 12 ? "text-amber-700" : "text-red-700"
                }`}
              >
                {metrics.gunningFog}
              </p>
              <p className="text-sm font-medium text-slate-600">
                {metrics.gunningFog <= 8 ? "Easy read" : metrics.gunningFog <= 12 ? "Moderate" : "Complex"}
              </p>
              <p className="text-xs text-slate-400 mt-3">Target: ≤ 12 for general audiences</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Sentences", value: metrics.numSentences },
              { label: "Words", value: metrics.numWords },
              { label: "Avg. sentence length", value: `${metrics.asl} words` },
              { label: "Passive phrases", value: metrics.passiveCount, warn: metrics.passiveCount > 3 },
            ].map(({ label, value, warn }) => (
              <div
                key={label}
                className={`rounded-lg border p-4 text-center ${
                  warn ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"
                }`}
              >
                <p className={`text-2xl font-bold ${warn ? "text-amber-700" : "text-slate-900"}`}>
                  {value}
                </p>
                <p className={`text-xs mt-0.5 ${warn ? "text-amber-600" : "text-slate-500"}`}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-teal-700" aria-hidden="true" />
                Recommendations
              </h3>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Export JSON
              </button>
            </div>
            <ul className="space-y-3">
              {metrics.fkGrade > 9 && (
                <li className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-amber-700 font-medium">Grade level is above 9</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Aim for Grade 6–9 for general web content. Consider shorter sentences and simpler vocabulary.
                    </p>
                  </div>
                </li>
              )}
              {metrics.asl > 20 && (
                <li className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-amber-700 font-medium">
                      Average sentence length is {metrics.asl} words (target: ≤ 20)
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {metrics.longSentences.length} sentence{metrics.longSentences.length !== 1 ? "s" : ""} exceed 25 words. Break them up for better readability.
                    </p>
                  </div>
                </li>
              )}
              {metrics.passiveCount > 3 && (
                <li className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">
                      {metrics.passiveCount} passive voice phrases detected
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Active voice is generally easier to read. E.g., "The button was clicked by the user" → "The user clicked the button."
                    </p>
                  </div>
                </li>
              )}
              {metrics.complexWords > metrics.numWords * 0.15 && (
                <li className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">
                      {metrics.complexWords} complex words (3+ syllables) — {Math.round((metrics.complexWords / metrics.numWords) * 100)}% of total
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Consider replacing jargon with simpler alternatives where possible.
                    </p>
                  </div>
                </li>
              )}
              {metrics.fkGrade <= 9 && metrics.asl <= 20 && metrics.passiveCount <= 3 && (
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-green-700">
                    Great readability! Your text is clear and accessible.
                  </p>
                </li>
              )}
            </ul>
          </div>

          {/* Highlighted text preview */}
          {metrics.longSentences.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Text Preview — long sentences highlighted
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                <span className="inline-block w-3 h-3 rounded-sm bg-amber-200 mr-1 align-middle" />
                Sentences over 25 words are highlighted
              </p>
              <p className="text-sm leading-relaxed text-slate-700">
                {highlighted.map((part, i) => (
                  <span
                    key={i}
                    className={part.isLong ? "bg-amber-100 rounded px-0.5" : ""}
                  >
                    {part.text}
                  </span>
                ))}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
