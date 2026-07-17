"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, AlertCircle, Download, Palette, Image as ImageIcon, Wand2, Copy, Check, Plus, X } from "lucide-react";

type VisionType =
  | "normal"
  | "protanopia"
  | "protanomaly"
  | "deuteranopia"
  | "deuteranomaly"
  | "tritanopia"
  | "tritanomaly"
  | "achromatopsia"
  | "achromatomaly";

interface VisionDef {
  id: VisionType;
  label: string;
  description: string;
  matrix: number[];
  isAnomaly: boolean;
  fullMatrix: number[];
}

const normalMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];

const visionTypes: VisionDef[] = [
  { id: "normal", label: "Normal Vision", description: "Trichromatic (normal color vision)", matrix: normalMatrix, isAnomaly: false, fullMatrix: normalMatrix },
  { id: "protanopia", label: "Protanopia", description: "No red cones (~1% of males)", matrix: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758], isAnomaly: false, fullMatrix: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758] },
  { id: "protanomaly", label: "Protanomaly", description: "Reduced red (~1% of males)", matrix: [0.817, 0.183, 0, 0.333, 0.667, 0, 0, 0.125, 0.875], isAnomaly: true, fullMatrix: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758] },
  { id: "deuteranopia", label: "Deuteranopia", description: "No green cones (~1% of males)", matrix: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7], isAnomaly: false, fullMatrix: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7] },
  { id: "deuteranomaly", label: "Deuteranomaly", description: "Reduced green (~5% of males)", matrix: [0.8, 0.2, 0, 0.258, 0.742, 0, 0, 0.142, 0.858], isAnomaly: true, fullMatrix: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7] },
  { id: "tritanopia", label: "Tritanopia", description: "No blue cones (rare, <0.01%)", matrix: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525], isAnomaly: false, fullMatrix: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525] },
  { id: "tritanomaly", label: "Tritanomaly", description: "Reduced blue (rare)", matrix: [0.967, 0.033, 0, 0, 0.733, 0.267, 0, 0.183, 0.817], isAnomaly: true, fullMatrix: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525] },
  { id: "achromatopsia", label: "Achromatopsia", description: "No color vision (complete)", matrix: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114], isAnomaly: false, fullMatrix: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114] },
  { id: "achromatomaly", label: "Achromatomaly", description: "Partial color blindness", matrix: [0.618, 0.320, 0.062, 0.163, 0.775, 0.062, 0.163, 0.320, 0.516], isAnomaly: true, fullMatrix: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114] },
];

function getInterpolatedMatrix(def: VisionDef, severity: number): number[] {
  if (severity >= 100 || !def.isAnomaly) return def.fullMatrix;
  if (severity <= 0) return normalMatrix;
  const t = severity / 100;
  return def.fullMatrix.map((v, i) => normalMatrix[i] * (1 - t) + v * t);
}

function applyMatrix(r: number, g: number, b: number, m: number[]): [number, number, number] {
  return [
    Math.min(255, Math.max(0, Math.round(r * m[0] + g * m[1] + b * m[2]))),
    Math.min(255, Math.max(0, Math.round(r * m[3] + g * m[4] + b * m[5]))),
    Math.min(255, Math.max(0, Math.round(r * m[6] + g * m[7] + b * m[8]))),
  ];
}

function applyDaltonize(r: number, g: number, b: number, m: number[]): [number, number, number] {
  const [sr, sg, sb] = applyMatrix(r, g, b, m);
  const errR = r - sr;
  const errG = g - sg;
  const errB = b - sb;
  return [
    Math.min(255, Math.max(0, Math.round(sr + errR * 0.7 + errG * 0.3))),
    Math.min(255, Math.max(0, Math.round(sg + errR * 0.7 + errG * 0.3))),
    Math.min(255, Math.max(0, Math.round(sb + errB * 1.0))),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

type Mode = "image" | "palette" | "ui";

export function ColorBlindSimulator() {
  const [mode, setMode] = useState<Mode>("image");
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [selectedType, setSelectedType] = useState<VisionType>("protanopia");
  const [severity, setSeverity] = useState(100);
  const [daltonize, setDaltonize] = useState(false);
  const [error, setError] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [palette, setPalette] = useState<string[]>(["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7"]);
  const [copiedCss, setCopiedCss] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentDef = visionTypes.find((v) => v.id === selectedType)!;
  const currentMatrix = getInterpolatedMatrix(currentDef, severity);

  const processImage = useCallback((img: HTMLImageElement) => {
    const maxDim = 600;
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (w > maxDim || h > maxDim) {
      const ratio = Math.min(maxDim / w, maxDim / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h);
    setImageData(data);
    setImageLoaded(true);
  }, []);

  const handleFile = useCallback((file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => processImage(img);
      img.onerror = () => setError("Failed to load image.");
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [processImage]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `colorblind-${selectedType}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  useEffect(() => {
    if (mode !== "image" || !imageData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const simulated = new Uint8ClampedArray(imageData.data);
    for (let i = 0; i < simulated.length; i += 4) {
      const r = simulated[i];
      const g = simulated[i + 1];
      const b = simulated[i + 2];
      const [nr, ng, nb] = daltonize
        ? applyDaltonize(r, g, b, currentMatrix)
        : applyMatrix(r, g, b, currentMatrix);
      simulated[i] = nr;
      simulated[i + 1] = ng;
      simulated[i + 2] = nb;
    }
    const newImageData = new ImageData(simulated, imageData.width, imageData.height);
    ctx.putImageData(newImageData, 0, 0);
  }, [imageData, selectedType, severity, daltonize, currentMatrix, mode]);

  const simulatedPalette = palette.map((hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const [nr, ng, nb] = daltonize
      ? applyDaltonize(r, g, b, currentMatrix)
      : applyMatrix(r, g, b, currentMatrix);
    return { original: hex, simulated: rgbToHex(nr, ng, nb) };
  });

  const handleCopyCss = () => {
    const css = simulatedPalette.map((c, i) => `  --color-${i + 1}: ${c.simulated};`).join("\n");
    navigator.clipboard.writeText(`:root {\n${css}\n}`);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  const updatePaletteColor = (idx: number, value: string) => {
    setPalette((prev) => prev.map((c, i) => (i === idx ? value : c)));
  };

  const addPaletteColor = () => {
    setPalette((prev) => [...prev, "#000000"]);
  };

  const removePaletteColor = (idx: number) => {
    if (palette.length > 2) setPalette((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* 模式切换 */}
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode("image")} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${mode === "image" ? "bg-teal-600 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-100"}`}>
          <ImageIcon className="h-4 w-4" aria-hidden="true" /> Image
        </button>
        <button type="button" onClick={() => setMode("palette")} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${mode === "palette" ? "bg-teal-600 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-100"}`}>
          <Palette className="h-4 w-4" aria-hidden="true" /> Palette
        </button>
        <button type="button" onClick={() => setMode("ui")} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${mode === "ui" ? "bg-teal-600 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-100"}`}>
          <Wand2 className="h-4 w-4" aria-hidden="true" /> UI Preview
        </button>
      </div>

      {/* 图片模式 */}
      {mode === "image" && (
        <>
          {!imageLoaded && (
            <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <Upload className="mx-auto h-12 w-12 text-slate-400" aria-hidden="true" />
              <p className="mt-4 text-lg font-medium text-slate-700">Drop an image here or click to upload</p>
              <p className="mt-1 text-sm text-slate-500">PNG, JPG, GIF, WebP — processed entirely in your browser</p>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500">
                <Upload className="h-4 w-4" aria-hidden="true" /> Choose Image
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" /> {error}
            </div>
          )}

          {imageLoaded && imageData && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">Original</h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <OriginalImage imageData={imageData} />
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">
                    Simulated: {currentDef.label}{severity < 100 && currentDef.isAnomaly ? ` (${severity}%)` : ""}{daltonize ? " + Daltonized" : ""}
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <canvas ref={canvasRef} className="w-full" aria-label={`Image as seen with ${currentDef.label}`} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button type="button" onClick={handleDownload} className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500">
                  <Download className="h-4 w-4" aria-hidden="true" /> Download PNG
                </button>
                <button type="button" onClick={() => { setImageData(null); setImageLoaded(false); }} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  Upload different image
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* 调色板模式 */}
      {mode === "palette" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Your Color Palette</h3>
            <div className="space-y-3">
              {palette.map((color, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input type="color" value={color} onChange={(e) => updatePaletteColor(idx, e.target.value)} className="h-10 w-12 cursor-pointer rounded border border-slate-300" aria-label={`Color ${idx + 1}`} />
                  <input type="text" value={color} onChange={(e) => updatePaletteColor(idx, e.target.value)} className="w-28 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm uppercase focus:border-teal-500 focus:outline-none" aria-label={`Hex value ${idx + 1}`} />
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded border border-slate-200" style={{ backgroundColor: color }} />
                      <span className="text-xs text-slate-500">Original</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded border border-slate-200" style={{ backgroundColor: simulatedPalette[idx]?.simulated }} />
                      <span className="text-xs text-slate-500">Simulated</span>
                    </div>
                  </div>
                  {palette.length > 2 && (
                    <button type="button" onClick={() => removePaletteColor(idx)} className="text-slate-400 hover:text-red-600" aria-label={`Remove color ${idx + 1}`}>
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addPaletteColor} className="mt-3 inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add color
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Simulated Palette — {currentDef.label}{daltonize ? " + Daltonized" : ""}</h3>
              <button type="button" onClick={handleCopyCss} className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-500">
                {copiedCss ? <><Check className="h-3.5 w-3.5" aria-hidden="true" /> Copied!</> : <><Copy className="h-3.5 w-3.5" aria-hidden="true" /> Copy CSS vars</>}
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {simulatedPalette.map((c, i) => (
                <div key={i} className="text-center">
                  <div className="h-16 w-16 rounded-lg border border-slate-200" style={{ backgroundColor: c.simulated }} />
                  <p className="mt-1 font-mono text-xs text-slate-600">{c.simulated}</p>
                  <p className="text-[10px] text-slate-400">--color-{i + 1}</p>
                </div>
              ))}
            </div>
            <pre className="mt-4 rounded-lg bg-slate-900 p-4 text-xs text-slate-300 overflow-x-auto"><code>{`:root {
${simulatedPalette.map((c, i) => `  --color-${i + 1}: ${c.simulated};`).join("\n")}
}`}</code></pre>
          </div>
        </div>
      )}

      {/* UI 预览模式 */}
      {mode === "ui" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Original UI</h3>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <button className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: palette[0] }}>Primary Button</button>
                <button className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold border-2" style={{ borderColor: palette[1], color: palette[1] }}>Secondary Button</button>
                <div className="flex gap-2">
                  <span className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: palette[2] }}>Badge</span>
                  <span className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: palette[3] }}>Warning</span>
                  <span className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: palette[4] }}>Info</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full border-2" style={{ borderColor: palette[0], backgroundColor: palette[0] }} /><span className="text-sm text-slate-700">Radio option 1</span></div>
                  <div className="flex items-center gap-2"><div className="h-4 w-4 rounded border-2" style={{ borderColor: palette[1] }} /><span className="text-sm text-slate-700">Checkbox option</span></div>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: palette[2] }}>
                  <div className="h-2 rounded-full" style={{ width: "60%", backgroundColor: palette[0] }} />
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Simulated UI — {currentDef.label}{daltonize ? " + Daltonized" : ""}</h3>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <button className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: simulatedPalette[0]?.simulated }}>Primary Button</button>
                <button className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold border-2" style={{ borderColor: simulatedPalette[1]?.simulated, color: simulatedPalette[1]?.simulated }}>Secondary Button</button>
                <div className="flex gap-2">
                  <span className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: simulatedPalette[2]?.simulated }}>Badge</span>
                  <span className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: simulatedPalette[3]?.simulated }}>Warning</span>
                  <span className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: simulatedPalette[4]?.simulated }}>Info</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full border-2" style={{ borderColor: simulatedPalette[0]?.simulated, backgroundColor: simulatedPalette[0]?.simulated }} /><span className="text-sm text-slate-700">Radio option 1</span></div>
                  <div className="flex items-center gap-2"><div className="h-4 w-4 rounded border-2" style={{ borderColor: simulatedPalette[1]?.simulated }} /><span className="text-sm text-slate-700">Checkbox option</span></div>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: simulatedPalette[2]?.simulated }}>
                  <div className="h-2 rounded-full" style={{ width: "60%", backgroundColor: simulatedPalette[0]?.simulated }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 视觉类型选择 + 通用控制 */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Select Vision Type</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visionTypes.filter((v) => v.id !== "normal").map((v) => (
            <button key={v.id} type="button" onClick={() => setSelectedType(v.id)} className={`rounded-lg p-3 text-left transition ${selectedType === v.id ? "bg-teal-50 ring-2 ring-teal-500" : "bg-slate-50 hover:bg-slate-100"}`}>
              <p className="text-sm font-semibold text-slate-900">{v.label}</p>
              <p className="mt-1 text-xs text-slate-500">{v.description}</p>
            </button>
          ))}
        </div>

        {currentDef.isAnomaly && (
          <div className="mt-4">
            <label htmlFor="severity" className="block text-xs font-medium text-slate-600">
              Severity: <span className="text-teal-700 font-semibold">{severity}%</span>
              <span className="ml-2 text-slate-400">({severity === 0 ? "normal vision" : severity >= 100 ? "full dichromacy" : "partial"})</span>
            </label>
            <input id="severity" type="range" min={0} max={100} value={severity} onChange={(e) => setSeverity(Number(e.target.value))} className="mt-1 w-full accent-teal-700" />
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={daltonize} onChange={(e) => setDaltonize(e.target.checked)} className="h-4 w-4 rounded accent-teal-700" />
            Daltonize (color correction)
          </label>
          <span className="text-xs text-slate-500">Shifts lost colors into visible channels to help colorblind users distinguish them</span>
        </div>
      </div>
    </div>
  );
}

function OriginalImage({ imageData }: { imageData: ImageData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(imageData, 0, 0);
  }, [imageData]);

  return <canvas ref={canvasRef} className="w-full" aria-label="Original image" />;
}
