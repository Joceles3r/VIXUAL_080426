# Fichiers a verifier avant suppression

Liste des fichiers potentiellement obsoletes reperes lors du patch de stabilisation.
Ne PAS supprimer sans verification manuelle.

## Anciens prompts / formules

- Rechercher dans `lib/` les fichiers contenant "old", "legacy", "deprecated"
- Verifier les formules de calcul VIXUpoints si elles ont ete remplacees

## Anciennes pages test

- `app/test-*` — pages de test temporaires
- `app/debug-*` — pages de debug

## Doublons homepage potentiels

- `components/home/` — verifier qu'il n'y a pas de composants dupliques
- `lib/mock-data-*.ts` — plusieurs versions de mock data peuvent coexister

## Anciens mock-data

- `lib/mock-data.ts` vs `lib/mock-data-v1.ts` — verifier lequel est utilise
- `lib/mock-videos.ts` — peut etre obsolete si remplace par mock-data-v1

## Migrations SQL obsoletes

- `scripts/migrations/030b-support-tickets-table.sql` — renomme, verifier si necessaire

## A verifier lors de l'activation Bunny

- Les references a Firebase Storage si elles existent encore
- Les chemins `/public/uploads/` vs CDN Bunny

---

IMPORTANT : Cette liste est indicative. Chaque suppression doit etre validee
par une recherche `grep` pour verifier qu'aucun import n'existe.
