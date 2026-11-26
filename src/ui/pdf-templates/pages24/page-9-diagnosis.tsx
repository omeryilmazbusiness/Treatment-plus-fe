import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper } from "../wise-frame";
import { resolvePatientDiagnosisMap } from "./pdf-odontogram";

export function Booklet24Page9Diagnosis({
  data,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";

  // 8. sayfadaki mevcut ağız durumu (teşhis) ile birebir aynı teşhis haritasını kullan
  const diagMap = resolvePatientDiagnosisMap(data);

  const upperJawLeftNumbers = [11, 12, 13, 14, 15, 16, 17, 18];
  const upperJawRightNumbers = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerJawLeftNumbers = [41, 42, 43, 44, 45, 46, 47, 48];
  const lowerJawRightNumbers = [31, 32, 33, 34, 35, 36, 37, 38];

  const mapTeethList = (nums: number[]) =>
    nums.map((num) => {
      const entry = diagMap[String(num)];
      return {
        num,
        condition: entry?.condition || "intact",
        status: entry?.label || (isEn ? "Intact" : "Sağlam"),
      };
    });

  const upperJawLeft = mapTeethList(upperJawLeftNumbers);
  const upperJawRight = mapTeethList(upperJawRightNumbers);
  const lowerJawLeft = mapTeethList(lowerJawLeftNumbers);
  const lowerJawRight = mapTeethList(lowerJawRightNumbers);

  // Genel teşhis / hekim notları: varsa girilen genel teşhisleri kullan, yoksa diş bulgularından özet üret
  const generalDiagnoses = (data.generalDiagnoses || [])
    .map((g) => g.trim())
    .filter(Boolean);

  const buildFallbackGeneralSummary = (): string => {
    const allEntries = Object.entries(diagMap);
    const missing = allEntries.filter(([, v]) => v.condition === "missing").map(([t]) => `#${t}`);
    const caries = allEntries.filter(([, v]) => v.condition === "caries").map(([t]) => `#${t}`);
    const filled = allEntries.filter(([, v]) => v.condition === "filled").map(([t]) => `#${t}`);
    const rootCanal = allEntries.filter(([, v]) => v.condition === "root_canal").map(([t]) => `#${t}`);
    const crown = allEntries.filter(([, v]) => v.condition === "crown" || v.condition === "bridge").map(([t]) => `#${t}`);
    const implant = allEntries.filter(([, v]) => v.condition === "implant").map(([t]) => `#${t}`);

    const parts: string[] = [];
    if (missing.length > 0) {
      parts.push(
        isEn
          ? `Missing teeth (${missing.length}): ${missing.join(", ")}`
          : `Eksik dişler (${missing.length}): ${missing.join(", ")}`
      );
    }
    if (caries.length > 0) {
      parts.push(
        isEn
          ? `Caries / Decay (${caries.length}): ${caries.join(", ")}`
          : `Çürük bulgusu (${caries.length}): ${caries.join(", ")}`
      );
    }
    if (filled.length > 0) {
      parts.push(
        isEn
          ? `Existing fillings (${filled.length}): ${filled.join(", ")}`
          : `Mevcut dolgulu dişler (${filled.length}): ${filled.join(", ")}`
      );
    }
    if (rootCanal.length > 0) {
      parts.push(
        isEn
          ? `Root canal treated (${rootCanal.length}): ${rootCanal.join(", ")}`
          : `Kanal tedavili dişler (${rootCanal.length}): ${rootCanal.join(", ")}`
      );
    }
    if (crown.length > 0) {
      parts.push(
        isEn
          ? `Prosthetic crown/bridge (${crown.length}): ${crown.join(", ")}`
          : `Mevcut kuron/köprü (${crown.length}): ${crown.join(", ")}`
      );
    }
    if (implant.length > 0) {
      parts.push(
        isEn
          ? `Existing implants (${implant.length}): ${implant.join(", ")}`
          : `Mevcut implant (${implant.length}): ${implant.join(", ")}`
      );
    }
    if (parts.length === 0) {
      return isEn
        ? "All 32 teeth in upper and lower jaws were evaluated as intact."
        : "Üst ve alt çenedeki tüm dişler klinik olarak sağlam değerlendirilmiştir.";
    }
    return parts.join(" • ");
  };

  const generalText =
    generalDiagnoses.length > 0
      ? generalDiagnoses.join(" • ")
      : buildFallbackGeneralSummary();

  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_9.jpg"
      className="flex flex-col justify-start"
    >
      {/* Teşhis Tabloları (page_9.jpg içindeki temizlenmiş beyaz kart çerçevesi üzerinde) */}
      <div className="flex-1 px-[64px] py-[56px] space-y-7 select-none z-10">
        {/* 1. Üst Çene Teşhis Bloğu */}
        <div>
          <div className="bg-[#EFEFEF] py-2.5 px-3.5 mb-1">
            <h3 className="text-[15px] font-bold text-black leading-none">
              {isEn ? "Diagnosis - Upper jaw" : "Teşhis - Üst Çene"}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-x-10 text-[12.5px]">
            <div className="divide-y divide-slate-200/80">
              {upperJawLeft.map((t) => (
                <div
                  key={t.num}
                  className={`py-2 px-2 flex items-center gap-3 ${
                    t.condition === "intact" ? "text-slate-400" : "text-black font-semibold"
                  }`}
                >
                  <span className="w-6">{t.num}.</span>
                  <span className="truncate">{t.status}</span>
                </div>
              ))}
            </div>
            <div className="divide-y divide-slate-200/80">
              {upperJawRight.map((t) => (
                <div
                  key={t.num}
                  className={`py-2 px-2 flex items-center gap-3 ${
                    t.condition === "intact" ? "text-slate-400" : "text-black font-semibold"
                  }`}
                >
                  <span className="w-6">{t.num}.</span>
                  <span className="truncate">{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Alt Çene Teşhis Bloğu */}
        <div>
          <div className="bg-[#EFEFEF] py-2.5 px-3.5 mb-1">
            <h3 className="text-[15px] font-bold text-black leading-none">
              {isEn ? "Diagnosis - Lower jaw" : "Teşhis - Alt Çene"}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-x-10 text-[12.5px]">
            <div className="divide-y divide-slate-200/80">
              {lowerJawLeft.map((t) => (
                <div
                  key={t.num}
                  className={`py-2 px-2 flex items-center gap-3 ${
                    t.condition === "intact" ? "text-slate-400" : "text-black font-semibold"
                  }`}
                >
                  <span className="w-6">{t.num}.</span>
                  <span className="truncate">{t.status}</span>
                </div>
              ))}
            </div>
            <div className="divide-y divide-slate-200/80">
              {lowerJawRight.map((t) => (
                <div
                  key={t.num}
                  className={`py-2 px-2 flex items-center gap-3 ${
                    t.condition === "intact" ? "text-slate-400" : "text-black font-semibold"
                  }`}
                >
                  <span className="w-6">{t.num}.</span>
                  <span className="truncate">{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Genel Durum Bloğu */}
        <div className="pt-2">
          <div className="bg-[#EFEFEF] py-2.5 px-3.5 mb-2">
            <h3 className="text-[15px] font-bold text-black leading-none">
              {isEn ? "General" : "Genel"}
            </h3>
          </div>
          <div className="px-3.5 py-1 text-[12.5px] font-medium text-black leading-snug line-clamp-3">
            {generalText}
          </div>
        </div>
      </div>
    </WisePageWrapper>
  );
}
