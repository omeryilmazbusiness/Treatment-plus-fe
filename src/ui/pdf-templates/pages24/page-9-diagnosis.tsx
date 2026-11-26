import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper } from "../wise-frame";

export function Booklet24Page9Diagnosis({
  data,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";

  // Dinamik teşhis eşlemesi varsa kullan, yoksa varsayılan wise_2 teşhis tablosu
  const diagMap = new Map<string, string>();
  for (const d of data.diagnoses || []) {
    if (d.toothNumber && d.condition) {
      diagMap.set(String(d.toothNumber), d.condition);
    }
  }

  const getStatus = (num: number, fallbackEn: string, fallbackTr: string) => {
    const custom = diagMap.get(String(num));
    if (custom) return custom;
    return isEn ? fallbackEn : fallbackTr;
  };

  const upperJawLeft = [
    { num: 11, status: getStatus(11, "Intact", "Sağlam") },
    { num: 12, status: getStatus(12, "Missing", "Eksik") },
    { num: 13, status: getStatus(13, "Filled (amalgam)", "Dolgulu (amalgam)") },
    { num: 14, status: getStatus(14, "Intact", "Sağlam") },
    { num: 15, status: getStatus(15, "Missing", "Eksik") },
    { num: 16, status: getStatus(16, "Missing", "Eksik") },
    { num: 17, status: getStatus(17, "Crown", "Kron Kaplama") },
    { num: 18, status: getStatus(18, "Missing", "Eksik") },
  ];

  const upperJawRight = [
    { num: 21, status: getStatus(21, "Intact", "Sağlam") },
    { num: 22, status: getStatus(22, "Filled (amalgam)", "Dolgulu (amalgam)") },
    { num: 23, status: getStatus(23, "Intact", "Sağlam") },
    { num: 24, status: getStatus(24, "Intact", "Sağlam") },
    { num: 25, status: getStatus(25, "Intact", "Sağlam") },
    { num: 26, status: getStatus(26, "Missing", "Eksik") },
    { num: 27, status: getStatus(27, "Missing", "Eksik") },
    { num: 28, status: getStatus(28, "Filled (amalgam)", "Dolgulu (amalgam)") },
  ];

  const lowerJawLeft = [
    { num: 41, status: getStatus(41, "Intact", "Sağlam") },
    { num: 42, status: getStatus(42, "Intact", "Sağlam") },
    { num: 43, status: getStatus(43, "Intact", "Sağlam") },
    { num: 44, status: getStatus(44, "Intact", "Sağlam") },
    { num: 45, status: getStatus(45, "Missing", "Eksik") },
    { num: 46, status: getStatus(46, "Missing", "Eksik") },
    { num: 47, status: getStatus(47, "Missing", "Eksik") },
    { num: 48, status: getStatus(48, "Intact", "Sağlam") },
  ];

  const lowerJawRight = [
    { num: 31, status: getStatus(31, "Intact", "Sağlam") },
    { num: 32, status: getStatus(32, "Intact", "Sağlam") },
    { num: 33, status: getStatus(33, "Intact", "Sağlam") },
    { num: 34, status: getStatus(34, "Intact", "Sağlam") },
    { num: 35, status: getStatus(35, "Missing", "Eksik") },
    { num: 36, status: getStatus(36, "Missing", "Eksik") },
    { num: 37, status: getStatus(37, "Missing", "Eksik") },
    { num: 38, status: getStatus(38, "Filled (amalgam)", "Dolgulu (amalgam)") },
  ];

  const isIntact = (s: string) => s === "Intact" || s === "Sağlam";

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
                    isIntact(t.status) ? "text-slate-400" : "text-black font-medium"
                  }`}
                >
                  <span className="w-6">{t.num}.</span>
                  <span>{t.status}</span>
                </div>
              ))}
            </div>
            <div className="divide-y divide-slate-200/80">
              {upperJawRight.map((t) => (
                <div
                  key={t.num}
                  className={`py-2 px-2 flex items-center gap-3 ${
                    isIntact(t.status) ? "text-slate-400" : "text-black font-medium"
                  }`}
                >
                  <span className="w-6">{t.num}.</span>
                  <span>{t.status}</span>
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
                    isIntact(t.status) ? "text-slate-400" : "text-black font-medium"
                  }`}
                >
                  <span className="w-6">{t.num}.</span>
                  <span>{t.status}</span>
                </div>
              ))}
            </div>
            <div className="divide-y divide-slate-200/80">
              {lowerJawRight.map((t) => (
                <div
                  key={t.num}
                  className={`py-2 px-2 flex items-center gap-3 ${
                    isIntact(t.status) ? "text-slate-400" : "text-black font-medium"
                  }`}
                >
                  <span className="w-6">{t.num}.</span>
                  <span>{t.status}</span>
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
          <div className="px-3.5 py-1 text-[13px] font-medium text-black">
            {isEn ? "Gingivitis" : "Gingivitis (Diş Eti Değerlendirmesi)"}
          </div>
        </div>
      </div>
    </WisePageWrapper>
  );
}
