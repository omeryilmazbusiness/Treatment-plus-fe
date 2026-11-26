import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper } from "../wise-frame";

export function Booklet24Page15SimulationPlayer({
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_15.jpg"
      className="flex flex-col justify-between"
    >
      {/* 3D Simülasyon Oynatıcı Kartı page_15.jpg üzerinde tam sayfa olarak yer alır */}
      <div className="flex-1" />
    </WisePageWrapper>
  );
}
