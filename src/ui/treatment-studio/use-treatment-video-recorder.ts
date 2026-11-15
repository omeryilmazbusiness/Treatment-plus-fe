"use client";

import { useCallback, useRef, useState } from "react";
import type { AnimationTimelineStage } from "./types";

export interface VideoHudFrameMeta {
  visitTitle: string;
  stageName: string;
  description: string;
  teeth: string[];
  stageIndex: number;
  totalStages: number;
  currentTime: number;
  totalDuration: number;
}

const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;

function pickSupportedMimeType(): { mimeType: string; ext: "mp4" | "webm" } {
  if (typeof MediaRecorder === "undefined") {
    return { mimeType: "", ext: "webm" };
  }
  const candidates: Array<{ mimeType: string; ext: "mp4" | "webm" }> = [
    { mimeType: "video/mp4;codecs=avc1.42E01E", ext: "mp4" },
    { mimeType: "video/mp4;codecs=avc1", ext: "mp4" },
    { mimeType: "video/mp4", ext: "mp4" },
    { mimeType: "video/webm;codecs=vp9", ext: "webm" },
    { mimeType: "video/webm;codecs=vp8", ext: "webm" },
    { mimeType: "video/webm", ext: "webm" },
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c.mimeType)) {
      return c;
    }
  }
  return { mimeType: "", ext: "webm" };
}

function formatVideoTime(sec: number): string {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = Math.floor(Math.max(0, sec) % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Draws the WebGL canvas with aspect-preserving `object-fit: cover` (no stretching)
 * followed by a high-resolution 1080p clinical HUD overlay.
 */
function renderCompositeVideoFrame(
  ctx: CanvasRenderingContext2D,
  webglCanvas: HTMLCanvasElement,
  meta: VideoHudFrameMeta,
  allStages: AnimationTimelineStage[]
) {
  const srcW = webglCanvas.width;
  const srcH = webglCanvas.height;
  if (srcW <= 0 || srcH <= 0) return;

  // 1. Background fill
  ctx.fillStyle = "#070d19";
  ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

  // 2. Aspect-ratio preserving object-fit: cover from webglCanvas -> 1920x1080
  const targetAspect = VIDEO_WIDTH / VIDEO_HEIGHT;
  const srcAspect = srcW / srcH;

  let sx = 0;
  let sy = 0;
  let sw = srcW;
  let sh = srcH;

  if (srcAspect > targetAspect) {
    // Source is wider than 16:9 -> crop left/right
    sw = srcH * targetAspect;
    sx = (srcW - sw) * 0.5;
  } else {
    // Source is taller than 16:9 -> crop top/bottom
    sh = srcW / targetAspect;
    sy = (srcH - sh) * 0.5;
  }

  ctx.drawImage(
    webglCanvas,
    sx,
    sy,
    sw,
    sh,
    0,
    0,
    VIDEO_WIDTH,
    VIDEO_HEIGHT
  );

  // Subtle top & bottom clinical vignette gradients for HUD legibility
  const topGrad = ctx.createLinearGradient(0, 0, 0, 180);
  topGrad.addColorStop(0, "rgba(7, 13, 25, 0.72)");
  topGrad.addColorStop(1, "rgba(7, 13, 25, 0.0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, VIDEO_WIDTH, 180);

  const botGrad = ctx.createLinearGradient(0, VIDEO_HEIGHT - 210, 0, VIDEO_HEIGHT);
  botGrad.addColorStop(0, "rgba(7, 13, 25, 0.0)");
  botGrad.addColorStop(1, "rgba(7, 13, 25, 0.88)");
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, VIDEO_HEIGHT - 210, VIDEO_WIDTH, 210);

  // 3. Top-Left Clinical Stage HUD Card
  const cardX = 48;
  const cardY = 42;
  const cardW = 680;
  const cardH = 122;

  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 20);
  ctx.fillStyle = "rgba(15, 23, 42, 0.86)";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(56, 189, 248, 0.32)";
  ctx.stroke();

  // Pulsing status dot
  ctx.beginPath();
  ctx.arc(cardX + 28, cardY + 34, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#38bdf8";
  ctx.fill();

  // Visit title & Stage counter
  ctx.font = "700 15px ui-sans-serif, system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#38bdf8";
  const headerLabel = `${(meta.visitTitle || "TEDAVİ SEANSI").toUpperCase()}  ·  AŞAMA ${
    meta.stageIndex + 1
  } / ${Math.max(1, meta.totalStages)}`;
  ctx.fillText(headerLabel, cardX + 46, cardY + 39);

  // Stage Name
  ctx.font = "700 26px ui-sans-serif, system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#f8fafc";
  ctx.fillText(meta.stageName || "Klinik Uygulama", cardX + 24, cardY + 76);

  // FDI Tooth Badges
  if (meta.teeth && meta.teeth.length > 0) {
    let badgeX = cardX + 24;
    const badgeY = cardY + 88;
    ctx.font = "700 13px ui-monospace, SFMono-Regular, monospace";
    const visibleTeeth = meta.teeth.slice(0, 10);
    for (const t of visibleTeeth) {
      const label = `#${t}`;
      const tw = ctx.measureText(label).width + 18;
      drawRoundedRect(ctx, badgeX, badgeY, tw, 24, 7);
      ctx.fillStyle = "rgba(59, 130, 246, 0.24)";
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(96, 165, 250, 0.5)";
      ctx.stroke();
      ctx.fillStyle = "#bfdbfe";
      ctx.fillText(label, badgeX + 9, badgeY + 16.5);
      badgeX += tw + 8;
    }
    if (meta.teeth.length > 10) {
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`+${meta.teeth.length - 10}`, badgeX + 4, badgeY + 16.5);
    }
  } else {
    ctx.font = "500 14px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Tam Ark Klinik Görünüm", cardX + 24, cardY + 104);
  }
  ctx.restore();

  // 4. Top-Right Brand Watermark Pill
  ctx.save();
  const brandW = 310;
  const brandH = 46;
  const brandX = VIDEO_WIDTH - brandW - 48;
  const brandY = 42;
  drawRoundedRect(ctx, brandX, brandY, brandW, brandH, 14);
  ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  ctx.stroke();

  ctx.font = "700 14px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText("TREATMENT+  ·  3D SİMÜLASYON", brandX + 22, brandY + 28);
  ctx.restore();

  // 5. Bottom Progress Bar & Clinical Description
  ctx.save();
  const barX = 48;
  const barW = VIDEO_WIDTH - 96;
  const barY = VIDEO_HEIGHT - 54;
  const barH = 10;

  // Description text above bar
  ctx.font = "500 18px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText(meta.description || "", barX, barY - 22);

  // Timestamp on the right
  const timeText = `${formatVideoTime(meta.currentTime)} / ${formatVideoTime(
    meta.totalDuration
  )}`;
  ctx.font = "700 16px ui-monospace, SFMono-Regular, monospace";
  const timeW = ctx.measureText(timeText).width;
  ctx.fillStyle = "#38bdf8";
  ctx.fillText(timeText, barX + barW - timeW, barY - 22);

  // Track background
  drawRoundedRect(ctx, barX, barY, barW, barH, 5);
  ctx.fillStyle = "rgba(30, 41, 59, 0.9)";
  ctx.fill();

  // Filled progress
  const progressRatio = Math.max(
    0,
    Math.min(1, meta.currentTime / Math.max(0.1, meta.totalDuration))
  );
  if (progressRatio > 0) {
    drawRoundedRect(ctx, barX, barY, Math.max(12, barW * progressRatio), barH, 5);
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, "#3b82f6");
    barGrad.addColorStop(1, "#22d3ee");
    ctx.fillStyle = barGrad;
    ctx.fill();
  }

  // Stage divider ticks
  if (allStages.length > 1 && meta.totalDuration > 0) {
    let acc = 0;
    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    for (let i = 0; i < allStages.length - 1; i++) {
      acc += allStages[i]?.durationSeconds || 3.5;
      const tickX = barX + (acc / meta.totalDuration) * barW;
      ctx.fillRect(tickX - 1, barY, 2, barH);
    }
  }
  ctx.restore();
}

export interface UseTreatmentVideoRecorderResult {
  isRecording: boolean;
  recordingProgress: number;
  startRecording: () => boolean;
  stopRecording: () => void;
  /** Invoked directly inside ThreeMouthCanvas requestAnimationFrame right after renderer.render(scene, camera) */
  onAfterRenderFrame: (
    webglCanvas: HTMLCanvasElement,
    meta: VideoHudFrameMeta,
    allStages: AnimationTimelineStage[]
  ) => void;
}

export function useTreatmentVideoRecorder(
  onExportFinished?: (blob: Blob, filename: string) => void
): UseTreatmentVideoRecorderResult {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);

  const isRecordingRef = useRef(false);
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const compositeCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const extRef = useRef<"mp4" | "webm">("mp4");

  const stopRecording = useCallback(() => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    setIsRecording(false);
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") {
      try {
        rec.stop();
      } catch {
        // ignore
      }
    }
  }, []);

  const startRecording = useCallback((): boolean => {
    if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
      return false;
    }
    if (isRecordingRef.current) return true;

    const canvas = document.createElement("canvas");
    canvas.width = VIDEO_WIDTH;
    canvas.height = VIDEO_HEIGHT;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return false;

    compositeCanvasRef.current = canvas;
    compositeCtxRef.current = ctx;
    chunksRef.current = [];

    const { mimeType, ext } = pickSupportedMimeType();
    extRef.current = ext;

    const stream = canvas.captureStream(60);
    const options: MediaRecorderOptions = {
      videoBitsPerSecond: 12_000_000,
    };
    if (mimeType) {
      options.mimeType = mimeType;
    }

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, options);
    } catch {
      recorder = new MediaRecorder(stream);
    }

    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) {
        chunksRef.current.push(ev.data);
      }
    };

    recorder.onstop = () => {
      const finalType =
        recorder.mimeType || (extRef.current === "mp4" ? "video/mp4" : "video/webm");
      const blob = new Blob(chunksRef.current, { type: finalType });
      const filename = `treatment-plan-video.${extRef.current}`;

      // Trigger automatic client download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);

      stream.getTracks().forEach((t) => t.stop());
      recorderRef.current = null;
      compositeCanvasRef.current = null;
      compositeCtxRef.current = null;
      setRecordingProgress(0);

      if (onExportFinished) {
        onExportFinished(blob, filename);
      }
    };

    recorder.start(100);
    recorderRef.current = recorder;
    isRecordingRef.current = true;
    setIsRecording(true);
    setRecordingProgress(0);
    return true;
  }, [onExportFinished]);

  const onAfterRenderFrame = useCallback(
    (
      webglCanvas: HTMLCanvasElement,
      meta: VideoHudFrameMeta,
      allStages: AnimationTimelineStage[]
    ) => {
      if (!isRecordingRef.current || !compositeCtxRef.current) return;

      renderCompositeVideoFrame(
        compositeCtxRef.current,
        webglCanvas,
        meta,
        allStages
      );

      const pct = Math.min(
        100,
        Math.round(
          (meta.currentTime / Math.max(0.1, meta.totalDuration)) * 100
        )
      );
      setRecordingProgress(pct);
    },
    []
  );

  return {
    isRecording,
    recordingProgress,
    startRecording,
    stopRecording,
    onAfterRenderFrame,
  };
}

