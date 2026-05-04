# Documentation VIXUAL

Les anciens documents complets sont archives dans `/docs/archive`.
Ne pas les utiliser comme source de verite produit : ils contiennent
encore d'anciens termes (VISUAL, Gold Pass, investor, ...) qui ne
correspondent plus au vocabulaire actif de la plateforme.

## Sources de verite (a jour)

- `lib/roles.ts` — definitions officielles des 8 profils
- `lib/platform/version.ts` — gestion des versions V1/V2/V3
- `lib/platform/visibility.ts` — helpers de gating de fonctionnalites
- `lib/platform/public-mode.ts` — mode public light vs full
- `lib/feature-flags.ts` — feature flags transverses
- `lib/selection/top100-selection-engine.ts` — moteur de classement
- `lib/test-lab/*` — Labo de tests (PATRON uniquement)
- `lib/content/content-mappers.ts` — pont DB legacy <-> UI moderne

## Variables d'environnement cles

- `VIXUAL_PLATFORM_DEFAULT_VERSION` = `V1` | `V2` | `V3` (defaut: `V1`)
- `NEXT_PUBLIC_VIXUAL_PUBLIC_MODE` = `light` | `full`
- `VIXUAL_TEST_LAB_ENABLED` = `true` | autre (defaut: desactive)
- `NEXT_PUBLIC_VIXUAL_TEST_LAB_VISIBLE` = `true` | autre (defaut: invisible)

## Regle d'or

> Un correctif = une zone claire = un impact maitrise.

Ne pas appliquer de patch global qui touche tout. Ne pas renommer
massivement (`VisualHeader` reste un alias progressif). Ne pas exposer
publiquement les fonctionnalites V3 quand la plateforme tourne en V1/V2.
