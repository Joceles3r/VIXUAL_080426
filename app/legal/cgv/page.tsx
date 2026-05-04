"use client"

import Link from "next/link"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"
import { VisualSlogan } from "@/components/vixual-slogan"
import {
  FileText, ArrowLeft, User, CreditCard, Film, BookOpen, Mic,
  Shield, ShieldCheck, AlertTriangle, Scale, Globe, Clock, Eye, Lock,
  Ban, Vote, Gavel, Wallet, Star, Users, CheckCircle, Calculator,
  BadgeCheck, Info, TrendingUp, Award, BarChart3, Handshake, UserCheck,
  MessageSquare, Hash,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { LEGAL_INFO } from "@/lib/legal-info"

/* ── Shared sub-components ──────────────────────────── */

function Section({ num, title, icon: Icon, children }: { num: number; title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 text-sm font-bold border border-amber-500/20">
          {num}
        </span>
        <Icon className="h-5 w-5 text-amber-400/70" />
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-white/65 leading-relaxed mb-3">{children}</p>
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-2 shrink-0" />
      <span className="text-white/65 leading-relaxed">{children}</span>
    </li>
  )
}

function HighlightCard({ icon: Icon, title, children, color = "amber" }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode; color?: string }) {
  const colors: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
    amber: { bg: "bg-amber-500/5", border: "border-amber-500/15", text: "text-amber-400", iconBg: "bg-amber-500/15" },
    red: { bg: "bg-red-500/5", border: "border-red-500/15", text: "text-red-400", iconBg: "bg-red-500/15" },
    emerald: { bg: "bg-emerald-500/5", border: "border-emerald-500/15", text: "text-emerald-400", iconBg: "bg-emerald-500/15" },
    sky: { bg: "bg-sky-500/5", border: "border-sky-500/15", text: "text-sky-400", iconBg: "bg-sky-500/15" },
    purple: { bg: "bg-purple-500/5", border: "border-purple-500/15", text: "text-purple-400", iconBg: "bg-purple-500/15" },
  }
  const c = colors[color] || colors.amber
  return (
    <Card className={`${c.bg} border ${c.border}`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 rounded-lg ${c.iconBg} flex items-center justify-center`}>
            <Icon className={`h-4 w-4 ${c.text}`} />
          </div>
          <h3 className={`font-semibold ${c.text}`}>{title}</h3>
        </div>
        <div className="text-white/60 text-sm leading-relaxed space-y-2">{children}</div>
      </CardContent>
    </Card>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
        <span className="w-1 h-4 bg-amber-500/50 rounded-full" />
        {title}
      </h4>
      <div className="pl-3 border-l border-white/10">
        {children}
      </div>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────── */

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <VisualHeader />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            {"Retour à l'accueil"}
          </Link>

          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-sm mb-6">
              <Gavel className="h-4 w-4" />
              {"Conditions Générales de Vente"}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {"Conditions Générales de Vente"}
            </h1>
            <div className="mb-4">
              <VisualSlogan size="sm" opacity="high" withLines />
            </div>
            <p className="text-white/50 text-sm">
              {"Version Provisoire Internationale \u2013 26 f\u00e9vrier 2026"}
            </p>
          </div>

          {/* Table of contents */}
          <Card className="bg-slate-900/40 border-white/10 mb-10">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-400" />
                Sommaire
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                {[
                  "Identité de la plateforme",
                  "Objet des CGV",
                  "Profils utilisateurs",
                  "Conditions d'inscription",
                  "Cautions",
                  "Nature des participations",
                  "Système de votes",
                  "Répartition des gains",
                  "Règle d'arrondi",
                  "Wallet et paiements",
                  "Absence de garantie",
                  "Vixual Social",
                  "Interdictions et sanctions",
                  "Propriété intellectuelle",
                  "Responsabilité de VIXUAL",
                  "Données personnelles",
                  "Droit applicable",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/50 py-1">
                    <span className="text-amber-400/60 font-mono text-xs w-5 text-right">{i + 1}.</span>
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Informations provisoires */}
          <Card className="bg-amber-500/5 border-amber-500/15 mb-10">
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
                  `Hebergeur : ${LEGAL_INFO.hebergeur}`,
                ].map((item, i) => (
                  <p key={i} className="text-white/45 py-0.5">{item}</p>
                ))}
              </div>
              <p className="text-amber-400/60 text-xs mt-4">
                {"Ce document est une version provisoire internationale. Les informations seront compl\u00e9t\u00e9es lors de l'immatriculation officielle de VIXUAL."}
              </p>
            </CardContent>
          </Card>

          {/* Articles */}
          <div className="space-y-10">

            {/* Article 1 */}
            <Section num={1} title={"Identité de la plateforme"} icon={Globe}>
              <P>{"VIXUAL est une plateforme numérique de diffusion et de participation économique à des contenus audiovisuels et littéraires, accessible à l'adresse visual.app (ou tout autre domaine exploité par VIXUAL)."}</P>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <HighlightCard icon={Handshake} title="Intermédiaire technique" color="amber">
                  <p>{"VIXUAL agit en qualité d'intermédiaire technique entre les créateurs de contenus et les utilisateurs participants."}</p>
                </HighlightCard>
                <HighlightCard icon={Ban} title="Pas un établissement financier" color="red">
                  <p>{"VIXUAL n'est ni une banque, ni un établissement financier, ni un prestataire de services d'investissement au sens du Code monétaire et financier."}</p>
                </HighlightCard>
                <HighlightCard icon={Shield} title="Cadre juridique" color="emerald">
                  <p>{"VIXUAL opère dans le cadre du droit français et du règlement européen sur les services numériques (DSA)."}</p>
                </HighlightCard>
              </div>
            </Section>

            {/* Article 2 */}
            <Section num={2} title="Objet des CGV" icon={FileText}>
              <P>{"Les présentes Conditions Générales de Vente encadrent l'ensemble des relations contractuelles entre VIXUAL et ses utilisateurs inscrits, notamment :"}</P>
              <ul className="space-y-2 ml-1">
                <Bullet>{"Les participations financières aux projets diffusés"}</Bullet>
                <Bullet>{"Les règles de classement (TOP Visiteur, TOP Porteur, TOP Infoporteur, TOP Podcasteur)"}</Bullet>
                <Bullet>{"Les modalités de redistribution des gains"}</Bullet>
                <Bullet>{"Le système de cautions"}</Bullet>
                <Bullet>{"Les paiements et retraits via Stripe Connect"}</Bullet>
                <Bullet>{"Les bonus applicables aux contenus podcast"}</Bullet>
              </ul>
              <P>{"En s'inscrivant et en utilisant les services de VIXUAL, l'utilisateur reconnaît avoir lu, compris et accepté sans réserve les présentes CGV."}</P>
            </Section>

            {/* Article 3 */}
            <Section num={3} title="Profils utilisateurs" icon={Users}>
              <P>{"VIXUAL distingue plusieurs profils, chacun associé à des droits et obligations spécifiques :"}</P>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {[
                  { icon: Eye, name: "Invité", desc: "Accès libre en consultation sans compte", color: "amber" },
                  { icon: Eye, name: "Visiteur", desc: "Inscrit, peut consulter et voter", color: "amber" },
                  { icon: Film, name: "Porteur", desc: "Créateur de contenus audiovisuels", color: "red" },
                  { icon: TrendingUp, name: "Contributeur", desc: "Participe financièrement aux projets vidéo", color: "emerald" },
                  { icon: BookOpen, name: "Infoporteur", desc: "Créateur de contenus littéraires", color: "sky" },
                  { icon: BookOpen, name: "Contribu-lecteur", desc: "Participe financierement aux contenus ecrits", color: "sky" },
                  { icon: Mic, name: "Podcasteur", desc: "Créateur de contenus audio/podcast", color: "purple" },
                  { icon: Mic, name: "Auditeur", desc: "Écoute et participe aux contenus podcast", color: "purple" },
                ].map((p) => (
                  <HighlightCard key={p.name} icon={p.icon} title={p.name} color={p.color}>
                    <p>{p.desc}</p>
                  </HighlightCard>
                ))}
              </div>

            </Section>

            {/* Article 4 */}
            <Section num={4} title={"Conditions d'inscription"} icon={BadgeCheck}>
              <P>{"Pour s'inscrire sur VIXUAL, l'utilisateur doit satisfaire aux conditions suivantes :"}</P>
              <ul className="space-y-2 ml-1">
                <Bullet>{"Être âgé de 18 ans minimum au moment de l'inscription"}</Bullet>
                <Bullet>{"Ne détenir qu'un seul et unique compte par personne physique"}</Bullet>
                <Bullet>{"Fournir des informations exactes, complètes et à jour"}</Bullet>
                <Bullet>{"Disposer d'un compte Stripe Connect pour percevoir des gains (requis avant tout retrait)"}</Bullet>
              </ul>
              <P>{"Tout manquement à ces conditions peut entraîner la suspension ou la suppression du compte, sans préjudice des recours de VIXUAL."}</P>
            </Section>

            {/* Article 5 */}
            <Section num={5} title="Cautions" icon={Wallet}>
              <P>{"Le système de cautions garantit l'engagement des utilisateurs sur la plateforme. La caution est un dépôt unique exigé selon le type de profil :"}</P>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Card className="bg-emerald-500/5 border-emerald-500/15">
                  <CardContent className="p-5 text-center">
                    <div className="text-2xl font-bold text-emerald-400 mb-1">Dix euros</div>
                    <p className="text-white/50 text-sm">{"Cr\u00e9ateurs (Porteur, Infoporteur, Podcasteur)"}</p>
                  </CardContent>
                </Card>
                <Card className="bg-sky-500/5 border-sky-500/15">
                  <CardContent className="p-5 text-center">
                    <div className="text-2xl font-bold text-sky-400 mb-1">Vingt euros</div>
                    <p className="text-white/50 text-sm">{"Participants financiers (Contributeur, Contribu-lecteur, Auditeur)"}</p>
                  </CardContent>
                </Card>
              </div>
              <Card className="bg-amber-500/5 border-amber-500/15 mt-4">
                <CardContent className="p-4 flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-white/60 text-sm leading-relaxed space-y-1">
                    <p>{"Les cautions sont remboursables en cas de résiliation volontaire du compte, sous réserve qu'aucune fraude, multi-compte ou violation grave des CGV n'ait été constatée."}</p>
                    <p>{"Le remboursement est effectué via Stripe Connect dans un délai raisonnable."}</p>
                  </div>
                </CardContent>
              </Card>
            </Section>

            {/* Article 6 */}
            <Section num={6} title="Nature des participations" icon={TrendingUp}>
              <P>{"Les sommes engagées par les utilisateurs sur VIXUAL donnent droit à des votes et peuvent générer un gain proportionnel au classement du contenu soutenu."}</P>
              <Card className="bg-red-500/5 border-red-500/15 mt-3">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-white/60 text-sm leading-relaxed space-y-2">
                      <p className="font-semibold text-red-400">{"Avertissement important"}</p>
                      <p>{"Les participations financières sur VIXUAL ne constituent en aucun cas un produit financier, une action, un prêt, une obligation ou tout autre instrument financier au sens du Code monétaire et financier."}</p>
                      <p className="font-medium text-white/70">{"Aucun rendement n'est garanti. Les résultats dépendent exclusivement du classement et de l'activité sur la plateforme."}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Section>

            {/* Article 7 */}
            <Section num={7} title={"Système de votes"} icon={Vote}>
              <P>{"Le système de vote de VIXUAL repose sur un mécanisme transparent et proportionnel :"}</P>
              <ul className="space-y-2 ml-1">
                <Bullet>{"Les votes sont proportionnels aux montants engagés par chaque utilisateur"}</Bullet>
                <Bullet>{"Aucun mécanisme aléatoire, tirage au sort ou algorithme opaque n'intervient dans le classement"}</Bullet>
                <Bullet>{"Le classement est déterminé uniquement par le cumul des participations reçues par chaque contenu"}</Bullet>
              </ul>
              <P>{"Ce système garantit l'équité entre les participants et la transparence des résultats."}</P>
            </Section>

            {/* Article 8 */}
            <Section num={8} title={"Répartition des gains"} icon={BarChart3}>
              <P>{"À la clôture de chaque période, les gains sont redistribués selon des grilles propres à chaque catégorie de contenu :"}</P>

              {/* Video */}
              <Card className="bg-red-500/5 border-red-500/15 mt-4">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <Film className="h-4 w-4" />
                    {"Contenus audiovisuels (Vidéos)"}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    {[
                      { label: "Contributeurs TOP 10", value: "40%", color: "text-emerald-400" },
                      { label: "Porteurs TOP 10", value: "30%", color: "text-red-400" },
                      { label: "Contributeurs 11-100", value: "7%", color: "text-amber-400" },
                      { label: "VIXUAL", value: "23%", color: "text-white/50" },
                    ].map((r) => (
                      <div key={r.label} className="text-center p-3 rounded-lg bg-slate-800/40">
                        <div className={`text-xl font-bold ${r.color}`}>{r.value}</div>
                        <div className="text-white/40 text-xs mt-1">{r.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ecrit */}
              <Card className="bg-sky-500/5 border-sky-500/15 mt-4">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sky-400 mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {"Contenus littéraires (Écrits)"}
                  </h3>
                  <div className="text-white/60 text-sm leading-relaxed space-y-2">
                    <p>{"Vente unitaire : 70% pour l'auteur, 30% pour VIXUAL."}</p>
                    <p>{"Pot de redistribution : 60% redistribués aux auteurs, 40% redistribués aux lecteurs participants."}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Podcast */}
              <Card className="bg-purple-500/5 border-purple-500/15 mt-4">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    {"Contenus podcast"}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    {[
                      { label: "Podcasteurs", value: "40%", color: "text-purple-400" },
                      { label: "Auditeurs", value: "30%", color: "text-amber-400" },
                      { label: "VIXUAL", value: "20%", color: "text-white/50" },
                      { label: "Bonus", value: "10%", color: "text-emerald-400" },
                    ].map((r) => (
                      <div key={r.label} className="text-center p-3 rounded-lg bg-slate-800/40">
                        <div className={`text-xl font-bold ${r.color}`}>{r.value}</div>
                        <div className="text-white/40 text-xs mt-1">{r.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 bg-slate-800/40 rounded-lg p-3">
                    <p className="text-white/60 text-xs font-medium mb-2">{"D\u00e9tail du bonus 10% :"}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <span className="text-emerald-400 font-bold">6%</span>
                        <p className="text-white/40 mt-0.5">Primes performance</p>
                      </div>
                      <div className="text-center">
                        <span className="text-sky-400 font-bold">2%</span>
                        <p className="text-white/40 mt-0.5">{"R\u00e9serve technique"}</p>
                      </div>
                      <div className="text-center">
                        <span className="text-amber-400 font-bold">2%</span>
                        <p className="text-white/40 mt-0.5">{"R\u00e9serve \u00e9v\u00e9nementielle"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nouvelle grille officielle 2026 */}
              <Card className="bg-amber-500/5 border-amber-500/15 mt-4">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {"Grille officielle Contribution → Votes (2026)"}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">
                    {"Le nombre de votes attribué dépend du montant de la contribution selon cette grille publique. Les votes servent uniquement au classement et à la visibilité, PAS au calcul des gains."}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-white/50">
                          <th className="text-left py-2 pr-3 font-medium">{"Contribution"}</th>
                          <th className="text-center py-2 px-2 font-medium">{"Votes"}</th>
                          <th className="text-left py-2 pr-3 font-medium">{"Contribution"}</th>
                          <th className="text-center py-2 px-2 font-medium">{"Votes"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        <tr>
                          <td className="py-1.5 pr-3 text-white/70">2 EUR</td>
                          <td className="py-1.5 px-2 text-center text-amber-400 font-mono font-bold">1</td>
                          <td className="py-1.5 pr-3 text-white/70">8 EUR</td>
                          <td className="py-1.5 px-2 text-center text-amber-400 font-mono font-bold">7</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 pr-3 text-white/70">3 EUR</td>
                          <td className="py-1.5 px-2 text-center text-amber-400 font-mono font-bold">2</td>
                          <td className="py-1.5 pr-3 text-white/70">10 EUR</td>
                          <td className="py-1.5 px-2 text-center text-amber-400 font-mono font-bold">8</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 pr-3 text-white/70">4 EUR</td>
                          <td className="py-1.5 px-2 text-center text-amber-400 font-mono font-bold">3</td>
                          <td className="py-1.5 pr-3 text-white/70">12 EUR</td>
                          <td className="py-1.5 px-2 text-center text-amber-400 font-mono font-bold">10</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 pr-3 text-white/70">5 EUR</td>
                          <td className="py-1.5 px-2 text-center text-amber-400 font-mono font-bold">4</td>
                          <td className="py-1.5 pr-3 text-white/70">15 EUR</td>
                          <td className="py-1.5 px-2 text-center text-amber-400 font-mono font-bold">13</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 pr-3 text-white/70">6 EUR</td>
                          <td className="py-1.5 px-2 text-center text-amber-400 font-mono font-bold">5</td>
                          <td className="py-1.5 pr-3 text-white/70">20 EUR</td>
                          <td className="py-1.5 px-2 text-center text-amber-400 font-mono font-bold">15</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Formule de calcul des gains */}
              <Card className="bg-emerald-500/5 border-emerald-500/15 mt-4">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    {"Formule officielle de calcul des gains"}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">
                    {"La plateforme VIXUAL applique une règle de répartition transparente des gains. Les montants redistribués aux contributeurs gagnants sont calculés proportionnellement à leur participation financière."}
                  </p>
                  <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                    <p className="text-white/70 text-sm font-medium mb-2">{"Formule appliquée"}</p>
                    <div className="bg-black/40 rounded-lg p-3 font-mono text-xs text-emerald-400">
                      {"gain utilisateur = (contribution utilisateur / total contributions gagnantes) × enveloppe de gains"}
                    </div>
                  </div>
                  <div className="bg-rose-500/10 rounded-lg p-3 border border-rose-500/20">
                    <p className="text-rose-300 text-xs leading-relaxed">
                      {"Cette méthode garantit une répartition équitable basée sur le risque financier réellement engagé par chaque participant. Les votes n'interviennent PAS dans le calcul des gains financiers."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Répartition globale */}
              <Card className="bg-slate-500/5 border-white/10 mt-4">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-white mb-3">{"Répartition globale des revenus VIXUAL"}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    {[
                      { label: "Créateurs", value: "40%", color: "text-red-400" },
                      { label: "Contributeurs gagnants", value: "30%", color: "text-emerald-400" },
                      { label: "Communauté", value: "7%", color: "text-sky-400" },
                      { label: "Plateforme", value: "23%", color: "text-amber-400" },
                    ].map((r) => (
                      <div key={r.label} className="text-center p-3 rounded-lg bg-slate-800/40">
                        <div className={`text-xl font-bold ${r.color}`}>{r.value}</div>
                        <div className="text-white/40 text-xs mt-1">{r.label}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/40 text-xs mt-3">{"Total = 100%. Cette répartition assure l'équilibre entre rémunération des créateurs, récompense des contributeurs et pérennité de la plateforme."}</p>
                </CardContent>
              </Card>
            </Section>

            {/* Article 9 */}
            <Section num={9} title={"Règle d'arrondi"} icon={Clock}>
              <P>{"Tous les calculs de gains sont effectués au centime inférieur (arrondi par défaut). Les résidus issus de cet arrondi sont automatiquement intégrés à la réserve technique de VIXUAL, garantissant l'équilibre comptable de la plateforme."}</P>
            </Section>

            {/* Article 10 */}
            <Section num={10} title="Wallet et paiements" icon={CreditCard}>
              <P>{"Chaque utilisateur inscrit dispose d'un wallet (portefeuille interne) qui centralise ses op\u00e9rations financi\u00e8res sur VIXUAL :"}</P>
              <ul className="space-y-2 ml-1">
                <Bullet>{"Les gains issus des classements sont automatiquement cr\u00e9dit\u00e9s dans le wallet"}</Bullet>
                <Bullet>{"Les paiements sont effectu\u00e9s mensuellement, le premier jour du mois suivant la cl\u00f4ture des op\u00e9rations, via un batch unique Stripe Connect"}</Bullet>
                <Bullet>{"Chaque virement utilise des cl\u00e9s d'idempotence (idempotency keys) garantissant l'absence de doublons"}</Bullet>
                <Bullet>{"Les \u00e9tats de chaque paiement sont : en attente (pending), valid\u00e9 (validated), pay\u00e9 (paid) ou bloqu\u00e9 (blocked)"}</Bullet>
                <Bullet>{"L'activation d'un compte Stripe Connect est obligatoire pour tout profil susceptible de percevoir des gains (Porteur, Infoporteur, Podcasteur, Contributeur, Contribu-lecteur)"}</Bullet>
                <Bullet>{"Les fonctions financi\u00e8res sont bloqu\u00e9es tant que charges_enabled et payouts_enabled ne sont pas actifs sur le compte Stripe Connect"}</Bullet>
                <Bullet>{"VIXUAL s'appuie sur les obligations de v\u00e9rification d'identit\u00e9 (KYC) de Stripe en tant que prestataire de paiement"}</Bullet>
              </ul>
              <P>{"L'utilisateur est responsable de la validit\u00e9 et de l'exactitude de ses informations bancaires renseign\u00e9es sur Stripe Connect."}</P>
            </Section>

            {/* Article 11 */}
            <Section num={11} title="Absence de garantie" icon={AlertTriangle}>
              <Card className="bg-amber-500/5 border-amber-500/15">
                <CardContent className="p-5 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-white/60 text-sm leading-relaxed space-y-2">
                    <p className="font-semibold text-amber-400">{"Clause essentielle"}</p>
                    <p>{"Aucun gain n'est garanti sur VIXUAL. Les résultats financiers de chaque utilisateur dépendent exclusivement du classement obtenu par les contenus soutenus et de l'activité globale sur la plateforme."}</p>
                    <p>{"En acceptant les présentes CGV, l'utilisateur reconnaît avoir été informé de l'absence de toute garantie de rendement et assume l'intégralité des risques liés à ses participations."}</p>
                  </div>
                </CardContent>
              </Card>
            </Section>

            {/* Article 12 - VIXUpoints et paiement hybride */}
            <Section num={12} title={"VIXUpoints et paiement hybride"} icon={Star}>
              <P>{"Les VIXUpoints ne constituent pas une monnaie \u00e9lectronique et ne peuvent \u00eatre convertis librement en num\u00e9raire. Ils constituent un avantage promotionnel interne \u00e0 VIXUAL au sens de la directive 2009/110/CE. Le taux de r\u00e9f\u00e9rence est de cent VIXUpoints \u00e9quivalent un euro. Plafonds : mineurs (seize \u00e0 dix-huit ans) dix mille points (cent euros), majeurs deux mille cinq cents points."}</P>

              <Card className="bg-slate-800/40 border-white/5 mt-3 mb-3">
                <CardContent className="pt-5 space-y-3">
                  <p className="text-white font-medium text-sm">{"Paiement hybride pour l'achat de contenu"}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/15 text-center">
                      <span className="text-emerald-400 font-bold text-lg">30%</span>
                      <p className="text-white/40 text-xs mt-1">minimum en euros</p>
                    </div>
                    <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/15 text-center">
                      <span className="text-amber-400 font-bold text-lg">70%</span>
                      <p className="text-white/40 text-xs mt-1">maximum en VIXUpoints</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-white/50">
                    <Bullet>{"Le paiement int\u00e9gralement en VIXUpoints (100%) n'est pas autoris\u00e9 en version V1"}</Bullet>
                    <Bullet>{"Bonus d'utilisation : 5% des points d\u00e9pens\u00e9s sont restitu\u00e9s (plafond : 200 pts/mois)"}</Bullet>
                    <Bullet>{"Ce mod\u00e8le garantit la r\u00e9mun\u00e9ration effective des cr\u00e9ateurs via le flux Stripe"}</Bullet>
                  </ul>
                </CardContent>
              </Card>

              {/* Regles d'eligibilite VIXUpoints et paiement hybride */}
              <Card className="bg-emerald-500/5 border-emerald-500/20 mt-3 mb-3">
                <CardContent className="pt-5 space-y-3">
                  <p className="text-emerald-400 font-semibold text-sm">{"Profils eligibles au paiement hybride (VIXUpoints + Euros)"}</p>
                  <ul className="space-y-1.5 text-xs text-white/60">
                    <Bullet>{"Visiteur majeur : peut utiliser le paiement hybride (30% euros min + 70% VIXUpoints max)"}</Bullet>
                    <Bullet>{"Contribu-lecteur : peut utiliser le paiement hybride (gains inferieurs au Contributeur)"}</Bullet>
                    <Bullet>{"Auditeur : peut utiliser le paiement hybride (gains inferieurs au Contributeur)"}</Bullet>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-amber-500/5 border-amber-500/20 mt-3 mb-3">
                <CardContent className="pt-5 space-y-3">
                  <p className="text-amber-400 font-semibold text-sm">{"Visiteurs mineurs : achat en VIXUpoints uniquement"}</p>
                  <p className="text-white/60 text-xs leading-relaxed">
                    {"Les visiteurs mineurs (16-18 ans) sont les seuls a pouvoir acheter du contenu sur VIXUAL exclusivement avec des VIXUpoints. Ce systeme est tres encadre : plafond de 10 000 VIXUpoints, pas d'acces aux euros, pas de paiement hybride, pas de retrait d'argent."}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-rose-500/5 border-rose-500/20 mt-3 mb-3">
                <CardContent className="pt-5 space-y-3">
                  <p className="text-rose-400 font-semibold text-sm">{"Profils NON eligibles aux VIXUpoints et au paiement hybride"}</p>
                  <ul className="space-y-1.5 text-xs text-white/60">
                    <Bullet>{"Contributeur : remunere uniquement en euros via les gains classiques, ne cumule pas de VIXUpoints"}</Bullet>
                    <Bullet>{"Porteur : createur de contenu audiovisuel, remunere en euros, ne cumule pas de VIXUpoints"}</Bullet>
                    <Bullet>{"Infoporteur : createur de contenu litteraire, remunere en euros, ne cumule pas de VIXUpoints"}</Bullet>
                    <Bullet>{"Podcasteur : createur de podcast, remunere en euros, ne cumule pas de VIXUpoints"}</Bullet>
                  </ul>
                </CardContent>
              </Card>

              <div className="bg-slate-800/50 border border-white/10 rounded-lg p-3 mt-3">
                <p className="text-white/50 text-xs leading-relaxed">
                  {"Les VIXUpoints ne peuvent faire l'objet d'aucun transfert, cession, vente ou heritage. VIXUAL se reserve le droit de modifier le taux de conversion, les plafonds et les conditions d'utilisation des VIXUpoints avec un preavis de trente jours."}
                </p>
              </div>
            </Section>

            {/* Article 13 - Vixual Social */}
            <Section num={13} title={"Vixual Social \u2014 Mini-r\u00e9seau social int\u00e9gr\u00e9"} icon={MessageSquare}>
              <P>{"Vixual Social est une fonctionnalit\u00e9 communautaire int\u00e9gr\u00e9e \u00e0 VIXUAL, permettant aux utilisateurs inscrits de partager des avis (2\u202f000 caract\u00e8res max) sur les contenus et la plateforme. Deux vues sont disponibles : un fil global (tendances et discussions g\u00e9n\u00e9rales) et des discussions sous chaque contenu (vid\u00e9o, podcast, \u00e9crit)."}</P>

              <HighlightCard icon={MessageSquare} title={"R\u00e8gles de publication"} color="emerald">
                <ul className="space-y-1.5">
                  <Bullet>{"Posts en texte brut uniquement (2\u202f000 caract\u00e8res max). Aucun lien, image, vid\u00e9o ou HTML autoris\u00e9."}</Bullet>
                  <Bullet>{"Maximum 5 posts par jour et par utilisateur."}</Bullet>
                  <Bullet>{"De 1 \u00e0 3 tags obligatoires par post, choisis exclusivement parmi la liste d\u00e9finie par VIXUAL."}</Bullet>
                  <Bullet>{"R\u00e9ponses autoris\u00e9es (profondeur 1 max) : chaque post peut recevoir des r\u00e9ponses directes."}</Bullet>
                </ul>
              </HighlightCard>

              <HighlightCard icon={Hash} title={"Syst\u00e8me de tags pr\u00e9-approuv\u00e9s"} color="sky">
                <p>{"Les tags sont exclusivement cr\u00e9\u00e9s et g\u00e9r\u00e9s par VIXUAL. Aucun utilisateur ne peut cr\u00e9er de tag personnalis\u00e9. Les tags V1 sont organis\u00e9s en 3 cat\u00e9gories : Retours (avis, question, am\u00e9lioration, bug, id\u00e9e), Cr\u00e9ation (casting, sc\u00e9nario, son, montage) et Autre (investissement, spoiler)."}</p>
              </HighlightCard>

              <HighlightCard icon={Star} title={"Interactions et VIXUpoints (V1)"} color="amber">
                <p>{"Une r\u00e9action \u00ab\u202fJ'aime\u202f\u00bb (like) est disponible par post. En version V1, les VIXUpoints li\u00e9s \u00e0 Vixual Social sont temporairement d\u00e9sactiv\u00e9s pour garantir l'\u00e9quilibre du syst\u00e8me. Ils seront r\u00e9activ\u00e9s en V2 une fois la mod\u00e9ration et l'anti-spam stabilis\u00e9s."}</p>
              </HighlightCard>

              <HighlightCard icon={Shield} title={"Mod\u00e9ration"} color="red">
                <ul className="space-y-1.5">
                  <Bullet>{"Tout utilisateur peut signaler un post (1 signalement par post par utilisateur)."}</Bullet>
                  <Bullet>{"Un post atteignant 3 signalements est automatiquement masqu\u00e9 et soumis \u00e0 mod\u00e9ration."}</Bullet>
                  <Bullet>{"VIXUAL peut supprimer tout contenu et suspendre les comptes en infraction."}</Bullet>
                  <Bullet>{"Les signalements abusifs r\u00e9p\u00e9t\u00e9s peuvent entra\u00eener une suspension temporaire."}</Bullet>
                </ul>
              </HighlightCard>

              <P>{"En publiant sur Vixual Social, l'utilisateur accorde \u00e0 VIXUAL une licence non exclusive, gratuite et mondiale pour afficher et distribuer le contenu sur la plateforme. Vixual Social est soumis aux m\u00eames CGU, CGV et Politique de Confidentialit\u00e9 que l'ensemble de VIXUAL."}</P>
            </Section>

            {/* Article 14 */}
            <Section num={14} title="Interdictions et sanctions" icon={Ban}>
              <P>{"Sont strictement interdits sur VIXUAL :"}</P>
              <ul className="space-y-2 ml-1">
                <Bullet>{"La d\u00e9tention de plusieurs comptes (multi-comptes)"}</Bullet>
                <Bullet>{"Toute manipulation, artificielle ou concert\u00e9e, des votes et classements"}</Bullet>
                <Bullet>{"La diffusion de contenus illicites, contrefaits, diffamatoires, haineux ou portant atteinte aux droits des tiers"}</Bullet>
                <Bullet>{"Tout propos ou contenu raciste, homophobe, transphobe, antis\u00e9mite, anti-religieux, discriminatoire, insultant ou incitant \u00e0 la haine"}</Bullet>
                <Bullet>{"Tout harc\u00e8lement, menace, intimidation ou injure envers un autre utilisateur"}</Bullet>
                <Bullet>{"Toute tentative de fraude, de contournement des syst\u00e8mes de s\u00e9curit\u00e9 ou d'exploitation abusive de la plateforme"}</Bullet>
                <Bullet>{"L'auto-contribution : un utilisateur ne peut contribuer à son propre projet. Sanction : annulation, recalcul des votes, suspension possible"}</Bullet>
                <Bullet>{"Le partage, l'extraction ou le contournement des jetons d'acc\u00e8s aux m\u00e9dias prot\u00e9g\u00e9s"}</Bullet>
              </ul>
              <P>{"Chaque utilisateur inscrit dispose d'un Bouton Rouge de Signalement (Bouton Rouge Alerte) sur chaque contenu, commentaire et profil. Les signalements sont trait\u00e9s par l'\u00e9quipe de mod\u00e9ration VIXUAL sous quarante-huit heures (vingt-quatre heures pour les signalements critiques). Les d\u00e9cisions incluent : avertissement, suppression du contenu, suspension temporaire (sept \u00e0 quatre-vingt-dix jours), suspension d\u00e9finitive et suppression du compte."}</P>
              <P>{"En cas de manquement constat\u00e9, VIXUAL se r\u00e9serve le droit de suspendre ou supprimer le compte de l'utilisateur, de retenir la caution, de geler les fonds, et le cas \u00e9ch\u00e9ant d'engager toute action en justice."}</P>
            </Section>

            {/* Article 15 */}
            <Section num={15} title={"Propriété intellectuelle"} icon={Award}>
              <P>{"Les cr\u00e9ateurs de contenus diffus\u00e9s sur VIXUAL conservent l'int\u00e9gralit\u00e9 de leurs droits de propri\u00e9t\u00e9 intellectuelle sur leurs \u0153uvres."}</P>
              <P>{"En publiant un contenu sur VIXUAL, le cr\u00e9ateur accorde \u00e0 la plateforme une licence non exclusive, mondiale et r\u00e9vocable, pour les besoins de la diffusion, de la promotion et du fonctionnement du service (affichage, streaming, extraits promotionnels)."}</P>
              <P>{"Avant toute publication, le cr\u00e9ateur doit remplir un formulaire de d\u00e9claration obligatoire : \u00ab\u00a0Je certifie \u00eatre titulaire des droits sur l'\u0153uvre d\u00e9pos\u00e9e.\u00a0\u00bb En cas de fausse d\u00e9claration : blocage du compte, gel des fonds associ\u00e9s, action judiciaire possible."}</P>
              <P>{"L'utilisateur autorise VIXUAL \u00e0 diffuser des extraits promotionnels de ses contenus via les comptes officiels de VIXUAL sur les r\u00e9seaux sociaux. Cette autorisation est r\u00e9vocable \u00e0 tout moment depuis les param\u00e8tres du contenu."}</P>
              <P>{"VIXUAL ne pourra \u00eatre tenu responsable en cas de contrefa\u00e7on commise par un utilisateur."}</P>
            </Section>

            {/* Article 16 */}
            <Section num={16} title={"Responsabilité de VIXUAL"} icon={Shield}>
              <P>{"VIXUAL agit en qualité d'intermédiaire technique et d'hébergeur au sens de la loi pour la confiance dans l'économie numérique (LCEN) et du règlement européen sur les services numériques (DSA)."}</P>
              <ul className="space-y-2 ml-1">
                <Bullet>{"VIXUAL n'exerce aucun contrôle éditorial préalable sur les contenus publiés par les utilisateurs"}</Bullet>
                <Bullet>{"VIXUAL met en œuvre un système de signalement permettant de retirer tout contenu manifestement illicite dans les meilleurs délais"}</Bullet>
                <Bullet>{"La responsabilité de VIXUAL est limitée aux fautes directes et prouvées qui lui sont exclusivement imputables"}</Bullet>
                <Bullet>{"VIXUAL ne saurait être tenu responsable des pertes financières résultant des participations des utilisateurs, du comportement de tiers ou de toute interruption du service indépendante de sa volonté"}</Bullet>
              </ul>
            </Section>

            {/* Article 17 */}
            <Section num={17} title={"Données personnelles"} icon={Lock}>
              <P>{"Le traitement des données personnelles des utilisateurs est régi par la Politique de Confidentialité de VIXUAL, accessible à tout moment depuis la plateforme."}</P>
              <P>{"VIXUAL s'engage à traiter les données personnelles conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679), à la loi Informatique et Libertés du 6 janvier 1978 modifiée, et à toute réglementation applicable en matière de protection des données."}</P>
              <div className="mt-3">
                <Link href="/legal/privacy" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm transition-colors">
                  <FileText className="h-4 w-4" />
                  {"Consulter la Politique de Confidentialité"}
                </Link>
              </div>
            </Section>

            {/* Article 18 - Mineurs */}
            <Section num={18} title={"Dispositions sp\u00e9cifiques \u2014 Utilisateurs mineurs (16\u201317 ans)"} icon={ShieldCheck}>
              <Card className="bg-amber-500/5 border-amber-500/15">
                <CardContent className="pt-6 space-y-4">
                  <P>{"L'inscription sur VIXUAL est autoris\u00e9e aux mineurs \u00e2g\u00e9s de 16 \u00e0 17 ans inclus, sous r\u00e9serve d'une autorisation expresse du repr\u00e9sentant l\u00e9gal et de la validation des CGU/CGV par ce dernier."}</P>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                      <p className="text-emerald-400 font-medium text-sm mb-2">{"Ce que le mineur peut faire"}</p>
                      <ul className="space-y-1.5 text-white/60 text-xs">
                        <li className="flex gap-2 items-start"><CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>{"Acc\u00e9der aux contenus gratuits"}</span></li>
                        <li className="flex gap-2 items-start"><CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>{"Cumuler des VIXUpoints (max 10 000 pts = 100\u20ac)"}</span></li>
                        <li className="flex gap-2 items-start"><CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>{"Participer aux missions et interactions"}</span></li>
                      </ul>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
                      <p className="text-red-400 font-medium text-sm mb-2">{"Ce qui est interdit avant 18 ans"}</p>
                      <ul className="space-y-1.5 text-white/60 text-xs">
                        <li className="flex gap-2 items-start"><Lock className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" /><span>{"Contribuer sur la plateforme"}</span></li>
                        <li className="flex gap-2 items-start"><Lock className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" /><span>{"Retirer ou convertir des VIXUpoints en euros"}</span></li>
                        <li className="flex gap-2 items-start"><Lock className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" /><span>{"Verser une caution ou acc\u00e9der aux r\u00f4les payants"}</span></li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-teal-400" />
                      <p className="text-white font-medium text-sm">{"\u00c0 la majorit\u00e9 (18 ans)"}</p>
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed">
                      {"Apr\u00e8s v\u00e9rification d'identit\u00e9 (KYC), le mineur devenu majeur peut convertir ses VIXUpoints en cr\u00e9dit interne, contribuer aux projets, et effectuer des retraits via Stripe Connect. Le plafond est automatiquement lev\u00e9."}
                    </p>
                  </div>

                  <div className="bg-slate-800/30 border border-white/5 rounded-lg p-3">
                    <p className="text-white/40 text-xs leading-relaxed">
                      {"Les VIXUpoints accumul\u00e9s par un mineur sont un avantage promotionnel interne. Ils ne constituent pas une cr\u00e9ance financi\u00e8re exigible. VIXUAL se r\u00e9serve le droit de suspendre tout compte en cas de fausse d\u00e9claration d'\u00e2ge ou d'absence de consentement parental."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Section>

            {/* Article 16 */}
            <Section num={16} title="Droit applicable" icon={Scale}>
              <P>{"Le droit applicable aux pr\u00e9sentes CGV sera celui du pays d'\u00e9tablissement officiel de VIXUAL lors de sa mise en ligne d\u00e9finitive. En attendant, le droit fran\u00e7ais s'applique \u00e0 titre indicatif."}</P>
              <P>{"En cas de litige, les parties s'engagent \u00e0 rechercher une solution amiable dans un d\u00e9lai de trente jours avant toute action judiciaire."}</P>
              <P>{"\u00c0 d\u00e9faut d'accord amiable, les juridictions comp\u00e9tentes du ressort du si\u00e8ge social de VIXUAL seront saisies, sauf disposition l\u00e9gale imp\u00e9rative contraire au b\u00e9n\u00e9fice du consommateur."}</P>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <HighlightCard icon={Handshake} title={"Médiation"} color="emerald">
                  <p>{"Conformément aux articles L.611-1 et suivants du Code de la consommation, l'utilisateur peut recourir gratuitement au service de médiation de la consommation."}</p>
                </HighlightCard>
                <HighlightCard icon={Globe} title={"Plateforme européenne"} color="sky">
                  <p>{"Plateforme de résolution des litiges en ligne de la Commission européenne : "}<a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">{"ec.europa.eu/consumers/odr"}</a></p>
                </HighlightCard>
              </div>
            </Section>

          </div>

          {/* Signature */}
          <Card className="bg-slate-900/40 border-white/10 mt-12">
            <CardContent className="p-6 text-center">
              <p className="text-white/40 text-sm mb-2">
{"Version Provisoire Internationale \u2013 Consolidation V1 \u2013 27 f\u00e9vrier 2026"}
              </p>
              <p className="text-white/30 text-xs">
                {"VIXUAL se réserve le droit de modifier les présentes CGV à tout moment. Les utilisateurs seront informés de toute modification substantielle par notification sur la plateforme. La poursuite de l'utilisation des services après modification vaut acceptation des nouvelles conditions."}
              </p>
            </CardContent>
          </Card>

        </div>
      </main>

      <Footer />
    </div>
  )
}
