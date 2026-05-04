# Status des routes API VIXUAL — Audit du 03/05/2026

> Inventaire post-nettoyage maximal. Sert de base pour les futurs audits
> "supprimer ou pas". Aucune route n'est supprimee dans ce document : c'est
> un point de reference factuel.

## Routes appelees directement par le frontend

Detection : recherche `fetch("/api/...")` dans le code client.
Ces routes sont **clairement utilisees**, ne pas toucher.

- /api/auth/login, /api/auth/logout, /api/auth/me, /api/auth/signup
- /api/admin/secure-action
- /api/admin/test-lab/scenarios, /api/admin/test-lab/scenarios/run
- /api/admin/test-lab/reset
- /api/admin/test-lab/realtime/start, /stop, /tick
- /api/platform/version
- /api/feature-flags
- /api/contributions/cycle
- /api/contributions/eligible-projects
- /api/projects/category-stats
- /api/projects/categories
- /api/projects/by-category
- /api/upload/video, /api/upload/text, /api/upload/podcast
- /api/withdrawal-request

## Routes appelees par des integrations externes

Webhooks et endpoints declenches par des services tiers.

- /api/integrations/stripe/webhooks (Stripe)
- /api/integrations/bunny/webhook (Bunny.net)
- /api/integrations/health (monitoring Vercel)

## Routes utilisees par scripts admin / non-frontend

Endpoints invoques manuellement ou par cron jobs.

- /api/admin/test-lab/* (deja liste plus haut, accessible aussi via curl)
- /api/security/withdrawal-request
- /api/security/step-up
- /api/cron/* (si configure dans vercel.json)

## Routes potentiellement a auditer

Ces routes existent mais ne semblent pas appelees par un flux UI evident.
**Action future** : pour chacune, verifier si elle est appelee depuis
(1) une integration externe, (2) un script admin, (3) une feature pas
encore branchee. Si rien des trois, candidate a suppression.

- /api/promo/email
- /api/checkout/free-support
- /api/checkout/priority-reintegration
- /api/referral
- /api/top100/rankings
- /api/top100/cycles/current
- /api/top100/queue
- /api/top100/select
- /api/top100/reentry/create-checkout
- /api/top100/reentry/confirm
- /api/visupoints/balance
- /api/visupoints/credit
- /api/visupoints/discovery-pass
- /api/creator/progress
- /api/discovery/score
- /api/user/identity
- /api/stripe/config/public
- /api/integrations/stripe/dashboard
- /api/integrations/bunny/signed-url
- /api/soutien-libre/creator/[slug]
- /api/ticket-gold

## Procedure de revue periodique

A chaque fin de phase (V1 -> V2, V2 -> V3, ou apres branchement Bunny) :

1. Relancer `grep -rn "fetch.*api/" app components` pour rafraichir la
   liste des routes appelees.
2. Comparer avec ce document.
3. Toute route presente ici depuis 2 phases sans usage detecte est
   officiellement candidate a suppression.
