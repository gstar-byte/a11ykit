"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Download } from "lucide-react";

type Regulation = "EAA" | "ADA" | "Section508" | "AODA" | "Generic";

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

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const generatedHtml = useMemo(() => {
    const reg = regulationLabels[form.regulation];
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

    return `<section aria-labelledby="a11y-statement-heading">
  <h1 id="a11y-statement-heading">Accessibility Statement for ${escapeHtml(form.orgName || "[Organization Name]")}</h1>

  <p><strong>Date of statement:</strong> ${escapeHtml(form.approvalDate)}${form.reviewDate ? ` (last reviewed: ${escapeHtml(form.reviewDate)})` : ""}</p>

  <h2>Commitment to Accessibility</h2>
  <p>${escapeHtml(form.orgName || "[Organization Name]")} is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.</p>

  <h2>Conformance Status</h2>
  <p>This website aims to conform to <strong>WCAG 2.2 Level ${form.conformanceLevel}</strong>. These guidelines explain how to make web content more accessible to people with disabilities. Conformance to these guidelines helps make the web a more inclusive space for all users.</p>
  <p>The applicable regulatory framework is the <strong>${reg}</strong>.</p>

  <h2>Measures Taken</h2>
  <p>We have taken the following measures to ensure accessibility of ${escapeHtml(form.orgName || "our website")}:</p>
  <ul>
${measuresHtml}
  </ul>

  <h2>Known Limitations</h2>
  <p>Despite our efforts, there may be some limitations:</p>
  <ul>
${limitationsHtml}
  </ul>
  <p>If you find an accessibility issue that is not listed above, please contact us so we can address it.</p>

  <h2>Contact Us</h2>
  <p>If you encounter any accessibility barriers on our website or have any questions, please contact us:</p>
${contactHtml}
  <p>We aim to respond to accessibility feedback within 5 business days and to propose a solution or remediation plan within 10 business days.</p>

  <h2>Technical Specifications</h2>
  <p>Accessibility of this website relies on the following technologies to work with the particular combination of web browser and any assistive technologies or plugins that you have installed:</p>
  <ul>
    <li>HTML5</li>
    <li>WAI-ARIA 1.2</li>
    <li>CSS3</li>
    <li>JavaScript</li>
  </ul>
  <p>These technologies are relied upon for conformance with the accessibility standards used.</p>

  <h2>Assessment Approach</h2>
  <p>${escapeHtml(form.orgName || "[Organization Name]")} assessed the accessibility of this website using the following methods:</p>
  <ul>
    <li>Self-evaluation using automated accessibility testing tools</li>
    <li>Manual evaluation by trained accessibility staff</li>
    <li>User testing with assistive technology users</li>
  </ul>

  <h2>Formal Complaints</h2>
  <p>If you are not satisfied with our response to your accessibility concern, you may file a formal complaint through the relevant enforcement authority in your jurisdiction.</p>
</section>`;
  }, [form]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "accessibility-statement.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Form */}
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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
            >
              <Download className="h-4 w-4" aria-hidden="true" /> Download
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
