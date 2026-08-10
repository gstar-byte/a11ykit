"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle, Info, Download } from "lucide-react";

/* ─── Issue types ─────────────────────────────────────────────── */

interface Issue {
  type: "error" | "warning" | "info";
  element: string;
  message: string;
  wcag: string;
  fix: string;
}

/* ─── Selectors ───────────────────────────────────────────────── */

const INPUT_SELECTORS = "input:not([type=hidden]):not([type=button]):not([type=submit]):not([type=reset]), textarea, select";

function getLabel(el: Element, doc: Document): string {
  const id = el.getAttribute("id");
  if (id) {
    const label = doc.querySelector(`label[for="${id}"]`);
    if (label) return label.textContent?.trim() || "";
  }
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel;
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const ref = doc.getElementById(labelledBy);
    if (ref) return ref.textContent?.trim() || "";
  }
  const type = el.getAttribute("type") || el.tagName.toLowerCase();
  const name = el.getAttribute("name") || el.getAttribute("id") || type;
  return `<${el.tagName.toLowerCase()}> (${name})`;
}

function getInputIdentifier(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const name = el.getAttribute("name") ? `[name="${el.getAttribute("name")}"]` : "";
  const type = el.getAttribute("type") ? `[type="${el.getAttribute("type")}"]` : "";
  return `<${tag}${id}${name}${type}>`;
}

/* ─── Analysis ────────────────────────────────────────────────── */

function analyzeForm(html: string): Issue[] {
  if (!html.trim()) return [];
  const issues: Issue[] = [];

  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(html, "text/html");
  } catch {
    return [{ type: "error", element: "HTML", message: "Could not parse HTML.", wcag: "", fix: "" }];
  }

  const inputs = Array.from(doc.querySelectorAll(INPUT_SELECTORS));

  if (inputs.length === 0) {
    return [{ type: "info", element: "—", message: "No form inputs found. Paste HTML with <input>, <textarea>, or <select> elements.", wcag: "", fix: "" }];
  }

  /* ── Check each input ─────────────────────────────────────── */

  for (const input of inputs) {
    const id = getInputIdentifier(input);
    const labelText = getLabel(input, doc);

    // 1. Missing accessible name
    const hasId = !!input.id;
    const hasAriaLabel = !!input.getAttribute("aria-label");
    const hasAriaLabelledby = !!input.getAttribute("aria-labelledby");
    const hasForLabel = hasId && !!doc.querySelector(`label[for="${input.id}"]`);
    const isWrappedInLabel = !!input.closest("label");

    if (!hasAriaLabel && !hasAriaLabelledby && !hasForLabel && !isWrappedInLabel) {
      issues.push({
        type: "error",
        element: id,
        message: `Input has no accessible name. Add a <label for="..."> or aria-label attribute.`,
        wcag: "1.3.1, 3.3.2",
        fix: `<label for="${input.id || "input-id"}">Field label</label>\n<input id="${input.id || "input-id"}" ... >`,
      });
    }

    // 2. Check aria-required vs required
    const hasRequired = input.hasAttribute("required");
    const hasAriaRequired = input.getAttribute("aria-required");
    if (hasRequired && !hasAriaRequired) {
      // This is OK — required implies aria-required=true, but flagging for awareness
      // Don't flag this as error, just info
    }

    // 3. Check for aria-describedby pointing to error message
    const describedBy = input.getAttribute("aria-describedby");
    let hasErrorDescription = false;
    if (describedBy) {
      const ids = describedBy.split(/\s+/);
      for (const refId of ids) {
        const ref = doc.getElementById(refId);
        if (ref) {
          const role = ref.getAttribute("role");
          const text = ref.textContent?.toLowerCase() || "";
          const looksLikeError = role === "alert" || role === "status" ||
            ref.className.toLowerCase().includes("error") ||
            ref.className.toLowerCase().includes("invalid") ||
            text.includes("error") || text.includes("invalid") || text.includes("required");
          if (looksLikeError) hasErrorDescription = true;
        }
      }
    }

    // 4. Check for error elements without aria-describedby linkage
    const inputId = input.id;
    if (inputId) {
      // Look for elements that reference this input's errors
      const errorEls = doc.querySelectorAll(`[id*="${inputId}"][id*="error"], [id*="${inputId}"][id*="invalid"], [id*="error-${inputId}"], [id*="${inputId}-error"]`);
      if (errorEls.length > 0) {
        // Check if input references them via aria-describedby
        const described = describedBy?.split(/\s+/) || [];
        for (const errEl of Array.from(errorEls)) {
          if (errEl.id && !described.includes(errEl.id)) {
            issues.push({
              type: "error",
              element: id,
              message: `Found error element #${errEl.id} but input is not linked to it via aria-describedby. Screen readers won't announce this error.`,
              wcag: "3.3.1",
              fix: `<input aria-describedby="${errEl.id}" ... >\n<span id="${errEl.id}" role="alert">Error message here</span>`,
            });
          }
        }
      }
    }

    // 5. Autocomplete for common fields
    const name = input.getAttribute("name")?.toLowerCase() || "";
    const type = input.getAttribute("type")?.toLowerCase() || "text";
    const autocomplete = input.getAttribute("autocomplete");
    const sensitiveNames = ["email", "password", "tel", "phone", "name", "address", "postcode", "zip", "credit", "card", "cvv"];
    const isSensitive = sensitiveNames.some((s) => name.includes(s));
    if (isSensitive && !autocomplete) {
      issues.push({
        type: "warning",
        element: id,
        message: `Field "${labelText || name}" may benefit from autocomplete="${type === "email" ? "email" : type === "tel" ? "tel" : name}" to help users with cognitive or motor disabilities.`,
        wcag: "1.3.5",
        fix: `<input autocomplete="${type === "email" ? "email" : "name"}" ... >`,
      });
    }
  }

  /* ── Check form-level patterns ───────────────────────────── */

  // Error messages that use only color
  const colorOnlyErrors = doc.querySelectorAll(".error, .invalid, [class*='error'], [class*='invalid']");
  for (const errEl of Array.from(colorOnlyErrors)) {
    const hasIcon = errEl.querySelector("svg, img, [aria-label], [role='img']");
    const hasText = (errEl.textContent?.trim().length ?? 0) > 0;
    const role = errEl.getAttribute("role");
    if (!hasText && !hasIcon) continue;
    if (!role || (role !== "alert" && role !== "status")) {
      issues.push({
        type: "warning",
        element: errEl.tagName.toLowerCase() + (errEl.className ? `.${errEl.className.split(" ")[0]}` : ""),
        message: `Error element found without role="alert". Screen readers may not announce it when it appears dynamically.`,
        wcag: "3.3.1",
        fix: `<span role="alert" aria-live="assertive">Error message</span>`,
      });
      break; // one warning per form is enough
    }
  }

  // Check for aria-live on error containers
  const alertEls = doc.querySelectorAll('[role="alert"], [role="status"], [aria-live]');
  if (alertEls.length === 0 && colorOnlyErrors.length > 0) {
    issues.push({
      type: "warning",
      element: "form",
      message: "No aria-live regions found. Error messages that appear dynamically must use aria-live or role='alert' to notify screen reader users.",
      wcag: "3.3.1, 4.1.3",
      fix: `<div role="alert" aria-live="assertive" id="form-error-summary">\n  <!-- Error messages go here -->\n</div>`,
    });
  }

  // Error summary pattern (recommended for forms with many fields)
  const hasErrorSummary = doc.querySelector('[id*="error-summary"], [class*="error-summary"], [aria-label*="error"]');
  const totalInputs = inputs.length;
  if (totalInputs >= 4 && !hasErrorSummary) {
    issues.push({
      type: "info",
      element: "form",
      message: `Form has ${totalInputs} fields. Consider adding an error summary block at the top of the form to list all validation errors at once (WCAG best practice and UK GDS recommendation).`,
      wcag: "3.3.1",
      fix: `<div id="error-summary" role="alert" aria-labelledby="error-summary-title">\n  <h2 id="error-summary-title">There is a problem</h2>\n  <ul>\n    <li><a href="#email">Enter a valid email address</a></li>\n  </ul>\n</div>`,
    });
  }

  // Fieldset for radio/checkbox groups
  const radioGroups = new Map<string, Element[]>();
  doc.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach((el) => {
    const name = el.getAttribute("name") || "_ungrouped";
    if (!radioGroups.has(name)) radioGroups.set(name, []);
    radioGroups.get(name)!.push(el);
  });
  radioGroups.forEach((els, name) => {
    if (els.length > 1) {
      const isInFieldset = els.some((el) => !!el.closest("fieldset"));
      if (!isInFieldset) {
        issues.push({
          type: "error",
          element: `input[name="${name}"] group`,
          message: `Group of ${els.length} radio/checkbox inputs (name="${name}") is not inside a <fieldset>. Group label will not be announced by screen readers.`,
          wcag: "1.3.1, 3.3.2",
          fix: `<fieldset>\n  <legend>Choose an option</legend>\n  <input type="radio" name="${name}" id="opt1" />\n  <label for="opt1">Option 1</label>\n</fieldset>`,
        });
      }
    }
  });

  if (issues.length === 0) {
    issues.push({
      type: "info",
      element: "—",
      message: `✓ No obvious accessibility issues found in ${inputs.length} input(s). Note: some issues (e.g., error state CSS, JS-driven announcements) require runtime testing.`,
      wcag: "",
      fix: "",
    });
  }

  return issues;
}

/* ─── Sample HTML ─────────────────────────────────────────────── */

const sampleBad = `<form>
  <div>
    <!-- Missing label -->
    <input type="email" id="email" name="email" required />
    <div class="error">Please enter a valid email</div>
  </div>
  <div>
    <label for="name">Full name</label>
    <input type="text" id="name" name="name" />
  </div>
  <!-- Radio group without fieldset -->
  <input type="radio" name="plan" id="free" value="free" />
  <label for="free">Free</label>
  <input type="radio" name="plan" id="pro" value="pro" />
  <label for="pro">Pro</label>
  <button type="submit">Submit</button>
</form>`;

const sampleGood = `<form>
  <div id="error-summary" role="alert" aria-labelledby="error-summary-title" hidden>
    <h2 id="error-summary-title">There is a problem</h2>
    <ul><li><a href="#email">Enter a valid email address</a></li></ul>
  </div>
  <div>
    <label for="email">Email address</label>
    <input
      type="email"
      id="email"
      name="email"
      required
      autocomplete="email"
      aria-describedby="email-error"
    />
    <span id="email-error" role="alert">Please enter a valid email</span>
  </div>
  <div>
    <label for="name">Full name</label>
    <input type="text" id="name" name="name" autocomplete="name" />
  </div>
  <fieldset>
    <legend>Select a plan</legend>
    <input type="radio" name="plan" id="free" value="free" />
    <label for="free">Free</label>
    <input type="radio" name="plan" id="pro" value="pro" />
    <label for="pro">Pro</label>
  </fieldset>
  <button type="submit">Submit</button>
</form>`;

/* ─── Component ───────────────────────────────────────────────── */

export function FormErrorChecker() {
  const [html, setHtml] = useState("");

  const issues = useMemo(() => analyzeForm(html), [html]);

  const errors = issues.filter((i) => i.type === "error");
  const warnings = issues.filter((i) => i.type === "warning");
  const infos = issues.filter((i) => i.type === "info");

  function downloadReport() {
    const lines = issues.map(
      (i) => `[${i.type.toUpperCase()}] ${i.element}\n${i.message}\nWCAG: ${i.wcag || "—"}\n`
    );
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "form-error-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">WCAG 3.3.1 / 3.3.2 — Error Identification &amp; Labels</p>
          <p className="mt-0.5">
            Form errors must be identified and described to the user in text. This tool checks for
            missing labels, unlinked error messages, missing <code className="text-xs bg-blue-100 px-1 rounded">role="alert"</code>,
            and missing <code className="text-xs bg-blue-100 px-1 rounded">aria-describedby</code> links.
          </p>
        </div>
      </div>

      {/* Input */}
      <div>
        <label htmlFor="form-html" className="block text-sm font-semibold text-slate-700 mb-2">
          Paste your form HTML
        </label>
        <textarea
          id="form-html"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-4 font-mono text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          rows={10}
          placeholder="Paste your <form> HTML here…"
        />
        <div className="mt-2 flex flex-wrap gap-3">
          <button type="button" onClick={() => setHtml(sampleBad)} className="text-sm text-teal-700 hover:text-teal-600 font-medium">
            Load problematic example
          </button>
          <button type="button" onClick={() => setHtml(sampleGood)} className="text-sm text-slate-500 hover:text-slate-700 font-medium">
            Load accessible example
          </button>
        </div>
      </div>

      {html.trim() && issues.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`rounded-xl border p-4 text-center ${errors.length > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
              <p className={`text-3xl font-bold ${errors.length > 0 ? "text-red-700" : "text-slate-900"}`}>{errors.length}</p>
              <p className={`text-sm mt-0.5 ${errors.length > 0 ? "text-red-600" : "text-slate-600"}`}>Errors</p>
            </div>
            <div className={`rounded-xl border p-4 text-center ${warnings.length > 0 ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
              <p className={`text-3xl font-bold ${warnings.length > 0 ? "text-amber-700" : "text-slate-900"}`}>{warnings.length}</p>
              <p className={`text-sm mt-0.5 ${warnings.length > 0 ? "text-amber-600" : "text-slate-600"}`}>Warnings</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-3xl font-bold text-slate-900">{infos.length}</p>
              <p className="text-sm text-slate-600 mt-0.5">Info</p>
            </div>
          </div>

          {/* Issues */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Analysis Results</h3>
              <button
                type="button"
                onClick={downloadReport}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Download report
              </button>
            </div>
            <ul className="space-y-5">
              {issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-3">
                  {issue.type === "error" && <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />}
                  {issue.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />}
                  {issue.type === "info" && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />}
                  <div className="flex-1">
                    <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">{issue.element}</code>
                    <p className={`mt-1 text-sm font-medium ${issue.type === "error" ? "text-red-700" : issue.type === "warning" ? "text-amber-700" : "text-green-700"}`}>
                      {issue.message}
                    </p>
                    {issue.wcag && (
                      <p className="text-xs text-slate-400 mt-0.5">WCAG SC {issue.wcag}</p>
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
    </div>
  );
}
