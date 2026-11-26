import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { Sparkles, Award, CheckCircle2, HeartPulse } from "../icons";

export function Booklet24Page17SmileResult({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";

  const aestheticParameters = [
    { label: isEn ? "Golden Ratio" : "Altın Oran Uyumu", val: "1 : 1.618" },
    { label: isEn ? "Incisal Curve" : "İnsizal Gülüş Eğrisi", val: isEn ? "Parallel to Lower Lip" : "Alt Dudağa Paralel" },
    { label: isEn ? "Shade & Value" : "Renk ve Parlaklık", val: "Vita BL2 Bleach" },
    { label: isEn ? "Gingival Zeniths" : "Diş Eti Zenit Noktaları", val: isEn ? "Symmetric & Healthy" : "Simetrik ve Pembe" },
  ];

  return (
    <PageFrame
      data={data}
      palette={palette}
      pageNumber={17}
      totalPages={24}
      pageTitle={isEn ? "The Result: Smile Makeover Transformation" : "Tedavi Sonucu: Kusursuz Gülüş Dönüşümü"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-3">
        {/* Başlık */}
        <div className="space-y-1.5">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <Sparkles className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "CLINICAL OUTCOME & CONFIDENCE" : "KLİNİK SONUÇ VE KENDİNE GÜVEN"}</span>
          </div>

          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ color: palette.primary, fontFamily: palette.headingFont }}
          >
            {isEn ? "The Result: Total Smile Makeover" : "Sonuç: Zirkonyum ile Kusursuz Gülüş"}
          </h2>

          <p className="text-xs text-slate-700 leading-relaxed font-normal">
            {isEn
              ? "A complete restorative transformation that brings together scientific biomechanics and artistic smile design. Our goal is not just teeth, but restoring full chewing function, facial volume, and radiant self-confidence."
              : "Biyomekanik mühendislik ile estetik sanatının birleştiği eksiksiz bir gülüş dönüşümü. Amacımız sadece eksik dişleri tamamlamak değil; çiğneme fonksiyonunu, dudak desteğini ve kendinize olan tam güveni yeniden kazandırmaktır."}
          </p>
        </div>

        {/* Büyük Görsel / Hasta Gülüş Portresi Alanı (wise_2.pdf sayfa 17) */}
        <div
          className="flex-1 rounded-2xl border p-4 flex flex-col justify-between relative overflow-hidden shadow-sm"
          style={{
            backgroundColor: palette.cardBg,
            borderColor: palette.border,
            backgroundImage: "linear-gradient(135deg, rgba(15,23,42,0.03) 0%, rgba(2,132,199,0.05) 100%)",
          }}
        >
          {/* Estetik Vektör İllüstrasyonu */}
          <div className="flex-1 flex flex-col items-center justify-center my-auto py-4">
            <div className="relative size-36 rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700 text-white">
              <svg viewBox="0 0 100 100" className="size-24 drop-shadow">
                {/* Gülümseyen Dişler ve Dudak Vektörü */}
                <path
                  d="M 15 50 C 25 75 75 75 85 50 C 75 58 25 58 15 50 Z"
                  fill="#FFFFFF"
                />
                <path
                  d="M 22 51 C 30 65 70 65 78 51 C 70 55 30 55 22 51 Z"
                  fill="#0284C7"
                />
                <circle cx="50" cy="35" r="16" fill="#FDE047" opacity="0.3" />
                <path
                  d="M 50 15 L 50 25 M 50 75 L 50 85 M 15 50 L 25 50 M 75 50 L 85 50"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h3
              className="mt-3 text-lg font-bold tracking-tight text-slate-900"
              style={{ fontFamily: palette.headingFont }}
            >
              {isEn ? "Radiant & Natural Balance" : "Işıltılı ve Doğal Denge"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEn ? "Custom-shaded monolithic zirconia bridge" : "Kişiye özel tonlanmış monolitik zirkonyum köprü"}
            </p>
          </div>

          {/* 4 Parametre Kutusu */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-200/80">
            {aestheticParameters.map((p, idx) => (
              <div key={idx} className="rounded-xl bg-white/80 p-2 text-center border border-slate-100 shadow-2xs">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                  {p.label}
                </span>
                <span className="text-[11px] font-bold text-slate-800 mt-0.5 block truncate">
                  {p.val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hasta Memnuniyet Alıntısı */}
        <div
          className="rounded-xl border p-3 flex items-center gap-3 shadow-2xs"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <div
            className="size-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <Award className="size-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">
              {isEn ? '"I can smile, laugh and eat with total freedom again."' : '"Yıllar sonra ilk defa tereddütsüz gülebiliyor ve dilediğimi yiyebiliyorum."'}
            </span>
            <span className="text-[10px] text-slate-500">
              {isEn ? "Patient Testimonial — Full Arch Zirconia Treatment" : "Hasta Yorumu — Tam Çene All-on-4 Zirkonyum Tedavisi"}
            </span>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
