import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { Activity, ShieldCheck, CheckCircle2 } from "../icons";

export function Booklet24Page8Situation({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";

  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  const dynMissing = (data.diagnoses || [])
    .filter((d) => d.status === "missing" || d.condition?.toLowerCase().includes("eksik") || d.condition?.toLowerCase().includes("çekim"))
    .map((d) => Number(d.toothNumber))
    .filter(Boolean);

  const dynFilled = (data.diagnoses || [])
    .filter((d) => d.status === "cavity" || d.condition?.toLowerCase().includes("dolgu") || d.condition?.toLowerCase().includes("çürük"))
    .map((d) => Number(d.toothNumber))
    .filter(Boolean);

  const dynCrown = (data.diagnoses || [])
    .filter((d) => d.status === "crown" || d.status === "implant" || d.condition?.toLowerCase().includes("kron") || d.condition?.toLowerCase().includes("zirkonyum") || d.condition?.toLowerCase().includes("implant"))
    .map((d) => Number(d.toothNumber))
    .filter(Boolean);

  const hasDyn = (data.diagnoses && data.diagnoses.length > 0) || (data.items && data.items.some((it) => it.teeth && it.teeth.length > 0));

  const missingTeeth = hasDyn ? dynMissing : [12, 15, 16, 18, 26, 27, 45, 46, 47, 35, 36, 37];
  const filledTeeth = hasDyn ? dynFilled : [13, 22, 28, 38];
  const crownTeeth = hasDyn ? dynCrown : [17];

  return (
    <PageFrame
      data={data}
      palette={palette}
      pageNumber={8}
      totalPages={24}
      pageTitle={isEn ? "Your Current Situation & Radiography" : "Mevcut Dental Durumunuz & Röntgen"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-4">
        {/* Başlık */}
        <div className="border-b pb-3" style={{ borderColor: palette.border }}>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-1.5"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <Activity className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "DIAGNOSTIC RADIOLOGY & ODONTOGRAM" : "DİJİTAL TEŞHİS, RADYOLOJİ VE ODONTOGRAM"}</span>
          </div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{
              color: palette.primary,
              fontFamily: data.templateId === "botanical-serenity" ? "'Playfair Display', serif" : "inherit",
            }}
          >
            {isEn ? "Your Current Dental Situation" : "Mevcut Ağız ve Diş Sağlığı Durumunuz"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEn
              ? "Comprehensive 2D FDI odontogram chart and panoramic radiograph mapping."
              : "FDI uluslararası diş numaralandırma sistemiyle eksik, dolgulu ve tedavi gerektiren dişlerin haritası."}
          </p>
        </div>

        {/* 2D FDI Odontogram Haritası (wise_2.pdf Sayfa 8 Tarzı) */}
        <div className="rounded-2xl border p-4 bg-slate-50/70 space-y-4" style={{ borderColor: palette.border }}>
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{isEn ? "FDI Dental Arch (Odontogram)" : "FDI Uluslararası Dental Çene Şeması"}</span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="size-2 rounded-full border border-slate-300 bg-white" />
                {isEn ? "Intact" : "Sağlam"}
              </span>
              <span className="flex items-center gap-1 text-rose-600 font-bold">
                <span className="size-2 rounded-full bg-rose-500" />
                {isEn ? "Missing" : "Eksik Diş"}
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <span className="size-2 rounded-full bg-amber-400" />
                {isEn ? "Filled/Crown" : "Dolgulu/Kuron"}
              </span>
            </div>
          </div>

          {/* Diş Şeması Çizimi */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
            {/* Üst Çene */}
            <div className="flex justify-between items-center px-2">
              {upperTeeth.map((t) => {
                const isMissing = missingTeeth.includes(t);
                const isFilled = filledTeeth.includes(t);
                const isCrown = crownTeeth.includes(t);

                return (
                  <div key={t} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-mono font-bold text-slate-500">{t}</span>
                    <div
                      className={`size-6 rounded-md border flex items-center justify-center text-[8px] font-bold transition ${
                        isMissing
                          ? "bg-rose-50 border-rose-300 text-rose-600 line-through"
                          : isFilled
                          ? "bg-amber-50 border-amber-300 text-amber-700"
                          : isCrown
                          ? "bg-purple-50 border-purple-300 text-purple-700"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      {isMissing ? "✕" : isCrown ? "K" : isFilled ? "D" : "○"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-dashed border-slate-200" />

            {/* Alt Çene */}
            <div className="flex justify-between items-center px-2">
              {lowerTeeth.map((t) => {
                const isMissing = missingTeeth.includes(t);
                const isFilled = filledTeeth.includes(t);
                const isCrown = crownTeeth.includes(t);

                return (
                  <div key={t} className="flex flex-col items-center gap-1">
                    <div
                      className={`size-6 rounded-md border flex items-center justify-center text-[8px] font-bold transition ${
                        isMissing
                          ? "bg-rose-50 border-rose-300 text-rose-600 line-through"
                          : isFilled
                          ? "bg-amber-50 border-amber-300 text-amber-700"
                          : isCrown
                          ? "bg-purple-50 border-purple-300 text-purple-700"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      {isMissing ? "✕" : isCrown ? "K" : isFilled ? "D" : "○"}
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-500">{t}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panoramik Röntgen / Tomografi Görsel Alanı (wise_2.pdf Sayfa 8 Röntgen Alanı) */}
        <div className="rounded-2xl border p-4 bg-slate-900 text-white space-y-2 shadow-md">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="size-3.5" />
              <span>{isEn ? "Digital Panoramic Radiograph (OPG / CBCT)" : "Dijital Panoramik Röntgen Analizi"}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">1:1 CALIBRATED</span>
          </div>

          <div className="w-full h-40 rounded-xl bg-slate-950 border border-slate-800 relative flex items-center justify-center overflow-hidden">
            {/* Röntgen İllüstrasyonu / Vektörel Çene Silüeti */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
            <svg viewBox="0 0 400 120" fill="none" className="w-full h-full p-4 opacity-70" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 90 Q 200 10 360 90" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
              <path d="M60 105 Q 200 40 340 105" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
              {/* Diş ve kemik konturları */}
              <circle cx="100" cy="70" r="6" fill="#38bdf8" opacity="0.6" />
              <circle cx="140" cy="50" r="6" fill="#38bdf8" opacity="0.6" />
              <circle cx="200" cy="40" r="7" fill="#38bdf8" opacity="0.8" />
              <circle cx="260" cy="50" r="6" fill="#38bdf8" opacity="0.6" />
              <circle cx="300" cy="70" r="6" fill="#38bdf8" opacity="0.6" />
            </svg>
            <div className="absolute bottom-2 right-3 text-[9px] font-mono text-slate-500">
              {isEn ? "High-Resolution Maxillofacial Scan" : "Yüksek Çözünürlüklü Çene Radyografisi"}
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
