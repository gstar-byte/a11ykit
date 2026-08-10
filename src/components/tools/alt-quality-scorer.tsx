"use client";

import { useState, useCallback } from "react";
import {
  Upload, Sparkles, Loader2, Key, AlertCircle, CheckCircle,
  Image as ImageIcon, X, Info,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────── */

interface ScoreDimension {
  name: string;
  score: number; // 1–10
  feedback: string;
}

interface ScoreResult {
  overall: number;
  dimensions: ScoreDimension[];
  improved: string;
  wcagNote: string;
}

/* ─── Component ──────────────────────────────────────────────── */

export function AltQualityScorer() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");
  const [altText, setAltText] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState("");

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 4 * 1024 * 1024) {
      setError("Image must be under 4MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setImageName(file.name);
      setResult(null);
      setError("");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  async function analyze() {
    if (!apiKey.trim()) { setError("Please enter your OpenAI API key."); return; }
    if (!imageSrc) { setError("Please upload an image."); return; }
    if (!altText.trim()) { setError("Please enter the alt text to evaluate."); return; }

    setLoading(true);
    setError("");
    setResult(null);

    const base64 = imageSrc.split(",")[1];
    const contextNote = context.trim() ? ` Page context: ${context.trim()}.` : "";

    const prompt = `You are an expert web accessibility auditor specializing in image alt text quality.

Evaluate the following alt text for the provided image.${contextNote}

Alt text to evaluate: "${altText}"

Score each dimension from 1 to 10 and provide brief, actionable feedback:

1. **Accuracy** – Does the alt text correctly describe what is in the image?
2. **Informativeness** – Does it convey the purpose and key information the image communicates?
3. **Conciseness** – Is it an appropriate length (ideally under 125 characters) without being too brief?
4. **No Redundancy** – Does it avoid phrases like "image of", "picture of", "photo of"?

Also provide:
- An improved version of the alt text (if needed)
- A brief WCAG note (SC 1.1.1)

Respond ONLY with valid JSON in this exact format:
{
  "overall": <number 1-10>,
  "dimensions": [
    {"name": "Accuracy", "score": <1-10>, "feedback": "<string>"},
    {"name": "Informativeness", "score": <1-10>, "feedback": "<string>"},
    {"name": "Conciseness", "score": <1-10>, "feedback": "<string>"},
    {"name": "No Redundancy", "score": <1-10>, "feedback": "<string>"}
  ],
  "improved": "<improved alt text or 'Current alt text is good.'",
  "wcagNote": "<one sentence WCAG note>"
}`;

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
              ],
            },
          ],
          max_tokens: 600,
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error?.message || `API error (${res.status})`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      const parsed: ScoreResult = JSON.parse(content);
      setResult(parsed);
    } catch (e) {
      setError((e as Error).message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function scoreColor(score: number) {
    if (score >= 8) return "text-green-700";
    if (score >= 5) return "text-amber-700";
    return "text-red-700";
  }

  function scoreBg(score: number) {
    if (score >= 8) return "bg-green-50 border-green-200";
    if (score >= 5) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  }

  function scoreLabel(score: number) {
    if (score >= 9) return "Excellent";
    if (score >= 7) return "Good";
    if (score >= 5) return "Fair";
    if (score >= 3) return "Poor";
    return "Very Poor";
  }

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">WCAG 1.1.1 — Non-text Content</p>
          <p className="mt-0.5">
            Upload an image, enter your existing alt text, and get AI-powered quality scores across
            accuracy, informativeness, conciseness, and redundancy — plus an improved version.
          </p>
        </div>
      </div>

      {/* API key */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <label htmlFor="scorer-api-key" className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-2">
          <Key className="h-4 w-4" aria-hidden="true" />
          OpenAI API Key
        </label>
        <div className="flex gap-2">
          <input
            id="scorer-api-key"
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-mono focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-100"
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>
        <p className="text-xs text-amber-700 mt-1">
          Your key is used directly from your browser and never sent to our servers.{" "}
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">
            Get API key →
          </a>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: upload + alt input */}
        <div className="space-y-4">
          {/* Image upload */}
          {!imageSrc ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center cursor-pointer"
            >
              <ImageIcon className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-slate-600">Drop image here or click to upload</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP — max 4MB</p>
              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500">
                <Upload className="h-4 w-4" aria-hidden="true" />
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                />
              </label>
            </div>
          ) : (
            <div className="relative rounded-xl border border-slate-200 overflow-hidden">
              <img src={imageSrc} alt={`Preview: ${imageName}`} className="w-full object-contain max-h-64 bg-slate-100" />
              <button
                type="button"
                onClick={() => { setImageSrc(""); setImageName(""); setResult(null); }}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="px-3 py-2 text-xs text-slate-500 bg-white border-t border-slate-100 truncate">{imageName}</p>
            </div>
          )}

          {/* Alt text input */}
          <div>
            <label htmlFor="alt-text-input" className="block text-sm font-semibold text-slate-700 mb-1">
              Alt text to evaluate
            </label>
            <textarea
              id="alt-text-input"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder='e.g. "A woman typing on a laptop at a desk"'
            />
            <p className="text-xs text-slate-400 mt-1">{altText.length} characters</p>
          </div>

          {/* Context */}
          <div>
            <label htmlFor="scorer-context" className="block text-sm font-semibold text-slate-700 mb-1">
              Page context <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="scorer-context"
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. product page for a laptop, blog about remote work"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <button
            type="button"
            onClick={analyze}
            disabled={loading || !imageSrc || !altText.trim() || !apiKey.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Analyzing…</>
            ) : (
              <><Sparkles className="h-4 w-4" aria-hidden="true" /> Evaluate Alt Text</>
            )}
          </button>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
              {error}
            </div>
          )}
        </div>

        {/* Right: results */}
        <div>
          {result ? (
            <div className="space-y-4">
              {/* Overall */}
              <div className={`rounded-xl border p-5 text-center ${scoreBg(result.overall)}`}>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Overall Score</p>
                <p className={`text-6xl font-bold mt-1 ${scoreColor(result.overall)}`}>{result.overall}<span className="text-2xl text-slate-400">/10</span></p>
                <p className={`text-sm font-semibold mt-1 ${scoreColor(result.overall)}`}>{scoreLabel(result.overall)}</p>
              </div>

              {/* Dimensions */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">Dimension Scores</h3>
                {result.dimensions.map((dim) => (
                  <div key={dim.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{dim.name}</span>
                      <span className={`text-sm font-bold ${scoreColor(dim.score)}`}>{dim.score}/10</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${dim.score >= 8 ? "bg-green-500" : dim.score >= 5 ? "bg-amber-400" : "bg-red-500"}`}
                        style={{ width: `${dim.score * 10}%` }}
                        role="presentation"
                      />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{dim.feedback}</p>
                  </div>
                ))}
              </div>

              {/* Improved version */}
              {result.improved && result.improved !== "Current alt text is good." && (
                <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-teal-700" aria-hidden="true" />
                    <p className="text-sm font-semibold text-teal-900">Suggested Improvement</p>
                  </div>
                  <p className="text-sm text-teal-800 italic">"{result.improved}"</p>
                </div>
              )}
              {result.improved === "Current alt text is good." && (
                <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4">
                  <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
                  <p className="text-sm font-semibold text-green-800">Current alt text is good — no improvement needed!</p>
                </div>
              )}

              {/* WCAG note */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs text-slate-600"><strong>WCAG note:</strong> {result.wcagNote}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 h-64 text-slate-400">
              <Sparkles className="h-10 w-10 mb-3" aria-hidden="true" />
              <p className="text-sm">Upload an image and enter alt text to get your score</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
