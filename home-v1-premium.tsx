# 🎬 PATCH V1 PREMIUM — Style Apple TV+ Minimaliste

**Date** : 1er juin 2026  
**Cible** : VIXUAL — Refonte complète de la V1 visiteurs publics  
**Stratégie** : Interface ultra-épurée, compréhension en 20-30 secondes  
**Référence visuelle** : Apple TV+ homepage  
**Auteur** : Claude (Anthropic) pour Jocelyn (PATRON VIXUAL)

---

## RÈGLES STRICTES DU PATCH (TOKEN ECONOMY)

1. **AUCUNE nouvelle dépendance npm** — utilise uniquement les packages déjà installés
2. **AUCUNE modification** de `home-v2-preserved.tsx` (la V2 doit rester intacte)
3. **AUCUNE modification** de `app/page.tsx` (le routing reste identique)
4. **2 opérations exactement** :
   - Opération 1 : Créer `components/home/home-v1-premium.tsx` (nouveau fichier)
   - Opération 2 : Modifier `components/home/home-v1-hbo-dark.tsx` (pointe vers V1Premium au lieu de HomeV2Preserved)
5. **Vérification finale obligatoire** : `npx tsc --noEmit` doit retourner 0 erreur
6. **Phrase de confirmation finale unique** : "✅ Patch V1 Premium applique avec succes. 0 erreur TypeScript."

---

## OPÉRATION 1 — CRÉER `components/home/home-v1-premium.tsx`

**Action** : Créer ce fichier neuf à l'emplacement exact `components/home/home-v1-premium.tsx`.

**Contenu exact à coller** :

```tsx
/**
 * VIXUAL — Home V1 Premium (Style Apple TV+ minimaliste)
 *
 * Interface ultra-épurée pour les VISITEURS PUBLICS non-connectés.
 * Objectif : compréhension du concept VIXUAL en 20-30 secondes.
 *
 * Architecture en 4 sections :
 *   1. Hero immersif simple — accroche + CTA primaire
 *   2. Trois concepts minimalistes — Vos contenus / Soutenez / Créateurs
 *   3. Teaser visuel — 5 affiches statiques pour montrer le catalogue
 *   4. CTA final — Rejoindre l'aventure → Ouvrir mon compte
 *
 * Differences vs V2 (HBO Dark) :
 *   - Pas de carrousels multiples
 *   - Pas d'onglets V2 (Dashboard, Trust Score, etc.)
 *   - Pas de section Savoir & Culture
 *   - Pas de badges complexes
 *   - Typographie large, espaces blancs généreux
 *   - Accent UNIQUE : fuchsia VIXUAL sur fond noir profond
 */
"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Film, Heart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"
import { V1_SECTIONS } from "@/lib/mock-data-v1"

// 5 affiches de teaser : 3 films + 1 podcast + 1 livre (un par univers)
const TEASER_ITEMS = [
  V1_SECTIONS[0]?.items[0],
  V1_SECTIONS[0]?.items[1],
  V1_SECTIONS[1]?.items[0],
  V1_SECTIONS[2]?.items[0],
  V1_SECTIONS[0]?.items[2],
].filter(Boolean)

export function HomeV1Premium() {
  return (
    <div className="min-h-screen bg-black text-white">
      <VisualHeader />

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — HERO MINIMALISTE                                      */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6 overflow-hidden">
        {/* Gradient subtil noir profond → fuchsia tres leger */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(217, 70, 239, 0.08) 0%, rgba(0, 0, 0, 0) 60%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Accroche principale — typographie XXL Apple TV+ */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8">
            Films, podcasts, écrits
            <br />
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-fuchsia-500 bg-clip-text text-transparent">
              soutenus par vous
            </span>
          </h1>

          {/* Sous-ligne discrete avec le slogan */}
          <p className="text-base md:text-lg text-white/50 mb-12 tracking-wide font-light">
            Regarde — Soutiens — Participe
          </p>

          {/* CTA principal unique */}
          <Link href="/explore">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90 px-10 h-14 text-lg font-semibold rounded-full transition-all hover:scale-105"
            >
              Découvrir VIXUAL
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — TROIS CONCEPTS MINIMALISTES                           */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Carte 1 — Vos contenus */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-fuchsia-500/40 transition-all">
                <Film className="h-7 w-7 text-fuchsia-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 tracking-tight">
                Vos films, vos podcasts, vos écrits
              </h3>
              <p className="text-white/50 text-sm md:text-base leading-relaxed font-light">
                Une plateforme dédiée à la création indépendante française.
              </p>
            </div>

            {/* Carte 2 — Soutien recompense */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-fuchsia-500/40 transition-all">
                <Heart className="h-7 w-7 text-fuchsia-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 tracking-tight">
                Soutenez les créateurs et soyez récompensé
              </h3>
              <p className="text-white/50 text-sm md:text-base leading-relaxed font-light">
                Contribuez aux projets, gagnez selon votre implication réelle.
              </p>
            </div>

            {/* Carte 3 — Createurs visibilite */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-fuchsia-500/40 transition-all">
                <Sparkles className="h-7 w-7 text-fuchsia-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 tracking-tight">
                Créateurs, gagnez en visibilité
              </h3>
              <p className="text-white/50 text-sm md:text-base leading-relaxed font-light">
                Publiez vos œuvres et trouvez votre public, sans intermédiaire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — TEASER VISUEL (grille statique 5 affiches)            */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
              Découvrez des créations exclusives
            </h2>
            <p className="text-white/40 text-base md:text-lg font-light">
              Un aperçu de ce qui vous attend sur VIXUAL
            </p>
          </div>

          {/* Grille statique de 5 affiches — sans carousel pour rester minimaliste */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            {TEASER_ITEMS.map((item, idx) => (
              <Link
                key={item?.id ?? `teaser-${idx}`}
                href="/explore"
                className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] group hover:border-white/20 transition-all"
              >
                {item?.thumbnail && (
                  <Image
                    src={item.thumbnail}
                    alt={item.title ?? "Création VIXUAL"}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                )}
                {/* Voile sombre pour lisibilité du titre */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent" />
                {/* Titre en bas */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-medium truncate">
                    {item?.title ?? "Création VIXUAL"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — CTA FINAL                                             */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 border-t border-white/[0.06] relative overflow-hidden">
        {/* Subtile aurore fuchsia en arriere-plan */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center bottom, rgba(217, 70, 239, 0.12) 0%, rgba(0, 0, 0, 0) 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Rejoindre l'aventure
          </h2>
          <p className="text-white/50 text-lg md:text-xl mb-12 font-light leading-relaxed">
            Créez votre compte gratuitement et commencez à explorer,<br className="hidden md:block" />
            soutenir et créer dès aujourd'hui.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-12 h-14 text-lg font-semibold rounded-full transition-all hover:scale-105"
              style={{
                boxShadow:
                  "0 12px 40px -8px rgba(217, 70, 239, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.08) inset",
              }}
            >
              Ouvrir mon compte
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-white/30 text-sm mt-6 font-light">
            Gratuit · Sans engagement · Sans intermédiaire
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
```

---

## OPÉRATION 2 — MODIFIER `components/home/home-v1-hbo-dark.tsx`

**Action** : Remplacer le contenu complet du fichier `components/home/home-v1-hbo-dark.tsx` par ce nouveau contenu.

**Contenu exact à coller** (remplacement total) :

```tsx
/**
 * VIXUAL — Home V1 HBO Dark (Alias)
 *
 * Cet alias historique pointe désormais vers HomeV1Premium,
 * la nouvelle interface V1 simplifiée style Apple TV+.
 *
 * Architecture finale (1er juin 2026) :
 *   - V1 (visiteurs publics) : HomeV1Premium — ultra-épurée Apple TV+
 *   - V2 (membres connectés) : HomeV2Preserved — HBO Dark streaming complet
 *   - V3 (admin/test futur) : interface cinematic standard (page.tsx default)
 *
 * Le nom "HboDark" est conservé pour ne pas casser l'import dans app/page.tsx.
 * A renommer plus tard en HomeV1 ou supprimer si on déplace l'import.
 */
"use client"

import { HomeV1Premium } from "./home-v1-premium"

export function HomeV1HboDark() {
  return <HomeV1Premium />
}
```

---

## VÉRIFICATION OBLIGATOIRE

À la fin du patch, exécuter exactement :

```bash
npx tsc --noEmit
```

Si la commande retourne **0 erreur**, le patch est réussi.

Si erreurs détectées :
1. Identifier le fichier en erreur
2. Vérifier que les imports sont corrects
3. Vérifier que `lib/mock-data-v1.ts` exporte bien `V1_SECTIONS`
4. NE PAS modifier d'autres fichiers que les 2 mentionnés ci-dessus

---

## PHRASE DE CONFIRMATION FINALE OBLIGATOIRE

Une fois le patch appliqué et `npx tsc --noEmit` retourné 0 erreur, écrire **UNIQUEMENT** cette phrase :

```
✅ Patch V1 Premium applique avec succes. 0 erreur TypeScript.
```

Aucune autre information, aucune description, aucun commentaire additionnel.

---

## NOTES POUR L'OPÉRATEUR HUMAIN (Jocelyn)

### Ce que ce patch fait

**Premier point** — Crée un nouveau composant `HomeV1Premium` ultra-épuré style Apple TV+.

**Deuxième point** — Redirige l'alias `HomeV1HboDark` (utilisé par `app/page.tsx`) vers ce nouveau composant.

**Troisième point** — La V2 (`HomeV2Preserved`) reste **strictement inchangée** et continue d'afficher l'interface HBO Dark complète.

**Quatrième point** — La V3 (rendu par défaut dans `app/page.tsx`) reste **strictement inchangée**.

### Ce que tu verras après application

**Sur V1 (visiteurs publics)** :
- Hero plein écran avec "Films, podcasts, écrits soutenus par vous" en très grande typographie
- 3 cartes minimalistes (Vos contenus / Soutenez / Créateurs)
- Grille de 5 affiches teaser (un échantillon des contenus)
- CTA final "Rejoindre l'aventure" avec bouton fuchsia

**Sur V2 (membres connectés)** :
- Interface HBO Dark inchangée (carrousels Films/Podcasts/Littérature, Savoir & Culture, etc.)

**Sur V3 (admin/test)** :
- Interface cinematic standard inchangée

### Comportement responsive

- **Desktop** : 3 cartes en ligne, grille 5 affiches en ligne, titres XL
- **Tablette** : 3 cartes en colonne, grille 5 affiches en ligne, titres L
- **Mobile** : 1 carte par ligne, grille 2 affiches par ligne, titres M

### Performance

- Toutes les images en `loading="lazy"`
- Aucune animation lourde (juste hover scale subtil)
- Aucune dépendance externe ajoutée
