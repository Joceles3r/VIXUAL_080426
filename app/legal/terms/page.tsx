"use client"

import Link from "next/link"
import { VisualHeader } from "@/components/visual-header"
import { Footer } from "@/components/footer"
import { VisualSlogan } from "@/components/visual-slogan"
import {
  FileText, ArrowLeft, User, CreditCard, Film, BookOpen, Mic,
  Shield, ShieldCheck, AlertTriangle, Scale, Globe, Clock, Eye, Lock,
  Ban, HelpCircle, Trash2, Award, BarChart3, Vote,
  Gavel, Handshake, BadgeCheck, Info, TrendingUp, Wallet,
  Star, Users, CheckCircle, XCircle, RefreshCw, MessageSquare,
  Heart, AlertCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { LEGAL_INFO } from "@/lib/legal-info"

function Section({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 text-sm font-bold border border-teal-500/20">
          {num}
        </span>
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-base font-semibold text-white/90 mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-black">
      <VisualHeader />

      <main className="pt-28 pb-20">
        {/* Hero */}
        <section className="py-12 md:py-16 cinema-section">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/15 border border-teal-500/20 mb-6">
              <FileText className="h-8 w-8 text-teal-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              {"Conditions d'Utilisation"}
            </h1>
            <div className="mb-6">
              <VisualSlogan size="sm" opacity="high" withLines />
            </div>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              {"Les présentes Conditions Générales d'Utilisation régissent l'accès et l'utilisation de la plateforme VIXUAL, combinant diffusion de contenus audiovisuels, littéraires et podcasts avec un système d'investissement participatif."}
            </p>
            <p className="text-sm text-white/35 mt-4">
              {"Derni\u00e8re mise \u00e0 jour : quatre mars 2026 \u2014 Consolidation compl\u00e8te"}
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-4xl space-y-10">

          {/* Préambule */}
          <Card className="bg-teal-500/5 border-teal-500/15">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-teal-400 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-white/70 leading-relaxed">
                    {"VIXUAL est une plateforme num\u00e9rique internationale de diffusion et de participation \u00e9conomique \u00e0 des contenus audiovisuels et litt\u00e9raires, permettant :"}
                  </p>
                  <ul className="space-y-1.5 ml-2">
                    <li className="flex gap-2 items-start text-sm">
                      <Film className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                      <span className="text-white/60">{"La diffusion et le visionnage de contenus audiovisuels (courts et longs métrages, documentaires, clips, animations)"}</span>
                    </li>
                    <li className="flex gap-2 items-start text-sm">
                      <BookOpen className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
                      <span className="text-white/60">{"La publication et la lecture de contenus littéraires (romans, nouvelles, essais, poésies, articles)"}</span>
                    </li>
                    <li className="flex gap-2 items-start text-sm">
                      <Mic className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                      <span className="text-white/60">{"L'hébergement et l'écoute de podcasts (émissions, documentaires sonores, interviews)"}</span>
                    </li>
                    <li className="flex gap-2 items-start text-sm">
                      <TrendingUp className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-white/60">{"L'investissement participatif dans ces contenus, avec un système de répartition des gains"}</span>
                    </li>
                  </ul>
                  <p className="text-white/50 text-sm mt-3">
                    {"Toute inscription sur VIXUAL implique l'acceptation pleine et enti\u00e8re des pr\u00e9sentes CGU. Si vous n'acceptez pas ces conditions, vous ne pouvez pas cr\u00e9er de compte."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations provisoires */}
          <Card className="bg-amber-500/5 border-amber-500/15">
            <CardContent className="p-5">
              <h3 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {"Informations l\u00e9gales \u00e0 compl\u00e9ter"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                {[
                  `Forme juridique : ${LEGAL_INFO.formeJuridique}`,
                  `Denomination : ${LEGAL_INFO.denomination}`,
                  `Siege social : ${LEGAL_INFO.adresseSiege}`,
                  `SIRET : ${LEGAL_INFO.siret}`,
                  `RCS : ${LEGAL_INFO.rcs}`,
                  `TVA : ${LEGAL_INFO.tva}`,
                  `Capital social : ${LEGAL_INFO.capitalSocial}`,
                  `Directeur de la publication : ${LEGAL_INFO.directeurPublication}`,
                  `Telephone : ${LEGAL_INFO.telephone}`,
                  `Email : ${LEGAL_INFO.emailContact}`,
                  `Support : ${LEGAL_INFO.emailSupport}`,
                  `DPO : ${LEGAL_INFO.emailDPO}`,
                  `Hebergeur : ${LEGAL_INFO.hebergeur}`,
                ].map((item, i) => (
                  <p key={i} className="text-white/45 py-0.5">{item}</p>
                ))}
              </div>
              <p className="text-amber-400/60 text-xs mt-4">
                {"Ces informations seront compl\u00e9t\u00e9es lors de l'immatriculation officielle de VIXUAL. Le droit applicable sera celui du pays d'\u00e9tablissement d\u00e9finitif."}
              </p>
            </CardContent>
          </Card>

          {/* 1. Définitions */}
          <Section num={1} title="Définitions">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6">
                <p className="text-white/70 leading-relaxed mb-4">
                  {"Les termes suivants, employés dans les présentes CGU, ont la signification ci-dessous :"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { term: "Plateforme", def: "Le site web et l'application VIXUAL, accessibles à l'adresse visual-platform.com" },
                    { term: "Utilisateur / Inscrit", def: "Toute personne physique disposant d'un compte actif sur VIXUAL" },
                    { term: "Invité", def: "Personne naviguant sans compte, accès limité aux contenus gratuits et extraits" },
                    { term: "Visiteur", def: "Inscrit de base : accès aux contenus gratuits, VIXUpoints, favoris, commentaires" },
                    { term: "Porteur", def: "Créateur audiovisuel : dépose des vidéos et visuels sur la plateforme" },
                    { term: "Infoporteur", def: "Créateur littéraire : publie des écrits (articles, romans, essais, etc.)" },
                    { term: "Podcasteur", def: "Créateur podcast : dépose des podcasts, émissions audio, documentaires sonores" },
                    { term: "Contributeur", def: "Inscrit qui investit de deux \u00e0 vingt euros par projet audiovisuel" },
                    { term: "Contribu-lecteur", def: "Inscrit qui investit de deux \u00e0 vingt euros par contenu litt\u00e9raire" },
                    { term: "Auditeur", def: "Inscrit qui investit de deux \u00e0 vingt euros par podcast" },
                    { term: "VIXUpoints", def: "Avantage promotionnel interne (cent points \u00e9quivalent un euro). Plafond et convertibilit\u00e9 variables selon le profil. Ne constitue pas une monnaie \u00e9lectronique." },
                    { term: "Caution", def: "D\u00e9p\u00f4t unique remboursable (dix euros cr\u00e9ateurs, vingt euros investisseurs) garantissant l'engagement" },
                    { term: "Clôture", def: "Moment où les gains d'un contenu sont calculés et distribués selon les formules VIXUAL" },
                    { term: "Contenu", def: "Toute œuvre déposée : vidéo, écrit, podcast, incluant métadonnées et descriptions" },
                  ].map((d) => (
                    <div key={d.term} className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <span className="text-teal-400 font-medium text-sm">{d.term}</span>
                      <p className="text-white/50 text-xs mt-1">{d.def}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* 2. Inscription et rôles */}
          <Section num={2} title="Inscription, rôles et obligations">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <SubSection title="Conditions d'inscription">
                  <div className="space-y-2">
                    {[
                      "Être âgé(e) d'au moins 18 ans ou disposer de l'autorisation d'un représentant légal",
                      "Fournir des informations exactes, complètes et à jour lors de l'inscription",
                      "Disposer d'une adresse e-mail valide et personnelle",
                      "Accepter les présentes CGU ainsi que la Politique de Confidentialité",
                      "Ne détenir qu'un seul compte par personne physique (tout multi-compte est interdit)",
                    ].map((item) => (
                      <div key={item} className="flex gap-2 items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-white/60">{item}</span>
                      </div>
                    ))}
                  </div>
                </SubSection>

                <SubSection title="Les 7 rôles inscrits dans VIXUAL">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {[
                      { icon: Eye, color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/20", role: "Visiteur", caution: "Aucune", desc: "Accède aux contenus gratuits, accumule des VIXUpoints, interagit avec la communauté" },
                      { icon: Film, color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/20", role: "Porteur", caution: "Dix euros", desc: "D\u00e9pose des contenus audiovisuels, re\u00e7oit des investissements et des gains" },
                      { icon: BookOpen, color: "text-sky-400", bg: "bg-sky-500/15", border: "border-sky-500/20", role: "Infoporteur", caution: "Dix euros", desc: "Publie des contenus litt\u00e9raires, re\u00e7oit des investissements et des gains" },
                      { icon: Mic, color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/20", role: "Podcasteur", caution: "Dix euros", desc: "D\u00e9pose des podcasts et \u00e9missions audio, re\u00e7oit des investissements et des gains" },
                      { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/20", role: "Contributeur", caution: "Vingt euros", desc: "Contribue de deux \u00e0 vingt euros par projet audiovisuel, partage les gains \u00e0 la cl\u00f4ture" },
                      { icon: BookOpen, color: "text-indigo-400", bg: "bg-indigo-500/15", border: "border-indigo-500/20", role: "Contribu-lecteur", caution: "Vingt euros", desc: "Contribue de deux \u00e0 vingt euros par contenu litt\u00e9raire, partage les gains \u00e0 la cl\u00f4ture" },
                      { icon: Mic, color: "text-pink-400", bg: "bg-pink-500/15", border: "border-pink-500/20", role: "Auditeur", caution: "Vingt euros", desc: "Investit de deux \u00e0 vingt euros par podcast, partage les gains \u00e0 la cl\u00f4ture" },
                    ].map((r) => {
                      const IconComp = r.icon
                      return (
                        <div key={r.role} className={`bg-black/30 rounded-xl p-4 border ${r.border}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-8 h-8 rounded-lg ${r.bg} flex items-center justify-center`}>
                              <IconComp className={`h-4 w-4 ${r.color}`} />
                            </div>
                            <div>
                              <span className="text-white font-medium text-sm">{r.role}</span>
                              <span className="text-white/30 text-xs ml-2">{"Caution : " + r.caution}</span>
                            </div>
                          </div>
                          <p className="text-white/50 text-xs leading-relaxed">{r.desc}</p>
                        </div>
                      )
                    })}
                  </div>
                </SubSection>

                <SubSection title="Obligations de tout inscrit">
                  <div className="space-y-2">
                    {[
                      "Utiliser la plateforme conform\u00e9ment \u00e0 sa destination et aux lois en vigueur",
                      "Ne pas usurper l'identit\u00e9 d'un tiers ni cr\u00e9er de faux profils",
                      "Ne pas tenter de contourner les syst\u00e8mes de s\u00e9curit\u00e9 ou de paiement de la plateforme",
                      "Respecter la Charte communautaire VIXUAL : courtoisie, bienveillance et respect mutuel entre tous les utilisateurs",
                      "Ne publier aucun contenu ni propos raciste, homophobe, transphobe, antis\u00e9mite, anti-religieux, discriminatoire, haineux, sexuel, violent, diffamatoire ou insultant",
                      "L'incitation \u00e0 la haine sous toutes ses formes est strictement prohib\u00e9e et passible de suspension imm\u00e9diate, de blocage des fonds et de signalement aux autorit\u00e9s comp\u00e9tentes",
                      "Ne pas harc\u00e8ler, menacer ou intimider d'autres utilisateurs",
                      "Ne pas publier de contenu illicite, pornographique ou portant atteinte aux droits de tiers",
                      "Ne pas utiliser de syst\u00e8mes automatis\u00e9s (bots, scraping) pour interagir avec la plateforme",
                      "Maintenir la confidentialit\u00e9 de ses identifiants de connexion",
                      "Signaler tout contenu ou comportement inappropri\u00e9 via le bouton rouge de signalement pr\u00e9sent sur chaque contenu et profil",
                    ].map((item) => (
                      <div key={item} className="flex gap-2 items-start text-sm">
                        <Gavel className="h-4 w-4 text-teal-400/60 mt-0.5 shrink-0" />
                        <span className="text-white/60">{item}</span>
                      </div>
                    ))}
                  </div>
                </SubSection>
              </CardContent>
            </Card>
          </Section>

          {/* 2bis. Utilisateurs mineurs */}
          <Card className="bg-amber-500/5 border-amber-500/15">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-400">{"Article 2bis \u2014 Utilisateurs mineurs (16\u201317 ans)"}</h3>
                  <p className="text-white/50 text-sm mt-1">{"Dispositions sp\u00e9cifiques conform\u00e9ment au RGPD (art. 8) et aux l\u00e9gislations nationales applicables"}</p>
                </div>
              </div>

              <SubSection title={"Conditions d'inscription des mineurs"}>
                <div className="space-y-2">
                  {[
                    "\u00catre \u00e2g\u00e9(e) de 16 \u00e0 17 ans inclus au moment de l'inscription",
                    "Fournir une autorisation expresse du repr\u00e9sentant l\u00e9gal (parent ou tuteur)",
                    "Le repr\u00e9sentant l\u00e9gal doit valider les CGU et la Politique de Confidentialit\u00e9",
                    "Fournir les informations n\u00e9cessaires \u00e0 la v\u00e9rification d'identit\u00e9 (justificatif optionnel)",
                  ].map((item) => (
                    <div key={item} className="flex gap-2 items-start text-sm">
                      <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-white/60">{item}</span>
                    </div>
                  ))}
                </div>
              </SubSection>

              <SubSection title={"Droits du compte mineur"}>
                <div className="space-y-2">
                  {[
                    "Acc\u00e8s aux contenus gratuits disponibles sur la plateforme",
                    "Accumulation de VIXUpoints dans la limite de 10 000 points (\u00e9quivalent 100\u20ac)",
                    "Participation aux missions et aux interactions communautaires (commentaires, partages)",
                  ].map((item) => (
                    <div key={item} className="flex gap-2 items-start text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-white/60">{item}</span>
                    </div>
                  ))}
                </div>
              </SubSection>

              <SubSection title={"Restrictions du compte mineur"}>
                <div className="space-y-2">
                  {[
                    "Aucun investissement autoris\u00e9 avant l'\u00e2ge de 18 ans",
                    "Aucun retrait ni conversion de VIXUpoints en euros avant la majorit\u00e9",
                    "Les VIXUpoints accumul\u00e9s constituent un avantage promotionnel interne et ne repr\u00e9sentent pas une cr\u00e9ance financi\u00e8re exigible",
                    "Les VIXUpoints ne peuvent faire l'objet d'aucun transfert, cession ou vente",
                  ].map((item) => (
                    <div key={item} className="flex gap-2 items-start text-sm">
                      <Lock className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                      <span className="text-white/60">{item}</span>
                    </div>
                  ))}
                </div>
              </SubSection>

              <SubSection title={"\u00c0 la majorit\u00e9 (18 ans)"}>
                <div className="space-y-2">
                  {[
                    "Apr\u00e8s v\u00e9rification d'identit\u00e9 (KYC via Stripe Connect), l'utilisateur peut convertir ses VIXUpoints en cr\u00e9dit interne",
                    "Le cr\u00e9dit peut \u00eatre utilis\u00e9 pour investir sur la plateforme ou faire l'objet d'un retrait bancaire",
                    "Le plafond de VIXUpoints est automatiquement lev\u00e9 au passage \u00e0 la majorit\u00e9",
                  ].map((item) => (
                    <div key={item} className="flex gap-2 items-start text-sm">
                      <CheckCircle className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
                      <span className="text-white/60">{item}</span>
                    </div>
                  ))}
                </div>
              </SubSection>

              <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3 mt-2">
                <p className="text-red-400/80 text-xs leading-relaxed">
                  {"VIXUAL se r\u00e9serve le droit de suspendre ou supprimer tout compte mineur en cas de fausse d\u00e9claration d'\u00e2ge, d'absence de consentement parental valide, ou de non-respect des pr\u00e9sentes conditions."}
                </p>
              </div>

              <div className="bg-slate-800/30 border border-white/5 rounded-lg p-3 mt-1">
                <p className="text-white/40 text-xs leading-relaxed">
                  {"Droit applicable : l'\u00e2ge minimum d'inscription (16 ans) respecte le RGPD (art. 8) qui autorise les \u00c9tats membres \u00e0 fixer un seuil entre 13 et 16 ans. VIXUAL applique le seuil le plus protecteur (16 ans) pour couvrir l'ensemble des juridictions europ\u00e9ennes et internationales. En cas de conflit avec la l\u00e9gislation locale du pays de l'utilisateur, la disposition la plus protectrice s'applique."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 3. Système de caution */}
          <Section num={3} title="Caution : versement, utilisation et remboursement">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <p className="text-white/70 leading-relaxed">
                  {"La caution est un dépôt unique requis pour accéder à certains rôles. Elle garantit l'engagement de l'inscrit et assure la viabilité de l'écosystème VIXUAL."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-xl p-5 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Wallet className="h-5 w-5 text-amber-400" />
                      <span className="text-white font-medium">Caution Créateur</span>
                      <span className="text-amber-400 font-bold ml-auto">Dix euros</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-white/50">
                      <li>{"Applicable aux rôles : Porteur, Infoporteur, Podcasteur"}</li>
                      <li>{"Versée une seule fois lors de l'activation du rôle créateur"}</li>
                      <li>{"Traitée via Stripe, sécurisée et traçable"}</li>
                    </ul>
                  </div>
                  <div className="bg-black/30 rounded-xl p-5 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Wallet className="h-5 w-5 text-emerald-400" />
                      <span className="text-white font-medium">Caution Contributeur</span>
                      <span className="text-emerald-400 font-bold ml-auto">Vingt euros</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-white/50">
                      <li>{"Applicable aux rôles : Contributeur, Contribu-lecteur, Auditeur"}</li>
                      <li>{"Versée une seule fois lors de l'activation du rôle investisseur"}</li>
                      <li>{"Traitée via Stripe, sécurisée et traçable"}</li>
                    </ul>
                  </div>
                </div>

                <SubSection title="Remboursement de la caution">
                  <div className="bg-teal-500/5 border border-teal-500/15 rounded-xl p-4">
                    <p className="text-white/60 text-sm leading-relaxed">
                      {"La caution est intégralement remboursable dans les cas suivants :"}
                    </p>
                    <ul className="mt-3 space-y-2">
                      {[
                        "Résiliation volontaire du compte, sous réserve qu'aucun litige ne soit en cours et que toutes les clôtures en attente soient traitées",
                        "Suppression du rôle concerné (passage d'un rôle payant à Visiteur)",
                        "Décision de VIXUAL en cas de force majeure ou de fermeture de la plateforme",
                      ].map((item) => (
                        <li key={item} className="flex gap-2 items-start text-xs">
                          <RefreshCw className="h-3.5 w-3.5 text-teal-400 mt-0.5 shrink-0" />
                          <span className="text-white/55">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-white/40 text-xs mt-3">
                      {"D\u00e9lai de remboursement : trente jours ouvr\u00e9s maximum apr\u00e8s validation de la demande. Le remboursement s'effectue sur le moyen de paiement d'origine."}
                    </p>
                  </div>
                </SubSection>
              </CardContent>
            </Card>
          </Section>

          {/* 4. Contribution participative */}
          <Section num={4} title="Contribution participative : règles et risques">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <SubSection title="Modalités de contribution">
                  <div className="space-y-2">
                    {[
                      "Montant : de deux euros \u00e0 vingt euros par projet, par transaction",
                      "Un même inscrit peut contribuer à plusieurs projets simultanément",
                      "La contribution est définitive une fois confirmée et ne peut être annulée",
                      "La contribution s'accompagne d'un vote (favorable) pris en compte dans les classements et la visibilité",
                      "Les gains potentiels dépendent du nombre de vues, votes, écoutes et du système de clôture VIXUAL",
                    ].map((item) => (
                      <div key={item} className="flex gap-2 items-start text-sm">
                        <TrendingUp className="h-4 w-4 text-emerald-400/60 mt-0.5 shrink-0" />
                        <span className="text-white/60">{item}</span>
                      </div>
                    ))}
                  </div>
                </SubSection>

                <SubSection title="Répartition des gains et clôture">
                  <div className="bg-black/30 rounded-xl p-5 border border-white/5 space-y-3">
                    <p className="text-white/60 text-sm leading-relaxed">
                      {"Les gains sont calculés à chaque clôture selon les formules VIXUAL, détaillées dans le document \"Formules & Répartitions\" téléchargeable depuis la plateforme. Les taux de répartition varient selon :"}
                    </p>
                    <ul className="space-y-1.5 text-xs text-white/50 ml-2">
                      <li className="flex gap-2"><span className="text-teal-400">{">"}</span> {"La catégorie du contenu (audiovisuel, littéraire, podcast)"}</li>
                      <li className="flex gap-2"><span className="text-teal-400">{">"}</span> {"Le type de revenus (contributions, ventes, publicités, abonnements)"}</li>
                      <li className="flex gap-2"><span className="text-teal-400">{">"}</span> {"Le nombre de votes favorables et de VIXUpoints générés"}</li>
                      <li className="flex gap-2"><span className="text-teal-400">{">"}</span> {"La part attribuée à VIXUAL (frais de plateforme), la réserve technique et la réserve événementielle"}</li>
                    </ul>
                    <div className="bg-purple-500/5 border border-purple-500/15 rounded-lg p-3 mt-2">
                      <p className="text-purple-400/90 text-sm font-medium mb-1">
                        {"Primes de performance Podcast (6%)"}
                      </p>
                      <p className="text-white/50 text-xs leading-relaxed">
                        {"6% du pot mensuel Podcast sont distribu\u00e9s en primes de performance d\u00e9gressives aux TOP 10 podcasteurs (Rang 1 : 1.2%, Rang 10 : 0.6%). Ces primes sont vers\u00e9es mensuellement en compl\u00e9ment du split standard (40% cr\u00e9ateurs / 30% auditeurs / 20% VIXUAL / 10% r\u00e9serve). Le classement est \u00e9tabli selon les \u00e9coutes, l'engagement et les abonnements g\u00e9n\u00e9r\u00e9s."}
                      </p>
                    </div>
                    <p className="text-white/40 text-xs">
                      {"Les cl\u00f4tures sont configur\u00e9es par l'administration VIXUAL et varient selon la cat\u00e9gorie. Les d\u00e9tails exacts sont consultables dans l'onglet \"Comment \u00e7a marche\"."}
                    </p>
                  </div>
                </SubSection>

                <SubSection title="Avertissement sur les risques">
                  <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                      <div className="space-y-2">
                        <p className="text-amber-400/90 text-sm font-medium">
                          {"Contribuer comporte des risques. Les gains ne sont pas garantis."}
                        </p>
                        <ul className="space-y-1.5 text-xs text-white/50">
                          <li>{"La contribution sur VIXUAL n'est pas un produit financier réglementé au sens de la directive MiFID II"}</li>
                          <li>{"Les performances passées d'un contenu ne garantissent pas les performances futures"}</li>
                          <li>{"Le montant contribué peut ne générer aucun retour si le contenu ne rencontre pas son public"}</li>
                          <li>{"VIXUAL n'est pas un intermédiaire financier agréé. Les contributions relèvent du financement participatif de projet"}</li>
                          <li>{"L'inscrit reconnaît contribuer en connaissance de cause et ne pas engager de sommes qu'il ne peut se permettre de perdre"}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </SubSection>
              </CardContent>
            </Card>
          </Section>

          {/* 5. VIXUpoints et classements */}
          <Section num={5} title="VIXUpoints, votes et classements">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <SubSection title={"Nature des VIXUpoints"}>
                  <p className="text-white/60 text-sm leading-relaxed mb-3">
                    {"Les VIXUpoints sont un avantage promotionnel interne \u00e0 VIXUAL, attribu\u00e9s automatiquement selon les interactions de l'inscrit. Ils ne constituent ni une monnaie \u00e9lectronique au sens de la directive 2009/110/CE, ni une cr\u00e9ance financi\u00e8re exigible."}
                  </p>
                  <div className="bg-black/30 rounded-xl p-4 border border-white/5 mb-3">
                    <p className="text-white/70 text-sm font-medium mb-2">{"Taux et limites"}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div>
                        <span className="text-amber-400 font-bold text-lg">100</span>
                        <p className="text-white/40 text-xs">{"points = 1\u20ac"}</p>
                      </div>
                      <div>
                        <span className="text-emerald-400 font-bold text-lg">50</span>
                        <p className="text-white/40 text-xs">pts max / jour</p>
                      </div>
                      <div>
                        <span className="text-violet-400 font-bold text-lg">500</span>
                        <p className="text-white/40 text-xs">pts max / semaine*</p>
                      </div>
                      <div>
                        <span className="text-sky-400 font-bold text-lg">2 500</span>
                        <p className="text-white/40 text-xs">seuil conversion</p>
                      </div>
                    </div>
                    <p className="text-white/30 text-xs mt-2 italic">{"*Le plafond hebdomadaire de 500 pts s'applique uniquement en cas de participation communautaire active ou de promotion de VIXUAL."}</p>
                  </div>
                </SubSection>

                <SubSection title={"Utilisation des VIXUpoints par profil"}>
                  <p className="text-white/60 text-sm leading-relaxed mb-3">
                    {"Les VIXUpoints sont réservés à certains profils d'utilisateurs selon les règles suivantes :"}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                      <p className="text-emerald-400 font-medium text-sm mb-2">{"Profils autorisés"}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="text-white/70"><strong className="text-white/90">Visiteur majeur</strong> : VIXUpoints + paiement hybride</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="text-white/70"><strong className="text-white/90">Visiteur mineur (16-17 ans)</strong> : VIXUpoints uniquement</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="text-white/70"><strong className="text-white/90">Contribu-lecteur</strong> : VIXUpoints + paiement hybride</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="text-white/70"><strong className="text-white/90">Auditeur</strong> : VIXUpoints + paiement hybride</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-rose-500/10 rounded-xl p-4 border border-rose-500/20">
                      <p className="text-rose-400 font-medium text-sm mb-2">{"Profils non éligibles aux VIXUpoints"}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5 text-rose-400/60 shrink-0" />
                          <span className="text-white/50">Contributeur</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5 text-rose-400/60 shrink-0" />
                          <span className="text-white/50">Porteur</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5 text-rose-400/60 shrink-0" />
                          <span className="text-white/50">Infoporteur</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5 text-rose-400/60 shrink-0" />
                          <span className="text-white/50">Podcasteur</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-3 mt-4 border border-white/5">
                    <p className="text-white/50 text-xs leading-relaxed">
                      {"Les VIXUpoints ne peuvent en aucun cas être utilisés comme outil de contribution financière directe aux projets audiovisuels, ni comme mécanisme de gain financier. Ils constituent exclusivement un outil promotionnel interne et d'engagement communautaire."}
                    </p>
                  </div>
                </SubSection>

                <SubSection title={"Paiement hybride (achat de contenu)"}>
                  <p className="text-white/60 text-sm leading-relaxed mb-3">
                    {"Les VIXUpoints peuvent \u00eatre utilis\u00e9s pour l'achat de contenu sur la plateforme, selon un syst\u00e8me de paiement hybride :"}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/15 text-center">
                      <span className="text-emerald-400 font-bold text-xl">30%</span>
                      <p className="text-white/50 text-xs mt-1">minimum en euros</p>
                    </div>
                    <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/15 text-center">
                      <span className="text-amber-400 font-bold text-xl">70%</span>
                      <p className="text-white/50 text-xs mt-1">maximum en VIXUpoints</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-white/50">
                    <div className="flex gap-2 items-start"><CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" /><span>{"Le paiement 100% VIXUpoints n'est pas autoris\u00e9 afin de garantir un mod\u00e8le \u00e9conomique durable"}</span></div>
                    <div className="flex gap-2 items-start"><CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" /><span>{"Bonus : 5% des points d\u00e9pens\u00e9s sont retourn\u00e9s (plafond mensuel : 200 points)"}</span></div>
                    <div className="flex gap-2 items-start"><CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" /><span>{"Ce m\u00e9canisme assure le maintien du flux de r\u00e9mun\u00e9ration des cr\u00e9ateurs via Stripe"}</span></div>
                  </div>
                </SubSection>

                <SubSection title={"Moteur d'engagement (Visiteurs)"}>
                  <p className="text-white/60 text-sm leading-relaxed mb-3">
                    {"À partir de 500 VIXUpoints (pas avant), VIXUAL propose aux Visiteurs majeurs deux options pour valoriser leurs points :"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <span className="text-emerald-400 font-bold text-xs">A</span>
                        </div>
                        <p className="text-emerald-400 font-medium">{"Consommer du contenu"}</p>
                      </div>
                      <p className="text-white/60 text-xs leading-relaxed">{"Paiement hybride (30% cash / 70% VIXUpoints max) + bonus 5%"}</p>
                      <p className="text-emerald-400/60 text-xs mt-2 italic">{"Disponible dès 500 pts"}</p>
                    </div>
                    <div className="bg-violet-500/10 rounded-xl p-4 border border-violet-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                          <span className="text-violet-400 font-bold text-xs">B</span>
                        </div>
                        <p className="text-violet-400 font-medium">{"Changer de profil"}</p>
                      </div>
                      <p className="text-white/60 text-xs leading-relaxed">{"Devenir Contributeur (+500 VIXUpoints bonus, plafond débloqué)"}</p>
                      <p className="text-violet-400/60 text-xs mt-2 italic">{"Disponible à partir de 2 000 pts"}</p>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 mt-3 border border-white/5">
                    <p className="text-white/40 text-xs">
                      {"Ce mécanisme est purement incitatif et non contraignant. L'inscrit reste libre de conserver ses VIXUpoints sans obligation de les utiliser."}
                    </p>
                  </div>
                </SubSection>

                <SubSection title="Classements TOP">
                  <p className="text-white/60 text-sm leading-relaxed mb-3">
                    {"VIXUAL établit des classements publics par catégorie de créateurs, accessibles à tous les inscrits :"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: "TOP Porteur", color: "text-red-400", bg: "bg-red-500/15" },
                      { label: "TOP Infoporteur", color: "text-sky-400", bg: "bg-sky-500/15" },
                      { label: "TOP Podcasteur", color: "text-purple-400", bg: "bg-purple-500/15" },
                    ].map((cat) => (
                      <div key={cat.label} className={`${cat.bg} rounded-xl p-3 text-center border border-white/5`}>
                        <Star className={`h-5 w-5 ${cat.color} mx-auto mb-1`} />
                        <span className={`text-xs font-semibold ${cat.color}`}>{cat.label}</span>
                      </div>
                    ))}
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs text-white/50">
                    <li className="flex gap-2 items-start"><BarChart3 className="h-3.5 w-3.5 text-teal-400 mt-0.5 shrink-0" /> {"Trois niveaux de consultation : TOP 10, TOP 100, TOP 500"}</li>
                    <li className="flex gap-2 items-start"><User className="h-3.5 w-3.5 text-teal-400 mt-0.5 shrink-0" /> {"Chaque inscrit peut consulter son propre positionnement (de 1 à illimité) dans son espace personnel"}</li>
                    <li className="flex gap-2 items-start"><RefreshCw className="h-3.5 w-3.5 text-teal-400 mt-0.5 shrink-0" /> {"Les classements sont mis à jour en temps réel en fonction de l'activité"}</li>
                  </ul>
                </SubSection>

                <SubSection title={"Système de contribution et de votes (Grille officielle 2026)"}>
                  <p className="text-white/60 text-sm leading-relaxed mb-3">
                    {"Les contributions financières réalisées par les utilisateurs permettent d'obtenir des votes servant à soutenir et classer les projets présents sur la plateforme VIXUAL. Le nombre de votes attribué dépend du montant de la contribution selon la grille publique suivante :"}
                  </p>
                  <div className="overflow-x-auto bg-black/30 rounded-xl p-4 border border-white/5 mb-4">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-white/50">
                          <th className="text-left py-2 pr-3 font-medium">{"Contribution (EUR)"}</th>
                          <th className="text-center py-2 px-2 font-medium">{"Votes attribués"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[
                          { eur: "2", votes: "1" },
                          { eur: "3", votes: "2" },
                          { eur: "4", votes: "3" },
                          { eur: "5", votes: "4" },
                          { eur: "6", votes: "5" },
                          { eur: "8", votes: "7" },
                          { eur: "10", votes: "8" },
                          { eur: "12", votes: "10" },
                          { eur: "15", votes: "13" },
                          { eur: "20", votes: "15" },
                        ].map((row) => (
                          <tr key={row.eur}>
                            <td className="py-1.5 pr-3 text-white/70">{row.eur} EUR</td>
                            <td className="py-1.5 px-2 text-center text-amber-400 font-mono font-bold">{row.votes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20 mb-3">
                    <p className="text-emerald-300 font-medium text-sm mb-2">{"Principe fondamental"}</p>
                    <p className="text-white/60 text-xs leading-relaxed">
                      {"Plus la contribution financière est élevée, plus le nombre de votes attribués augmente. Ce système encourage la prise de risque financière tout en maintenant l'accessibilité aux petites contributions."}
                    </p>
                  </div>
                  <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                    <p className="text-amber-300 font-medium text-sm mb-2">{"Rôle des votes"}</p>
                    <ul className="space-y-1.5 text-xs text-white/60">
                      <li className="flex gap-2 items-start"><CheckCircle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" /> {"Les votes servent uniquement à classer les projets"}</li>
                      <li className="flex gap-2 items-start"><CheckCircle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" /> {"Les votes servent à sélectionner les projets du TOP"}</li>
                      <li className="flex gap-2 items-start"><CheckCircle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" /> {"Les votes influencent la visibilité"}</li>
                      <li className="flex gap-2 items-start"><AlertTriangle className="h-3.5 w-3.5 text-rose-400 mt-0.5 shrink-0" /> {"Les votes n'ont PAS de valeur financière directe"}</li>
                      <li className="flex gap-2 items-start"><AlertTriangle className="h-3.5 w-3.5 text-rose-400 mt-0.5 shrink-0" /> {"Les votes ne déterminent pas les gains financiers"}</li>
                    </ul>
                  </div>
                </SubSection>

                <SubSection title={"Calcul des gains (Règle d'équité)"}>
                  <p className="text-white/60 text-sm leading-relaxed mb-3">
                    {"Les gains éventuels sont calculés exclusivement sur la base des contributions financières réellement engagées par les utilisateurs, et non sur le nombre de votes."}
                  </p>
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10 mb-4">
                    <p className="text-white/70 text-sm font-medium mb-2">{"Formule officielle de répartition"}</p>
                    <div className="bg-black/40 rounded-lg p-3 font-mono text-xs text-emerald-400">
                      {"gain utilisateur = (contribution utilisateur / total contributions gagnantes) × enveloppe de gains"}
                    </div>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">
                    {"Ce système garantit une répartition équitable, une récompense proportionnelle au risque financier, et une impossibilité de manipulation via les votes."}
                  </p>
                </SubSection>

                <SubSection title={"Répartition globale des revenus VIXUAL"}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    {[
                      { label: "Créateurs", pct: "40%", color: "text-red-400", bg: "bg-red-500/15" },
                      { label: "Contributeurs gagnants", pct: "30%", color: "text-emerald-400", bg: "bg-emerald-500/15" },
                      { label: "Communauté", pct: "7%", color: "text-sky-400", bg: "bg-sky-500/15" },
                      { label: "Plateforme", pct: "23%", color: "text-amber-400", bg: "bg-amber-500/15" },
                    ].map((item) => (
                      <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center border border-white/5`}>
                        <span className={`text-lg font-bold ${item.color}`}>{item.pct}</span>
                        <p className="text-white/50 text-xs mt-1">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/40 text-xs">{"Total = 100%. Cette répartition assure un équilibre entre rémunération des créateurs, récompense des contributeurs et pérennité de la plateforme."}</p>
                </SubSection>

                <SubSection title={"Système de Soutien (Don)"}>
                  <div className="bg-rose-500/10 rounded-xl p-4 border border-rose-500/20 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-5 w-5 text-rose-400" />
                      <p className="text-rose-300 font-medium text-sm">{"Principe fondamental"}</p>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {"Le soutien (don) est une contribution volontaire et sans contrepartie permettant d'aider directement un créateur ou un projet. Contrairement à la contribution classique, le soutien :"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5 text-center">
                      <Lock className="h-5 w-5 text-white/40 mx-auto mb-2" />
                      <p className="text-white/70 text-xs font-medium">{"N'attribue aucun vote"}</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5 text-center">
                      <Lock className="h-5 w-5 text-white/40 mx-auto mb-2" />
                      <p className="text-white/70 text-xs font-medium">{"N'influence aucun classement"}</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5 text-center">
                      <Lock className="h-5 w-5 text-white/40 mx-auto mb-2" />
                      <p className="text-white/70 text-xs font-medium">{"Ne génère aucun gain"}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                      <span className="text-white/60">{"Montants disponibles : 2€, 5€, 10€, 20€ ou montant libre (minimum 2€)"}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                      <span className="text-white/60">{"Commission VIXUAL : 15% (le créateur reçoit 85% du montant)"}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                      <span className="text-white/60">{"Le soutien est définitif et non remboursable"}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-white/60">{"L'auto-soutien (se soutenir soi-même) est interdit"}</span>
                    </div>
                  </div>
                </SubSection>
              </CardContent>
            </Card>
          </Section>

          {/* 6. Contenus déposés */}
          <Section num={6} title="Contenus déposés par les créateurs">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <SubSection title="Propriété intellectuelle">
                  <div className="space-y-2 text-sm text-white/60">
                    <p className="leading-relaxed">
                      {"Le créateur (Porteur, Infoporteur, Podcasteur) conserve l'intégralité de ses droits de propriété intellectuelle sur les contenus qu'il dépose sur VIXUAL. En publiant un contenu, le créateur accorde à VIXUAL une licence non exclusive, mondiale et pour la durée de la présence du contenu sur la plateforme, afin de :"}
                    </p>
                    <ul className="space-y-1.5 ml-2">
                      {[
                        "Héberger, stocker et diffuser le contenu sur la plateforme VIXUAL",
                        "Reproduire des extraits à des fins promotionnelles (bandes-annonces, aperçus)",
                        "Afficher le contenu dans les classements, recommandations et résultats de recherche",
                        "Permettre aux investisseurs de consulter et voter sur le contenu",
                      ].map((item) => (
                        <li key={item} className="flex gap-2 items-start">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400/40 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </SubSection>

                <SubSection title="Responsabilité du créateur">
                  <div className="space-y-2">
                    {[
                      "Garantir qu'il est titulaire de tous les droits nécessaires à la publication du contenu",
                      "Garantir que le contenu ne porte pas atteinte aux droits de tiers (droit d'auteur, vie privée, droit à l'image)",
                      "Ne pas déposer de contenu illicite, haineux, discriminatoire, pornographique ou incitant à la violence",
                      "Assumer l'entière responsabilité du contenu déposé vis-à-vis des tiers et de la loi",
                    ].map((item) => (
                      <div key={item} className="flex gap-2 items-start text-sm">
                        <BadgeCheck className="h-4 w-4 text-teal-400/60 mt-0.5 shrink-0" />
                        <span className="text-white/60">{item}</span>
                      </div>
                    ))}
                  </div>
                </SubSection>

                <SubSection title={"D\u00e9claration de propri\u00e9t\u00e9 intellectuelle (obligatoire)"}>
                  <div className="space-y-3">
                    <p className="text-white/60 text-sm leading-relaxed">
                      {"Avant toute publication, le cr\u00e9ateur (Porteur, Infoporteur, Podcasteur) doit obligatoirement remplir et valider un formulaire de d\u00e9claration de propri\u00e9t\u00e9 intellectuelle attestant qu'il est bien le titulaire ou l'ayant-droit l\u00e9gitime du contenu d\u00e9pos\u00e9."}
                    </p>
                    <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                      <p className="text-amber-400/80 text-sm font-medium mb-2">{"Champs obligatoires"}</p>
                      <ul className="space-y-1.5 ml-2 text-white/50 text-xs">
                        {[
                          "Nom complet l\u00e9gal du d\u00e9clarant",
                          "Date de la d\u00e9claration (horodatage automatique)",
                          "Case \u00e0 cocher : \u00ab Je d\u00e9clare sur l'honneur \u00eatre le titulaire ou l'ayant-droit du contenu d\u00e9pos\u00e9 \u00bb",
                          "Acceptation de la responsabilit\u00e9 juridique en cas de fausse d\u00e9claration",
                        ].map((item) => (
                          <li key={item} className="flex gap-2 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/40 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-white/40 text-xs leading-relaxed">
                      {"Toute publication est bloqu\u00e9e tant que cette d\u00e9claration n'a pas \u00e9t\u00e9 valid\u00e9e. En cas de fausse d\u00e9claration, VIXUAL se r\u00e9serve le droit de supprimer le contenu, suspendre le compte et bloquer les fonds associ\u00e9s."}
                    </p>
                  </div>
                </SubSection>

                <SubSection title={"Mod\u00e9ration et retrait"}>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {"VIXUAL se r\u00e9serve le droit de retirer, sans pr\u00e9avis, tout contenu signal\u00e9 ou identifi\u00e9 comme contrevenant aux pr\u00e9sentes CGU, aux lois en vigueur, ou aux droits de tiers. Le cr\u00e9ateur en sera inform\u00e9 par notification sur la plateforme et pourra contester la d\u00e9cision via la messagerie de support."}
                  </p>
                </SubSection>
              </CardContent>
            </Card>
          </Section>

          {/* 7. Paiements et retraits */}
          <Section num={7} title="Paiements, retraits et fiscalité">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <SubSection title="Moyens de paiement">
                  <p className="text-white/60 text-sm leading-relaxed">
                    {"Tous les paiements sur VIXUAL (cautions, investissements) sont traités par Stripe, prestataire de paiement certifié PCI-DSS niveau 1. VIXUAL ne stocke jamais les données bancaires (numéros de carte, IBAN) sur ses propres serveurs."}
                  </p>
                </SubSection>

                <SubSection title="Paiement mensuel unique">
                  <div className="bg-teal-500/5 border border-teal-500/15 rounded-xl p-4 mb-3">
                    <p className="text-white/60 text-sm leading-relaxed">
                      {"Les paiements sont effectu\u00e9s mensuellement, le premier jour du mois suivant la cl\u00f4ture des op\u00e9rations. Un batch unique Stripe Connect est ex\u00e9cut\u00e9 avec des cl\u00e9s d'idempotence obligatoires. Chaque paiement passe par les \u00e9tats : en attente, valid\u00e9, pay\u00e9 ou bloqu\u00e9."}
                    </p>
                  </div>
                </SubSection>

                <SubSection title="Stripe Connect obligatoire">
                  <div className="space-y-2">
                    {[
                      "L'activation d'un compte Stripe Connect est obligatoire pour tout utilisateur susceptible de percevoir des gains (Porteur, Infoporteur, Podcasteur, Contributeur, Contribu-lecteur)",
                      "Les fonctions financi\u00e8res sont bloqu\u00e9es tant que charges_enabled et payouts_enabled ne sont pas actifs",
                      "Les gains disponibles sont consultables dans le Portefeuille de l'espace personnel",
                      "Les frais de transaction sont \u00e0 la charge de VIXUAL (aucun frais pour l'inscrit)",
                    ].map((item) => (
                      <div key={item} className="flex gap-2 items-start text-sm">
                        <CreditCard className="h-4 w-4 text-teal-400/60 mt-0.5 shrink-0" />
                        <span className="text-white/60">{item}</span>
                      </div>
                    ))}
                  </div>
                </SubSection>

                <SubSection title="Obligations fiscales">
                  <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                    <p className="text-white/60 text-sm leading-relaxed">
                      {"Les gains perçus sur VIXUAL sont susceptibles d'être soumis à l'impôt sur le revenu et/ou aux prélèvements sociaux, selon la législation fiscale applicable dans le pays de résidence de l'inscrit. VIXUAL ne fournit pas de conseil fiscal. Il appartient à chaque inscrit de déclarer ses gains auprès des autorités fiscales compétentes. VIXUAL pourra être tenu de transmettre les informations relatives aux gains versés aux autorités fiscales conformément à la directive DAC7."}
                    </p>
                  </div>
                </SubSection>
              </CardContent>
            </Card>
          </Section>

          {/* 7bis. Vixual Social */}
          <Section num={0} title={"Vixual Social \u2014 Mini-r\u00e9seau social int\u00e9gr\u00e9"}>
            <Card className="bg-emerald-500/5 border-emerald-500/15">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {"Vixual Social est un espace d'\u00e9change communautaire int\u00e9gr\u00e9 \u00e0 VIXUAL. Il permet aux inscrits de partager des avis courts sur les contenus, les projets et la vie de la plateforme."}
                    </p>
                  </div>
                </div>

                <SubSection title={"Format et r\u00e8gles de publication"}>
                  <div className="space-y-2">
                    {[
                      "Chaque post est limit\u00e9 \u00e0 280 caract\u00e8res maximum, en texte brut uniquement",
                      "Aucun lien externe, image, vid\u00e9o ou HTML n'est autoris\u00e9 dans les posts",
                      "Maximum 3 tags officiels par post, choisis parmi la liste pr\u00e9-approuv\u00e9e par VIXUAL",
                      "Maximum 5 publications par jour et par utilisateur",
                      "Un d\u00e9lai minimum de 1 minute est impos\u00e9 entre deux publications",
                    ].map((item) => (
                      <div key={item} className="flex gap-2 items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-white/60">{item}</span>
                      </div>
                    ))}
                  </div>
                </SubSection>

                <SubSection title={"Syst\u00e8me de tags"}>
                  <p className="text-white/60 text-sm leading-relaxed mb-2">
                    {"Les tags sont exclusivement d\u00e9finis et g\u00e9r\u00e9s par VIXUAL. Aucun utilisateur ne peut cr\u00e9er de tag personnalis\u00e9. Les tags sont regroup\u00e9s en 4 cat\u00e9gories : Genres (#Cin\u00e9maInd\u00e9, #Documentaire, #Thriller\u2026), Ambiances (#CoupDeCoeur, #P\u00e9pite\u2026), Plateforme (#VisualOriginal, #PremierProjet\u2026) et \u00c9v\u00e9nements (#VisualAwards, #Festival\u2026)."}
                  </p>
                </SubSection>

                <SubSection title={"R\u00e9actions"}>
                  <p className="text-white/60 text-sm leading-relaxed mb-2">
                    {"Cinq types de r\u00e9actions sont disponibles : Bravo, Feu, Inspirant, Coup de c\u0153ur et Star. Chaque r\u00e9action est unique par utilisateur et par publication (une seule r\u00e9action du m\u00eame type par publication). Les r\u00e9actions g\u00e9n\u00e8rent des VIXUpoints pour l'auteur de la publication (un point par r\u00e9action re\u00e7ue)."}
                  </p>
                </SubSection>

                <SubSection title={"VIXUpoints et Vixual Social"}>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <span className="text-emerald-400 font-bold text-base">+cinq</span>
                      <p className="text-white/40 text-xs mt-1">{"points par publication"}</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <span className="text-emerald-400 font-bold text-base">+un</span>
                      <p className="text-white/40 text-xs mt-1">{"point par r\u00e9action re\u00e7ue"}</p>
                    </div>
                  </div>
                </SubSection>

                <SubSection title={"Mod\u00e9ration communautaire"}>
                  <div className="space-y-2">
                    {[
                      "Tout utilisateur peut signaler un post qu'il juge inappropri\u00e9 (un signalement par post par utilisateur)",
                      "Une publication atteignant cinq signalements est automatiquement masqu\u00e9e et soumise \u00e0 l'\u00e9quipe de mod\u00e9ration",
                      "VIXUAL se r\u00e9serve le droit de supprimer tout contenu et de suspendre les comptes en infraction",
                      "Les comportements r\u00e9p\u00e9t\u00e9s de signalement abusif peuvent entra\u00eener une suspension temporaire du compte",
                    ].map((item) => (
                      <div key={item} className="flex gap-2 items-start text-sm">
                        <Shield className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                        <span className="text-white/60">{item}</span>
                      </div>
                    ))}
                  </div>
                </SubSection>

                <SubSection title={"Propri\u00e9t\u00e9 des contenus"}>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {"L'utilisateur reste propri\u00e9taire de ses posts. En publiant sur Vixual Social, il accorde \u00e0 VIXUAL une licence non exclusive, gratuite et mondiale pour afficher, reproduire et distribuer le contenu sur la plateforme. VIXUAL peut supprimer tout contenu sans pr\u00e9avis en cas de violation des pr\u00e9sentes CGU."}
                  </p>
                </SubSection>

                <div className="bg-slate-800/30 border border-white/5 rounded-lg p-3">
                  <p className="text-white/40 text-xs leading-relaxed">
                    {"Vixual Social n'est pas un r\u00e9seau social autonome. C'est une fonctionnalit\u00e9 int\u00e9gr\u00e9e \u00e0 VIXUAL, soumise aux m\u00eames CGU, CGV et Politique de Confidentialit\u00e9 que l'ensemble de la plateforme. Les utilisateurs mineurs (16\u201317 ans) peuvent acc\u00e9der \u00e0 Vixual Social sous r\u00e9serve du consentement parental d\u00e9j\u00e0 obtenu lors de l'inscription."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* 7bis. Interdiction auto-investissement */}
          <Section num={0} title={"Interdiction d'auto-investissement"}>
            <Card className="bg-red-500/5 border-red-500/15">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                    <Ban className="h-4 w-4 text-red-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white/70 text-sm leading-relaxed">
                      {"Un utilisateur ne peut en aucun cas investir dans son propre projet. Cette r\u00e8gle est appliqu\u00e9e automatiquement par le syst\u00e8me."}
                    </p>
                    <p className="text-white/50 text-xs leading-relaxed">
                      {"En cas de tentative d'auto-investissement : annulation imm\u00e9diate de la transaction, recalcul des votes concern\u00e9s, et suspension possible du compte."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* 7ter. VIXUAL Trust Score */}
          <Section num={0} title={"VIXUAL Trust Score"}>
            <Card className="bg-emerald-500/5 border-emerald-500/15">
              <CardContent className="pt-6 space-y-4">
                <p className="text-white/70 text-sm leading-relaxed">
                  {"Le VIXUAL Trust Score est un indice de confiance sur 100 points attribu\u00e9 \u00e0 chaque utilisateur, calcul\u00e9 automatiquement en fonction de ses actions sur la plateforme. Il repose sur un syst\u00e8me d'\u00e9v\u00e9nements pond\u00e9r\u00e9s : les actions positives augmentent le score, les actions n\u00e9gatives le diminuent."}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Nouveau", range: "0-29", color: "text-white/50", desc: "Fonctionnalit\u00e9s limit\u00e9es" },
                    { label: "Membre", range: "30-59", color: "text-amber-400", desc: "Acc\u00e8s standard" },
                    { label: "Fiable", range: "60-79", color: "text-sky-400", desc: "Acc\u00e8s \u00e9largi" },
                    { label: "V\u00e9rifi\u00e9", range: "80-100", color: "text-emerald-400", desc: "Acc\u00e8s premium" },
                  ].map((c) => (
                    <div key={c.label} className="bg-black/30 rounded-xl p-3 border border-white/5 text-center">
                      <span className={`font-bold text-sm ${c.color}`}>{c.range}</span>
                      <p className="text-white/70 text-xs font-medium mt-1">{c.label}</p>
                      <p className="text-white/40 text-[10px] mt-0.5">{c.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm text-white/60 leading-relaxed">
                  <p>{"Exemples d'\u00e9v\u00e9nements positifs : KYC v\u00e9rifi\u00e9 (+15), premier investissement (+10), contenu valid\u00e9 (+8), email v\u00e9rifi\u00e9 (+5), connexion r\u00e9guli\u00e8re (+2 \u00e0 +5)."}</p>
                  <p>{"Exemples d'\u00e9v\u00e9nements n\u00e9gatifs : fraude d\u00e9tect\u00e9e (-30), chargeback (-25), spam (-15), abus signal\u00e9 (-10), paiement \u00e9chou\u00e9 (-8), contenu rejet\u00e9 (-5)."}</p>
                </div>
                <p className="text-white/50 text-xs leading-relaxed">
                  {"Le Trust Score impacte la visibilit\u00e9 des contenus, le classement dans les r\u00e9sultats, et l'\u00e9ligibilit\u00e9 aux bonus. L'historique complet des \u00e9v\u00e9nements est consultable dans le profil utilisateur."}
                </p>
              </CardContent>
            </Card>
          </Section>

          {/* 7quater. Limitation stockage */}
          <Section num={0} title={"Limitation de stockage des cr\u00e9ateurs"}>
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-3">
                <p className="text-white/70 text-sm leading-relaxed">
                  {"Chaque cr\u00e9ateur dispose d'un quota annuel de publication :"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-teal-500/5 border border-teal-500/15 rounded-xl p-4 text-center">
                    <span className="text-teal-400 font-bold text-lg">Dix</span>
                    <p className="text-white/60 text-xs mt-1">{"vid\u00e9os par an (Porteur)"}</p>
                    <p className="text-white/40 text-[10px] mt-0.5">{"Suppl\u00e9ment : un euro par vid\u00e9o"}</p>
                  </div>
                  <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-4 text-center">
                    <span className="text-purple-400 font-bold text-lg">Vingt</span>
                    <p className="text-white/60 text-xs mt-1">{"podcasts par an (Podcasteur)"}</p>
                    <p className="text-white/40 text-[10px] mt-0.5">{"Suppl\u00e9ment : cinquante centimes par \u00e9pisode"}</p>
                  </div>
                </div>
                <p className="text-white/50 text-xs leading-relaxed">
                  {"Au-del\u00e0 du quota inclus, toute publication suppl\u00e9mentaire n\u00e9cessite un paiement pr\u00e9alable obligatoire avant mise en ligne."}
                </p>
              </CardContent>
            </Card>
          </Section>

          {/* 7quinquies. Protection medias */}
          <Section num={0} title={"Protection des m\u00e9dias"}>
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-3">
                <p className="text-white/70 text-sm leading-relaxed">
                  {"L'acc\u00e8s aux contenus m\u00e9dias (vid\u00e9os, podcasts, contenus litt\u00e9raires) est prot\u00e9g\u00e9 par un syst\u00e8me de jetons (tokens) temporaires. Chaque jeton est personnel, li\u00e9 \u00e0 un contenu et \u00e0 un utilisateur, et dispose d'une dur\u00e9e de validit\u00e9 limit\u00e9e."}
                </p>
                <p className="text-white/50 text-xs leading-relaxed">
                  {"Toute tentative de partage, d'extraction ou de contournement des jetons d'acc\u00e8s constitue une violation des CGU et pourra entra\u00eener la suspension imm\u00e9diate du compte."}
                </p>
              </CardContent>
            </Card>
          </Section>

          {/* 7sexies. Promotion externe */}
          <Section num={0} title={"Promotion externe"}>
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-3">
                <p className="text-white/70 text-sm leading-relaxed">
                  {"VIXUAL peut diffuser des extraits promotionnels de contenus via ses comptes officiels sur les r\u00e9seaux sociaux (Twitter/X, Instagram, YouTube, TikTok). Cette promotion s'effectue exclusivement par les comptes officiels de VIXUAL."}
                </p>
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                  <p className="text-amber-400/80 text-xs leading-relaxed">
                    {"L'utilisateur autorise VIXUAL \u00e0 diffuser des extraits promotionnels de ses contenus sur les r\u00e9seaux sociaux partenaires. Cette autorisation est r\u00e9vocable \u00e0 tout moment depuis les param\u00e8tres du contenu."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* 7septies. Declaration de propriete */}
          <Section num={0} title={"D\u00e9claration de propri\u00e9t\u00e9 intellectuelle"}>
            <Card className="bg-amber-500/5 border-amber-500/15">
              <CardContent className="pt-6 space-y-3">
                <p className="text-white/70 text-sm leading-relaxed">
                  {"Avant toute publication, le cr\u00e9ateur doit remplir un formulaire de d\u00e9claration obligatoire attestant qu'il est titulaire des droits sur l'\u0153uvre d\u00e9pos\u00e9e :"}
                </p>
                <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                  <p className="text-teal-400 text-sm italic leading-relaxed">
                    {"\"Je certifie \u00eatre titulaire des droits sur l'\u0153uvre d\u00e9pos\u00e9e et autorise sa diffusion sur la plateforme VIXUAL.\""}
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    "En cas de fausse d\u00e9claration : blocage imm\u00e9diat du compte",
                    "Les fonds associ\u00e9s au contenu litigieux sont gel\u00e9s",
                    "VIXUAL se r\u00e9serve le droit d'engager toute action judiciaire",
                  ].map((item) => (
                    <div key={item} className="flex gap-2 items-start text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-400/60 mt-0.5 shrink-0" />
                      <span className="text-white/60">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* 8. Comportements interdits */}
          <Section num={8} title="Comportements interdits et sanctions">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <SubSection title="Sont strictement interdits">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { icon: Ban, text: "Manipulation des votes, des classements ou des VIXUpoints par des moyens frauduleux" },
                      { icon: Users, text: "Cr\u00e9ation de comptes multiples pour cumuler les cautions ou les gains" },
                      { icon: XCircle, text: "Investissement fictif, blanchiment d'argent ou utilisation de fonds illicites" },
                      { icon: Ban, text: "Auto-investissement : investir dans son propre projet (annulation + recalcul des votes)" },
                      { icon: AlertTriangle, text: "Racisme, homophobie, transphobie, antis\u00e9mitisme, haine religieuse et toute forme de discrimination" },
                      { icon: AlertTriangle, text: "Harc\u00e8lement, menaces, intimidation, injures ou insultes envers tout utilisateur" },
                      { icon: Lock, text: "Tentative d'accès non autorisé aux systèmes, API ou données de la plateforme" },
                      { icon: Trash2, text: "Dépôt de contenu volé, plagié ou portant atteinte aux droits d'auteur de tiers" },
                    ].map((item) => {
                      const IconComp = item.icon
                      return (
                        <div key={item.text} className="flex gap-3 items-start bg-black/30 rounded-xl p-3 border border-white/5">
                          <IconComp className="h-4 w-4 text-red-400/70 mt-0.5 shrink-0" />
                          <span className="text-white/55 text-xs">{item.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </SubSection>

                <SubSection title="Sanctions applicables">
                  <p className="text-white/60 text-sm leading-relaxed mb-3">
                    {"En cas de manquement aux présentes CGU, VIXUAL se réserve le droit d'appliquer les mesures suivantes, de manière proportionnée et progressive :"}
                  </p>
                  <div className="space-y-2">
                    {[
                      { severity: "Avertissement", desc: "Notification par e-mail et/ou sur la plateforme rappelant les règles enfreintes", color: "text-amber-400" },
                      { severity: "Suspension temporaire", desc: "Blocage du compte pendant une dur\u00e9e de sept \u00e0 quatre-vingt-dix jours selon la gravit\u00e9", color: "text-orange-400" },
                      { severity: "Suspension définitive", desc: "Fermeture du compte, retrait de tous les contenus, remboursement de la caution sous conditions", color: "text-red-400" },
                      { severity: "Poursuites judiciaires", desc: "En cas de fraude, blanchiment ou infraction pénale, signalement aux autorités compétentes", color: "text-red-500" },
                    ].map((s) => (
                      <div key={s.severity} className="flex gap-3 items-start text-sm">
                        <span className={`font-semibold text-xs whitespace-nowrap ${s.color}`}>{s.severity}</span>
                        <span className="text-white/50 text-xs">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-4 mt-3 space-y-2">
                    <p className="text-yellow-400/80 text-sm font-medium">{"Impact sur le Trust Score"}</p>
                    <p className="text-white/50 text-xs leading-relaxed">
                      {"Toute sanction entra\u00eene une diminution automatique du Trust Score de l'utilisateur concern\u00e9 : avertissement (-5), suspension temporaire (-20), suspension d\u00e9finitive (-30 avec gel du score). Les \u00e9v\u00e9nements sont consign\u00e9s dans l'historique de confiance."}
                    </p>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 mt-3 space-y-2">
                    <p className="text-red-400/80 text-sm font-medium">{"Gel des fonds"}</p>
                    <p className="text-white/50 text-xs leading-relaxed">
                      {"En cas de suspension, les fonds de l'utilisateur sont gel\u00e9s. Aucun retrait n'est possible pendant la dur\u00e9e de la suspension. En cas de suspension d\u00e9finitive, les fonds restants sont rembours\u00e9s selon les modalit\u00e9s pr\u00e9vues \u00e0 l'article concernant les retraits, apr\u00e8s d\u00e9duction des \u00e9ventuelles p\u00e9nalit\u00e9s."}
                    </p>
                  </div>
                  <div className="bg-sky-500/5 border border-sky-500/15 rounded-xl p-4 mt-3 space-y-2">
                    <p className="text-sky-400/80 text-sm font-medium">{"D\u00e9lai de revue des retraits importants (soixante-douze heures)"}</p>
                    <p className="text-white/50 text-xs leading-relaxed">
                      {"Tout retrait d'un montant \u00e9gal ou sup\u00e9rieur \u00e0 mille euros fait l'objet d'une revue manuelle par l'\u00e9quipe VIXUAL dans un d\u00e9lai maximum de soixante-douze heures. Pendant ce d\u00e9lai, les fonds sont bloqu\u00e9s (statut \"held\"). L'utilisateur est notifi\u00e9 du r\u00e9sultat de l'examen."}
                    </p>
                  </div>
                </SubSection>

                <SubSection title={"Dispositif de signalement (Bouton Rouge Alerte)"}>
                  <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 space-y-3">
                    <p className="text-white/60 text-sm leading-relaxed">
                      {"Chaque utilisateur inscrit dispose d'un bouton de signalement (Bouton Rouge Alerte) accessible sur chaque contenu (vid\u00e9o, \u00e9crit, podcast), chaque commentaire et chaque profil utilisateur."}
                    </p>
                    <div className="space-y-2">
                      {[
                        "Le signalement est anonyme vis-\u00e0-vis de l'utilisateur signal\u00e9",
                        "L'utilisateur choisit un motif parmi : racisme, homophobie, antis\u00e9mitisme, haine religieuse, insultes/harc\u00e8lement, contenu sexuel, violence, plagiat, spam, autre",
                        "Un champ optionnel permet de d\u00e9tailler le signalement (500 caract\u00e8res max)",
                        "L'\u00e9quipe de mod\u00e9ration VIXUAL examine chaque signalement dans un d\u00e9lai maximal de quarante-huit heures (vingt-quatre heures pour les signalements critiques)",
                        "Les d\u00e9cisions possibles sont : approbation (fausse alerte), avertissement, suppression du contenu, suspension temporaire, suspension d\u00e9finitive, suppression du compte",
                        "L'utilisateur signal\u00e9 est notifi\u00e9 de la d\u00e9cision et peut exercer un recours aupr\u00e8s de support@visual.music",
                      ].map((item) => (
                        <div key={item} className="flex gap-2 items-start text-sm">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          <span className="text-white/55 text-xs">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </SubSection>

                <SubSection title={"Charte communautaire de respect et de courtoisie"}>
                  <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 space-y-3">
                    <p className="text-white/60 text-sm leading-relaxed">
                      {"VIXUAL est un espace de cr\u00e9ation collaborative fond\u00e9 sur le respect mutuel. En s'inscrivant, chaque utilisateur s'engage \u00e0 respecter la Charte communautaire VIXUAL :"}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        "Respecter la dignit\u00e9 de chaque personne",
                        "Faire preuve de courtoisie et de bienveillance",
                        "Accepter la diversit\u00e9 des opinions et des cultures",
                        "Contribuer de mani\u00e8re constructive aux \u00e9changes",
                        "Prot\u00e9ger les mineurs et les personnes vuln\u00e9rables",
                        "Utiliser le signalement de mani\u00e8re responsable",
                      ].map((item) => (
                        <div key={item} className="flex gap-2 items-start">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          <span className="text-white/55 text-xs">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </SubSection>
              </CardContent>
            </Card>
          </Section>

          {/* 9. Responsabilité */}
          <Section num={9} title="Responsabilité de VIXUAL">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3 text-sm text-white/60 leading-relaxed">
                  <p>
                    {"VIXUAL met en œuvre tous les moyens raisonnables pour assurer la disponibilité, la sécurité et le bon fonctionnement de la plateforme. Toutefois, VIXUAL ne peut garantir :"}
                  </p>
                  <ul className="space-y-2 ml-2">
                    {[
                      "L'absence totale d'interruptions, d'erreurs ou de dysfonctionnements techniques",
                      "La rentabilité de tout investissement réalisé sur la plateforme",
                      "La qualité, l'exactitude ou la légalité des contenus déposés par les créateurs",
                      "La disponibilité permanente des services tiers (Stripe, hébergement, CDN)",
                    ].map((item) => (
                      <li key={item} className="flex gap-2 items-start">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p>
                    {"VIXUAL agit en tant qu'hébergeur des contenus au sens du DSA (Règlement européen sur les services numériques) et de la LCEN. À ce titre, VIXUAL n'exerce pas de contrôle éditorial préalable sur les contenus déposés mais s'engage à retirer tout contenu manifestement illicite signalé dans les meilleurs délais."}
                  </p>
                  <p>
                    {"La responsabilité de VIXUAL ne saurait être engagée en cas de force majeure, d'interruption des réseaux de télécommunication, de défaillance des prestataires de paiement ou de toute circonstance indépendante de sa volonté."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* 10. Résiliation */}
          <Section num={10} title="Résiliation et clôture de compte">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <SubSection title="Résiliation par l'inscrit">
                  <div className="space-y-2">
                    {[
                      "L'inscrit peut demander la suppression de son compte à tout moment depuis les Paramètres de son espace personnel",
                      "Avant la suppression effective, les clôtures en cours doivent être finalisées et les gains disponibles retirés",
                      "La caution est rembours\u00e9e dans un d\u00e9lai de trente jours ouvr\u00e9s apr\u00e8s validation",
                      "Les contenus déposés sont retirés de la plateforme sauf accord contraire avec VIXUAL",
                      "Les données personnelles sont supprimées conformément à la Politique de Confidentialité (sauf obligations légales de conservation)",
                    ].map((item) => (
                      <div key={item} className="flex gap-2 items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-400/60 mt-0.5 shrink-0" />
                        <span className="text-white/60">{item}</span>
                      </div>
                    ))}
                  </div>
                </SubSection>

                <SubSection title="Résiliation par VIXUAL">
                  <p className="text-white/60 text-sm leading-relaxed">
                    {"VIXUAL peut suspendre ou r\u00e9silier un compte en cas de violation des pr\u00e9sentes CGU, de fraude av\u00e9r\u00e9e, ou sur injonction d'une autorit\u00e9 comp\u00e9tente. L'inscrit sera inform\u00e9 par e-mail des motifs de la r\u00e9siliation et disposera d'un d\u00e9lai de quinze jours pour contester la d\u00e9cision."}
                  </p>
                  <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 mt-3">
                    <p className="text-red-400/80 text-sm font-medium mb-2">{"Faute grave"}</p>
                    <p className="text-white/50 text-xs leading-relaxed">
                      {"En cas de faute grave (usurpation d'identit\u00e9, fausse d\u00e9claration, substitution de propri\u00e9t\u00e9 m\u00e9dia, fraude, incitation \u00e0 la haine), les fonds et cautions peuvent ne pas \u00eatre restitu\u00e9s jusqu'\u00e0 d\u00e9cision judiciaire. La caution pourra \u00eatre retenue \u00e0 titre de d\u00e9dommagement."}
                    </p>
                  </div>
                </SubSection>
              </CardContent>
            </Card>
          </Section>

          {/* 11. Données personnelles */}
          <Section num={11} title="Protection des données personnelles">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-3 text-sm text-white/60 leading-relaxed">
                <p>
                  {"Le traitement des données personnelles est régi par notre "}
                  <Link href="/legal/privacy" className="text-teal-400 hover:text-teal-300 underline underline-offset-2">Politique de Confidentialité</Link>
                  {" et notre "}
                  <Link href="/legal/cookies" className="text-teal-400 hover:text-teal-300 underline underline-offset-2">Politique de Cookies</Link>
                  {", qui font partie intégrante des présentes CGU."}
                </p>
                <p>
                  {"VIXUAL est responsable du traitement au sens du RGPD. Le Délégué à la Protection des Données (DPO) est joignable à l'adresse dpo@visual-platform.com. L'inscrit dispose de l'ensemble des droits prévus par les articles 15 à 22 du RGPD (accès, rectification, effacement, portabilité, opposition, limitation)."}
                </p>
              </CardContent>
            </Card>
          </Section>

          {/* 12. Modification des CGU */}
          <Section num={12} title="Modification des présentes CGU">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-3 text-sm text-white/60 leading-relaxed">
                <p>
                  {"VIXUAL se r\u00e9serve le droit de modifier les pr\u00e9sentes Conditions d'Utilisation \u00e0 tout moment. En cas de modification substantielle, les inscrits seront inform\u00e9s par e-mail et/ou par notification sur la plateforme au moins trente jours avant l'entr\u00e9e en vigueur."}
                </p>
                <p>
                  {"La poursuite de l'utilisation de la plateforme après l'entrée en vigueur des modifications vaut acceptation des nouvelles CGU. En cas de refus, l'inscrit peut demander la suppression de son compte et le remboursement de sa caution."}
                </p>
              </CardContent>
            </Card>
          </Section>

          {/* 13. Droit applicable */}
          <Section num={13} title="Droit applicable et juridiction compétente">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-3 text-sm text-white/60 leading-relaxed">
                <p>
                  {"Les pr\u00e9sentes CGU seront soumises au droit applicable dans la juridiction d'\u00e9tablissement officielle de VIXUAL lors de sa mise en ligne d\u00e9finitive. En attendant, le droit fran\u00e7ais s'applique \u00e0 titre indicatif."}
                </p>
                <p>
                  {"En cas de litige, les parties s'engagent \u00e0 rechercher une solution amiable dans un d\u00e9lai de trente jours. Conform\u00e9ment au r\u00e8glement europ\u00e9en n\u00b0524/2013, l'inscrit peut recourir \u00e0 la plateforme europ\u00e9enne de r\u00e9solution des litiges en ligne : "}
                  <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline underline-offset-2">{"ec.europa.eu/consumers/odr"}</a>
                </p>
                <p>
                  {"\u00c0 d\u00e9faut de r\u00e9solution amiable, le litige sera soumis aux tribunaux comp\u00e9tents du ressort du si\u00e8ge social de VIXUAL, sauf disposition l\u00e9gale imp\u00e9rative contraire (notamment au b\u00e9n\u00e9fice du consommateur)."}
                </p>
              </CardContent>
            </Card>
          </Section>

          {/* 14. Contact */}
          <Section num={14} title="Nous contacter">
            <Card className="bg-teal-500/5 border-teal-500/15">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-teal-500/15 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-5 w-5 text-teal-400" />
                  </div>
                  <div className="space-y-2 text-sm text-white/60">
                    <p>{"Pour toute question relative aux présentes CGU :"}</p>
                    <div className="space-y-1">
                      <p>{"Email g\u00e9n\u00e9ral : "}<span className="text-teal-400">contact@visual-platform.com</span></p>
                      <p>{"Email support : "}<span className="text-teal-400">support@visual-platform.com</span></p>
                      <p>{"DPO : "}<span className="text-teal-400">dpo@visual-platform.com</span></p>
                      <p>{"Adresse postale : "}<span className="text-white/40">{"[\u00c0 compl\u00e9ter]"}</span></p>
                      <p>{"T\u00e9l\u00e9phone : "}<span className="text-white/40">{"[\u00c0 compl\u00e9ter]"}</span></p>
                      <p>{"Messagerie : "}<Link href="/support/mailbox" className="text-teal-400 hover:text-teal-300 underline underline-offset-2">Messagerie de support</Link></p>
                    </div>
                    <p className="text-white/40 text-xs mt-3">
                      {"VIXUAL s'engage \u00e0 r\u00e9pondre \u00e0 toute demande dans un d\u00e9lai de quinze jours ouvr\u00e9s."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* 15. Force Majeure */}
          <Section num={15} title="Force majeure">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-3 text-sm text-white/60 leading-relaxed">
                <p>
                  {"VIXUAL ne saurait \u00eatre tenue responsable des retards ou impossibilit\u00e9s d'ex\u00e9cution dues \u00e0 des cas de force majeure au sens de l'article 1218 du Code civil, notamment :"}
                </p>
                <ul className="space-y-1.5 text-xs text-white/50 ml-2">
                  <li className="flex gap-2"><span className="text-teal-400">{">"}</span>{"D\u00e9faillances des prestataires de paiement (Stripe, \u00e9tablissements bancaires)"}</li>
                  <li className="flex gap-2"><span className="text-teal-400">{">"}</span>{"Attaques informatiques (DDoS, intrusion, ransomware)"}</li>
                  <li className="flex gap-2"><span className="text-teal-400">{">"}</span>{"Catastrophes naturelles, pand\u00e9mies, conflits arm\u00e9s"}</li>
                  <li className="flex gap-2"><span className="text-teal-400">{">"}</span>{"Gr\u00e8ves des services bancaires ou postaux"}</li>
                  <li className="flex gap-2"><span className="text-teal-400">{">"}</span>{"D\u00e9cisions administratives, judiciaires ou r\u00e9glementaires"}</li>
                  <li className="flex gap-2"><span className="text-teal-400">{">"}</span>{"Pannes d'h\u00e9bergement (Vercel, AWS, Bunny.net)"}</li>
                </ul>
                <p>
                  {"En cas de force majeure, VIXUAL s'engage \u00e0 informer les utilisateurs dans les meilleurs d\u00e9lais et \u00e0 mettre en \u0153uvre tous les moyens raisonnables pour r\u00e9tablir la situation."}
                </p>
              </CardContent>
            </Card>
          </Section>

          {/* 16. Mediation et reglement des litiges */}
          <Section num={16} title={"M\u00e9diation et r\u00e8glement des litiges"}>
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-3 text-sm text-white/60 leading-relaxed">
                <p>
                  {"En cas de litige, l'utilisateur peut recourir gratuitement au m\u00e9diateur de la consommation comp\u00e9tent :"}
                </p>
                <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-1.5 text-sm">
                  <p className="text-white font-medium">{"M\u00e9diateur du e-commerce de la FEVAD"}</p>
                  <p className="text-white/50 text-xs">{"60 rue la Bo\u00e9tie, 75008 Paris"}</p>
                  <p className="text-white/50 text-xs">
                    {"Site : "}
                    <a href="https://www.mediateurfevad.fr" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline underline-offset-2">www.mediateurfevad.fr</a>
                  </p>
                </div>
                <p>
                  {"L'utilisateur peut \u00e9galement recourir \u00e0 la plateforme europ\u00e9enne de r\u00e9solution des litiges en ligne : "}
                  <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline underline-offset-2">ec.europa.eu/consumers/odr</a>
                </p>
                <p>
                  {"\u00c0 d\u00e9faut de m\u00e9diation, tout litige rel\u00e8vera de la comp\u00e9tence exclusive des tribunaux de Paris, sauf disposition imp\u00e9rative contraire."}
                </p>
              </CardContent>
            </Card>
          </Section>

          {/* 17. Droit de retractation */}
          <Section num={17} title="Droit de rétractation">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-3 text-sm text-white/60 leading-relaxed">
                <p>
                  {"Conform\u00e9ment \u00e0 l'article L221-18 du Code de la consommation, l'utilisateur non-professionnel dispose d'un d\u00e9lai de quatorze jours calendaires \u00e0 compter de l'acceptation des pr\u00e9sentes conditions pour exercer son droit de r\u00e9tractation, sans avoir \u00e0 justifier de motifs ni \u00e0 payer de p\u00e9nalit\u00e9s."}
                </p>
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                  <p className="text-amber-400/80 text-sm">
                    {"Ce droit ne s'applique pas aux services pleinement ex\u00e9cut\u00e9s avant la fin du d\u00e9lai avec accord express de l'utilisateur (article L221-28 du Code de la consommation)."}
                  </p>
                </div>
                <p>
                  {"Pour exercer ce droit, l'utilisateur doit notifier sa d\u00e9cision par :"}
                </p>
                <ul className="space-y-1.5 text-xs text-white/50 ml-2">
                  <li className="flex gap-2"><span className="text-teal-400">{">"}</span>{"Email \u00e0 "}<span className="text-teal-400">dpo@visual-platform.com</span></li>
                  <li className="flex gap-2"><span className="text-teal-400">{">"}</span>{"Courrier recommand\u00e9 \u00e0 l'adresse du si\u00e8ge social de VIXUAL"}</li>
                </ul>
                <p className="text-white/40 text-xs">
                  {"Le remboursement sera effectu\u00e9 dans un d\u00e9lai de quatorze jours suivant la r\u00e9ception de la demande, par le m\u00eame moyen de paiement utilis\u00e9 lors de la transaction initiale."}
                </p>
              </CardContent>
            </Card>
          </Section>

          {/* Retour */}
          <div className="text-center pt-6">
            <Link href="/">
              <button className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors text-sm font-medium">
                <ArrowLeft className="h-4 w-4" />
                {"Retour \u00e0 l'accueil"}
              </button>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
