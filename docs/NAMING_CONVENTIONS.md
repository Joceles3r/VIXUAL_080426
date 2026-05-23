# Conventions de nommage VIXUAL

## Fichiers & Dossiers

### Structure des dossiers `lib/`

```
lib/
├── {domain}-config.ts      Configuration (homepage-config.ts, stripe-config.ts)
├── {domain}.ts             Logique metier (stripe.ts, db.ts, maintenance.ts)
├── {domain}-engine.ts      Moteurs de calcul/processing
├── {domain}-helper.ts      Helpers utilitaires
├── {domain}-types.ts       Types specifiques d'un module
├── {domain}-mock.ts        Donnees de test (Phase DEV uniquement)
└── index.ts                Barrel export central
```

### Composants React

```
components/
├── {category}-{component}.tsx     Ex: dashboard-orbit.tsx
└── ui/                            Composants UI primitifs (shadcn)
```

Les fichiers utilisent le **kebab-case**, jamais le PascalCase.

## Variables & Fonctions

### Constantes

- **UPPER_SNAKE_CASE** pour les constantes globales : `ADMIN_PATRON_EMAIL`, `MAX_REQUESTS_PER_WINDOW`
- **camelCase** pour les variables locales : `isDatabaseConfigured`, `currentUser`

### Fonctions

- **camelCase** : `getStripeConfig()`, `validateEncryptionKey()`
- **Verbes** pour les actions : `createUser()`, `updateConfig()`, `deleteRecord()`
- **Prefixes booleens** : `is`, `has`, `can`, `should` — `isAdminPatron()`, `hasPermission()`, `canUpload()`

### Types & Interfaces

- **PascalCase** : `StripeRuntimeConfig`, `FeatureFlag`, `HomepageConfigV1`
- Suffixe `Config` pour les configs, `Type` pour les types unions, `Props` pour les props React
- Eviter le prefixe `I` (anti-pattern TypeScript moderne)

## Commentaires

### JSDoc pour fonctions exportees

```typescript
/**
 * Description courte (une ligne).
 *
 * @param email Email a valider
 * @returns true si format valide, false sinon
 * @throws Error si email est null/undefined dans certains cas
 */
export function isValidEmail(email: string): boolean { ... }
```

### TODOs avec contexte

```typescript
// TODO(v080526): Refactoriser apres migration complete des mocks
// TODO(STRIPE): Implementer le mode live apres tests
// FIXME(BUNNY): Fallback local non teste en production
```

## API Routes

- **kebab-case** dans les URLs : `/api/admin/upload-homepage-media`
- **REST conventionnel** : GET (read), POST (create), PUT (update full), PATCH (update partial), DELETE
- Toujours retourner JSON avec un objet, jamais un array racine : `{ items: [...] }` plutot que `[...]`

## Migrations SQL

- Numerotation continue : `001-*.sql`, `002-*.sql`, ... `049-archives-table.sql`
- Description courte en kebab-case : `046-support-reports-table.sql`
- Toujours `IF NOT EXISTS` / `IF EXISTS` pour idempotence
