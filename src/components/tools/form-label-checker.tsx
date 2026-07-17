"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface FormIssue {
  type: "error" | "warning" | "info";
  message: string;
  wcag?: string;
}

const sampleHTML = `<form>
  <label>Name: <input type="text" name="name" /></label>
  <input type="email" name="email" placeholder="Email" />
  <fieldset>
    <legend>Gender</legend>
    <label><input type="radio" name="gender" value="m" /> Male</label>
    <label><input type="radio" name="gender" value="f" /> Female</label>
  </fieldset>
  <button>Submit</button>
</form>`;

export function FormLabelChecker() {
  const [html, setHtml] = useState("");

  const { issues, stats } = useMemo(() => {
    if (!html.trim()) return { issues: [] as FormIssue[], stats: { inputs: 0, labels: 0, fieldsets: 0 } };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const foundIssues: FormIssue[] = [];

    const inputs = Array.from(doc.querySelectorAll("input, select, textarea"));
    const labels = Array.from(doc.querySelectorAll("label"));
    const fieldsets = Array.from(doc.querySelectorAll("fieldset"));

    inputs.forEach((input, i) => {
      const inputType = input.getAttribute("type") || "text";
      if (inputType === "hidden" || inputType === "submit" || inputType === "button" || inputType === "reset") return;

      const id = input.getAttribute("id");
      const ariaLabel = input.getAttribute("aria-label");
      const ariaLabelledBy = input.getAttribute("aria-labelledby");
      const title = input.getAttribute("title");

      let hasLabel = false;

      if (id) {
        const matchingLabel = labels.find((l) => l.getAttribute("for") === id);
        if (matchingLabel) hasLabel = true;
      }

      if (!hasLabel) {
        let parent = input.parentElement;
        while (parent) {
          if (parent.tagName === "LABEL") {
            hasLabel = true;
            break;
          }
          parent = parent.parentElement;
        }
      }

      if (!hasLabel && ariaLabel) hasLabel = true;
      if (!hasLabel && ariaLabelledBy) hasLabel = true;
      if (!hasLabel && title) {
        foundIssues.push({
          type: "warning",
          message: `Input #${i + 1} (type="${inputType}") uses only title attribute for labeling. title is not a sufficient accessible name.`,
          wcag: "4.1.2",
        });
        hasLabel = true;
      }

      if (!hasLabel) {
        foundIssues.push({
          type: "error",
          message: `Input #${i + 1} (type="${inputType}") has no associated label. Use <label for="...">, aria-label, or wrap in <label>.`,
          wcag: "1.3.1 / 3.3.2 / 4.1.2",
        });
      }

      if (inputType === "checkbox" || inputType === "radio") {
        const name = input.getAttribute("name");
        if (!name) {
          foundIssues.push({
            type: "warning",
            message: `${inputType} input #${i + 1} has no name attribute. Related ${inputType}s should share a name.`,
            wcag: "1.3.1",
          });
        }
      }
    });

    labels.forEach((label, i) => {
      const forAttr = label.getAttribute("for");
      if (forAttr) {
        const target = doc.getElementById(forAttr);
        if (!target) {
          foundIssues.push({
            type: "error",
            message: `Label #${i + 1} has for="${forAttr}" but no element with that id exists.`,
            wcag: "1.3.1",
          });
        }
      } else {
        const wrappedInput = label.querySelector("input, select, textarea");
        if (!wrappedInput) {
          foundIssues.push({
            type: "warning",
            message: `Label #${i + 1} has no for attribute and doesn't wrap any form control.`,
            wcag: "1.3.1",
          });
        }
      }
    });

    fieldsets.forEach((fs, i) => {
      const legend = fs.querySelector("legend");
      if (!legend || !legend.textContent?.trim()) {
        foundIssues.push({
          type: "warning",
          message: `Fieldset #${i + 1} has no legend element. Grouped form controls should have a descriptive legend.`,
          wcag: "1.3.1",
        });
      }
    });

    const buttons = Array.from(doc.querySelectorAll("button"));
    buttons.forEach((btn, i) => {
      if (!btn.textContent?.trim() && !btn.getAttribute("aria-label") && !btn.getAttribute("aria-labelledby")) {
        foundIssues.push({
          type: "error",
          message: `Button #${i + 1} has no accessible name (no text content or aria-label).`,
          wcag: "4.1.2",
        });
      }
    });

    if (foundIssues.length === 0) {
      foundIssues.push({
        type: "info",
        message: "No form accessibility issues found. All form controls appear to have proper labels.",
      });
    }

    return {
      issues: foundIssues,
      stats: { inputs: inputs.length, labels: labels.length, fieldsets: fieldsets.length },
    };
  }, [html]);

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warningCount = issues.filter((i) => i.type === "warning").length;

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="form-html-input" className="block text-sm font-semibold text-slate-700 mb-2">
          Paste your HTML form
        </label>
        <textarea
          id="form-html-input"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-4 font-mono text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          rows={8}
          placeholder={sampleHTML}
        />
        <button
          type="button"
          onClick={() => setHtml(sampleHTML)}
          className="mt-2 text-sm text-teal-700 hover:text-teal-600 font-medium"
        >
          Load sample HTML
        </button>
      </div>

      {html.trim() && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-3xl font-bold text-slate-900">{stats.inputs}</p>
              <p className="text-sm text-slate-600">Inputs</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-3xl font-bold text-slate-900">{stats.labels}</p>
              <p className="text-sm text-slate-600">Labels</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{errorCount}</p>
              <p className="text-sm text-red-600">Errors</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-700">{warningCount}</p>
              <p className="text-sm text-amber-600">Warnings</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Issues Found</h3>
            <ul className="space-y-3">
              {issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-3">
                  {issue.type === "error" && (
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  {issue.type === "warning" && (
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  {issue.type === "info" && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div>
                    <p className={`text-sm ${issue.type === "error" ? "text-red-700" : issue.type === "warning" ? "text-amber-700" : "text-green-700"}`}>
                      {issue.message}
                    </p>
                    {issue.wcag && (
                      <p className="text-xs text-slate-500 mt-0.5">WCAG {issue.wcag}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
