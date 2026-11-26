import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { Phone, Mail, Globe, MessageCircle, HeartHandshake, ShieldCheck, CheckCircle2 } from "../icons";

export function Booklet24Page3Coordinator({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";

  return (
    <PageFrame
      data={data}
      palette={palette}
      pageNumber={3}
      totalPages={24}
      pageTitle={isEn ? "Your Dedicated Patient Coordinator" : "Kişisel Hasta Koordinatörünüz"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-5">
        {/* Başlık */}
        <div className="border-b pb-3" style={{ borderColor: palette.border }}>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-1.5"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <HeartHandshake className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "PERSONAL CONCIERGE & SUPPORT" : "7/24 BİREBİR HASTA DESTEK VE REHBERLİK"}</span>
          </div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{
              color: palette.primary,
              fontFamily: data.templateId === "botanical-serenity" ? "'Playfair Display', serif" : "inherit",
            }}
          >
            {isEn ? "Meet Your Dedicated Care Coordinator" : "Tedavi Süreciniz Boyunca Yanınızdayız"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEn
              ? "From flight planning and VIP transfers to clinical questions, your personal coordinator handles every detail."
              : "Ulaşım, randevu planlaması ve tedavi sonrası konforunuza kadar her aşamada rehberlik eden kişisel danışmanınız."}
          </p>
        </div>

        {/* Koordinatör Tanıtım Kartı */}
        <div className="grid grid-cols-12 gap-5 items-center">
          {/* Sol: Portre Görseli / Kartı */}
          <div className="col-span-5 rounded-2xl overflow-hidden border bg-slate-100 p-2 shadow-sm flex flex-col items-center text-center space-y-3" style={{ borderColor: palette.border }}>
            <div className="size-40 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center">
              <svg viewBox="0 0 100 100" fill="none" className="size-full text-slate-400">
                <circle cx="50" cy="38" r="20" fill="currentColor" opacity="0.4" />
                <path d="M15 88C15 68 30 62 50 62C70 62 85 68 85 88" fill="currentColor" opacity="0.4" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Angelina K. / Selin Y.</h3>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {isEn ? "Senior Patient Coordinator" : "Kıdemli Hasta Koordinatörü"}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-[10px] font-bold">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span>{isEn ? "Available 24/7 on WhatsApp" : "7/24 WhatsApp Destek"}</span>
              </div>
            </div>
          </div>

          {/* Sağ: Koordinatör Hizmetleri */}
          <div className="col-span-7 space-y-3 text-xs text-slate-700">
            <div className="rounded-xl border p-3.5 bg-slate-50/70 space-y-1.5" style={{ borderColor: palette.border }}>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-sky-600" />
                <span>{isEn ? "1. Seamless Scheduling & Treatment Timeline" : "1. Randevu ve Seans Yönetimi"}</span>
              </h4>
              <p className="text-[11px] text-slate-600">
                {isEn
                  ? "Direct coordination between surgeons, laboratories, and your daily schedule with zero waiting time."
                  : "Hekimlerimiz, laboratuvarımız ve sizin takviminiz arasında sıfır bekleme süresiyle randevu senkronizasyonu."}
              </p>
            </div>

            <div className="rounded-xl border p-3.5 bg-slate-50/70 space-y-1.5" style={{ borderColor: palette.border }}>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-sky-600" />
                <span>{isEn ? "2. Multilingual Communication" : "2. Çok Dilli İletişim & Danışmanlık"}</span>
              </h4>
              <p className="text-[11px] text-slate-600">
                {isEn
                  ? "Native communication in English, Turkish, German, and French for transparent explanations of procedures."
                  : "Tedavi adımlarının kendi dilinizde şeffaf ve eksiksiz aktarımı için çok dilli profesyonel tercüman desteği."}
              </p>
            </div>

            <div className="rounded-xl border p-3.5 bg-slate-50/70 space-y-1.5" style={{ borderColor: palette.border }}>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-sky-600" />
                <span>{isEn ? "3. VIP Travel & Accommodation Assistance" : "3. Konaklama ve Özel VIP Transfer"}</span>
              </h4>
              <p className="text-[11px] text-slate-600">
                {isEn
                  ? "Airport pick-up with dedicated Mercedes Vito, partner 5-star hotel reservations, and clinic shuttles."
                  : "Havalimanı VIP karşılama, anlaşmalı 5 yıldızlı otel rezervasyonları ve klinik içi özel transfer hizmeti."}
              </p>
            </div>
          </div>
        </div>

        {/* İletişim Kanalları Kutusu */}
        <div className="rounded-2xl border p-4 bg-slate-900 text-white shadow-md flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
              {isEn ? "DIRECT CONCIERGE HOTLINE" : "DİREKT HASTA DANIŞMA HATTI"}
            </span>
            <p className="text-sm font-bold text-white">
              {data.phone || "+90 (212) 555 01 23"}
            </p>
            <p className="text-[10px] text-slate-400">
              {data.email || "coordinator@dentalclinic.com"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 px-3.5 py-2 text-center border border-white/10">
              <span className="text-[9px] text-slate-300 block uppercase font-bold">{isEn ? "Response Time" : "Yanıt Süresi"}</span>
              <span className="text-xs font-black text-emerald-400">&lt; 15 {isEn ? "mins" : "dakika"}</span>
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
