import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { Award, Sparkles, ShieldCheck } from "../icons";

export function Booklet24Page21Trophy({
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
      pageNumber={21}
      totalPages={24}
      pageTitle={isEn ? "The European Awards: Clinical Excellence" : "Avrupa Sağlık Ödülleri: Mükemmellik Nişanesi"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-4">
        {/* Başlık */}
        <div className="space-y-1.5">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <Sparkles className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "CONTINENTAL RECOGNITION IN HEALTHCARE" : "SAĞLIKTA AVRUPA ÇAPINDA TESCİLLENEN BAŞARI"}</span>
          </div>

          <h2
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: palette.primary, fontFamily: palette.headingFont }}
          >
            {isEn ? "The European Awards" : "Avrupa Sağlık ve Tedavi Ödülü"}
          </h2>

          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {isEn
              ? "Honored with 'The European Awards' for groundbreaking clinical precision, patient safety, and high-satisfaction dental tourism protocols. Our commitment remains steadfast: bringing world-class smiles within patient reach."
              : "Yüksek cerrahi başarı oranları, hasta güvenliği standartları ve uluslararası hasta memnuniyeti protokolleri sayesinde layık görüldüğümüz 'The European Awards' ödülü; hastalarımıza dünya standartlarında tedavi sunma vizyonumuzun bir simgesidir."}
          </p>
        </div>

        {/* Heykel / Kupa Görsel Alanı (wise_2.pdf sayfa 21'deki altın kupa) */}
        <div
          className="flex-1 rounded-2xl border p-5 flex flex-col items-center justify-between relative overflow-hidden shadow-sm"
          style={{
            backgroundColor: palette.cardBg,
            borderColor: palette.border,
            backgroundImage: "radial-gradient(circle at 50% 40%, rgba(245,200,66,0.12) 0%, rgba(15,23,42,0.03) 100%)",
          }}
        >
          {/* Altın Kupa Vektör İllüstrasyonu */}
          <div className="flex-1 flex flex-col items-center justify-center my-auto">
            <div className="relative size-44 flex items-center justify-center">
              {/* Kupa Gövdesi */}
              <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-xl">
                {/* Alt Kaide */}
                <rect x="50" y="200" width="100" height="24" rx="4" fill="#334155" stroke="#1E293B" strokeWidth="2" />
                <rect x="65" y="185" width="70" height="15" rx="2" fill="#475569" />
                {/* Heykel Gövdesi (Kollar yukarıda küre tutan figür) */}
                <path
                  d="M 100 185 L 90 130 C 80 110 70 80 50 60 C 45 55 52 48 58 52 C 75 65 85 95 95 115 L 98 185 Z"
                  fill="url(#goldGradient)"
                />
                <path
                  d="M 100 185 L 110 130 C 120 110 130 80 150 60 C 155 55 148 48 142 52 C 125 65 115 95 105 115 L 102 185 Z"
                  fill="url(#goldGradient)"
                />
                {/* Baş / Boyun */}
                <circle cx="100" cy="110" r="10" fill="url(#goldGradient)" />

                {/* Yukarıda Tutulan Avrupa Yıldızlı Küresi */}
                <circle cx="100" cy="50" r="38" fill="url(#goldGradient)" stroke="#F59E0B" strokeWidth="2" />
                <circle cx="100" cy="50" r="32" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />

                {/* Yıldızlar Çemberi */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <circle
                    key={deg}
                    cx={100 + 22 * Math.cos((deg * Math.PI) / 180)}
                    cy={50 + 22 * Math.sin((deg * Math.PI) / 180)}
                    r="1.8"
                    fill="#FFFFFF"
                  />
                ))}

                <text x="100" y="47" textAnchor="middle" fill="#FFFFFF" fontSize="6" fontWeight="bold" letterSpacing="0.5">THE</text>
                <text x="100" y="54" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="900" letterSpacing="1">EUROPEAN</text>
                <text x="100" y="60" textAnchor="middle" fill="#FFFFFF" fontSize="5.5" fontWeight="bold" letterSpacing="0.5">AWARDS</text>

                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="50%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#78350F" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="mt-2 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-800 bg-white/90 px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                PARIS &bull; BEST DENTAL IMPLANTOLOGY CLINIC
              </span>
            </div>
          </div>

          {/* Alt Ödül Plaketi */}
          <div className="w-full bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="size-5 text-amber-400" />
              <div>
                <span className="text-xs font-bold block">
                  {isEn ? "Excellence in Dental Surgery & Patient Care" : "Cerrahi ve Hasta Bakımında Mükemmellik"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isEn ? "Evaluated across 40+ medical parameters" : "40'tan fazla klinik kalite kriteri ile değerlendirilmiştir"}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">WINNER</span>
          </div>
        </div>

        {/* Alt Güvence */}
        <div
          className="rounded-xl border p-2.5 flex items-center justify-between text-xs"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <span className="text-slate-600 flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            {isEn ? "Ranked among top dental healthcare providers in Europe." : "Avrupa genelinde en yüksek hasta tavsiye oranına sahip klinikler arasında."}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-700">98.8% SATISFACTION</span>
        </div>
      </div>
    </PageFrame>
  );
}
