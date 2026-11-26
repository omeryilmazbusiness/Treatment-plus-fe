import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { formatCurrency } from "../palettes";
import { Phone, Mail, Globe, MapPin, CheckCircle2, ShieldCheck, Sparkles, Award } from "../icons";
import { RoyalGoldDoubleFrame, RoyalGoldRibbonTopRight, RoyalGoldRibbonBottomLeft, DoctorSignatureStamp } from "../motifs";

export function RoyalGoldTemplate({
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
      className="relative flex min-h-[297mm] h-[297mm] max-h-[297mm] w-[210mm] flex-col justify-between text-slate-900 font-sans shadow-sm overflow-hidden box-border select-none p-10 bg-white"
      style={{
        backgroundColor: "#FFFFFF",
        fontFamily: palette.bodyFont,
      }}
    >
      {/* Kraliyet Çift Altın Çerçeve & Köşe Şeritleri (media_1795647708025_1d2dcc88.jpg) */}
      <RoyalGoldDoubleFrame opacity={0.7} />
      <RoyalGoldRibbonTopRight />
      <RoyalGoldRibbonBottomLeft />

      {/* 1. ÜST HEADER: Lüks Safir & Altın Başlık */}
      <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/40 shrink-0 z-10 px-2 pt-2">
        <div className="flex items-center gap-3.5">
          {data.logoUrl ? (
            <div className="size-14 rounded-full border-2 border-[#D4AF37]/60 p-1 bg-white shadow-md">
              <img src={data.logoUrl} alt={data.clinicName} className="size-full object-contain rounded-full" />
            </div>
          ) : (
            <div className="size-13 rounded-full bg-gradient-to-br from-[#001845] to-[#0447A8] border-2 border-[#D4AF37] text-[#FFF2B2] font-serif font-black text-base flex items-center justify-center shadow-md">
              {(data.clinicName || "RG").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1
              className="text-2xl font-normal tracking-tight text-[#001845] leading-tight font-serif"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {data.clinicName || "Royal Gold Dental Excellence"}
            </h1>
            <p className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[#B8860B]">
              {isEn ? "ROYAL DENTAL HEALTHCARE • EXCLUSIVE SUITE" : "KİŞİYE ÖZEL LÜKS DENTAL TEDAVİ PLANI"}
            </p>
          </div>
        </div>

        <div className="text-right pr-6">
          <span className="text-[9px] font-mono tracking-wider uppercase text-[#B8860B] block font-bold">
            {isEn ? "1-PAGE SUMMARY" : "1 SAYFALIK ÖZET PLAN"}
          </span>
          <h2
            className="text-lg font-black uppercase text-[#001845]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {isEn ? "TREATMENT PLAN" : "TEDAVİ PLANI"}
          </h2>
          <span className="text-[10px] font-mono text-slate-500 block">{data.dateStr || data.date}</span>
        </div>
      </div>

      {/* 2. GÖVDE: HASTA KİMLİK & TEDAVİ TABLOSU */}
      <div className="flex-1 py-4 flex flex-col justify-between space-y-3.5 z-10 px-2">
        {/* Hasta Bilgi Kartı */}
        <div className="rounded-xl border border-[#D4AF37]/35 bg-[#FAF8F5] p-4 shadow-2xs">
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#B8860B] block">
                {isEn ? "PATIENT" : "HASTA"}
              </span>
              <span className="font-bold text-[#001845] truncate block mt-0.5">{data.patientName}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#B8860B] block">
                {isEn ? "CHIEF SURGEON" : "SORUMLU HEKİM"}
              </span>
              <span className="font-bold text-slate-800 truncate block mt-0.5">{data.doctorName || "Dr. Med. Dent."}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#B8860B] block">
                {isEn ? "PLAN ID" : "PLAN NO"}
              </span>
              <span className="font-mono font-medium text-slate-700 block mt-0.5">{data.planNo || "#RG-2026-001"}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#B8860B] block">
                {isEn ? "CONTACT" : "İLETİŞİM"}
              </span>
              <span className="font-mono font-medium text-slate-700 block mt-0.5">{data.phone || "+90 212 555 0100"}</span>
            </div>
          </div>
        </div>

        {/* Prosedürler Tablosu */}
        <div className="flex-1 rounded-xl border border-[#D4AF37]/35 overflow-hidden flex flex-col justify-between bg-white shadow-2xs">
          <div className="bg-gradient-to-r from-[#001845] via-[#022B69] to-[#0447A8] text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold border-b border-[#D4AF37]">
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {isEn ? "ROYAL PROCEDURES & REHABILITATION" : "PLANLANAN PROSEDÜRLER & RESTORASYON"}
            </span>
            <span className="font-mono font-bold text-[#FFF2B2]">{(data.items || []).length} {isEn ? "Items" : "Kalem"}</span>
          </div>

          <div className="flex-1 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[#FAF8F5] text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-3.5 text-left">{isEn ? "Procedure" : "İşlem / Tedavi"}</th>
                  <th className="py-2.5 px-2 text-center">{isEn ? "Tooth" : "Diş"}</th>
                  <th className="py-2.5 px-2 text-center">{isEn ? "Qty" : "Adet"}</th>
                  <th className="py-2.5 px-3.5 text-right">{isEn ? "Unit Price" : "Birim Fiyat"}</th>
                  <th className="py-2.5 px-3.5 text-right">{isEn ? "Total" : "Tutar"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.items || []).slice(0, 10).map((it, idx) => (
                  <tr key={idx} className="hover:bg-[#FFFDF9]/60">
                    <td className="py-2 px-3.5 font-medium text-slate-800">
                      <div>
                        <span>{it.treatmentName || it.name}</span>
                        {it.description && <span className="block text-[9.5px] text-slate-500">{it.description}</span>}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-700">{it.toothNumber || "-"}</td>
                    <td className="py-2 px-2 text-center font-bold text-slate-700">{it.quantity || 1}</td>
                    <td className="py-2 px-3.5 text-right font-mono text-slate-600">
                      {formatCurrency((it.amount || 0) / (it.quantity || 1), curr, data.locale)}
                    </td>
                    <td className="py-2 px-3.5 text-right font-mono font-bold text-[#001845]">
                      {formatCurrency(it.amount || 0, curr, data.locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Finansal Özet Kartı */}
          <div className="border-t border-[#D4AF37]/35 bg-[#FAF8F5] p-3 flex items-center justify-between">
            <div className="text-[10px] text-slate-600 max-w-xs space-y-0.5">
              <span className="font-bold text-[#001845] block">
                {isEn ? "Official Guarantee & Terms:" : "Resmi Garanti ve Koşullar:"}
              </span>
              <p className="text-[9.5px]">
                {isEn
                  ? "All premium surgical and prosthodontic procedures are covered by international certification and warranty."
                  : "Uygulanan tüm cerrahi ve estetik işlemler uluslararası garanti ve sertifikasyon kapsamındadır."}
              </p>
            </div>

            <div className="w-56 space-y-1 text-right text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{isEn ? "Subtotal:" : "Ara Toplam:"}</span>
                <span className="font-mono">{formatCurrency(subtotal, curr, data.locale)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>{isEn ? "Privilege Discount:" : "VIP İndirim:"}</span>
                <span className="font-mono">-{formatCurrency(discount, curr, data.locale)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#D4AF37]/40 text-sm font-black text-[#001845]">
                <span className="uppercase tracking-wider">{isEn ? "Total:" : "Genel Toplam:"}</span>
                <span className="text-base text-[#001845] font-mono font-black">
                  {formatCurrency(grandTotal, curr, data.locale)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Garanti ve İmza Kartı */}
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-[#001845] font-bold text-xs">
              <ShieldCheck className="size-4 text-[#B8860B]" />
              <span>{isEn ? "Royal Clinical Guarantee" : "Kraliyet Klinik Garantisi"}</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              {isEn
                ? "This treatment plan has been verified by the medical board with 10-year implant and aesthetic restorative warranties."
                : "Bu tedavi planı medikal kurul tarafından onaylanmış olup 10 yıllık implant ve estetik restorasyon garantisi içerir."}
            </p>
          </div>

          <div className="flex justify-end pr-6">
            <DoctorSignatureStamp
              doctorName={data.doctorName || "Sorumlu Hekim"}
              signerTitle={data.doctorTitle || "Klinik Direktörü"}
              primaryColor="#001845"
              accentColor="#D4AF37"
            />
          </div>
        </div>
      </div>

      {/* 3. ALT BİLGİ */}
      <div className="flex items-center justify-between border-t border-[#D4AF37]/40 pt-2 text-[9.5px] text-[#001845] font-medium z-10 px-2 pl-10">
        <div className="flex items-center gap-4">
          <span>{data.phone || "+90 212 555 0100"}</span>
          <span>{data.website || "www.treatment-plus.com"}</span>
          <span>{data.address || "İstanbul, Türkiye"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#B8860B] font-bold">
          <span>✦</span>
          <span>ROYAL SUITE EDITION</span>
        </div>
      </div>
    </div>
  );
}
