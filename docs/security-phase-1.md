# VIXUAL — Sécurité Phase 1

## Modules actifs

| Module | Activation | Statut par défaut |
|--------|------------|-------------------|
| Rate limiting Upstash | `KV_REST_API_URL` + `KV_REST_API_TOKEN` | Actif si env définies |
| En-têtes sécurité HTTP | Toujours | Actif |
| Détecteur bots user-agent | Toujours (regex inline middleware) | Actif |
| Détecteur emails jetables | Toujours (signup) | Actif |
| Cloudflare Turnstile | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | Désactivé par défaut |
| Webhook notifications | `SECURITY_WEBHOOK_URL` ou Telegram tokens | Désactivé par défaut |
| Audit sécurité immuable | Toujours | Actif (table dédiée) |
| Blacklist IP | Toujours | Actif (table dédiée) |

## Activation Cloudflare Turnstile (5 min)

1. dash.cloudflare.com → Turnstile → Add Site
2. Choisir "Invisible" mode + "Managed challenge"
3. Copier `Site Key` (publique) et `Secret Key` (privée)
4. Variables Render/Vercel : `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
5. Redéployer
6. Le widget `<TurnstileWidget />` s'affichera automatiquement sur les formulaires sensibles

## Activation Notifications Discord (3 min)

1. Discord → Serveur → Paramètres → Intégrations → Webhooks → Nouveau
2. Copier l'URL du webhook
3. Render : `SECURITY_WEBHOOK_URL=https://discord.com/api/webhooks/...`
4. Render : `SECURITY_WEBHOOK_KIND=discord`
5. Redéployer
6. Tester : créer une alerte critique manuellement → notification Discord instantanée

## Activation Notifications Telegram (5 min)

1. Discuter avec @BotFather sur Telegram → `/newbot` → noter le `BOT_TOKEN`
2. Démarrer une conversation avec ton bot, envoyer "/start"
3. Aller sur `https://api.telegram.org/bot<TOKEN>/getUpdates` → noter `chat.id`
4. Render : `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `SECURITY_WEBHOOK_KIND=telegram`

## Tables d'audit

- `security_audit_log` : toutes les actions sensibles
- `security_ip_blacklist` : IPs bannies (manuel + auto)
- `security_forbidden_attempts` : tentatives d'accès interdit

## Outils externes à activer (gratuits)

- [ ] **Dependabot** : Settings GitHub → Security & Analysis → Activer
- [ ] **Secret Scanning** : idem, dans la même page
- [ ] **OWASP ZAP** : scan automatique avant chaque grosse release
- [ ] **Cloudflare** (devant le domaine) : DNS → CDN → DDoS protection gratuite
