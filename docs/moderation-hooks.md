# Hooks du moteur de modération VIXUAL

Ce document liste tous les endroits du code où le moteur de modération est appelé,
pour faciliter la maintenance et l'extension future.

## Hooks branchés

### Authentification
- **`app/api/auth/signup/route.ts`** : `detectRapidAccountCreation(ip)` après création utilisateur
- **`app/api/auth/signup/route.ts`** : `processModerationEvent({ kind: "user_active" })` pour init `last_active_at`

### Paiements (Stripe)
- **`app/api/integrations/stripe/webhooks/route.ts`** :
  - Sur `checkout.session.completed` / `payment_intent.succeeded` : `processModerationEvent({ kind: "contribution_success" })` + `evaluatePromotion()` + `detectSelfSupport()`
  - Sur `charge.refunded` : `processModerationEvent({ kind: "chargeback" })` (= -15 Trust Score)

### Boost visibilité
- **`app/api/visibility-boost/route.ts`** :
  - `processModerationEvent({ kind: "boost_given" })` côté visiteur
  - `processModerationEvent({ kind: "boost_received" })` côté créateur
  - `evaluatePromotion(visitorId)` (le visiteur peut atteindre L2 par cette voie)

### Commentaires
- **`app/api/comments/route.ts`** : `detectVelocityAnomaly(userId, "comment_posted")` après chaque commentaire

## Hooks à brancher dans les évolutions futures

- Email vérifié → `processModerationEvent({ kind: "email_verified" })`
- Quiz validé → `processModerationEvent({ kind: "quiz_passed" })`
- Publication terminée → `processModerationEvent({ kind: "publication_success" })`
- Signalement validé par PATRON → `applyTrustScoreDelta(userId, "report_validated", "manual_admin")`

## Cron quotidien
- **`/api/admin/moderation/cron/daily`** : appelle `evaluatePlatformProgression()` pour suggérer les bascules V1→V2 et V2→V3
- Configuré dans `vercel.json` : tous les jours à 9h UTC

## Niveaux d'alerte
- **critical** : email immédiat au PATRON + dashboard
- **important** : dashboard prioritaire (promotions L2→L3, signalements convergents)
- **standard** : dashboard normal (promotions L1→L2 a posteriori)
- **info** : rapport hebdomadaire
