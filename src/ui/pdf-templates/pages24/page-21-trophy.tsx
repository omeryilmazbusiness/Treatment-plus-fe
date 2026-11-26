import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseTopWedge, WiseFooter, getThemeColor } from "../wise-frame";

export function Booklet24Page21Trophy({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const themeColor = getThemeColor(palette, "#0b2938");

  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_21.jpg"
      className="flex flex-col justify-between"
    >
      {/* Tek Sayfa Üst Diyagonal Takoz */}
      <WiseTopWedge themeColor={themeColor} />

      <div className="flex-1" />

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
