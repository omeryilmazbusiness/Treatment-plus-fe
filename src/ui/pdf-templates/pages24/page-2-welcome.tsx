import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseHeader, WiseFooter, getThemeColor } from "../wise-frame";

export function Booklet24Page2Welcome({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const themeColor = getThemeColor(palette, "#0b2938");
  const patientName = data.patientName || "Mr. John Smith";
  const coordinatorName = data.coordinatorName || "Angelina";

  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_2.jpg"
      className="flex flex-col justify-between"
    >
      {/* 1. wise_2.pdf Orijinal Eğimli Başlık Bandı (80.1mm) */}
      <WiseHeader
        eyebrow={isEn ? "A WARM" : "SICAK BİR"}
        title={isEn ? "WELCOME" : "HOŞ GELDİNİZ"}
        themeColor={themeColor}
      />

      {/* 2. Mektup Gövdesi (wise_2.pdf orijinal koordinatlarında, temizlenmiş arka plan üzerinde) */}
      <div className="flex-1 flex flex-col justify-start px-[64px] pt-[28px] pb-12 text-[#222222] z-10">
        <h2
          className="text-[24px] font-extrabold italic mb-7 tracking-tight"
          style={{ color: themeColor }}
        >
          {isEn ? `Dear ${patientName},` : `Sayın ${patientName},`}
        </h2>

        <div className="space-y-6 text-[15.5px] leading-[1.6] text-[#222222] max-w-[630px]">
          {data.welcomeBody || data.welcomeText ? (
            <p className="whitespace-pre-line">{data.welcomeBody || data.welcomeText}</p>
          ) : (
            <>
              <p className="text-justify">
                {isEn ? (
                  <>
                    Thank you for trusting us with your dental health. This treatment plan is{" "}
                    <span className="font-bold text-black">
                      your roadmap to a confident, beautiful new smile.
                    </span>{" "}
                    It was created specifically for you, addressing your unique dental situation and needs.
                  </>
                ) : (
                  <>
                    Diş sağlığınızı ve gülüşünüzü bize emanet ettiğiniz için teşekkür ederiz. Bu tedavi planı,{" "}
                    <span className="font-bold text-black">
                      özgüvenli ve sağlıklı yeni gülüşünüze giden yol haritanızdır.
                    </span>{" "}
                    Tamamen sizin benzersiz ağız yapınız ve kişisel ihtiyaçlarınız doğrultusunda özel olarak hazırlanmıştır.
                  </>
                )}
              </p>

              <p>
                {isEn ? (
                  <>
                    {"Please take time reviewing it, and don't hesitate to ask questions."}{" "}
                    <span className="font-bold text-black">{"We're here for you."}</span>
                  </>
                ) : (
                  <>
                    Lütfen bu planı incelemek için zaman ayırın ve sorularınızı sormaktan çekinmeyin.{" "}
                    <span className="font-bold text-black">Sizin için buradayız.</span>
                  </>
                )}
              </p>
            </>
          )}

          <div className="pt-4 text-[15.5px] leading-[1.45] text-[#222222]">
            <p>{isEn ? "Yours truly," : "Saygılarımızla,"}</p>
            <p className="font-semibold text-black mt-0.5">{coordinatorName}</p>
            <p className="text-[#333333]">
              {isEn ? "Your Patient Coordinator" : "Hasta Koordinatörünüz"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Çift Sayfa Sağ Alt Köşe Diyagonal Takozu */}
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
