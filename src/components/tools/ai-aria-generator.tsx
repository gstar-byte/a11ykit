"use client";

import { useState } from "react";
import {
  Sparkles, Loader2, Copy, Check, Download, Info, ChevronDown,
} from "lucide-react";

/* ─── Component presets ──────────────────────────────────────── */

interface Preset {
  label: string;
  prompt: string;
}

const PRESETS: Preset[] = [
  { label: "Modal dialog", prompt: "A modal dialog with a title, close button, and confirm/cancel actions" },
  { label: "Tabs", prompt: "A tabbed interface with 3 tabs" },
  { label: "Accordion", prompt: "An accordion/collapsible section with multiple items" },
  { label: "Alert banner", prompt: "A dismissible error alert banner" },
  { label: "Combobox / autocomplete", prompt: "A combobox search input with autocomplete dropdown list" },
  { label: "Breadcrumb nav", prompt: "A breadcrumb navigation with 3 levels" },
  { label: "Tooltip", prompt: "A button with an accessible tooltip on hover/focus" },
  { label: "Progress bar", prompt: "An animated progress bar showing 65% completion" },
  { label: "Toggle switch", prompt: "A toggle switch for enabling/disabling notifications" },
  { label: "Pagination", prompt: "A pagination component with prev/next and page numbers" },
];

type OutputFormat = "html" | "react" | "vue";

/* ─── Component ──────────────────────────────────────────────── */

export function AiAriaGenerator() {
  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState<OutputFormat>("html");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  async function generate() {
    if (!prompt.trim()) { setError("Please describe the component you want to generate."); return; }

    setLoading(true);
    setError("");
    setResult("");
    setExplanation("");

    const formatNote = {
      html: "pure HTML5 with vanilla JavaScript where needed (no frameworks)",
      react: "React functional component using TypeScript and JSX with proper TypeScript types",
      vue: "Vue 3 single-file component using <template>, <script setup>, and <style>",
    }[format];

    const systemPrompt = `You are an expert in web accessibility (WCAG 2.2, WAI-ARIA 1.2). 
Generate accessible, production-ready UI components with complete and correct ARIA attributes.
Always follow the WAI-ARIA Authoring Practices Guide (APG) patterns.
Include keyboard interaction support where appropriate.
Output ${formatNote}.`;

    const userPrompt = `Generate a fully accessible ${prompt}.

Requirements:
- Follow the WAI-ARIA APG pattern for this component type
- Include ALL necessary ARIA roles, states, and properties
- Include complete keyboard interaction (Arrow keys, Enter, Escape, Tab, Space as appropriate)
- Use semantic HTML as the foundation
- Include focus management where needed
- Add brief inline comments explaining key accessibility decisions
- Do NOT use placeholder colors or complex CSS — keep styling minimal and functional

Respond with a JSON object in this exact format:
{
  "code": "<the complete component code as a string>",
  "explanation": "<2-3 sentences explaining the key ARIA patterns used and why>"
}`;

    try {
      const res = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 2000,
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(45000),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error?.message || `API error (${res.status})`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      const parsed = JSON.parse(content);
      setResult(parsed.code || "");
      setExplanation(parsed.explanation || "");
    } catch (e) {
      setError((e as Error).message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadCode() {
    const ext = format === "react" ? "tsx" : format === "vue" ? "vue" : "html";
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accessible-component.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">AI-Powered ARIA Component Generator</p>
          <p className="mt-0.5">
            Describe any UI component in plain English and get production-ready accessible code
            following WAI-ARIA Authoring Practices Guide (APG) patterns — with keyboard interactions,
            focus management, and full ARIA attributes.
          </p>
        </div>
      </div>

      {/* Prompt + format */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="aria-prompt" className="text-sm font-semibold text-slate-700">
              Describe the component
            </label>
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-600"
              aria-expanded={showPresets}
            >
              Presets <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showPresets ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
          </div>

          {showPresets && (
            <div className="mb-3 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => { setPrompt(p.prompt); setShowPresets(false); }}
                  className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800 hover:bg-teal-100 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          <textarea
            id="aria-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder='e.g. "A modal dialog with a title, close button, and confirm/cancel actions"'
          />
        </div>

        {/* Output format */}
        <fieldset>
          <legend className="text-sm font-semibold text-slate-700 mb-2">Output Format</legend>
          <div className="flex gap-4">
            {(["html", "react", "vue"] as OutputFormat[]).map((f) => (
              <label key={f} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="aria-format"
                  value={f}
                  checked={format === f}
                  onChange={() => setFormat(f)}
                  className="accent-teal-700"
                />
                {f === "html" ? "HTML" : f === "react" ? "React (TSX)" : "Vue 3"}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={generate}
          disabled={loading || !prompt.trim()}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Generating…</>
          ) : (
            <><Sparkles className="h-4 w-4" aria-hidden="true" /> Generate Accessible Component</>
          )}
        </button>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            <span aria-hidden="true">⚠</span> {error}
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <>
          {explanation && (
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-teal-700" aria-hidden="true" />
                <p className="text-sm font-semibold text-teal-900">Accessibility Notes</p>
              </div>
              <p className="text-sm text-teal-800">{explanation}</p>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Generated Code
                <span className="ml-2 inline-flex rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-600">
                  {format === "react" ? ".tsx" : format === "vue" ? ".vue" : ".html"}
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-600" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
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
            <pre className="p-4 text-xs font-mono text-slate-700 bg-slate-50 overflow-x-auto whitespace-pre max-h-[500px] overflow-y-auto">
              {result}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
