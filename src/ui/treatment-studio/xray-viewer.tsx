"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Activity,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FlipHorizontal,
  Grid,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RefreshCw,
  RotateCw,
  Sliders,
  Trash2,
  UploadCloud,
  X,
  ZoomIn,
} from "lucide-react";
import type { XRaySettings } from "./types";
import { DEFAULT_PANORAMIC_XRAY_SVG } from "./panoramic-xray-asset";

export interface ExtendedXRaySettings extends XRaySettings {
  isFlipped?: boolean;
  showGrid?: boolean;
}

export interface FilmItem {
  id: string;
  name: string;
  type: string;
  url: string;
  date: string;
  details: string;
  isUserUploaded?: boolean;
}

interface XRayViewerProps {
  initialImageUrl?: string;
  onImageChange?: (url: string) => void;
  patientName?: string;
}

interface InteractiveSliderProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}

function InteractiveSlider({
  label,
  icon,
  value,
  min,
  max,
  step = 5,
  unit = "%",
  onChange,
}: InteractiveSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const updateFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      if (rect.width === 0) return;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawVal = min + ratio * (max - min);
      const steppedVal = Math.round(rawVal / step) * step;
      const clampedVal = Math.max(min, Math.min(max, steppedVal));
      onChange(clampedVal);
    },
    [min, max, step, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    updateFromPointer(e.clientX);

    const onPointerMove = (ev: PointerEvent) => {
      updateFromPointer(ev.clientX);
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(min, value - step));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(max, value + step));
    }
  };

  return (
    <div className="space-y-1 select-none">
      {/* Label and Step buttons */}
      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        <div className="flex items-center gap-0.5 text-[11px] font-mono text-slate-600">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - step))}
            disabled={value <= min}
            className="size-4 rounded hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
            title="Azalt"
          >
            <Minus className="size-2.5 stroke-[2.5]" />
          </button>
          <span className="font-bold text-slate-700 min-w-[34px] text-center">
            {value}
            {unit}
          </span>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + step))}
            disabled={value >= max}
            className="size-4 rounded hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
            title="Artır"
          >
            <Plus className="size-2.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* The Interactive Slider Track Area - 28px tall hit area with smooth dragging */}
      <div
        ref={trackRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        className="relative w-full h-7 flex items-center cursor-pointer touch-none group focus:outline-none"
      >
        {/* Background Track */}
        <div className="w-full h-1.5 bg-slate-200 rounded-full relative overflow-hidden">
          {/* Active Fill Track */}
          <div
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Thumb Knob */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-4.5 rounded-full bg-blue-600 border-2 border-white shadow-md transition-transform ${
            isDragging
              ? "scale-125 cursor-grabbing ring-4 ring-blue-500/20"
              : "group-hover:scale-110 cursor-grab"
          }`}
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function XRayViewer({
  initialImageUrl,
  onImageChange,
  patientName = "Ömer Yılmaz",
}: XRayViewerProps) {
  // Initialize filmList: ONLY include if a real image URL is provided (not broken sample or empty)
  const getInitialFilms = (): FilmItem[] => {
    if (initialImageUrl && !initialImageUrl.includes("xray-sample.jpg")) {
      return [
        {
          id: `film-${Date.now()}`,
          name: "Hasta Röntgeni",
          type: "Radyografi",
          url: initialImageUrl,
          date: "Kayıtlı",
          details: "Hasta Filmi",
          isUserUploaded: true,
        },
      ];
    }
    // Default to empty when no photos uploaded yet
    return [];
  };

  const [filmList, setFilmList] = useState<FilmItem[]>(getInitialFilms);
  const [activeFilmIndex, setActiveFilmIndex] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const [settings, setSettings] = useState<ExtendedXRaySettings>({
    zoom: 100,
    brightness: 100,
    contrast: 100,
    isInverted: false,
    rotation: 0,
    isFlipped: false,
    showGrid: false,
  });

  const [activePreset, setActivePreset] = useState<
    "standard" | "bone" | "endo" | "invert" | "soft" | "custom"
  >("standard");

  // Pan / Drag State
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentFilm: FilmItem | undefined = filmList[activeFilmIndex] ?? filmList[0];

  // Full reset
  const handleReset = useCallback(() => {
    setSettings({
      zoom: 100,
      brightness: 100,
      contrast: 100,
      isInverted: false,
      rotation: 0,
      isFlipped: false,
      showGrid: false,
    });
    setPan({ x: 0, y: 0 });
    setActivePreset("standard");
  }, []);

  // Sync active film selection
  const handleSelectFilm = (idx: number) => {
    const selected = filmList[idx];
    if (selected) {
      setActiveFilmIndex(idx);
      onImageChange?.(selected.url);
      handleReset();
    }
  };

  // Delete active uploaded film
  const handleDeleteCurrentFilm = () => {
    const updated = filmList.filter((_, idx) => idx !== activeFilmIndex);
    const nextIndex = Math.max(0, activeFilmIndex - 1);
    setFilmList(updated);
    setActiveFilmIndex(nextIndex);
    const nextFilm = updated[nextIndex];
    onImageChange?.(nextFilm ? nextFilm.url : "");
    handleReset();
  };

  // Load sample OPG when user clicks the demo button in empty state
  const handleLoadSampleOpg = () => {
    const sampleFilm: FilmItem = {
      id: "sample-opg",
      name: "Örnek Panoramik Röntgen (OPG)",
      type: "Anatomik OPG",
      url: DEFAULT_PANORAMIC_XRAY_SVG,
      date: "Örnek",
      details: "72 kVp • 12 mA • 1:1",
      isUserUploaded: false,
    };
    setFilmList([sampleFilm]);
    setActiveFilmIndex(0);
    onImageChange?.(sampleFilm.url);
    handleReset();
  };

  // Process a list of files from input or drag-and-drop
  const processUploadedFiles = (fileListObj: FileList | null) => {
    if (!fileListObj || fileListObj.length === 0) return;
    const fileArray = Array.from(fileListObj);
    const newItems: FilmItem[] = [];
    let processed = 0;

    fileArray.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          newItems[i] = {
            id: `upload-${Date.now()}-${i}`,
            name: file.name.slice(0, 24),
            type: "Röntgen Filmi",
            url: result,
            date: "Yeni Yüklendi",
            details: `${(file.size / 1024).toFixed(1)} KB • Görüntü`,
            isUserUploaded: true,
          };
        }
        processed++;
        if (processed === fileArray.length) {
          const validUploads = newItems.filter(Boolean);
          if (validUploads.length === 0) return;

          setFilmList((prev) => {
            // If previous list was just the sample OPG, replace it completely!
            const wasOnlySample = prev.length === 1 && !prev[0]?.isUserUploaded;
            return wasOnlySample ? validUploads : [...prev, ...validUploads];
          });

          // Focus first uploaded file
          const targetIndex = filmList.length === 1 && !filmList[0]?.isUserUploaded ? 0 : filmList.length;
          setActiveFilmIndex(targetIndex);
          const firstItem = validUploads[0];
          if (firstItem) {
            onImageChange?.(firstItem.url);
          }
          handleReset();
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // File Upload via file dialog
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processUploadedFiles(e.target.files);
    e.target.value = "";
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  // ==============================================================
  // Callback ref: Attaches native non-passive wheel listener directly
  // so zooming with mouse wheel NEVER scrolls the page!
  // ==============================================================
  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (containerRef.current && (containerRef.current as any)._cleanupWheel) {
      (containerRef.current as any)._cleanupWheel();
    }

    containerRef.current = node;

    if (node) {
      const handleNativeWheel = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY < 0 ? 15 : -15;
        setSettings((prev) => {
          const nextZoom = Math.max(100, Math.min(300, prev.zoom + delta));
          if (nextZoom === 100) {
            setPan({ x: 0, y: 0 });
          }
          return { ...prev, zoom: nextZoom };
        });
      };

      node.addEventListener("wheel", handleNativeWheel, { passive: false });
      (node as any)._cleanupWheel = () => {
        node.removeEventListener("wheel", handleNativeWheel);
      };
    }
  }, []);

  // Fullscreen ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Quick Preset Handlers
  const handleApplyPreset = (preset: "standard" | "bone" | "endo" | "invert" | "soft") => {
    setActivePreset(preset);
    if (preset === "standard") {
      setSettings((prev) => ({
        ...prev,
        brightness: 100,
        contrast: 100,
        isInverted: false,
      }));
    } else if (preset === "bone") {
      setSettings((prev) => ({
        ...prev,
        brightness: 92,
        contrast: 145,
        isInverted: false,
      }));
    } else if (preset === "endo") {
      setSettings((prev) => ({
        ...prev,
        brightness: 84,
        contrast: 165,
        isInverted: false,
      }));
    } else if (preset === "invert") {
      setSettings((prev) => ({
        ...prev,
        brightness: 105,
        contrast: 115,
        isInverted: true,
      }));
    } else if (preset === "soft") {
      setSettings((prev) => ({
        ...prev,
        brightness: 118,
        contrast: 85,
        isInverted: false,
      }));
    }
  };

  // Download radiograph
  const handleDownload = () => {
    if (!currentFilm) return;
    const link = document.createElement("a");
    link.download = `rontgen-${currentFilm.name.replace(/[^a-zA-Z0-9_-]/g, "_") || "film"}.png`;
    link.href = currentFilm.url;
    link.click();
  };

  // Pan / Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (settings.zoom <= 100) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || settings.zoom <= 100) return;
    const maxBound = (settings.zoom - 100) * 3.5;
    const nextX = Math.max(-maxBound, Math.min(maxBound, e.clientX - dragStart.x));
    const nextY = Math.max(-maxBound, Math.min(maxBound, e.clientY - dragStart.y));
    setPan({ x: nextX, y: nextY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (settings.zoom <= 100 || e.touches.length === 0) return;
    const touch = e.touches[0];
    if (!touch) return;
    setIsDragging(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || settings.zoom <= 100 || e.touches.length === 0) return;
    const touch = e.touches[0];
    if (!touch) return;
    const maxBound = (settings.zoom - 100) * 3.5;
    const nextX = Math.max(-maxBound, Math.min(maxBound, touch.clientX - dragStart.x));
    const nextY = Math.max(-maxBound, Math.min(maxBound, touch.clientY - dragStart.y));
    setPan({ x: nextX, y: nextY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Double click to zoom in / reset
  const handleDoubleClick = () => {
    if (settings.zoom > 100) {
      setSettings((prev) => ({ ...prev, zoom: 100 }));
      setPan({ x: 0, y: 0 });
    } else {
      setSettings((prev) => ({ ...prev, zoom: 180 }));
    }
  };

  // CSS Filter & Transform styles
  const filterStyle: React.CSSProperties = {
    filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) ${
      settings.isInverted ? "invert(100%)" : "invert(0%)"
    }`,
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${settings.zoom / 100}) rotate(${
      settings.rotation
    }deg) ${settings.isFlipped ? "scaleX(-1)" : ""}`,
    transformOrigin: "center center",
    transition: isDragging ? "none" : "transform 0.12s ease-out, filter 0.08s ease-out",
  };

  const hasPhotos = filmList.length > 0 && !!currentFilm;

  // ==============================================================
  // 1. EMPTY STATE COMPONENT (When no photo is uploaded)
  // Matches exact height of the adjustment panel
  // ==============================================================
  const EmptyStateContent = (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative w-full h-full min-h-[460px] md:min-h-[500px] flex-1 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none group ${
        isDragOver
          ? "border-blue-500 bg-blue-50/80 shadow-md scale-[0.99]"
          : "border-slate-300 hover:border-blue-400 bg-slate-50/70 hover:bg-slate-100/70"
      }`}
    >
      <div className="size-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-xs">
        <UploadCloud className="size-7" />
      </div>

      <h4 className="text-sm font-bold text-slate-800 mb-1">
        Panoramik Röntgen (X-Ray) veya Fotoğraf Yükleyin
      </h4>

      <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed">
        Radyografi görüntülerini incelemek, kontrast ve klinik filtreleri uygulamak için bilgisayarınızdan dosya seçin veya buraya sürükleyip bırakın.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <UploadCloud className="size-4" />
          <span>Röntgen / Fotoğraf Seç</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleLoadSampleOpg();
          }}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
          title="Sistemdeki örnek panoramik röntgen ile test et"
        >
          <span>Örnek OPG ile Dene</span>
        </button>
      </div>

      <span className="text-[10px] text-slate-400 mt-3 font-mono">
        PNG, JPG, JPEG, DICOM (.dcm) • Çoklu seçim ve sürükle-bırak desteklenir
      </span>
    </div>
  );

  // ==============================================================
  // 2. ACTIVE VIEWPORT CONTENT COMPONENT
  // Full height card matching Görüntü İşleme height with zero top/bottom gaps
  // ==============================================================
  const ViewportContent = currentFilm ? (
    <div
      ref={setContainerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
      className={`relative w-full h-full min-h-[460px] md:min-h-[500px] flex-1 overflow-hidden select-none bg-radial from-slate-900 via-slate-950 to-black flex items-center justify-center border border-slate-800 shadow-inner group rounded-2xl ${
        settings.zoom > 100
          ? isDragging
            ? "cursor-grabbing"
            : "cursor-grab"
          : "cursor-default"
      }`}
    >
      {/* Millimeter Grid Overlay (Toggled from right panel) */}
      {settings.showGrid && (
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      )}

      {/* Anatomical Orientation Markers (R / L) */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col items-start gap-1">
        <div className="flex items-center gap-2">
          <span className="size-6 rounded-md bg-slate-900/90 border border-slate-700/80 backdrop-blur-md flex items-center justify-center text-xs font-black text-blue-400 shadow-md">
            R
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 drop-shadow">
            Sağ (Hasta)
          </span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 pointer-events-none flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 drop-shadow">
            Sol (Hasta)
          </span>
          <span className="size-6 rounded-md bg-slate-900/90 border border-slate-700/80 backdrop-blur-md flex items-center justify-center text-xs font-black text-blue-400 shadow-md">
            L
          </span>
        </div>
      </div>

      {/* Top Floating Glass HUD Bar: Sequence Navigation, Upload, Delete & Fullscreen */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-xl">
        {/* Photo Sequence Navigation (if multiple photos) */}
        {filmList.length > 1 && (
          <div className="flex items-center gap-1 px-1">
            <button
              type="button"
              onClick={() =>
                handleSelectFilm(
                  (activeFilmIndex - 1 + filmList.length) % filmList.length
                )
              }
              className="p-1 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Önceki Röntgen"
            >
              <ChevronLeft className="size-3.5" />
            </button>

            <span className="text-xs font-mono font-bold text-blue-400 px-1.5">
              {activeFilmIndex + 1} / {filmList.length}
            </span>

            <button
              type="button"
              onClick={() =>
                handleSelectFilm((activeFilmIndex + 1) % filmList.length)
              }
              className="p-1 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Sonraki Röntgen"
            >
              <ChevronRight className="size-3.5" />
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />
          </div>
        )}

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-700"
          title="Yeni Röntgen Yükle"
        >
          <UploadCloud className="size-3.5 text-blue-400" />
          <span className="hidden sm:inline">Röntgen Yükle</span>
        </button>

        {/* Delete Active Photo */}
        <button
          type="button"
          onClick={handleDeleteCurrentFilm}
          className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
          title="Bu Fotoğrafı Kaldır"
        >
          <Trash2 className="size-3.5" />
        </button>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title={isFullscreen ? "Tam Ekrandan Çık (Esc)" : "Tam Ekran Büyüt"}
        >
          {isFullscreen ? (
            <Minimize2 className="size-3.5 text-amber-400" />
          ) : (
            <Maximize2 className="size-3.5 text-blue-400" />
          )}
        </button>
      </div>

      {/* The Dental Radiograph Visual Viewport */}
      <div className="relative flex items-center justify-center w-full h-full p-2 select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentFilm.url}
          alt={currentFilm.name}
          style={filterStyle}
          className="max-h-full max-w-full object-contain pointer-events-none rounded transition-opacity duration-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_PANORAMIC_XRAY_SVG;
          }}
        />
      </div>

      {/* Drag Hint when zoomed in */}
      {settings.zoom > 100 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none text-[10px] text-slate-300 bg-black/75 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
          Gezinmek için basılı tutup sürükleyin • Sıfırlamak için çift tıklayın
        </div>
      )}

      {/* Anatomical Calibration Scale at Bottom-Right */}
      <div className="absolute bottom-3 right-4 z-10 pointer-events-none hidden sm:flex flex-col items-end opacity-60">
        <div className="flex items-center gap-1 border-b border-slate-500 pb-0.5">
          <span className="w-12 h-0.5 bg-slate-400"></span>
        </div>
        <span className="text-[9px] font-mono text-slate-400 mt-0.5">
          ÖLÇEK 10mm (1:1)
        </span>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Hidden file input with multiple file support */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.dcm"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Main Container */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs items-stretch">
        {/* Left 8/9 Columns: Main Viewport or Empty State (Aligned to Görüntü İşleme height) */}
        <div className="xl:col-span-8 2xl:col-span-9 flex flex-col h-full min-h-[460px] md:min-h-[500px]">
          {hasPhotos ? ViewportContent : EmptyStateContent}
        </div>

        {/* Right 4/3 Columns: Professional Medical Adjustment Panel */}
        <div className="xl:col-span-4 2xl:col-span-3 flex flex-col justify-between space-y-4 bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 transition h-full">
          <div className="space-y-4">
            {/* Header: Title + Global Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100/70 text-blue-700">
                  <Sliders className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Görüntü İşleme
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Klinik filtre ve kontrast ayarları
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-200/60 cursor-pointer"
                title="Tüm ayarları orijinal haline sıfırla"
              >
                <RefreshCw className="size-3 text-slate-400" />
                <span>Sıfırla</span>
              </button>
            </div>

            {/* 1. Quick Clinical Filter Presets (Balanced 2x2 Grid) */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "standard" as const, label: "Doğal OPG", tip: "Standart" },
                { id: "bone" as const, label: "Kemik Detay", tip: "Yüksek Kontrast" },
                { id: "endo" as const, label: "Endo & Apeks", tip: "Kanal Netliği" },
                { id: "invert" as const, label: "Negatif Film", tip: "Klasik Röntgen" },
              ].map((item) => {
                  const isActive = activePreset === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleApplyPreset(item.id)}
                      className={`flex flex-col items-start px-2.5 py-1.5 rounded-xl border text-left transition cursor-pointer ${
                        isActive
                          ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                          : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold">{item.label}</span>
                        {isActive && <Check className="size-3 text-white" />}
                      </div>
                      <span
                        className={`text-[9px] ${
                          isActive ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {item.tip}
                      </span>
                    </button>
                  );
                })}
              </div>

            {/* 2. Precision Range Sliders (Interactive Smooth Drag) */}
            <div className="space-y-3.5 pt-2 border-t border-slate-200/70">
              {/* Zoom Slider */}
              <InteractiveSlider
                label="Yakınlaştırma (Zoom)"
                icon={<ZoomIn className="size-3.5 text-slate-400" />}
                value={settings.zoom}
                min={100}
                max={300}
                step={5}
                unit="%"
                onChange={(val) => setSettings((prev) => ({ ...prev, zoom: val }))}
              />

              {/* Brightness Slider */}
              <InteractiveSlider
                label="Parlaklık (Brightness)"
                icon={<Eye className="size-3.5 text-slate-400" />}
                value={settings.brightness}
                min={50}
                max={180}
                step={5}
                unit="%"
                onChange={(val) => {
                  setActivePreset("custom");
                  setSettings((prev) => ({ ...prev, brightness: val }));
                }}
              />

              {/* Contrast Slider */}
              <InteractiveSlider
                label="Kontrast (Contrast)"
                icon={<Activity className="size-3.5 text-slate-400" />}
                value={settings.contrast}
                min={50}
                max={220}
                step={5}
                unit="%"
                onChange={(val) => {
                  setActivePreset("custom");
                  setSettings((prev) => ({ ...prev, contrast: val }));
                }}
              />
            </div>
          </div>

          {/* 3. Action Tools Grid */}
          <div className="pt-3 border-t border-slate-200">
            <div className="grid grid-cols-4 gap-1.5">
              {/* Rotate 90 deg */}
              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    rotation: (prev.rotation + 90) % 360,
                  }))
                }
                className="flex flex-col items-center justify-center p-2 rounded-xl border bg-white border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-semibold transition cursor-pointer shadow-2xs"
                title="90 Derece Saat Yönünde Döndür"
              >
                <RotateCw className="size-3.5 mb-1 text-slate-600" />
                <span>Döndür</span>
              </button>

              {/* Flip Horizontal */}
              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    isFlipped: !prev.isFlipped,
                  }))
                }
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-semibold transition cursor-pointer shadow-2xs ${
                  settings.isFlipped
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
                title="Aynalama (Yatay Çevir)"
              >
                <FlipHorizontal className="size-3.5 mb-1" />
                <span>Aynala</span>
              </button>

              {/* Grid Toggle */}
              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    showGrid: !prev.showGrid,
                  }))
                }
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-semibold transition cursor-pointer shadow-2xs ${
                  settings.showGrid
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
                title="Ölçüm Izgarasını Aç/Kapat"
              >
                <Grid className="size-3.5 mb-1" />
                <span>Izgara</span>
              </button>

              {/* Download */}
              <button
                type="button"
                onClick={handleDownload}
                className="flex flex-col items-center justify-center p-2 rounded-xl border bg-white border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-semibold transition cursor-pointer shadow-2xs"
                title="Röntgen Dosyasını İndir"
              >
                <Download className="size-3.5 mb-1 text-slate-600" />
                <span>İndir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. FULLSCREEN MEDICAL LIGHTBOX MODAL */}
      {/* ============================================================== */}
      {isFullscreen && hasPhotos && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-3 sm:p-5 text-white animate-in fade-in duration-200">
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{patientName}</span>
                  <span className="text-slate-400 font-normal">•</span>
                  <span className="text-blue-400">Radyografi İnceleme</span>
                  {filmList.length > 1 && (
                    <span className="text-xs font-mono font-bold text-slate-400">
                      ({activeFilmIndex + 1}/{filmList.length})
                    </span>
                  )}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                <span>Sıfırla</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/80 hover:text-rose-200 text-slate-300 transition cursor-pointer"
                title="Kapat (Esc)"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Fullscreen Viewport Area */}
          <div className="flex-1 my-3 overflow-hidden flex items-center justify-center">
            {ViewportContent}
          </div>
        </div>
      )}
    </>
  );
}
