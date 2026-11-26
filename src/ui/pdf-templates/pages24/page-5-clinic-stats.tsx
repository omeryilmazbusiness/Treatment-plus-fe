import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { Activity, ShieldCheck, HeartPulse, CheckCircle2, Award } from "../icons";

export function Booklet24Page5ClinicStats({
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
      pageNumber={5}
      totalPages={24}
      pageTitle={isEn ? "Proven Clinical Track Record" : "Klinik Deneyim ve Başarı Rakamları"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-6">
        {/* Başlık */}
        <div className="border-b pb-3" style={{ borderColor: palette.border }}>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-1.5"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <Activity className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "MEASURABLE CLINICAL EXCELLENCE" : "RAKAMLARLA KLİNİK GÜVENCE VE KAPASİTE"}</span>
          </div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{
              color: palette.primary,
              fontFamily: data.templateId === "botanical-serenity" ? "'Playfair Display', serif" : "inherit",
            }}
          >
            {isEn ? "A Legacy of Trust, Scale and Precision" : "Güven, Ölçek ve Uzmanlıkla Şekillenen Başarı"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEn
              ? "Every number reflects a restored smile, improved oral health, and lifelong patient satisfaction."
              : "Kliniğimizin yıllara dayanan deneyimi, geniş hekim kadrosu ve yüzbinlerce memnun hastası."}
          </p>
        </div>

        {/* 6 Büyük İstatistik Kartı (wise_2.pdf Sayfa 5 Birebir) */}
        <div className="grid grid-cols-2 gap-4 my-auto">
          {/* 1. Yıllık Deneyim */}
          <div className="rounded-2xl border p-5 bg-slate-50/60 flex flex-col justify-center items-center text-center space-y-1 shadow-2xs" style={{ borderColor: palette.border }}>
            <span className="text-4xl font-black text-slate-900 tracking-tight" style={{ color: palette.primary }}>
              15+
            </span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isEn ? "YEARS CLINICAL EXPERIENCE" : "YILLIK KLİNİK DENEYİM"}
            </span>
            <p className="text-[10px] text-slate-500 max-w-xs">
              {isEn ? "Pioneering digital implantology and aesthetic smile design since 2011." : "2011'den bu yana kesintisiz implantoloji ve estetik gülüş mimarisi."}
            </p>
          </div>

          {/* 2. Şube Sayısı */}
          <div className="rounded-2xl border p-5 bg-slate-50/60 flex flex-col justify-center items-center text-center space-y-1 shadow-2xs" style={{ borderColor: palette.border }}>
            <span className="text-4xl font-black text-slate-900 tracking-tight" style={{ color: palette.primary }}>
              5
            </span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isEn ? "CLINICAL BRANCHES" : "MERKEZİ KLİNİK ŞUBESİ"}
            </span>
            <p className="text-[10px] text-slate-500 max-w-xs">
              {isEn ? "Strategically located premium dental hubs equipped with full in-house labs." : "Tam donanımlı laboratuvarlara sahip merkezi sağlık kampüsleri."}
            </p>
          </div>

          {/* 3. Uzman Hekim Sayısı */}
          <div className="rounded-2xl border p-5 bg-slate-50/60 flex flex-col justify-center items-center text-center space-y-1 shadow-2xs" style={{ borderColor: palette.border }}>
            <span className="text-4xl font-black text-slate-900 tracking-tight" style={{ color: palette.primary }}>
              60+
            </span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isEn ? "SPECIALIST DENTISTS & SURGEONS" : "UZMAN DİŞ HEKİMİ VE CERRAH"}
            </span>
            <p className="text-[10px] text-slate-500 max-w-xs">
              {isEn ? "Multidisciplinary academic team covering all sub-specialties of dentistry." : "Çene cerrahisi, protez, periodontoloji ve endodonti uzman kadrosu."}
            </p>
          </div>

          {/* 4. Dental Ünite Sayısı */}
          <div className="rounded-2xl border p-5 bg-slate-50/60 flex flex-col justify-center items-center text-center space-y-1 shadow-2xs" style={{ borderColor: palette.border }}>
            <span className="text-4xl font-black text-slate-900 tracking-tight" style={{ color: palette.primary }}>
              84+
            </span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isEn ? "ADVANCED DENTAL UNITS" : "İLERİ DENTAL ÜNİTE"}
            </span>
            <p className="text-[10px] text-slate-500 max-w-xs">
              {isEn ? "Ergonomic, sterile units operating with zero cross-contamination protocols." : "Ergonomik hasta koltukları ve entegre dijital tarama monitörleri."}
            </p>
          </div>

          {/* 5. Tedavi Edilen Hasta */}
          <div className="rounded-2xl border p-5 bg-slate-50/60 flex flex-col justify-center items-center text-center space-y-1 shadow-2xs" style={{ borderColor: palette.border }}>
            <span className="text-4xl font-black text-slate-900 tracking-tight" style={{ color: palette.primary }}>
              150K+
            </span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isEn ? "SATISFIED PATIENTS" : "MUTLU VE TEDAVİ EDİLEN HASTA"}
            </span>
            <p className="text-[10px] text-slate-500 max-w-xs">
              {isEn ? "Over 45 countries represented across international dental tourism." : "45'ten fazla ülkeden gelen uluslararası sağlık turistleri."}
            </p>
          </div>

          {/* 6. Memnuniyet Oranı */}
          <div className="rounded-2xl border p-5 bg-slate-50/60 flex flex-col justify-center items-center text-center space-y-1 shadow-2xs" style={{ borderColor: palette.border }}>
            <span className="text-4xl font-black text-slate-900 tracking-tight" style={{ color: palette.primary }}>
              98%
            </span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isEn ? "PATIENT SATISFACTION RATE" : "HASTA MEMNUNİYET ORANI"}
            </span>
            <p className="text-[10px] text-slate-500 max-w-xs">
              {isEn ? "Verified independent patient reviews and long-term clinical follow-up." : "Bağımsız hasta anketleri ve 10 yıllık klinik takip başarı oranı."}
            </p>
          </div>
        </div>

        {/* Alt Güvence Notu */}
        <div className="rounded-xl border p-3 bg-slate-900 text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Award className="size-4 text-amber-400" />
            <span className="font-semibold">
              {isEn ? "Accredited by the International Medical Tourism Board" : "Uluslararası Sağlık Turizmi ve ISO Kalite Akreditasyonu"}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">ISO 9001:2015</span>
        </div>
      </div>
    </PageFrame>
  );
}
