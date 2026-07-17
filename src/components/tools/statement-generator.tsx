"use client";

import { useState, useMemo, useEffect } from "react";
import { Copy, Check, Download, Award, FileText, FileCode, Upload, Sparkles, Loader2, Key } from "lucide-react";
import { downloadFile } from "@/lib/export-utils";

type Regulation = "EAA" | "ADA" | "Section508" | "AODA" | "Generic";
type TemplateType = "basic" | "comprehensive" | "legal" | "developer";

const templateLabels: Record<TemplateType, string> = {
  basic: "Basic — minimal compliance statement",
  comprehensive: "Comprehensive — full W3C WAI template",
  legal: "Legal-focused — enforcement & complaint details",
  developer: "Developer-friendly — technical specs & testing",
};

function htmlToMarkdown(html: string): string {
  let md = html;
  md = md.replace(/<section[^>]*>/g, "");
  md = md.replace(/<\/section>/g, "");
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/g, "# $1\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/g, "\n## $1\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/g, "\n### $1\n");
  md = md.replace(/<strong>(.*?)<\/strong>/g, "**$1**");
  md = md.replace(/<em>(.*?)<\/em>/g, "*$1*");
  md = md.replace(/<a href="([^"]*)">(.*?)<\/a>/g, "[$2]($1)");
  md = md.replace(/<ul>/g, "");
  md = md.replace(/<\/ul>/g, "");
  md = md.replace(/<li>(.*?)<\/li>/g, "- $1");
  md = md.replace(/<p>(.*?)<\/p>/g, "$1\n");
  md = md.replace(/<br\s*\/?>/g, "");
  md = md.replace(/<[^>]+>/g, "");
  md = md.replace(/\n{3,}/g, "\n\n");
  return md.trim();
}

function htmlToText(html: string): string {
  let text = html;
  text = text.replace(/<section[^>]*>/g, "");
  text = text.replace(/<\/section>/g, "");
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/g, "$1\n" + "=".repeat(40) + "\n");
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/g, "\n$1\n" + "-".repeat(40) + "\n");
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/g, "\n$1\n");
  text = text.replace(/<strong>(.*?)<\/strong>/g, "$1");
  text = text.replace(/<em>(.*?)<\/em>/g, "$1");
  text = text.replace(/<a href="([^"]*)">(.*?)<\/a>/g, "$2 ($1)");
  text = text.replace(/<ul>/g, "");
  text = text.replace(/<\/ul>/g, "");
  text = text.replace(/<li>(.*?)<\/li>/g, "  * $1");
  text = text.replace(/<p>(.*?)<\/p>/g, "$1\n");
  text = text.replace(/<br\s*\/?>/g, "");
  text = text.replace(/<[^>]+>/g, "");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

interface FormData {
  orgName: string;
  orgUrl: string;
  regulation: Regulation;
  conformanceLevel: "A" | "AA" | "AAA";
  contactEmail: string;
  contactPhone: string;
  contactForm: string;
  knownLimitations: string;
  measuresTaken: string;
  approvalDate: string;
  reviewDate: string;
}

const regulationLabels: Record<Regulation, string> = {
  EAA: "European Accessibility Act (EU)",
  ADA: "ADA (United States)",
  Section508: "Section 508 (US Federal)",
  AODA: "AODA (Ontario, Canada)",
  Generic: "Generic / WCAG",
};

export function StatementGenerator() {
  const [form, setForm] = useState<FormData>({
    orgName: "",
    orgUrl: "",
    regulation: "EAA",
    conformanceLevel: "AA",
    contactEmail: "",
    contactPhone: "",
    contactForm: "",
    knownLimitations: "",
    measuresTaken: "",
    approvalDate: new Date().toISOString().split("T")[0],
    reviewDate: "",
  });
  const [copied, setCopied] = useState(false);
  const [template, setTemplate] = useState<TemplateType>("comprehensive");
  const [scanResults, setScanResults] = useState<{ url: string; title: string; issues: { type: string; message: string; wcag?: string }[]; date: string }[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("a11ykit-scan-results") || "[]");
      setScanResults(stored);
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const handleImportScan = (idx: number) => {
    const scan = scanResults[idx];
    if (!scan) return;
    const errors = scan.issues.filter((i) => i.type === "error");
    const warnings = scan.issues.filter((i) => i.type === "warning");
    const limitations = [
      ...errors.map((e) => e.message),
      ...warnings.map((w) => w.message),
    ];
    setForm((prev) => ({
      ...prev,
      orgUrl: scan.url,
      knownLimitations: limitations.length > 0 ? limitations.join("\n") : "No significant accessibility issues were found during automated scanning.",
    }));
  };

  const handleAiGenerate = async () => {
    if (!apiKey.trim()) {
      setAiError("Please enter your OpenAI API key.");
      return;
    }
    if (!form.orgName.trim()) {
      setAiError("Please enter your organization name first.");
      return;
    }
    setAiError("");
    setAiGenerating(true);

    try {
      const scanContext = scanResults.length > 0
        ? `\n\nPrevious scan results for ${scanResults[0].url}:\n${scanResults[0].issues.filter((i) => i.type === "error" || i.type === "warning").map((i) => `- ${i.message}`).join("\n")}`
        : "";

      const prompt = `You are an accessibility consultant. Generate content for an accessibility statement for "${form.orgName}" (website: ${form.orgUrl || "N/A"}, regulation: ${regulationLabels[form.regulation]}, conformance: WCAG 2.2 Level ${form.conformanceLevel}).${scanContext}\n\nReturn ONLY a JSON object with two keys:\n- "measuresTaken": array of 5-8 strings, each a concrete accessibility measure taken\n- "knownLimitations": array of 2-4 strings, each a realistic known limitation\n\nDo not include any text outside the JSON.`;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setAiError(err?.error?.message || `API error: ${res.status}`);
        setAiGenerating(false);
        return;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        setAiError("AI response was not valid JSON. Try again.");
        setAiGenerating(false);
        return;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      setForm((prev) => ({
        ...prev,
        measuresTaken: Array.isArray(parsed.measuresTaken) ? parsed.measuresTaken.join("\n") : prev.measuresTaken,
        knownLimitations: Array.isArray(parsed.knownLimitations) ? parsed.knownLimitations.join("\n") : prev.knownLimitations,
      }));
    } catch {
      setAiError("Network error. Check your API key and connection.");
    }
    setAiGenerating(false);
  };

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const generatedHtml = useMemo(() => {
    const reg = regulationLabels[form.regulation];
    const org = escapeHtml(form.orgName || "[Organization Name]");
    const measuresHtml = form.measuresTaken
      ? form.measuresTaken
          .split("\n")
          .filter((l) => l.trim())
          .map((l) => `      <li>${escapeHtml(l.trim())}</li>`)
          .join("\n")
      : "      <li>Regular accessibility audits using automated and manual testing</li>\n      <li>Staff training on accessible content creation</li>\n      <li>Continuous monitoring and remediation of accessibility issues";

    const limitationsHtml = form.knownLimitations
      ? form.knownLimitations
          .split("\n")
          .filter((l) => l.trim())
          .map((l) => `      <li>${escapeHtml(l.trim())}</li>`)
          .join("\n")
      : "      <li>Some archived documents may not be fully accessible";

    const contactParts: string[] = [];
    if (form.contactEmail)
      contactParts.push(`      <p>Email: <a href="mailto:${escapeHtml(form.contactEmail)}">${escapeHtml(form.contactEmail)}</a></p>`);
    if (form.contactPhone)
      contactParts.push(`      <p>Phone: ${escapeHtml(form.contactPhone)}</p>`);
    if (form.contactForm)
      contactParts.push(`      <p>Contact form: <a href="${escapeHtml(form.contactForm)}">${escapeHtml(form.contactForm)}</a></p>`);
    const contactHtml = contactParts.join("\n") || "      <p>Please provide contact information.</p>";

    const dateLine = `<p><strong>Date of statement:</strong> ${escapeHtml(form.approvalDate)}${form.reviewDate ? ` (last reviewed: ${escapeHtml(form.reviewDate)})` : ""}</p>`;
    const commitmentSection = `  <h2>Commitment to Accessibility</h2>\n  <p>${org} is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.</p>`;
    const conformanceSection = `  <h2>Conformance Status</h2>\n  <p>This website aims to conform to <strong>WCAG 2.2 Level ${form.conformanceLevel}</strong>. These guidelines explain how to make web content more accessible to people with disabilities. Conformance to these guidelines helps make the web a more inclusive space for all users.</p>\n  <p>The applicable regulatory framework is the <strong>${reg}</strong>.</p>`;
    const measuresSection = `  <h2>Measures Taken</h2>\n  <p>We have taken the following measures to ensure accessibility of ${org}:</p>\n  <ul>\n${measuresHtml}\n  </ul>`;
    const limitationsSection = `  <h2>Known Limitations</h2>\n  <p>Despite our efforts, there may be some limitations:</p>\n  <ul>\n${limitationsHtml}\n  </ul>\n  <p>If you find an accessibility issue that is not listed above, please contact us so we can address it.</p>`;
    const contactSection = `  <h2>Contact Us</h2>\n  <p>If you encounter any accessibility barriers on our website or have any questions, please contact us:</p>\n${contactHtml}\n  <p>We aim to respond to accessibility feedback within 5 business days and to propose a solution or remediation plan within 10 business days.</p>`;
    const techSection = `  <h2>Technical Specifications</h2>\n  <p>Accessibility of this website relies on the following technologies to work with the particular combination of web browser and any assistive technologies or plugins that you have installed:</p>\n  <ul>\n    <li>HTML5</li>\n    <li>WAI-ARIA 1.2</li>\n    <li>CSS3</li>\n    <li>JavaScript</li>\n  </ul>\n  <p>These technologies are relied upon for conformance with the accessibility standards used.</p>`;
    const assessmentSection = `  <h2>Assessment Approach</h2>\n  <p>${org} assessed the accessibility of this website using the following methods:</p>\n  <ul>\n    <li>Self-evaluation using automated accessibility testing tools</li>\n    <li>Manual evaluation by trained accessibility staff</li>\n    <li>User testing with assistive technology users</li>\n  </ul>`;
    const complaintsSection = `  <h2>Formal Complaints</h2>\n  <p>If you are not satisfied with our response to your accessibility concern, you may file a formal complaint through the relevant enforcement authority in your jurisdiction.</p>`;

    let body = "";
    if (template === "basic") {
      body = [
        commitmentSection,
        conformanceSection,
        contactSection,
      ].join("\n\n");
    } else if (template === "legal") {
      body = [
        commitmentSection,
        conformanceSection,
        limitationsSection,
        contactSection,
        `  <h2>Enforcement Procedure</h2>\n  <p>Under the ${reg}, if you are not satisfied with our response to your accessibility concern, you may file a formal complaint with the relevant enforcement authority.</p>\n  <ul>\n    <li><strong>EAA:</strong> National enforcement body in your EU member state</li>\n    <li><strong>ADA:</strong> U.S. Department of Justice, Civil Rights Division</li>\n    <li><strong>Section 508:</strong> U.S. Access Board</li>\n    <li><strong>AODA:</strong> Accessibility Directorate of Ontario</li>\n  </ul>\n  <p>Retaliation against individuals who file accessibility complaints is prohibited.</p>`,
      ].join("\n\n");
    } else if (template === "developer") {
      body = [
        `  <h2>Conformance Status</h2>\n  <p>This website aims to conform to <strong>WCAG 2.2 Level ${form.conformanceLevel}</strong>.</p>`,
        techSection,
        `  <h2>Testing & Validation</h2>\n  <p>Our development workflow includes:</p>\n  <ul>\n    <li>Automated testing with axe-core and Lighthouse CI in pull requests</li>\n    <li>Keyboard navigation testing on all interactive components</li>\n    <li>Screen reader testing with NVDA, JAWS, and VoiceOver</li>\n    <li>Color contrast verification at AA/AAA levels</li>\n    <li>Reduced motion and prefers-reduced-s media query support</li>\n  </ul>`,
        assessmentSection,
        contactSection,
      ].join("\n\n");
    } else {
      body = [
        commitmentSection,
        conformanceSection,
        measuresSection,
        limitationsSection,
        contactSection,
        techSection,
        assessmentSection,
        complaintsSection,
      ].join("\n\n");
    }

    return `<section aria-labelledby="a11y-statement-heading">
  <h1 id="a11y-statement-heading">Accessibility Statement for ${org}</h1>

  ${dateLine}

${body}
</section>`;
  }, [form, template]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadFile(generatedHtml, "accessibility-statement.html", "text/html");
  };

  const handleDownloadMarkdown = () => {
    const md = htmlToMarkdown(generatedHtml);
    downloadFile(md, "accessibility-statement.md", "text/markdown");
  };

  const handleDownloadText = () => {
    const txt = htmlToText(generatedHtml);
    downloadFile(txt, "accessibility-statement.txt", "text/plain");
  };

  const handleCertificate = () => {
    const certHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Accessibility Compliance Certificate — ${escapeHtml(form.orgName || "Organization")}</title>
<style>
@page { size: A4 landscape; margin: 20mm; }
body { font-family: Georgia, 'Times New Roman', serif; color: #1e293b; }
.cert { max-width: 900px; margin: 0 auto; padding: 60px 40px; }
.cert-border { border: 3px double #0f766e; border-radius: 12px; padding: 50px; position: relative; }
.cert-border::before { content: ''; position: absolute; top: 12px; left: 12px; right: 12px; bottom: 12px; border: 1px solid #0f766e; border-radius: 8px; pointer-events: none; }
.cert-header { text-align: center; }
.cert-title { font-size: 28px; font-weight: bold; color: #0f766e; letter-spacing: 2px; margin: 0; }
.cert-subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
.cert-body { margin-top: 40px; text-align: center; }
.cert-org { font-size: 24px; font-weight: bold; margin: 20px 0; }
.cert-text { font-size: 15px; line-height: 1.8; color: #334155; max-width: 600px; margin: 0 auto; }
.cert-level { font-size: 20px; font-weight: bold; color: #0f766e; margin: 20px 0; }
.cert-meta { display: flex; justify-content: space-around; margin-top: 50px; font-size: 13px; color: #64748b; }
.cert-meta div { text-align: center; }
.cert-meta .label { text-transform: uppercase; letter-spacing: 1px; font-size: 11px; }
.cert-meta .value { font-weight: bold; color: #1e293b; font-size: 14px; margin-top: 4px; }
.cert-seal { text-align: center; margin-top: 40px; }
.cert-seal-icon { display: inline-block; width: 80px; height: 80px; border: 3px solid #0f766e; border-radius: 50%; line-height: 74px; font-size: 32px; color: #0f766e; }
.cert-footer { text-align: center; margin-top: 30px; font-size: 11px; color: #94a3b8; }
</style>
</head>
<body>
<div class="cert">
<div class="cert-border">
<div class="cert-header">
<p class="cert-title">CERTIFICATE OF ACCESSIBILITY COMPLIANCE</p>
<p class="cert-subtitle">Web Content Accessibility Guidelines (WCAG) 2.2</p>
</div>
<div class="cert-body">
<p class="cert-text">This is to certify that</p>
<p class="cert-org">${escapeHtml(form.orgName || "[Organization Name]")}</p>
<p class="cert-text">has committed to making their website accessible in accordance with</p>
<p class="cert-level">WCAG 2.2 Level ${form.conformanceLevel}</p>
<p class="cert-text">as required by the ${escapeHtml(regulationLabels[form.regulation])}.</p>
</div>
<div class="cert-meta">
<div><div class="label">Statement Date</div><div class="value">${escapeHtml(form.approvalDate || new Date().toISOString().split("T")[0])}</div></div>
<div><div class="label">Next Review</div><div class="value">${escapeHtml(form.reviewDate || "Annual")}</div></div>
<div><div class="label">Regulation</div><div class="value">${escapeHtml(form.regulation)}</div></div>
</div>
<div class="cert-seal"><div class="cert-seal-icon">✓</div></div>
<div class="cert-footer">
This certificate is generated by A11yKit as a companion to the organization's accessibility statement.<br>
It does not constitute legal certification. Independent verification is recommended.
</div>
</div>
</div>
</body>
</html>`;
    downloadFile(certHtml, `accessibility-certificate-${form.orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "org"}.html`, "text/html");
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Form */}
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Statement Template</h2>
          <div className="mb-4">
            <label htmlFor="template" className="block text-sm font-medium text-slate-700">
              Template style
            </label>
            <select
              id="template"
              value={template}
              onChange={(e) => setTemplate(e.target.value as TemplateType)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {(Object.keys(templateLabels) as TemplateType[]).map((t) => (
                <option key={t} value={t}>{templateLabels[t]}</option>
              ))}
            </select>
          {scanResults.length > 0 && (
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Upload className="h-3.5 w-3.5" aria-hidden="true" /> Import from URL Scanner
              </p>
              <div className="mt-2 space-y-1.5">
                {scanResults.slice(0, 5).map((scan, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleImportScan(i)}
                    className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-left text-xs hover:bg-teal-50"
                  >
                    <span className="truncate text-slate-700">{scan.url}</span>
                    <span className="ml-2 flex-shrink-0 text-slate-400">
                      {scan.issues.filter((x) => x.type === "error").length} err / {scan.issues.filter((x) => x.type === "warning").length} warn
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Auto-Generate */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles className="h-5 w-5 text-teal-600" aria-hidden="true" />
            AI Auto-Generate Content
          </h2>
          <p className="mb-3 text-sm text-slate-600">
            Enter your OpenAI API key and we'll generate measures and limitations based on your organization info and scan results.
            Your key is used directly from your browser and never sent to our server.
          </p>
          <div className="flex gap-3">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="sk-..."
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
          {aiError && (
            <p className="mt-2 text-sm text-red-600">{aiError}</p>
          )}
          <button
            type="button"
            onClick={handleAiGenerate}
            disabled={aiGenerating || !apiKey.trim() || !form.orgName.trim()}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
          >
            {aiGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden="true" /> Generate with AI
              </>
            )}
          </button>
          <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
            <Key className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-teal-700 underline">Get your API key →</a>
          </p>
        </div>

          <h2 className="mb-4 text-lg font-semibold text-slate-900">Organization Details</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="org-name" className="block text-sm font-medium text-slate-700">
                Organization name <span className="text-red-500">*</span>
              </label>
              <input
                id="org-name"
                type="text"
                value={form.orgName}
                onChange={(e) => update("orgName", e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Acme Corp"
                required
              />
            </div>
            <div>
              <label htmlFor="org-url" className="block text-sm font-medium text-slate-700">
                Website URL
              </label>
              <input
                id="org-url"
                type="text"
                value={form.orgUrl}
                onChange={(e) => update("orgUrl", e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label htmlFor="regulation" className="block text-sm font-medium text-slate-700">
                Regulatory framework
              </label>
              <select
                id="regulation"
                value={form.regulation}
                onChange={(e) => update("regulation", e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                {(Object.entries(regulationLabels) as [Regulation, string][]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="conformance" className="block text-sm font-medium text-slate-700">
                Conformance level
              </label>
              <select
                id="conformance"
                value={form.conformanceLevel}
                onChange={(e) => update("conformanceLevel", e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="A">Level A</option>
                <option value="AA">Level AA (recommended for EAA/ADA)</option>
                <option value="AAA">Level AAA</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700">
                Contact email
              </label>
              <input
                id="contact-email"
                type="email"
                value={form.contactEmail}
                onChange={(e) => update("contactEmail", e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="accessibility@example.com"
              />
            </div>
            <div>
              <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-700">
                Contact phone
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={form.contactPhone}
                onChange={(e) => update("contactPhone", e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="+1 555 000 0000"
              />
            </div>
            <div>
              <label htmlFor="contact-form" className="block text-sm font-medium text-slate-700">
                Contact form URL
              </label>
              <input
                id="contact-form"
                type="text"
                value={form.contactForm}
                onChange={(e) => update("contactForm", e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="https://example.com/contact"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Additional Details</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="measures" className="block text-sm font-medium text-slate-700">
                Measures taken (one per line)
              </label>
              <textarea
                id="measures"
                value={form.measuresTaken}
                onChange={(e) => update("measuresTaken", e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Regular accessibility audits&#10;Staff training on inclusive design&#10;User testing with assistive technologies"
              />
            </div>
            <div>
              <label htmlFor="limitations" className="block text-sm font-medium text-slate-700">
                Known limitations (one per line)
              </label>
              <textarea
                id="limitations"
                value={form.knownLimitations}
                onChange={(e) => update("knownLimitations", e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Some archived PDFs may not be tagged&#10;Third-party widgets may have contrast issues"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="approval-date" className="block text-sm font-medium text-slate-700">
                  Statement date
                </label>
                <input
                  id="approval-date"
                  type="date"
                  value={form.approvalDate}
                  onChange={(e) => update("approvalDate", e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label htmlFor="review-date" className="block text-sm font-medium text-slate-700">
                  Last review date
                </label>
                <input
                  id="review-date"
                  type="date"
                  value={form.reviewDate}
                  onChange={(e) => update("reviewDate", e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Generated Statement</h2>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-600"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden="true" /> Copy HTML
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              title="Download HTML"
            >
              <Download className="h-4 w-4" aria-hidden="true" /> HTML
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              title="Download Markdown"
            >
              <FileCode className="h-4 w-4" aria-hidden="true" /> MD
            </button>
            <button
              onClick={handleDownloadText}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              title="Download plain text"
            >
              <FileText className="h-4 w-4" aria-hidden="true" /> TXT
            </button>
            <button
              onClick={handleCertificate}
              className="inline-flex items-center gap-2 rounded-md border border-teal-300 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100"
            >
              <Award className="h-4 w-4" aria-hidden="true" /> Certificate
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div
            className="prose prose-sm max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: generatedHtml }}
          />
        </div>
        <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          This generated statement is a starting point. Review it with your legal
          team to ensure it meets your specific regulatory requirements.
        </div>
      </div>
    </div>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
