# Mimari kilit — Faz 0

Kaynak: Tedavi Planı Platformu teknik mimari v2.0 (26 Ekim 2026).
Kardeş repo: `treatment-plus-be`.

- Next.js App Router BFF. Tarayıcı yalnızca bu origin’e konuşur.
- Cookie httpOnly, SameSite=Lax, Next’te kalır. Go API’ye cookie gitmez.
- Hexagonal: port interface, adapter dışarıda. Composition root `src/app` + `src/bootstrap`.
- SOLID: bir klasör = bir bounded context; fake ve HTTP adapter aynı sözleşme.
- Para: `Money.amount` integer minor unit. Float yok.
- `clinic_id` body/query’den alınmaz. Oturumdan gelir (Faz 1).
- Hasta rotası (`/p/*`) PHI: `Cache-Control: no-store`. Redis/CDN yok.
- Ağır iş (PDF, AI, e-posta) HTTP beklemez; backend worker + outbox.

```
src/
  app/            composition root (route)
  bootstrap/      wiring — yalnızca app import eder
  modules/        identity clinic catalog plan media output share ai
                  domain ← application ← adapters
  platform/       http, auth, config, logger
  shared/         id, money, errx
  ui/             sunum; iş kuralı yok
```

Bağımlılık tek yön. CI `pnpm arch` ile kırılırsa build düşer.

Sıra (bozulmaz): 0 kabuk → 1 kimlik → 2 marka → 3 katalog → 4 plan → 5–6 hasta web → 7 medya/PDF → 8 AI.
