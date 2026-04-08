# VIXUAL - Documentation Complete pour Clonage
## Version: 11 Mars 2026

---

# TABLE DES MATIERES

1. [Presentation Generale](#1-presentation-generale)
2. [Architecture Technique](#2-architecture-technique)
3. [Structure des Fichiers](#3-structure-des-fichiers)
4. [Base de Donnees](#4-base-de-donnees)
5. [Systeme de Roles et Profils](#5-systeme-de-roles-et-profils)
6. [Mecaniques Financieres](#6-mecaniques-financieres)
7. [VIXUpoints - Systeme de Fidelite](#7-vixupoints-systeme-de-fidelite)
8. [Discovery Engine et Classements](#8-discovery-engine-et-classements)
9. [Trust Score](#9-trust-score)
10. [Gestion des Mineurs](#10-gestion-des-mineurs)
11. [Vixual Social](#11-vixual-social)
12. [Systeme Sonore](#12-systeme-sonore)
13. [Securite et Regles Metier](#13-securite-et-regles-metier)
14. [Integrations](#14-integrations)
15. [API Endpoints](#15-api-endpoints)
16. [Textes Juridiques](#16-textes-juridiques)
17. [Configuration](#17-configuration)

---

# 1. PRESENTATION GENERALE

## Concept
VIXUAL est une plateforme d'investissement participatif pour les createurs de contenus audiovisuels, litteraires et podcasts. Les utilisateurs peuvent:
- Investir dans des projets creatifs
- Gagner des VIXUpoints (programme de fidelite)
- Partager les revenus generes par les projets a succes
- Interagir via Vixual Social (mini-reseau social integre)

## Slogan
"Investissez dans la culture. Partagez le succes."

## Categories de contenus
- **Video**: Films, documentaires, clips, series
- **Ecrit**: Livres, articles, nouvelles (Voix de l'Info)
- **Podcast**: Episodes, series audio, emissions

---

# 2. ARCHITECTURE TECHNIQUE

## Stack Principal
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Base de donnees**: Neon (PostgreSQL serverless)
- **Paiements**: Stripe Connect (mode Express)
- **CDN/Stockage**: Bunny.net (preparation)
- **Hebergement**: Vercel
- **Styling**: Tailwind CSS v4 + shadcn/ui

## Dependances Principales
```json
{
  "next": "^16.0.0",
  "react": "^19.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^4.0.0",
  "stripe": "^14.0.0",
  "@neondatabase/serverless": "^0.9.0",
  "lucide-react": "^0.300.0"
}
```

---

# 3. STRUCTURE DES FICHIERS

## Pages (31 pages)
```
app/
├── page.tsx                      # Accueil
├── login/page.tsx                # Connexion
├── signup/page.tsx               # Inscription
├── explore/page.tsx              # Explorer les projets
├── leaderboard/page.tsx          # Classements TOP 10/100/500
├── how-it-works/page.tsx         # Comment ca marche
├── faq/page.tsx                  # FAQ
├── social/page.tsx               # Vixual Social
├── upload/
│   ├── page.tsx                  # Upload video
│   ├── podcast/page.tsx          # Upload podcast
│   └── text/page.tsx             # Upload texte
├── video/[id]/page.tsx           # Detail projet
├── dashboard/
│   ├── page.tsx                  # Tableau de bord
│   ├── layout.tsx                # Layout dashboard
│   ├── wallet/page.tsx           # Portefeuille
│   ├── investments/page.tsx      # Mes investissements
│   ├── projects/page.tsx         # Mes projets
│   ├── visupoints/page.tsx       # Mes VIXUpoints
│   ├── history/page.tsx          # Historique
│   ├── favorites/page.tsx        # Favoris
│   ├── profile/page.tsx          # Profil
│   ├── settings/page.tsx         # Parametres
│   └── promo/page.tsx            # Promotion
├── admin/
│   ├── page.tsx                  # Administration
│   └── layout.tsx                # Layout admin
├── legal/
│   ├── terms/page.tsx            # CGU
│   ├── cgv/page.tsx              # CGV
│   ├── privacy/page.tsx          # Confidentialite
│   └── cookies/page.tsx          # Cookies
├── minor/
│   ├── consent/page.tsx          # Consentement parental
│   └── verify/page.tsx           # Verification mineur
├── support/mailbox/page.tsx      # Support
└── download/formules/page.tsx    # Telechargement formules
```

## Composants (17 composants principaux)
```
components/
├── visual-header.tsx             # Header principal avec logo VIXUAL
├── footer.tsx                    # Pied de page
├── navigation.tsx                # Navigation principale
├── content-card.tsx              # Carte de contenu
├── invest-simulator.tsx          # Simulateur d'investissement
├── visual-social-feed.tsx        # Feed Vixual Social
├── cookie-consent.tsx            # Bandeau cookies
├── parental-consent-form.tsx     # Formulaire consentement parental
├── trust-badge.tsx               # Badge Trust Score
├── sound-provider.tsx            # Provider sons
├── sound-toggle.tsx              # Toggle sons
├── visual-slogan.tsx             # Slogan anime
├── report-button.tsx             # Bouton signalement
├── community-charter.tsx         # Charte communautaire
├── stripe-mode-banner.tsx        # Banniere mode Stripe
├── theme-provider.tsx            # Provider theme
└── language-selector.tsx         # Selecteur langue
```

## Librairies (42 fichiers)
```
lib/
├── db.ts                         # Connexion Neon
├── stripe.ts                     # Client Stripe
├── api-errors.ts                 # Codes d'erreur
├── utils.ts                      # Utilitaires (cn, etc.)
├── mock-data.ts                  # Donnees mock
├── terminology.ts                # Terminologie standardisee
├── legal-info.ts                 # Informations legales
├── visual-rules-engine.ts        # Regles metier
├── visupoints-engine.ts          # Moteur VIXUpoints
├── promo-engine.ts               # Moteur promotion
├── admin-guard.ts                # Protection admin
├── rate-limit.ts                 # Rate limiting
├── request-user.ts               # Extraction user
├── user-identity.ts              # Identite utilisateur
├── webhook-queue.ts              # Queue webhooks
├── decode-unicode.ts             # Decodage unicode
├── payout/
│   ├── constants.ts              # Constantes payout
│   ├── types.ts                  # Types payout
│   ├── payout-engine.ts          # Moteur de paiement
│   ├── strategies.ts             # Strategies par categorie
│   ├── batch.ts                  # Batch mensuel
│   └── index.ts                  # Export
├── discovery/
│   ├── engine.ts                 # Discovery Engine
│   └── types.ts                  # Types discovery
├── trust/
│   ├── engine.ts                 # Trust Score engine
│   ├── types.ts                  # Types trust
│   ├── weights.ts                # Ponderations
│   └── repository.ts             # Repository trust
├── minors/
│   ├── rules.ts                  # Regles mineurs
│   └── guards.ts                 # Guards mineurs
├── security/
│   ├── risk-gate.ts              # Risk Gate
│   ├── ip-reputation.ts          # Reputation IP
│   └── types.ts                  # Types securite
├── rules/
│   └── rule-of-100.ts            # Regle des 100
├── sounds/
│   ├── types.ts                  # Types sons
│   ├── synthesizer.ts            # Synthetiseur Web Audio
│   └── use-sounds.ts             # Hook React
├── audit/
│   └── log-transaction.ts        # Audit trail
├── visual-social/
│   └── hybrid.ts                 # Provider Vixual Social
└── integrations/
    ├── config.ts                 # Config integrations
    ├── stripe/
    │   └── stripe-connect-service.ts
    └── bunny/
        └── bunny-cdn-service.ts
```

## API Routes (31 endpoints)
```
app/api/
├── stripe/
│   ├── invest/route.ts           # POST - Investir
│   ├── withdraw/route.ts         # POST - Retrait
│   ├── caution/route.ts          # POST - Caution
│   ├── connect/route.ts          # POST - Stripe Connect
│   └── webhook/route.ts          # POST - Webhook Stripe
├── visupoints/
│   ├── balance/route.ts          # GET - Solde
│   └── credit/route.ts           # POST - Crediter
├── payout/
│   ├── execute/route.ts          # POST - Executer payout
│   └── batch/
│       ├── execute/route.ts      # POST - Batch mensuel
│       ├── simulate/route.ts     # POST - Simulation
│       └── status/route.ts       # GET - Statut
├── security/
│   ├── step-up/route.ts          # POST - Step-up auth
│   └── withdrawal-request/route.ts
├── consent/
│   ├── cookies/route.ts          # POST - Cookies
│   └── submit/route.ts           # POST - Consentement
├── minors/
│   └── guardian/route.ts         # POST - Tuteur
├── admin/
│   ├── secure-action/route.ts    # POST - Action admin
│   └── withdraw-review/route.ts  # POST - Review retrait
├── promo/
│   ├── email/route.ts            # POST - Email promo
│   └── share/route.ts            # POST - Partage
├── trust/route.ts                # GET/POST - Trust Score
├── user/identity/route.ts        # GET - Identite
├── wallet/route.ts               # GET - Wallet
├── cycles/route.ts               # GET - Cycles
├── discovery/score/route.ts      # POST - Score discovery
└── integrations/
    ├── health/route.ts           # GET - Health check
    ├── stripe/
    │   ├── connect/route.ts      # OAuth Stripe
    │   ├── dashboard/route.ts    # Dashboard link
    │   └── webhooks/route.ts     # Webhooks Connect
    └── bunny/
        ├── upload/route.ts       # POST - Upload
        └── signed-url/route.ts   # GET - URL signee
```

---

# 4. BASE DE DONNEES

## Schema PostgreSQL (Neon)

### Table: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'visitor',
  display_name TEXT,
  pseudonym TEXT,
  avatar_url TEXT,
  birthdate DATE,
  is_minor BOOLEAN DEFAULT false,
  minor_status TEXT,
  trust_score INTEGER DEFAULT 25,
  visupoints_balance INTEGER DEFAULT 0,
  wallet_balance_cents INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_account_id TEXT,
  stripe_account_status TEXT,
  stripe_account_details JSONB,
  kyc_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  verified_method TEXT,
  gold_pass BOOLEAN DEFAULT false,
  gold_pass_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: contents
```sql
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL, -- 'video', 'text', 'podcast'
  category TEXT,
  thumbnail_url TEXT,
  media_url TEXT,
  duration_seconds INTEGER,
  investment_goal_cents INTEGER,
  current_investment_cents INTEGER DEFAULT 0,
  investor_count INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  avg_completion_rate DECIMAL(3,2) DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, pending, active, closed
  is_free BOOLEAN DEFAULT false,
  price_cents INTEGER,
  ip_declaration BOOLEAN DEFAULT false,
  ip_declaration_date TIMESTAMP,
  published_at TIMESTAMP,
  closed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: investments
```sql
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content_id UUID REFERENCES contents(id),
  amount_cents INTEGER NOT NULL,
  votes_earned INTEGER NOT NULL,
  visupoints_earned INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, confirmed, refunded
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  completed_at TIMESTAMP,
  refunded_at TIMESTAMP,
  refund_error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: payouts
```sql
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  cycle_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  bucket TEXT NOT NULL,
  role TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  stripe_transfer_id TEXT,
  stripe_transfer_error TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP
);
```

### Table: visupoints_transactions
```sql
CREATE TABLE visupoints_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount INTEGER NOT NULL,
  type TEXT NOT NULL, -- credit, debit, conversion
  source TEXT, -- investment, bonus, daily, etc.
  reference_id UUID,
  balance_after INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: social_posts
```sql
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  content_id UUID REFERENCES contents(id),
  parent_id UUID REFERENCES social_posts(id),
  post_type TEXT DEFAULT 'post', -- post, reply, repost
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: trust_events
```sql
CREATE TABLE trust_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: minor_guardian_verifications
```sql
CREATE TABLE minor_guardian_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minor_user_id UUID REFERENCES users(id),
  guardian_email TEXT NOT NULL,
  guardian_name TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  verification_code TEXT,
  document_url TEXT,
  document_type TEXT,
  approved_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: webhook_events
```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: video_uploads
```sql
CREATE TABLE video_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content_id UUID REFERENCES contents(id),
  bunny_video_id TEXT,
  bunny_library_id TEXT,
  original_filename TEXT,
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  status TEXT DEFAULT 'uploading',
  cdn_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: cycles
```sql
CREATE TABLE cycles (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL, -- YYYY-MM
  status TEXT DEFAULT 'open', -- open, closed, paid
  gross_cents INTEGER DEFAULT 0,
  total_paid_cents INTEGER DEFAULT 0,
  entries_count INTEGER DEFAULT 0,
  closed_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 5. SYSTEME DE ROLES ET PROFILS

## Roles Utilisateur
| Role | Label FR | Description |
|------|----------|-------------|
| guest | Invite | Non inscrit |
| visitor | Visiteur | Inscrit, explore |
| investor | Investisseur | Investit dans les projets |
| porter | Porteur | Createur video |
| infoporter | Infoporteur | Createur texte |
| podcaster | Podcasteur | Createur podcast |
| investireader | Investi-lecteur | Lecteur qui investit |
| listener | Auditeur | Auditeur podcast |

## Progression de Profil
```
Invite → Visiteur → [Investisseur | Porteur | Infoporteur | Podcasteur]
```

---

# 6. MECANIQUES FINANCIERES

## Tranches d'Investissement
| Montant | Votes | VIXUpoints |
|---------|-------|------------|
| 2 EUR | 1 | 10 |
| 3 EUR | 2 | 15 |
| 4 EUR | 3 | 20 |
| 5 EUR | 4 | 25 |
| 6 EUR | 5 | 30 |
| 8 EUR | 6 | 40 |
| 10 EUR | 7 | 50 |
| 12 EUR | 8 | 60 |
| 15 EUR | 9 | 80 |
| 20 EUR | 10 | 110 |

## Cautions
- Createur (Porteur/Infoporteur): 10 EUR
- Investisseur: 20 EUR

## Repartition des Gains - Films/Videos
| Bucket | Pourcentage |
|--------|-------------|
| Investisseurs TOP 10 | 40% |
| Porteurs TOP 10 | 30% |
| Investisseurs rangs 11-100 | 7% |
| VIXUAL (plateforme) | 23% |

### Detail TOP 10 Investisseurs (BPS sur 4000)
| Rang | BPS | % du bucket |
|------|-----|-------------|
| 1 | 1366 | 34.15% |
| 2 | 683 | 17.08% |
| 3 | 455 | 11.38% |
| 4 | 341 | 8.53% |
| 5 | 273 | 6.83% |
| 6 | 228 | 5.70% |
| 7 | 195 | 4.88% |
| 8 | 171 | 4.28% |
| 9 | 152 | 3.80% |
| 10 | 137 | 3.43% |

## Repartition - Podcasts
| Bucket | Pourcentage |
|--------|-------------|
| Podcasteurs TOP 10 | 40% |
| Auditeurs TOP 10 | 30% |
| VIXUAL | 20% |
| Bonus (primes perf.) | 10% |

## Repartition - Livres/Articles
- Vente unitaire: 70% auteur / 30% VIXUAL
- Pot mensuel: 60% auteurs TOP 10 / 40% investi-lecteurs

---

# 7. VIXUPOINTS - SYSTEME DE FIDELITE

## Conversion
- 100 VIXUpoints = 1 EUR
- Seuil minimum conversion: 2500 points (25 EUR)

## Plafonds par Profil
| Profil | Plafond | Type | Convertible |
|--------|---------|------|-------------|
| Visiteur majeur | 2500 pts | Total | Oui |
| Visiteur mineur | 10000 pts | Total | Non (jusqu'a 18 ans) |
| Auditeur | 2500 pts | Total | Oui |
| Investi-lecteur | 2500 pts | Total | Oui |
| Porteur | 1000 pts | Mensuel | Non |
| Infoporteur | 1000 pts | Mensuel | Non |
| Podcasteur | 1000 pts | Mensuel | Non |
| Investisseur | Illimite | - | Non (gains directs) |

## Plafond Journalier
- Maximum: 60 VIXUpoints/jour (tous profils)

## Engagement Redirect Engine
| Seuil | Niveau | Action |
|-------|--------|--------|
| 2000 pts | Info | Suggestion douce |
| 2300 pts | Warning | Avertissement |
| 2450 pts | Critical | Incitation forte |

## Paiement Hybride
- Minimum 30% en euros
- Maximum 70% en VIXUpoints
- Bonus: 5% des points depenses (max 200/mois)

---

# 8. DISCOVERY ENGINE ET CLASSEMENTS

## VIXUAL Score (0-1000)
| Critere | Poids |
|---------|-------|
| Investissement | 40% |
| Engagement | 20% |
| Completion | 15% |
| Croissance | 10% |
| Trust Score createur | 10% |
| Qualite IA | 5% |

## Niveaux Wave
| Wave | Audience | Label |
|------|----------|-------|
| 1 | 50 | Phase decouverte |
| 2 | 200 | Diffusion elargie |
| 3 | 1000 | Tendance montante |
| 4 | 5000 | Projet populaire |

## Badges Projet
- NOUVEAU: < 7 jours
- EN_HAUSSE: Croissance rapide
- PROMETTEUR: Franchit seuils
- PROJET_STAR: Top popularite
- EN_ANALYSE: Sous surveillance
- TOP_100: Dans le classement

## Classements
- TOP 10: Elite (badge ambre)
- TOP 100: Confirme (badge teal)
- TOP 500: Decouverte (badge gris)

---

# 9. TRUST SCORE

## Score sur 5 etoiles (0-5)
| Niveau | Score | Label |
|--------|-------|-------|
| Elite | 4.5+ | Utilisateur d'exception |
| Expert | 3.5-4.4 | Tres fiable |
| Confirme | 2.5-3.4 | Bon historique |
| Fiable | 1.5-2.4 | En progression |
| Debutant | 0-1.4 | Nouveau |

## Criteres (25% chacun)
1. **Anciennete**: 30j=1, 90j=2, 180j=3, 365j=4, 730j+=5
2. **Signalements**: 5 - (reports * 0.5), min 0
3. **Respect regles**: 5 - (violations * 2), min 0
4. **Activite**: Interactions + contenus + investissements

## Impact
- Boost visibilite: 1.0 a 1.5x selon score
- Eligibilite bonus: Score >= 3.5

---

# 10. GESTION DES MINEURS (16-17 ANS)

## Restrictions
- VIXUpoints uniquement (pas d'euros)
- Pas d'investissement
- Pas de retrait
- Pas de Stripe Connect
- Plafond VIXUpoints: 10/jour (mineur) ou 10000 total

## Autorisation Parentale
- Obligatoire
- Validite: 12 mois
- Renouvellement automatique demande

## Deblocage Majorite
- Automatique au 18eme anniversaire
- Acces complet debloque

---

# 11. VIXUAL SOCIAL

## Fonctionnalites
- Posts courts (280 caracteres)
- Reponses et threads
- Reposts
- Likes
- Tags (#tendance, #cinema, etc.)
- Liaison aux contenus

## Moderation
- Signalement par les utilisateurs
- Review par admin
- Tags geres par admin

---

# 12. SYSTEME SONORE

## Jingles (Web Audio API)
| Son | Duree | Usage |
|-----|-------|-------|
| spark | 2s | Ouverture, decouverte |
| pulse | 0.6s | Notifications |
| win | 1.2s | Gains, VIXUpoints |
| boost | 1.4s | Tendance, badges |
| click | 0.1s | Interactions UI |
| success | 0.8s | Confirmations |
| error | 0.4s | Erreurs |

## Implementation
- Synthetiseur Web Audio
- Persistance localStorage (on/off)
- Hook React: useSounds()

---

# 13. SECURITE ET REGLES METIER

## R1. Paiement Mensuel Unique
- Batch le 1er de chaque mois
- Idempotency keys Stripe

## R2. Stripe Connect Obligatoire
- Requis pour: porter, infoporter, podcaster, investor, investireader
- Verification charges_enabled et payouts_enabled

## R3. Auto-Investissement Interdit
- Sanction: annulation, recalcul votes, suspension

## R5. Trust Score
- Calcul automatique
- Impacte la visibilite

## R6. Quotas Createurs
- Videos: 10/an (depassement: 1 EUR/video)
- Podcasts: 20/an (depassement: 0.50 EUR/episode)

## R7. Protection Medias
- Tokens temporaires (4h TTL)
- Signature HMAC-SHA256

## R9. Promotion Externe
- Consentement explicite requis
- Plateformes: Twitter, Instagram, YouTube, TikTok

## R10. Declaration IP
- Obligatoire avant publication
- Texte standard certifie

## Risk Gate
- Detection patterns suspects
- Rate limiting
- Reputation IP

---

# 14. INTEGRATIONS

## Stripe Connect
- Mode: Express
- Devise: EUR
- Retrait minimum: 25 EUR
- Delai traitement: 7 jours

## Bunny.net (CDN)
- Stockage video
- URLs signees
- Protection contenu

## Neon
- PostgreSQL serverless
- Connexion via @neondatabase/serverless

---

# 15. API ENDPOINTS

## Authentification
Tous les endpoints securises utilisent un token JWT dans le header Authorization.

## Stripe
| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/stripe/invest | Creer un investissement |
| POST | /api/stripe/withdraw | Demander un retrait |
| POST | /api/stripe/caution | Payer la caution |
| POST | /api/stripe/connect | Connecter Stripe |
| POST | /api/stripe/webhook | Recevoir webhooks |

## VIXUpoints
| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/visupoints/balance | Obtenir le solde |
| POST | /api/visupoints/credit | Crediter des points |

## Payout
| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/payout/execute | Executer un payout |
| POST | /api/payout/batch/execute | Batch mensuel |
| POST | /api/payout/batch/simulate | Simulation |
| GET | /api/payout/batch/status | Statut batch |

---

# 16. TEXTES JURIDIQUES

## Informations Legales (a completer)
```typescript
export const LEGAL_INFO = {
  formeJuridique: "SAS",
  denomination: "VIXUAL",
  capitalSocial: "________ EUR",
  siret: "________ ________ ________",
  rcs: "RCS ________",
  tva: "FR__ __________",
  adresseSiege: "________________________, _____ ________ ______, France",
  telephone: "+__ _ __ __ __ __",
  emailContact: "contact@visual-platform.com",
  emailSupport: "support@visual-platform.com",
  emailDPO: "dpo@visual-platform.com",
  directeurPublication: "________ ________",
  hebergeur: "Vercel Inc. - 340 S Lemon Ave, Walnut, CA 91789, USA",
}
```

## Pages Legales
- /legal/terms: Conditions Generales d'Utilisation
- /legal/cgv: Conditions Generales de Vente
- /legal/privacy: Politique de Confidentialite
- /legal/cookies: Politique Cookies

---

# 17. CONFIGURATION

## Variables d'Environnement Requises
```
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
BUNNY_API_KEY=...
BUNNY_LIBRARY_ID=...
BUNNY_CDN_HOSTNAME=...
BUNNY_STORAGE_ZONE=...
BUNNY_STORAGE_PASSWORD=...
```

## Scripts Migration
```
scripts/
├── 001-create-schema.js          # Schema initial
├── 002-visual-social.js          # Tables Vixual Social
├── 003-security-patch.js         # Colonnes securite
├── 004-packpatch-v1.js           # Patch V1
├── 005-cycles-rule-of-100.js     # Cycles et regle 100
├── 006-stripe-webhook-logs.js    # Logs webhooks
├── 007-pseudonym-promo-withdraw-review.js
├── 008-trust-minors-verified.js  # Trust et mineurs
├── 009-audit-logs.js             # Audit trail
├── 010-discovery-engine.js       # Discovery Engine
└── 011-integrations-tables.js    # Integrations
```

---

# FIN DU DOCUMENT

Ce document contient toutes les informations necessaires pour cloner l'application VIXUAL.
Version: 11 Mars 2026
