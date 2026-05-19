# VIXUAL — Guide de deploiement Render

Procedure pas a pas pour deployer VIXUAL en production sur Render.com.

---

## Prerequis

- [x] Compte GitHub avec le repo `vixual-platform` (prive recommande)
- [x] Compte Render.com cree
- [x] Base PostgreSQL Neon configuree (DATABASE_URL connue)
- [x] Compte Resend pour les emails (RESEND_API_KEY connue)
- [ ] Compte Stripe en mode test (cles a recuperer)
- [ ] Compte Bunny.net (zones a creer)

---

## Etape 1 — Creer le service Render

1. Render.com → **New +** → **Web Service**.
2. **Connect a repository** : autoriser Render a acceder a GitHub.
3. Selectionner le repo `vixual-platform`.
4. Render detecte le fichier `render.yaml` → cliquer **Apply**.

---

## Etape 2 — Configurer les variables d'environnement

Dans le dashboard Render → **Environment** → ajouter chacune des variables ci-dessous (valeurs depuis `.env.example`).

### Indispensables au lancement

```
DATABASE_URL=postgresql://...neon.tech/...
JWT_SECRET=<32+ caracteres aleatoires>
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@vixual.fr
PATRON_EMAIL=jocelyndru@gmail.com
MODERATION_CRON_KEY=<32+ caracteres aleatoires>
BRIEFING_CRON_KEY=<32+ caracteres aleatoires>
NEXT_PUBLIC_SITE_URL=https://vixual.app
```

### Stripe (a ajouter une fois le compte cree)

```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Bunny.net (a ajouter une fois les zones creees)

```
BUNNY_STORAGE_API_KEY=xxx
BUNNY_STORAGE_ZONE_NAME=vixual-storage
BUNNY_CDN_HOSTNAME=vixual-storage.b-cdn.net
BUNNY_VIDEO_LIBRARY_ID=xxx
BUNNY_STREAM_API_KEY=xxx
BUNNY_TOKEN_AUTH_KEY=xxx
BUNNY_WEBHOOK_SECRET=xxx
NEXT_PUBLIC_BUNNY_LIBRARY_ID=xxx
```

---

## Etape 3 — Premier deploiement

1. Cliquer **Create Web Service**.
2. Render lance automatiquement :
   - `npm install` (installation dependances)
   - `npm run build` (compilation Next.js)
   - `npm run start:prod` (migrations BD + lancement)
3. **Verifier les logs** : onglet **Logs** dans le dashboard.
4. Attendre `Listening on port 10000` (ou similaire).

---

## Etape 4 — Configurer les crons Render

Render ne lit pas `vercel.json`. Recreer les crons manuellement.

### Cron 1 — Moderation quotidienne

- Render → **New +** → **Cron Job**.
- Nom : `vixual-moderation-daily`.
- Schedule : `0 9 * * *` (9h UTC).
- Command : `curl -fsS "https://vixual.onrender.com/api/admin/moderation/cron/daily?key=$MODERATION_CRON_KEY"`.

### Cron 2 — Briefing PATRON

- Nom : `vixual-briefing-daily`.
- Schedule : `0 6 * * *` (6h UTC = 8h Paris ete / 7h Paris hiver).
- Command : `curl -fsS "https://vixual.onrender.com/api/admin/briefing/cron?key=$BRIEFING_CRON_KEY"`.

---

## Etape 5 — Domaine personnalise

1. Render → service `vixual` → **Settings** → **Custom Domain** → ajouter `vixual.app` (ou autre).
2. Render fournit un CNAME ou A record a configurer chez ton registrar.
3. Attendre la propagation DNS (5 min a 48h).
4. SSL Let's Encrypt s'active automatiquement.

---

## Etape 6 — Verifier le deploiement

Endpoints a tester apres deploiement :

- `https://vixual.app/` — Homepage V1 doit s'afficher.
- `https://vixual.app/api/integrations/health` — Doit renvoyer `{ ok: true }`.
- `https://vixual.app/admin/health` — Page sante (login PATRON requis).
- `https://vixual.app/admin/daily-briefing` — Tableau de bord briefing.

---

## En cas de probleme

### "Migrations failed"
- Verifier `DATABASE_URL` (URL Neon correcte).
- Verifier que la BD Neon est accessible depuis Render (firewall).
- Consulter les logs Render → onglet **Logs**.

### "Upload module returns 503"
- Verifier que `BUNNY_STORAGE_API_KEY` et `BUNNY_CDN_HOSTNAME` sont configurees.
- C'est normal tant que Bunny n'est pas branche.

### "Cron jobs not running"
- Verifier que les variables `MODERATION_CRON_KEY` et `BRIEFING_CRON_KEY` correspondent entre le cron et l'app.
- Tester l'endpoint manuellement avec curl.

---

## Plan tarifaire recommande

- **Demarrage / tests internes** : Starter ($7/mois) — 512 Mo RAM, 0.5 CPU.
- **Lancement public** : Standard ($25/mois) — 2 Go RAM, 1 CPU dedie.
- **Phase de croissance** : Pro ($85/mois) si >10k utilisateurs actifs.

Migration entre plans : zero downtime via le dashboard Render.
