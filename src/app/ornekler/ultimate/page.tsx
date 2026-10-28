import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  CheckCircle2,
  Sparkles,
  UserPlus,
} from "lucide-react";

import { OdontogramCanvas } from "@/ui/landing/odontogram-canvas";
import { Mark } from "@/ui/mark";

const ultimateSamples = [
  {
    code: "ULT-301",
    title: "3D Odontogram Destekli Full-Arch İmplant Sunumu",
    tag: "3D + Animasyonlu Prosedür",
    summary:
      "Hastanın eksik dişlerini, sinüs lifting ihtiyacını ve yerleştirilecek implant açılarını 3 boyutlu interaktif model üzerinde katmanlı olarak gösteren kapsamlı sunum.",
    features: [
      "360° döndürülebilir 3D çene ve diş simülasyonu",
      "Adım adım cerrahi ve protetik aşama animasyonları",
      "Klinik laboratuvarı, hekim kadrosu ve konaklama vitrini",
    ],
  },
  {
    code: "ULT-302",
    title: "Uluslararası Hasta (Sağlık Turizmi) VIP Tedavi Paketi",
    tag: "Çok Dilli İnteraktif Sunum",
    summary:
      "Yurt dışı hastalar için uçuş/transfer, otel konaklaması, 3D gülüş önizlemesi ve aşamalı tedavi takvimini tek bir interaktif bağlantıda birleştiren deneyim.",
    features: [
      "Önce / Sonra 3D restorasyon karşılaştırma modu",
      "Otel, klinik ödülleri ve sertifika galerisi",
      "Mobil cihazdan anlık tedavi onayı ve soru-cevap",
    ],
  },
] as const;

export default function UltimateShowcasePage() {
  return (
    <div className="min-h-dvh bg-slate-950 font-sans text-white">
      {/* Üst Bar */}
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark framed className="h-9 w-9 ring-1 ring-white/15" />
            <span className="text-base font-bold tracking-tight text-white">
              Treatment+ · Ultimate Paket
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/ornekler/classic"
              className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              Classic Paket Örneklerine Bak
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Kayıt Ol</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <Link
          href="/#fiyatlandirma"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Paketlere Geri Dön</span>
        </Link>

        {/* Başlık ve Canlı 3D Önizleme */}
        <div className="mt-6 grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Ultimate Paket Örnekleri
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              3 Boyutlu İnteraktif Tedavi ve Klinik Deneyimi
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              Ultimate Paket; 3D odontogram modellerini, animasyonlu tedavi
              prosedürlerini ve kliniğinizin tüm prestij öğelerini (laboratuvar,
              hekim profili, konaklama) tek bir interaktif hasta sunumunda
              birleştirir.
            </p>
          </div>

          <div className="lg:col-span-6">
            <OdontogramCanvas />
          </div>
        </div>

        {/* Ultimate Örnek Senaryoları */}
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {ultimateSamples.map((sample) => (
            <article
              key={sample.code}
              className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/90 p-8"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-blue-500/20 px-2.5 py-1 text-xs font-bold text-cyan-300">
                    {sample.code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-400">
                    <Box className="h-3.5 w-3.5" />
                    {sample.tag}
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-bold text-white">
                  {sample.title}
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                  {sample.summary}
                </p>

                <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
                  {sample.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-2.5 text-xs font-medium text-slate-200"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        {/* Alt Kayıt Ol Çağrısı */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-slate-900 to-blue-950 p-8 sm:flex-row">
          <div>
            <h3 className="text-xl font-bold text-white">
              Ultimate Paket Deneyimini Kliniğinize Taşıyın
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              Kayıt olarak 3D odontogram ve interaktif sunum modüllerini hemen
              kullanmaya başlayın.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <span>Kayıt Ol</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}

