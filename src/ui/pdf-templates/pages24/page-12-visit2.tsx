import React from "react";
import type { PdfPalette, PdfPlanData, TreatmentItem } from "../types";
import { WisePageWrapper, WiseHeader, WiseFooter, getThemeColor } from "../wise-frame";
import { formatCurrency } from "../palettes";

export function Booklet24Page12Visit2({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const curr = data.currency || "EUR";
  const themeColor = getThemeColor(palette, "#0b2938");

  const fallbackVisit2Items: TreatmentItem[] = [
    {
      name: isEn ? "Permanent bridge (16-26)" : "Kalıcı Zirkonyum Köprü Protez (16-26)",
      qty: 1,
      unitPrice: 2000,
      amount: 2000,
    },
    {
      name: isEn ? "Permanent bridge (36-46)" : "Kalıcı Zirkonyum Köprü Protez (36-46)",
      qty: 1,
      unitPrice: 2000,
      amount: 2000,
    },
    {
      name: isEn ? "Panoramic X-ray" : "Kontrol Panoramik Röntgeni",
      qty: 1,
      unitPrice: 20,
      amount: 20,
    },
  ];

  const visit2Items = data.visits?.[1]?.items?.length
    ? data.visits[1].items
    : data.items?.length && data.items.length > 1
    ? data.items.slice(Math.ceil(data.items.length / 2))
    : fallbackVisit2Items;

  const phase2Total = visit2Items.reduce((acc, it) => acc + (it.amount || 0), 0);
  const totalCalculated = (data.items || []).reduce((sum, it) => sum + (it.amount || 0), 0);
  const grandTotal =
    data.grandTotal !== undefined && data.grandTotal !== null
      ? data.grandTotal
      : totalCalculated > 0
      ? totalCalculated
      : 14810;

  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_12.jpg"
      className="flex flex-col justify-between"
    >
      {/* 1. Eğimli Başlık Bandı (80.1mm) */}
      <WiseHeader
        eyebrow={isEn ? "YOUR PLAN" : "TEDAVİ PLANINIZ"}
        title={isEn ? "2ND VISIT" : "2. SEANS"}
        themeColor={themeColor}
      />

      {/* 2. Yeşil Dental Ark Şeması Boşluğu (temizlenmiş page_12.jpg üzerinde yer alır) */}
      <div className="h-[66mm] shrink-0" />

      {/* 3. Tedavi Tablosu (wise_2.pdf orijinal gri şeritli tablo tasarımı) */}
      <div className="flex-1 px-[38px] pt-1 select-none z-10">
        {/* Faz Başlığı ve Faz Toplamı */}
        <div className="bg-[#F2F2F2] px-3.5 py-2.5 flex items-center justify-between mb-1">
          <h2 className="text-[15.5px] font-bold text-black">
            {data.visits?.[1]?.title ||
              (isEn ? "2. Phase:" : "2. Faz: Kalıcı Protetik Restorasyon")}
          </h2>
          <span className="text-[16px] font-bold text-black">
            {formatCurrency(phase2Total, curr)}
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
        <div className="divide-y divide-slate-200/80 text-[12.5px] text-black mb-5">
          {visit2Items.slice(0, 6).map((item, idx) => {
            const qty = item.quantity || item.qty || 1;
            const unitPrice = item.unitPrice || Math.round((item.amount || 0) / qty);
            return (
              <div key={idx} className="grid grid-cols-12 px-3.5 py-3 items-center">
                <span className="col-span-6 font-medium text-black pr-3">
                  {item.treatmentName || item.name}
                </span>
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

        {/* Genel Toplam Şeridi (wise_2.pdf #F2F2F2 Total çubuğu) */}
        <div className="bg-[#F2F2F2] px-3.5 py-3 flex items-center justify-between">
          <span className="text-[16px] font-bold text-black">
            {isEn ? "Total" : "Genel Toplam"}
          </span>
          <span className="text-[16.5px] font-bold text-black">
            {formatCurrency(grandTotal, curr)}
          </span>
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
