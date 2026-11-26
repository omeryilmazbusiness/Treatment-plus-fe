import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { Award, ShieldCheck, CheckCircle2, Sparkles } from "../icons";

export function Booklet24Page20Awards({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";

  const accreditations = [
    { code: "Temos", title: "Temos International", sub: "Excellence in Medical Tourism" },
    { code: "JCI", title: "JCI Quality", sub: "Joint Commission International Approval" },
    { code: "ISO", title: "ISO 9001 / 13485", sub: "Certified Quality & Device Management" },
    { code: "Invisalign", title: "Platinum Elite", sub: "Recognized Orthodontic Provider" },
    { code: "BDA", title: "BDA Member", sub: "British Dental Association Protocols" },
    { code: "ITI", title: "ITI Member", sub: "International Team for Implantology" },
    { code: "AGD", title: "AGD Standard", sub: "Academy of General Dentistry" },
    { code: "ADA", title: "ADA Affiliate", sub: "American Dental Association Standards" },
  ];

  return (
    <PageFrame
      data={data}
      palette={palette}
      pageNumber={20}
      totalPages={24}
      pageTitle={isEn ? "International Recognitions & Awards" : "Uluslararası Akreditasyonlar & Ödüllerimiz"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-4">
        {/* Başlık ve Açıklama Metni (wise_2.pdf sayfa 20) */}
        <div className="space-y-2.5">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <Award className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "PROVEN GLOBAL RECOGNITION" : "ULUSLARARASI KANITLANMIŞ KALİTE"}</span>
          </div>

          <h2
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: palette.primary, fontFamily: palette.headingFont }}
          >
            {isEn ? "Our Recognitions & Awards" : "Akreditasyonlarımız & Ödüllerimiz"}
          </h2>

          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {isEn
              ? "At our clinic, excellence isn't just a promise—it's a proven standard. Recognized for outstanding patient care and dental expertise, we have earned prestigious awards that set us apart in the field of dental tourism."
              : "Kliniğimizde mükemmellik sadece bir vaat değil, tescillenmiş bir çalışma standardıdır. Üstün hasta bakımı, cerrahi başarı ve diş hekimliği uzmanlığımız ile sağlık turizmi alanında uluslararası ölçekte en prestijli ödüllere layık görüldük."}
          </p>

          <p className="text-xs text-slate-600 leading-relaxed">
            {isEn
              ? "Our commitment to quality is backed by internationally accredited certifications, ensuring that every treatment meets the highest standards of safety, hygiene, and precision. We adhere to strict protocols, use only premium materials, and stay ahead with cutting-edge technology. Because when it comes to your smile, only the best will do."
              : "Kaliteye olan bağlılığımız, dünya çapında kabul gören akreditasyonlarla tescillenmiştir. Her tedavinin en yüksek güvenlik, hijyen ve hassasiyet standartlarında gerçekleştiğini garanti ediyoruz. Yalnızca birinci sınıf sertifikalı materyaller kullanıyor ve tıp teknolojisini yakından takip ediyoruz."}
          </p>
        </div>

        {/* Akreditasyon Logoları Grid (Temos, JCI, ISO, Invisalign, BDA, ITI, AGD, ADA) */}
        <div className="grid grid-cols-4 gap-3">
          {accreditations.map((ac, idx) => (
            <div
              key={idx}
              className="rounded-2xl border p-3 flex flex-col items-center text-center justify-between shadow-2xs hover:shadow-xs transition"
              style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
            >
              <div className="size-11 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center font-black font-mono text-sm tracking-wider text-slate-800 shadow-2xs">
                {ac.code}
              </div>
              <div className="mt-2">
                <span className="text-[11px] font-bold text-slate-900 block leading-tight">
                  {ac.title}
                </span>
                <span className="text-[9px] text-slate-500 mt-0.5 block leading-tight">
                  {ac.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Swiss Perio Education & Sürekli Eğitim Çubuğu */}
        <div
          className="rounded-2xl border p-3.5 flex items-center justify-between shadow-xs"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <div className="flex items-center gap-3">
            <div
              className="size-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
              style={{ backgroundColor: palette.primary, color: "#FFFFFF" }}
            >
              +
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                swiss+perio EDUCATION &amp; RESIDENCY
              </span>
              <span className="text-[11px] text-slate-500">
                {isEn
                  ? "Surgical faculty participating in continuous advanced Swiss periodontal training."
                  : "Cerrahi ekibimiz İsviçre menşeili ileri periodontal cerrahi ve implantoloji eğitimlerine düzenli olarak katılmaktadır."}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-100 text-slate-700 font-bold shrink-0">
            CONTINUOUS CPD
          </span>
        </div>

        {/* Alt Bilgi */}
        <div
          className="rounded-xl border p-2.5 flex items-center justify-between text-xs"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <span className="text-slate-600 flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            {isEn ? "Audit-verified hygiene & clinical sterilization standards." : "Düzenli denetlenen hijyen ve hastane tipi sterilizasyon protokolleri."}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-700">GLOBAL ACCREDITED</span>
        </div>
      </div>
    </PageFrame>
  );
}
