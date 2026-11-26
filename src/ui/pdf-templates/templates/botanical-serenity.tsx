import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { formatCurrency } from "../palettes";
import { Phone, Mail, Globe, MapPin, CheckCircle2, ShieldCheck, HeartPulse } from "../icons";
import { BotanicalDoubleFrame, BotanicalBranchTopLeft, BotanicalBranchBottomRight } from "../motifs";

export function BotanicalSerenityTemplate({
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
      className="relative flex min-h-[297mm] h-[297mm] max-h-[297mm] w-[210mm] flex-col justify-between text-slate-800 shadow-sm overflow-hidden box-border select-none p-10"
      style={{
        backgroundColor: "#F7F6F2",
        fontFamily: palette.bodyFont,
      }}
    >
      {/* Çift Çizgi Botanik Çerçeve & Yaprak Motifi (Nature.pdf kimliği) */}
      <BotanicalDoubleFrame color="#5F7161" />
      <BotanicalBranchTopLeft color="#5F7161" />
      <BotanicalBranchBottomRight color="#5F7161" />

      {/* 1. ÜST HEADER: Botanik Zarafet */}
      <div className="flex items-center justify-between pb-4 border-b border-[#5F7161]/30 shrink-0 z-10">
        <div className="flex items-center gap-3">
          {data.logoUrl ? (
            <div className="size-12 rounded-xl bg-white p-1 border border-[#5F7161]/30 shadow-xs">
              <img src={data.logoUrl} alt={data.clinicName} className="size-full object-contain" />
            </div>
          ) : (
            <div className="size-11 rounded-xl bg-[#5F7161] text-white font-serif font-bold text-sm flex items-center justify-center shadow-xs">
              {(data.clinicName || "BS").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1
              className="text-xl font-bold tracking-tight text-[#4A584C]"
              style={{ fontFamily: palette.headingFont }}
            >
              {data.clinicName || "Doğal Gülüş Diş Kliniği"}
            </h1>
            <p className="text-[10px] tracking-widest uppercase text-[#5F7161] font-medium">
              {isEn ? "HOLISTIC & AESTHETIC DENTISTRY" : "BİYOLOJİK & ESTETİK DİŞ HEKİMLİĞİ"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] font-mono tracking-wider uppercase text-[#5F7161] block font-bold">
            {isEn ? "1-PAGE SUMMARY" : "1 SAYFALIK ÖZET PLAN"}
          </span>
          <h2
            className="text-lg font-bold uppercase text-[#4A584C]"
            style={{ fontFamily: palette.headingFont }}
          >
            {isEn ? "TREATMENT PLAN" : "TEDAVİ PLANI"}
          </h2>
          <span className="text-[10px] font-mono text-slate-500 block">{data.date}</span>
        </div>
      </div>

      {/* 2. GÖVDE: HASTA KİMLİK & TEDAVİ LİSTESİ */}
      <div className="flex-1 py-4 flex flex-col justify-between space-y-3 z-10">
        {/* Hasta Bilgi Kartı */}
        <div className="rounded-xl border border-[#5F7161]/30 bg-white/80 backdrop-blur-xs p-3.5 shadow-2xs">
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#5F7161] block">
                {isEn ? "PATIENT" : "HASTA"}
              </span>
              <span className="font-bold text-slate-900 truncate block mt-0.5">{data.patientName}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#5F7161] block">
                {isEn ? "ATTENDING DENTIST" : "SORUMLU HEKİM"}
              </span>
              <span className="font-bold text-slate-800 truncate block mt-0.5">{data.doctorName || "Dr. Selin Yılmaz"}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#5F7161] block">
                {isEn ? "PLAN ID" : "PLAN NO"}
              </span>
              <span className="font-mono font-medium text-slate-700 block mt-0.5">{data.planNo || "#BS-2026-001"}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#5F7161] block">
                {isEn ? "CONTACT" : "İLETİŞİM"}
              </span>
              <span className="font-mono font-medium text-slate-700 block mt-0.5">{data.phone || "+90 212 555 0100"}</span>
            </div>
          </div>
        </div>

        {/* Tablo */}
        <div className="flex-1 rounded-xl border border-[#5F7161]/30 overflow-hidden flex flex-col justify-between bg-white shadow-2xs">
          <div className="bg-[#5F7161] text-white px-4 py-2 flex items-center justify-between text-xs font-bold">
            <span style={{ fontFamily: palette.headingFont }}>
              {isEn ? "Procedures & Holistic Treatments" : "Uygulanacak Tedaviler & Estetik Prosedürler"}
            </span>
            <span className="font-mono text-emerald-100">{(data.items || []).length} {isEn ? "Items" : "İşlem"}</span>
          </div>

          <div className="flex-1 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[#F7F6F2] text-[#4A584C] border-b border-[#5F7161]/20 text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2 px-3 text-left">{isEn ? "Treatment" : "İşlem / Tedavi"}</th>
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
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-[#4A584C]">
                      {formatCurrency(it.amount || 0, curr, data.locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fiyat Satırı */}
          <div className="bg-[#F7F6F2] border-t border-[#5F7161]/20 p-3 flex items-center justify-between">
            <div className="text-[11px] text-[#4A584C] space-y-0.5">
              <span className="flex items-center gap-1 font-semibold">
                <CheckCircle2 className="size-3.5 text-[#5F7161]" />
                {isEn ? "Biocompatible materials, natural shade matching." : "Biyo-uyumlu malzemeler ve doğal diş estetiği güvencesi."}
              </span>
            </div>

            <div className="text-right">
              {discount > 0 && (
                <div className="text-[11px] text-slate-500 font-mono">
                  <span>{isEn ? "Subtotal: " : "Ara Toplam: "}</span>
                  <span className="line-through">{formatCurrency(subtotal, curr, data.locale)}</span>
                </div>
              )}
              <div
                className="text-lg font-black font-mono text-[#4A584C]"
                style={{ fontFamily: palette.headingFont }}
              >
                <span>{isEn ? "Total: " : "Toplam: "}</span>
                <span className="text-[#5F7161]">{formatCurrency(grandTotal, curr, data.locale)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* İmza */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="rounded-xl border border-[#5F7161]/30 p-2.5 bg-white/70">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#5F7161] block">
              {isEn ? "PATIENT SIGNATURE" : "HASTA İMZASI"}
            </span>
            <div className="h-10 border-b border-dashed border-[#5F7161]/40 flex items-end pb-1 text-[10px] text-slate-400">
              {isEn ? "Signature: " : "İmza: "}
            </div>
            <span className="text-[9px] text-slate-600 mt-1 block">{data.patientName}</span>
          </div>

          <div className="rounded-xl border border-[#5F7161]/30 p-2.5 bg-white/70">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#5F7161] block">
              {isEn ? "DOCTOR STAMP" : "HEKİM KAŞESİ"}
            </span>
            <div className="h-10 border-b border-dashed border-[#5F7161]/40 flex items-end pb-1 text-[10px] text-slate-400">
              {isEn ? "Stamp & Signature" : "Kaşe / İmza"}
            </div>
            <span className="text-[9px] text-slate-600 mt-1 block">{data.doctorName || "Dr. Selin Yılmaz"}</span>
          </div>
        </div>
      </div>

      {/* 3. ALT FOOTER */}
      <div className="flex items-center justify-between pt-3 border-t border-[#5F7161]/30 text-[10px] text-[#4A584C] shrink-0 z-10">
        <div className="flex items-center gap-4">
          <span>{data.clinicAddress || "Nişantaşı, İstanbul"}</span>
          <span>&bull;</span>
          <span>{data.clinicPhone || "+90 212 555 0100"}</span>
        </div>
        <span className="font-mono font-bold text-[#5F7161]">1 / 1</span>
      </div>
    </div>
  );
}
