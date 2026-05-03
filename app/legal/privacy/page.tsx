"use client"

import Link from "next/link"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"
import { VisualSlogan } from "@/components/vixual-slogan"
import {
  Shield, User, Database, Eye, Lock, Globe, Clock, FileText,
  Mail, ArrowLeft, Scale, ServerCrash, AlertTriangle, Baby,
  CreditCard, Mic, Film, BookOpen, BarChart3, Share2, Trash2,
  Download, Edit3, Ban, HelpCircle, MessageSquare, Hash,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { LEGAL_INFO } from "@/lib/legal-info"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black">
      <VisualHeader />

      <main className="pt-28 pb-20">
        {/* Hero */}
        <section className="py-12 md:py-16 cinema-section">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 mb-6">
              <Shield className="h-8 w-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              {"Politique de Confidentialité"}
            </h1>
            <div className="mb-6">
              <VisualSlogan size="sm" opacity="high" withLines />
            </div>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              {"VIXUAL s'engage à protéger la vie privée de ses utilisateurs. Cette politique décrit comment vos données personnelles sont collectées, utilisées et protégées sur notre plateforme de streaming et d'investissement participatif."}
            </p>
            <p className="text-sm text-white/35 mt-4">
              {"Derni\u00e8re mise \u00e0 jour : 26 f\u00e9vrier 2026 \u2014 Version Provisoire Internationale"}
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-4xl space-y-10">

          {/* 1. Identité du responsable */}
          <Section num={1} title="Identité du responsable de traitement">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <p className="text-white/70 leading-relaxed">
                  {"Le responsable du traitement des données à caractère personnel collectées sur la plateforme VIXUAL est :"}
                </p>
                <div className="bg-black/30 rounded-xl p-5 border border-white/5 space-y-2">
                  <p className="text-white font-medium">{LEGAL_INFO.denomination}</p>
                  <p className="text-white/50 text-sm">{"Plateforme de streaming et d'investissement participatif dans les projets audiovisuels, litt\u00e9raires et podcasts"}</p>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <p className="text-white/70"><span className="text-white/40">{"Forme juridique : "}</span>{LEGAL_INFO.formeJuridique}</p>
                    <p className="text-white/70"><span className="text-white/40">{"D\u00e9nomination : "}</span>{LEGAL_INFO.denomination}</p>
                    <p className="text-white/70"><span className="text-white/40">{"Capital social : "}</span>{LEGAL_INFO.capitalSocial}</p>
                    <p className="text-white/70"><span className="text-white/40">{"SIRET : "}</span>{LEGAL_INFO.siret}</p>
                    <p className="text-white/70"><span className="text-white/40">{"RCS : "}</span>{LEGAL_INFO.rcs}</p>
                    <p className="text-white/70"><span className="text-white/40">{"N\u00b0 TVA : "}</span>{LEGAL_INFO.tva}</p>
                    <p className="text-white/70"><span className="text-white/40">{"Si\u00e8ge social : "}</span>{LEGAL_INFO.adresseSiege}</p>
                    <p className="text-white/70"><span className="text-white/40">{"T\u00e9l\u00e9phone : "}</span>{LEGAL_INFO.telephone}</p>
                    <p className="text-white/70"><span className="text-white/40">{"Email g\u00e9n\u00e9ral : "}</span>{LEGAL_INFO.emailContact}</p>
                    <p className="text-white/70"><span className="text-white/40">{"Email support : "}</span>{LEGAL_INFO.emailSupport}</p>
                    <p className="text-white/70"><span className="text-white/40">{"Contact DPO : "}</span>{LEGAL_INFO.emailDPO}</p>
                    <p className="text-white/70"><span className="text-white/40">{"Directeur de la publication : "}</span>{LEGAL_INFO.directeurPublication}</p>
                    <p className="text-white/70"><span className="text-white/40">{"H\u00e9bergeur : "}</span>{LEGAL_INFO.hebergeur}</p>
                  </div>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 mt-3">
                  <p className="text-amber-400/80 text-sm">
                    {"Les champs contenant des blancs (________) seront compl\u00e9t\u00e9s lors de l'immatriculation officielle de VIXUAL. Le droit applicable sera celui du pays d'\u00e9tablissement d\u00e9finitif."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* 2. Cadre juridique */}
          <Section num={2} title="Cadre juridique applicable">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <p className="text-white/70 leading-relaxed">
                  {"En tant que plateforme combinant diffusion de contenus (streaming) et investissement participatif, VIXUAL est soumise à un cadre réglementaire renforcé :"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { icon: Globe, label: "Droit européen", items: [
                      "RGPD (UE) 2016/679 \u2014 Protection des données personnelles",
                      "Directive ePrivacy 2002/58/CE \u2014 Communications électroniques",
                      "Directive (UE) 2019/770 \u2014 Fourniture de contenus numériques",
                      "Règlement (UE) 2022/2065 (DSA) \u2014 Services numériques",
                    ]},
                    { icon: Scale, label: "Droit français", items: [
                      "Loi Informatique et Libertés n\u00b078-17 du 6 janvier 1978",
                      "Loi n\u00b02014-344 \u2014 Consommation (Loi Hamon)",
                      "Code monétaire et financier \u2014 Financement participatif",
                      "Recommandations AMF \u2014 Investissement participatif",
                    ]},
                    { icon: Globe, label: "Droit international", items: [
                      "Convention 108+ du Conseil de l'Europe",
                      "Privacy Shield / Data Privacy Framework (UE-US)",
                      "Clauses contractuelles types (CCT) de la Commission européenne",
                      "Principes directeurs de l'OCDE sur la vie privée",
                    ]},
                    { icon: Shield, label: "Normes sectorielles", items: [
                      "PCI-DSS \u2014 Sécurité des données de paiement",
                      "ISO 27001 \u2014 Management de la sécurité de l'information",
                      "Directive MiFID II \u2014 Marchés d'instruments financiers",
                      "Recommandations CNIL sur les plateformes de crowdfunding",
                    ]},
                  ].map((block) => {
                    const IconComp = block.icon
                    return (
                      <div key={block.label} className="bg-black/30 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                          <IconComp className="h-4 w-4 text-indigo-400" />
                          <span className="text-white font-medium text-sm">{block.label}</span>
                        </div>
                        <ul className="space-y-1.5">
                          {block.items.map((item) => (
                            <li key={item} className="flex gap-2 items-start text-xs">
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500/40 shrink-0" />
                              <span className="text-white/55">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* 3. Données collectées */}
          <Section num={3} title="Données personnelles collectées">
            <div className="space-y-4">
              {[
                {
                  icon: User, color: "text-red-400", bg: "bg-red-500/15",
                  title: "Données d'identification",
                  subtitle: "Collectées lors de l'inscription",
                  items: [
                    "Nom, prénom et pseudonyme choisi",
                    "Adresse e-mail et mot de passe (chiffré, jamais stocké en clair)",
                    "Date de naissance (vérification de majorité)",
                    "Photo de profil (facultatif)",
                    "Rôle sélectionné : Visiteur, Porteur, Infoporteur, Podcasteur, Contributeur, Contribu-lecteur, Auditeur",
                  ],
                },
                {
                  icon: CreditCard, color: "text-amber-400", bg: "bg-amber-500/15",
                  title: "Données financières et transactionnelles",
                  subtitle: "Liées à l'investissement participatif et aux paiements",
                  items: [
                    "Caution vers\u00e9e (dix euros cr\u00e9ateurs, vingt euros investisseurs)",
                    "Historique des investissements (deux \u00e0 vingt euros par projet, montants, dates, projets cibl\u00e9s)",
                    "Solde du portefeuille VIXUAL et VIXUpoints accumulés",
                    "Transactions Stripe (identifiant Stripe Connect, retraits, reversements)",
                    "IBAN/coordonnées bancaires pour les retraits (traités par Stripe, non stockés par VIXUAL)",
                  ],
                },
                {
                  icon: Film, color: "text-sky-400", bg: "bg-sky-500/15",
                  title: "Données de contenus créés",
                  subtitle: "Liées à votre activité en tant que créateur",
                  items: [
                    "Vidéos déposées (Porteur) : fichiers, métadonnées, catégorie, descriptions",
                    "Écrits publiés (Infoporteur) : textes, résumés, catégorie littéraire",
                    "Podcasts déposés (Podcasteur) : fichiers audio, titres d'épisodes, descriptions",
                    "Statistiques associées : vues, lectures, écoutes, votes, investissements reçus",
                  ],
                },
                {
                  icon: BarChart3, color: "text-emerald-400", bg: "bg-emerald-500/15",
                  title: "Données de navigation et d'usage",
                  subtitle: "Collectées automatiquement lors de l'utilisation",
                  items: [
                    "Adresse IP (anonymis\u00e9e apr\u00e8s treize mois)",
                    "Type de navigateur, système d'exploitation, résolution d'écran",
                    "Pages consultées, contenus visionnés/lus/écoutés, durée de consultation",
                    "Préférences d'interface (langue, thème, catégories favorites)",
                    "Classements et positionnement (TOP Visiteur, Porteur, Infoporteur, Podcasteur)",
                  ],
                },
                {
                  icon: MessageSquare, color: "text-teal-400", bg: "bg-teal-500/15",
                  title: "Donn\u00e9es Vixual Social (mini-r\u00e9seau social)",
                  subtitle: "Collect\u00e9es lors de l'utilisation de Vixual Social",
                  items: [
                    "Contenu des posts et r\u00e9ponses publi\u00e9s (texte brut, 2\u202f000 caract\u00e8res max)",
                    "Tags officiels s\u00e9lectionn\u00e9s sur chaque post (1 \u00e0 3 parmi la liste VIXUAL)",
                    "Likes donn\u00e9s et re\u00e7us",
                    "Signalements effectu\u00e9s via le Bouton Rouge Alerte (motif, d\u00e9tails, horodatage, identifiant du signaleur)",
                    "Signalements re\u00e7us et d\u00e9cisions de mod\u00e9ration associ\u00e9es (masquage automatique \u00e0 3 signalements)",
                    "Horodatage des publications et des interactions",
                    "Rattachement \u00e0 un contenu (vid\u00e9o, podcast, \u00e9crit) ou au fil global",
                    "VIXUpoints Vixual Social (d\u00e9sactiv\u00e9s en V1, r\u00e9activ\u00e9s en V2)",
                  ],
                },
              ].map((cat) => {
                const IconComp = cat.icon
                return (
                  <Card key={cat.title} className="bg-slate-900/50 border-white/10">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-11 h-11 rounded-xl ${cat.bg} flex items-center justify-center shrink-0`}>
                          <IconComp className={`h-5 w-5 ${cat.color}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{cat.title}</h3>
                          <p className="text-white/40 text-sm">{cat.subtitle}</p>
                        </div>
                      </div>
                      <ul className="space-y-2 ml-15">
                        {cat.items.map((item) => (
                          <li key={item} className="flex gap-2 items-start text-sm">
                            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${cat.bg} shrink-0`} />
                            <span className="text-white/60">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </Section>

          {/* 4. Finalités et bases légales */}
          <Section num={4} title="Finalités et bases légales du traitement">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-white/50 font-medium py-3 pr-4">{"Finalité"}</th>
                        <th className="text-left text-white/50 font-medium py-3 pr-4">Base légale</th>
                        <th className="text-left text-white/50 font-medium py-3">{"Durée"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        { purpose: "Gestion du compte et authentification", basis: "Exécution du contrat", duration: "Durée du compte + 3 ans" },
                        { purpose: "Traitement des investissements et cautions", basis: "Exécution du contrat / Obligation légale", duration: "10 ans (obligations comptables)" },
                        { purpose: "Diffusion et hébergement des contenus créés", basis: "Exécution du contrat", duration: "Durée du compte + 1 an" },
                        { purpose: "Calcul et versement des gains (VIXUpoints, retours)", basis: "Exécution du contrat", duration: "10 ans (obligations comptables)" },
                        { purpose: "Classements (TOP Visiteur, Porteur, Infoporteur, Podcasteur)", basis: "Intérêt légitime", duration: "Durée du compte" },
                        { purpose: "Am\u00e9lioration de la plateforme et statistiques", basis: "Int\u00e9r\u00eat l\u00e9gitime", duration: "treize mois (donn\u00e9es anonymis\u00e9es)" },
                        { purpose: "Notifications d'engagement personnalis\u00e9es (VIXUpoints)", basis: "Int\u00e9r\u00eat l\u00e9gitime", duration: "Dur\u00e9e du compte" },
                        { purpose: "Paiement hybride (euros + VIXUpoints)", basis: "Ex\u00e9cution du contrat", duration: "10 ans (obligations comptables)" },
                        { purpose: "Vixual Social : publication de posts, r\u00e9actions et tags", basis: "Ex\u00e9cution du contrat", duration: "Dur\u00e9e du compte + 1 an" },
                        { purpose: "Vixual Social : mod\u00e9ration et signalements", basis: "Int\u00e9r\u00eat l\u00e9gitime", duration: "Dur\u00e9e du compte" },
                        { purpose: "Signalements Bouton Rouge Alerte : motif, d\u00e9tails, d\u00e9cisions de mod\u00e9ration", basis: "Int\u00e9r\u00eat l\u00e9gitime / Obligation l\u00e9gale", duration: "3 ans apr\u00e8s cl\u00f4ture du signalement" },
                        { purpose: "Envoi de notifications et communications", basis: "Consentement", duration: "Jusqu'au retrait du consentement" },
                        { purpose: "Conformité réglementaire (AMF, anti-blanchiment)", basis: "Obligation légale", duration: "5 ans après la clôture du compte" },
                        { purpose: "Sécurité et prévention de la fraude", basis: "Intérêt légitime", duration: "1 an après détection" },
                        { purpose: "Gestion des litiges et contentieux", basis: "Intérêt légitime", duration: "5 ans (prescription civile)" },
                      ].map((row) => (
                        <tr key={row.purpose}>
                          <td className="py-3 pr-4 text-white/70">{row.purpose}</td>
                          <td className="py-3 pr-4">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">{row.basis}</span>
                          </td>
                          <td className="py-3 text-white/50 whitespace-nowrap">{row.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* 5. Droits des utilisateurs */}
          <Section num={5} title="Vos droits (RGPD, articles 15 à 22)">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6">
                <p className="text-white/70 leading-relaxed mb-6">
                  {"En tant qu'inscrit sur VIXUAL, vous disposez des droits suivants sur vos données personnelles, que vous pouvez exercer à tout moment :"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: Eye, label: "Droit d'accès", desc: "Obtenir la confirmation du traitement de vos données et en recevoir une copie complète" },
                    { icon: Edit3, label: "Droit de rectification", desc: "Corriger toute donnée inexacte ou incomplète vous concernant" },
                    { icon: Trash2, label: "Droit à l'effacement", desc: "Demander la suppression de vos données (sauf obligations légales de conservation)" },
                    { icon: Lock, label: "Droit à la limitation", desc: "Restreindre temporairement le traitement de vos données dans certains cas" },
                    { icon: Download, label: "Droit à la portabilité", desc: "Recevoir vos données dans un format structuré, lisible par machine (JSON/CSV)" },
                    { icon: Ban, label: "Droit d'opposition", desc: "Vous opposer au traitement fondé sur l'intérêt légitime, y compris le profilage" },
                    { icon: Share2, label: "Droit au retrait du consentement", desc: "Retirer votre consentement à tout moment, sans affecter le traitement antérieur" },
                    { icon: HelpCircle, label: "Droit de réclamation", desc: "Introduire une réclamation auprès de la CNIL ou de toute autorité de contrôle compétente" },
                  ].map((right) => {
                    const IconComp = right.icon
                    return (
                      <div key={right.label} className="bg-black/30 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <IconComp className="h-4 w-4 text-indigo-400" />
                          <span className="text-white font-medium text-sm">{right.label}</span>
                        </div>
                        <p className="text-white/50 text-xs leading-relaxed">{right.desc}</p>
                      </div>
                    )
                  })}
                </div>
                <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 mt-4">
                  <p className="text-indigo-400/80 text-sm">
                    {"Pour exercer vos droits, envoyez un e-mail à dpo@visual-platform.com en joignant une copie de votre pièce d'identité. VIXUAL s'engage à répondre dans un délai d'un mois, conformément au RGPD."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* 6. Partage & sous-traitants */}
          <Section num={6} title="Partage des données et sous-traitants">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <p className="text-white/70 leading-relaxed">
                  {"VIXUAL ne vend, ne loue et ne cède jamais vos données personnelles à des tiers à des fins commerciales. Vos données peuvent être partagées uniquement avec :"}
                </p>
                <div className="space-y-3">
                  {[
                    { who: "Stripe Connect (paiement & KYC)", why: "Traitement des cautions, investissements, retraits. V\u00e9rification d'identit\u00e9 (KYC) pour la conformit\u00e9 anti-blanchiment. Stripe est certifi\u00e9 PCI-DSS niveau 1.", where: "UE / US (Data Privacy Framework)" },
                    { who: "Hébergeur cloud (Vercel / AWS)", why: "Hébergement de la plateforme, stockage des contenus et des données.", where: "UE (région Frankfurt) / US (clauses contractuelles types)" },
                    { who: "Prestataire d'analyse (anonymisé)", why: "Statistiques d'utilisation anonymisées pour améliorer la plateforme.", where: "UE uniquement" },
                    { who: "Autorités compétentes", why: "Sur réquisition judiciaire, obligation légale (AMF, TRACFIN, autorités fiscales).", where: "France / UE" },
                  ].map((partner) => (
                    <div key={partner.who} className="bg-black/30 rounded-xl p-4 border border-white/5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                        <span className="text-white font-medium text-sm">{partner.who}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">{partner.where}</span>
                      </div>
                      <p className="text-white/50 text-xs">{partner.why}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* 7. Transferts internationaux */}
          <Section num={7} title="Transferts internationaux de données">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <p className="text-white/70 leading-relaxed">
                  {"VIXUAL privilégie le stockage de vos données au sein de l'Union européenne. Lorsqu'un transfert en dehors de l'UE est nécessaire (par exemple vers les États-Unis pour Stripe), nous nous appuyons sur :"}
                </p>
                <ul className="space-y-2">
                  {[
                    "Les décisions d'adéquation de la Commission européenne (ex. : Data Privacy Framework UE-US)",
                    "Les clauses contractuelles types (CCT) adoptées par la Commission européenne",
                    "Les règles d'entreprise contraignantes (BCR) approuvées par les autorités de contrôle",
                    "Votre consentement explicite, en dernier recours, après information complète sur les risques",
                  ].map((item) => (
                    <li key={item} className="flex gap-2 items-start text-sm">
                      <Globe className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="text-white/60">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Section>

          {/* 8. Sécurité */}
          <Section num={8} title="Sécurité des données">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <p className="text-white/70 leading-relaxed">
                  {"VIXUAL met en oeuvre des mesures techniques et organisationnelles appropriées pour garantir un niveau de sécurité adapté aux risques :"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: Lock, label: "Chiffrement", desc: "TLS 1.3 pour les communications, AES-256 pour le stockage, bcrypt pour les mots de passe" },
                    { icon: Shield, label: "Authentification", desc: "Sessions sécurisées, tokens HTTP-only, protection CSRF sur toutes les actions" },
                    { icon: Database, label: "Base de données", desc: "Accès restreint par rôle (Row Level Security), sauvegardes chiffrées quotidiennes" },
                    { icon: ServerCrash, label: "Incident", desc: "Plan de r\u00e9ponse aux violations de donn\u00e9es sous soixante-douze heures (RGPD, article trente-trois) et notification aux utilisateurs concern\u00e9s" },
                  ].map((measure) => {
                    const IconComp = measure.icon
                    return (
                      <div key={measure.label} className="bg-black/30 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <IconComp className="h-4 w-4 text-indigo-400" />
                          <span className="text-white font-medium text-sm">{measure.label}</span>
                        </div>
                        <p className="text-white/50 text-xs leading-relaxed">{measure.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* 9. Conservation */}
          <Section num={9} title="Durées de conservation">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {[
                    { data: "Données du compte (profil, préférences, rôle)", duration: "Durée du compte + 3 ans après suppression", icon: User },
                    { data: "Contenus créés (vidéos, écrits, podcasts)", duration: "Durée du compte + 1 an (ou sur demande de suppression)", icon: Film },
                    { data: "Données financières (investissements, cautions, gains)", duration: "10 ans après la dernière transaction (obligation comptable)", icon: CreditCard },
                    { data: "Classements et VIXUpoints", duration: "Dur\u00e9e du compte (supprim\u00e9s \u00e0 la cl\u00f4ture)", icon: BarChart3 },
                    { data: "Posts et r\u00e9actions Vixual Social", duration: "Dur\u00e9e du compte + 1 an (supprim\u00e9s \u00e0 la cl\u00f4ture)", icon: MessageSquare },
                    { data: "Donn\u00e9es de navigation (logs, IP)", duration: "treize mois (anonymis\u00e9es ensuite)", icon: Globe },
                    { data: "Données anti-fraude et conformité", duration: "5 ans après la clôture du compte", icon: AlertTriangle },
                  ].map((row) => {
                    const IconComp = row.icon
                    return (
                      <div key={row.data} className="flex items-center gap-4 bg-black/30 rounded-xl p-4 border border-white/5">
                        <IconComp className="h-5 w-5 text-indigo-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white/70 text-sm">{row.data}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Clock className="h-3.5 w-3.5 text-white/30" />
                          <span className="text-white/45 text-xs">{row.duration}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* 10. Mineurs */}
          <Section num={10} title={"Donn\u00e9es des utilisateurs mineurs (16\u201317 ans)"}>
            <Card className="bg-amber-500/5 border-amber-500/15">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                    <Baby className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white/70 leading-relaxed">
                      {"L'inscription sur VIXUAL est autoris\u00e9e aux mineurs \u00e2g\u00e9s de 16 \u00e0 17 ans inclus, sous r\u00e9serve d'une autorisation expresse du repr\u00e9sentant l\u00e9gal. Conform\u00e9ment \u00e0 l'article 8 du RGPD, VIXUAL applique le seuil de 16 ans pour couvrir l'ensemble des juridictions europ\u00e9ennes et internationales."}
                    </p>
                  </div>
                </div>

                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <p className="text-white font-medium text-sm mb-3">{"Donn\u00e9es collect\u00e9es pour un compte mineur"}</p>
                  <div className="space-y-2">
                    {[
                      "Date de naissance (pour d\u00e9terminer le statut mineur et le d\u00e9blocage automatique \u00e0 18 ans)",
                      "Preuve d'autorisation parentale : nom et email du repr\u00e9sentant l\u00e9gal, acceptation des CGU/CGV",
                      "Justificatif d'identit\u00e9 du repr\u00e9sentant l\u00e9gal (optionnel selon juridiction, si upload)",
                      "Solde de VIXUpoints et historique d'activit\u00e9 (contenus vus, missions accomplies)",
                    ].map((item) => (
                      <div key={item} className="flex gap-2 items-start text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500/40 shrink-0" />
                        <span className="text-white/60">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <p className="text-white font-medium text-sm mb-3">{"Finalisation et conservation"}</p>
                  <div className="space-y-2">
                    {[
                      "Ces donn\u00e9es sont strictement utilis\u00e9es pour la conformit\u00e9 l\u00e9gale et la gestion du compte mineur",
                      "Les justificatifs parentaux sont conserv\u00e9s de mani\u00e8re s\u00e9curis\u00e9e et chiffr\u00e9e",
                      "Suppression automatique des justificatifs \u00e0 la majorit\u00e9 de l'utilisateur ou \u00e0 la suppression du compte",
                      "Aucune donn\u00e9e financi\u00e8re n'est collect\u00e9e pour les mineurs (pas d'investissement ni retrait)",
                    ].map((item) => (
                      <div key={item} className="flex gap-2 items-start text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500/40 shrink-0" />
                        <span className="text-white/60">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <p className="text-white font-medium text-sm mb-3">{"Droits du repr\u00e9sentant l\u00e9gal"}</p>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {"Le repr\u00e9sentant l\u00e9gal peut exercer les droits d'acc\u00e8s, de rectification et de suppression des donn\u00e9es du mineur en contactant : "}
                    <span className="text-teal-400">support@visual-platform.com</span>
                    {" ou "}
                    <span className="text-teal-400">dpo@visual-platform.com</span>
                    {". Il peut \u00e9galement r\u00e9voquer son consentement \u00e0 tout moment, ce qui entra\u00eenera la suspension du compte mineur."}
                  </p>
                </div>

                <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3">
                  <p className="text-red-400/80 text-xs leading-relaxed">
                    {"Les enfants de moins de 16 ans ne peuvent pas s'inscrire sur VIXUAL. Si vous \u00eates parent ou tuteur et pensez que votre enfant de moins de 16 ans a fourni des donn\u00e9es personnelles, contactez-nous imm\u00e9diatement \u00e0 dpo@visual-platform.com pour suppression."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* 11. Spécificités streaming + participatif */}
          <Section num={11} title="Dispositions spécifiques à VIXUAL">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-5">
                <p className="text-white/70 leading-relaxed">
                  {"VIXUAL combine deux activités soumises à des réglementations distinctes. Voici les dispositions spécifiques liées à chacune :"}
                </p>

                <div className="bg-black/30 rounded-xl p-5 border border-emerald-500/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Film className="h-5 w-5 text-emerald-400" />
                    <h4 className="text-white font-semibold">{"Volet Streaming (diffusion de contenus)"}</h4>
                  </div>
                  <ul className="space-y-2 ml-7">
                    {[
                      "Les contenus visionn\u00e9s, lus ou \u00e9cout\u00e9s sont journalis\u00e9s pour calculer les VIXUpoints et les classements, conform\u00e9ment aux conditions d'utilisation accept\u00e9es",
                      "Les recommandations de contenus sont bas\u00e9es sur vos pr\u00e9f\u00e9rences d\u00e9clar\u00e9es (cat\u00e9gories, favoris) et non sur un profilage algorithmique invasif",
                      "Des notifications personnalis\u00e9es peuvent \u00eatre affich\u00e9es en fonction de votre solde de VIXUpoints (moteur d'engagement). Ces notifications sont g\u00e9n\u00e9r\u00e9es en interne \u00e0 partir de votre activit\u00e9 sur la plateforme, sans partage avec des tiers",
                      "Le paiement hybride (euros + VIXUpoints) implique le traitement de votre solde de points pour calculer la r\u00e9partition du paiement. Ces donn\u00e9es restent strictement internes",
                      "Vous pouvez t\u00e9l\u00e9charger l'historique complet de vos consultations (droit \u00e0 la portabilit\u00e9, article 20 RGPD)",
                      "Les cr\u00e9ateurs (Porteur, Infoporteur, Podcasteur) ont acc\u00e8s aux statistiques agr\u00e9g\u00e9es et anonymis\u00e9es de leurs contenus, jamais aux donn\u00e9es individuelles des visiteurs",
                    ].map((item) => (
                      <li key={item} className="flex gap-2 items-start text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500/30 shrink-0" />
                        <span className="text-white/60">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-black/30 rounded-xl p-5 border border-sky-500/10">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-5 w-5 text-sky-400" />
                    <h4 className="text-white font-semibold">{"Volet Investissement Participatif"}</h4>
                  </div>
                  <ul className="space-y-2 ml-7">
                    {[
                      "Les données financières sont traitées dans le respect du Code monétaire et financier et des recommandations de l'AMF relatives au financement participatif",
                      "La traçabilité des transactions est assurée pendant 10 ans minimum (obligations légales comptables et fiscales)",
                      "Les opérations de paiement sont intégralement déléguées à Stripe (prestataire de services de paiement agréé), VIXUAL ne stocke aucune donnée bancaire",
                      "En cas de fermeture de compte, les cautions remboursables sont restituées selon les modalités des conditions d'utilisation, les données financières sont conservées conformément aux obligations légales",
                    ].map((item) => (
                      <li key={item} className="flex gap-2 items-start text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500/30 shrink-0" />
                        <span className="text-white/60">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* 12. Modifications */}
          <Section num={12} title="Modifications de cette politique">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <p className="text-white/70 leading-relaxed">
                  {"VIXUAL se réserve le droit de modifier cette politique de confidentialité pour l'adapter aux évolutions réglementaires, techniques ou fonctionnelles de la plateforme."}
                </p>
                <p className="text-white/70 leading-relaxed">
                  {"En cas de modification substantielle, vous serez inform\u00e9(e) par e-mail et/ou par notification sur la plateforme au moins trente jours avant l'entr\u00e9e en vigueur des changements. Vous aurez la possibilit\u00e9 de consulter les modifications, d'accepter les nouvelles conditions ou de supprimer votre compte."}
                </p>
              </CardContent>
            </Card>
          </Section>

          {/* 13. Contact */}
          <Section num={13} title="Contact et réclamation">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <p className="text-white/70 leading-relaxed">
                  {"Pour toute question relative à cette politique de confidentialité, à la protection de vos données ou pour exercer vos droits :"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-black/30 rounded-xl p-5 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-indigo-400" />
                      <span className="text-white font-medium text-sm">{"D\u00e9l\u00e9gu\u00e9 \u00e0 la Protection des Donn\u00e9es"}</span>
                    </div>
                    <p className="text-white/50 text-sm">dpo@visual-platform.com</p>
                    <p className="text-white/35 text-xs">{"D\u00e9lai de r\u00e9ponse : un mois maximum (RGPD, article douze)"}</p>
                  </div>
                  <div className="bg-black/30 rounded-xl p-5 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-indigo-400" />
                      <span className="text-white font-medium text-sm">Support / Contact</span>
                    </div>
                    <p className="text-white/50 text-sm">support@visual-platform.com</p>
                    <p className="text-white/35 text-xs">{"Adresse postale : [\u00c0 compl\u00e9ter]"}</p>
                    <p className="text-white/35 text-xs">{"T\u00e9l\u00e9phone : [\u00c0 compl\u00e9ter]"}</p>
                  </div>
                  <div className="bg-black/30 rounded-xl p-5 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-indigo-400" />
                      <span className="text-white font-medium text-sm">{"Autorit\u00e9 de contr\u00f4le"}</span>
                    </div>
                    <p className="text-white/50 text-sm">{"CNIL (ou autorit\u00e9 comp\u00e9tente du pays d'\u00e9tablissement)"}</p>
                    <p className="text-white/35 text-xs">3 Place de Fontenoy - TSA 80715 - 75334 Paris Cedex 07</p>
                    <p className="text-white/35 text-xs">www.cnil.fr</p>
                  </div>
                </div>
                <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4">
                  <p className="text-indigo-400/80 text-sm">
                    {"Vous avez également le droit d'introduire une réclamation auprès de l'autorité de contrôle de votre pays de résidence si vous estimez que le traitement de vos données enfreint le RGPD (article 77)."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* Retour */}
          <div className="flex justify-center gap-4 pt-6">
            <Link href="/legal/cookies">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm">
                <FileText className="h-4 w-4" />
                Politique de Cookies
              </button>
            </Link>
            <Link href="/">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm">
                <ArrowLeft className="h-4 w-4" />
                {"Retour à l'accueil"}
              </button>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

function Section({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-indigo-400">
          {num}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}
