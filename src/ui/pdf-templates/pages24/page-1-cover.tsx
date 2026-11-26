import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { normalizeTemplateId } from "../page-frame";
import {
  ModernGeometricShardsTopRight,
  ModernGeometricShardsBottomLeft,
  ModernGeometricSineWaves,
  NoirGoldDiagonalTopLeft,
  NoirGoldDiagonalBottomRight,
  BotanicalBranchTopLeft,
  BotanicalBranchBottomRight,
  RoyalGoldCoverSparkles,
} from "../motifs";
import { Phone, Globe, Shield, Sparkles } from "../icons";

export function Booklet24Page1Cover({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const templateId = normalizeTemplateId(data.templateId);

  // 1. TEMA: MODERN GEOMETRİK (Örnek 1 - Larana Tech Blue)
  if (templateId === "modern-geometric") {
    return (
      <div
        className="a4-page relative flex flex-col justify-between bg-white text-slate-900 font-sans shadow-sm overflow-hidden box-border p-12"
        style={{
          width: "210mm",
          height: "297mm",
          minHeight: "297mm",
          maxHeight: "297mm",
          pageBreakAfter: "always",
          breakAfter: "page",
        }}
      >
        <ModernGeometricShardsTopRight primary="#0B2570" cyan="#00A3FF" opacity={0.95} />
        <ModernGeometricShardsBottomLeft primary="#0B2570" cyan="#00A3FF" opacity={0.95} />
        <ModernGeometricSineWaves color="#00A3FF" opacity={0.18} />

        {/* Üst Logo & Kurum */}
        <div className="z-10 pt-4">
          <div className="flex items-center gap-2.5">
            {data.logoUrl ? (
              <img src={data.logoUrl} alt={data.clinicName} className="h-10 object-contain" />
            ) : (
              <div className="size-10 rounded-xl bg-[#0B2570] flex items-center justify-center text-white font-black text-base shadow-md">
                {(data.clinicName || "TP").slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-bold tracking-tight text-[#0B2570]">
              {data.clinicName}
            </span>
          </div>
        </div>

        {/* Orta Başlık & Tedavi Planı Vurgusu */}
        <div className="z-10 my-auto space-y-4 max-w-lg">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#00A3FF] block mb-2">
              {isEn ? "PERSONALIZED DENTAL ROADMAP" : "KİŞİYE ÖZEL KAPSAMLI TEDAVİ PLANI"}
            </span>
            <h1 className="text-5xl font-black text-[#0B2570] tracking-tight leading-none uppercase">
              {data.clinicName}
            </h1>
            <p className="text-lg font-semibold text-slate-500 mt-2">
              {data.slogan || (isEn ? "Advanced Digital Dentistry & Aesthetics" : "İleri Dijital Diş Hekimliği & Gülüş Tasarımı")}
            </p>
          </div>

          <div className="w-16 h-1.5 bg-[#00A3FF] rounded-full" />

          {/* Hasta & Hekim Bilgi Kartı */}
          <div className="pt-6 space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {isEn ? "Prepared For" : "Hasta Adı / Soyadı"}
              </span>
              <p className="text-2xl font-black text-slate-900 italic tracking-tight">
                {data.patientName || "Hasta Bilgisi"}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {isEn ? "Prepared By" : "Sorumlu Hekim"}
              </span>
              <p className="text-xl font-black text-[#0B2570] italic tracking-tight">
                {data.doctorName || "Dr. Dt. Selin Arslan"}
              </p>
            </div>
          </div>
        </div>

        {/* Alt İletişim Butonları & Tarih */}
        <div className="z-10 flex items-center justify-between border-t border-slate-200/80 pt-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-6">
            {data.phone && (
              <span className="flex items-center gap-2">
                <div className="size-7 rounded-full bg-[#0B2570] flex items-center justify-center text-white">
                  <Phone className="size-3.5" />
                </div>
                <span className="font-bold text-slate-800">{data.phone}</span>
              </span>
            )}
            {data.website && (
              <span className="flex items-center gap-2">
                <div className="size-7 rounded-full bg-[#0B2570] flex items-center justify-center text-white">
                  <Globe className="size-3.5" />
                </div>
                <span className="font-bold text-slate-800">{data.website}</span>
              </span>
            )}
          </div>
          <span className="font-mono text-slate-400 text-[11px]">
            {data.dateStr || "2026"}
          </span>
        </div>
      </div>
    );
  }

  // 2. TEMA: BOTANİK ZARAFET (Örnek 2 - Misty Forest & Okaliptüs)
  if (templateId === "botanical-serenity") {
    return (
      <div
        className="a4-page relative flex flex-col justify-between bg-[#F7F6F2] text-slate-800 font-sans shadow-sm overflow-hidden box-border p-12"
        style={{
          width: "210mm",
          height: "297mm",
          minHeight: "297mm",
          maxHeight: "297mm",
          pageBreakAfter: "always",
          breakAfter: "page",
        }}
      >
        {/* Zarif Çift Çerçeve */}
        <div className="pointer-events-none absolute inset-6 border border-[#5F7161]/50 rounded-sm">
          <div className="absolute inset-1.5 border border-[#5F7161]/30 rounded-2xs" />
        </div>

        <BotanicalBranchTopLeft color="#4A584C" opacity={0.85} />
        <BotanicalBranchBottomRight color="#4A584C" opacity={0.85} />

        {/* Üst Rozetler */}
        <div className="z-10 flex justify-between items-center pt-2">
          <span className="rounded-full bg-[#5F7161]/15 px-3 py-1 text-[10px] font-bold text-[#4A584C] tracking-wide">
            {data.website || "@dentalclinic"}
          </span>
          <span className="rounded-full bg-[#5F7161]/15 px-3 py-1 text-[10px] font-bold text-[#4A584C] tracking-wide">
            {data.phone || "+90 212 555 0100"}
          </span>
        </div>

        {/* Merkez: Adaçayı Yeşili Yuvarlak Kavisli Kart (Örnek 2 tarzı) */}
        <div className="z-10 my-auto flex justify-center">
          <div className="w-[145mm] rounded-3xl bg-[#5F7161] text-white p-10 shadow-xl flex flex-col justify-between space-y-8 relative overflow-hidden">
            {/* Arka plan zarif filigran */}
            <div className="absolute -right-8 -bottom-8 size-40 rounded-full bg-white/5 pointer-events-none" />

            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-white/70 block mb-1">
                {isEn ? "CLINICAL TREATMENT PLAN" : "TEDAVİ PLANI & GÜLÜŞ TASARIMI"}
              </span>
              <h1
                className="text-4xl font-normal tracking-tight uppercase"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {data.clinicName}
              </h1>
            </div>

            {/* Botanik Filiz İkonu */}
            <div className="flex justify-start">
              <div className="size-14 rounded-2xl bg-white/15 flex items-center justify-center p-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="size-full text-white" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 22v-9" strokeLinecap="round" />
                  <path d="M12 13C12 7.5 17 5 21 5c0 5-2.5 10-9 10z" fill="currentColor" fillOpacity="0.3" />
                  <path d="M12 10C12 5.5 8 3 4 3c0 4.5 2 9 8 9z" fill="currentColor" fillOpacity="0.3" />
                </svg>
              </div>
            </div>

            <div className="border-t border-white/20 pt-4 space-y-2">
              <p className="text-xs text-white/80">
                {isEn ? "Prepared for:" : "Hasta:"}{" "}
                <strong className="text-white font-bold text-sm ml-1">{data.patientName || "Hasta Bilgisi"}</strong>
              </p>
              <p className="text-xs text-white/80">
                {isEn ? "Dentist:" : "Hekim:"}{" "}
                <strong className="text-white font-bold text-sm ml-1">{data.doctorName || "Dr. Dt. Selin Arslan"}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Alt Kapanış & Tarih */}
        <div className="z-10 text-center text-xs font-semibold text-slate-500">
          <p>{data.dateStr || "02.05.2026"}</p>
        </div>
      </div>
    );
  }

  // 3. TEMA: AKIŞKAN SANAT (Örnek 3 - Liquid Wave & Avant-Garde)
  if (templateId === "liquid-art") {
    return (
      <div
        className="a4-page relative flex flex-col justify-between bg-[#0B0C10] text-white font-sans shadow-sm overflow-hidden box-border p-12"
        style={{
          width: "210mm",
          height: "297mm",
          minHeight: "297mm",
          maxHeight: "297mm",
          pageBreakAfter: "always",
          breakAfter: "page",
        }}
      >
        {/* Üst Başlık & Tarih */}
        <div className="z-10 flex justify-between items-center text-xs text-slate-400 font-mono tracking-widest uppercase">
          <span>{data.dateStr || "2026 EXHIBITION"}</span>
          <span className="text-sky-400 font-bold">DIGITAL SMILE DESIGN</span>
        </div>

        {/* Orta Başlık: Büyük Avant-Garde Tipografi */}
        <div className="z-10 my-4 space-y-2">
          <h1
            className="text-6xl font-black tracking-tight leading-none uppercase text-white"
            style={{ letterSpacing: "-0.03em" }}
          >
            {data.clinicName}
          </h1>
          <p className="text-lg font-light text-slate-400 tracking-wide">
            {isEn ? "HAUTE DENTAL ESTHETICS & SURGERY" : "İLERİ DİJİTAL DİŞ HEKİMLİĞİ & ESTETİK"}
          </p>
        </div>

        {/* Sıvı 3D Akışkan Dalga İllüstrasyonu (Saf SVG Gradyan) */}
        <div className="z-10 my-auto flex items-center justify-center py-4">
          <svg viewBox="0 0 600 240" fill="none" className="w-full h-48" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="liquidGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C060A8" />
                <stop offset="50%" stopColor="#8A2BE2" />
                <stop offset="100%" stopColor="#38B6FF" />
              </linearGradient>
              <linearGradient id="liquidGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#D980FA" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0B2570" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* Smooth 3D liquid waves */}
            <path
              d="M20 120 C 140 20, 220 220, 360 80 C 480 -20, 520 180, 580 120 C 520 220, 380 40, 260 180 C 120 280, 40 180, 20 120 Z"
              fill="url(#liquidGrad1)"
            />
            <path
              d="M40 140 C 160 60, 260 200, 380 100 C 490 20, 530 160, 560 130 C 500 210, 390 70, 270 170 C 140 260, 60 190, 40 140 Z"
              fill="url(#liquidGrad2)"
            />
          </svg>
        </div>

        {/* Alt: Hasta ve Sanat Alanı Künyesi */}
        <div className="z-10 border-t border-white/15 pt-6 grid grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
              {isEn ? "PATIENT PORTFOLIO" : "HASTA PROTOKOLÜ"}
            </span>
            <p className="text-base font-bold text-white">{data.patientName}</p>
            <p className="text-slate-400 text-[11px] mt-0.5">{data.doctorName}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
              {isEn ? "THE CLINIC SUITE" : "KLİNİK MERKEZİ"}
            </span>
            <p className="text-slate-200">{data.address || "İstanbul, Türkiye"}</p>
            <p className="text-sky-400 font-bold mt-0.5">{data.phone}</p>
          </div>
        </div>
      </div>
    );
  }

  // 4. TEMA: NOIR & ALTIN PRESTİJ (Örnek 4 - Black & Gold Luxury)
  if (templateId === "noir-gold") {
    return (
      <div
        className="a4-page relative flex flex-col justify-between bg-[#0A0A0A] text-white font-sans shadow-sm overflow-hidden box-border p-12"
        style={{
          width: "210mm",
          height: "297mm",
          minHeight: "297mm",
          maxHeight: "297mm",
          pageBreakAfter: "always",
          breakAfter: "page",
        }}
      >
        <NoirGoldDiagonalTopLeft gold="#F5C842" />
        <NoirGoldDiagonalBottomRight gold="#F5C842" />

        {/* Altın İnce Çerçeve */}
        <div className="pointer-events-none absolute inset-6 border border-[#F5C842]/40 rounded-sm">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#0A0A0A] px-4 -mt-2 text-[9px] font-mono tracking-widest text-[#F5C842] uppercase">
            {isEn ? "EXCLUSIVE DENTAL EDITION" : "ÖZEL VIP DENTAL BASKI"}
          </div>
        </div>

        {/* Üst Vurgu */}
        <div className="z-10 text-center pt-6">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#F5C842]">
            {isEn ? "PRIVATE TREATMENT PLAN" : "KİŞİYE ÖZEL VIP TEDAVİ PLANI"}
          </span>
        </div>

        {/* Orta Ana Tipografi & Altın Monogram */}
        <div className="z-10 my-auto text-center space-y-6">
          <div className="mx-auto size-24 rounded-full border-2 border-[#F5C842] flex items-center justify-center p-3 shadow-[0_0_25px_rgba(245,200,66,0.2)]">
            <span
              className="text-4xl font-normal text-[#F5C842]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {(data.clinicName || "TP").slice(0, 2).toUpperCase()}
            </span>
          </div>

          <div className="space-y-2">
            <h1
              className="text-5xl font-black uppercase text-white tracking-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              {data.clinicName}
            </h1>
            <p className="text-base text-slate-400 font-light tracking-wide max-w-md mx-auto">
              {data.slogan || "Mükemmellik ve Zarafetle Yeniden Şekillenen Gülüşler"}
            </p>
          </div>

          {/* Hasta Bilgi Rozeti */}
          <div className="inline-block rounded-xl bg-white/5 border border-[#F5C842]/30 px-8 py-3 text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#F5C842] block">
              {isEn ? "PREPARED FOR" : "SAYIN"}
            </span>
            <p className="text-xl font-bold text-white mt-0.5">{data.patientName}</p>
            <p className="text-xs text-slate-400 mt-1">{data.doctorName}</p>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400 font-mono">
          <span>{data.phone || "+90 212 555 0100"}</span>
          <span className="text-[#F5C842] font-bold">{data.website || "www.treatment-plus.com"}</span>
          <span>{data.dateStr || "2026"}</span>
        </div>
      </div>
    );
  }

  // 6. TEMA: KRALİYET & ALTIN IŞILTI (Örnek 5 - Royal Gold & Stardust Cover - media_1795647653190_c1b9214a.jpg)
  if (templateId === "royal-gold") {
    return (
      <div
        className="a4-page relative flex flex-col justify-between bg-[#070709] text-white font-sans shadow-sm overflow-hidden box-border p-14 select-none"
        style={{
          width: "210mm",
          height: "297mm",
          minHeight: "297mm",
          maxHeight: "297mm",
          pageBreakAfter: "always",
          breakAfter: "page",
          backgroundColor: "#070709",
        }}
      >
        {/* Altın Tozu Dalgası, Sinüzoidal Çizgiler ve Yıldız Işıltıları */}
        <RoyalGoldCoverSparkles />

        {/* Üst Vurgu / Kurumsal Başlık (media_1795647653190_c1b9214a.jpg "Wardiere Inc.") */}
        <div className="z-10 text-center pt-8">
          <span
            className="text-xs font-serif font-normal tracking-[0.25em] text-[#D4AF37] uppercase block"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {data.slogan || (isEn ? "Wardiere Inc. • Exclusive Dental" : "ÖZEL DENTAL TEDAVİ PLANI")}
          </span>
        </div>

        {/* Orta Bölüm: Büyük Altın Serif Klinik Başlığı, İlham Cümlesi & Hasta Kartı */}
        <div className="z-10 my-auto text-center space-y-7 max-w-lg mx-auto">
          {/* Logo / Monogram */}
          {data.logoUrl ? (
            <div className="mx-auto size-20 rounded-full border border-[#D4AF37]/60 p-1 bg-black/40 backdrop-blur-md shadow-[0_0_30px_rgba(212,175,55,0.25)]">
              <img src={data.logoUrl} alt={data.clinicName} className="size-full object-contain rounded-full" />
            </div>
          ) : (
            <div className="mx-auto size-16 rounded-full border border-[#D4AF37]/60 flex items-center justify-center bg-gradient-to-b from-[#001845]/80 to-black text-[#FFF2B2] font-serif text-2xl font-bold shadow-[0_0_25px_rgba(212,175,55,0.25)]">
              {(data.clinicName || "OR").slice(0, 2).toUpperCase()}
            </div>
          )}

          {/* Ana Serif Marka Başlığı (Örn: ORNEK CLINIC) */}
          <div className="space-y-3">
            <h1
              className="text-5xl font-normal uppercase tracking-[0.14em] text-[#E8C868] drop-shadow-md"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: "0.14em",
                textShadow: "0 2px 18px rgba(212, 175, 55, 0.35)",
              }}
            >
              {data.clinicName || "ORNEK CLINIC"}
            </h1>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
            <p
              className="text-sm text-slate-200 font-light tracking-wide max-w-md mx-auto leading-relaxed"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              &ldquo;
              {data.welcomeBody ||
                (isEn
                  ? "May your success today be just the beginning of a lifetime of happiness and accomplishments."
                  : "Bugünkü başarınız ve yeni gülüşünüz, ömür boyu sürecek bir sağlık ve mutluluğun başlangıcı olsun.")}
              &rdquo;
            </p>
          </div>

          {/* Hasta & Hekim Rozeti */}
          <div className="inline-block rounded-2xl bg-white/[0.04] border border-[#D4AF37]/35 backdrop-blur-md px-10 py-4 text-center shadow-2xl">
            <span className="text-[9.5px] uppercase font-bold tracking-[0.25em] text-[#D4AF37] block">
              {isEn ? "PERSONALIZED TREATMENT DOSSIER" : "KİŞİYE ÖZEL TEDAVİ DOSYASI"}
            </span>
            <p
              className="text-2xl font-normal text-white mt-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {data.patientName}
            </p>
            <p className="text-xs text-slate-300 mt-1 font-mono">
              {data.doctorName || "Dr. Med. Dent."}
            </p>
          </div>
        </div>

        {/* Alt Bilgi: Web Sitesi & Plan No (treatment-plus.com) */}
        <div className="z-10 flex items-center justify-between border-t border-[#D4AF37]/30 pt-4 text-xs text-slate-400 font-mono">
          <span className="text-[#D4AF37] tracking-widest">{data.phone || "+90 212 555 0100"}</span>
          <span className="text-[#FFF2B2] font-semibold tracking-[0.2em] uppercase">
            {data.website || "treatment-plus.com"}
          </span>
          <span className="text-slate-400">{data.dateStr || "2026"}</span>
        </div>
      </div>
    );
  }

  // 5. TEMA: KLİNİK MİNİMAL (Varsayılan - Medikal Minimalizm)
  return (
    <div
      className="a4-page relative flex flex-col justify-between bg-white text-slate-900 font-sans shadow-sm overflow-hidden box-border"
      style={{
        width: "210mm",
        height: "297mm",
        minHeight: "297mm",
        maxHeight: "297mm",
        pageBreakAfter: "always",
        breakAfter: "page",
      }}
    >
      {/* Üst Yarı: Koyu Lacivert Arka Plan */}
      <div className="h-[46%] w-full bg-[#0F172A] relative flex flex-col justify-between p-10 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-sky-400" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-300">
              {data.clinicName}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {data.planNo || "#TP-2026-001"}
          </span>
        </div>

        <div className="my-auto space-y-2">
          <span className="rounded-md bg-sky-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-300 inline-block">
            {isEn ? "COMPREHENSIVE 24-PAGE TREATMENT PLAN" : "KİŞİYE ÖZEL 24 SAYFALIK TEDAVİ PLANI"}
          </span>
          <h1 className="text-4xl font-black tracking-tight uppercase leading-tight text-white">
            {isEn ? "PATIENT TREATMENT PLAN" : "HASTA TEDAVİ PLANI"}
          </h1>
          <p className="text-xs text-slate-300 max-w-md">
            {isEn
              ? "Digital Diagnostics, Phased Treatment Roadmap & Smile Design Portfolio"
              : "Dijital Teşhis, Aşamalı Tedavi Yol Haritası & Gülüş Tasarımı Portfolyosu"}
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>{data.dateStr || "2026"}</span>
        </div>
      </div>

      {/* Merkez: Medikal Diş ve Kalkan Amblemi */}
      <div className="relative -mt-10 flex justify-center z-20">
        <div className="size-20 rounded-full bg-[#0284C7] p-2 shadow-xl ring-4 ring-white flex items-center justify-center text-white">
          <Shield className="size-10" />
        </div>
      </div>

      {/* Alt Yarı: Beyaz Temiz Arka Plan */}
      <div className="h-[48%] w-full bg-white flex flex-col justify-between p-10 pt-4">
        <div className="space-y-6 max-w-md mx-auto w-full text-center">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {isEn ? "Patient Name" : "Hasta Adı / Soyadı"}
            </span>
            <p className="text-xl font-black text-slate-900 tracking-tight">
              {data.patientName || "Hasta Bilgisi"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {isEn ? "Attending Physician" : "Sorumlu Hekim"}
            </span>
            <p className="text-base font-bold text-slate-800">
              {data.doctorName || "Dr. Dt. Selin Arslan"}
            </p>
            <p className="text-xs text-slate-500">
              {data.doctorTitle || (isEn ? "Oral Surgeon & Implantologist" : "Çene Cerrahisi & İmplantoloji Uzmanı")}
            </p>
          </div>
        </div>

        {/* Alt Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-medium">
          <span>{data.phone || "+90 (212) 555 01 23"}</span>
          <span>{data.website || "www.treatment-plus.com"}</span>
          <span>{data.email || "info@klinik.com"}</span>
        </div>
      </div>
    </div>
  );
}
