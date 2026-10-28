import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Layers,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { Mark } from "@/ui/mark";

const classicSamples = [
  {
    code: "CLS-101",
    title: "Tam Çene İmplant & Zirkonyum Planı",
    patientProfile: "2 Fazlı Cerrahi + Protetik Restorasyon",
    summary:
      "Faz bazlı tedavi takvimi, kalem kalem işlem dökümü, klinik karşılama mektubu ve hekim imzalı özet görünümü.",
    features: [
      "Kurumsal kapak ve klinik iletişim sayfası",
      "1. Faz Cerrahi / 2. Faz Üst Yapı maliyet tablosu",
      "Mobil cihazlardan tek tıkla incelenebilir özet",
    ],
  },
  {
    code: "CLS-102",
    title: "Estetik Gülüş Tasarımı (Lamina & Kron)",
    patientProfile: "Tek Fazlı Protetik Planlama",
    summary:
      "Ön bölge estetik restorasyonlar için sadeleştirilmiş işlem listesi, randevu süresi bilgisi ve ödeme planı özeti.",
    features: [
      "Diş numarasına göre gruplanmış tedavi kalemleri",
      "Hekim biyografisi ve klinik güvence notları",
      "Çoklu para birimi (TRY / EUR / USD) desteği",
    ],
  },
] as const;

export default function ClassicShowcasePage() {
  return (
    <div className="min-h-dvh bg-slate-50 font-sans text-slate-900">
      {/* Üst Bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark className="h-9 w-9" />
            <span className="text-base font-bold tracking-tight text-slate-900">
              Treatment+ · Classic Paket
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/ornekler/ultimate"
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Ultimate Paket Örneklerine Geç →
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600"
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Paketlere Geri Dön</span>
        </Link>

        <div className="mt-6 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <FileText className="h-3.5 w-3.5" />
            Classic Paket Örnekleri
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Kurumsal ve Yapılandırılmış Tedavi Planı Sunumları
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Classic Paket; hastalarınıza düzenli, anlaşılır ve kurumsal kimliğinizi
            yansıtan faz bazlı tedavi planları sunmanız için tasarlanmıştır.
          </p>
        </div>

        {/* Örnek Kartları */}
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {classicSamples.map((sample) => (
            <article
              key={sample.code}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    {sample.code}
                  </span>
                  <span className="text-xs font-medium text-blue-600">
                    {sample.patientProfile}
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  {sample.title}
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  {sample.summary}
                </p>

                <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-5">
                  {sample.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-2.5 text-xs font-medium text-slate-700"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <Layers className="h-4 w-4 text-blue-600" />
                  <span>Classic Görünüm Önizlemesi</span>
                </div>
                <p className="mt-1">
                  Klinik hesabınızı oluşturduktan sonra kendi logonuz ve fiyat
                  kataloğunuzla bu şablonu anında kullanabilirsiniz.
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Alt CTA */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-8 sm:flex-row">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-blue-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Classic Paket ile Hemen Başlayın
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Klinik kaydınızı tamamlayarak dakikalar içinde ilk hasta
                planınızı oluşturun.
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            <span>Kayıt Ol</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}

