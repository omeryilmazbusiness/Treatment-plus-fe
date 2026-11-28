import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { formatCurrency } from "../palettes";
import { Phone, Mail, Globe, MapPin, CheckCircle2, ShieldCheck, Sparkles, Activity } from "../icons";
import { LiquidWaveHeader, LiquidWaveFooter } from "../motifs";

export function LiquidArtTemplate({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const isAr = data.locale === "ar";
  const isRu = data.locale === "ru";
  const curr = data.currency || "TRY";

  const totalCalculated = (data.items || []).reduce((sum, it) => sum + (it.isPackage ? 0 : it.amount || 0), 0);
  const subtotal = data.subtotal !== undefined && data.subtotal !== null ? data.subtotal : totalCalculated;
  const discount = data.discountTotal !== undefined && data.discountTotal !== null ? data.discountTotal : 0;
  const grandTotal =
    data.grandTotal !== undefined && data.grandTotal !== null
      ? data.grandTotal
      : Math.max(0, subtotal - discount);

  return (
    <div
      className="relative flex min-h-[297mm] h-[297mm] max-h-[297mm] w-[210mm] flex-col justify-between bg-white text-slate-800 font-sans shadow-sm overflow-hidden box-border select-none"
      style={{ fontFamily: palette.bodyFont }}
    >
      {/* İridisant Sıvı Dalga Header & Footer (Techno.pdf kimliği) */}
      <LiquidWaveHeader primary="#8E6A78" cyan="#C9D6D8" />
      <LiquidWaveFooter primary="#8E6A78" cyan="#C9D6D8" />

      {/* 1. ÜST HEADER ALANI */}
      <div className="h-20 w-full px-8 pt-2 flex items-center justify-between text-white shrink-0 z-20">
        <div className="flex items-center gap-3">
          {data.logoUrl ? (
            <div className="size-11 rounded-xl bg-white/20 p-1 backdrop-blur-md border border-white/40 shadow-md">
              <img src={data.logoUrl} alt={data.clinicName} className="size-full object-contain" />
            </div>
          ) : (
            <div className="size-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 text-white font-bold text-sm flex items-center justify-center shadow-md">
              {(data.clinicName || "LA").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-lg font-black tracking-tight text-white leading-tight drop-shadow">
              {data.clinicName || "Liquid Art Dental Clinic"}
            </h1>
            <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-200">
              {isAr
                ? "طب الأسنان السريري المتطور"
                : isRu
                ? "ПЕРЕДОВАЯ КЛИНИЧЕСКАЯ СТОМАТОЛОГИЯ"
                : isEn
                ? "FUTURISTIC CLINICAL DENTISTRY"
                : "İLERİ TEKNOLOJİ DİŞ HEKİMLİĞİ"}
            </p>
          </div>
        </div>

        <div className="text-right text-[10px] font-mono text-white/90 drop-shadow space-y-0.5">
          <span className="font-bold text-white block text-xs">{data.patientName}</span>
          <span className="text-cyan-200 block">{data.planNo || "#LA-2026-001"}</span>
          <span className="text-white/80 block">{data.dateStr || data.date}</span>
        </div>
      </div>

      {/* 2. GÖVDE: HASTA KİMLİK & TABLO */}
      <div className="flex-1 px-8 py-3 flex flex-col justify-between space-y-3 z-10">
        {/* Hasta Bilgi Kartı */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 backdrop-blur-xs p-3 shadow-2xs">
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                {isEn ? "PATIENT" : "HASTA"}
              </span>
              <span className="font-bold text-slate-900 truncate block mt-0.5">{data.patientName}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                {isEn ? "PHYSICIAN" : "SORUMLU HEKİM"}
              </span>
              <span className="font-bold text-slate-800 truncate block mt-0.5">{data.doctorName || "Dr. Selin Yılmaz"}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                {isEn ? "DATE" : "PLAN TARİHİ"}
              </span>
              <span className="font-mono font-medium text-slate-700 block mt-0.5">{data.date}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                {isEn ? "CONTACT" : "İLETİŞİM"}
              </span>
              <span className="font-mono font-medium text-slate-700 block mt-0.5">{data.phone || "+90 212 555 0100"}</span>
            </div>
          </div>
        </div>

        {/* Tablo */}
        <div className="flex-1 rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between bg-white shadow-2xs">
          <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-cyan-400" />
              <span>{isEn ? "TREATMENT PROCEDURES" : "UYGULANACAK İŞLEMLER VE PROTEZLER"}</span>
            </span>
            <span className="font-mono text-cyan-300">{(data.items || []).length} {isEn ? "Items" : "Kalem"}</span>
          </div>

          <div className="flex-1 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2 px-3 text-left">{isEn ? "Procedure" : "İşlem"}</th>
                  <th className="py-2 px-2 text-center">{isEn ? "Tooth" : "Diş"}</th>
                  <th className="py-2 px-2 text-center">{isEn ? "Qty" : "Adet"}</th>
                  <th className="py-2 px-3 text-right">{isEn ? "Unit" : "Birim"}</th>
                  <th className="py-2 px-3 text-right">{isEn ? "Total" : "Tutar"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.items || []).slice(0, 10).map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-1.5 px-3">
                      <span className="font-bold text-slate-900 block leading-tight">{it.treatmentName || it.name}</span>
                      {(it.notes || it.description) && <span className="text-[9px] text-slate-400 block truncate">{it.notes || it.description}</span>}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-600 font-semibold">{it.toothNumber || "-"}</td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-700">{it.quantity || 1}</td>
                    <td className="py-1.5 px-3 text-right font-mono text-slate-600">
                      {formatCurrency((it.amount || 0) / (it.quantity || 1), curr, data.locale)}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(it.amount || 0, curr, data.locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fiyatlandırma Satırı */}
          <div className="bg-slate-50 border-t border-slate-200 p-3 flex items-center justify-between">
            <div className="text-[11px] text-slate-600 space-y-0.5">
              <span className="flex items-center gap-1 font-semibold text-cyan-800">
                <ShieldCheck className="size-3.5 text-cyan-600" />
                {isEn ? "Precision CAD/CAM digital guarantee." : "3D Dijital planlama ve cerrahi garanti."}
              </span>
            </div>

            <div className="text-right">
              {discount > 0 && (
                <div className="text-[11px] text-slate-500 font-mono">
                  <span>{isEn ? "Subtotal: " : "Ara Toplam: "}</span>
                  <span className="line-through">{formatCurrency(subtotal, curr, data.locale)}</span>
                </div>
              )}
              <div className="text-lg font-black font-mono text-slate-900">
                <span>{isEn ? "Net Total: " : "Genel Toplam: "}</span>
                <span className="text-cyan-700">{formatCurrency(grandTotal, curr, data.locale)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* İmza */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="rounded-xl border border-slate-200 p-2.5 bg-slate-50/50">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              {isEn ? "PATIENT SIGNATURE" : "HASTA ONAYI"}
            </span>
            <div className="h-10 border-b border-dashed border-slate-300 flex items-end pb-1 text-[10px] text-slate-400">
              {isEn ? "Signature: " : "İmza: "}
            </div>
            <span className="text-[9px] text-slate-600 mt-1 block">{data.patientName}</span>
          </div>

          <div className="rounded-xl border border-slate-200 p-2.5 bg-slate-50/50">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              {isEn ? "DOCTOR SIGNATURE & STAMP" : "DİŞ HEKİMİ KAŞE & İMZA"}
            </span>
            <div className="h-10 border-b border-dashed border-slate-300 flex items-end pb-1 text-[10px] text-slate-400">
              {isEn ? "Stamp & Signature" : "Kaşe / İmza"}
            </div>
            <span className="text-[9px] text-slate-600 mt-1 block">{data.doctorName || "Dr. Selin Yılmaz"}</span>
          </div>
        </div>
      </div>

      {/* 3. ALT FOOTER */}
      <div className="h-14 w-full px-8 pb-1 flex items-end justify-between text-white text-[10px] shrink-0 z-20">
        <div className="flex items-center gap-4 text-white/90 drop-shadow">
          <span>{data.clinicAddress || "Levent, İstanbul"}</span>
          <span>&bull;</span>
          <span>{data.clinicPhone || "+90 212 555 0100"}</span>
        </div>
        <span className="font-mono font-bold text-white drop-shadow">PAGE 1 / 1</span>
      </div>
    </div>
  );
}
