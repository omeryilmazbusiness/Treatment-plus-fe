import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseHeader, WiseFooter, getThemeColor } from "../wise-frame";

export function Booklet24Page6Doctor({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const themeColor = getThemeColor(palette, "#0b2938");
  const doctorName = data.doctorName || "Dr. Peter";
  const doctorTitle =
    data.doctorTitle ||
    (isEn
      ? "Master of the Swiss immediate loading implant system"
      : "İsviçre Hemen Yüklemeli İmplant Sistemleri Uzmanı");

  const stat1 = data.doctorStats?.[0] || {
    value: "25",
    label: isEn ? "years of\nexperience" : "yıl klinik\ndeneyim",
  };
  const stat2 = data.doctorStats?.[1] || {
    value: "1,500",
    label: isEn ? "smiles\nrestored" : "yenilenen\ngülüş",
  };
  const stat3 = data.doctorStats?.[2] || {
    value: "16k",
    label: isEn ? "implants\nplaced" : "başarılı\nimplant",
  };

  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_6.jpg"
      className="flex flex-col justify-between"
    >
      {/* 1. Eğimli Başlık Bandı */}
      <WiseHeader
        eyebrow={isEn ? "YOUR IMPLANTOLOGIST" : "İMPLANTOLOJİ UZMANINIZ"}
        title={doctorName.toUpperCase()}
        themeColor={themeColor}
      />

      {/* 2. İçerik ve Biyografi (wise_2.pdf orijinal koordinatlarında) */}
      <div className="flex-1 flex flex-col justify-between px-[62px] pt-[10px] pb-[68px] z-10">
        <div>
          <h2
            className="text-[22px] font-extrabold italic text-right leading-[1.3] mb-7 max-w-[420px] ml-auto"
            style={{ color: themeColor }}
          >
            {doctorTitle}
          </h2>

          <div className="space-y-5 text-[15px] leading-[1.58] text-[#222222] text-justify">
            {data.doctorBio ? (
              <p className="whitespace-pre-line">{data.doctorBio}</p>
            ) : (
              <>
                <p>
                  {isEn ? (
                    <>
                      Graduated from the University of Debrecen Medical and Health Science Centre in 2000 (D.D.S, D.M.D){" "}
                      <span className="font-bold text-black">
                        Specialised in Basal Implantology
                      </span>{" "}
                      - immediate loaded implant system
                    </>
                  ) : (
                    <>
                      2000 yılında Tıp ve Sağlık Bilimleri Fakültesi Diş Hekimliği Bölümü&apos;nden mezun olmuştur.{" "}
                      <span className="font-bold text-black">
                        Bazal İmplantoloji ve Hemen Yüklemeli İmplant Cerrahisi
                      </span>{" "}
                      alanlarında uzmanlaşmıştır.
                    </>
                  )}
                </p>
                <p>
                  {isEn ? (
                    <>
                      He has special interest and{" "}
                      <span className="font-bold text-black">advanced training</span> in Nobel Guide Implant Surgery, Ankylos and Straumann. He has built a considerable{" "}
                      <span className="font-bold text-black">
                        international reputation for high standards of dental care.
                      </span>
                    </>
                  ) : (
                    <>
                      Nobel Guide Bilgisayarlı İmplant Cerrahisi, Ankylos ve Straumann sistemlerinde{" "}
                      <span className="font-bold text-black">ileri düzey uzmanlık eğitimlerine</span>{" "}
                      sahiptir. Yüksek standartlardaki diş hekimliği uygulamalarıyla{" "}
                      <span className="font-bold text-black">
                        uluslararası düzeyde saygın bir üne sahiptir.
                      </span>
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        </div>

        {/* 3. Yeşil Rozetler (wise_2.pdf orijinal 3 daire tasarımı) */}
        <div className="grid grid-cols-3 gap-6 pt-6 select-none max-w-[620px] mx-auto w-full">
          <div className="flex flex-col items-center text-center">
            <div className="size-[86px] rounded-full bg-[#B8BCBE] flex items-center justify-center mb-3">
              <svg className="size-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="7" r="4" />
                <path d="M5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" />
                <path d="M10 14l2 4 2-4" />
              </svg>
            </div>
            <span className="text-[42px] font-extrabold italic text-[#70B66B] leading-none mb-1.5">
              {stat1.value}
            </span>
            <span className="text-[14.5px] italic text-[#222222] leading-[1.25] whitespace-pre-line">
              {stat1.label}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="size-[86px] rounded-full bg-[#B8BCBE] flex items-center justify-center mb-3">
              <svg className="size-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 11c2.5-2 5.5-3 8-3s5.5 1 8 3c-2 4.5-5 7-8 7s-6-2.5-8-7Z" />
                <path d="M5.5 11.5c2 1 4.2 1.5 6.5 1.5s4.5-.5 6.5-1.5" />
              </svg>
            </div>
            <span className="text-[42px] font-extrabold italic text-[#70B66B] leading-none mb-1.5">
              {stat2.value}
            </span>
            <span className="text-[14.5px] italic text-[#222222] leading-[1.25] whitespace-pre-line">
              {stat2.label}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="size-[86px] rounded-full bg-[#B8BCBE] flex items-center justify-center mb-3">
              <svg className="size-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 5a4 4 0 0 1 8 0c0 2-1.5 3.5-1.5 5.5h-5C9.5 8.5 8 7 8 5Z" />
                <line x1="9.5" y1="13" x2="14.5" y2="13" />
                <line x1="10" y1="15.5" x2="14" y2="15.5" />
                <line x1="10.5" y1="18" x2="13.5" y2="18" />
              </svg>
            </div>
            <span className="text-[42px] font-extrabold italic text-[#70B66B] leading-none mb-1.5">
              {stat3.value}
            </span>
            <span className="text-[14.5px] italic text-[#222222] leading-[1.25] whitespace-pre-line">
              {stat3.label}
            </span>
          </div>
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
