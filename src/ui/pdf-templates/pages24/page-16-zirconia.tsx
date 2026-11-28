import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseHeader, WiseFooter, getThemeColor } from "../wise-frame";

export function Booklet24Page16Zirconia({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const isAr = data.locale === "ar";
  const isRu = data.locale === "ru";
  const themeColor = getThemeColor(palette, "#0b2938");

  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_16.jpg"
      className="flex flex-col justify-between bg-[#070D12]"
    >
      {/* 1. Eğimli Başlık Bandı (80.1mm) */}
      <WiseHeader
        eyebrow={
          isAr
            ? "لماذا نختار"
            : isRu
            ? "ПОЧЕМУ ВЫБИРАЮТ"
            : isEn
            ? "WHY CHOOSE"
            : "NEDEN TERCİH EDİLMELİ"
        }
        title={
          isAr
            ? "الزركونيا"
            : isRu
            ? "ЦИРКОНИЙ"
            : isEn
            ? "ZIRCONIA"
            : "ZİRKONYUM"
        }
        themeColor={themeColor}
      />

      {/* 2. Koyu Arka Plan Üzerinde Beyaz Açıklama Metinleri (wise_2.pdf Sayfa 16 orijinal stili) */}
      <div className="flex-1 px-[76px] pt-[18px] select-none z-10">
        <div className="space-y-6 text-[15px] leading-[1.58] text-white/90 text-justify">
          <p>
            {isAr ? (
              <>
                عندما يتعلق الأمر بتعويض الأسنان المفقودة أو المتضررة، فإننا نعطي الأولوية للحلول التي{" "}
                <span className="font-bold text-white">
                  تجمع بين القوة والجمال وطول العمر.
                </span>{" "}
                لذلك نوصي بجسور الزركونيا — الخيار الأمثل للمرضى الذين يرغبون في{" "}
                <span className="font-bold text-white">
                  ابتسامة طبيعية المظهر ومتينة دون أي تنازلات.
                </span>
              </>
            ) : isRu ? (
              <>
                При восстановлении отсутствующих или поврежденных зубов мы отдаем приоритет решениям, которые{" "}
                <span className="font-bold text-white">
                  сочетают прочность, эстетику и долговечность.
                </span>{" "}
                Именно поэтому мы рекомендуем циркониевые мосты — премиальный выбор для пациентов, желающих получить{" "}
                <span className="font-bold text-white">
                  естественную и надежную улыбку без компромиссов.
                </span>
              </>
            ) : isEn ? (
              <>
                When it comes to restoring missing or damaged teeth, we prioritize solutions that{" "}
                <span className="font-bold text-white">
                  combine strength, aesthetics, and longevity.
                </span>{" "}
                {"That's why we suggest a zirconium bridge—a premium choice for patients who want a "}
                <span className="font-bold text-white">
                  natural-looking, durable smile without compromise.
                </span>
              </>
            ) : (
              <>
                Eksik veya hasar görmüş dişlerin restorasyonunda{" "}
                <span className="font-bold text-white">
                  dayanıklılık, estetik ve uzun ömürlülüğü bir arada sunan
                </span>{" "}
                çözümlere öncelik veriyoruz. Bu nedenle{" "}
                <span className="font-bold text-white">
                  ödün vermeden doğal görünümlü ve güçlü bir gülüş
                </span>{" "}
                isteyen hastalarımız için birinci sınıf zirkonyum köprüleri öneriyoruz.
              </>
            )}
          </p>

          <p>
            {isAr ? (
              <>
                يتميز الزركونيا بمقاومة عالية للكسر والتآكل، وبخلاف البدائل المعدنية فإنه يحاكي{" "}
                <span className="font-bold text-white">
                  شفافية الأسنان الطبيعية،
                </span>{" "}
                ولا يترك أي خطوط رمادية عند خط اللثة مع مرور الوقت.
              </>
            ) : isRu ? (
              <>
                Диоксид циркония обладает высокой устойчивостью к сколам и износу. В отличие от металлокерамики, циркониевые мосты воспроизводят{" "}
                <span className="font-bold text-white">
                  светопроницаемость натуральной эмали
                </span>{" "}
                и не образуют темного контура у десны со временем.
              </>
            ) : isEn ? (
              <>
                Zirconium is highly resistant to fractures and wear, making it a long-lasting solution. Unlike metal-based alternatives, zirconium bridges mimic the{" "}
                <span className="font-bold text-white">
                  translucency of natural teeth,
                </span>{" "}
                {"ensuring a lifelike appearance. Unlike porcelain-fused-to-metal crowns, zirconium bridges won't develop unsightly grey lines at the gumline over time."}
              </>
            ) : (
              <>
                Zirkonyum kırılma ve aşınmaya karşı yüksek direnç göstererek uzun ömürlü bir kullanım sunar. Metal destekli alternatiflerin aksine{" "}
                <span className="font-bold text-white">
                  doğal diş minesinin ışık geçirgenliğini birebir taklit eder
                </span>{" "}
                ve zamanla diş eti kenarında gri yansımalar oluşturmaz.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Öncesi / Sonrası Kutusu Boşluğu (temizlenmiş page_16.jpg üzerinde y: 790..1060 aralığında yer alır) */}
      <div className="h-[88mm] shrink-0" />

      {/* 3. Çift Sayfa Sağ Alt Köşe Takozu */}
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
