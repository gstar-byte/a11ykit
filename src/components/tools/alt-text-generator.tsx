"use client";

import { useState, useCallback } from "react";
import { Upload, Sparkles, Copy, Check, AlertCircle, Loader2, Image as ImageIcon, Key } from "lucide-react";

interface GeneratedAlt {
  src: string;
  alt: string;
  status: "pending" | "generated" | "error";
  error?: string;
}

export function AltTextGenerator() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [images, setImages] = useState<GeneratedAlt[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Image must be under 4MB for the API.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImages([{ src: dataUrl, alt: "", status: "pending" }]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const generate = useCallback(async () => {
    if (!apiKey.trim()) {
      setError("Please enter your OpenAI API key.");
      return;
    }
    if (images.length === 0) return;

    setGenerating(true);
    setError("");

    try {
      const img = images[0];
      const base64 = img.src.split(",")[1];

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
                {
                  type: "text",
                  text: "Generate concise, descriptive alt text for this image. Return ONLY the alt text, no explanation, no quotes. Maximum 125 characters. Focus on the purpose and content of the image in the context of a web page.",
                },
                {
                  type: "image_url",
                  image_url: { url: `data:image/jpeg;base64,${base64}` },
                },
              ],
            },
          ],
          max_tokens: 80,
          temperature: 0.5,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = errData?.error?.message || `API error (${res.status})`;
        setImages([{ ...img, status: "error", error: msg }]);
        setError(msg);
      } else {
        const data = await res.json();
        const alt = data.choices?.[0]?.message?.content?.trim() || "";
        setImages([{ ...img, alt, status: "generated" }]);
      }
    } catch {
      setError("Failed to call the API. Check your network and API key.");
      setImages((prev) => prev.map((img) => ({ ...img, status: "error", error: "Network error" })));
    }
    setGenerating(false);
  }, [apiKey, images]);

  const handleCopy = (idx: number) => {
    navigator.clipboard.writeText(images[idx].alt);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

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
      </div>

      {images.length === 0 ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center"
        >
          <ImageIcon className="mx-auto h-12 w-12 text-slate-400" aria-hidden="true" />
          <p className="mt-4 text-lg font-medium text-slate-700">Drop an image here or click to upload</p>
          <p className="mt-1 text-sm text-slate-500">PNG, JPG, GIF, WebP — max 4MB</p>
          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500">
            <Upload className="h-4 w-4" aria-hidden="true" />
            Choose Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Image</h3>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <img src={images[0].src} alt="Uploaded image preview" className="w-full" />
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Generated Alt Text</h3>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                {images[0].status === "pending" && (
                  <p className="text-sm text-slate-500">Click "Generate" to create alt text for this image.</p>
                )}
                {images[0].status === "generated" && (
                  <>
                    <p className="text-sm text-slate-800">{images[0].alt}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(0)}
                        className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-500"
                      >
                        {copiedIdx === 0 ? <><Check className="h-3.5 w-3.5" aria-hidden="true" /> Copied!</> : <><Copy className="h-3.5 w-3.5" aria-hidden="true" /> Copy</>}
                      </button>
                      <span className="text-xs text-slate-500">{images[0].alt.length} characters</span>
                    </div>
                  </>
                )}
                {images[0].status === "error" && (
                  <p className="flex items-start gap-2 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    {images[0].error}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={generate}
              disabled={generating || !apiKey.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4" aria-hidden="true" /> Generate Alt Text</>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setImages([]); setError(""); }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Upload different image
            </button>
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
          <li>• Be concise: 100-125 characters max</li>
          <li>• Describe the <em>purpose</em> of the image, not just what it shows</li>
          <li>• For decorative images, use empty alt (alt="")</li>
          <li>• For data charts, summarize the key finding</li>
          <li>• Always review AI-generated text before publishing</li>
        </ul>
      </div>
    </div>
  );
}
