"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, Phone, Mail, MapPin, Clock, Building2, 
  Send, MessageCircle, HelpCircle, Briefcase 
} from "lucide-react"
import { Footer } from "@/components/footer"
import { VixualLogo } from "@/components/vixual-logo"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <VixualLogo size="md" />
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-white/70 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contactez <span className="text-emerald-400">VIXUAL</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Une question, un partenariat ou besoin d'assistance? Notre equipe est a votre ecoute.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-6">
            {/* Coordonnees */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-400" />
                  Informations de contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Telephone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Telephone</h3>
                    <p className="text-white/70">+33 (0)1 XX XX XX XX</p>
                    <p className="text-white/50 text-sm flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      Lundi - Vendredi : 9h00 - 18h00
                    </p>
                  </div>
                </div>

                {/* Emails */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-2">Adresses email</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-white/40" />
                        <a href="mailto:contact@vixual.fr" className="text-teal-400 hover:text-teal-300 transition-colors">
                          contact@vixual.fr
                        </a>
                        <span className="text-white/40 text-xs">- Questions generales</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-white/40" />
                        <a href="mailto:support@vixual.fr" className="text-teal-400 hover:text-teal-300 transition-colors">
                          support@vixual.fr
                        </a>
                        <span className="text-white/40 text-xs">- Assistance technique</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-white/40" />
                        <a href="mailto:partenaires@vixual.fr" className="text-teal-400 hover:text-teal-300 transition-colors">
                          partenaires@vixual.fr
                        </a>
                        <span className="text-white/40 text-xs">- Partenariats</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adresse */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-2">Adresse</h3>
                    <div className="text-white/70 space-y-1">
                      <p className="font-semibold">VIXUAL SAS</p>
                      <p className="text-white/50">_________________________</p>
                      <p className="text-white/50">_________________________</p>
                      <p className="text-white/50">Code postal - Ville</p>
                      <p className="text-white/50">France</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations legales */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white text-lg">Informations legales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Raison sociale</span>
                  <span className="text-white/70">VIXUAL SAS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">SIRET</span>
                  <span className="text-white/50">___ ___ ___ _____</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">RCS</span>
                  <span className="text-white/50">_____________</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">TVA Intracommunautaire</span>
                  <span className="text-white/50">FR ___________</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Capital social</span>
                  <span className="text-white/50">_______ euros</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Send className="h-5 w-5 text-emerald-400" />
                  Envoyez-nous un message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white/70">Prenom</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Votre prenom"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white/70">Nom</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Votre nom"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/70">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="votre@email.com"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white/70">Sujet</Label>
                    <select 
                      id="subject"
                      className="w-full h-10 px-3 rounded-md bg-slate-700/50 border border-slate-600 text-white"
                    >
                      <option value="">Selectionnez un sujet</option>
                      <option value="general">Question generale</option>
                      <option value="support">Support technique</option>
                      <option value="partenariat">Proposition de partenariat</option>
                      <option value="presse">Contact presse</option>
                      <option value="facturation">Facturation / Paiement</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white/70">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Decrivez votre demande..."
                      rows={6}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-white/40 resize-none"
                    />
                  </div>

                  <div className="flex items-start gap-2">
                    <input type="checkbox" id="privacy" className="mt-1" />
                    <Label htmlFor="privacy" className="text-white/50 text-sm">
                      J'accepte que mes donnees soient traitees conformement a la{" "}
                      <Link href="/legal/privacy" className="text-teal-400 hover:underline">
                        politique de confidentialite
                      </Link>
                    </Label>
                  </div>

                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer le message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick links */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Link href="/faq">
                <Card className="bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-amber-400" />
                    <div>
                      <p className="text-white font-medium text-sm">FAQ</p>
                      <p className="text-white/50 text-xs">Questions frequentes</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/social">
                <Card className="bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-teal-400" />
                    <div>
                      <p className="text-white font-medium text-sm">Vixual Social</p>
                      <p className="text-white/50 text-xs">Communaute VIXUAL</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
