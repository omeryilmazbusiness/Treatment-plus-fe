import React from "react";
import type { PdfPalette, PdfPlanData, TreatmentItem } from "../types";
import { WisePageWrapper, WiseHeader, WiseFooter, getThemeColor } from "../wise-frame";
import { formatCurrency } from "../palettes";
import { PdfVisitOdontogram } from "./pdf-odontogram";

export function Booklet24Page10Visit1({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const isAr = data.locale === "ar";
  const isRu = data.locale === "ru";
  const curr = data.currency || "EUR";
  const themeColor = getThemeColor(palette, "#0b2938");

  const hasExplicitVisits = Array.isArray(data.visits) && data.visits.length > 0;
  const visit1 = hasExplicitVisits ? data.visits![0] : undefined;

  const visit1Items: TreatmentItem[] = visit1
    ? visit1.items || []
    : data.items && data.items.length > 0
    ? data.items
    : [];

  const phaseTotal =
    visit1?.subtotal !== undefined
      ? visit1.subtotal
      : visit1Items.reduce((acc, it) => acc + (it.isPackage ? 0 : it.amount || 0), 0);

  return (
    <WisePageWrapper
      className="flex flex-col justify-between bg-white"
    >
      {/* 1. Eğimli Başlık Bandı (80.1mm) */}
      <WiseHeader
        eyebrow={
          isAr
            ? "خطة العلاج"
            : isRu
            ? "ВАШ ПЛАН"
            : isEn
            ? "YOUR PLAN"
            : "TEDAVİ PLANINIZ"
        }
        title={
          isAr
            ? "الزيارة الأولى"
            : isRu
            ? "1-Й ВИЗИТ"
            : isEn
            ? "1ST VISIT"
            : "1. SEANS"
        }
        themeColor={themeColor}
      />

      {/* 2. Doktorun Teşhisine ve 1. Seans İşlemlerine Göre Şekillenen Dinamik Diş Haritası */}
      <div className="px-[38px] pt-1 shrink-0 z-10 select-none">
        <PdfVisitOdontogram
          data={data}
          visitIndex={0}
          visitItems={visit1Items}
          visit={visit1}
        />
      </div>

      {/* 3. Tedavi Tablosu */}
      <div className="flex-1 px-[38px] pt-3 pb-[18mm] select-none z-10 flex flex-col justify-start">
        {/* Faz Başlığı ve Faz Toplamı */}
        <div className="bg-[#F2F2F2] px-3.5 py-2.5 flex items-center justify-between mb-1">
          <h2 className="text-[15.5px] font-bold text-black">
            {visit1?.title ||
              (isAr
                ? "الزيارة الأولى: العلاجات المخططة"
                : isRu
                ? "1-й Визит: Запланированное лечение"
                : isEn
                ? "1st Visit: Planned Treatments"
                : "1. Seans: Planlanan Tedaviler")}
          </h2>
          <span className="text-[16px] font-bold text-black">
            {formatCurrency(phaseTotal, curr, data.locale)}
          </span>
        </div>

        {/* Tablo Başlıkları */}
        <div className="grid grid-cols-12 text-[11.5px] text-slate-500 font-semibold px-3.5 py-2 border-b border-slate-200">
          <span className="col-span-5">
            {isAr ? "العلاج" : isRu ? "Процедура" : isEn ? "Treatment" : "Tedavi"}
          </span>
          <span className="col-span-2 text-center">
            {isAr ? "الأسنان" : isRu ? "Зубы" : isEn ? "Teeth" : "Diş No"}
          </span>
          <span className="col-span-1 text-center">
            {isAr ? "العدد" : isRu ? "Кол-во" : isEn ? "Qty" : "Adet"}
          </span>
          <span className="col-span-2 text-right">
            {isAr ? "سعر الوحدة" : isRu ? "Цена за ед." : isEn ? "Unit price" : "Birim fiyat"}
          </span>
          <span className="col-span-2 text-right">
            {isAr ? "الإجمالي" : isRu ? "Сумма" : isEn ? "Price" : "Tutar"}
          </span>
        </div>

        {/* Kalemler */}
        <div className="divide-y divide-slate-200/80 text-[12px] text-black">
          {visit1Items.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              {isAr
                ? "لم تتم إضافة عناصر علاج لهذه الزيارة."
                : isRu
                ? "Для этого визита процедуры не добавлены."
                : isEn
                ? "No treatment items added to this visit."
                : "Bu seans için henüz tedavi kalemi eklenmedi."}
            </div>
          ) : (
            visit1Items.slice(0, 10).map((item, idx) => {
              const qty = item.quantity || item.qty || 1;
              const unitPrice =
                item.unitPrice !== undefined
                  ? item.unitPrice
                  : Math.round((item.amount || 0) / qty);
              const lineAmount = item.isPackage ? 0 : item.amount ?? unitPrice * qty;
              const teethLabel =
                item.toothNumber ||
                (Array.isArray(item.teeth) && item.teeth.length > 0
                  ? item.teeth.join(", ")
                  : "—");

              return (
                <div key={idx} className="grid grid-cols-12 px-3.5 py-2 items-center">
                  <div className="col-span-5 pr-2">
                    <p className="font-semibold text-black leading-snug">
                      {item.treatmentName || item.name}
                      {item.isPackage && (
                        <span className="ml-1.5 text-[10px] font-bold text-slate-500">
                          ({isAr ? "باقة" : isRu ? "Пакет" : isEn ? "Package" : "Paket"})
                        </span>
                      )}
                    </p>
                    {item.description && (
                      <p className="text-[10.5px] text-slate-600 mt-0.5 leading-tight">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="col-span-2 text-center font-mono text-[11px] font-semibold text-slate-700 truncate px-1">
                    {teethLabel}
                  </span>
                  <span className="col-span-1 text-center text-black">
                    {qty} ×
                  </span>
                  <span className="col-span-2 text-right text-black">
                    {formatCurrency(unitPrice, curr, data.locale)}
                  </span>
                  <span className="col-span-2 text-right font-semibold text-black">
                    {item.isPackage
                      ? isAr
                        ? "مشمول"
                        : isRu
                        ? "Включено"
                        : isEn
                        ? "Included"
                        : "Paket İçi"
                      : formatCurrency(lineAmount, curr, data.locale)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* İyileşme Periyodu / Seans Notu Bilgisi */}
        {(visit1?.healingPeriod || visit1?.note) && (
          <div className="px-3.5 pt-2.5 mt-1 border-t border-slate-200">
            <p className="text-[12px] font-medium text-black">
              {visit1.healingPeriod || visit1.note}
            </p>
          </div>
        )}
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
