"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Heart, 
  ArrowLeft, 
  CreditCard, 
  Check, 
  Info,
  Gift,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { 
  SOUTIEN_LIBRE_CONFIG, 
  calculateSoutienLibreDistribution,
  validateSoutienAmount,
  type Creator,
} from "@/lib/soutien-libre/shared";

// Mock creator for demo
function getMockCreator(slug: string): Creator {
  return {
    id: `creator-${slug}`,
    slug,
    displayName: slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    bio: "Createur passione sur VIXUAL",
    stripeAccountId: "acct_demo",
    stripeAccountStatus: "active",
  };
}

export default function CreatorSoutienPage({ params }: { params: { creatorSlug: string } }) {
  const { creatorSlug } = params;
  const searchParams = useSearchParams();
  const { isAuthed, user } = useAuth();
  const { toast } = useToast();
  
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [includeVixualTip, setIncludeVixualTip] = useState(false);
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorEmail, setDonorEmail] = useState(user?.email || "");
  
  // Success/cancel states
  const success = searchParams.get("success") === "true";
  const cancelled = searchParams.get("cancelled") === "true";
  const paidAmount = searchParams.get("amount");

  useEffect(() => {
    async function loadCreator() {
      try {
        const res = await fetch(`/api/soutien-libre/creator/${creatorSlug}`);
        if (res.ok) {
          const data = await res.json();
          setCreator(data.creator);
        } else {
          // Fallback to mock
          setCreator(getMockCreator(creatorSlug));
        }
      } catch {
        setCreator(getMockCreator(creatorSlug));
      } finally {
        setLoading(false);
      }
    }
    
    loadCreator();
  }, [creatorSlug]);

  useEffect(() => {
    if (user?.email) {
      setDonorEmail(user.email);
    }
  }, [user]);

  const finalAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
  const distribution = calculateSoutienLibreDistribution(finalAmount, includeVixualTip);
  const validation = validateSoutienAmount(finalAmount);

  const handleSubmit = async () => {
    if (!validation.valid) {
      toast({ title: "Erreur", description: validation.error, variant: "destructive" });
      return;
    }
    
    if (!donorEmail) {
      toast({ title: "Erreur", description: "Email requis", variant: "destructive" });
      return;
    }
    
    if (!creator?.stripeAccountId) {
      toast({ title: "Erreur", description: "Ce createur ne peut pas recevoir de soutiens pour le moment", variant: "destructive" });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const res = await fetch("/api/soutien-libre/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorSlug,
          amount: finalAmount,
          includeVixualTip,
          donorEmail,
          message,
          isAnonymous,
        }),
      });
      
      const data = await res.json();
      
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast({ 
          title: "Erreur", 
          description: data.error || "Impossible de creer le paiement", 
          variant: "destructive" 
        });
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Erreur de connexion", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4" style={{
        background: "linear-gradient(160deg, #0a1628 0%, #1a2a5e 30%, #2d1f5e 50%, #1e1548 70%, #0a1628 100%)",
      }}>
        <Card className="bg-emerald-500/10 border-emerald-500/30 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Merci pour votre soutien !</h2>
            <p className="text-white/70 mb-6">
              Votre soutien de {paidAmount}EUR a bien ete envoye. Le createur recevra votre contribution.
            </p>
            <div className="flex flex-col gap-3">
              <Link href={`/soutien-libre/${creatorSlug}`}>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                  <Heart className="mr-2 h-4 w-4" />
                  Soutenir a nouveau
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  Explorer VIXUAL
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Cancelled Screen
  if (cancelled) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4" style={{
        background: "linear-gradient(160deg, #0a1628 0%, #1a2a5e 30%, #2d1f5e 50%, #1e1548 70%, #0a1628 100%)",
      }}>
        <Card className="bg-amber-500/10 border-amber-500/30 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Paiement annule</h2>
            <p className="text-white/70 mb-6">
              Votre paiement a ete annule. Aucun montant n&apos;a ete debite.
            </p>
            <Link href={`/soutien-libre/${creatorSlug}`}>
              <Button className="bg-amber-600 hover:bg-amber-500 text-white">
                Reessayer
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{
        background: "linear-gradient(160deg, #0a1628 0%, #1a2a5e 30%, #2d1f5e 50%, #1e1548 70%, #0a1628 100%)",
      }}>
        <div className="animate-pulse text-white/60">Chargement...</div>
      </main>
    );
  }

  const canReceive = creator?.stripeAccountId && creator?.stripeAccountStatus === "active";

  return (
    <main
      className="min-h-screen text-white"
      style={{
        background: "linear-gradient(160deg, #0a1628 0%, #1a2a5e 30%, #2d1f5e 50%, #1e1548 70%, #0a1628 100%)",
      }}
    >
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-slate-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/soutien-libre" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">
            <Heart className="h-3 w-3 mr-1" />
            Soutien Libre
          </Badge>
          <div className="w-20" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Creator Info */}
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                  {creator?.displayName?.charAt(0) || "?"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{creator?.displayName}</h2>
                  {creator?.bio && (
                    <p className="text-white/60 mt-1">{creator.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {!canReceive ? (
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-6 text-center">
                <Info className="h-8 w-8 text-amber-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Ce createur ne peut pas recevoir de soutiens
                </h3>
                <p className="text-white/60">
                  Le createur n&apos;a pas encore active son compte Stripe pour recevoir des paiements.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Amount Selection */}
              <Card className="bg-white/5 border-white/10 mb-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Gift className="h-5 w-5 text-rose-400" />
                    Choisissez un montant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Preset Amounts */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {SOUTIEN_LIBRE_CONFIG.presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount("");
                        }}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          selectedAmount === amount && !customAmount
                            ? "border-rose-500 bg-rose-500/20 text-rose-300"
                            : "border-white/20 bg-white/5 text-white hover:border-rose-500/50"
                        }`}
                      >
                        <span className="text-xl font-bold">{amount}EUR</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Montant libre"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      min={SOUTIEN_LIBRE_CONFIG.minAmount}
                      max={SOUTIEN_LIBRE_CONFIG.maxAmount}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">EUR</span>
                  </div>
                  
                  {!validation.valid && finalAmount > 0 && (
                    <p className="text-rose-400 text-sm mt-2">{validation.error}</p>
                  )}
                </CardContent>
              </Card>

              {/* Optional Tip */}
              <Card className="bg-amber-500/5 border-amber-500/20 mb-6">
                <CardContent className="p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={includeVixualTip}
                      onCheckedChange={(checked) => setIncludeVixualTip(checked === true)}
                      className="border-amber-500/50 data-[state=checked]:bg-amber-500"
                    />
                    <div className="flex-1">
                      <span className="text-amber-300 font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Ajouter 1EUR pour soutenir VIXUAL
                      </span>
                      <p className="text-amber-300/70 text-sm">
                        Ce tip volontaire aide a faire vivre la plateforme
                      </p>
                    </div>
                  </label>
                </CardContent>
              </Card>

              {/* Message & Options */}
              <Card className="bg-white/5 border-white/10 mb-6">
                <CardContent className="p-6 space-y-4">
                  {/* Email (required if not logged in) */}
                  {!isAuthed && (
                    <div>
                      <label className="text-sm text-white/70 mb-2 block">Votre email *</label>
                      <Input
                        type="email"
                        placeholder="votre@email.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        required
                      />
                    </div>
                  )}
                  
                  {/* Optional Message */}
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">Message (optionnel)</label>
                    <Textarea
                      placeholder="Un mot d'encouragement..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={500}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
                      rows={3}
                    />
                  </div>
                  
                  {/* Anonymous */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={isAnonymous}
                      onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                      className="border-white/30 data-[state=checked]:bg-white/20"
                    />
                    <span className="text-white/70 text-sm">Rester anonyme</span>
                  </label>
                </CardContent>
              </Card>

              {/* Summary & Pay */}
              <Card className="bg-gradient-to-br from-rose-500/10 to-purple-500/10 border-rose-500/30">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recapitulatif</h3>
                  
                  <div className="space-y-2 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-white/70">Montant du soutien</span>
                      <span className="text-white">{finalAmount.toFixed(2)}EUR</span>
                    </div>
                    {includeVixualTip && (
                      <div className="flex justify-between">
                        <span className="text-amber-300/70">Tip VIXUAL</span>
                        <span className="text-amber-300">+{distribution.vixualTip.toFixed(2)}EUR</span>
                      </div>
                    )}
                    <div className="flex justify-between text-white/50 text-xs">
                      <span>Commission VIXUAL (7%)</span>
                      <span>-{distribution.platformFee.toFixed(2)}EUR</span>
                    </div>
                    <div className="flex justify-between text-white/50 text-xs">
                      <span>Frais Stripe (estimes)</span>
                      <span>~{distribution.estimatedStripeFee.toFixed(2)}EUR</span>
                    </div>
                    <div className="border-t border-white/10 my-2" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-white">Total a payer</span>
                      <span className="text-rose-300">{distribution.totalPaid.toFixed(2)}EUR</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Le createur recoit</span>
                      <span className="font-semibold">{distribution.netToCreator.toFixed(2)}EUR</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!validation.valid || !donorEmail || submitting}
                    className="w-full bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white py-6 text-lg"
                  >
                    {submitting ? (
                      "Redirection vers Stripe..."
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Payer {distribution.totalPaid.toFixed(2)}EUR
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-white/50 text-xs">
                    <Shield className="h-3 w-3" />
                    <span>Paiement securise par Stripe</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
