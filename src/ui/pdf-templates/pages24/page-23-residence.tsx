import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { ShieldCheck, CheckCircle2, Clock, Sparkles } from "../icons";

export function Booklet24Page23Residence({
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
      pageNumber={23}
      totalPages={24}
      pageTitle={isEn ? "5-Star Residence & Mercedes VIP Transfer" : "5 Yıldızlı Rezidans & VIP Transfer Hizmeti"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-4">
        {/* Taç Amblemi & Başlık (wise_2.pdf sayfa 23) */}
        <div className="space-y-2 text-center">
          {/* Taç Logosu Vektörü */}
          <div className="mx-auto size-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-2xs">
            <svg viewBox="0 0 24 24" className="size-7 fill-amber-500">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
            </svg>
          </div>

          <h2
            className="text-2xl font-extrabold tracking-tight tracking-widest uppercase"
            style={{ color: palette.primary, fontFamily: palette.headingFont }}
          >
            RESIDENCE &bull; ★★★★★
          </h2>

          <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
            {isEn ? "PREMIUM LUXURY LIVING & EFFORTLESS TRAVEL" : "PREMIUM REZİDANS AYRICALIĞI VE KESİNTİSİZ VIP TRANSFER"}
          </p>
        </div>

        {/* 3 Paragraf Açıklama Metni (wise_2.pdf sayfa 23 metinleri) */}
        <div
          className="rounded-2xl border p-5 space-y-3 shadow-xs"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {isEn
              ? "Your journey to a brighter smile should be as effortless as your stay. That's why we've partnered with a hotel that blends comfort, convenience, and elegance, ensuring your dental trip feels like a well-earned retreat."
              : "Kusursuz bir gülüşe giden yolculuğunuz, konaklamanız kadar rahat ve zahmetsiz olmalıdır. Bu yüzden konfor, şıklık ve huzuru bir araya getiren iş ortaklarımızla çalışıyor; diş tedavisi seyahatinizi hak edilmiş bir dinlenme tatiline dönüştürüyoruz."}
          </p>

          <p className="text-xs text-slate-600 leading-relaxed">
            {isEn
              ? "Located just moments from our clinic, this hotel offers the perfect balance of relaxation and accessibility, allowing you to focus on your treatment while enjoying the finest hospitality."
              : "Kliniğimize yalnızca birkaç dakika mesafede konumlanan rezidansımız, dinlenme ile ulaşılabilirliğin mükemmel dengesini sunar. Şehrin en seçkin misafirperverliğinin tadını çıkarırken sadece tedavinize odaklanabilirsiniz."}
          </p>

          <p className="text-xs text-slate-600 leading-relaxed">
            {isEn
              ? "From luxurious rooms to personalized services, every detail is designed to make your recovery smooth and your stay unforgettable."
              : "Ferah yaşam alanlarından kişiselleştirilmiş oda servislerine kadar her ayrıntı, iyileşme sürecinizi konforlu, anılarınızı ise unutulmaz kılmak için düşünülmüştür."}
          </p>
        </div>

        {/* Mercedes VIP Transfer Kartı */}
        <div
          className="rounded-2xl border p-4 shadow-sm flex items-center justify-between"
          style={{
            backgroundColor: "#0F172A",
            borderColor: palette.border,
            color: "#FFFFFF",
          }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold">
              <Sparkles className="size-3.5" />
              <span>{isEn ? "PRIVATE MERCEDES-BENZ VIP TRANSFER" : "ÖZEL MERCEDES-BENZ VIP TRANSFER"}</span>
            </div>
            <h3 className="text-sm font-bold text-white">
              {isEn ? "Airport ⇄ Hotel ⇄ Clinic Direct Chauffeur" : "Havalimanı ⇄ Otel ⇄ Klinik Özel Şoförlü Transfer"}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isEn
                ? "Dedicated driver awaits you upon arrival. Zero taxi hassle or navigation stress."
                : "Havalimanı inişinizde isminizle karşılanırsınız. Randevularınıza özel şoförünüz eşliğinde ulaşırsınız."}
            </p>
          </div>

          <div className="size-14 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-center shrink-0">
            <span className="text-xl">🚐</span>
            <span className="text-[8px] font-mono font-bold text-cyan-300 mt-0.5">VIP VAN</span>
          </div>
        </div>

        {/* Alt Güvence Notu */}
        <div
          className="rounded-xl border p-2.5 flex items-center justify-between text-xs"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <span className="text-slate-600 flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            {isEn ? "Fully licensed & insured private medical transfer fleet." : "Sağlık Bakanlığı ve Turizm Bakanlığı onaylı lisanslı transfer filosu."}
          </span>
          <span className="font-mono text-slate-700 text-[11px] font-bold">INCLUDED</span>
        </div>
      </div>
    </PageFrame>
  );
}
