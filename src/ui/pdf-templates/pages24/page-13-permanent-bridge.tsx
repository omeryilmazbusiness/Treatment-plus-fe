import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { ShieldCheck, CheckCircle2, Clock, Sparkles, Stethoscope, HeartPulse } from "../icons";

export function Booklet24Page13PermanentBridge({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";

  const checkupProtocols = [
    {
      num: "01",
      title: isEn ? "Implant Stability" : "İmplant Stabilitesi ve Entegrasyon",
      desc: isEn
        ? "Ensuring the titanium implants are fully integrated with the jawbone and securely locked."
        : "Titanyum implantların çene kemiğine eksiksiz biyolojik entegrasyonu (osseointegrasyon) ve tork gücü denetlenir.",
      icon: ShieldCheck,
    },
    {
      num: "02",
      title: isEn ? "Gum & Bone Health" : "Diş Eti ve Kemik Doku Sağlığı",
      desc: isEn
        ? "Checking for inflammation, peri-implant infection, or any marginal bone resorption."
        : "İmplant çevresi mukozanın pembe estetiği, diş eti cebi derinliği ve kemik stabilitesi hassas sondlarla kontrol edilir.",
      icon: HeartPulse,
    },
    {
      num: "03",
      title: isEn ? "Bridge Integrity & Occlusion" : "Köprü Uyumu ve Oklüzyon (Kapanış)",
      desc: isEn
        ? "Assessing 3D bite balance, micro-wear, masticatory contact distribution, and screw tightness."
        : "Çiğneme kuvvetlerinin eşit dağılımı, çene eklemi dengesi, vida sıkılıkları ve mikrometrik temas noktaları ayarlanır.",
      icon: Sparkles,
    },
    {
      num: "04",
      title: isEn ? "Oral Hygiene Maintenance" : "Profesyonel Hijyen & Bakım Takibi",
      desc: isEn
        ? "Specialized ultrasonic dental cleaning and personalised guidance for interdental hygiene."
        : "İmplant ve hibrit köprüler için özel teflon uçlu temizlik, arayüz fırçası ve ağız duşu kullanım eğitimi verilir.",
      icon: CheckCircle2,
    },
  ];

  return (
    <PageFrame
      data={data}
      palette={palette}
      pageNumber={13}
      totalPages={24}
      pageTitle={isEn ? "Fitting the Permanent Bridge & Protocol" : "Kalıcı Köprü Uygulama Süreci & Kontrol"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-4">
        {/* Giriş Hero Kartı */}
        <div
          className="rounded-2xl border p-5 shadow-xs relative overflow-hidden"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-2.5"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <Clock className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "THE HEALING PERIOD & PERMANENT RESTORATION" : "4-6 AYLIK İYİLEŞME SÜRECİ & KALICI RESTORASYON"}</span>
          </div>

          <h2
            className="text-2xl font-bold tracking-tight mb-2"
            style={{ color: palette.primary, fontFamily: palette.headingFont }}
          >
            {isEn ? "Fitting the Permanent Bridge" : "Kalıcı Köprünün Takılması"}
          </h2>

          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {isEn
              ? "Following the healing period (4-6 months) — without any need for further surgery — the temporary fixed dentures are gently removed and a high-precision 12-unit monolithic zirconia permanent bridge is crafted and seated within 5 days."
              : "İmplantların çene kemiğine tam kaynama süresi (4-6 ay) tamamlandıktan sonra — ek hiçbir cerrahi müdahaleye gerek kalmaksızın — geçici sabit dişleriniz çıkarılır ve sadece 5 gün içerisinde kliniğimizin kendi dijital laboratuvarında üretilen 12 üyeli kalıcı zirkonyum köprünüz vidalanarak takılır."}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3 pt-3 border-t border-slate-200/80">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {isEn ? "Surgical Need" : "Cerrahi Müdahale"}
              </span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                {isEn ? "0 New Surgery" : "Sıfır Ek Cerrahi"}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {isEn ? "Lab Delivery" : "Laboratuvar Süresi"}
              </span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                {isEn ? "Within 5 Days" : "5 İş Gününde Teslim"}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {isEn ? "Material" : "Kullanılan Materyal"}
              </span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">
                {isEn ? "Monolithic Zirconia" : "Monolitik Zirkonyum"}
              </span>
            </div>
          </div>
        </div>

        {/* Check-up Protokolü Başlığı */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3
                className="text-lg font-bold tracking-tight"
                style={{ color: palette.primary, fontFamily: palette.headingFont }}
              >
                {isEn ? "Check-up & Maintenance Protocol" : "Periyodik Takip & Kontrol Protokolü"}
              </h3>
              <p className="text-xs text-slate-500">
                {isEn
                  ? "Regular check-ups are essential to ensure the long-term success of your dental implants and bridges. What we check:"
                  : "İmplantlarınızın ve kalıcı köprülerinizin ömür boyu kusursuz hizmet vermesi için takip ettiğimiz 4 aşamalı klinik kontrol protokolü:"}
              </p>
            </div>
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: palette.light, color: palette.primary }}
            >
              {isEn ? "Clinical Standard" : "Klinik Standardı"}
            </span>
          </div>

          {/* 4 Kartlık Protokol Grid */}
          <div className="grid grid-cols-2 gap-3">
            {checkupProtocols.map((p) => {
              const IconComp = p.icon;
              return (
                <div
                  key={p.num}
                  className="rounded-xl border p-3.5 space-y-1.5 shadow-2xs hover:shadow-xs transition"
                  style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-mono font-black"
                      style={{ color: palette.accent }}
                    >
                      {p.num}
                    </span>
                    <div
                      className="size-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: palette.light, color: palette.primary }}
                    >
                      <IconComp className="size-4" />
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{p.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-normal">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alt Güvence Notu */}
        <div
          className="rounded-xl p-3 border flex items-center justify-between text-xs"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="size-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: palette.primary, color: "#FFFFFF" }}
            >
              <Stethoscope className="size-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">
                {isEn ? "Annual Free Comprehensive Control" : "Yıllık Ücretsiz Kapsamlı Kontrol"}
              </span>
              <span className="text-[11px] text-slate-500">
                {isEn
                  ? "Every patient is invited once a year for complimentary panoramic X-ray and bite assessment."
                  : "Tüm hastalarımız yılda bir kez panoramik röntgen ve çiğneme dengesi kontrolüne ücretsiz davet edilir."}
              </span>
            </div>
          </div>
          <span className="font-mono font-bold text-slate-700 text-[11px]">
            {isEn ? "Guaranteed" : "Garantili"}
          </span>
        </div>
      </div>
    </PageFrame>
  );
}
