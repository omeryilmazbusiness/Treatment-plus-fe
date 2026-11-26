import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { Activity, ShieldCheck, CheckCircle2, AlertCircle } from "../icons";

export function Booklet24Page9Diagnosis({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";

  const fallbackUpperJawList = [
    { tooth: "11", status: isEn ? "Intact" : "Sağlam" },
    { tooth: "12", status: isEn ? "Missing" : "Eksik" },
    { tooth: "13", status: isEn ? "Filled (composite)" : "Dolgulu (kompozit)" },
    { tooth: "14", status: isEn ? "Intact" : "Sağlam" },
    { tooth: "15", status: isEn ? "Missing" : "Eksik" },
    { tooth: "16", status: isEn ? "Missing (implant candidate)" : "Eksik (implant adayı)" },
    { tooth: "17", status: isEn ? "Crown (defective margin)" : "Kuron (uyumsuz kenar)" },
    { tooth: "18", status: isEn ? "Missing" : "Eksik" },
    { tooth: "21", status: isEn ? "Intact" : "Sağlam" },
    { tooth: "22", status: isEn ? "Filled (amalgam)" : "Dolgulu (amalgam)" },
    { tooth: "23", status: isEn ? "Intact" : "Sağlam" },
    { tooth: "24", status: isEn ? "Intact" : "Sağlam" },
    { tooth: "25", status: isEn ? "Intact" : "Sağlam" },
    { tooth: "26", status: isEn ? "Missing (implant candidate)" : "Eksik (implant adayı)" },
    { tooth: "27", status: isEn ? "Missing" : "Eksik" },
    { tooth: "28", status: isEn ? "Filled (amalgam)" : "Dolgulu (amalgam)" },
  ];

  const fallbackLowerJawList = [
    { tooth: "41", status: isEn ? "Intact" : "Sağlam" },
    { tooth: "42", status: isEn ? "Intact" : "Sağlam" },
    { tooth: "43", status: isEn ? "Intact" : "Sağlam" },
    { tooth: "44", status: isEn ? "Intact" : "Sağlam" },
    { tooth: "45", status: isEn ? "Missing" : "Eksik" },
    { tooth: "46", status: isEn ? "Missing (implant candidate)" : "Eksik (implant adayı)" },
    { tooth: "47", status: isEn ? "Missing" : "Eksik" },
    { tooth: "48", status: isEn ? "Intact" : "Sağlam" },
    { tooth: "31", status: isEn ? "Intact" : "Sağlam" },
    { tooth: "32", status: isEn ? "Intact" : "Sağlam" },
    { tooth: "33", status: isEn ? "Intact" : "Sağlam" },
    { tooth: "34", status: isEn ? "Intact" : "Sağlam" },
    { tooth: "35", status: isEn ? "Missing" : "Eksik" },
    { tooth: "36", status: isEn ? "Missing (implant candidate)" : "Eksik (implant adayı)" },
    { tooth: "37", status: isEn ? "Missing" : "Eksik" },
    { tooth: "38", status: isEn ? "Filled (amalgam)" : "Dolgulu (amalgam)" },
  ];

  const diagnosisMap = new Map<string, string>();
  if (data.diagnoses && data.diagnoses.length > 0) {
    for (const d of data.diagnoses) {
      if (d.toothNumber) {
        diagnosisMap.set(
          String(d.toothNumber).trim(),
          d.condition || d.treatment || (isEn ? "Treatment Needed" : "Tedavi Gerekiyor")
        );
      }
    }
  }

  const upperTeethNumbers = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
  const lowerTeethNumbers = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

  const hasDiagnoses = diagnosisMap.size > 0;

  const upperJawList = hasDiagnoses
    ? upperTeethNumbers.map((t) => ({
        tooth: t,
        status: diagnosisMap.get(t) || (isEn ? "Intact" : "Sağlam"),
      }))
    : fallbackUpperJawList;

  const lowerJawList = hasDiagnoses
    ? lowerTeethNumbers.map((t) => ({
        tooth: t,
        status: diagnosisMap.get(t) || (isEn ? "Intact" : "Sağlam"),
      }))
    : fallbackLowerJawList;

  return (
    <PageFrame
      data={data}
      palette={palette}
      pageNumber={9}
      totalPages={24}
      pageTitle={isEn ? "Detailed Dental Diagnosis & Findings" : "Detaylı Diş Teşhis ve Bulguları"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-4">
        {/* Başlık */}
        <div className="border-b pb-3" style={{ borderColor: palette.border }}>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-1.5"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <ShieldCheck className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "ITEMIZED CLINICAL FINDINGS" : "DİŞ DİŞ AYRINTILI TEŞHİS RAPORU"}</span>
          </div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{
              color: palette.primary,
              fontFamily: data.templateId === "botanical-serenity" ? "'Playfair Display', serif" : "inherit",
            }}
          >
            {isEn ? "Diagnosis: Upper & Lower Arch Mapping" : "Teşhis: Üst ve Alt Çene Diş Tablosu"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEn
              ? "Comprehensive tooth-by-tooth status recorded during intraoral digital scanning."
              : "3D ağız içi tarama ve klinik muayene sonucunda tespit edilen mevcut diş durumları."}
          </p>
        </div>

        {/* 2 Sütun: Üst Çene ve Alt Çene (wise_2.pdf Sayfa 9 Birebir) */}
        <div className="grid grid-cols-2 gap-4 my-auto">
          {/* Üst Çene */}
          <div className="rounded-2xl border p-4 bg-slate-50/70 space-y-2 shadow-2xs" style={{ borderColor: palette.border }}>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1.5 border-slate-200">
              {isEn ? "Diagnosis — Upper Jaw (Maxilla)" : "Teşhis — Üst Çene (Maksilla)"}
            </h3>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10.5px]">
              {upperJawList.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-0.5 border-b border-slate-100">
                  <span className="font-mono font-bold text-slate-700">{item.tooth}.</span>
                  <span className={item.status.includes("Eksik") || item.status.includes("Missing") ? "text-rose-600 font-semibold" : "text-slate-600"}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Alt Çene */}
          <div className="rounded-2xl border p-4 bg-slate-50/70 space-y-2 shadow-2xs" style={{ borderColor: palette.border }}>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1.5 border-slate-200">
              {isEn ? "Diagnosis — Lower Jaw (Mandible)" : "Teşhis — Alt Çene (Mandibula)"}
            </h3>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10.5px]">
              {lowerJawList.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-0.5 border-b border-slate-100">
                  <span className="font-mono font-bold text-slate-700">{item.tooth}.</span>
                  <span className={item.status.includes("Eksik") || item.status.includes("Missing") ? "text-rose-600 font-semibold" : "text-slate-600"}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Genel Periodontal ve Doku Durumu (wise_2.pdf Sayfa 9 altı) */}
        <div className="rounded-xl border p-3.5 bg-slate-100/80 flex items-center justify-between text-xs" style={{ borderColor: palette.border }}>
          <div className="space-y-0.5">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
              {isEn ? "GENERAL PERIODONTAL & SOFT TISSUE STATUS:" : "GENEL DİŞ ETİ VE PERİODONTAL DURUM:"}
            </span>
            <p className="text-[11px] text-slate-600">
              {isEn
                ? "Moderate localized gingivitis detected around posterior segments. Deep ultrasonic cleaning & decontamination required in Phase 1."
                : "Arka azı bölgelerinde lokalize diş eti hassasiyeti ve hafif gingivitis mevcuttur. 1. Seans başında derin ultrasonik detertraj uygulanacaktır."}
            </p>
          </div>
          <span className="rounded-lg bg-amber-100 text-amber-800 px-2.5 py-1 text-[10px] font-bold shrink-0">
            {isEn ? "Gingivitis / Grade 1" : "Gingivitis / 1. Evre"}
          </span>
        </div>
      </div>
    </PageFrame>
  );
}
