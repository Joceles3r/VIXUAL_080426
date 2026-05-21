# VIXUAL

Plateforme de streaming participative : regarder, soutenir, participer.

## Installation

```bash
pnpm install
pnpm dev
```

## Environnement

Copier `.env.example` vers `.env.local` et remplir les valeurs.

## ADMIN/PATRON

```env
VIXUAL_ADMIN_EMAIL=jocelyndru@gmail.com
```

## Stripe

Variables test/live preparees mais tests a activer plus tard.

Convention officielle :
- `STRIPE_MODE=test`
- `STRIPE_TEST_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY`
- `STRIPE_TEST_WEBHOOK_SECRET`

## Bunny.net

Variables preparees mais integration a activer plus tard.

```env
BUNNY_ENABLED=false
```

## Modules cles

- Homepage V1 streaming
- Gestion Homepage (ADMIN)
- ADMIN/PATRON dashboard
- Employes + permissions
- Explorer
- Savoir et Culture
- VIXUpoints
- Mode Maintenance
- Centre des Logs (Audit)
- Sauvegardes JSON
- Messages Officiels
- Support Reports

## Scripts utiles

```bash
pnpm dev          # Serveur developpement
pnpm build        # Build production
pnpm migrate      # Executer les migrations Neon
pnpm type-check   # Verifier TypeScript
pnpm test         # Executer les tests
```

## Node.js

Version requise : `>=20.19.0 <23` (voir `.nvmrc` pour la version recommandee).

---

Built with [v0](https://v0.app) | [Continue working on v0](https://v0.app/chat/projects/prj_4tO0nv20Y9JQLxLn8txlULvQw8fQ)
