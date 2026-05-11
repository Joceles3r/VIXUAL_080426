"use client"

import Link from "next/link"
import {
  ArrowRight,
  Eye,
  Heart,
  Compass,
  LogIn,
  ChevronRight,
  Scale,
  Sparkles,
  Lock,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VisualHeader } from "@/components/vixual-header"
import { Footer } from "@/components/footer"
import { VisualSlogan } from "@/components/vixual-slogan"
import { TrafficLight } from "@/components/traffic-light"
import { useAuth } from "@/lib/auth-context"

/**
 * English version of HomeV1.
 *
 * Notes:
 *  - Slogan "Regarde, Soutiens, Participe" is kept in French as the brand
 *    signature (identity preservation, similar to Apple / Hermès practice).
 *  - The full app remains in French. This page is a marketing entry point
 *    for English-speaking visitors discovering VIXUAL.
 *  - All authenticated areas (sign-up, dashboard, payments) redirect to the
 *    French interface — clearly stated in the banner below.
 */
export function HomeV1En() {
  const { isAuthed } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950">
      <VisualHeader />

      <main>
        {/* Banner — clear notice about the French interface */}
        <div className="bg-amber-500/10 border-b border-amber-500/30 py-2.5 px-4">
          <div className="container mx-auto flex items-center justify-center gap-2 text-amber-200 text-xs md:text-sm text-center">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>
              VIXUAL is currently launched in French. The full English experience is coming with our international expansion.
              Sign-up will redirect you to the French interface.
            </span>
          </div>
        </div>

        {/* HERO */}
        <section className="vx-cinema-hero relative pt-24 pb-24">
          <div className="vx-orb-bg" aria-hidden="true" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,1,24,0) 0%, rgba(10,1,24,0.35) 65%, rgba(10,1,24,0.85) 100%)",
            }}
            aria-hidden="true"
          />

          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex justify-center mb-7 vx-rise-in">
                <span className="vx-pill">
                  <Sparkles className="h-3 w-3" />
                  Premium creative streaming
                </span>
              </div>

              <div className="flex items-center justify-center gap-4 mb-6 vx-rise-in vx-rise-in--delay-1">
                <TrafficLight size="lg" className="hidden sm:flex" />
                <h1 className="text-5xl md:text-7xl font-bold text-white text-balance leading-[1.05] vx-text-glow">
                  Watch{" "}
                  <span className="text-white/35 font-light">&middot;</span>{" "}
                  <span
                    className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-200 via-fuchsia-300 to-purple-300"
                    style={{
                      filter: "drop-shadow(0 0 18px rgba(217, 70, 239, 0.45))",
                    }}
                  >
                    Support
                  </span>{" "}
                  <span className="text-white/35 font-light">&middot;</span>{" "}
                  Take part
                </h1>
                <TrafficLight size="lg" className="hidden sm:flex" />
              </div>

              {/* Slogan FR conservé comme signature de marque + tooltip EN */}
              <div className="mb-5 vx-rise-in vx-rise-in--delay-2" title="Watch · Support · Take part">
                <VisualSlogan size="base" opacity="high" withLines />
              </div>

              <p className="text-lg md:text-xl text-white/90 mb-4 max-w-3xl mx-auto text-pretty leading-relaxed vx-rise-in vx-rise-in--delay-2">
                <span className="text-white font-semibold">VIXUAL</span>{" "}
                <span className="text-white/70">:</span> the platform where you{" "}
                <span className="text-fuchsia-200 font-medium">discover</span>{" "}
                and{" "}
                <span className="text-fuchsia-200 font-medium">directly support</span>{" "}
                the independent creators you love.
                <span className="block mt-2 text-white/60 text-base md:text-lg italic">
                  No middlemen.
                </span>
              </p>

              <p className="text-sm text-white/45 mb-10 max-w-2xl mx-auto vx-rise-in vx-rise-in--delay-3 tracking-wide">
                Films <span className="text-white/25">&middot;</span> Podcasts{" "}
                <span className="text-white/25">&middot;</span> Books{" "}
                <span className="text-white/25">&middot;</span> Original creations
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-7 vx-rise-in vx-rise-in--delay-4">
                <Link href="/explore">
                  <Button
                    size="lg"
                    className="vx-shimmer relative bg-gradient-to-r from-fuchsia-600 via-fuchsia-500 to-rose-500 hover:from-fuchsia-500 hover:to-rose-400 text-white px-8 h-12 text-base font-semibold w-full sm:w-auto"
                    style={{
                      boxShadow:
                        "0 8px 32px -8px rgba(217, 70, 239, 0.55), 0 0 0 1px rgba(240, 171, 252, 0.25) inset",
                    }}
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    Browse projects
                  </Button>
                </Link>
                <a href="#understand">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/[0.03] backdrop-blur-md border-white/20 text-white hover:bg-white/[0.08] hover:border-white/35 px-8 h-12 text-base w-full sm:w-auto transition-all"
                  >
                    Get the idea in 30 seconds
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                {!isAuthed && (
                  <Link href="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-transparent border-white/15 text-white/75 hover:bg-white/5 hover:text-white px-8 h-12 text-base w-full sm:w-auto"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in
                    </Button>
                  </Link>
                )}
              </div>

              <p className="text-white/40 text-sm flex items-center justify-center gap-2 flex-wrap vx-rise-in vx-rise-in--delay-4">
                <Lock className="h-3.5 w-3.5 text-white/35" />
                <span>
                  You stay in control &middot; No forced commitment &middot; Your role evolves with your actions
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* 3-STEP JOURNEY */}
        <section className="relative py-16 overflow-hidden">
          <div
            className="vx-halo vx-halo--accent"
            style={{ width: "560px", height: "320px", top: "10%", left: "50%", transform: "translateX(-50%)" }}
            aria-hidden="true"
          />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-2xl mx-auto text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                How it works
              </h2>
              <p className="text-white/55 text-base">
                Three simple steps. No surprises.
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  num: "1",
                  icon: Compass,
                  title: "Discover",
                  desc: "Browse independent creators and the projects you love. Free, with no commitment.",
                },
                {
                  num: "2",
                  icon: Heart,
                  title: "Support",
                  desc: "Contribute 2 to 20 euros to a project you believe in. Your support is direct, tracked, and transparent.",
                },
                {
                  num: "3",
                  icon: Sparkles,
                  title: "Take part",
                  desc: "Discuss, vote, vibe. Your impact grows with your involvement. Some participations may even be rewarded.",
                },
              ].map((step) => {
                const Icon = step.icon
                return (
                  <Card
                    key={step.num}
                    className="vx-cinema-card relative border-white/10 bg-white/[0.02] backdrop-blur-md p-6"
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-5xl font-bold text-fuchsia-400/30">
                          {step.num}
                        </span>
                        <Icon className="h-7 w-7 text-fuchsia-300" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">
                        {step.title}
                      </h3>
                      <p className="text-white/55 text-sm leading-relaxed">
                        {step.desc}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* TRUST & TRANSPARENCY */}
        <section id="understand" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Scale className="h-10 w-10 text-fuchsia-300 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                A platform built on trust
              </h2>
              <p className="text-white/65 text-base leading-relaxed mb-6">
                VIXUAL is not a lottery, not an investment platform, and not a financial product.
                It is a participatory creative platform where contributions support real creators,
                and where some participants may be rewarded according to official VIXUAL rules.
              </p>
              <p className="text-white/40 text-sm italic">
                Financial support does not guarantee a return. Eventual gains depend on the final
                ranking of the project. VIXUAL is not an investment product within the meaning of
                French financial markets authority (AMF) regulations.
              </p>
            </div>
          </div>
        </section>

        {/* CTA FOOTER */}
        <section className="py-14 border-t border-white/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to discover VIXUAL?
            </h2>
            <p className="text-white/55 mb-6 max-w-xl mx-auto">
              Browse the projects available. No sign-up required to explore.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/explore">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-fuchsia-600 to-rose-500 hover:from-fuchsia-500 hover:to-rose-400 text-white px-8 h-12 text-base font-semibold w-full sm:w-auto"
                >
                  <Eye className="mr-2 h-5 w-5" />
                  Browse projects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="text-white/30 text-xs mt-6">
              All paid features and sign-up flow currently use the French interface.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
