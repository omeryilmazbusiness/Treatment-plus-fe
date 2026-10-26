import { Badge } from "@/ui/badge";

const lanes = [
  ["Kimlik + RLS", "1", "Davet, oturum, clinic_id cookie’den."],
  ["Marka", "2", "Klinik ayarları, renk, logo."],
  ["Katalog", "3", "Tanı, tedavi, fiyat listesi."],
  ["Plan motoru", "4", "Hasta, seans, satır, toplam."],
  ["Hasta web", "5–6", "Public token, olaylar. PHI cache yok."],
  ["Medya / PDF / AI", "7–8", "Worker + outbox. HTTP beklemez."],
] as const;

export default function ClinicHomePage() {
  return (
    <main className="px-6 py-10">
      <Badge>Faz 0</Badge>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">Klinik kabuğu</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft">
        İş ekranları faz sırasıyla dolar. clinic_id body veya query’den
        alınmaz. Sunucu bileşenleri varsayılan; istemci yalnızca etkileşim
        yaprağında açılır.
      </p>
      <ol className="mt-10 grid gap-3 md:grid-cols-2">
        {lanes.map(([title, phase, copy]) => (
          <li
            key={title}
            className="rounded-2xl border border-line bg-paper-2 px-5 py-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">{title}</h2>
              <Badge>Faz {phase}</Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{copy}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
