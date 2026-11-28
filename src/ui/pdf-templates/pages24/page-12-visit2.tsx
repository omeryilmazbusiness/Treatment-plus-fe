import React from "react";
import type { PdfPalette, PdfPlanData, TreatmentItem } from "../types";
import { WisePageWrapper, WiseHeader, WiseFooter, getThemeColor } from "../wise-frame";
import { formatCurrency } from "../palettes";
import { PdfVisitOdontogram } from "./pdf-odontogram";

export function Booklet24Page12Visit2({
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

  const hasSecondVisit = Array.isArray(data.visits) && data.visits.length > 1;
  // Eğer planda 2 ve üzeri seans varsa 2. ve sonraki seansların tüm kalemlerini burada birleştir
  const subsequentVisits = hasSecondVisit ? data.visits!.slice(1) : [];
  const visit2 = subsequentVisits[0];

  const visit2Items: TreatmentItem[] = hasSecondVisit
    ? subsequentVisits.flatMap((v) => v.items || [])
    : [];

  const phase2Total = visit2Items.reduce(
    (acc, it) => acc + (it.isPackage ? 0 : it.amount || 0),
    0
  );

  const totalCalculated = (data.items || []).reduce(
    (sum, it) => sum + (it.isPackage ? 0 : it.amount || 0),
    0
  );
  const subtotal = data.subtotal !== undefined ? data.subtotal : totalCalculated;
  const discountTotal = data.discountTotal || 0;
  const grandTotal =
    data.grandTotal !== undefined && data.grandTotal !== null
      ? data.grandTotal
      : Math.max(0, subtotal - discountTotal);

  const visit2Title =
    subsequentVisits.length > 1
      ? `${visit2?.title || (isAr ? "الزيارة الثانية" : isRu ? "2-й Визит" : isEn ? "2nd Visit" : "2. Seans")} & ${
          isAr ? "المراحل التالية" : isRu ? "Последующие этапы" : isEn ? "Subsequent Phases" : "Diğer Aşamalar"
        }`
      : visit2?.title ||
        (hasSecondVisit
          ? isAr
            ? "الزيارة الثانية: التركيبات النهائية"
            : isRu
            ? "2-й Визит: Протезирование и завершение"
            : isEn
            ? "2nd Visit: Prosthetic & Final Phase"
            : "2. Seans: Tamamlama Aşaması"
          : isAr
          ? "ملخص العلاج والتكلفة المالية"
          : isRu
          ? "Сводка лечения и финансовый расчет"
          : isEn
          ? "Treatment Summary & Financial Breakdown"
          : "Tedavi ve Finansal Bütçe Özeti");

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
          hasSecondVisit
            ? isAr
              ? "الزيارة الثانية"
              : isRu
              ? "2-Й ВИЗИТ"
              : isEn
              ? "2ND VISIT"
              : "2. SEANS"
            : isAr
            ? "ملخص الخطة"
            : isRu
            ? "ИТОГИ ПЛАНА"
            : isEn
            ? "PLAN SUMMARY"
            : "PLAN ÖZETİ"
        }
        themeColor={themeColor}
      />

      {/* 2. Doktorun Teşhisine ve 2. Seans (veya Nihai) İşlemlere Göre Şekillenen Dinamik Diş Haritası */}
      <div className="px-[38px] pt-1 shrink-0 z-10 select-none">
        <PdfVisitOdontogram
          data={data}
          visitIndex={1}
          visitItems={hasSecondVisit ? visit2Items : data.items || []}
          visit={visit2}
        />
      </div>

      {/* 3. Tedavi Tablosu ve Genel Toplam Özeti */}
      <div className="flex-1 px-[38px] pt-3 pb-[18mm] select-none z-10 flex flex-col justify-start">
        {/* Faz Başlığı ve Faz Toplamı */}
        <div className="bg-[#F2F2F2] px-3.5 py-2.5 flex items-center justify-between mb-1">
          <h2 className="text-[15.5px] font-bold text-black">{visit2Title}</h2>
          <span className="text-[16px] font-bold text-black">
            {formatCurrency(hasSecondVisit ? phase2Total : subtotal, curr, data.locale)}
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
        <div className="divide-y divide-slate-200/80 text-[12px] text-black mb-4">
          {(hasSecondVisit ? visit2Items : data.items || []).length === 0 ? (
            <div className="py-5 text-center text-slate-400 text-xs">
              {isAr
                ? "يتم إكمال جميع الإجراءات المخططة في الزيارة الأولى."
                : isRu
                ? "Все запланированные процедуры выполняются в 1-й визит."
                : isEn
                ? "All planned procedures are completed in the 1st visit."
                : "Planlanan tüm işlemler 1. seansta tamamlanmaktadır."}
            </div>
          ) : (
            (hasSecondVisit ? visit2Items : data.items || [])
              .slice(0, 8)
              .map((item, idx) => {
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
                      <span className="font-semibold text-black block leading-snug">
                        {item.treatmentName || item.name}
                        {item.isPackage && (
                          <span className="ml-1.5 text-[10px] font-bold text-slate-500">
                            ({isAr ? "باقة" : isRu ? "Пакет" : isEn ? "Package" : "Paket"})
                          </span>
                        )}
                      </span>
                      {item.description && (
                        <span className="text-[10.5px] text-slate-600 block mt-0.5 leading-tight">
                          {item.description}
                        </span>
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

        {/* İskonto Kalemleri Varsa Göster */}
        {discountTotal > 0 && (
          <div className="space-y-1 mb-2 px-3.5 text-[12px]">
            <div className="flex items-center justify-between text-slate-600">
              <span>{isAr ? "المجموع الفرعي" : isRu ? "Подытог" : isEn ? "Subtotal" : "Ara Toplam"}</span>
              <span className="font-semibold">
                {formatCurrency(subtotal, curr, data.locale)}
              </span>
            </div>
            {Array.isArray(data.discounts) && data.discounts.length > 0 ? (
              data.discounts.map((d, dIdx) => (
                <div
                  key={d.id || dIdx}
                  className="flex items-center justify-between text-emerald-700 font-medium"
                >
                  <span>{d.label || (isAr ? "خصم" : isRu ? "Скидка" : isEn ? "Discount" : "İndirim")}</span>
                  <span>- {formatCurrency(d.amount, curr, data.locale)}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-between text-emerald-700 font-medium">
                <span>{isAr ? "إجمالي الخصم" : isRu ? "Общая скидка" : isEn ? "Total Discount" : "Toplam İndirim"}</span>
                <span>- {formatCurrency(discountTotal, curr, data.locale)}</span>
              </div>
            )}
          </div>
        )}

        {/* Genel Toplam Şeridi */}
        <div className="bg-[#F2F2F2] px-3.5 py-3 flex items-center justify-between">
          <span className="text-[16px] font-bold text-black">
            {isAr ? "الإجمالي العام" : isRu ? "Итого" : isEn ? "Total" : "Genel Toplam"}
          </span>
          <span className="text-[16.5px] font-bold text-black">
            {formatCurrency(grandTotal, curr, data.locale)}
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
