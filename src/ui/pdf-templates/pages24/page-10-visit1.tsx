import React from "react";
import type { PdfPalette, PdfPlanData, TreatmentItem } from "../types";
import { WisePageWrapper, WiseHeader, WiseFooter, getThemeColor } from "../wise-frame";
import { formatCurrency } from "../palettes";

export function Booklet24Page10Visit1({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const curr = data.currency || "EUR";
  const themeColor = getThemeColor(palette, "#0b2938");

  const fallbackVisit1Items: TreatmentItem[] = [
    {
      name: isEn
        ? "Extraction (11, 13, 14, 17, 21, 22, 23, 24, 25, 28)"
        : "Diş Çekimi (11, 13, 14, 17, 21, 22, 23, 24, 25, 28)",
      qty: 10,
      unitPrice: 39,
      amount: 390,
    },
    {
      name: isEn
        ? "Extraction (31, 32, 33, 34, 38, 41, 42, 43, 44, 48)"
        : "Diş Çekimi (31, 32, 33, 34, 38, 41, 42, 43, 44, 48)",
      qty: 10,
      unitPrice: 39,
      amount: 390,
    },
    {
      name: isEn
        ? "All-on-4 package (upper) (16, 26)"
        : "All-on-4 Üst Çene Paketi (16, 26)",
      description: isEn
        ? "Implant surgery, 4 pcs implants, long-term temporary dentures"
        : "4 Adet İmplant Cerrahisi, uzun dönem sabit geçici protez",
      qty: 1,
      unitPrice: 4995,
      amount: 4995,
    },
    {
      name: isEn
        ? "All-on-4 package (lower) (36, 46)"
        : "All-on-4 Alt Çene Paketi (36, 46)",
      description: isEn
        ? "Implant surgery, 4 pcs implants, long-term temporary dentures"
        : "4 Adet İmplant Cerrahisi, uzun dönem sabit geçici protez",
      qty: 1,
      unitPrice: 4995,
      amount: 4995,
    },
    {
      name: isEn ? "Panoramic X-ray" : "Panoramik Röntgen",
      qty: 1,
      unitPrice: 20,
      amount: 20,
    },
  ];

  const visit1Items = data.visits?.[0]?.items?.length
    ? data.visits[0].items
    : data.items?.length
    ? data.items.slice(0, Math.ceil(data.items.length / 2))
    : fallbackVisit1Items;

  const phaseTotal = visit1Items.reduce((acc, it) => acc + (it.amount || 0), 0);

  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_10.jpg"
      className="flex flex-col justify-between"
    >
      {/* 1. Eğimli Başlık Bandı (80.1mm) */}
      <WiseHeader
        eyebrow={isEn ? "YOUR PLAN" : "TEDAVİ PLANINIZ"}
        title={isEn ? "1ST VISIT" : "1. SEANS"}
        themeColor={themeColor}
      />

      {/* 2. Yeşil Dental Ark Şeması Boşluğu (temizlenmiş page_10.jpg üzerinde y: 305..548 aralığında yer alır) */}
      <div className="h-[66mm] shrink-0" />

      {/* 3. Tedavi Tablosu (wise_2.pdf orijinal gri şeritli tablo tasarımı) */}
      <div className="flex-1 px-[38px] pt-1 select-none z-10">
        {/* Faz Başlığı ve Faz Toplamı */}
        <div className="bg-[#F2F2F2] px-3.5 py-2.5 flex items-center justify-between mb-1">
          <h2 className="text-[15.5px] font-bold text-black">
            {data.visits?.[0]?.title ||
              (isEn
                ? "1. Phase: extractions, implantation 1st"
                : "1. Faz: Diş Çekimleri ve 1. Aşama İmplantasyon")}
          </h2>
          <span className="text-[16px] font-bold text-black">
            {formatCurrency(phaseTotal, curr)}
          </span>
        </div>

        {/* Tablo Başlıkları */}
        <div className="grid grid-cols-12 text-[12px] text-slate-400 px-3.5 py-2 border-b border-slate-200">
          <span className="col-span-6">{isEn ? "Treatment" : "Tedavi"}</span>
          <span className="col-span-2 text-center">{isEn ? "Amount" : "Adet"}</span>
          <span className="col-span-2 text-right">{isEn ? "Unit price" : "Birim fiyat"}</span>
          <span className="col-span-2 text-right">{isEn ? "Price" : "Tutar"}</span>
        </div>

        {/* Kalemler */}
        <div className="divide-y divide-slate-200/80 text-[12.5px] text-black">
          {visit1Items.slice(0, 6).map((item, idx) => {
            const qty = item.quantity || item.qty || 1;
            const unitPrice = item.unitPrice || Math.round((item.amount || 0) / qty);
            return (
              <div key={idx} className="grid grid-cols-12 px-3.5 py-2.5 items-center">
                <div className="col-span-6 pr-3">
                  <p className="font-medium text-black leading-snug">
                    {item.treatmentName || item.name}
                  </p>
                  {item.description && (
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                      {item.description}
                    </p>
                  )}
                </div>
                <span className="col-span-2 text-center text-black">
                  {qty} ×
                </span>
                <span className="col-span-2 text-right text-black">
                  {formatCurrency(unitPrice, curr)}
                </span>
                <span className="col-span-2 text-right font-medium text-black">
                  {formatCurrency(item.amount || 0, curr)}
                </span>
              </div>
            );
          })}
        </div>

        {/* İyileşme Periyodu Bilgisi */}
        <div className="px-3.5 pt-3 border-t border-slate-200">
          <p className="text-[12.5px] font-medium text-black">
            {data.visits?.[0]?.healingPeriod ||
              (isEn ? "Healing period: 6 months" : "İyileşme süresi: 6 ay")}
          </p>
        </div>
      </div>

      {/* 4. Çift Sayfa Sağ Alt Köşe Takozu */}
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
