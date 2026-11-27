import React from "react";
import type { PdfPlanData } from "./types";
import { PALETTES } from "./palettes";
import { normalizeTemplateId } from "./page-frame";
import { getTemplateVisuals } from "./wise-frame";
import {
  KlinikMinimalTemplate,
  ModernGeometricTemplate,
  BotanicalSerenityTemplate,
  LiquidArtTemplate,
  NoirGoldTemplate,
  RoyalGoldTemplate,
} from "./templates";
import {
  Booklet24Page1Cover,
  Booklet24Page2Welcome,
  Booklet24Page3Coordinator,
  Booklet24Page4AboutClinic,
  Booklet24Page5ClinicStats,
  Booklet24Page6Doctor,
  Booklet24Page7DoctorPhoto,
  Booklet24Page8Situation,
  Booklet24Page9Diagnosis,
  Booklet24Page10Visit1,
  Booklet24Page11AllOn4,
  Booklet24Page12Visit2,
  Booklet24Page13PermanentBridge,
  Booklet24Page14SimulationIntro,
  Booklet24Page15SimulationPlayer,
  Booklet24Page16Zirconia,
  Booklet24Page17SmileResult,
  Booklet24Page18DentalLab,
  Booklet24Page19LabStats,
  Booklet24Page20Awards,
  Booklet24Page21Trophy,
  Booklet24Page22Hotel,
  Booklet24Page23Residence,
  Booklet24Page24BackCover,
} from "./pages24";

export function A4Document({
  data,
  className = "",
  id,
}: {
  data: PdfPlanData;
  className?: string;
  id?: string;
}) {
  const palKey = data.palette || data.paletteKey || "navy";
  const basePalette = PALETTES[palKey] || PALETTES.navy;

  const isSummary = data.format === "summary";
  const activePage = data.activePage;
  const templateId = normalizeTemplateId(data.templateId);
  const templateVisuals = getTemplateVisuals(templateId, basePalette);
  const palette =
    templateId === "klinik-minimal"
      ? basePalette
      : {
          ...basePalette,
          primary: templateVisuals.primaryColor,
          accent: templateVisuals.accentColor,
        };
  const normalizedData: PdfPlanData = { ...data, templateId };

  // 1 Sayfalık Hızlı Fiyat ve Tedavi Özeti Şablonu
  const renderSummaryTemplate = () => {
    switch (templateId) {
      case "modern-geometric":
        return <ModernGeometricTemplate data={normalizedData} palette={palette} />;
      case "botanical-serenity":
        return <BotanicalSerenityTemplate data={normalizedData} palette={palette} />;
      case "liquid-art":
        return <LiquidArtTemplate data={normalizedData} palette={palette} />;
      case "noir-gold":
        return <NoirGoldTemplate data={normalizedData} palette={palette} />;
      case "royal-gold":
        return <RoyalGoldTemplate data={normalizedData} palette={palette} />;
      case "klinik-minimal":
      default:
        return <KlinikMinimalTemplate data={normalizedData} palette={palette} />;
    }
  };

  // Kapsamlı 24 Sayfalık Sunum Kitapçığı (wise_2.pdf yapısı & seçilen şablonun görsel kimliği)
  const renderBookletPages = () => {
    const allPages = [
      <Booklet24Page1Cover key="p24-1" data={normalizedData} palette={palette} />,
      <Booklet24Page2Welcome key="p24-2" data={normalizedData} palette={palette} />,
      <Booklet24Page3Coordinator key="p24-3" data={normalizedData} palette={palette} />,
      <Booklet24Page4AboutClinic key="p24-4" data={normalizedData} palette={palette} />,
      <Booklet24Page5ClinicStats key="p24-5" data={normalizedData} palette={palette} />,
      <Booklet24Page6Doctor key="p24-6" data={normalizedData} palette={palette} />,
      <Booklet24Page7DoctorPhoto key="p24-7" data={normalizedData} palette={palette} />,
      <Booklet24Page8Situation key="p24-8" data={normalizedData} palette={palette} />,
      <Booklet24Page9Diagnosis key="p24-9" data={normalizedData} palette={palette} />,
      <Booklet24Page10Visit1 key="p24-10" data={normalizedData} palette={palette} />,
      <Booklet24Page11AllOn4 key="p24-11" data={normalizedData} palette={palette} />,
      <Booklet24Page12Visit2 key="p24-12" data={normalizedData} palette={palette} />,
      <Booklet24Page13PermanentBridge key="p24-13" data={normalizedData} palette={palette} />,
      <Booklet24Page14SimulationIntro key="p24-14" data={normalizedData} palette={palette} />,
      <Booklet24Page15SimulationPlayer key="p24-15" data={normalizedData} palette={palette} />,
      <Booklet24Page16Zirconia key="p24-16" data={normalizedData} palette={palette} />,
      <Booklet24Page17SmileResult key="p24-17" data={normalizedData} palette={palette} />,
      <Booklet24Page18DentalLab key="p24-18" data={normalizedData} palette={palette} />,
      <Booklet24Page19LabStats key="p24-19" data={normalizedData} palette={palette} />,
      <Booklet24Page20Awards key="p24-20" data={normalizedData} palette={palette} />,
      <Booklet24Page21Trophy key="p24-21" data={normalizedData} palette={palette} />,
      <Booklet24Page22Hotel key="p24-22" data={normalizedData} palette={palette} />,
      <Booklet24Page23Residence key="p24-23" data={normalizedData} palette={palette} />,
      <Booklet24Page24BackCover key="p24-24" data={normalizedData} palette={palette} />,
    ];

    if (activePage && activePage >= 1 && activePage <= 24) {
      return allPages[activePage - 1];
    }

    return (
      <div className="a4-booklet-container flex flex-col gap-8 print:gap-0 print:block">
        {allPages}
      </div>
    );
  };

  return (
    <div
      id={id}
      className={`a4-document-root relative select-none ${className}`}
      style={{
        boxSizing: "border-box",
      }}
    >
      {/* Gömülü Web Fontlar ve A4 Yazdırma Kuralları */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;700&family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            
            @media print {
              @page {
                size: A4 portrait;
                margin: 0;
              }
              body {
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background-color: transparent !important;
              }
              .no-print {
                display: none !important;
              }
              .a4-document-root {
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
              }
              .a4-page {
                page-break-after: always !important;
                break-after: page !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                margin: 0 !important;
              }
            }
          `,
        }}
      />

      {isSummary ? renderSummaryTemplate() : renderBookletPages()}
    </div>
  );
}
