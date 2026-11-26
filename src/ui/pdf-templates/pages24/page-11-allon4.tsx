import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { Layers, ShieldCheck, CheckCircle2, Zap, ArrowRight, Activity } from "../icons";

export function Booklet24Page11AllOn4({
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
      pageNumber={11}
      totalPages={24}
      pageTitle={isEn ? "The All-on-4® Surgical Concept" : "All-on-4® İmplant Anatomisi & Cerrahi Konsepti"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-4">
        {/* Başlık */}
        <div className="border-b pb-3" style={{ borderColor: palette.border }}>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-1.5"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <Layers className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "BIOMECHANICAL EXCELLENCE" : "İLERİ BİYOMEKANİK CERRAHİ PROTOKOLÜ"}</span>
          </div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{
              color: palette.primary,
              fontFamily: data.templateId === "botanical-serenity" ? "'Playfair Display', serif" : "inherit",
            }}
          >
            {isEn ? "The All-on-4® System Explained" : "All-on-4® İmplant Sistemi Nasıl Çalışır?"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEn
              ? "Designed to utilize unique angled implants that receive immediate biting and chewing loads."
              : "Sinüs greftine gerek duymadan, açılı arka implantlar ile aynı gün tam çiğneme stabilitesi."}
          </p>
        </div>

        {/* Anatomik Çene & İmplant Diyagramı (wise_2.pdf Sayfa 11) */}
        <div className="rounded-2xl border p-4 bg-slate-50/70 flex flex-col md:flex-row items-center gap-6" style={{ borderColor: palette.border }}>
          {/* Vektörel All-on-4 Şeması */}
          <div className="w-full md:w-64 h-40 bg-white rounded-xl border border-slate-200/80 p-2 flex items-center justify-center shrink-0 shadow-2xs">
            <svg viewBox="0 0 240 140" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 120 C 50 30, 190 30, 220 120" stroke="#cbd5e1" strokeWidth="16" strokeLinecap="round" />
              <path d="M20 120 C 50 30, 190 30, 220 120" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />

              {/* Arka Sol Açılı İmplant (35-45 Derece) */}
              <g transform="translate(60, 68) rotate(35)">
                <rect x="-4" y="-2" width="8" height="34" rx="2" fill={palette.primary} />
                <line x1="-4" y1="6" x2="4" y2="6" stroke="#ffffff" strokeWidth="1" />
                <line x1="-4" y1="12" x2="4" y2="12" stroke="#ffffff" strokeWidth="1" />
                <line x1="-4" y1="18" x2="4" y2="18" stroke="#ffffff" strokeWidth="1" />
                <rect x="-5" y="-8" width="10" height="6" rx="1" fill="#94a3b8" />
              </g>

              {/* Ön Düz İmplant 1 */}
              <g transform="translate(100, 48)">
                <rect x="-4" y="-2" width="8" height="30" rx="2" fill={palette.primary} />
                <line x1="-4" y1="6" x2="4" y2="6" stroke="#ffffff" strokeWidth="1" />
                <line x1="-4" y1="12" x2="4" y2="12" stroke="#ffffff" strokeWidth="1" />
                <rect x="-5" y="-8" width="10" height="6" rx="1" fill="#94a3b8" />
              </g>

              {/* Ön Düz İmplant 2 */}
              <g transform="translate(140, 48)">
                <rect x="-4" y="-2" width="8" height="30" rx="2" fill={palette.primary} />
                <line x1="-4" y1="6" x2="4" y2="6" stroke="#ffffff" strokeWidth="1" />
                <line x1="-4" y1="12" x2="4" y2="12" stroke="#ffffff" strokeWidth="1" />
                <rect x="-5" y="-8" width="10" height="6" rx="1" fill="#94a3b8" />
              </g>

              {/* Arka Sağ Açılı İmplant (-35-45 Derece) */}
              <g transform="translate(180, 68) rotate(-35)">
                <rect x="-4" y="-2" width="8" height="34" rx="2" fill={palette.primary} />
                <line x1="-4" y1="6" x2="4" y2="6" stroke="#ffffff" strokeWidth="1" />
                <line x1="-4" y1="12" x2="4" y2="12" stroke="#ffffff" strokeWidth="1" />
                <line x1="-4" y1="18" x2="4" y2="18" stroke="#ffffff" strokeWidth="1" />
                <rect x="-5" y="-8" width="10" height="6" rx="1" fill="#94a3b8" />
              </g>

              {/* Sabit Protez Köprüsü */}
              <path d="M35 105 C 60 25, 180 25, 205 105" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" strokeDasharray="6 3" />
            </svg>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <p className="font-semibold text-slate-900 leading-relaxed">
              {isEn
                ? "The All-on-4® technique utilizes 4 strategically positioned dental implants: two vertical in the anterior region and two angled up to 45° in the posterior."
                : "All-on-4® tekniğinde ön bölgeye 2 adet düz, arka bölgeye ise sinüs boşluklarından kaçınacak şekilde 45° açıyla 2 adet implant yerleştirilir."}
            </p>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                <span>{isEn ? "Avoids invasive sinus lifts and lengthy bone graft healing." : "Ağır kemik tozu (greft) ve sinüs lifting ameliyatlarına ihtiyacı ortadan kaldırır."}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                <span>{isEn ? "Provides immediate biting stability with provisional teeth on Day 1." : "Operasyonun ilk gününde vidalanan geçici dişlerle anında estetik ve çiğneme sağlar."}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                <span>{isEn ? "Preserves jawbone volume and natural facial dimensions." : "Çene kemiği erimesini durdurur ve dudak-yanak desteğini gençleştirir."}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 3 Bileşen Şeması */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border p-3 bg-white" style={{ borderColor: palette.border }}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              1. BİLEŞEN
            </span>
            <p className="text-xs font-bold text-slate-900 mt-0.5">
              {isEn ? "Dental Implant Fixture" : "Grade 4 Titanyum İmplant"}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {isEn ? "Root replacement anchored directly into dense cortical bone." : "Kemiğe tam tutunan mikro pürüzlü biyo-aktif yüzey."}
            </p>
          </div>

          <div className="rounded-xl border p-3 bg-white" style={{ borderColor: palette.border }}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              2. BİLEŞEN
            </span>
            <p className="text-xs font-bold text-slate-900 mt-0.5">
              {isEn ? "Multi-Unit Abutment" : "Açılı Multi-Unit Abutment"}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {isEn ? "Precision titanium connector compensating for implant angles." : "Açılı implantları ortak paralellikte kilitleyen parça."}
            </p>
          </div>

          <div className="rounded-xl border p-3 bg-white" style={{ borderColor: palette.border }}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              3. BİLEŞEN
            </span>
            <p className="text-xs font-bold text-slate-900 mt-0.5">
              {isEn ? "Screw-Retained Bridge" : "Vidalı Sabit Protez Köprüsü"}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {isEn ? "Fully fixed prosthesis; never shifts, clicks or falls out." : "Asla oynamayan, damaksız ve vida ile kilitlenen sabit dişler."}
            </p>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
