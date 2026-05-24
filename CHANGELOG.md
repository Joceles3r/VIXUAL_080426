# Changelog VIXUAL

Toutes les modifications notables apportees a VIXUAL sont documentees ici.
Format inspire de [Keep a Changelog](https://keepachangelog.com).

## [0.1.0] — 2026-05-26

### Ajoute
- `lib/env.ts` : validation stricte (DATABASE_URL, JWT_SECRET >= 32 chars, format email/URL/Stripe)
- `lib/env.ts` : helpers exportes `isValidEmail`, `isValidUrl`, `isValidJwtSecret`, `requireEnv`, `isProduction`, `isDevelopment`, `isStripeTestMode`
- `lib/index.ts` : barrel export centralise pour les modules les plus utilises
- `next.config.mjs` : cache headers immuables sur `_next/static`, `images/`, `fonts/` (perf LCP/TTFB)
- `next.config.mjs` : `deviceSizes` et `imageSizes` optimises pour next/image
- `docs/NAMING_CONVENTIONS.md` : conventions de nommage du projet
- `CHANGELOG.md` : fichier de suivi des versions

### Conserve (decisions explicites)
- `middleware.ts` conserve dans sa forme actuelle (Upstash Redis + classification routes + bot detection : superieur a la version proposee dans le patch)
- `eslint.ignoreDuringBuilds: true` conserve (phase de stabilisation, evite de bloquer les deploiements)
- `tsconfig.json` non durci (`noUnusedLocals` / `exactOptionalPropertyTypes` : casseraient la build sur les modules existants)
- `package.json` sans `sideEffects: false` (risque de tree-shaker des imports CSS critiques)

### Notes
- Validation env : `validateEnv()` reste compatible (`{ ok, missing }`) ; en production, throw si validation echoue (fail-fast).
- Le barrel `lib/index.ts` n'importe que des modules sans side-effects au top-level.
