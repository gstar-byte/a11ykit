"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Camera, CameraOff, Info } from "lucide-react";

/* ─── Color blind filter matrices ────────────────────────────── */

type FilterType =
  | "none"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia"
  | "protanomaly"
  | "deuteranomaly";

// 3x3 RGB transform matrices (row-major, applied to [r,g,b])
const MATRICES: Record<FilterType, number[]> = {
  none: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  protanopia: [
    0.567, 0.433, 0.0,
    0.558, 0.442, 0.0,
    0.0,   0.242, 0.758,
  ],
  deuteranopia: [
    0.625, 0.375, 0.0,
    0.7,   0.3,   0.0,
    0.0,   0.3,   0.7,
  ],
  tritanopia: [
    0.95, 0.05,  0.0,
    0.0,  0.433, 0.567,
    0.0,  0.475, 0.525,
  ],
  achromatopsia: [
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114,
  ],
  protanomaly: [
    0.817, 0.183, 0.0,
    0.333, 0.667, 0.0,
    0.0,   0.125, 0.875,
  ],
  deuteranomaly: [
    0.8,   0.2,   0.0,
    0.258, 0.742, 0.0,
    0.0,   0.142, 0.858,
  ],
};

const FILTER_LABELS: Record<FilterType, string> = {
  none: "No filter (original)",
  protanopia: "Protanopia (red-blind)",
  deuteranopia: "Deuteranopia (green-blind)",
  tritanopia: "Tritanopia (blue-blind)",
  achromatopsia: "Achromatopsia (no color)",
  protanomaly: "Protanomaly (red-weak)",
  deuteranomaly: "Deuteranomaly (green-weak)",
};

/* ─── Apply matrix to ImageData ───────────────────────────────── */

function applyMatrix(imageData: ImageData, matrix: number[]): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const [m00, m01, m02, m10, m11, m12, m20, m21, m22] = matrix;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    data[i]     = Math.min(255, Math.max(0, m00 * r + m01 * g + m02 * b));
    data[i + 1] = Math.min(255, Math.max(0, m10 * r + m11 * g + m12 * b));
    data[i + 2] = Math.min(255, Math.max(0, m20 * r + m21 * g + m22 * b));
  }
  return new ImageData(data, imageData.width, imageData.height);
}

/* ─── Component ───────────────────────────────────────────────── */

export function WebcamColorblind() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const [filter, setFilter] = useState<FilterType>("deuteranopia");
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setSupported(false);
    }
    return () => stopCamera();
  }, []);

  const draw = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    if (filter !== "none") {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const filtered = applyMatrix(imageData, MATRICES[filter]);
      ctx.putImageData(filtered, 0, 0);
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [filter]);

  const startCamera = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setActive(true);
      rafRef.current = requestAnimationFrame(draw);
    } catch (e) {
      const err = e as DOMException;
      if (err.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera permission in your browser settings.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found. Please connect a camera and try again.");
      } else {
        setError(`Camera error: ${err.message}`);
      }
    }
  }, [draw]);

  function stopCamera() {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }

  // When filter changes while active, draw loop picks it up automatically

  if (!supported) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
        <CameraOff className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
        <p className="mt-4 text-slate-600">
          Your browser does not support camera access. Please use a modern browser (Chrome, Firefox, Safari, Edge).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Real-time Webcam Color Blind Simulation</p>
          <p className="mt-0.5">
            Your camera feed is processed entirely in your browser. No video is sent to any server.
            Use this to test how your physical environment, printed materials, or UI screens look to color-blind users.
          </p>
        </div>
      </div>

      {/* Filter selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <fieldset>
          <legend className="text-sm font-semibold text-slate-900 mb-3">Select Color Blind Type</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
              <label key={f} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="colorblind-filter"
                  value={f}
                  checked={filter === f}
                  onChange={() => setFilter(f)}
                  className="accent-teal-700"
                />
                <span className="text-sm text-slate-700">{FILTER_LABELS[f]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Camera controls */}
      <div className="flex items-center gap-3">
        {!active ? (
          <button
            type="button"
            onClick={startCamera}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 transition-colors"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            Start Camera
          </button>
        ) : (
          <button
            type="button"
            onClick={stopCamera}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <CameraOff className="h-4 w-4" aria-hidden="true" />
            Stop Camera
          </button>
        )}
        {active && (
          <span className="flex items-center gap-1.5 text-sm text-green-700 font-medium">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
            Live — {FILTER_LABELS[filter]}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Video + Canvas */}
      <div className="rounded-xl border border-slate-200 bg-black overflow-hidden">
        <video
          ref={videoRef}
          className="hidden"
          autoPlay
          playsInline
          muted
          aria-hidden="true"
        />
        <canvas
          ref={canvasRef}
          className={`w-full ${active ? "block" : "hidden"}`}
          aria-label={`Camera feed with ${FILTER_LABELS[filter]} simulation`}
        />
        {!active && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Camera className="h-16 w-16 text-slate-600" aria-hidden="true" />
            <p className="mt-4 text-sm">Click "Start Camera" to begin live simulation</p>
          </div>
        )}
      </div>
    </div>
  );
}
