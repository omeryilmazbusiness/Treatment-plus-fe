import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { formatCurrency } from "../palettes";
import { Phone, Mail, Globe, MapPin, CheckCircle2, ShieldCheck, Sparkles, Award } from "../icons";
import { NoirGoldDiagonalTopLeft, NoirGoldDiagonalBottomRight, NoirGoldFrame } from "../motifs";

export function NoirGoldTemplate({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
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
      className="relative flex min-h-[297mm] h-[297mm] max-h-[297mm] w-[210mm] flex-col justify-between text-white font-sans shadow-sm overflow-hidden box-border select-none p-8"
      style={{
        backgroundColor: "#0A0A0A",
        fontFamily: palette.bodyFont,
      }}
    >
      {/* Noir Gold Çerçeve & Köşe Şeritleri (Energetic.pdf kimliği) */}
      <NoirGoldFrame />
      <NoirGoldDiagonalTopLeft />
      <NoirGoldDiagonalBottomRight />

      {/* 1. ÜST HEADER: Lüks Gold & Carbon Black */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F5C842]/40 shrink-0 z-10">
        <div className="flex items-center gap-3">
          {data.logoUrl ? (
            <div className="size-12 rounded-xl bg-black p-1 border border-[#F5C842]/50 shadow-md">
              <img src={data.logoUrl} alt={data.clinicName} className="size-full object-contain" />
            </div>
          ) : (
            <div className="size-11 rounded-xl bg-[#F5C842] text-black font-serif font-black text-sm flex items-center justify-center shadow-md">
              {(data.clinicName || "NG").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1
              className="text-xl font-black tracking-tight text-white leading-tight"
              style={{ fontFamily: palette.headingFont }}
            >
              {data.clinicName || "Noir Gold Dental Excellence"}
            </h1>
            <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#F5C842]">
              {isEn ? "EXCLUSIVE PRIVATE DENTAL CARE" : "KİŞİYE ÖZEL LÜKS DİŞ CERRAHİSİ"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] font-mono tracking-wider uppercase text-[#F5C842] block font-bold">
            {isEn ? "1-PAGE SUMMARY" : "1 SAYFALIK ÖZET PLAN"}
          </span>
          <h2
            className="text-lg font-black uppercase text-white"
            style={{ fontFamily: palette.headingFont }}
          >
            {isEn ? "TREATMENT PLAN" : "TEDAVİ PLANI"}
          </h2>
          <span className="text-[10px] font-mono text-slate-400 block">{data.date}</span>
        </div>
      </div>

      {/* 2. GÖVDE: HASTA KİMLİK & TEDAVİ TABLOSU */}
      <div className="flex-1 py-4 flex flex-col justify-between space-y-3 z-10">
        {/* Hasta Bilgi Kartı */}
        <div className="rounded-xl border border-[#F5C842]/30 bg-white/5 backdrop-blur-md p-3.5 shadow-2xs">
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#F5C842] block">
                {isEn ? "PATIENT" : "HASTA"}
              </span>
              <span className="font-bold text-white truncate block mt-0.5">{data.patientName}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#F5C842] block">
                {isEn ? "CHIEF SURGEON" : "SORUMLU HEKİM"}
              </span>
              <span className="font-bold text-slate-200 truncate block mt-0.5">{data.doctorName || "Dr. Selin Yılmaz"}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#F5C842] block">
                {isEn ? "PLAN ID" : "PLAN NO"}
              </span>
              <span className="font-mono font-medium text-slate-300 block mt-0.5">{data.planNo || "#NG-2026-001"}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#F5C842] block">
                {isEn ? "CONTACT" : "İLETİŞİM"}
              </span>
              <span className="font-mono font-medium text-slate-300 block mt-0.5">{data.phone || "+90 212 555 0100"}</span>
            </div>
          </div>
        </div>

        {/* Tablo */}
        <div className="flex-1 rounded-xl border border-[#F5C842]/30 overflow-hidden flex flex-col justify-between bg-black/60 shadow-2xs">
          <div className="bg-gradient-to-r from-[#F5C842] to-[#D97706] text-black px-4 py-2 flex items-center justify-between text-xs font-black">
            <span style={{ fontFamily: palette.headingFont }}>
              {isEn ? "PREMIUM PROCEDURES & REHABILITATION" : "PLANLANAN PROSEDÜRLER & LÜKS RESTORASYON"}
            </span>
            <span className="font-mono font-bold text-slate-900">{(data.items || []).length} {isEn ? "Items" : "Kalem"}</span>
          </div>

          <div className="flex-1 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-white/5 text-slate-400 border-b border-[#F5C842]/20 text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2 px-3 text-left">{isEn ? "Procedure" : "İşlem / Tedavi"}</th>
                  <th className="py-2 px-2 text-center">{isEn ? "Tooth" : "Diş"}</th>
                  <th className="py-2 px-2 text-center">{isEn ? "Qty" : "Adet"}</th>
                  <th className="py-2 px-3 text-right">{isEn ? "Unit" : "Birim"}</th>
                  <th className="py-2 px-3 text-right">{isEn ? "Total" : "Tutar"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(data.items || []).slice(0, 10).map((it, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="py-1.5 px-3">
                      <span className="font-bold text-white block leading-tight">{it.treatmentName || it.name}</span>
                      {(it.notes || it.description) && <span className="text-[9px] text-slate-400 block truncate">{it.notes || it.description}</span>}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-300 font-semibold">{it.toothNumber || "-"}</td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-300">{it.quantity || 1}</td>
                    <td className="py-1.5 px-3 text-right font-mono text-slate-400">
                      {formatCurrency((it.amount || 0) / (it.quantity || 1), curr, data.locale)}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-[#F5C842]">
                      {formatCurrency(it.amount || 0, curr, data.locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fiyat Satırı */}
          <div className="bg-white/5 border-t border-[#F5C842]/20 p-3 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <span className="flex items-center gap-1 font-semibold text-[#F5C842]">
                <ShieldCheck className="size-3.5 text-[#F5C842]" />
                {isEn ? "Lifetime warranty on titanium implants." : "Titanyum implantlarda ömür boyu garanti."}
              </span>
            </div>

            <div className="text-right">
              {discount > 0 && (
                <div className="text-[11px] text-slate-400 font-mono">
                  <span>{isEn ? "Subtotal: " : "Ara Toplam: "}</span>
                  <span className="line-through">{formatCurrency(subtotal, curr, data.locale)}</span>
                </div>
              )}
              <div
                className="text-lg font-black font-mono text-[#F5C842]"
                style={{ fontFamily: palette.headingFont }}
              >
                <span>{isEn ? "Total: " : "Toplam: "}</span>
                <span>{formatCurrency(grandTotal, curr, data.locale)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* İmza */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="rounded-xl border border-[#F5C842]/30 p-2.5 bg-white/5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#F5C842] block">
              {isEn ? "PATIENT SIGNATURE" : "HASTA ONAYI"}
            </span>
            <div className="h-10 border-b border-dashed border-[#F5C842]/40 flex items-end pb-1 text-[10px] text-slate-500">
              {isEn ? "Signature: " : "İmza: "}
            </div>
            <span className="text-[9px] text-slate-300 mt-1 block">{data.patientName}</span>
          </div>

          <div className="rounded-xl border border-[#F5C842]/30 p-2.5 bg-white/5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#F5C842] block">
              {isEn ? "DOCTOR STAMP" : "HEKİM KAŞESİ"}
            </span>
            <div className="h-10 border-b border-dashed border-[#F5C842]/40 flex items-end pb-1 text-[10px] text-slate-500">
              {isEn ? "Stamp & Signature" : "Kaşe / İmza"}
            </div>
            <span className="text-[9px] text-slate-300 mt-1 block">{data.doctorName || "Dr. Selin Yılmaz"}</span>
          </div>
        </div>
      </div>

      {/* 3. ALT FOOTER */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F5C842]/30 text-[10px] text-slate-400 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <span>{data.clinicAddress || "Zorlu Center, İstanbul"}</span>
          <span>&bull;</span>
          <span>{data.clinicPhone || "+90 212 555 0100"}</span>
        </div>
        <span className="font-mono font-bold text-[#F5C842]">1 / 1</span>
      </div>
    </div>
  );
}
