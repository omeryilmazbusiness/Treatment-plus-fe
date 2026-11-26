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
            {isEn ? "Fitting the Permanent Bridge" : "Kalıcı Köprü Protezin Uygulanması"}
          </h2>
          <p className="text-[15px] leading-[1.6] text-[#222222] text-justify">
            {isEn
              ? "Following the healing period (4-6 months) - without any need for further surgery - the temporary fixed dentures is removed and a 12 unit bridge is created within 5 days."
              : "İyileşme sürecinin (4-6 ay) tamamlanmasının ardından — herhangi bir ek cerrahi işleme gerek duyulmaksızın — sabit geçici protezler çıkarılır ve 5 gün içerisinde 12 üyeli kalıcı porselen/zirkonyum köprünüz hazırlanarak uygulanır."}
          </p>
        </div>

        <div>
          <h2
            className="text-[24px] font-extrabold italic text-right mb-5"
            style={{ color: themeColor }}
          >
            {isEn ? "Check-up Protocol" : "Kontrol ve Takip Protokolü"}
          </h2>
          <p className="text-[15px] leading-[1.6] text-[#222222] text-justify mb-6">
            {isEn
              ? "Regular check-ups are essential to ensure the long-term success of your dental implants and bridges. Our protocol is designed to keep your restorations in top condition and detect any issues early. What We Check:"
              : "Düzenli kontroller, dental implantlarınızın ve köprü protezlerinizin uzun yıllar sağlıklı kalması için büyük önem taşır. Protokolümüz restorasyonlarınızı en üst kondisyonda tutmak üzere tasarlanmıştır. Kontrollerde İncelenenler:"}
          </p>

          <div className="space-y-5 text-[15px] leading-[1.58] text-[#222222] text-justify">
            <p>
              <span className="font-bold text-black">
                {isEn ? "Implant Stability" : "İmplant Stabilitesi"}
              </span>{" "}
              –{" "}
              {isEn
                ? "Ensuring the implant is fully integrated and secure."
                : "İmplantın çene kemiğiyle tam kaynaştığının ve stabilitesinin doğrulanması."}
            </p>

            <p>
              <span className="font-bold text-black">
                {isEn ? "Gum & Bone Health" : "Diş Eti ve Kemik Sağlığı"}
              </span>{" "}
              –{" "}
              {isEn
                ? "Checking for inflammation, infection, or bone loss."
                : "Enflamasyon, enfeksiyon veya kemik kaybı belirtilerine karşı doku kontrolü."}
            </p>

            <p>
              <span className="font-bold text-black">
                {isEn ? "Bridge Integrity" : "Köprü Bütünlüğü"}
              </span>{" "}
              –{" "}
              {isEn
                ? "Assessing fit, wear, and any necessary adjustments."
                : "Kapanış uyumunun, aşınma durumunun ve gerekli oklüzal ayarların incelenmesi."}
            </p>

            <p>
              <span className="font-bold text-black">
                {isEn ? "Oral Hygiene Maintenance" : "Ağız Hijyeni Bakımı"}
              </span>{" "}
              –{" "}
              {isEn
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
