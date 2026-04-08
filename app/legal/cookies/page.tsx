"use client"

import Link from "next/link"
import { VisualHeader } from "@/components/visual-header"
import { Footer } from "@/components/footer"
import { VisualSlogan } from "@/components/visual-slogan"
import { Cookie, Shield, Settings, BarChart3, Users, Clock, ToggleLeft, Mail, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const cookieTypes = [
  {
    icon: Shield,
    title: "Cookies strictement nécessaires",
    required: true,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/15",
    borderColor: "border-emerald-500/20",
    description:
      "Ces cookies sont indispensables au fonctionnement de la plateforme VIXUAL. Ils permettent la navigation sur le site, la connexion à votre espace personnel, la gestion de votre session et la sécurité de vos données.",
    examples: [
      "Identifiant de session (maintien de votre connexion)",
      "Jeton d'authentification sécurisé (protection de votre compte)",
      "Préférences de consentement cookies (mémorisation de vos choix)",
      "Protection CSRF (sécurité contre les attaques)",
    ],
    retention: "Dur\u00e9e de la session ou sept jours maximum",
  },
  {
    icon: Settings,
    title: "Cookies de préférences",
    required: false,
    color: "text-sky-400",
    bgColor: "bg-sky-500/15",
    borderColor: "border-sky-500/20",
    description:
      "Ces cookies permettent à VIXUAL de mémoriser vos choix et préférences afin de personnaliser votre expérience sur la plateforme. Ils ne sont pas indispensables mais améliorent votre confort d'utilisation.",
    examples: [
      "Langue d'affichage sélectionnée (français, anglais, etc.)",
      "Thème d'interface (mode sombre)",
      "État du panneau latéral (ouvert ou fermé)",
      "Préférences de catégories de contenu (audiovisuel, littéraire, podcast)",
    ],
    retention: "1 an",
  },
  {
    icon: BarChart3,
    title: "Cookies d'analyse et de performance",
    required: false,
    color: "text-amber-400",
    bgColor: "bg-amber-500/15",
    borderColor: "border-amber-500/20",
    description:
      "Ces cookies nous aident à comprendre comment les visiteurs utilisent VIXUAL. Les données collectées sont anonymisées et servent uniquement à améliorer les performances et l'ergonomie de la plateforme.",
    examples: [
      "Pages les plus consultées et parcours de navigation",
      "Temps passé sur les contenus audiovisuels, littéraires et podcasts",
      "Taux de rebond et d'engagement",
      "Performances de chargement du site",
    ],
    retention: "treize mois maximum (conform\u00e9ment aux recommandations de la CNIL)",
  },
  {
    icon: Users,
    title: "Cookies de ciblage et marketing",
    required: false,
    color: "text-purple-400",
    bgColor: "bg-purple-500/15",
    borderColor: "border-purple-500/20",
    description:
      "VIXUAL n'utilise actuellement aucun cookie de ciblage publicitaire ni de tracking à des fins marketing. Si cela venait à changer, votre consentement explicite serait requis au préalable, conformément au RGPD.",
    examples: [
      "Aucun cookie de ce type n'est actuellement déposé",
      "Aucun partage de données avec des régies publicitaires",
      "Aucun profilage à des fins commerciales",
    ],
    retention: "Non applicable",
  },
]

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-black">
      <VisualHeader />

      <main className="pt-28 pb-20">
        {/* Hero */}
        <section className="py-12 md:py-16 cinema-section">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 mb-6">
              <Cookie className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              Politique de Cookies
            </h1>
            <div className="mb-6">
              <VisualSlogan size="sm" opacity="high" withLines />
            </div>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              {"Conformément au Règlement Général sur la Protection des Données (RGPD) et à la directive ePrivacy, VIXUAL vous informe de manière transparente sur l'utilisation des cookies sur sa plateforme."}
            </p>
            <p className="text-sm text-white/35 mt-4">
              {"Dernière mise à jour : 23 février 2026"}
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-4xl space-y-10">

          {/* Qu'est-ce qu'un cookie ? */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-emerald-400">1</span>
              {"Qu'est-ce qu'un cookie ?"}
            </h2>
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6">
                <p className="text-white/70 leading-relaxed mb-4">
                  {"Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, tablette, smartphone) lorsque vous visitez la plateforme VIXUAL. Il permet de stocker des informations relatives à votre navigation afin d'améliorer votre expérience utilisateur."}
                </p>
                <p className="text-white/70 leading-relaxed">
                  {"Les cookies ne contiennent aucune donnée personnelle sensible telle que votre mot de passe ou vos informations bancaires. Ils ne peuvent pas endommager votre appareil ni accéder à vos fichiers personnels."}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Base légale */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-emerald-400">2</span>
              {"Base légale et cadre réglementaire"}
            </h2>
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <p className="text-white/70 leading-relaxed">
                  {"L'utilisation des cookies sur VIXUAL est encadrée par :"}
                </p>
                <ul className="space-y-3">
                  {[
                    { label: "RGPD", text: "Règlement (UE) 2016/679 du 27 avril 2016 relatif à la protection des personnes physiques à l'égard du traitement des données à caractère personnel" },
                    { label: "ePrivacy", text: "Directive 2002/58/CE concernant le traitement des données à caractère personnel et la protection de la vie privée dans le secteur des communications électroniques" },
                    { label: "Loi Informatique et Libertés", text: "Loi n\u00b078-17 du 6 janvier 1978 modifiée, notamment son article 82" },
                    { label: "Recommandations CNIL", text: "Lignes directrices et recommandation de la CNIL du 1er octobre 2020 sur les cookies et autres traceurs" },
                  ].map((item) => (
                    <li key={item.label} className="flex gap-3 items-start">
                      <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-white font-medium">{item.label}</span>
                        <span className="text-white/50">{" \u2014 "}</span>
                        <span className="text-white/60">{item.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Types de cookies */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-emerald-400">3</span>
              {"Types de cookies utilisés sur VIXUAL"}
            </h2>
            <div className="space-y-4">
              {cookieTypes.map((cookie) => {
                const IconComp = cookie.icon
                return (
                  <Card key={cookie.title} className={`bg-slate-900/50 border-white/10 hover:${cookie.borderColor} transition-colors`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-11 h-11 rounded-xl ${cookie.bgColor} flex items-center justify-center shrink-0`}>
                          <IconComp className={`h-5 w-5 ${cookie.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h3 className="text-lg font-semibold text-white">{cookie.title}</h3>
                            {cookie.required ? (
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                                Obligatoire
                              </span>
                            ) : (
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/50 border border-white/15 font-medium">
                                Optionnel
                              </span>
                            )}
                          </div>
                          <p className="text-white/60 leading-relaxed text-sm">{cookie.description}</p>
                        </div>
                      </div>

                      <div className="ml-0 md:ml-15 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Exemples</p>
                          <ul className="space-y-2">
                            {cookie.examples.map((ex) => (
                              <li key={ex} className="flex gap-2 items-start text-sm">
                                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${cookie.bgColor} shrink-0`} />
                                <span className="text-white/55">{ex}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">{"Durée de conservation"}</p>
                          <div className="flex items-center gap-2">
                            <Clock className={`h-4 w-4 ${cookie.color}`} />
                            <span className="text-white/70 text-sm">{cookie.retention}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* Consentement */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-emerald-400">4</span>
              {"Votre consentement"}
            </h2>
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <p className="text-white/70 leading-relaxed">
                  {"Conformément au RGPD et aux recommandations de la CNIL, VIXUAL recueille votre consentement avant de déposer tout cookie non strictement nécessaire au fonctionnement du site."}
                </p>
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <ToggleLeft className="h-5 w-5 text-emerald-400" />
                    <span className="text-white font-medium">Vos droits</span>
                  </div>
                  <ul className="space-y-2 ml-8">
                    {[
                      "Accepter ou refuser chaque catégorie de cookies individuellement",
                      "Modifier vos préférences à tout moment via le panneau de gestion des cookies",
                      "Retirer votre consentement sans justification",
                      "Naviguer sur VIXUAL même en refusant les cookies optionnels (seules certaines fonctionnalités de personnalisation seront limitées)",
                    ].map((right) => (
                      <li key={right} className="flex gap-2 items-start text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500/30 shrink-0" />
                        <span className="text-white/60">{right}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-white/50 text-sm">
                  {"Le consentement est conserv\u00e9 pour une dur\u00e9e de six mois. Pass\u00e9 ce d\u00e9lai, VIXUAL vous redemandera votre accord."}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Gestion des cookies */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-emerald-400">5</span>
              {"Gérer vos cookies"}
            </h2>
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <p className="text-white/70 leading-relaxed">
                  {"Au-delà du panneau de gestion de VIXUAL, vous pouvez configurer votre navigateur pour gérer les cookies :"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { name: "Google Chrome", url: "chrome://settings/cookies" },
                    { name: "Mozilla Firefox", url: "about:preferences#privacy" },
                    { name: "Safari", url: "Préférences > Confidentialité" },
                    { name: "Microsoft Edge", url: "edge://settings/privacy" },
                  ].map((browser) => (
                    <div key={browser.name} className="bg-black/30 rounded-xl p-4 border border-white/5">
                      <p className="text-white font-medium text-sm">{browser.name}</p>
                      <p className="text-white/40 text-xs mt-1 font-mono">{browser.url}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                  <p className="text-amber-400/80 text-sm">
                    {"Attention : la suppression ou le blocage de certains cookies peut affecter le fonctionnement de la plateforme VIXUAL, notamment l'accès à votre espace personnel et la mémorisation de vos préférences."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Transfert de données */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-emerald-400">6</span>
              {"Transfert et partage des données"}
            </h2>
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <p className="text-white/70 leading-relaxed">
                  {"VIXUAL s'engage à ne jamais vendre, louer ou céder les données collectées via les cookies à des tiers à des fins commerciales. Les données d'analyse anonymisées peuvent être traitées par des sous-traitants techniques (hébergement, analyse de performance) situés dans l'Union européenne, dans le strict respect du RGPD."}
                </p>
                <p className="text-white/70 leading-relaxed">
                  {"En cas de transfert hors de l'UE, VIXUAL s'assure que des garanties appropriées sont mises en place (clauses contractuelles types de la Commission européenne, décision d'adéquation ou consentement explicite de l'utilisateur)."}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* DPO & Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-emerald-400">7</span>
              {"Contact et réclamation"}
            </h2>
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <p className="text-white/70 leading-relaxed">
                  {"Pour toute question relative à cette politique de cookies ou à l'exercice de vos droits (accès, rectification, suppression, portabilité, opposition), vous pouvez nous contacter :"}
                </p>
                <div className="bg-black/30 rounded-xl p-5 border border-white/5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-emerald-400" />
                    <div>
                      <p className="text-white font-medium text-sm">{"Délégué à la Protection des Données (DPO)"}</p>
                      <p className="text-white/50 text-sm">dpo@visual-platform.com</p>
                    </div>
                  </div>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">
                  {"Si vous estimez que vos droits ne sont pas respectés après nous avoir contactés, vous avez la possibilité d'introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) :"}
                </p>
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <p className="text-white/60 text-sm">CNIL - 3 Place de Fontenoy - TSA 80715 - 75334 Paris Cedex 07</p>
                  <p className="text-white/40 text-sm mt-1">www.cnil.fr</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Retour */}
          <div className="text-center pt-6">
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
