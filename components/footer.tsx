"use client"

import Link from "next/link"
import { VisualSlogan } from "@/components/vixual-slogan"
import { VixualLogo } from "@/components/vixual-logo"
import { Phone, Mail, MapPin, Users, MessageCircle, Lock, Heart } from "lucide-react"
import { usePlatformVersion } from "@/hooks/use-platform-version"

export function Footer() {
  const platformVersion = usePlatformVersion()

  return (
    <footer className="bg-slate-950 border-t border-white/10 cinema-footer relative z-10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <VixualLogo size="md" />
            </Link>
            <div className="mb-3">
              <VisualSlogan size="xs" opacity="medium" />
            </div>
            <p className="text-white/60 max-w-md leading-relaxed">
              {"VIXUAL permet de soutenir des createurs et de decouvrir des projets originaux : films, podcasts, documentaires, livres et contenus independants."}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/explore" className="text-white/60 hover:text-emerald-400 transition-colors">
                  Explorer
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-white/60 hover:text-emerald-400 transition-colors">
                  Comment ca marche
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/60 hover:text-emerald-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-white/60 hover:text-emerald-400 transition-colors">
                  Classements TOP 10/100/500
                </Link>
              </li>
              <li>
                <Link href="/guide-profiles" className="text-white/60 hover:text-emerald-400 transition-colors">
                  {platformVersion === "V1" ? "Guide des 4 profils" : "Guide des 8 profils"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Vixual Social - V3 uniquement */}
          {platformVersion === "V3" && (
            <div>
              <h4 className="text-white font-semibold mb-4">Vixual Social</h4>
              <Link
                href="/social"
                className="inline-flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Acceder a Vixual Social
              </Link>
            </div>
          )}

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/terms" className="text-white/60 hover:text-emerald-400 transition-colors text-sm">
                  Conditions d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-white/60 hover:text-emerald-400 transition-colors text-sm">
                  Politique de confidentialite
                </Link>
              </li>
              <li>
                <Link href="/legal/cgv" className="text-white/60 hover:text-emerald-400 transition-colors text-sm">
                  CGV
                </Link>
              </li>
              {platformVersion !== "V1" && (
                <li>
                  <Link href="/soutien-libre" className="text-rose-400 hover:text-rose-300 transition-colors text-sm inline-flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    Soutenir un createur
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Nous contacter
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col gap-4">
          {/* Bandeau de confiance officiel VIXUAL */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-white/55 text-xs text-center">
            <span>Pas de hasard</span>
            <span className="text-white/25" aria-hidden>
              &bull;
            </span>
            <span>Regles transparentes</span>
            <span className="text-white/25" aria-hidden>
              &bull;
            </span>
            <span>Soutien reel aux createurs</span>
          </div>

          <p className="text-white/40 text-xs text-center md:text-left">
            Les VIXUpoints sont un systeme interne d&apos;avantages et de fidelite propre a VIXUAL.
            Ils ne constituent pas une monnaie electronique, un crypto-actif, ou une garantie de gain.
            Ils ne comptent jamais pour le classement TOP 100.
          </p>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              2026 VIXUAL. Tous droits reserves.
            </p>
            <span className="text-white/40 text-sm">
              Aucun gain n&apos;est garanti. Le soutien est avant tout une aide aux createurs.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
