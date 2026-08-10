"use client";

import { useState } from "react";
import { Plus, Trash2, Copy, Check, Download } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────── */
interface SkipLink {
  id: string;
  label: string;
  targetId: string;
}

/* ─── Presets ─────────────────────────────────────────────────  */
const PRESETS: SkipLink[] = [
  { id: "1", label: "Skip to main content", targetId: "main-content" },
  { id: "2", label: "Skip to navigation", targetId: "main-nav" },
  { id: "3", label: "Skip to search", targetId: "search" },
];

/* ─── Code generators ─────────────────────────────────────────  */

function generateCSS(): string {
  return `.skip-links {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
}

.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  display: inline-block;
  padding: 12px 24px;
  background: #0f766e;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 0 0 4px 0;
  transition: top 0.1s;
  /* Ensure visible focus — WCAG 2.4.3 */
  outline: 3px solid #fbbf24;
  outline-offset: 2px;
}

.skip-link:focus {
  top: 0;
}`;
}

function generateHTML(links: SkipLink[]): string {
  if (links.length === 0) return "<!-- Add at least one skip link -->";
  const anchors = links
    .map((l) => `  <a href="#${l.targetId}" class="skip-link">${l.label}</a>`)
    .join("\n");
  return `<nav class="skip-links" aria-label="Skip links">\n${anchors}\n</nav>\n\n<!-- Place these IDs on your landmark elements -->\n${links
    .map((l) => `<main id="${l.targetId}">…</main>`)
    .join("\n")}`;
}

function generateReact(links: SkipLink[]): string {
  if (links.length === 0) return "// Add at least one skip link";
  const items = links
    .map((l) => `      <a href="#${l.targetId}" className="skip-link">\n        ${l.label}\n      </a>`)
    .join("\n");
  return `import "./skip-links.css";

export function SkipLinks() {
  return (
    <nav className="skip-links" aria-label="Skip links">
${items}
    </nav>
  );
}`;
}

/* ─── Component ──────────────────────────────────────────────── */

export function SkipLinkGenerator() {
  const [links, setLinks] = useState<SkipLink[]>(PRESETS);
  const [activeTab, setActiveTab] = useState<"html" | "react" | "css">("html");
  const [copied, setCopied] = useState(false);

  const html = generateHTML(links);
  const react = generateReact(links);
  const css = generateCSS();

  const codeMap = { html, react, css };
  const activeCode = codeMap[activeTab];

  function addLink() {
    setLinks((prev) => [
      ...prev,
      { id: Date.now().toString(), label: "Skip to section", targetId: "section-id" },
    ]);
  }

  function removeLink(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  function updateLink(id: string, field: "label" | "targetId", value: string) {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  }

  async function copyCode() {
    await navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadAll() {
    const content = `<!-- skip-links.html -->\n${html}\n\n/* skip-links.css */\n${css}\n\n// SkipLinks.tsx (React)\n${react}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "skip-links.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Link builder */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Configure Skip Links</h3>
          <button
            type="button"
            onClick={addLink}
            className="inline-flex items-center gap-1.5 rounded-md bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-600 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add link
          </button>
        </div>

        <div className="space-y-3">
          {links.map((link, i) => (
            <div key={link.id} className="flex items-center gap-3">
              <span className="flex-shrink-0 text-xs font-medium text-slate-400 w-4">
                {i + 1}
              </span>
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateLink(link.id, "label", e.target.value)}
                placeholder="Link label (e.g. Skip to main content)"
                aria-label={`Skip link ${i + 1} label`}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-xs font-mono">#</span>
                <input
                  type="text"
                  value={link.targetId}
                  onChange={(e) => updateLink(link.id, "targetId", e.target.value.replace(/\s/g, "-"))}
                  placeholder="target-id"
                  aria-label={`Skip link ${i + 1} target ID`}
                  className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeLink(link.id)}
                aria-label={`Remove skip link ${i + 1}`}
                className="text-slate-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        {links.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">
            No skip links configured. Click "Add link" to start.
          </p>
        )}
      </div>

      {/* Live preview */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Preview (Tab to reveal)</h3>
        <div className="relative border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 min-h-16 overflow-hidden">
          <p className="text-xs text-slate-400 text-center">
            Tab through this area to reveal skip links →
          </p>
          <nav className="absolute top-0 left-0 z-10" aria-label="Skip links preview">
            {links.map((l) => (
              <a
                key={l.id}
                href={`#${l.targetId}`}
                onClick={(e) => e.preventDefault()}
                style={{
                  position: "absolute",
                  top: "-100%",
                  left: 0,
                  display: "inline-block",
                  padding: "8px 16px",
                  background: "#0f766e",
                  color: "#fff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  borderRadius: "0 0 4px 0",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.top = "0";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.top = "-100%";
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Code output */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-4">
          <div className="flex" role="tablist" aria-label="Code format">
            {(["html", "css", "react"] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
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
              onClick={downloadAll}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download all
            </button>
          </div>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-700 bg-slate-50 overflow-x-auto whitespace-pre-wrap max-h-96">
          {activeCode}
        </pre>
      </div>

      {/* WCAG info */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Why Skip Links Matter</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <p>
            <strong className="text-slate-800">WCAG 2.4.1 (Level A)</strong> — "Bypass Blocks": A mechanism must be available to bypass blocks of content that are repeated on multiple pages. Skip links are the most reliable, widely-supported solution.
          </p>
          <p>
            Without skip links, keyboard and screen reader users must navigate through the entire navigation bar on every page load before reaching main content.
          </p>
          <p>
            <strong className="text-slate-800">Best practices:</strong> Place the skip link container as the very first element inside <code className="text-xs bg-slate-100 px-1 rounded">&lt;body&gt;</code>. Use CSS to visually hide it until focused (not <code className="text-xs bg-slate-100 px-1 rounded">display:none</code> which removes it from focus order).
          </p>
        </div>
      </div>
    </div>
  );
}
