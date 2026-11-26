import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { ShieldCheck, Sparkles, Activity, Layers, CheckCircle2 } from "../icons";

export function Booklet24Page4AboutClinic({
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
      pageNumber={4}
      totalPages={24}
      pageTitle={isEn ? "About Our Clinic & Facilities" : "Kliniğimiz ve Teknolojik Altyapımız"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-5">
        {/* Başlık */}
        <div className="border-b pb-3" style={{ borderColor: palette.border }}>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-1.5"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <ShieldCheck className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "ARCHITECTURAL & SURGICAL STANDARDS" : "MİMARİ VE CERRAHİ DONANIM STANDARTLARI"}</span>
          </div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{
              color: palette.primary,
              fontFamily: data.templateId === "botanical-serenity" ? "'Playfair Display', serif" : "inherit",
            }}
          >
            {isEn ? `World-Class Clinical Suites: ${data.clinicName}` : `Dünya Standartlarında Klinik Ortamı: ${data.clinicName}`}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEn
              ? "Designed for uncompromising hygiene, digital workflow, and absolute patient tranquility."
              : "Sterilizasyon disiplini, dijital iş akışı ve hasta konforunu en üst seviyeye taşımak için tasarlandı."}
          </p>
        </div>

        {/* Klinik Fotoğrafı / Mimari Vitrin */}
        <div className="rounded-2xl border p-4 bg-slate-50/70 space-y-4" style={{ borderColor: palette.border }}>
          <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 relative flex items-center justify-center shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-4">
              <span className="text-white text-xs font-bold tracking-wide">
                {data.clinicName} — {isEn ? "Digital Surgical Operating Suite" : "Cerrahi ve Dijital İmplant Operasyon Odası"}
              </span>
            </div>
            <Activity className="size-10 text-slate-400" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 flex items-center gap-1">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>{isEn ? "HEPA Filtered Positive Pressure" : "Pozitif Basınçlı HEPA Filtrasyon"}</span>
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {isEn
                  ? "Surgical rooms exceed international hospital sterilization standards to prevent any cross-contamination."
                  : "Cerrahi odalarımız hastane ameliyathane standartlarında hava sirkülasyonu ve mikrobik izolasyona sahiptir."}
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 flex items-center gap-1">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>{isEn ? "Full-Arch 3D CBCT Radiography" : "3D Konik Işınlı Dental Tomografi (CBCT)"}</span>
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {isEn
                  ? "Sub-millimeter 3D bone mapping with up to 90% reduced radiation compared to conventional scanners."
                  : "Düşük radyasyonlu 3D volumetrik tomografi ile kemik yoğunluğu ve sinir kanalları mikron hassasiyetle haritalanır."}
              </p>
            </div>
          </div>
        </div>

        {/* 3 Donanım Maddesi */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border p-3 bg-white shadow-2xs" style={{ borderColor: palette.border }}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isEn ? "IMPRESSIONS" : "ÖLÇÜ TEKNOLOJİSİ"}
            </span>
            <p className="text-xs font-bold text-slate-900 mt-1">
              {isEn ? "3Shape / Medit Intraoral Scanners" : "3Shape / Medit Ağız İçi Tarayıcı"}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {isEn ? "No nauseating paste; 100% digital 3D scans." : "Geleneksel macunsuz, 3D optik anlık ölçü."}
            </p>
          </div>

          <div className="rounded-xl border p-3 bg-white shadow-2xs" style={{ borderColor: palette.border }}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isEn ? "SURGERY" : "CERRAHİ GÜVENLİK"}
            </span>
            <p className="text-xs font-bold text-slate-900 mt-1">
              {isEn ? "Piezo Ultrasonic Surgery" : "Piezo Ultrasonik Kemik Cerrahisi"}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {isEn ? "Soft tissue preserving, zero heat trauma." : "Yumuşak dokuyu koruyan mikronize titreşim."}
            </p>
          </div>

          <div className="rounded-xl border p-3 bg-white shadow-2xs" style={{ borderColor: palette.border }}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isEn ? "COMFORT" : "HASTA KONFORU"}
            </span>
            <p className="text-xs font-bold text-slate-900 mt-1">
              {isEn ? "Conscious Sedation Option" : "Sedasyon & Ağrısız Anestezi"}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {isEn ? "Completely stress-free treatment under MD guidance." : "Anestezist kontrolünde derin rahatlık ve huzur."}
            </p>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
