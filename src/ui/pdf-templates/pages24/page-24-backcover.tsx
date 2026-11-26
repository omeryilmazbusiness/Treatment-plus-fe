/* eslint-disable @next/next/no-img-element */
import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseToothLogo } from "../wise-frame";

export function Booklet24Page24BackCover({
  data,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const clinicName = (data.clinicName || "Wise Dental").trim();
  const slogan = data.slogan || data.clinicSlogan || "Every Smile Matters!!";

  const address = data.clinicAddress || data.address || "123 Main St. Anytown, Country";
  const phone = data.clinicPhone || data.phone || "+1 234 567890";
  const email = data.clinicEmail || data.email || "contact@wisedental.com";
  const website = data.clinicWebsite || data.website || "wisedental.com";

  const words = clinicName.split(/\s+/);
  const firstWord = words[0] || "Wise";
  const restWords = words.slice(1).join(" ");

  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_24.jpg"
      className="flex flex-col justify-between"
    >
      {/* Üst Boşluk */}
      <div className="h-32" />

      {/* İletişim Bilgileri (temizlenmiş page_24.jpg üzerinde wise_2.pdf orijinal tipografisiyle) */}
      <div className="flex-1 flex flex-col items-center justify-start text-center px-12 select-none z-10 text-white space-y-7">
        <div>
          <h3 className="text-[19px] font-bold tracking-tight text-white mb-1">
            {isEn ? "Clinic Address" : "Klinik Adresi"}
          </h3>
          <p className="text-[18px] text-white/90 font-extralight max-w-[460px] leading-snug">
            {address}
          </p>
        </div>

        <div>
          <h3 className="text-[19px] font-bold tracking-tight text-white mb-1">
            {isEn ? "Phone" : "Telefon"}
          </h3>
          <p className="text-[18px] text-white/90 font-extralight">
            {phone}
          </p>
        </div>

        <div>
          <h3 className="text-[19px] font-bold tracking-tight text-white mb-1">
            {isEn ? "Email" : "E-posta"}
          </h3>
          <p className="text-[18px] text-white/90 font-extralight">
            {email}
          </p>
        </div>

        <div>
          <h3 className="text-[19px] font-bold tracking-tight text-white mb-1">
            {isEn ? "Website" : "Web Sitesi"}
          </h3>
          <p className="text-[18px] text-white/90 font-extralight">
            {website}
          </p>
        </div>

        <div>
          <h3 className="text-[19px] font-bold tracking-tight text-white mb-1">
            {isEn ? "Opening Hours" : "Çalışma Saatleri"}
          </h3>
          <p className="text-[18px] text-white/90 font-extralight leading-snug">
            {isEn ? "Monday – Friday: 10:00–19:00" : "Pazartesi – Cuma: 10:00–19:00"}
            <br />
            {isEn ? "Saturday – Sunday: Closed" : "Cumartesi – Pazar: Kapalı"}
          </p>
        </div>
      </div>

      {/* Alt: Altın Diş Logosu ve Klinik Adı (wise_2.pdf orijinal konumunda) */}
      <div className="flex flex-col items-center justify-center text-center pb-28 select-none z-10">
        {data.logoUrl ? (
          <img
            src={data.logoUrl}
            alt={clinicName}
            className="h-20 object-contain mb-3 drop-shadow-lg"
          />
        ) : (
          <div className="mb-2 drop-shadow-xl">
            <WiseToothLogo className="size-24" color="#E5B94E" />
          </div>
        )}
        <h2
          className="tracking-tight leading-none mb-1.5"
          style={{
            fontSize: clinicName.length > 18 ? "32px" : "40px",
            color: "#E6BC53",
          }}
        >
          <span className="font-black">{firstWord}</span>
          {restWords ? <span className="font-extralight ml-1.5">{restWords}</span> : null}
        </h2>
        <p className="text-[10.5px] font-light tracking-[0.38em] text-[#E8D292]">
          {slogan}
        </p>
      </div>
    </WisePageWrapper>
  );
}
