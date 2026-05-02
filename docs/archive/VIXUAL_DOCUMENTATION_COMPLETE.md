# VIXUAL - Documentation Complete pour Clonage

**Version**: V1.0 - Mars 2026
**Plateforme**: Next.js 16 + Neon PostgreSQL + Stripe Connect
**Objectif**: Documentation exhaustive pour reproduction fidele de l'application

---

## TABLE DES MATIERES

1. [Presentation Generale](#1-presentation-generale)
2. [Architecture Technique](#2-architecture-technique)
3. [Structure des Fichiers](#3-structure-des-fichiers)
4. [Base de Donnees](#4-base-de-donnees)
5. [Systeme de Roles et Profils](#5-systeme-de-roles-et-profils)
6. [Mecaniques Financieres](#6-mecaniques-financieres)
7. [Systeme VIXUpoints](#7-systeme-vixupoints)
8. [Discovery Engine (Classements)](#8-discovery-engine)
9. [Trust Score](#9-trust-score)
10. [Gestion des Mineurs](#10-gestion-des-mineurs)
11. [Vixual Social](#11-vixual-social)
12. [Systeme Sonore](#12-systeme-sonore)
13. [Securite](#13-securite)
14. [Integrations Externes](#14-integrations-externes)
15. [Pages et Routes](#15-pages-et-routes)
16. [API Endpoints](#16-api-endpoints)
17. [Composants UI](#17-composants-ui)
18. [Textes Juridiques](#18-textes-juridiques)
19. [Configuration](#19-configuration)

---

## 1. PRESENTATION GENERALE

### 1.1 Concept
VIXUAL est une **plateforme d'investissement participatif** pour les projets audiovisuels, litteraires et podcasts. Elle permet aux createurs de financer leurs oeuvres et aux investisseurs de participer aux gains.

### 1.2 Categories de Contenu
- **Films/Videos/Documentaires** (audiovisuel)
- **Voix de l'Info** (articles)
- **Livres** (litteraire)
- **Podcasts** (audio)

### 1.3 Logo
Le logo VIXUAL utilise 6 couleurs pour les 6 lettres:
```
V - text-red-500 (#ef4444)
I - text-amber-400 (#fbbf24)
X - text-emerald-400 (#34d399)
U - text-teal-400 (#2dd4bf)
A - text-sky-400 (#38bdf8)
L - text-indigo-400 (#818cf8)
```

### 1.4 Slogan
"Investissez dans les talents de demain"

---

## 2. ARCHITECTURE TECHNIQUE

### 2.1 Stack Technologique
```
Frontend:     Next.js 16 (App Router)
Styling:      Tailwind CSS v4 + shadcn/ui
Database:     Neon (PostgreSQL serverless)
Payments:     Stripe + Stripe Connect
CDN Video:    Bunny.net (preparation)
Auth:         Custom (bcrypt + sessions) - Mock pour dev
Deployment:   Vercel
```

### 2.2 Variables d'Environnement Requises
```env
# Database
DATABASE_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Bunny CDN (preparation)
BUNNY_API_KEY=...
BUNNY_STORAGE_ZONE=vixual-media
BUNNY_STORAGE_HOSTNAME=storage.bunnycdn.com
BUNNY_CDN_HOSTNAME=vixual.b-cdn.net
BUNNY_SIGNING_KEY=...
```

---

## 3. STRUCTURE DES FICHIERS

### 3.1 Pages (31 pages)
```
app/
├── page.tsx                      # Homepage
├── login/page.tsx                # Connexion
├── signup/page.tsx               # Inscription
├── explore/page.tsx              # Catalogue projets
├── leaderboard/page.tsx          # TOP 10/100/500
├── how-it-works/page.tsx         # Comment ca marche
├── faq/page.tsx                  # FAQ
├── social/page.tsx               # Vixual Social
├── upload/
│   ├── page.tsx                  # Upload video
│   ├── podcast/page.tsx          # Upload podcast
│   └── text/page.tsx             # Upload texte
├── video/[id]/page.tsx           # Detail projet
├── dashboard/
│   ├── page.tsx                  # Dashboard principal
│   ├── wallet/page.tsx           # Portefeuille
│   ├── visupoints/page.tsx       # Gestion VIXUpoints
│   ├── investments/page.tsx      # Mes investissements
│   ├── projects/page.tsx         # Mes projets
│   ├── favorites/page.tsx        # Favoris
│   ├── history/page.tsx          # Historique
│   ├── profile/page.tsx          # Profil
│   ├── settings/page.tsx         # Parametres
│   └── promo/page.tsx            # Code promo
├── admin/page.tsx                # Administration
├── support/mailbox/page.tsx      # Support
├── download/formules/page.tsx    # Telechargement formules
├── minor/
│   ├── consent/page.tsx          # Consentement parental
│   └── verify/page.tsx           # Verification mineur
└── legal/
    ├── terms/page.tsx            # CGU
    ├── cgv/page.tsx              # CGV
    ├── privacy/page.tsx          # Politique confidentialite
    └── cookies/page.tsx          # Politique cookies
```

### 3.2 Composants (76 composants)
```
components/
├── visual-header.tsx             # Header principal
├── visual-slogan.tsx             # Slogan anime
├── visual-social-feed.tsx        # Feed social
├── footer.tsx                    # Pied de page
├── navigation.tsx                # Navigation
├── content-card.tsx              # Carte projet
├── invest-simulator.tsx          # Simulateur investissement
├── cookie-consent.tsx            # Bandeau cookies
├── trust-badge.tsx               # Badge confiance
├── report-button.tsx             # Bouton signalement
├── sound-provider.tsx            # Provider sons
├── sound-toggle.tsx              # Toggle sons
├── stripe-mode-banner.tsx        # Bandeau mode Stripe
├── community-charter.tsx         # Charte communautaire
├── language-selector.tsx         # Selecteur langue
├── theme-provider.tsx            # Provider theme
├── parental-consent-form.tsx     # Formulaire autorisation parentale
├── minors/
│   ├── minor-client-guard.tsx    # Guard client mineur
│   └── minor-status-badge.tsx    # Badge statut mineur
├── onboarding/
│   └── birthdate-step.tsx        # Etape date naissance
├── security/
│   ├── security-gate.tsx         # Gate securite
│   └── verification-badges.tsx   # Badges verification
└── ui/                           # ~50 composants shadcn/ui
```

### 3.3 Bibliotheques (lib/)
```
lib/
├── db.ts                         # Connection Neon
├── stripe.ts                     # Client Stripe
├── utils.ts                      # Utilitaires (cn, etc.)
├── api-errors.ts                 # Codes erreur API
├── auth-context.tsx              # Contexte auth (mock)
├── mock-data.ts                  # Donnees mock
├── legal-info.ts                 # Infos legales
├── terminology.ts                # Terminologie
├── admin-guard.ts                # Guard admin
├── rate-limit.ts                 # Rate limiting
├── request-user.ts               # Extraction user request
├── user-identity.ts              # Identite utilisateur
├── decode-unicode.ts             # Decodage unicode
├── webhook-queue.ts              # Queue webhooks
├── promo-engine.ts               # Moteur codes promo
├── visupoints-engine.ts          # Moteur VIXUpoints
├── visual-rules-engine.ts        # Regles metier
├── discovery/
│   ├── engine.ts                 # Discovery Engine
│   └── types.ts                  # Types discovery
├── trust/
│   ├── engine.ts                 # Trust Score Engine
│   ├── repository.ts             # Repository trust
│   ├── types.ts                  # Types trust
│   └── weights.ts                # Poids trust
├── payout/
│   ├── constants.ts              # Constantes payout
│   ├── payout-engine.ts          # Moteur payout
│   ├── strategies.ts             # Strategies payout
│   ├── batch.ts                  # Batch processing
│   ├── types.ts                  # Types payout
│   └── index.ts                  # Exports
├── minors/
│   ├── rules.ts                  # Regles mineurs
│   └── guards.ts                 # Guards mineurs
├── rules/
│   └── rule-of-100.ts            # Regle des 100
├── security/
│   ├── risk-gate.ts              # Risk Gate
│   ├── ip-reputation.ts          # Reputation IP
│   └── types.ts                  # Types securite
├── audit/
│   └── log-transaction.ts        # Logs audit
├── visual-social/
│   └── hybrid.ts                 # Provider social
├── sounds/
│   ├── index.tsx                 # Exports sons
│   ├── synthesizer.ts            # Synthetiseur Web Audio
│   ├── types.ts                  # Types sons
│   └── use-sounds.ts             # Hook useSounds
└── integrations/
    ├── config.ts                 # Config integrations
    ├── stripe/
    │   └── stripe-connect-service.ts
    └── bunny/
        └── bunny-cdn-service.ts
```

---

## 4. BASE DE DONNEES

### 4.1 Tables Principales

```sql
-- Utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  display_name VARCHAR(100),
  pseudonym VARCHAR(50) UNIQUE,
  role VARCHAR(50) DEFAULT 'visitor',
  birthdate DATE,
  is_minor BOOLEAN DEFAULT FALSE,
  minor_status VARCHAR(20),
  trust_score INTEGER DEFAULT 25,
  stripe_account_id VARCHAR(255),
  stripe_account_status VARCHAR(50),
  stripe_account_details JSONB,
  visupoints_balance INTEGER DEFAULT 0,
  wallet_balance_cents INTEGER DEFAULT 0,
  kyc_verified BOOLEAN DEFAULT FALSE,
  identity_verified BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contenus
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) NOT NULL, -- 'video', 'text', 'podcast'
  category VARCHAR(100),
  cover_url TEXT,
  media_url TEXT,
  duration_seconds INTEGER,
  is_free BOOLEAN DEFAULT FALSE,
  price_cents INTEGER DEFAULT 0,
  investment_goal_cents INTEGER DEFAULT 0,
  current_investment_cents INTEGER DEFAULT 0,
  investor_count INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  avg_completion_rate DECIMAL(5,4) DEFAULT 0,
  cycle_id UUID,
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investissements
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content_id UUID REFERENCES contents(id),
  amount_cents INTEGER NOT NULL,
  votes_earned INTEGER NOT NULL,
  visupoints_earned INTEGER DEFAULT 0,
  stripe_charge_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cycles de cloture
CREATE TABLE cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  total_pot_cents INTEGER DEFAULT 0,
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payouts
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  cycle_id UUID REFERENCES cycles(id),
  content_id UUID REFERENCES contents(id),
  amount_cents INTEGER NOT NULL,
  role VARCHAR(50),
  rank INTEGER,
  stripe_transfer_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions VIXUpoints
CREATE TABLE visupoints_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  reason TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts Vixual Social
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content_id UUID REFERENCES contents(id),
  text TEXT NOT NULL,
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verifications tuteur (mineurs)
CREATE TABLE minor_guardian_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minor_user_id UUID REFERENCES users(id),
  guardian_email VARCHAR(255),
  guardian_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  token VARCHAR(255),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trust events
CREATE TABLE trust_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook events (idempotency)
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video uploads (Bunny CDN)
CREATE TABLE video_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES contents(id),
  bunny_video_id VARCHAR(255),
  original_filename VARCHAR(255),
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  status VARCHAR(50) DEFAULT 'processing',
  cdn_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. SYSTEME DE ROLES ET PROFILS

### 5.1 Roles Utilisateur

| Role | Label FR | Description |
|------|----------|-------------|
| guest | Invite | Non inscrit |
| visitor | Visiteur | Inscrit, peut voter |
| porter | Porteur | Createur video |
| infoporter | Infoporteur | Auteur articles/livres |
| podcaster | Podcasteur | Createur podcast |
| investor | Investisseur | Investit en euros |
| investireader | Investi-lecteur | Investit dans livres |
| listener | Auditeur | Ecoute podcasts |

### 5.2 Cautions Obligatoires

```javascript
CAUTION = {
  creator: 10_00,    // 10 EUR (Porteur, Infoporteur, Podcasteur)
  investor: 20_00,   // 20 EUR (Investisseur, Investi-lecteur)
}
```

---

## 6. MECANIQUES FINANCIERES

### 6.1 Tranches d'Investissement (EUR)
```javascript
INVESTMENT_TIERS_EUR = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20]
```

### 6.2 Bareme Investissement → Votes
```javascript
2€ = 1 vote    |  6€ = 5 votes   |  12€ = 8 votes
3€ = 2 votes   |  8€ = 6 votes   |  15€ = 9 votes
4€ = 3 votes   |  10€ = 7 votes  |  20€ = 10 votes
5€ = 4 votes
```

### 6.3 Repartition Films/Videos (Cloture)
```
40% - Investisseurs TOP 10 (pro-rata votes)
30% - Porteurs TOP 10 (pro-rata score)
 7% - Investisseurs rangs 11-100
23% - VIXUAL (plateforme)
```

### 6.4 Repartition TOP 10 Investisseurs (BPS)
```
Rang 1: 1366 BPS (13.66%)
Rang 2:  683 BPS (6.83%)
Rang 3:  455 BPS (4.55%)
Rang 4:  341 BPS (3.41%)
Rang 5:  273 BPS (2.73%)
Rang 6:  228 BPS (2.28%)
Rang 7:  195 BPS (1.95%)
Rang 8:  171 BPS (1.71%)
Rang 9:  152 BPS (1.52%)
Rang 10: 137 BPS (1.37%)
```

### 6.5 Vente Articles/Livres
```
70% - Auteur
30% - VIXUAL
```

### 6.6 Podcasts (Mensuel)
```
40% - Podcasteurs TOP 10
30% - Auditeurs TOP 10 (investisseurs)
20% - VIXUAL
10% - Bonus (6% primes perf + 2% reserve tech + 2% reserve event)
```

---

## 7. SYSTEME VIXUPOINTS

### 7.1 Gain VIXUpoints par Investissement
```javascript
2€ = 10 pts   |  6€ = 30 pts   |  12€ = 60 pts
3€ = 15 pts   |  8€ = 40 pts   |  15€ = 80 pts
4€ = 20 pts   |  10€ = 50 pts  |  20€ = 110 pts
5€ = 25 pts
```

### 7.2 Conversion VIXUpoints → EUR
```javascript
Seuil minimum: 2500 VIXUpoints
Taux: 100 VIXUpoints = 1 EUR
Retrait minimum: 25 EUR
```

### 7.3 Plafonds par Profil

| Profil | Plafond | Type | Convertible |
|--------|---------|------|-------------|
| Visiteur majeur | 2500 pts | Total | Oui |
| Visiteur mineur | 10000 pts | Total | Non |
| Auditeur | 2500 pts | Total | Oui |
| Porteur | 1000 pts | Mensuel | Non |
| Infoporteur | 1000 pts | Mensuel | Non |
| Podcasteur | 1000 pts | Mensuel | Non |
| Investisseur | - | - | Non (remunere via gains) |

### 7.4 Paiement Hybride
```javascript
Part minimum cash: 30%
Part maximum VIXUpoints: 70%
Bonus utilisation VIXUpoints: 5%
Plafond bonus mensuel: 200 pts
```

---

## 8. DISCOVERY ENGINE

### 8.1 Score VIXUAL (0-1000)
```
40% - Investissement (progression vers objectif)
20% - Engagement (votes, likes, commentaires, partages)
15% - Longevite (constance du projet)
10% - Momentum (croissance recente)
10% - Communaute (nombre de soutiens distincts)
 5% - Createur (Trust Score et historique)
```

### 8.2 Waves de Diffusion
```
Wave 1: Phase decouverte (50 utilisateurs)
Wave 2: Diffusion elargie (200 utilisateurs)
Wave 3: Tendance montante (1000 utilisateurs)
Wave 4: Projet populaire (5000 utilisateurs)
```

### 8.3 Badges Projet
- NOUVEAU (< 7 jours)
- EN_HAUSSE (croissance rapide)
- PROMETTEUR (seuils atteints)
- PROJET_STAR (top popularite)
- EN_ANALYSE (verification manipulation)
- TOP_100 (dans le classement)

### 8.4 Anti-Manipulation
Flags detectes:
- SUDDEN_VOTE_SPIKE
- RECENT_ACCOUNTS_BULK
- COORDINATED_INVESTMENTS
- ABNORMAL_TRAFFIC

---

## 9. TRUST SCORE

### 9.1 Niveaux (0-100)
```
0-24:  newcomer (Debutant)
25-49: trusted (Fiable)
50-74: verified (Confirme)
75-89: premium (Expert)
90-100: elite (Elite)
```

### 9.2 Criteres (Score /5)
```
25% - Anciennete compte
25% - Signalements recus (inverse)
25% - Violations confirmees (inverse)
25% - Activite positive
```

### 9.3 Events Trust
```javascript
// Positifs
investment_made: +3
content_published: +2
positive_review: +1
kyc_completed: +10
gold_pass_purchased: +5

// Negatifs
report_received: -2
violation_confirmed: -10
content_removed: -5
suspicious_activity: -3
```

---

## 10. GESTION DES MINEURS

### 10.1 Regles
```
Age minimum inscription: 16 ans
Age majorite: 18 ans
```

### 10.2 Restrictions Mineurs (16-17 ans)
- VIXUpoints UNIQUEMENT (pas d'euros)
- Pas d'investissement en euros
- Pas de retrait
- Pas de Stripe Connect
- Plafond VIXUpoints quotidien: 10 pts
- Autorisation parentale obligatoire (valide 12 mois)

### 10.3 Deblocage Automatique
A 18 ans, le compte est automatiquement debloque avec tous les droits.

---

## 11. VIXUAL SOCIAL

### 11.1 Fonctionnalites
- Posts courts (280 caracteres max)
- Tags (max 5 par post)
- Likes et reponses
- Epinglage (createurs sur leurs projets)
- Moderation admin

### 11.2 Tags Officiels
```
#VIXUAL #Tendance #NouveauProjet #Film #Podcast
#Livre #Article #TOP10 #Prometteur #Investissement
```

---

## 12. SYSTEME SONORE

### 12.1 Jingles (Web Audio API)
```
spark:   Jingle principal (~2s) - ouverture app
pulse:   Mini notification (~0.6s) - notifications
win:     Gain utilisateur (~1.2s) - argent, VIXUpoints
boost:   Projet populaire (~1.4s) - tendances
click:   Clic UI (~0.1s) - boutons
success: Succes action (~0.8s) - validation
error:   Erreur (~0.4s) - echec
```

### 12.2 Notes Utilisees
```
G5, C6, E6, G6, C7 (gamme majeure)
```

---

## 13. SECURITE

### 13.1 Risk Gate
Verification multi-niveaux:
- Verification IP (reputation)
- Detection VPN/Proxy
- Limitation tentatives
- Step-up authentication (2FA)

### 13.2 Regles Metier
```
R1: Paiement mensuel unique (batch)
R2: Stripe Connect obligatoire pour percevoir
R3: Auto-investissement interdit
R5: Trust Score sur 5 etoiles
R6: Quotas stockage createurs
R7: Tokens temporaires medias (4h)
R9: Consentement promotion externe
R10: Declaration propriete intellectuelle
```

### 13.3 Tokens Media
```javascript
TTL = 4 heures
Format: Base64(contentId:userId:timestamp:random)
```

---

## 14. INTEGRATIONS EXTERNES

### 14.1 Stripe Connect
```javascript
Type compte: express
Devise: EUR
Retrait minimum: 25 EUR
Delai traitement: 7 jours
```

### 14.2 Bunny CDN (Preparation)
```javascript
Storage zone: vixual-media
CDN hostname: vixual.b-cdn.net
Signed URLs: Oui (TTL 4h)
```

### 14.3 Neon PostgreSQL
```javascript
Connection: Serverless (HTTP)
Pool: @neondatabase/serverless
SSL: Required
```

---

## 15. PAGES ET ROUTES

### 15.1 Pages Publiques
```
/                    - Homepage
/explore             - Catalogue projets
/leaderboard         - Classements TOP 10/100/500
/how-it-works        - Comment ca marche
/faq                 - Questions frequentes
/social              - Vixual Social
/video/[id]          - Detail projet
/login               - Connexion
/signup              - Inscription
/legal/terms         - CGU
/legal/cgv           - CGV
/legal/privacy       - Politique confidentialite
/legal/cookies       - Politique cookies
```

### 15.2 Pages Authentifiees
```
/dashboard           - Tableau de bord
/dashboard/wallet    - Portefeuille
/dashboard/visupoints - Gestion VIXUpoints
/dashboard/investments - Mes investissements
/dashboard/projects  - Mes projets
/dashboard/favorites - Favoris
/dashboard/history   - Historique
/dashboard/profile   - Profil
/dashboard/settings  - Parametres
/dashboard/promo     - Codes promo
/upload              - Upload video
/upload/podcast      - Upload podcast
/upload/text         - Upload texte
```

### 15.3 Pages Admin
```
/admin               - Administration
/support/mailbox     - Support
```

### 15.4 Pages Mineurs
```
/minor/consent       - Autorisation parentale
/minor/verify        - Verification mineur
```

---

## 16. API ENDPOINTS

### 16.1 Authentification
```
POST /api/consent/cookies    - Consentement cookies
POST /api/consent/submit     - Soumission consentement
```

### 16.2 Stripe
```
POST /api/stripe/invest      - Investissement
POST /api/stripe/caution     - Paiement caution
POST /api/stripe/connect     - Connexion Stripe
POST /api/stripe/withdraw    - Retrait
POST /api/stripe/webhook     - Webhook Stripe
```

### 16.3 Payout
```
POST /api/payout/execute           - Execution payout
POST /api/payout/batch/simulate    - Simulation batch
POST /api/payout/batch/execute     - Execution batch
GET  /api/payout/batch/status      - Statut batch
```

### 16.4 VIXUpoints
```
GET  /api/visupoints/balance  - Solde
POST /api/visupoints/credit   - Credit points
```

### 16.5 Discovery
```
POST /api/discovery/score     - Calcul score projet
```

### 16.6 Trust
```
GET  /api/trust               - Trust profile
```

### 16.7 Mineurs
```
POST /api/minors/guardian     - Verification tuteur
```

### 16.8 Securite
```
POST /api/security/step-up              - Step-up auth
POST /api/security/withdrawal-request   - Demande retrait
```

### 16.9 Admin
```
POST /api/admin/secure-action     - Action securisee
POST /api/admin/withdraw-review   - Review retrait
```

### 16.10 Integrations
```
GET  /api/integrations/health              - Sante integrations
POST /api/integrations/stripe/connect      - OAuth Stripe
GET  /api/integrations/stripe/dashboard    - Dashboard Stripe
POST /api/integrations/stripe/webhooks     - Webhooks Stripe Connect
POST /api/integrations/bunny/upload        - Upload Bunny
GET  /api/integrations/bunny/signed-url    - URL signee Bunny
```

### 16.11 Autres
```
GET  /api/cycles              - Liste cycles
GET  /api/wallet              - Donnees wallet
POST /api/promo/email         - Envoi email promo
POST /api/promo/share         - Partage promo
GET  /api/user/identity       - Identite utilisateur
```

---

## 17. COMPOSANTS UI

### 17.1 Composants Principaux
```tsx
<VisualHeader />        // Header avec logo + navigation
<Footer />              // Pied de page
<Navigation />          // Menu navigation
<ContentCard />         // Carte projet
<InvestSimulator />     // Simulateur investissement
<TrustBadge />          // Badge confiance
<VisualSocialFeed />    // Feed social
<CookieConsent />       // Bandeau cookies
<SoundToggle />         // Toggle sons
```

### 17.2 Composants shadcn/ui
Tous les composants shadcn/ui standard sont disponibles dans `/components/ui/`.

---

## 18. TEXTES JURIDIQUES

### 18.1 Informations Legales
```javascript
LEGAL_INFO = {
  formeJuridique: "SAS",
  denomination: "VIXUAL",
  capitalSocial: "________ EUR",
  siret: "________ ________ ________",
  rcs: "RCS ________",
  tva: "FR__ __________",
  adresseSiege: "________________________, France",
  telephone: "+__ _ __ __ __ __",
  emailContact: "contact@visual-platform.com",
  emailSupport: "support@visual-platform.com",
  emailDPO: "dpo@visual-platform.com",
  directeurPublication: "________ ________",
  hebergeur: "Vercel Inc. - 340 S Lemon Ave, Walnut, CA 91789, USA",
}
```

### 18.2 Pages Legales
- **CGU**: Conditions Generales d'Utilisation (13 articles)
- **CGV**: Conditions Generales de Vente
- **Privacy**: Politique de Confidentialite (RGPD)
- **Cookies**: Politique Cookies

---

## 19. CONFIGURATION

### 19.1 Couleurs Theme
```css
/* globals.css */
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--primary: 142.1 76.2% 36.3%;
--primary-foreground: 355.7 100% 97.3%;
--secondary: 217.2 32.6% 17.5%;
--accent: 217.2 32.6% 17.5%;
--destructive: 0 62.8% 30.6%;
--muted: 217.2 32.6% 17.5%;
--card: 222.2 84% 4.9%;
--border: 217.2 32.6% 17.5%;
--radius: 0.5rem;
```

### 19.2 Polices
```
--font-sans: 'Geist', sans-serif
--font-mono: 'Geist Mono', monospace
```

### 19.3 Metadata
```javascript
title: "VIXUAL - Investissez dans les talents de demain"
description: "Plateforme d'investissement participatif pour projets audiovisuels, litteraires et podcasts"
```

---

## ANNEXES

### A. Scripts de Migration
Tous les scripts de migration sont dans `/scripts/`:
- 001-create-schema.js
- 002-visual-social.js
- 003-security-patch.js
- 004-packpatch-v1.js
- 005-cycles-rule-of-100.js
- 006-stripe-webhook-logs.js
- 007-pseudonym-promo-withdraw-review.js
- 008-trust-minors-verified.js
- 009-audit-logs.js
- 010-discovery-engine.js
- 011-integrations-tables.js

### B. Commandes
```bash
# Installation
npm install

# Developpement
npm run dev

# Build
npm run build

# Deploiement
vercel deploy
```

---

**Document genere le**: Mars 2026
**Version**: 1.0
**Auteur**: Documentation automatique VIXUAL

---

FIN DU DOCUMENT
