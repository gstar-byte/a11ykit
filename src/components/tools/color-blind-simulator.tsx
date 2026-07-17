"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, AlertCircle } from "lucide-react";

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
}

const visionTypes: VisionDef[] = [
  { id: "normal", label: "Normal Vision", description: "Trichromatic (normal color vision)", matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1] },
  { id: "protanopia", label: "Protanopia", description: "No red cones (~1% of males)", matrix: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758] },
  { id: "protanomaly", label: "Protanomaly", description: "Reduced red sensitivity (~1% of males)", matrix: [0.817, 0.183, 0, 0.333, 0.667, 0, 0, 0.125, 0.875] },
  { id: "deuteranopia", label: "Deuteranopia", description: "No green cones (~1% of males)", matrix: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7] },
  { id: "deuteranomaly", label: "Deuteranomaly", description: "Reduced green sensitivity (~5% of males)", matrix: [0.8, 0.2, 0, 0.258, 0.742, 0, 0, 0.142, 0.858] },
  { id: "tritanopia", label: "Tritanopia", description: "No blue cones (rare, <0.01%)", matrix: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525] },
  { id: "tritanomaly", label: "Tritanomaly", description: "Reduced blue sensitivity (rare)", matrix: [0.967, 0.033, 0, 0, 0.733, 0.267, 0, 0.183, 0.817] },
  { id: "achromatopsia", label: "Achromatopsia", description: "No color vision (complete)", matrix: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114] },
  { id: "achromatomaly", label: "Achromatomaly", description: "Partial color blindness", matrix: [0.618, 0.320, 0.062, 0.163, 0.775, 0.062, 0.163, 0.320, 0.516] },
];

export function ColorBlindSimulator() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [selectedType, setSelectedType] = useState<VisionType>("protanopia");
  const [error, setError] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!imageData || !canvasRef.current) return;
    const def = visionTypes.find((v) => v.id === selectedType)!;
    const m = def.matrix;
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
      simulated[i] = Math.min(255, Math.max(0, r * m[0] + g * m[1] + b * m[2]));
      simulated[i + 1] = Math.min(255, Math.max(0, r * m[3] + g * m[4] + b * m[5]));
      simulated[i + 2] = Math.min(255, Math.max(0, r * m[6] + g * m[7] + b * m[8]));
    }
    const newImageData = new ImageData(simulated, imageData.width, imageData.height);
    ctx.putImageData(newImageData, 0, 0);
  }, [imageData, selectedType]);

  return (
    <div className="space-y-6">
      {/* Upload area */}
      {!imageLoaded && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center"
        >
          <Upload className="mx-auto h-12 w-12 text-slate-400" aria-hidden="true" />
          <p className="mt-4 text-lg font-medium text-slate-700">
            Drop an image here or click to upload
          </p>
          <p className="mt-1 text-sm text-slate-500">
            PNG, JPG, GIF, WebP — processed entirely in your browser
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Choose Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {imageLoaded && imageData && (
        <>
          {/* Original + Simulated */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Original</h3>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <OriginalImage imageData={imageData} />
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">
                Simulated: {visionTypes.find((v) => v.id === selectedType)?.label}
              </h3>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <canvas ref={canvasRef} className="w-full" aria-label={`Image as seen with ${visionTypes.find((v) => v.id === selectedType)?.label}`} />
              </div>
            </div>
          </div>

          {/* Vision type selector */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Select Vision Type</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {visionTypes.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedType(v.id)}
                  className={`rounded-lg p-3 text-left transition ${
                    selectedType === v.id
                      ? "bg-teal-50 ring-2 ring-teal-500"
                      : "bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">{v.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{v.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Upload new image */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setImageData(null);
                setImageLoaded(false);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Upload a different image
            </button>
          </div>
        </>
      )}
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
