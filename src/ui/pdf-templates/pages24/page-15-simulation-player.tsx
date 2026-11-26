import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { Play, Pause, SkipBack, SkipForward, Sparkles } from "../icons";

export function Booklet24Page15SimulationPlayer({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";

  return (
    <PageFrame
      data={data}
      palette={palette}
      pageNumber={15}
      totalPages={24}
      pageTitle={isEn ? "3D Surgical Simulation Player" : "3D Cerrahi Simülasyon Oynatıcı Ekranı"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-3">
        {/* Üst Başlık Bilgisi */}
        <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: palette.border }}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {isEn ? "Interactive 3D Virtual Surgery Simulation" : "İnteraktif 3D Sanal Cerrahi Simülasyonu"}
            </span>
            <h2
              className="text-xl font-bold tracking-tight"
              style={{ color: palette.primary, fontFamily: palette.headingFont }}
            >
              {isEn ? "Live Implant Placement & Tissue Mapping" : "Canlı İmplant Yerleşimi & Doku Haritası"}
            </h2>
          </div>
          <span
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            STAGE 2 / 4
          </span>
        </div>

        {/* 3D Simülasyon Ekranı (wise_2.pdf sayfa 15'teki anatomik ağız ve implant modeli) */}
        <div
          className="flex-1 rounded-2xl border flex flex-col items-center justify-between p-4 relative shadow-inner overflow-hidden"
          style={{
            backgroundColor: "#F8FAFC",
            borderColor: palette.border,
            backgroundImage: "radial-gradient(circle at 50% 50%, #FFFFFF 0%, #F1F5F9 100%)",
          }}
        >
          {/* Üst Çene Anatomik Çizim Vektörü */}
          <div className="w-full flex flex-col items-center justify-center my-auto">
            {/* Üst Çene / Damak Vektörü */}
            <div className="relative w-64 h-36 flex items-center justify-center">
              <svg viewBox="0 0 280 150" className="w-full h-full drop-shadow-md">
                {/* Damak ve Diş Eti Kavisi */}
                <path
                  d="M 30,130 C 35,40 100,15 140,15 C 180,15 245,40 250,130 C 230,120 180,85 140,85 C 100,85 50,120 30,130 Z"
                  fill="#F87171"
                  opacity="0.88"
                />
                <path
                  d="M 50,120 C 70,55 110,35 140,35 C 170,35 210,55 230,120 C 200,105 170,95 140,95 C 110,95 80,105 50,120 Z"
                  fill="#EF4444"
                  opacity="0.95"
                />

                {/* Üst Kesiciler ve İmplant Abutmentları */}
                {/* Santral ve Lateral Dişler */}
                <ellipse cx="125" cy="48" rx="10" ry="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <ellipse cx="155" cy="48" rx="10" ry="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <ellipse cx="102" cy="56" rx="8" ry="12" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" transform="rotate(-15 102 56)" />
                <ellipse cx="178" cy="56" rx="8" ry="12" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" transform="rotate(15 178 56)" />

                {/* İmplant Titanyum Dayanakları (All-on-4 Açılı) */}
                <path d="M 80,72 L 72,110 L 84,110 Z" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
                <circle cx="80" cy="72" r="3.5" fill="#38BDF8" />

                <path d="M 200,72 L 208,110 L 196,110 Z" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
                <circle cx="200" cy="72" r="3.5" fill="#38BDF8" />
              </svg>
            </div>

            {/* Simülasyon Aşaması Başlığı */}
            <div className="my-2 text-center">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-800 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                {isEn ? "IMPLANTATIONS & 3D BONE ANCHORING" : "İMPLANTASYON & 3D KEMİK ANKRAJI"}
              </span>
            </div>

            {/* Alt Çene / Dil Anatomik Çizim Vektörü */}
            <div className="relative w-64 h-36 flex items-center justify-center">
              <svg viewBox="0 0 280 150" className="w-full h-full drop-shadow-md">
                {/* Alt Çene ve Dil Kavisi */}
                <path
                  d="M 35,20 C 50,110 100,135 140,135 C 180,135 230,110 245,20 C 225,40 180,60 140,60 C 100,60 55,40 35,20 Z"
                  fill="#F87171"
                  opacity="0.88"
                />
                {/* Dil */}
                <ellipse cx="140" cy="55" rx="45" ry="32" fill="#FB7185" opacity="0.9" />

                {/* Alt Çene İmplant Dayanakları */}
                <path d="M 90,45 L 85,15 L 97,15 Z" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
                <circle cx="90" cy="45" r="3.5" fill="#10B981" />

                <path d="M 190,45 L 195,15 L 183,15 Z" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
                <circle cx="190" cy="45" r="3.5" fill="#10B981" />
              </svg>
            </div>
          </div>

          {/* Oynatıcı Kontrol Çubuğu (Previous / Pause / Next) */}
          <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-2.5 shadow-md flex items-center justify-between px-4">
            <button
              type="button"
              className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
            >
              <SkipBack className="size-4" />
            </button>

            <button
              type="button"
              className="size-10 rounded-full flex items-center justify-center text-white shadow-md transition"
              style={{ backgroundColor: palette.primary }}
            >
              <Pause className="size-5 fill-white" />
            </button>

            <button
              type="button"
              className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
            >
              <SkipForward className="size-4" />
            </button>
          </div>
        </div>

        {/* Video Bilgi Notu */}
        <div
          className="rounded-xl border p-2.5 flex items-center justify-between text-xs"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <span className="text-slate-600">
            {isEn
              ? "Pre-computed 3D simulation calibrated with CBCT tomographic bone density."
              : "CBCT tomografi kemik yoğunluğu ile kalibre edilmiş milimetrik 3D simülasyon çıktısı."}
          </span>
          <span className="font-mono text-slate-500 text-[11px]">02:14 / 04:30</span>
        </div>
      </div>
    </PageFrame>
  );
}
