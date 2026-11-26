import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { Award, ShieldCheck, HeartHandshake, CheckCircle2 } from "../icons";

export function Booklet24Page7DoctorPhoto({
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
      pageNumber={7}
      totalPages={24}
      pageTitle={isEn ? "Lead Surgeon Profile & Clinical Philosophy" : "Hekim Portresi & Tedavi Felsefesi"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-5">
        {/* Başlık */}
        <div className="border-b pb-3" style={{ borderColor: palette.border }}>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-1.5"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <ShieldCheck className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "THE CLINICIAN'S PLEDGE" : "HEKİMİN KLİNİK FELSEFESİ VE YAKLAŞIMI"}</span>
          </div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{
              color: palette.primary,
              fontFamily: data.templateId === "botanical-serenity" ? "'Playfair Display', serif" : "inherit",
            }}
          >
            {isEn ? "Precision, Empathy, and Lifelong Aesthetics" : "Hassasiyet, Empati ve Yaşam Boyu Süren Estetik"}
          </h2>
        </div>

        {/* Portre ve Felsefe Kartı */}
        <div className="grid grid-cols-12 gap-6 items-center my-auto">
          {/* Sol: Hekim Portre Alanı */}
          <div className="col-span-6 rounded-2xl overflow-hidden border bg-slate-100 p-2 shadow-sm flex flex-col items-center justify-center text-center space-y-3" style={{ borderColor: palette.border }}>
            <div className="w-full h-72 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 relative flex items-center justify-center shadow-inner">
              {data.doctorPhotoUrl ? (
                <img src={data.doctorPhotoUrl} alt={data.doctorName || "Hekim"} className="size-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-4">
                  <div className="size-20 rounded-full bg-slate-300 flex items-center justify-center mb-2">
                    <svg viewBox="0 0 24 24" fill="none" className="size-10 text-slate-500" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{data.doctorName}</span>
                  <span className="text-[10px] text-slate-400">{data.doctorTitle || "Oral & Maxillofacial Surgeon"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sağ: Tedavi Felsefesi & Sertifikalar */}
          <div className="col-span-6 space-y-4 text-xs text-slate-700">
            <div
              className="rounded-xl border p-4 bg-slate-50/70 border-l-4 space-y-2"
              style={{
                borderTopColor: palette.border,
                borderRightColor: palette.border,
                borderBottomColor: palette.border,
                borderLeftColor: palette.primary,
              }}
            >
              <p className="italic font-medium text-slate-800 leading-relaxed">
                {isEn
                  ? "\"True dental mastery does not just fix teeth; it restores the patient's joy of laughter, freedom to eat comfortably, and confidence to smile without hesitation.\""
                  : "\"Gerçek diş hekimliği sadece dişleri onarmaz; hastanın doya doya gülme özgürlüğünü, rahatça yemek yeme konforunu ve özgüvenini yeniden inşa eder.\""}
              </p>
              <span className="block text-right font-bold text-slate-900">— {data.doctorName}</span>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                {isEn ? "Specialized Certifications" : "Uzmanlık Belgeleri & Eğitimler"}
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-600">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>{isEn ? "Advanced Guided Bone Regeneration & Sinus Augmentation" : "İleri Seviye Kılavuzlu Kemik Rejenerasyonu ve Sinüs Lifting"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>{isEn ? "Computer-Guided Dynamic Navigational Surgery (Navident)" : "Navigasyonlu 3D Bilgisayar Destekli İmplant Cerrahisi"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>{isEn ? "Digital Smile Design (DSD) & Facially-Driven Aesthetics" : "Dijital Gülüş Tasarımı (DSD) ve Yüz Odaklı Estetik Mimarisi"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>{isEn ? "Basal & Cortical Immediate-Load Implantology Diploma" : "Bazal ve Kortikal İmplant Hemen Yükleme Protokolleri"}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="border-t pt-3 flex items-center justify-between text-[11px] text-slate-500" style={{ borderColor: palette.border }}>
          <span>{data.clinicName} — {isEn ? "Department of Oral & Maxillofacial Surgery" : "Ağız, Diş ve Çene Cerrahisi Anabilim Dalı"}</span>
          <span className="font-mono text-slate-400">{data.planNo}</span>
        </div>
      </div>
    </PageFrame>
  );
}
