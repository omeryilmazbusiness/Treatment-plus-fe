import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { DoctorSignatureStamp } from "../motifs";
import { HeartHandshake, ShieldCheck, CheckCircle2, Sparkles } from "../icons";

export function Booklet24Page2Welcome({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";

  const welcomeText =
    data.welcomeBody ||
    data.welcomeText ||
    (isEn
      ? `Dear ${data.patientName}, thank you for choosing our clinic. We have conducted a thorough clinical analysis and designed this personalized comprehensive treatment roadmap to restore both the full masticatory function and the natural beauty of your smile.`
      : `Sayın ${data.patientName}, kliniğimizi tercih ettiğiniz için teşekkür ederiz. Ağız ve diş sağlığınızı en üst düzeye çıkarmak ve estetik gülüş tasarımınızı hayata geçirmek amacıyla tüm klinik ve radyolojik verileriniz titizlikle incelenmiş ve size özel bu kapsamlı tedavi yol haritası hazırlanmıştır.`);

  return (
    <PageFrame
      data={data}
      palette={palette}
      pageNumber={2}
      totalPages={24}
      pageTitle={isEn ? "A Warm Welcome & Clinical Commitment" : "Sıcak Karşılama & Klinik Taahhüdümüz"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-6">
        {/* Başlık Alanı */}
        <div className="border-b pb-4" style={{ borderColor: palette.border }}>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-2"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <HeartHandshake className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "OUR CLINICAL COMMITMENT" : "KLİNİK TAAHHÜDÜMÜZ VE YAKLAŞIMIMIZ"}</span>
          </div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{
              color: palette.primary,
              fontFamily: data.templateId === "botanical-serenity" ? "'Playfair Display', serif" : "inherit",
            }}
          >
            {isEn ? `A Warm Welcome to Our Clinic, ${data.patientName}` : `Kliniğimize Hoş Geldiniz, Sayın ${data.patientName}`}
          </h2>
        </div>

        {/* Mektup Gövdesi */}
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-normal">
          <p className="text-sm font-semibold text-slate-900 leading-relaxed">
            {welcomeText}
          </p>

          <p>
            {isEn
              ? "At our center, we believe modern dentistry should be a seamless, comfortable, and empowering experience. Every smile is biologically unique. That is why our multidisciplinary team of oral surgeons, prosthodontists, and master ceramists collaborate using state-of-the-art 3D digital imaging, guided implantology, and CAD/CAM robotic manufacturing."
              : "Kliniğimizde modern diş hekimliğinin konforlu, ağrısız ve güven verici bir deneyim olması gerektiğine inanıyoruz. Her gülüş biyolojik ve anatomik olarak benzersizdir. Bu nedenle cerrahlarımız, protez uzmanlarımız ve usta seramistlerimiz; 3D dijital görüntüleme, kılavuzlu cerrahi ve robotik CAD/CAM altyapısını kullanarak senkronize bir şekilde çalışmaktadır."}
          </p>

          <p>
            {isEn
              ? "This comprehensive 24-page dossier outlines your diagnostics, phased procedural appointments, exact material grades, transparent cost structures, and post-operative recovery guidelines. Our entire clinical team is dedicated to guiding you through every step of this journey."
              : "Elinizdeki bu 24 sayfalık kapsamlı sunum dokümanı; ağız içi teşhislerinizi, seans takviminizi, kullanılacak biyolojik materyal sertifikalarını, şeffaf fiyatlandırma tablosunu ve tedavi sonrası bakım kurallarını ayrıntılı olarak içermektedir. Tüm ekibimiz bu süreç boyunca yanınızda olacaktır."}
          </p>
        </div>

        {/* 3 Temel İlke Kartı */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="rounded-xl border p-3 bg-slate-50/50" style={{ borderColor: palette.border }}>
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: palette.primary }}>
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>{isEn ? "Biological Precision" : "Biyolojik Uyum"}</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              {isEn ? "100% biocompatible, allergen-free implants & titanium alloys." : "%100 doku dostu, alerji yapmayan titanyum ve zirkonyum altyapı."}
            </p>
          </div>

          <div className="rounded-xl border p-3 bg-slate-50/50" style={{ borderColor: palette.border }}>
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: palette.primary }}>
              <Sparkles className="size-4 text-sky-600" />
              <span>{isEn ? "Natural Aesthetics" : "Doğal Gülüş Estetiği"}</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              {isEn ? "Micro-layered translucency tailored to your facial harmony." : "Yüz hatlarınıza ve ten renginize özel mikron hassasiyetinde renk uyumu."}
            </p>
          </div>

          <div className="rounded-xl border p-3 bg-slate-50/50" style={{ borderColor: palette.border }}>
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: palette.primary }}>
              <CheckCircle2 className="size-4 text-blue-600" />
              <span>{isEn ? "Lifetime Guarantee" : "Ömür Boyu Garanti"}</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              {isEn ? "International warranty certificate on all implants." : "Tüm implant ve abutmentlarda uluslararası geçerli pasaport."}
            </p>
          </div>
        </div>

        {/* İmza Bloğu */}
        <div className="border-t pt-4 flex justify-between items-end" style={{ borderColor: palette.border }}>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              {isEn ? "PATIENT CARE TEAM" : "HASTA MEMNUNİYETİ VE KOORDİNASYON"}
            </span>
            <p className="text-xs font-semibold text-slate-700">
              {data.clinicName} — {isEn ? "Clinical Advisory Board" : "Klinik Danışma Kurulu"}
            </p>
          </div>

          <DoctorSignatureStamp
            doctorName={data.doctorName || "Dr. Dt. Selin Arslan"}
            signerTitle={data.doctorTitle || (isEn ? "Head of Oral Surgery" : "Başhekim & Çene Cerrahisi")}
            primaryColor={palette.primary}
            accentColor={palette.accent}
          />
        </div>
      </div>
    </PageFrame>
  );
}
