# treatment-plus-fe

Tedavi Planı Platformu BFF. Next.js 16 App Router, hexagonal (ports & adapters), SOLID.

Faz 0 kabuğu: health yeşil, backend `readyz` bağlanır, iş ekranı yok. Kimlik Faz 1’de gelir.

## Çalıştırma

```bash
cp .env.example .env.local
pnpm dev
```

- BFF: `http://localhost:3000`
- Proses: `http://localhost:3000/healthz`
- Hazır: `http://localhost:3000/readyz` (Go API + Postgres + Redis)
- Klinik kabuğu: `http://localhost:3000/app`
- Hasta kabuğu: `http://localhost:3000/p/demo`

Backend `treatment-plus-be` `http://localhost:8080` üzerinde olmalı. Tarayıcı o porta gitmez.

```bash
pnpm test        # arch + typecheck + lint
pnpm arch        # import kuralı
pnpm typecheck
pnpm lint
```

## Mimari

Bağımlılık tek yön: `domain ← application ← adapters`. Adapter başka adapter import etmez.

Cookie Next origin’de kalır. Sunucu `Authorization` ile Go’ya gider.

Sekiz bounded context backend ile aynıdır. Domain paketi `fetch`, `next/headers` veya cookie görmez.

Ayrıntı: [docs/architecture.md](docs/architecture.md).

## Env

Zorunlu: `API_URL`.

Sonra: `SESSION_COOKIE`, `SESSION_SECURE`. Sırlar client bundle’a girmez; `server-only` client.

## Sıra (bozulmaz)

0 kabuk → 1 kimlik + cookie → 2 marka → 3 katalog → 4 plan → 5–6 hasta web + link → 7 medya/PDF → 8 AI

Yasak başlangıç: AI, PDF, Stripe.
