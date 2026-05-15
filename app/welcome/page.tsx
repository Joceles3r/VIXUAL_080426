import Link from "next/link"
import type { Metadata } from "next"
import { VixualLogo } from "@/components/vixual-logo"

export const metadata: Metadata = {
  title: "Bienvenue sur VIXUAL",
  description:
    "Deposez vos films, vos sons, vos ecrits ou soutenez ceux des Createurs. Rejoignez VIXUAL — streaming participatif independant.",
}

/**
 * Espace decouverte — affiche apres clic sur "Commencer gratuitement".
 *
 * Composition (PATCH SLOGAN ESPACE):
 *   Logo VIXUAL
 *   DEPOSEZ vos films, vos sons, vos ecrits        ← #F5F5F5
 *   Ou SOUTENEZ ceux des Createurs                 ← #A78BFA
 *   Creer un compte (CTA principal)
 *
 * Ambiance: cinema premium, fond noir profond #020203, glow violet/bleu discret.
 * Le slogan general VIXUAL "Regarde - Soutiens - Participe" reste inchange ailleurs.
 */
export default function WelcomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020203]">
      {/* Halo violet/bleu cinema discret en fond */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(167, 139, 250, 0.16) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 50% 80%, rgba(59, 130, 246, 0.12) 0%, transparent 60%)",
          filter: "blur(20px)",
        }}
      />

      {/* Grain leger pour texture pellicule */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        {/* Logo VIXUAL */}
        <div className="mb-12 md:mb-14">
          <VixualLogo size="xl" />
        </div>

        {/* Phrase officielle de l'espace decouverte */}
        <div className="mb-12 max-w-2xl text-center md:mb-14">
          <p
            className="text-balance text-2xl font-semibold leading-relaxed tracking-tight md:text-3xl md:leading-relaxed"
            style={{ color: "#F5F5F5" }}
          >
            DEPOSEZ vos films, vos sons, vos ecrits
          </p>
          <p
            className="mt-3 text-balance text-xl font-medium leading-relaxed tracking-tight md:mt-4 md:text-2xl md:leading-relaxed"
            style={{ color: "#A78BFA" }}
          >
            Ou SOUTENEZ ceux des Createurs
          </p>
        </div>

        {/* CTA Creer un compte */}
        <Link
          href="/signup"
          className="group relative inline-flex items-center justify-center rounded-full px-10 py-4 text-base font-bold tracking-wide text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl md:px-12 md:py-5 md:text-lg"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #ec4899 0%, #a855f7 50%, #3b82f6 100%)",
            boxShadow:
              "0 12px 32px -6px rgba(168, 85, 247, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
          }}
        >
          Creer un compte
        </Link>

        {/* Lien secondaire discret pour ceux qui ont deja un compte */}
        <p className="mt-8 text-sm text-white/55">
          Deja membre ?{" "}
          <Link
            href="/login"
            className="font-semibold text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Se connecter
          </Link>
        </p>

        {/* Retour discret vers l'accueil */}
        <Link
          href="/"
          className="mt-12 text-xs uppercase tracking-[0.2em] text-white/35 transition-colors hover:text-white/70"
        >
          Retour a l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
