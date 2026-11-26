import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { Phone, Mail, Globe, MapPin, Clock, QrCode } from "../icons";

export function Booklet24Page24BackCover({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";

  const clinicName = data.clinicName || "Modern Dental Clinic";
  const doctorName = data.doctorName || "Dr. Dt. Lead Surgeon";
  const address = data.clinicAddress || data.address || "Barbaros Bulvarı No: 142/A, Beşiktaş, İstanbul";
  const phone = data.clinicPhone || data.phone || "+90 212 555 0100";
  const email = data.clinicEmail || data.email || "info@moderndental.com";
  const website = data.clinicWebsite || data.website || "www.moderndental.com";
  const logoUrl = data.clinicLogoUrl || data.logoUrl;

  return (
    <div
      className="a4-page relative flex flex-col justify-between overflow-hidden text-white"
      style={{
        width: "210mm",
        height: "297mm",
        backgroundColor: palette.coverBg || "#0F172A",
        padding: "24mm 20mm",
        boxSizing: "border-box",
        pageBreakAfter: "always",
        breakAfter: "page",
        backgroundImage:
          "radial-gradient(circle at 50% 20%, rgba(2,132,199,0.18) 0%, rgba(15,23,42,0.95) 75%)",
      }}
    >
      {/* Üst Logo ve Marka Bilgisi */}
      <div className="flex flex-col items-center text-center space-y-3 pt-6">
        <div
          className="size-20 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20"
          style={{ backgroundColor: palette.accent }}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={clinicName}
              className="size-14 object-contain"
            />
          ) : (
            <svg viewBox="0 0 24 24" className="size-12 fill-white">
              <path d="M12 2C8.5 2 6 4.5 6 8c0 3 1.5 5 2.5 7.5.8 2 1.5 4.5 3.5 4.5s2.7-2.5 3.5-4.5C16.5 13 18 11 18 8c0-3.5-2.5-6-6-6zm0 2c2.5 0 4 2 4 4.5 0 2-.9 3.5-2 5.5-.7 1.5-1.3 3-2 3s-1.3-1.5-2-3c-1.1-2-2-3.5-2-5.5C8 6 9.5 4 12 4z" />
            </svg>
          )}
        </div>

        <div>
          <h1
            className="text-3xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: palette.headingFont }}
          >
            {clinicName}
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-300 mt-1 font-semibold">
            {isEn ? "Advanced Oral Surgery & Implantology Center" : "Ağız, Diş Sağlığı ve İleri Cerrahi Merkezi"}
          </p>
        </div>
      </div>

      {/* Orta İletişim & Lokasyon Kartı (wise_2.pdf sayfa 24 formatı) */}
      <div className="w-full max-w-md mx-auto bg-slate-900/80 backdrop-blur-md rounded-3xl border border-white/10 p-6 space-y-4 shadow-2xl">
        {/* Adres */}
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-cyan-400">
            <MapPin className="size-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-white block uppercase tracking-wider text-[10px] text-slate-400">
              {isEn ? "Clinic Address" : "Klinik Adresi"}
            </span>
            <span className="text-slate-200 mt-0.5 block leading-relaxed font-normal">
              {address}
            </span>
          </div>
        </div>

        {/* Telefon */}
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-cyan-400">
            <Phone className="size-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-white block uppercase tracking-wider text-[10px] text-slate-400">
              {isEn ? "Phone" : "Telefon"}
            </span>
            <span className="text-slate-200 mt-0.5 block font-mono">
              {phone}
            </span>
          </div>
        </div>

        {/* E-posta */}
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-cyan-400">
            <Mail className="size-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-white block uppercase tracking-wider text-[10px] text-slate-400">
              {isEn ? "Email" : "E-posta"}
            </span>
            <span className="text-slate-200 mt-0.5 block">
              {email}
            </span>
          </div>
        </div>

        {/* Web Sitesi */}
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-cyan-400">
            <Globe className="size-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-white block uppercase tracking-wider text-[10px] text-slate-400">
              {isEn ? "Website" : "Web Sitesi"}
            </span>
            <span className="text-slate-200 mt-0.5 block font-mono">
              {website}
            </span>
          </div>
        </div>

        {/* Çalışma Saatleri */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-cyan-400" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isEn ? "Opening Hours" : "Çalışma Saatleri"}
              </span>
              <span className="text-slate-200">
                {isEn ? "Mon - Fri: 10:00 - 19:00" : "Hafta İçi: 09:30 - 19:30"}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {isEn ? "Sat: 10:00 - 16:00" : "Cumartesi: 10:00 - 17:00"}
          </span>
        </div>
      </div>

      {/* Alt Kısım: QR Kod ve Slogan */}
      <div className="flex flex-col items-center text-center space-y-3 pb-2">
        <div className="size-24 rounded-2xl bg-white p-2 flex items-center justify-center shadow-2xl">
          <QrCode className="size-20 text-slate-900" />
        </div>

        <p className="text-[11px] text-slate-400 max-w-xs">
          {isEn
            ? "Scan the QR code to navigate to the clinic or reach out directly on WhatsApp."
            : "Haritada yol tarifi almak veya WhatsApp hattımıza doğrudan bağlanmak için QR kodu taratabilirsiniz."}
        </p>

        <div className="pt-2 border-t border-white/10 w-full flex items-center justify-between text-[10px] text-slate-400">
          <span>&copy; {new Date().getFullYear()} {clinicName}</span>
          <span>{isEn ? "Every Smile Matters" : "Sağlıklı Gülüşler, Mutlu Hayatlar"}</span>
        </div>
      </div>
    </div>
  );
}
