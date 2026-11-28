import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseTopWedge, WiseFooter, getThemeColor } from "../wise-frame";

export function Booklet24Page13PermanentBridge({
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
      bgImage="/pdf-assets/wise/page_13.jpg"
      className="flex flex-col justify-between"
    >
      {/* Tek Sayfa Üst Diyagonal Takoz */}
      <WiseTopWedge themeColor={themeColor} />

      {/* İçerik (wise_2.pdf orijinal koordinatlarında, temizlenmiş beyaz zemin üzerinde) */}
      <div className="flex-1 px-[64px] pt-[12px] pb-20 select-none z-10 flex flex-col justify-start">
        <div className="mb-9">
          <h2
            className="text-[24px] font-extrabold italic text-right mb-5"
            style={{ color: themeColor }}
          >
            {isAr
              ? "تركيب الجسر الدائم"
              : isRu
              ? "Установка постоянного моста"
              : isEn
              ? "Fitting the Permanent Bridge"
              : "Kalıcı Köprü Protezin Uygulanması"}
          </h2>
          <p className="text-[15px] leading-[1.6] text-[#222222] text-justify">
            {isAr
              ? "بعد انتهاء فترة التئام العظام (4-6 أشهر) — دون الحاجة إلى أي جراحة إضافية — تتم إزالة التركيبات المؤقتة الثابتة ويتم تصنيع وتركيب جسر الزركونيا الدائم خلال 5 أيام."
              : isRu
              ? "После завершения периода остеоинтеграции (4–6 месяцев) — без дополнительного хирургического вмешательства — временный протез снимается, и в течение 5 дней изготавливается постоянный циркониевый мост."
              : isEn
              ? "Following the healing period (4-6 months) - without any need for further surgery - the temporary fixed dentures is removed and a 12 unit bridge is created within 5 days."
              : "İyileşme sürecinin (4-6 ay) tamamlanmasının ardından — herhangi bir ek cerrahi işleme gerek duyulmaksızın — sabit geçici protezler çıkarılır ve 5 gün içerisinde 12 üyeli kalıcı porselen/zirkonyum köprünüz hazırlanarak uygulanır."}
          </p>
        </div>

        <div>
          <h2
            className="text-[24px] font-extrabold italic text-right mb-5"
            style={{ color: themeColor }}
          >
            {isAr
              ? "بروتوكول المتابعة والفحص"
              : isRu
              ? "Протокол наблюдения и осмотра"
              : isEn
              ? "Check-up Protocol"
              : "Kontrol ve Takip Protokolü"}
          </h2>
          <p className="text-[15px] leading-[1.6] text-[#222222] text-justify mb-6">
            {isAr
              ? "الفحوصات الدورية ضرورية لضمان النجاح طويل الأمد لزراعة الأسنان والجسور. تم تصميم بروتوكولنا للحفاظ على تركيباتكم في أفضل حالة:"
              : isRu
              ? "Регулярные осмотры необходимы для долговечности дентальных имплантатов и мостовидных протезов. Что мы проверяем на контрольных визитах:"
              : isEn
              ? "Regular check-ups are essential to ensure the long-term success of your dental implants and bridges. Our protocol is designed to keep your restorations in top condition and detect any issues early. What We Check:"
              : "Düzenli kontroller, dental implantlarınızın ve köprü protezlerinizin uzun yıllar sağlıklı kalması için büyük önem taşır. Protokolümüz restorasyonlarınızı en üst kondisyonda tutmak üzere tasarlanmıştır. Kontrollerde İncelenenler:"}
          </p>

          <div className="space-y-5 text-[15px] leading-[1.58] text-[#222222] text-justify">
            <p>
              <span className="font-bold text-black">
                {isAr
                  ? "ثبات الغرسات"
                  : isRu
                  ? "Стабильность имплантатов"
                  : isEn
                  ? "Implant Stability"
                  : "İmplant Stabilitesi"}
              </span>{" "}
              –{" "}
              {isAr
                ? "التأكد من اندماج الغرسة بالكامل وثباتها في عظم الفك."
                : isRu
                ? "Проверка полной остеоинтеграции и надежной фиксации имплантата."
                : isEn
                ? "Ensuring the implant is fully integrated and secure."
                : "İmplantın çene kemiğiyle tam kaynaştığının ve stabilitesinin doğrulanması."}
            </p>

            <p>
              <span className="font-bold text-black">
                {isAr
                  ? "صحة اللثة والعظام"
                  : isRu
                  ? "Здоровье десен и костной ткани"
                  : isEn
                  ? "Gum & Bone Health"
                  : "Diş Eti ve Kemik Sağlığı"}
              </span>{" "}
              –{" "}
              {isAr
                ? "فحص الأنسجة للتأكد من عدم وجود التهاب أو فقدان للعظام."
                : isRu
                ? "Контроль тканей на отсутствие воспаления или резорбции кости."
                : isEn
                ? "Checking for inflammation, infection, or bone loss."
                : "Enflamasyon, enfeksiyon veya kemik kaybı belirtilerine karşı doku kontrolü."}
            </p>

            <p>
              <span className="font-bold text-black">
                {isAr
                  ? "سلامة الجسر والإطباق"
                  : isRu
                  ? "Целостность моста и прикус"
                  : isEn
                  ? "Bridge Integrity"
                  : "Köprü Bütünlüğü"}
              </span>{" "}
              –{" "}
              {isAr
                ? "تقييم تطابق الإطباق والتآكل وإجراء أي تعديلات لازمة."
                : isRu
                ? "Оценка прилегания, износа и окклюзионного баланса."
                : isEn
                ? "Assessing fit, wear, and any necessary adjustments."
                : "Kapanış uyumunun, aşınma durumunun ve gerekli oklüzal ayarların incelenmesi."}
            </p>

            <p>
              <span className="font-bold text-black">
                {isAr
                  ? "العناية بنظافة الفم"
                  : isRu
                  ? "Профессиональная гигиена"
                  : isEn
                  ? "Oral Hygiene Maintenance"
                  : "Ağız Hijyeni Bakımı"}
              </span>{" "}
              –{" "}
              {isAr
                ? "تنظيف احترافي لمنع تراكم البلاك حول الغرسات."
                : isRu
                ? "Профессиональная чистка для предотвращения налета вокруг имплантатов."
                : isEn
                ? "Professional cleaning to prevent plaque buildup around the implant."
                : "İmplant çevresinde plak birikimini önlemek için profesyonel klinik temizlik."}
            </p>
          </div>
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
