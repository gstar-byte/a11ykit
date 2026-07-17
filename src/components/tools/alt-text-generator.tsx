"use client";

import { useState, useCallback } from "react";
import { Upload, Sparkles, Copy, Check, AlertCircle, Loader2, Image as ImageIcon, Key, X, Download } from "lucide-react";

interface GeneratedAlt {
  src: string;
  name: string;
  alt: string;
  status: "pending" | "generated" | "error";
  error?: string;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh", label: "Chinese (中文)" },
  { code: "es", label: "Spanish (Español)" },
  { code: "fr", label: "French (Français)" },
  { code: "de", label: "German (Deutsch)" },
  { code: "ja", label: "Japanese (日本語)" },
  { code: "ko", label: "Korean (한국어)" },
  { code: "pt", label: "Portuguese (Português)" },
  { code: "it", label: "Italian (Italiano)" },
  { code: "ru", label: "Russian (Русский)" },
  { code: "ar", label: "Arabic (العربية)" },
  { code: "hi", label: "Hindi (हिन्दी)" },
  { code: "nl", label: "Dutch (Nederlands)" },
  { code: "pl", label: "Polish (Polski)" },
  { code: "tr", label: "Turkish (Türkçe)" },
  { code: "sv", label: "Swedish (Svenska)" },
  { code: "da", label: "Danish (Dansk)" },
  { code: "fi", label: "Finnish (Suomi)" },
  { code: "no", label: "Norwegian (Norsk)" },
  { code: "cs", label: "Czech (Čeština)" },
  { code: "el", label: "Greek (Ελληνικά)" },
  { code: "he", label: "Hebrew (עברית)" },
  { code: "th", label: "Thai (ไทย)" },
  { code: "vi", label: "Vietnamese (Tiếng Việt)" },
  { code: "id", label: "Indonesian (Bahasa Indonesia)" },
  { code: "ms", label: "Malay (Bahasa Melayu)" },
  { code: "uk", label: "Ukrainian (Українська)" },
  { code: "ro", label: "Romanian (Română)" },
  { code: "hu", label: "Hungarian (Magyar)" },
  { code: "sk", label: "Slovak (Slovenčina)" },
];

const DETAIL_LEVELS = [
  { value: "concise", label: "Concise (~125 chars)", prompt: "concise, maximum 125 characters" },
  { value: "detailed", label: "Detailed (~250 chars)", prompt: "detailed, maximum 250 characters" },
  { value: "comprehensive", label: "Comprehensive (~500 chars)", prompt: "comprehensive, maximum 500 characters" },
];

export function AltTextGenerator() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [images, setImages] = useState<GeneratedAlt[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [language, setLanguage] = useState("en");
  const [detailLevel, setDetailLevel] = useState("concise");
  const [context, setContext] = useState("");

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError("");
    const newImages: GeneratedAlt[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 4 * 1024 * 1024) {
        setError(`${file.name} is over 4MB and was skipped.`);
        continue;
      }
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      newImages.push({ src: dataUrl, name: file.name, alt: "", status: "pending" });
    }
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) handleFiles(files);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const generateOne = async (img: GeneratedAlt, index: number): Promise<void> => {
    const base64 = img.src.split(",")[1];
    const lang = LANGUAGES.find((l) => l.code === language);
    const detail = DETAIL_LEVELS.find((d) => d.value === detailLevel)!;
    const contextPart = context.trim() ? ` Context: ${context.trim()}.` : "";
    const prompt = `Generate ${detail.prompt} alt text for this image in ${lang?.label || "English"}.${contextPart} Return ONLY the alt text, no explanation, no quotes. Focus on the purpose and content of the image.`;

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
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
          max_tokens: detailLevel === "comprehensive" ? 300 : detailLevel === "detailed" ? 150 : 80,
          temperature: 0.5,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = errData?.error?.message || `API error (${res.status})`;
        setImages((prev) => prev.map((im, i) => i === index ? { ...im, status: "error", error: msg } : im));
        return;
      }

      const data = await res.json();
      const alt = data.choices?.[0]?.message?.content?.trim() || "";
      setImages((prev) => prev.map((im, i) => i === index ? { ...im, alt, status: "generated" } : im));
    } catch {
      setImages((prev) => prev.map((im, i) => i === index ? { ...im, status: "error", error: "Network error" } : im));
    }
  };

  const generate = useCallback(async () => {
    if (!apiKey.trim()) {
      setError("Please enter your OpenAI API key.");
      return;
    }
    if (images.length === 0) return;

    setGenerating(true);
    setError("");

    for (let i = 0; i < images.length; i++) {
      if (images[i].status === "generated") continue;
      await generateOne(images[i], i);
    }

    setGenerating(false);
  }, [apiKey, images, language, detailLevel, context]);

  const handleCopy = (idx: number) => {
    navigator.clipboard.writeText(images[idx].alt);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleCopyAll = () => {
    const text = images
      .filter((img) => img.status === "generated")
      .map((img) => `${img.name}:\n${img.alt}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopiedIdx(-1);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleDownloadAll = () => {
    const lines = images
      .filter((img) => img.status === "generated")
      .map((img) => `${img.name}\t${img.alt}`);
    const csv = "filename\talt_text\n" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alt-texts.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatedCount = images.filter((img) => img.status === "generated").length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="flex items-start gap-2">
          <Key className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <strong>How it works:</strong> Your OpenAI API key is used directly from your browser to generate alt text.
            It is never sent to our server, stored, or shared. You need an OpenAI account with API credits.
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="ml-1 font-medium text-amber-900 underline">Get your API key →</a>
          </span>
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label htmlFor="api-key" className="block text-sm font-semibold text-slate-900 mb-2">
          OpenAI API Key
        </label>
        <div className="flex gap-3">
          <input
            id="api-key"
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-mono focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="sk-..."
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="language" className="block text-xs font-semibold text-slate-700 mb-1">
              Output Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="detail" className="block text-xs font-semibold text-slate-700 mb-1">
              Detail Level
            </label>
            <select
              id="detail"
              value={detailLevel}
              onChange={(e) => setDetailLevel(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {DETAIL_LEVELS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="context" className="block text-xs font-semibold text-slate-700 mb-1">
              Context (optional)
            </label>
            <input
              id="context"
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="e.g. e-commerce product page"
            />
          </div>
        </div>
      </div>

      {images.length === 0 ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center"
        >
          <ImageIcon className="mx-auto h-12 w-12 text-slate-400" aria-hidden="true" />
          <p className="mt-4 text-lg font-medium text-slate-700">Drop images here or click to upload</p>
          <p className="mt-1 text-sm text-slate-500">PNG, JPG, GIF, WebP — max 4MB each — batch upload supported</p>
          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500">
            <Upload className="h-4 w-4" aria-hidden="true" />
            Choose Images
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative">
                  <img src={img.src} alt={`Preview of ${img.name}`} className="h-40 w-full rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-2 truncate text-xs text-slate-500">{img.name}</p>
                {img.status === "pending" && (
                  <p className="mt-2 text-xs text-slate-400">Waiting to generate...</p>
                )}
                {img.status === "generated" && (
                  <div className="mt-2">
                    <p className="text-sm text-slate-800">{img.alt}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(idx)}
                        className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-2 py-1 text-xs font-medium text-white hover:bg-teal-500"
                      >
                        {copiedIdx === idx ? <><Check className="h-3 w-3" aria-hidden="true" /> Copied!</> : <><Copy className="h-3 w-3" aria-hidden="true" /> Copy</>}
                      </button>
                      <span className="text-xs text-slate-400">{img.alt.length} chars</span>
                    </div>
                  </div>
                )}
                {img.status === "error" && (
                  <p className="mt-2 flex items-start gap-1 text-xs text-red-700">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    {img.error}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={generate}
              disabled={generating || !apiKey.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Generating ({generatedCount}/{images.length})...</>
              ) : (
                <><Sparkles className="h-4 w-4" aria-hidden="true" /> Generate Alt Text ({images.length} image{images.length > 1 ? "s" : ""})</>
              )}
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Add more
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => { setImages([]); setError(""); }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Clear all
            </button>
            {generatedCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {copiedIdx === -1 ? <><Check className="h-4 w-4" aria-hidden="true" /> Copied all!</> : <><Copy className="h-4 w-4" aria-hidden="true" /> Copy all</>}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Download className="h-4 w-4" aria-hidden="true" /> Download CSV
                </button>
              </>
            )}
          </div>
        </>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-700">Best practices for alt text:</p>
        <ul className="mt-2 space-y-1 text-xs text-slate-500">
          <li>• Be concise: 100-125 characters max for most images</li>
          <li>• Describe the <em>purpose</em> of the image, not just what it shows</li>
          <li>• For decorative images, use empty alt (alt="")</li>
          <li>• For data charts, summarize the key finding</li>
          <li>• Always review AI-generated text before publishing</li>
          <li>• Supports 30+ languages — select your output language above</li>
          <li>• Batch upload: drag multiple images or select multiple files</li>
        </ul>
      </div>
    </div>
  );
}
