import React from "react";
import type { PdfPalette, PdfPlanData, TemplateId } from "./types";
import {
  ModernGeometricShardsTopRight,
  ModernGeometricShardsBottomLeft,
  ModernGeometricSineWaves,
  BotanicalDoubleFrame,
  BotanicalBranchTopLeft,
  BotanicalBranchBottomRight,
  LiquidWaveHeader,
  LiquidWaveFooter,
  NoirGoldDiagonalTopLeft,
  NoirGoldDiagonalBottomRight,
  NoirGoldFrame,
  RoyalGoldDoubleFrame,
  RoyalGoldRibbonTopRight,
  RoyalGoldRibbonBottomLeft,
} from "./motifs";
import { Phone, Mail, Globe, MapPin, Sparkles, Shield } from "./icons";

export function normalizeTemplateId(id?: string): TemplateId {
  if (!id) return "klinik-minimal";
  const s = String(id).toLowerCase().trim();
  switch (s) {
    case "modern":
    case "modern-geometric":
    case "prestige-minimal":
      return "modern-geometric";
    case "nature":
    case "botanical-serenity":
    case "botanical-aesthetic":
      return "botanical-serenity";
    case "soft":
    case "liquid-art":
    case "pediatric-joy":
      return "liquid-art";
    case "premium":
    case "noir-gold":
      return "noir-gold";
    case "tekno":
    case "royal-gold":
      return "royal-gold";
    case "klinik-minimal":
    case "classic-ribbon":
    case "executive-split":
    default:
      return "klinik-minimal";
  }
}

interface PageFrameProps {
  data: PdfPlanData;
  palette: PdfPalette;
  pageNumber: number;
  totalPages?: number;
  pageTitle?: string;
  isCover?: boolean;
  children: React.ReactNode;
}

export function PageFrame({
  data,
  palette,
  pageNumber,
  totalPages = 24,
  pageTitle,
  isCover = false,
  children,
}: PageFrameProps) {
  const isEn = data.locale === "en";
  const templateId = normalizeTemplateId(data.templateId);
  const showMotifs = data.showMotifs !== false;

  const isNoir = templateId === "noir-gold";
  const isRoyal = templateId === "royal-gold";
  const isBotanical = templateId === "botanical-serenity";
  const isModern = templateId === "modern-geometric";
  const isLiquid = templateId === "liquid-art";
  const isMinimal = templateId === "klinik-minimal";

  return (
    <div
      data-theme={templateId}
      className={`a4-page relative flex flex-col font-sans shadow-sm overflow-hidden box-border select-none ${
        isNoir
          ? "bg-[#0A0A0A] text-white"
          : isBotanical
          ? "bg-[#F7F6F2] text-slate-800"
          : isRoyal
          ? "bg-[#FFFFFF] text-slate-900"
          : "bg-white text-slate-800"
      }`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        height: "297mm",
        maxHeight: "297mm",
        pageBreakAfter: "always",
        breakAfter: "page",
        boxSizing: "border-box",
        backgroundColor: isNoir ? "#0A0A0A" : isBotanical ? "#F7F6F2" : "#ffffff",
        color: isNoir ? "#ffffff" : "#1e293b",
      }}
    >
      {/* ============================================================== */}
      {/* 0. TEMA BAZLI ÖZEL STİLLER (CSS DEĞİŞKENLERİ VE DOKULAR)        */}
      {/* ============================================================== */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* NOIR & ALTIN PRESTİJ (Örnek 4 - Energetic.pdf) */
            [data-theme="noir-gold"] .bg-slate-50,
            [data-theme="noir-gold"] .bg-slate-50\\/50,
            [data-theme="noir-gold"] .bg-slate-50\\/60,
            [data-theme="noir-gold"] .bg-slate-50\\/70,
            [data-theme="noir-gold"] .bg-slate-50\\/80,
            [data-theme="noir-gold"] .bg-slate-100,
            [data-theme="noir-gold"] .bg-white {
              background-color: #141414 !important;
              color: #ffffff !important;
              border-color: rgba(245, 200, 66, 0.28) !important;
            }
            [data-theme="noir-gold"] .text-slate-900,
            [data-theme="noir-gold"] .text-slate-800,
            [data-theme="noir-gold"] .text-slate-700 {
              color: #ffffff !important;
            }
            [data-theme="noir-gold"] .text-slate-600,
            [data-theme="noir-gold"] .text-slate-500,
            [data-theme="noir-gold"] .text-slate-400 {
              color: #cbd5e1 !important;
            }
            [data-theme="noir-gold"] .border-slate-200,
            [data-theme="noir-gold"] .border-slate-200\\/80,
            [data-theme="noir-gold"] .border-slate-200\\/90,
            [data-theme="noir-gold"] .border-slate-100 {
              border-color: rgba(245, 200, 66, 0.22) !important;
            }
            [data-theme="noir-gold"] .bg-blue-50,
            [data-theme="noir-gold"] .bg-sky-50,
            [data-theme="noir-gold"] .bg-cyan-50 {
              background-color: rgba(245, 200, 66, 0.14) !important;
              color: #F5C842 !important;
              border-color: rgba(245, 200, 66, 0.35) !important;
            }
            [data-theme="noir-gold"] .text-blue-800,
            [data-theme="noir-gold"] .text-sky-800,
            [data-theme="noir-gold"] .text-blue-700,
            [data-theme="noir-gold"] .text-sky-700,
            [data-theme="noir-gold"] .text-blue-600 {
              color: #F5C842 !important;
            }
            [data-theme="noir-gold"] .bg-slate-900 {
              background-color: #000000 !important;
              border: 1px solid rgba(245, 200, 66, 0.4) !important;
            }

            /* BOTANİK ZARAFET (Örnek 2 - Nature.pdf) */
            [data-theme="botanical-serenity"] h1,
            [data-theme="botanical-serenity"] h2,
            [data-theme="botanical-serenity"] h3,
            [data-theme="botanical-serenity"] .font-serif {
              font-family: 'Playfair Display', Georgia, serif !important;
            }
            [data-theme="botanical-serenity"] .bg-slate-50,
            [data-theme="botanical-serenity"] .bg-slate-50\\/50,
            [data-theme="botanical-serenity"] .bg-slate-50\\/60,
            [data-theme="botanical-serenity"] .bg-slate-50\\/70,
            [data-theme="botanical-serenity"] .bg-slate-50\\/80,
            [data-theme="botanical-serenity"] .bg-slate-100 {
              background-color: rgba(95, 113, 97, 0.08) !important;
              border-color: rgba(95, 113, 97, 0.25) !important;
            }
            [data-theme="botanical-serenity"] .border-slate-200,
            [data-theme="botanical-serenity"] .border-slate-100 {
              border-color: rgba(95, 113, 97, 0.25) !important;
            }
            [data-theme="botanical-serenity"] .bg-blue-50,
            [data-theme="botanical-serenity"] .bg-sky-50 {
              background-color: rgba(95, 113, 97, 0.14) !important;
              color: #354537 !important;
              border-color: rgba(95, 113, 97, 0.35) !important;
            }
            [data-theme="botanical-serenity"] .text-blue-800,
            [data-theme="botanical-serenity"] .text-sky-800,
            [data-theme="botanical-serenity"] .text-blue-700 {
              color: #354537 !important;
            }

            /* MODERN GEOMETRİK (Örnek 1 - Modern_2.pdf) */
            [data-theme="modern-geometric"] .border-l-4,
            [data-theme="modern-geometric"] .border-l-2 {
              border-left-color: #00A3FF !important;
            }
            [data-theme="modern-geometric"] .bg-blue-50,
            [data-theme="modern-geometric"] .bg-sky-50 {
              background-color: rgba(0, 163, 255, 0.08) !important;
              color: #0B2570 !important;
              border-color: rgba(0, 163, 255, 0.3) !important;
            }
            [data-theme="modern-geometric"] .text-blue-800,
            [data-theme="modern-geometric"] .text-sky-800,
            [data-theme="modern-geometric"] .text-blue-600 {
              color: #0B2570 !important;
            }

            /* AKIŞKAN PRESTİJ (Örnek 3 - Techno.pdf) */
            [data-theme="liquid-art"] .bg-blue-50 {
              background-color: rgba(138, 43, 226, 0.08) !important;
              color: #8A2BE2 !important;
              border-color: rgba(56, 182, 255, 0.3) !important;
            }

            /* KLİNİK MİNİMAL (12-24 Sayfa Medikal) */
            [data-theme="klinik-minimal"] .bg-blue-50 {
              background-color: #f0f9ff !important;
              color: #0284c7 !important;
              border-color: #bae6fd !important;
            }

            /* KRALİYET & ALTIN IŞILTI (Royal Gold & Sapphire) */
            [data-theme="royal-gold"] h1,
            [data-theme="royal-gold"] h2,
            [data-theme="royal-gold"] h3,
            [data-theme="royal-gold"] .font-serif {
              font-family: 'Playfair Display', Georgia, serif !important;
            }
            [data-theme="royal-gold"] .bg-blue-50,
            [data-theme="royal-gold"] .bg-sky-50 {
              background-color: rgba(0, 24, 69, 0.05) !important;
              color: #001845 !important;
              border-color: rgba(212, 175, 55, 0.35) !important;
            }
            [data-theme="royal-gold"] .text-blue-800,
            [data-theme="royal-gold"] .text-sky-800,
            [data-theme="royal-gold"] .text-blue-700 {
              color: #001845 !important;
            }
            [data-theme="royal-gold"] .border-l-4,
            [data-theme="royal-gold"] .border-l-2 {
              border-left-color: #D4AF37 !important;
            }
          `,
        }}
      />

      {/* ============================================================== */}
      {/* 1. TEMA ÖZELİNDE ARKA PLAN VE MOTİFLER                          */}
      {/* ============================================================== */}

      {/* TEMA 1: MODERN GEOMETRİK (Modern_2.pdf - Köşe Mavi Poligonlar ve Dalgalar) */}
      {isModern && (
        <>
          <ModernGeometricShardsTopRight primary="#0B2570" cyan="#00A3FF" opacity={0.92} />
          <ModernGeometricShardsBottomLeft primary="#0B2570" cyan="#00A3FF" opacity={0.92} />
          {showMotifs && <ModernGeometricSineWaves color="#00A3FF" opacity={0.08} />}
        </>
      )}

      {/* TEMA 2: BOTANİK ZARAFET (Nature.pdf - Zarif Çift Çerçeve ve Okaliptüs) */}
      {isBotanical && (
        <>
          <BotanicalDoubleFrame color="#5F7161" opacity={0.5} />
          {showMotifs && (
            <>
              <BotanicalBranchTopLeft color="#4A584C" opacity={0.92} />
              <BotanicalBranchBottomRight color="#4A584C" opacity={0.92} />
            </>
          )}
        </>
      )}

      {/* TEMA 3: AKIŞKAN PRESTİJ (Techno.pdf - Sol Üst ve Sağ Alt Dalga Kemeri) */}
      {isLiquid && (
        <>
          <LiquidWaveHeader primary="#0B2570" cyan="#00A3FF" />
          <LiquidWaveFooter primary="#0B2570" cyan="#00A3FF" />
        </>
      )}

      {/* TEMA 4: NOIR & ALTIN PRESTİJ (Energetic.pdf - Derin Karbon ve Altın Lazer Hatlar) */}
      {isNoir && (
        <>
          {showMotifs && (
            <>
              <NoirGoldDiagonalTopLeft gold="#F5C842" />
              <NoirGoldDiagonalBottomRight gold="#F5C842" />
            </>
          )}
        </>
      )}

      {/* TEMA 6: KRALİYET & ALTIN IŞILTI (Royal Gold & Sapphire) */}
      {isRoyal && (
        <>
          <RoyalGoldDoubleFrame />
          {showMotifs && (
            <>
              <RoyalGoldRibbonTopRight />
              <RoyalGoldRibbonBottomLeft />
            </>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* 2. ŞABLONA ÖZEL ÜST BAŞLIK VE ÇERÇEVE (Running Header)          */}
      {/* ============================================================== */}
      {!isCover && (
        <>
          {/* TEMA 1: MODERN GEOMETRİK (Modern_2.pdf - Açık Beyaz Antetli & Sağ Üst Şeritler) */}
          {isModern && (
            <div className="shrink-0 z-20 flex items-center justify-between px-9 pt-5 pb-3 border-b border-slate-200/80 bg-white/95 backdrop-blur-xs">
              <div className="flex items-center gap-2.5">
                {data.logoUrl ? (
                  <img src={data.logoUrl} alt={data.clinicName} className="h-7 object-contain" />
                ) : (
                  <div className="size-7 rounded-lg bg-[#0B2570] flex items-center justify-center text-white font-black text-xs shadow-xs">
                    {(data.clinicName || "TP").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="text-xs font-black tracking-tight text-[#0B2570] block leading-tight uppercase">
                    {data.clinicName}
                  </span>
                  <span className="text-[9.5px] font-bold text-[#00A3FF] tracking-wider uppercase block leading-tight">
                    {pageTitle || (isEn ? "COMPREHENSIVE TREATMENT PLAN" : "KAPSAMLI TEDAVİ PLANI")}
                  </span>
                </div>
              </div>
              <div className="text-right pr-6">
                <span className="text-[10px] font-bold text-slate-900 block leading-tight">
                  {data.patientName}
                </span>
                <span className="text-[9px] font-mono font-semibold text-[#00A3FF] leading-tight">
                  {data.planNo || "#TP-2026-001"}
                </span>
              </div>
            </div>
          )}

          {/* TEMA 2: BOTANİK ZARAFET (Nature.pdf - Çift Çerçeve İçi Zarif Tipografi) */}
          {isBotanical && (
            <div className="shrink-0 z-20 flex items-center justify-between px-12 pt-7 pb-2.5">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#5F7161]/15 px-2.5 py-0.5 text-[9px] font-bold text-[#4A584C] tracking-wide">
                  {data.website || "@reallygreatsite"}
                </span>
                <div>
                  <h4
                    className="text-sm font-normal tracking-tight text-[#354537] leading-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {data.clinicName}
                  </h4>
                  <p className="text-[10px] italic font-medium text-[#5F7161] leading-tight">
                    {pageTitle || (isEn ? "Clinical Treatment Plan" : "Klinik Tedavi Planı")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10.5px] font-medium text-[#354537] block leading-tight">
                  {data.patientName}
                </span>
                <span className="text-[9px] font-mono text-[#5F7161] leading-tight">
                  {data.dateStr || "02.05.2026"}
                </span>
              </div>
            </div>
          )}

          {/* TEMA 3: AKIŞKAN PRESTİJ (Techno.pdf - Sol Üst Dalga & Sağ Üst Logo Bandı) */}
          {isLiquid && (
            <div className="shrink-0 z-20 flex items-start justify-between px-9 pt-3 pb-2 relative min-h-[55px]">
              <div className="z-10 pt-2 pl-2">
                <span className="text-[9.5px] font-mono uppercase font-bold tracking-widest text-[#00A3FF]">
                  {pageTitle || (isEn ? "TREATMENT ROADMAP" : "TEDAVİ YOL HARİTASI")}
                </span>
              </div>
              <div className="z-10 flex items-center gap-2 text-right">
                <div>
                  <h4 className="text-xs font-black tracking-tight text-[#0B2570] uppercase leading-tight">
                    {data.clinicName}
                  </h4>
                  <span className="text-[9px] font-bold text-slate-400 block leading-tight">
                    {data.patientName}
                  </span>
                </div>
                {data.logoUrl ? (
                  <img src={data.logoUrl} alt={data.clinicName} className="h-7 object-contain" />
                ) : (
                  <div className="size-7 rounded-lg bg-[#0B2570] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                    <Sparkles className="size-3.5 text-cyan-300" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TEMA 4: NOIR & ALTIN PRESTİJ (Energetic.pdf - Derin Karbon & Hairline Başlık) */}
          {isNoir && (
            <div className="shrink-0 z-20 px-9 pt-6 pb-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-white/20">
                <div className="flex items-center gap-2 pl-8">
                  <span className="size-1.5 rounded-full bg-[#F5C842]" />
                  <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#F5C842] uppercase">
                    {data.clinicName}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold tracking-[0.35em] uppercase text-white/90">
                    {pageTitle || "HASTA TEDAVİ PLANI"}
                  </span>
                </div>
                <div className="text-right pr-2">
                  <span className="text-[9.5px] font-mono text-slate-400">
                    {data.patientName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TEMA 5: KLİNİK MİNİMAL (12-24 Sayfa Medikal Lacivert Bant) */}
          {isMinimal && (
            <div className="shrink-0 z-20 flex items-center justify-between px-8 py-3 bg-[#0F172A] text-white shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="size-2 rounded-full bg-sky-400" />
                <span className="text-xs font-bold tracking-tight text-white uppercase">
                  {data.clinicName}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-medium text-slate-300">
                  {pageTitle || (isEn ? "COMPREHENSIVE TREATMENT PLAN" : "KAPSAMLI TEDAVİ PLANI")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10.5px] font-medium text-slate-300">
                  {data.patientName}
                </span>
                <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[9px] font-mono font-bold text-sky-300">
                  {pageNumber} / {totalPages}
                </span>
              </div>
            </div>
          )}

          {/* TEMA 6: KRALİYET & ALTIN IŞILTI (Royal Gold & Sapphire) */}
          {isRoyal && (
            <div className="shrink-0 z-20 flex items-center justify-between px-10 pt-5 pb-2.5 bg-white/95">
              <div className="flex items-center gap-3">
                {data.logoUrl ? (
                  <div className="size-8 rounded-full border border-[#D4AF37]/60 p-0.5 shadow-2xs">
                    <img src={data.logoUrl} alt={data.clinicName} className="size-full object-contain rounded-full" />
                  </div>
                ) : (
                  <div className="size-8 rounded-full bg-gradient-to-br from-[#001845] to-[#0447A8] border border-[#D4AF37] flex items-center justify-center text-[#FFF2B2] font-serif font-bold text-xs shadow-2xs">
                    {(data.clinicName || "RG").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4
                    className="text-xs font-black tracking-tight text-[#001845] uppercase leading-tight font-serif"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {data.clinicName}
                  </h4>
                  <span className="text-[9px] font-bold tracking-widest text-[#B8860B] uppercase block leading-tight">
                    {pageTitle || (isEn ? "ROYAL TREATMENT PLAN" : "KAPSAMLI TEDAVİ PLANI")}
                  </span>
                </div>
              </div>
              <div className="text-right pr-6">
                <span className="text-[10px] font-bold text-[#001845] block leading-tight">
                  {data.patientName}
                </span>
                <span className="inline-block rounded-full bg-[#001845] px-2 py-0.5 text-[8.5px] font-mono font-bold text-[#FFF2B2] border border-[#D4AF37]/40 leading-none mt-0.5">
                  {data.planNo || "#RG-2026-001"}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* 3. SAYFA İÇERİĞİ (Gövde)                                       */}
      {/* ============================================================== */}
      <div
        className={`flex-1 flex flex-col justify-between overflow-hidden z-10 ${
          isCover
            ? "p-0"
            : isBotanical
            ? "px-12 py-3"
            : isLiquid
            ? "px-9 py-3"
            : isNoir
            ? "px-9 py-3"
            : isModern
            ? "px-9 py-3.5"
            : "px-8 py-4"
        }`}
      >
        {children}
      </div>

      {/* ============================================================== */}
      {/* 4. ŞABLONA ÖZEL ALT BİLGİ BANDI (Running Footer)                */}
      {/* ============================================================== */}
      {!isCover && (
        <>
          {/* TEMA 1: MODERN GEOMETRİK (Modern_2.pdf - Telefon & Web Mavi Daire Rozetleri) */}
          {isModern && (
            <div className="shrink-0 z-20 flex items-center justify-between px-9 py-3 border-t border-slate-200/80 bg-white/95 backdrop-blur-xs text-[9.5px]">
              <div className="flex items-center gap-6 pl-8">
                {data.phone && (
                  <span className="flex items-center gap-1.5 font-bold text-[#0B2570]">
                    <div className="size-5 rounded-full bg-[#0B2570] flex items-center justify-center text-white">
                      <Phone className="size-2.5" />
                    </div>
                    <span>{data.phone}</span>
                  </span>
                )}
                {data.website && (
                  <span className="flex items-center gap-1.5 font-bold text-[#0B2570]">
                    <div className="size-5 rounded-full bg-[#0B2570] flex items-center justify-center text-white">
                      <Globe className="size-2.5" />
                    </div>
                    <span>{data.website}</span>
                  </span>
                )}
              </div>
              <span className="font-bold text-[#0B2570] tracking-wider text-[10px]">
                {isEn ? `Page ${pageNumber} of ${totalPages}` : `Sayfa ${pageNumber} / ${totalPages}`}
              </span>
            </div>
          )}

          {/* TEMA 2: BOTANİK ZARAFET (Nature.pdf - Zarif İnce Çizgi & Ayrık Künye) */}
          {isBotanical && (
            <div className="shrink-0 z-20 px-12 pb-6 pt-2">
              <div className="flex items-center justify-between pt-2 border-t border-[#5F7161]/30 text-[9.5px] text-[#5F7161]">
                <span>{data.phone || "+90 212 555 0100"}</span>
                <span className="italic font-medium">{data.website || "www.treatment-plus.com"}</span>
                <span className="font-bold text-[#354537]">
                  {pageNumber} / {totalPages}
                </span>
              </div>
            </div>
          )}

          {/* TEMA 3: AKIŞKAN PRESTİJ (Techno.pdf - Sol Alt 3 Daire Rozet & Sağ Alt Dalga) */}
          {isLiquid && (
            <div className="shrink-0 z-20 flex items-center justify-between px-9 pb-4 pt-1 text-[9.5px] relative min-h-[48px]">
              <div className="z-10 flex items-center gap-4 text-slate-700 font-semibold">
                {data.phone && (
                  <span className="flex items-center gap-1.5">
                    <div className="size-5 rounded-full bg-[#0B2570] flex items-center justify-center text-white">
                      <Phone className="size-2.5" />
                    </div>
                    <span>{data.phone}</span>
                  </span>
                )}
                {data.email && (
                  <span className="flex items-center gap-1.5">
                    <div className="size-5 rounded-full bg-[#0B2570] flex items-center justify-center text-white">
                      <Mail className="size-2.5" />
                    </div>
                    <span>{data.email}</span>
                  </span>
                )}
                {data.website && (
                  <span className="flex items-center gap-1.5">
                    <div className="size-5 rounded-full bg-[#0B2570] flex items-center justify-center text-white">
                      <Globe className="size-2.5" />
                    </div>
                    <span>{data.website}</span>
                  </span>
                )}
              </div>
              <span className="z-10 font-bold text-[#0B2570] pr-2">
                {pageNumber} / {totalPages}
              </span>
            </div>
          )}

          {/* TEMA 4: NOIR & ALTIN PRESTİJ (Energetic.pdf - Alt Hairline & Tracked URL) */}
          {isNoir && (
            <div className="shrink-0 z-20 px-9 pb-6 pt-2">
              <div className="flex items-center justify-between pt-2 border-t border-white/20 text-[9px] font-mono text-slate-400">
                <span className="tracking-[0.2em]">{data.website || "WWW.TREATMENT-PLUS.COM"}</span>
                <span className="text-[#F5C842] font-bold tracking-widest">{data.phone}</span>
                <span className="text-[#F5C842] font-bold pr-8">
                  {pageNumber} / {totalPages}
                </span>
              </div>
            </div>
          )}

          {/* TEMA 5: KLİNİK MİNİMAL (12-24 Sayfa Medikal Alt Bilgi) */}
          {isMinimal && (
            <div className="shrink-0 z-20 flex items-center justify-between px-8 py-2.5 border-t border-slate-200 bg-[#f8fafc] text-[9.5px] text-slate-500">
              <div className="flex items-center gap-4">
                {data.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="size-2.5 text-sky-600" />
                    <span>{data.phone}</span>
                  </span>
                )}
                {data.website && (
                  <span className="flex items-center gap-1">
                    <Globe className="size-2.5 text-sky-600" />
                    <span>{data.website}</span>
                  </span>
                )}
              </div>
              <span className="font-bold text-slate-700">
                Sayfa {pageNumber} / {totalPages}
              </span>
            </div>
          )}

          {/* TEMA 6: KRALİYET & ALTIN IŞILTI (Royal Gold & Sapphire - Zarif Altın Çizgi & Safir Künye) */}
          {isRoyal && (
            <div className="shrink-0 z-20 px-10 pb-4 pt-1">
              <div className="flex items-center justify-between pt-2 border-t border-[#D4AF37]/40 text-[9.5px] text-[#001845] font-medium pl-8">
                <div className="flex items-center gap-4">
                  {data.phone && (
                    <span className="flex items-center gap-1 font-semibold">
                      <Phone className="size-2.5 text-[#B8860B]" />
                      <span>{data.phone}</span>
                    </span>
                  )}
                  {data.website && (
                    <span className="flex items-center gap-1 font-semibold">
                      <Globe className="size-2.5 text-[#B8860B]" />
                      <span>{data.website}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-[#D4AF37]">✦</span>
                  <span className="font-bold text-[#001845] tracking-wider text-[10px]">
                    {isEn ? `Page ${pageNumber} / ${totalPages}` : `Sayfa ${pageNumber} / ${totalPages}`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
