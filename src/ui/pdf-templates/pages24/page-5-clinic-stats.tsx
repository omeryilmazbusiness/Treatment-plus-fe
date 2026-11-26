import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseTopWedge, WiseFooter, getThemeColor } from "../wise-frame";

export function Booklet24Page5ClinicStats({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const themeColor = getThemeColor(palette, "#0b2938");

  const defaultStats = [
    { value: "15+", label: isEn ? "YEAR EXPERIENCE" : "YILLIK DENEYİM" },
    { value: "5", label: isEn ? "BRANCHES" : "ŞUBE" },
    { value: "60+", label: isEn ? "SPECIALIST DOCTORS" : "UZMAN DOKTOR" },
    { value: "84+", label: isEn ? "DENTAL UNITS" : "DENTAL ÜNİTE" },
    { value: "150K", label: isEn ? "PATIENTS" : "MUTLU HASTA" },
    { value: "98%", label: isEn ? "SATISFACTION" : "MEMNUNİYET ORANI" },
  ];

  const stats =
    data.highlights && data.highlights.length >= 6
      ? data.highlights.slice(0, 6)
      : defaultStats;

  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_5.jpg"
      className="flex flex-col justify-between"
    >
      {/* Tek Sayfa Üst Diyagonal Takoz */}
      <WiseTopWedge themeColor={themeColor} />

      {/* 2x3 Crosshair İstatistik Izgarası (wise_2.pdf orijinal oranlarında) */}
      <div className="flex-1 flex items-center justify-center px-[74px] pb-12 select-none z-10">
        <div className="w-full grid grid-cols-2">
          {stats.map((s, idx) => {
            const isLeft = idx % 2 === 0;
            const isBottomRow = idx >= 4;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center py-10 px-6 text-center border-[#6D828E]/70 ${
                  isLeft ? "border-r-[1.5px]" : ""
                } ${!isBottomRow ? "border-b-[1.5px]" : ""}`}
              >
                <span className="text-[54px] font-bold tracking-tight leading-none mb-2.5 text-[#445C68]">
                  {s.value}
                </span>
                <span className="text-[13px] font-medium tracking-[0.06em] uppercase text-[#445C68]">
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tek Sayfa Alt Diyagonal Logo Bandı */}
      <WiseFooter
        clinicName={data.clinicName || "Wise Dental"}
        slogan={data.slogan || data.clinicSlogan || "Every Smile Matters!!"}
        logoUrl={data.logoUrl}
        themeColor={themeColor}
        variant="odd"
      />
    </WisePageWrapper>
  );
}
