"use client";

import { useState, useCallback } from "react";
import { Upload, AlertTriangle, CheckCircle, Info, Download, FileText, Loader2 } from "lucide-react";
import { exportAsJSON, exportAsMarkdown, exportAsHTML } from "@/lib/export-utils";

interface PdfIssue {
  type: "error" | "warning" | "info" | "pass";
  message: string;
  wcag?: string;
}

export function PdfChecker() {
  const [issues, setIssues] = useState<PdfIssue[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState("");

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }
    setError("");
    setScanning(true);
    setScanned(false);
    setIssues([]);
    setFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await import("pdfjs-dist");

      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setPageCount(pdf.numPages);

      const found: PdfIssue[] = [];

      const metadata = await pdf.getMetadata().catch(() => null);
      const info = metadata?.info as Record<string, unknown> | undefined;
      if (info) {
        const isTagged = (info as Record<string, unknown>).Marked as boolean | undefined;
        if (isTagged) {
          found.push({ type: "pass", message: "PDF is tagged (Marked flag set).", wcag: "1.3.1" });
        } else {
          found.push({ type: "error", message: "PDF is not tagged. Tagged PDFs are essential for screen reader access.", wcag: "1.3.1" });
        }

        const lang = (info as Record<string, unknown>).Lang as string | undefined;
        if (lang) {
          found.push({ type: "pass", message: `Document language set: ${lang}.`, wcag: "3.1.1" });
        } else {
          found.push({ type: "warning", message: "No document language specified in PDF metadata.", wcag: "3.1.1" });
        }

        const title = (info as Record<string, unknown>).Title as string | undefined;
        if (title) {
          found.push({ type: "pass", message: `Document title: "${title}".`, wcag: "2.4.2" });
        } else {
          found.push({ type: "warning", message: "No document title in PDF metadata.", wcag: "2.4.2" });
        }
      }

      let totalText = 0;
      let emptyPages = 0;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: unknown) => (item as { str?: string }).str || "").join(" ").trim();
        if (text.length > 0) {
          totalText += text.length;
        } else {
          emptyPages++;
        }
      }

      if (emptyPages > 0) {
        found.push({ type: "warning", message: `${emptyPages} of ${pdf.numPages} page(s) contain no extractable text — may be scanned images needing OCR.`, wcag: "1.1.1" });
      } else {
        found.push({ type: "pass", message: `All ${pdf.numPages} page(s) contain extractable text.`, wcag: "1.1.1" });
      }

      const outline = await pdf.getOutline().catch(() => null);
      if (outline && outline.length > 0) {
        found.push({ type: "pass", message: `Document has ${outline.length} bookmark(s)/heading(s) for navigation.`, wcag: "2.4.1" });
      } else {
        found.push({ type: "warning", message: "No bookmarks/outline found — readers cannot navigate by structure.", wcag: "2.4.1" });
      }

      found.push({ type: "info", message: `PDF scan complete: ${pdf.numPages} page(s), ${totalText.toLocaleString()} characters of text extracted.` });

      setIssues(found);
      setScanned(true);
    } catch {
      setError("Failed to parse the PDF. The file may be corrupted or password-protected.");
    }
    setScanning(false);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const stats = {
    errors: issues.filter((i) => i.type === "error").length,
    warnings: issues.filter((i) => i.type === "warning").length,
    passes: issues.filter((i) => i.type === "pass").length,
  };

  return (
    <div className="space-y-6">
      {!scanned && !scanning && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center"
        >
          <FileText className="mx-auto h-12 w-12 text-slate-400" aria-hidden="true" />
          <p className="mt-4 text-lg font-medium text-slate-700">Drop a PDF here or click to upload</p>
          <p className="mt-1 text-sm text-slate-500">Parsed entirely in your browser using pdf.js — no upload to any server</p>
          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500">
            <Upload className="h-4 w-4" aria-hidden="true" />
            Choose PDF
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              className="hidden"
            />
          </label>
        </div>
      )}

      {scanning && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600" aria-hidden="true" />
          <p className="mt-4 text-sm font-medium text-slate-700">Scanning PDF...</p>
          <p className="mt-1 text-xs text-slate-500">{fileName}</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          {error}
        </div>
      )}

      {scanned && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span className="font-medium text-slate-700">{fileName}</span>
              <span className="text-slate-400">·</span>
              <span>{pageCount} page(s)</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{stats.errors}</p>
              <p className="text-sm text-red-600">Errors</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-700">{stats.warnings}</p>
              <p className="text-sm text-amber-600">Warnings</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{stats.passes}</p>
              <p className="text-sm text-green-600">Passed</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">PDF Accessibility Report</h3>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => exportAsJSON(issues, "pdf-checker", { fileName, pageCount })} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"><Download className="h-3.5 w-3.5" aria-hidden="true" /> JSON</button>
                <button type="button" onClick={() => exportAsMarkdown(issues, "pdf-checker", { fileName, pageCount })} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"><Download className="h-3.5 w-3.5" aria-hidden="true" /> MD</button>
                <button type="button" onClick={() => exportAsHTML(issues, "pdf-checker")} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"><Download className="h-3.5 w-3.5" aria-hidden="true" /> HTML</button>
              </div>
            </div>
            <ul className="space-y-3">
              {issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-3">
                  {issue.type === "error" && <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />}
                  {issue.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />}
                  {issue.type === "pass" && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />}
                  {issue.type === "info" && <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />}
                  <div>
                    <p className={`text-sm ${issue.type === "error" ? "text-red-700" : issue.type === "warning" ? "text-amber-700" : issue.type === "pass" ? "text-green-700" : "text-blue-700"}`}>
                      {issue.message}
                    </p>
                    {issue.wcag && (
                      <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">WCAG {issue.wcag}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setScanned(false); setIssues([]); setFileName(""); }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Check another PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
