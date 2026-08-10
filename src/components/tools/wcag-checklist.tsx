"use client";

import { useState, useEffect, useMemo } from "react";
import { Download, RotateCcw, CheckCircle, XCircle, MinusCircle } from "lucide-react";

type CriterionStatus = "pass" | "fail" | "na" | "pending";

type Level = "A" | "AA" | "AAA";
type Principle = "Perceivable" | "Operable" | "Understandable" | "Robust";

interface Criterion {
  id: string;
  principle: Principle;
  level: Level;
  title: string;
  description: string;
  new22?: boolean;
}

const criteria: Criterion[] = [
  // Perceivable - Level A
  { id: "1.1.1", principle: "Perceivable", level: "A", title: "Non-text Content", description: "All non-text content has text alternatives that serve the equivalent purpose." },
  { id: "1.2.1", principle: "Perceivable", level: "A", title: "Audio-only and Video-only (Prerecorded)", description: "Provide transcripts for audio-only and text or audio for video-only content." },
  { id: "1.2.2", principle: "Perceivable", level: "A", title: "Captions (Prerecorded)", description: "Provide captions for all prerecorded audio content in synchronized media." },
  { id: "1.2.3", principle: "Perceivable", level: "A", title: "Audio Description or Media Alternative (Prerecorded)", description: "Provide audio description or full text alternative for prerecorded video." },
  { id: "1.3.1", principle: "Perceivable", level: "A", title: "Info and Relationships", description: "Information and relationships conveyed through presentation are programmatically determined." },
  { id: "1.3.2", principle: "Perceivable", level: "A", title: "Meaningful Sequence", description: "Reading order is programmatically determined when it affects meaning." },
  { id: "1.3.3", principle: "Perceivable", level: "A", title: "Sensory Characteristics", description: "Instructions don't rely solely on sensory characteristics like shape, size, or position." },
  { id: "1.4.1", principle: "Perceivable", level: "A", title: "Use of Color", description: "Color is not the only means of conveying information or indicating an action." },
  { id: "1.4.2", principle: "Perceivable", level: "A", title: "Audio Control", description: "Provide a mechanism to pause, stop, or adjust volume of auto-playing audio." },
  // Perceivable - Level AA
  { id: "1.2.4", principle: "Perceivable", level: "AA", title: "Captions (Live)", description: "Provide captions for all live audio content in synchronized media." },
  { id: "1.2.5", principle: "Perceivable", level: "AA", title: "Audio Description (Prerecorded)", description: "Provide audio description for all prerecorded video content." },
  { id: "1.3.4", principle: "Perceivable", level: "AA", title: "Orientation", description: "Content doesn't restrict its view and operation to a single display orientation." },
  { id: "1.3.5", principle: "Perceivable", level: "AA", title: "Identify Input Purpose", description: "Input fields collecting user data have programmatically determined purpose." },
  { id: "1.4.3", principle: "Perceivable", level: "AA", title: "Contrast (Minimum)", description: "Text contrast ratio is at least 4.5:1 (normal) or 3:1 (large)." },
  { id: "1.4.4", principle: "Perceivable", level: "AA", title: "Resize Text", description: "Text can be resized up to 200% without loss of content or functionality." },
  { id: "1.4.5", principle: "Perceivable", level: "AA", title: "Images of Text", description: "Use text rather than images of text, except for logos and decorative purposes." },
  { id: "1.4.10", principle: "Perceivable", level: "AA", title: "Reflow", description: "Content reflows to 320px width without horizontal scrolling." },
  { id: "1.4.11", principle: "Perceivable", level: "AA", title: "Non-text Contrast", description: "UI components and graphical objects have 3:1 contrast against adjacent colors." },
  { id: "1.4.12", principle: "Perceivable", level: "AA", title: "Text Spacing", description: "No loss of content when users override text spacing properties." },
  { id: "1.4.13", principle: "Perceivable", level: "AA", title: "Content on Hover or Focus", description: "Hover/focus content is dismissible, hoverable, and persistent." },
  // Perceivable - Level AAA
  { id: "1.2.6", principle: "Perceivable", level: "AAA", title: "Sign Language (Prerecorded)", description: "Provide sign language interpretation for all prerecorded audio content." },
  { id: "1.2.7", principle: "Perceivable", level: "AAA", title: "Extended Audio Description (Prerecorded)", description: "Provide extended audio description where pauses are insufficient." },
  { id: "1.2.8", principle: "Perceivable", level: "AAA", title: "Media Alternative (Prerecorded)", description: "Provide full text alternative for all synchronized media." },
  { id: "1.2.9", principle: "Perceivable", level: "AAA", title: "Audio-only (Live)", description: "Provide text alternative for live audio-only content." },
  { id: "1.3.6", principle: "Perceivable", level: "AAA", title: "Identify Purpose", description: "Elements can be programmatically identified via attributes so users can personalize content." },
  { id: "1.4.6", principle: "Perceivable", level: "AAA", title: "Contrast (Enhanced)", description: "Text contrast ratio is at least 7:1 (normal) or 4.5:1 (large)." },
  { id: "1.4.7", principle: "Perceivable", level: "AAA", title: "Low or No Background Audio", description: "Background audio is at least 20dB below speech, or absent." },
  { id: "1.4.8", principle: "Perceivable", level: "AAA", title: "Visual Presentation", description: "Text blocks have width, line spacing, and alignment controls." },
  { id: "1.4.9", principle: "Perceivable", level: "AAA", title: "Images of Text (No Exception)", description: "Images of text are only used for decoration or where essential." },

  // Operable - Level A
  { id: "2.1.1", principle: "Operable", level: "A", title: "Keyboard", description: "All functionality is operable from a keyboard." },
  { id: "2.1.2", principle: "Operable", level: "A", title: "No Keyboard Trap", description: "Focus can be moved away from any component using only a keyboard." },
  { id: "2.1.4", principle: "Operable", level: "A", title: "Character Key Shortcuts", description: "Single-character shortcuts can be turned off or remapped." },
  { id: "2.2.1", principle: "Operable", level: "A", title: "Timing Adjustable", description: "Provide options to turn off, adjust, or extend time limits." },
  { id: "2.2.2", principle: "Operable", level: "A", title: "Pause, Stop, Hide", description: "Auto-moving, blinking, or scrolling content can be paused, stopped, or hidden." },
  { id: "2.3.1", principle: "Operable", level: "A", title: "Three Flashes or Below Threshold", description: "Content doesn't flash more than 3 times per second." },
  { id: "2.4.1", principle: "Operable", level: "A", title: "Bypass Blocks", description: "Provide a skip mechanism to bypass repeated blocks of content." },
  { id: "2.4.2", principle: "Operable", level: "A", title: "Page Titled", description: "Pages have descriptive titles." },
  { id: "2.4.3", principle: "Operable", level: "A", title: "Focus Order", description: "Focusable elements receive focus in an order that preserves meaning." },
  { id: "2.4.4", principle: "Operable", level: "A", title: "Link Purpose (In Context)", description: "Link purpose is clear from the link text or context." },
  { id: "2.5.1", principle: "Operable", level: "A", title: "Pointer Gestures", description: "Multipoint or path-based gestures have single-point alternatives." },
  { id: "2.5.2", principle: "Operable", level: "A", title: "Pointer Cancellation", description: "Up-event triggers can be cancelled or reversed." },
  { id: "2.5.3", principle: "Operable", level: "A", title: "Label in Name", description: "Visible labels are part of the accessible name." },
  { id: "2.5.4", principle: "Operable", level: "A", title: "Motion Actuation", description: "Motion-triggered functions can be disabled and have UI alternatives." },
  // Operable - Level AA
  { id: "2.4.5", principle: "Operable", level: "AA", title: "Multiple Ways", description: "Provide more than one way to locate a page within a set of pages." },
  { id: "2.4.6", principle: "Operable", level: "AA", title: "Headings and Labels", description: "Headings and labels describe their topic or purpose." },
  { id: "2.4.7", principle: "Operable", level: "AA", title: "Focus Visible", description: "Keyboard focus indicator is visible." },
  { id: "2.4.11", principle: "Operable", level: "AA", title: "Focus Not Obscured (Minimum)", description: "Focused elements are not entirely hidden by other content.", new22: true },
  { id: "2.5.7", principle: "Operable", level: "AA", title: "Dragging Movements", description: "Dragging movements have alternative pointer or keyboard methods.", new22: true },
  { id: "2.5.8", principle: "Operable", level: "AA", title: "Target Size (Minimum)", description: "Touch targets are at least 24×24 CSS pixels, except where exempt.", new22: true },
  // Operable - Level AAA
  { id: "2.1.3", principle: "Operable", level: "AAA", title: "Keyboard (No Exception)", description: "All functionality is operable from keyboard with no timed exceptions." },
  { id: "2.2.3", principle: "Operable", level: "AAA", title: "No Timing", description: "Timing is not an essential part of the interaction." },
  { id: "2.2.4", principle: "Operable", level: "AAA", title: "Interruptions", description: "Users can postpone or suppress interruptions." },
  { id: "2.2.5", principle: "Operable", level: "AAA", title: "Re-authenticating", description: "Authenticated sessions can be continued without loss of data." },
  { id: "2.2.6", principle: "Operable", level: "AAA", title: "Timeouts", description: "Users are warned of session timeouts that could cause data loss." },
  { id: "2.3.2", principle: "Operable", level: "AAA", title: "Three Flashes", description: "Content doesn't flash more than 3 times per second, no exceptions." },
  { id: "2.3.3", principle: "Operable", level: "AAA", title: "Animation from Interactions", description: "Motion animations can be disabled." },
  { id: "2.4.8", principle: "Operable", level: "AAA", title: "Location", description: "Information about the user's location is available." },
  { id: "2.4.9", principle: "Operable", level: "AAA", title: "Link Purpose (Link Only)", description: "Link purpose is clear from the link text alone." },
  { id: "2.4.10", principle: "Operable", level: "AAA", title: "Section Headings", description: "Section headings are used to organize content." },
  { id: "2.4.12", principle: "Operable", level: "AAA", title: "Focus Not Obscured (Enhanced)", description: "Focused elements are not hidden by any content at all.", new22: true },
  { id: "2.4.13", principle: "Operable", level: "AAA", title: "Focus Appearance", description: "Focus indicator meets minimum size, contrast, and offset requirements.", new22: true },
  { id: "2.5.5", principle: "Operable", level: "AAA", title: "Target Size (Enhanced)", description: "Touch targets are at least 44×44 CSS pixels." },
  { id: "2.5.6", principle: "Operable", level: "AAA", title: "Concurrent Input Mechanisms", description: "Input methods can be used simultaneously." },

  // Understandable - Level A
  { id: "3.1.1", principle: "Understandable", level: "A", title: "Language of Page", description: "Page has a programmatically determined language." },
  { id: "3.1.2", principle: "Understandable", level: "A", title: "Language of Parts", description: "Foreign language passages have programmatically determined language." },
  { id: "3.2.1", principle: "Understandable", level: "A", title: "On Focus", description: "Focus doesn't trigger unexpected context changes." },
  { id: "3.2.2", principle: "Understandable", level: "A", title: "On Input", description: "Input doesn't trigger unexpected context changes." },
  { id: "3.2.3", principle: "Understandable", level: "A", title: "Consistent Navigation", description: "Navigation mechanisms are repeated across pages in the same order." },
  { id: "3.2.4", principle: "Understandable", level: "A", title: "Consistent Identification", description: "Components with the same functionality are identified consistently." },
  { id: "3.2.6", principle: "Understandable", level: "A", title: "Consistent Help", description: "Help mechanisms appear in the same relative order across pages.", new22: true },
  { id: "3.3.1", principle: "Understandable", level: "A", title: "Error Identification", description: "Input errors are automatically detected and described to the user." },
  { id: "3.3.2", principle: "Understandable", level: "A", title: "Labels or Instructions", description: "Provide labels or instructions when content requires user input." },
  { id: "3.3.3", principle: "Understandable", level: "A", title: "Error Suggestion", description: "Provide suggestions for fixing input errors." },
  { id: "3.3.4", principle: "Understandable", level: "A", title: "Error Prevention (Legal, Financial, Data)", description: "Submissions are reversible, verified, or confirmed." },
  { id: "3.3.7", principle: "Understandable", level: "A", title: "Redundant Entry", description: "Previously entered information is auto-populated or available to select.", new22: true },
  // Understandable - Level AA
  { id: "3.3.8", principle: "Understandable", level: "AA", title: "Accessible Authentication (Minimum)", description: "Authentication does not rely on cognitive function tests, unless an exception applies.", new22: true },
  // Understandable - Level AAA
  { id: "3.1.3", principle: "Understandable", level: "AAA", title: "Unusual Words", description: "Provide definitions for unusual or jargon words." },
  { id: "3.1.4", principle: "Understandable", level: "AAA", title: "Abbreviations", description: "Provide expansions of abbreviations." },
  { id: "3.1.5", principle: "Understandable", level: "AAA", title: "Reading Level", description: "Content requires lower secondary education reading level." },
  { id: "3.1.6", principle: "Understandable", level: "AAA", title: "Pronunciation", description: "Provide pronunciation where meaning is ambiguous." },
  { id: "3.2.5", principle: "Understandable", level: "AAA", title: "Change on Request", description: "Context changes only on explicit user request." },
  { id: "3.3.5", principle: "Understandable", level: "AAA", title: "Help", description: "Context-sensitive help is available." },
  { id: "3.3.6", principle: "Understandable", level: "AAA", title: "Error Prevention (All)", description: "All submissions are reversible, verified, or confirmed." },
  { id: "3.3.9", principle: "Understandable", level: "AAA", title: "Accessible Authentication (No Exception)", description: "No cognitive function test for authentication, no exceptions.", new22: true },

  // Robust - Level A
  { id: "4.1.2", principle: "Robust", level: "A", title: "Name, Role, Value", description: "UI components have programmatically determined name, role, and value." },
  // Robust - Level AA
  { id: "4.1.3", principle: "Robust", level: "AA", title: "Status Messages", description: "Status messages are programmatically determined through role or properties." },
];

const STORAGE_KEY = "a11ykit-wcag-checklist-v2";

export function WcagChecklist() {
  const [statuses, setStatuses] = useState<Map<string, CriterionStatus>>(new Map());
  const [filterLevel, setFilterLevel] = useState<Level | "all">("all");
  const [filterPrinciple, setFilterPrinciple] = useState<Principle | "all">("all");
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [filterStatus, setFilterStatus] = useState<CriterionStatus | "all">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStatuses(new Map(JSON.parse(saved)));
    } catch {}
  }, []);

  const setStatus = (id: string, status: CriterionStatus) => {
    setStatuses((prev) => {
      const next = new Map(prev);
      if (next.get(id) === status) {
        next.delete(id); // clicking same state resets to pending
      } else {
        next.set(id, status);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const reset = () => {
    setStatuses(new Map());
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const filtered = useMemo(() => {
    return criteria.filter((c) => {
      if (filterLevel !== "all" && c.level !== filterLevel) return false;
      if (filterPrinciple !== "all" && c.principle !== filterPrinciple) return false;
      if (showOnlyNew && !c.new22) return false;
      if (filterStatus !== "all") {
        const s = statuses.get(c.id) ?? "pending";
        if (s !== filterStatus) return false;
      }
      return true;
    });
  }, [filterLevel, filterPrinciple, showOnlyNew, filterStatus, statuses]);

  const stats = useMemo(() => {
    const total = criteria.length;
    const pass = [...statuses.values()].filter((s) => s === "pass").length;
    const fail = [...statuses.values()].filter((s) => s === "fail").length;
    const na = [...statuses.values()].filter((s) => s === "na").length;
    const reviewed = pass + fail + na;
    return { total, pass, fail, na, reviewed, percent: total > 0 ? Math.round((reviewed / total) * 100) : 0 };
  }, [statuses]);

  const exportMarkdown = () => {
    const statusIcon: Record<CriterionStatus, string> = { pass: "✓ Pass", fail: "✗ Fail", na: "— N/A", pending: "  Pending" };
    const lines = [
      "# WCAG 2.2 Compliance Audit",
      "",
      `Date: ${new Date().toISOString().split("T")[0]}`,
      `Pass: ${stats.pass} | Fail: ${stats.fail} | N/A: ${stats.na} | Pending: ${stats.total - stats.reviewed}`,
      "",
    ];
    for (const c of criteria) {
      const s = statuses.get(c.id) ?? "pending";
      lines.push(`- [${statusIcon[s]}] **${c.id} ${c.title}** (Level ${c.level})${c.new22 ? " 🆕" : ""}`);
      lines.push(`  ${c.description}`);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wcag-2.2-audit.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = {
      standard: "WCAG 2.2",
      date: new Date().toISOString(),
      summary: { pass: stats.pass, fail: stats.fail, na: stats.na, pending: stats.total - stats.reviewed, total: stats.total },
      criteria: criteria.map((c) => ({
        id: c.id,
        title: c.title,
        level: c.level,
        principle: c.principle,
        status: statuses.get(c.id) ?? "pending",
        new22: c.new22 || false,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wcag-2.2-audit.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!mounted) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Loading checklist...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Pass", value: stats.pass, cls: "bg-green-50 border-green-200 text-green-800" },
              { label: "Fail", value: stats.fail, cls: "bg-red-50 border-red-200 text-red-700" },
              { label: "N/A", value: stats.na, cls: "bg-slate-50 border-slate-200 text-slate-700" },
              { label: "Pending", value: stats.total - stats.reviewed, cls: "bg-amber-50 border-amber-200 text-amber-700" },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`rounded-lg border px-4 py-3 text-center ${cls}`}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportMarkdown} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4" aria-hidden="true" /> Markdown
            </button>
            <button onClick={exportJSON} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4" aria-hidden="true" /> JSON
            </button>
            <button onClick={reset} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" aria-label="Reset all">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="flex h-full rounded-full overflow-hidden">
            <div className="bg-green-500 h-full transition-all" style={{ width: `${stats.total > 0 ? (stats.pass / stats.total) * 100 : 0}%` }} />
            <div className="bg-red-400 h-full transition-all" style={{ width: `${stats.total > 0 ? (stats.fail / stats.total) * 100 : 0}%` }} />
            <div className="bg-slate-300 h-full transition-all" style={{ width: `${stats.total > 0 ? (stats.na / stats.total) * 100 : 0}%` }} />
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-400">{stats.reviewed}/{stats.total} criteria reviewed ({stats.percent}%)</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label htmlFor="filter-level" className="sr-only">Filter by level</label>
          <select id="filter-level" value={filterLevel} onChange={(e) => setFilterLevel(e.target.value as Level | "all")} className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500">
            <option value="all">All Levels</option>
            <option value="A">Level A</option>
            <option value="AA">Level AA</option>
            <option value="AAA">Level AAA</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-principle" className="sr-only">Filter by principle</label>
          <select id="filter-principle" value={filterPrinciple} onChange={(e) => setFilterPrinciple(e.target.value as Principle | "all")} className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500">
            <option value="all">All Principles</option>
            <option value="Perceivable">Perceivable</option>
            <option value="Operable">Operable</option>
            <option value="Understandable">Understandable</option>
            <option value="Robust">Robust</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-status" className="sr-only">Filter by status</label>
          <select id="filter-status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as CriterionStatus | "all")} className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500">
            <option value="all">All Statuses</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
            <option value="na">N/A</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={showOnlyNew} onChange={(e) => setShowOnlyNew(e.target.checked)} className="rounded border-slate-300" />
          Only WCAG 2.2 new criteria
        </label>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {filtered.map((c) => {
          const status: CriterionStatus = statuses.get(c.id) ?? "pending";
          const rowBg =
            status === "pass" ? "border-green-200 bg-green-50" :
            status === "fail" ? "border-red-200 bg-red-50" :
            status === "na"   ? "border-slate-200 bg-slate-50" :
            "border-slate-200 bg-white";
          return (
            <div key={c.id} className={`rounded-lg border p-4 transition ${rowBg}`}>
              <div className="flex items-start gap-4">
                {/* Three-state buttons */}
                <div className="flex items-center gap-1 mt-0.5 flex-shrink-0" role="group" aria-label={`Status for ${c.id}`}>
                  <button
                    type="button"
                    onClick={() => setStatus(c.id, "pass")}
                    aria-pressed={status === "pass"}
                    aria-label="Pass"
                    className={`rounded-md p-1.5 transition-colors ${
                      status === "pass"
                        ? "bg-green-600 text-white"
                        : "text-slate-400 hover:text-green-600 hover:bg-green-50"
                    }`}
                  >
                    <CheckCircle className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(c.id, "fail")}
                    aria-pressed={status === "fail"}
                    aria-label="Fail"
                    className={`rounded-md p-1.5 transition-colors ${
                      status === "fail"
                        ? "bg-red-600 text-white"
                        : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <XCircle className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(c.id, "na")}
                    aria-pressed={status === "na"}
                    aria-label="Not applicable"
                    className={`rounded-md p-1.5 transition-colors ${
                      status === "na"
                        ? "bg-slate-500 text-white"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <MinusCircle className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-slate-900">{c.id}</span>
                    <span className="text-sm font-semibold text-slate-900">{c.title}</span>
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      c.level === "A" ? "bg-red-100 text-red-700" :
                      c.level === "AA" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                    }`}>{c.level}</span>
                    {c.new22 && <span className="rounded bg-teal-100 px-1.5 py-0.5 text-xs font-medium text-teal-700">WCAG 2.2 NEW</span>}
                    {status !== "pending" && (
                      <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                        status === "pass" ? "bg-green-600 text-white" :
                        status === "fail" ? "bg-red-600 text-white" : "bg-slate-500 text-white"
                      }`}>
                        {status === "pass" ? "✓ Pass" : status === "fail" ? "✗ Fail" : "— N/A"}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{c.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          No criteria match the current filters.
        </div>
      )}
    </div>
  );
}
