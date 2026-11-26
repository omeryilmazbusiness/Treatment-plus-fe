import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { formatCurrency } from "../palettes";
import { Phone, Mail, Globe, MapPin, CheckCircle2, ShieldCheck, Sparkles, Activity } from "../icons";
import { ModernGeometricShardsTopRight, ModernGeometricShardsBottomLeft, ModernGeometricSineWaves } from "../motifs";

export function ModernGeometricTemplate({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const curr = data.currency || "TRY";

  const totalCalculated = (data.items || []).reduce((sum, it) => sum + (it.amount || 0), 0);
  const grandTotal = data.grandTotal !== undefined && data.grandTotal !== null ? data.grandTotal : totalCalculated;
  const subtotal = Math.round(grandTotal * 1.12);
  const discount = subtotal - grandTotal;

  return (
    <div
      className="relative flex min-h-[297mm] h-[297mm] max-h-[297mm] w-[210mm] flex-col justify-between bg-white text-slate-800 font-sans shadow-sm overflow-hidden box-border select-none"
      style={{ fontFamily: palette.bodyFont }}
    >
      {/* Köşe Geometrik Şeritleri (Modern_2.pdf kimliği) */}
      <ModernGeometricShardsTopRight />
      <ModernGeometricShardsBottomLeft />

      {/* 1. ÜST HEADER (Navy #0B2570 & Cyan Vurgu) */}
      <div className="h-16 w-full px-8 flex items-center justify-between text-white shrink-0 z-20" style={{ backgroundColor: "#0B2570" }}>
        <div className="flex items-center gap-3">
          {data.logoUrl ? (
            <div className="size-10 rounded-lg bg-white p-1 border border-white/40 shadow-xs">
              <img src={data.logoUrl} alt={data.clinicName} className="size-full object-contain" />
            </div>
          ) : (
            <div className="size-9 rounded-lg bg-[#00A3FF] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {(data.clinicName || "MG").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-base font-black tracking-tight text-white leading-tight">
              {data.clinicName || "Modern Dental Clinic"}
            </h1>
            <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#00A3FF]">
              {isEn ? "ADVANCED CLINICAL DENTISTRY" : "DİJİTAL DİŞ HEKİMLİĞİ & İMPLANTOLOJİ"}
            </p>
          </div>
        </div>

        <div className="text-center">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#00A3FF] block">
            {isEn ? "1-PAGE SUMMARY" : "1 SAYFALIK ÖZET PLAN"}
          </span>
          <h2 className="text-base font-black tracking-wider uppercase text-white">
            {isEn ? "TREATMENT PLAN" : "TEDAVİ PLANI"}
          </h2>
        </div>

        <div className="text-right text-[10px] font-mono space-y-0.5">
          <span className="text-white font-bold block">{data.patientName}</span>
          <span className="text-slate-300 block">{data.planNo || "#MG-2026-001"}</span>
          <span className="text-slate-400 block">{data.date}</span>
        </div>
      </div>

      {/* 2. GÖVDE: HASTA KİMLİK & TEDAVİ TABLOSU */}
      <div className="flex-1 px-8 py-4 flex flex-col justify-between space-y-3 z-10">
        {/* Hasta Bilgi Kartı */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 shadow-2xs">
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                {isEn ? "PATIENT" : "HASTA"}
              </span>
              <span className="font-bold text-slate-900 truncate block mt-0.5">{data.patientName}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                {isEn ? "DOCTOR" : "HEKİM"}
              </span>
              <span className="font-bold text-slate-800 truncate block mt-0.5">{data.doctorName || "Dr. Selin Yılmaz"}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                {isEn ? "DATE" : "TARİH"}
              </span>
              <span className="font-mono font-medium text-slate-700 block mt-0.5">{data.date}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                {isEn ? "VALIDITY" : "GEÇERLİLİK"}
              </span>
              <span className="font-mono font-medium text-slate-700 block mt-0.5">{isEn ? "30 Days" : "30 Gün"}</span>
            </div>
          </div>
        </div>

        {/* Tedavi Prosedürleri Tablosu */}
        <div className="flex-1 rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between bg-white shadow-2xs">
          <div className="bg-[#0B2570] text-white px-4 py-2 flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Activity className="size-3.5 text-[#00A3FF]" />
              <span>{isEn ? "PLANNED PROCEDURES & PHASES" : "PLANLANAN PROSEDÜRLER & AŞAMALAR"}</span>
            </span>
            <span className="font-mono text-[#00A3FF]">{(data.items || []).length} {isEn ? "Items" : "Kalem"}</span>
          </div>

          <div className="flex-1 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2 px-3 text-left">{isEn ? "Treatment" : "İşlem / Tedavi"}</th>
                  <th className="py-2 px-2 text-center">{isEn ? "Tooth" : "Diş No"}</th>
                  <th className="py-2 px-2 text-center">{isEn ? "Qty" : "Adet"}</th>
                  <th className="py-2 px-3 text-right">{isEn ? "Unit Price" : "Birim"}</th>
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

          {/* Fiyatlandırma ve Toplam Özeti */}
          <div className="bg-slate-50 border-t border-slate-200 p-3 flex items-center justify-between">
            <div className="text-[11px] text-slate-600 space-y-0.5">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                {isEn ? "Comprehensive Warranty & Clinical Precision" : "Tüm materyaller ve cerrahi işlemler klinik garantimiz altındadır."}
              </span>
              <span className="text-slate-400 text-[10px] block">
                {isEn ? "Includes temporary teeth, sutures, 3D tomography." : "Geçici dişler, anestezi, dikiş alımı ve 3D kontrol tomografisi dahildir."}
              </span>
            </div>

            <div className="text-right space-y-0.5">
              {discount > 0 && (
                <div className="text-[11px] text-slate-500 font-mono">
                  <span>{isEn ? "Subtotal:" : "Ara Toplam:"} </span>
                  <span className="line-through">{formatCurrency(subtotal, curr, data.locale)}</span>
                </div>
              )}
              <div className="text-lg font-black font-mono text-[#0B2570]">
                <span>{isEn ? "Total: " : "Net Tutar: "}</span>
                <span className="text-emerald-700">{formatCurrency(grandTotal, curr, data.locale)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. İMZA VE ONAY ALANI */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="rounded-xl border border-slate-200 p-2.5 bg-slate-50/50">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              {isEn ? "PATIENT APPROVAL" : "HASTA ONAYI"}
            </span>
            <div className="h-10 border-b border-dashed border-slate-300 flex items-end pb-1 text-[10px] text-slate-400">
              {isEn ? "Signature: " : "İmza: "}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 block">{data.patientName}</span>
          </div>

          <div className="rounded-xl border border-slate-200 p-2.5 bg-slate-50/50">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              {isEn ? "ATTENDING PHYSICIAN STAMP" : "HEKİM KAŞE & İMZA"}
            </span>
            <div className="h-10 border-b border-dashed border-slate-300 flex items-end pb-1 text-[10px] text-slate-400">
              {isEn ? "Stamp & Signature" : "Kaşe / İmza"}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 block">{data.doctorName || "Dr. Selin Yılmaz"}</span>
          </div>
        </div>
      </div>

      {/* 4. ALT FOOTER (Modern Geometric) */}
      <div className="h-10 w-full px-8 bg-[#0B2570] text-white flex items-center justify-between text-[10px] shrink-0 z-20">
        <div className="flex items-center gap-4 text-slate-300">
          <span className="flex items-center gap-1">
            <Phone className="size-3 text-[#00A3FF]" />
            {data.clinicPhone || "+90 212 555 0100"}
          </span>
          <span className="flex items-center gap-1">
            <Globe className="size-3 text-[#00A3FF]" />
            {data.clinicWebsite || "www.moderndental.com"}
          </span>
        </div>
        <span className="font-mono font-bold text-slate-400">PAGE 1 / 1</span>
      </div>
    </div>
  );
}
