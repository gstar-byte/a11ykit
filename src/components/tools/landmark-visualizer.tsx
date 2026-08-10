"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle, Info, ChevronRight } from "lucide-react";

/* ─── Landmark definitions ───────────────────────────────────── */

interface LandmarkDef {
  role: string;
  tags: string[];
  color: string;
  bg: string;
  wcag: string;
  description: string;
}

const LANDMARK_DEFS: LandmarkDef[] = [
  {
    role: "banner",
    tags: ["header"],
    color: "#0f766e",
    bg: "#f0fdf4",
    wcag: "1.3.6",
    description: "Site-wide header. Should be a direct child of <body>.",
  },
  {
    role: "navigation",
    tags: ["nav"],
    color: "#0891b2",
    bg: "#f0f9ff",
    wcag: "1.3.6",
    description: "Navigation landmark. Multiple navs should have aria-label.",
  },
  {
    role: "main",
    tags: ["main"],
    color: "#7c3aed",
    bg: "#faf5ff",
    wcag: "1.3.6",
    description: "Main content. Should appear exactly once per page.",
  },
  {
    role: "complementary",
    tags: ["aside"],
    color: "#d97706",
    bg: "#fffbeb",
    wcag: "1.3.6",
    description: "Complementary content. Should have aria-label.",
  },
  {
    role: "contentinfo",
    tags: ["footer"],
    color: "#6b7280",
    bg: "#f9fafb",
    wcag: "1.3.6",
    description: "Site-wide footer. Should be a direct child of <body>.",
  },
  {
    role: "search",
    tags: ["search"],
    color: "#db2777",
    bg: "#fdf2f8",
    wcag: "1.3.6",
    description: 'Search landmark. Use <search> or role="search" on a <form>.',
  },
  {
    role: "form",
    tags: ["form"],
    color: "#ea580c",
    bg: "#fff7ed",
    wcag: "1.3.6",
    description: 'Form landmark. Must have accessible name (aria-label or aria-labelledby).',
  },
  {
    role: "region",
    tags: [],
    color: "#4f46e5",
    bg: "#eef2ff",
    wcag: "1.3.6",
    description: "Generic region. Must have an accessible name to be a landmark.",
  },
];

function getRoleDef(tag: string, role?: string | null): LandmarkDef | undefined {
  if (role) {
    return LANDMARK_DEFS.find((d) => d.role === role);
  }
  return LANDMARK_DEFS.find((d) => d.tags.includes(tag.toLowerCase()));
}

/* ─── Tree node ──────────────────────────────────────────────── */

interface LandmarkNode {
  role: string;
  tag: string;
  label: string | null;
  labelledby: string | null;
  hasAccessibleName: boolean;
  depth: number;
  def: LandmarkDef | undefined;
  issues: { type: "error" | "warning" | "info"; message: string }[];
  children: LandmarkNode[];
  index: number;
}

/* ─── Parse landmarks ─────────────────────────────────────────  */

const LANDMARK_TAGS = new Set([
  "header", "nav", "main", "aside", "footer", "form", "section", "search",
]);
const LANDMARK_ROLES = new Set(
  LANDMARK_DEFS.map((d) => d.role)
);

function parseLandmarks(doc: Document): LandmarkNode[] {
  let counter = 0;

  function walk(el: Element, depth: number): LandmarkNode | null {
    const tag = el.tagName.toLowerCase();
    const role = el.getAttribute("role");
    const isLandmarkTag = LANDMARK_TAGS.has(tag);
    const isLandmarkRole = role ? LANDMARK_ROLES.has(role) : false;

    if (!isLandmarkTag && !isLandmarkRole) return null;

    // section only counts as landmark if it has accessible name
    if (tag === "section" && !el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby")) {
      return null;
    }

    const def = getRoleDef(tag, role);
    const ariaLabel = el.getAttribute("aria-label");
    const ariaLabelledby = el.getAttribute("aria-labelledby");
    const hasAccessibleName = !!(ariaLabel || ariaLabelledby);
    const derivedRole = role || def?.role || tag;

    const issues: LandmarkNode["issues"] = [];

    // Nav without label when multiple navs might exist
    if (tag === "nav" && !hasAccessibleName) {
      issues.push({
        type: "warning",
        message: 'Navigation landmark has no accessible name. Add aria-label (e.g., aria-label="Main navigation") to distinguish multiple navs.',
      });
    }

    // Form without accessible name — won't be a landmark
    if (tag === "form" && !hasAccessibleName) {
      issues.push({
        type: "warning",
        message: 'Form has no accessible name and will not be exposed as a landmark. Add aria-label or aria-labelledby.',
      });
    }

    // Aside without label
    if (tag === "aside" && !hasAccessibleName) {
      issues.push({
        type: "info",
        message: 'Complementary region has no aria-label. Consider adding one to help users understand its purpose.',
      });
    }

    // Region must have accessible name
    if (role === "region" && !hasAccessibleName) {
      issues.push({
        type: "error",
        message: 'role="region" must have an accessible name (aria-label or aria-labelledby) to count as a landmark.',
      });
    }

    // Recurse into children
    const childNodes: LandmarkNode[] = [];
    el.querySelectorAll(":scope > *").forEach((child) => {
      const node = walk(child, depth + 1);
      if (node) childNodes.push(node);
    });

    counter++;
    return {
      role: derivedRole,
      tag,
      label: ariaLabel,
      labelledby: ariaLabelledby,
      hasAccessibleName,
      depth,
      def,
      issues,
      children: childNodes,
      index: counter,
    };
  }

  const roots: LandmarkNode[] = [];
  doc.body.querySelectorAll(":scope > *").forEach((el) => {
    const node = walk(el, 0);
    if (node) roots.push(node);
  });

  return roots;
}

function flattenNodes(nodes: LandmarkNode[]): LandmarkNode[] {
  const result: LandmarkNode[] = [];
  function walk(node: LandmarkNode) {
    result.push(node);
    node.children.forEach(walk);
  }
  nodes.forEach(walk);
  return result;
}

/* ─── Global checks ──────────────────────────────────────────── */

function getGlobalIssues(
  flat: LandmarkNode[]
): { type: "error" | "warning" | "info"; message: string }[] {
  const issues: { type: "error" | "warning" | "info"; message: string }[] = [];

  const mains = flat.filter((n) => n.role === "main");
  const banners = flat.filter((n) => n.role === "banner");
  const contentinfos = flat.filter((n) => n.role === "contentinfo");

  if (mains.length === 0) {
    issues.push({ type: "error", message: "No <main> landmark found. Every page must have exactly one main landmark." });
  } else if (mains.length > 1) {
    issues.push({ type: "error", message: `${mains.length} <main> landmarks found. There should be exactly one per page.` });
  }

  if (banners.length === 0) {
    issues.push({ type: "warning", message: "No <header> (banner) landmark found at the top level." });
  } else if (banners.length > 1) {
    issues.push({ type: "warning", message: `${banners.length} <header> elements found. Only the top-level <header> is a banner landmark.` });
  }

  if (contentinfos.length === 0) {
    issues.push({ type: "info", message: "No <footer> (contentinfo) landmark found." });
  }

  const navs = flat.filter((n) => n.role === "navigation");
  if (navs.length > 1 && navs.some((n) => !n.hasAccessibleName)) {
    issues.push({
      type: "warning",
      message: `${navs.length} navigation landmarks found, but some have no aria-label. Users cannot distinguish them.`,
    });
  }

  return issues;
}

/* ─── Sample HTML ─────────────────────────────────────────────  */

const sampleHTML = `<html>
<body>
  <header>
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/home">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <section aria-label="Latest articles">
      <h2>Articles</h2>
      <p>Content here…</p>
    </section>
    <aside>
      <h2>Related links</h2>
    </aside>
  </main>
  <form>
    <input type="search" />
    <button type="submit">Search</button>
  </form>
  <footer>
    <nav aria-label="Footer navigation">
      <a href="/privacy">Privacy</a>
    </nav>
  </footer>
</body>
</html>`;

/* ─── Render tree ─────────────────────────────────────────────  */

function NodeRow({ node }: { node: LandmarkNode }) {
  const hasIssues = node.issues.length > 0;
  const isError = node.issues.some((i) => i.type === "error");

  return (
    <li>
      <div
        className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
        style={{ paddingLeft: `${node.depth * 1.5 + 0.75}rem` }}
      >
        <ChevronRight className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <span
          className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold text-white flex-shrink-0"
          style={{ backgroundColor: node.def?.color ?? "#6b7280" }}
        >
          {node.role}
        </span>
        <code className="text-xs text-slate-500 flex-shrink-0">&lt;{node.tag}&gt;</code>
        {node.label && (
          <span className="text-xs text-slate-700 italic truncate">"{node.label}"</span>
        )}
        {!node.hasAccessibleName && node.role !== "main" && node.role !== "banner" && node.role !== "contentinfo" && (
          <span className="text-xs text-amber-600 flex-shrink-0">no label</span>
        )}
        {hasIssues && (
          isError ? (
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 ml-auto" aria-hidden="true" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 ml-auto" aria-hidden="true" />
          )
        )}
      </div>
      {node.issues.length > 0 && (
        <ul className="mt-1 space-y-1" style={{ paddingLeft: `${node.depth * 1.5 + 2.5}rem` }}>
          {node.issues.map((issue, i) => (
            <li key={i} className={`text-xs ${
              issue.type === "error" ? "text-red-600" :
              issue.type === "warning" ? "text-amber-600" : "text-blue-600"
            }`}>
              {issue.message}
            </li>
          ))}
        </ul>
      )}
      {node.children.length > 0 && (
        <ul className="mt-1">
          {node.children.map((child) => (
            <NodeRow key={child.index} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ─── Main component ─────────────────────────────────────────── */

export function LandmarkVisualizer() {
  const [html, setHtml] = useState("");

  const { roots, flat, globalIssues } = useMemo(() => {
    if (!html.trim()) return { roots: [], flat: [], globalIssues: [] };
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const roots = parseLandmarks(doc);
      const flat = flattenNodes(roots);
      const globalIssues = getGlobalIssues(flat);
      return { roots, flat, globalIssues };
    } catch {
      return { roots: [], flat: [], globalIssues: [] };
    }
  }, [html]);

  const errorCount = [
    ...flat.flatMap((n) => n.issues),
    ...globalIssues,
  ].filter((i) => i.type === "error").length;

  const warningCount = [
    ...flat.flatMap((n) => n.issues),
    ...globalIssues,
  ].filter((i) => i.type === "warning").length;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label
          htmlFor="landmark-html-input"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Paste your full page HTML
        </label>
        <textarea
          id="landmark-html-input"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-4 font-mono text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          rows={10}
          placeholder="Paste your full HTML including <html>, <body>, semantic landmark elements…"
        />
        <button
          type="button"
          onClick={() => setHtml(sampleHTML)}
          className="mt-2 text-sm text-teal-700 hover:text-teal-600 font-medium"
        >
          Load sample HTML
        </button>
      </div>

      {(flat.length > 0 || globalIssues.length > 0) && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-center">
              <p className="text-3xl font-bold text-slate-900">{flat.length}</p>
              <p className="text-sm text-slate-600">Landmarks</p>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{errorCount}</p>
              <p className="text-sm text-red-600">Errors</p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-center">
              <p className="text-3xl font-bold text-amber-700">{warningCount}</p>
              <p className="text-sm text-amber-600">Warnings</p>
            </div>
          </div>

          {/* Global issues */}
          {globalIssues.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Page-level Checks</h3>
              <ul className="space-y-3">
                {globalIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {issue.type === "error" && (
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                    {issue.type === "warning" && (
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                    {issue.type === "info" && (
                      <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                    <p className={`text-sm ${
                      issue.type === "error" ? "text-red-700" :
                      issue.type === "warning" ? "text-amber-700" : "text-blue-700"
                    }`}>
                      {issue.message}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Landmark tree */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Landmark Structure</h3>
            {roots.length > 0 ? (
              <ul className="space-y-1">
                {roots.map((node) => (
                  <NodeRow key={node.index} node={node} />
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-3 py-4">
                <CheckCircle className="h-5 w-5 text-slate-400" aria-hidden="true" />
                <p className="text-sm text-slate-500">
                  No landmark elements detected. Add semantic HTML5 elements (<code className="text-xs bg-slate-100 px-1 rounded">&lt;header&gt;, &lt;main&gt;, &lt;nav&gt;</code> etc.)
                </p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Landmark Legend</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {LANDMARK_DEFS.map((def) => (
                <div key={def.role} className="flex items-start gap-2">
                  <span
                    className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: def.color }}
                  >
                    {def.role}
                  </span>
                  <p className="text-xs text-slate-600">{def.description}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {html.trim() && flat.length === 0 && globalIssues.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600 text-sm">
            No landmark elements found. Make sure your HTML includes semantic elements like{" "}
            <code className="text-xs bg-slate-200 px-1 rounded">&lt;header&gt;</code>,{" "}
            <code className="text-xs bg-slate-200 px-1 rounded">&lt;main&gt;</code>,{" "}
            <code className="text-xs bg-slate-200 px-1 rounded">&lt;nav&gt;</code>,{" "}
            <code className="text-xs bg-slate-200 px-1 rounded">&lt;footer&gt;</code>.
          </p>
        </div>
      )}
    </div>
  );
}
