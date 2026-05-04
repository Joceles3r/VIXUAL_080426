"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePlatformVersion } from "@/hooks/use-platform-version"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ArrowLeft, HelpCircle, ArrowRight } from "lucide-react"
import { TrafficLight } from "@/components/traffic-light"

const FAQ_CATEGORIES = [
  {
    title: "À propos de VIXUAL",
    items: [
      {
        question: "Qu'est-ce que VIXUAL?",
        answer: "VIXUAL est une plateforme de contribution participative dans les projets audiovisuels, littéraires et podcasts. Vous pouvez soutenir des créateurs, créer du contenu et potentiellement générer des revenus."
      },
      {
        question: "À qui s'adresse VIXUAL?",
        answer: "VIXUAL s'adresse à tous ceux qui désirent publier leurs contenus audios/visuels/audiovisuels, amateurs comme professionnels. Que vous soyez créateur souhaitant monétiser vos oeuvres, ou spectateur/lecteur/auditeur souhaitant soutenir des projets créatifs, VIXUAL est fait pour vous."
      },
      {
        question: "VIXUAL est-il un jeu de hasard?",
        answer: "Non, VIXUAL n'est pas un jeu de hasard. C'est une plateforme de contribution participative. Les retours dépendent du succès réel des projets et non du hasard. Les gains ne sont pas garantis."
      },
      {
        question: "Pourquoi 'Contribuer' et non 'Investir'?",
        answer: "Nous utilisons le terme 'contribution' pour clarifier que c'est une participation financière à des projets créatifs, et non un investissement boursier ou financier. Cela mieux reflète la nature participative de la plateforme."
      }
    ]
  },
  {
    title: "Les 8 profils",
    items: [
      {
        question: "Quels sont les 8 profils sur VIXUAL?",
        answer: "1) Invité: exploration gratuite. 2) Visiteur: accès complet + paiement hybride. 3) Porteur: créateur vidéo. 4) Infoporteur: créateur littéraire. 5) Podcasteur: créateur audio. 6) Contributeur: soutenant vidéos. 7) Contribu-lecteur: soutenant écrits. 8) Auditeur: soutenant podcasts."
      },
      {
        question: "Quelle est la différence entre Contributeur, Contribu-lecteur et Auditeur?",
        answer: "Ces 3 profils sont des contributeurs financiers, chacun spécialisé dans une catégorie: Contributeur pour les Films & Vidéos, Contribu-lecteur pour les Livres & Articles, Auditeur pour les Podcasts. Chacun peut contribuer de 2€ à 20€ par projet."
      },
      {
        question: "Puis-je changer de profil?",
        answer: "Oui! Vous pouvez évoluer de Visiteur vers n'importe quel autre profil à tout moment. Consultez votre tableau de bord pour effectuer cette transition."
      },
      {
        question: "Puis-je avoir plusieurs profils?",
        answer: "Oui, vous pouvez cumuler plusieurs rôles. Par exemple, être Porteur et Contributeur simultanément. Chaque rôle créateur a sa propre caution."
      }
    ]
  },
  {
    title: "Invité - Exploration gratuite",
    items: [
      {
        question: "Que puis-je faire en tant qu'Invité?",
        answer: "En tant qu'Invité, vous pouvez naviguer librement sur VIXUAL et consulter tous les contenus gratuits et les extraits. Aucune inscription obligatoire."
      },
      {
        question: "Quelles sont les limites du profil Invité?",
        answer: "L'Invité ne peut pas: utiliser le paiement hybride, participer à Vixual Social, gagner des VIXUpoints, accéder aux contenus payants intégralement, ou créer du contenu."
      },
      {
        question: "Dois-je m'inscrire?",
        answer: "Non, l'inscription n'est pas obligatoire pour explorer VIXUAL. Cependant, pour débloquer toutes les fonctionnalités (contributions, VIXUpoints, création), créez un compte gratuit en tant que Visiteur ou payant pour un autre profil."
      }
    ]
  },
  {
    title: "Visiteur - Accès complet",
    items: [
      {
        question: "Quels sont les avantages du profil Visiteur?",
        answer: "Accès à tous les contenus gratuits, paiement hybride (30% euros + 70% VIXUpoints), participation à Vixual Social, accumulation de VIXUpoints via interactions, limite max 2500 VIXUpoints remboursables en 25€."
      },
      {
        question: "Comment fonctionne le paiement hybride?",
        answer: "Vous payez 30% minimum en euros et jusqu'à 70% maximum en VIXUpoints. Par exemple, pour un contenu à 4€: vous pouvez payer 1,20€ + 280 VIXUpoints (au maximum autorisé)."
      },
      {
        question: "Quelle est la limite de VIXUpoints?",
        answer: "Maximum 2500 VIXUpoints en caisse. Une fois atteint, vous devez les échanger (2500 = 25€) ou les utiliser pour acheter du contenu. Vous ne pouvez pas en accumuler davantage sans changer de profil."
      }
    ]
  },
  {
    title: "Porteur / Infoporteur / Podcasteur - Créateurs",
    items: [
      {
        question: "Comment déposer mon contenu?",
        answer: "Accédez à votre tableau de bord créateur, cliquez sur 'Déposer un nouveau projet', remplissez la description, fixez le prix (2€ à 20€), importez votre contenu et publiez-le. Le contenu sera soumis à validation."
      },
      {
        question: "Comment gagnent les créateurs?",
        answer: "Les gains proviennent des contributions des utilisateurs. Si votre projet est dans le TOP 10 sur 100, vous recevez une part des royalties (de 7% à 40% selon votre classement). Les gains sont versés le 1er du mois suivant."
      },
      {
        question: "Quel prix fixer pour mon projet?",
        answer: "Le prix minimum est 2€ et le maximum 20€. Vous pouvez fixer le prix que vous souhaitez dans cette gamme. Consultez les projets similaires pour calibrer."
      },
      {
        question: "Puis-je acheter mon propre contenu?",
        answer: "Non, pour maintenir l'intégrité du système, les créateurs ne peuvent pas acheter ou contribuer à leur propre contenu."
      }
    ]
  },
  {
    title: "Contributeur - Films & Vidéos",
    items: [
      {
        question: "Qu'est-ce qu'un Contributeur?",
        answer: "Un Contributeur soutient des projets audiovisuels (Films & Vidéos) en y contribuant de 2€ à 20€. Vous participez au succès du projet et potentiellement aux gains si vous êtes classé TOP 10 ou 11-100."
      },
      {
        question: "Comment gagner en tant que Contributeur?",
        answer: "Vous gagnez si votre classement (basé sur le nombre de contributions/votes) vous place dans le TOP 10 (40% des gains) ou 11-100 (7% des gains). Les gains sont versés le 1er du mois suivant."
      },
      {
        question: "Combien puis-je contribuer par projet?",
        answer: "Entre 2€ et 20€ par projet vidéo. Vous pouvez contribuer à autant de projets que vous le souhaitez."
      }
    ]
  },
  {
    title: "Contribu-lecteur - Livres & Articles",
    items: [
      {
        question: "Qu'est-ce qu'un Contribu-lecteur?",
        answer: "Un Contribu-lecteur soutient des projets littéraires (Livres & Articles) en y contribuant de 2€ à 20€. Vous participez au succès des auteurs et potentiellement aux gains selon votre classement."
      },
      {
        question: "Comment gagner en tant que Contribu-lecteur?",
        answer: "Même principe que le Contributeur: TOP 10 reçoit 40% des gains, rangs 11-100 reçoivent 7%. Les gains du pot mensuel Livres sont versés le 1er du mois."
      },
      {
        question: "Quelle est la différence avec le Contributeur?",
        answer: "Le Contribu-lecteur est spécialisé dans les contenus écrits (Livres & Articles), tandis que le Contributeur soutient les Films & Vidéos. Les mécaniques de gains sont similaires mais appliquées à différentes catégories."
      }
    ]
  },
  {
    title: "Auditeur - Podcasts",
    items: [
      {
        question: "Qu'est-ce qu'un Auditeur?",
        answer: "Un Auditeur soutient des Podcasts en y contribuant de 2€ à 20€. Vous participez au succès des podcasteurs et potentiellement aux gains selon votre classement dans le pot mensuel Podcasts."
      },
      {
        question: "Comment gagner en tant qu'Auditeur?",
        answer: "Même principe: TOP 10 reçoit 40%, rangs 11-100 reçoivent 7%. Le pot mensuel Podcasts est distribué le 1er du mois."
      },
      {
        question: "Puis-je utiliser le paiement hybride?",
        answer: "Seuls les visiteurs majeurs/contribu-lecteurs et auditeurs (rapport/gains moins eleves que contributeur) peuvent beneficier du paiement hybride (VIXUpoints + euros). Les visiteurs mineurs sont les seuls autorises a pouvoir acheter du contenu sur VIXUAL avec des VIXUpoints (systeme tres encadre). Le contributeur/porteur/infoporteur/podcasteur ne beneficie pas des VIXUpoints et du paiement hybride."
      }
    ]
  },
  {
    title: "VIXUpoints et Paiement hybride",
    items: [
      {
        question: "Que sont les VIXUpoints?",
        answer: "Les VIXUpoints sont des points de participation attribues pour votre activite positive sur VIXUAL. Conversion: 100 VIXUpoints = 1 EUR. Ils permettent d'acceder a des contenus et d'encourager la participation communautaire. Ce ne sont PAS une monnaie ni un produit financier."
      },
      {
        question: "Comment gagner des VIXUpoints?",
        answer: "Visionner un extrait (+5 pts), visionner un contenu complet (+15 pts), commentaire utile (+5 pts), commentaire apprecie (+10 pts), partage de contenu (+10 pts), inscription via partage (+40 pts). Limites: max 100 pts/jour, max 500 pts/semaine."
      },
      {
        question: "Quels profils peuvent utiliser les VIXUpoints?",
        answer: "Visiteurs majeurs, Contribu-lecteurs et Auditeurs peuvent utiliser les VIXUpoints ET le paiement hybride. Les Visiteurs mineurs peuvent UNIQUEMENT utiliser les VIXUpoints. Les Contributeurs, Porteurs, Infoporteurs et Podcasteurs ne beneficient PAS des VIXUpoints."
      },
      {
        question: "Qu'est-ce que le paiement hybride?",
        answer: "Le paiement hybride permet de payer un contenu avec VIXUpoints + Euros. Exemple pour 3 EUR: soit 3 EUR, soit 200 pts + 1 EUR, soit 100 pts + 2 EUR. Le systeme calcule automatiquement la meilleure combinaison."
      },
      {
        question: "Quelles sont les limites des VIXUpoints?",
        answer: "Plafond visiteur mineur: 10 000 VIXUpoints. Plafond visiteur majeur: 2 500 VIXUpoints. Maximum 100 pts/jour, 500 pts/semaine. Les VIXUpoints obtenus frauduleusement peuvent etre supprimes."
      },
      {
        question: "Les visiteurs mineurs peuvent-ils utiliser de l'argent?",
        answer: "Non. Les visiteurs mineurs peuvent UNIQUEMENT utiliser leurs VIXUpoints pour acceder aux contenus. Ils ne peuvent pas payer en euros, ni utiliser le paiement hybride, ni retirer d'argent."
      },
      {
        question: "Qu'est-ce que les micro-packs VIXUpoints?",
        answer: "Les micro-packs permettent d'acheter des VIXUpoints avec un bonus inclus. 4 packs disponibles: Micro (5 EUR = 550 pts, +10%), Starter (10 EUR = 1150 pts, +15%), Creator (20 EUR = 2400 pts, +20%), Community (50 EUR = 6500 pts, +30%)."
      },
      {
        question: "Qui peut acheter des micro-packs?",
        answer: "Les Visiteurs (majeurs et mineurs), Contribu-lecteurs et Auditeurs peuvent acheter des micro-packs. Les Contributeurs ne peuvent PAS acheter de micro-packs car ils utilisent uniquement des euros. Les mineurs sont limites a 2 achats par mois."
      }
    ]
  },
  {
    title: "Caution et Sécurité",
    items: [
      {
        question: "Qu'est-ce que la caution?",
        answer: "La caution est un dépôt unique (10€ pour créateurs, 20€ pour contributeurs) qui garantit votre engagement. Elle est entièrement remboursable en cas de résiliation."
      },
      {
        question: "La caution est-elle vraiment remboursable?",
        answer: "Oui, si vous résiliez votre compte en respectant les conditions d'utilisation, votre caution vous sera remboursée intégralement sur votre compte."
      },
      {
        question: "Comment retirer mes gains?",
        answer: "Vos gains sont consultables dans votre Wallet. Pour retirer, connectez votre compte Stripe Connect. Les retraits sont traités chaque semaine."
      },
      {
        question: "Quels moyens de paiement acceptez-vous?",
        answer: "Nous acceptons les cartes bancaires (Visa, Mastercard) via Stripe, notre partenaire de paiement sécurisé."
      }
    ]
  },
  {
    title: "Compte et Données",
    items: [
      {
        question: "Comment créer un compte?",
        answer: "Cliquez sur 'S'inscrire', remplissez vos informations (email, mot de passe, nom complet), acceptez les conditions et confirmez votre email. C'est gratuit et instantané!"
      },
      {
        question: "Comment supprimer mon compte?",
        answer: "Allez dans Paramètres > Gestion du compte > Supprimer mon compte. Attention: cette action est irréversible et supprime toutes vos données."
      },
      {
        question: "Mes données sont-elles sécurisées?",
        answer: "Oui! VIXUAL utilise le chiffrement SSL, des serveurs sécurisés et respecte la protection des données (RGPD). Consultez notre politique de confidentialité pour plus d'informations."
      }
    ]
  },
  {
    title: "Utilisateur Actif - Suivi et Gains",
    items: [
      {
        question: "Quand vois-je mes gains?",
        answer: "Vos gains apparaissent dans votre Wallet apres le calcul de fin de periode (1er de chaque mois). Les gains sont bases sur le classement final des projets soutenus et votre position parmi les participants."
      },
      {
        question: "Que se passe-t-il si mon projet n'est pas TOP 10?",
        answer: "Si le projet que vous soutenez n'atteint pas le TOP 10, vous ne percevez pas de gains sur ce projet. Votre contribution reste acquise au createur. Seuls les participants des projets TOP 10 recoivent une part des royalties."
      },
      {
        question: "Comment suivre mes contributions?",
        answer: "Rendez-vous dans Dashboard > Mes Contributions pour voir la liste de tous vos projets soutenus, leur statut actuel, le classement en temps reel et vos gains potentiels estimes."
      },
      {
        question: "Quand puis-je retirer mon argent?",
        answer: "Les retraits sont possibles des que votre solde disponible atteint le seuil minimum (5 EUR). Connectez votre compte Stripe Connect pour recevoir vos paiements. Les virements sont traites chaque semaine."
      },
      {
        question: "Pourquoi se specialiser dans une categorie?",
        answer: "En vous concentrant sur une categorie (Films, Ecrits ou Podcasts), vos contributions sont plus ciblees, votre comprehension des projets est meilleure et votre impact sur le classement est renforce. Cela augmente vos chances de gains."
      }
    ]
  }
]

// Sections masquees en V1 (concepts trop avances pour le lancement)
const V1_HIDDEN_FAQ_TITLES = new Set<string>([
  "Porteur / Infoporteur / Podcasteur - Créateurs",
  "Contribu-lecteur - Livres & Articles",
  "Auditeur - Podcasts",
  "VIXUpoints et Paiement hybride",
  "Utilisateur Actif - Suivi et Gains",
])

// Sections masquees en V2 (reservees V3)
const V2_HIDDEN_FAQ_TITLES = new Set<string>([
  "Utilisateur Actif - Suivi et Gains",
])

function getFaqSectionsForVersion(version: "V1" | "V2" | "V3") {
  if (version === "V1") {
    return FAQ_CATEGORIES.filter(s => !V1_HIDDEN_FAQ_TITLES.has(s.title))
  }
  if (version === "V2") {
    return FAQ_CATEGORIES.filter(s => !V2_HIDDEN_FAQ_TITLES.has(s.title))
  }
  return FAQ_CATEGORIES
}

export default function FAQPage() {
  const router = useRouter()
  const platformVersion = usePlatformVersion()
  const visibleSections = getFaqSectionsForVersion(platformVersion)

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Questions Fréquentes</h1>
              <p className="text-sm text-slate-500">Trouvez les réponses à vos questions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-4">
            <TrafficLight size="md" />
            <h2 className="text-3xl md:text-4xl font-bold">Questions fréquentes</h2>
            <TrafficLight size="md" />
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {platformVersion === "V1"
              ? "Parcourez nos sections pour trouver les reponses a vos questions sur VIXUAL et ses 4 profils essentiels."
              : "Parcourez nos sections pour trouver les reponses a vos questions sur VIXUAL et ses 8 profils (1 Invite non inscrit + 7 inscrits)."}
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {visibleSections.map((category, idx) => (
            <Card key={idx} className="bg-slate-800/30 border-slate-700/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-emerald-300 mb-4">
                  {platformVersion === "V1" && category.title === "Les 8 profils"
                    ? "Les 4 profils (phase 1)"
                    : category.title}
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.items.map((item, qIdx) => (
                    <AccordionItem key={qIdx} value={`${idx}-${qIdx}`} className="border-slate-700/50">
                      <AccordionTrigger className="text-white hover:text-emerald-300 transition-colors">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-400">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="mt-12 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-teal-500/30">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-3">Besoin d'aide?</h3>
            <p className="text-slate-400 mb-6">
              Consultez notre guide complet des profils ou contactez notre support.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/guide-profiles">
                <Button className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                  Guide des profils
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/support/mailbox">
                <Button variant="outline" className="border-slate-600 hover:bg-slate-800 w-full sm:w-auto">
                  Contacter le support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
