import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseHeader, WiseFooter, getThemeColor } from "../wise-frame";

export function Booklet24Page22Hotel({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const themeColor = getThemeColor(palette, "#0b2938");

  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_22.jpg"
      className="flex flex-col justify-between"
    >
      {/* 1. Eğimli Başlık Bandı (80.1mm) */}
      <WiseHeader
        eyebrow={isEn ? "YOUR STAY WITH US" : "KONAKLAMA & KONFOR"}
        title={isEn ? "THE HOTEL" : "OTELİNİZ"}
        themeColor={themeColor}
      />

      <div className="flex-1" />

      {/* 2. Çift Sayfa Sağ Alt Köşe Takozu */}
      <WiseFooter
        clinicName={data.clinicName || "Wise Dental"}
        slogan={data.slogan || data.clinicSlogan || "Every Smile Matters!!"}
        logoUrl={data.logoUrl}
        themeColor={themeColor}
        variant="even"
      />
    </WisePageWrapper>
  );
}
