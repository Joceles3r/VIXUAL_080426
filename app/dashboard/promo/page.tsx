"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Share2,
  Mail,
  Link2,
  Globe,
  Copy,
  Check,
  BarChart3,
  Clock,
  Users,
  TrendingUp,
  Gift,
  QrCode,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";
import { generateReferralLink, getShareUrl, REFERRAL_REWARD_VIXUPOINTS } from "@/lib/referral-system";

interface PromoStats {
  monthlyEmails: number;
  monthlyEmailCap: number;
  monthlyShares: number;
  totalShares: number;
  cooldownHours: number;
  // New viral stats
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalRewardsEarned: number;
  pendingRewards: number;
}

export default function PromoPage() {
  const { user, isAuthed } = useAuth();
  const [stats, setStats] = useState<PromoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/promo/email?userId=${user.id}`);
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthed) fetchStats();
  }, [isAuthed, fetchStats]);

  const referralData = typeof window !== "undefined" && user?.id
    ? generateReferralLink(user.id, undefined, window.location.origin)
    : { url: "", code: "", qrCodeUrl: "" };
  
  const referralLink = referralData.url;
  const qrCodeUrl = referralData.qrCodeUrl;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (channel: "email" | "link" | "social") => {
    if (!user?.id) return;
    setShareLoading(channel);
    try {
      await fetch("/api/promo/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, channel }),
      });
      await fetchStats();
    } catch { /* silent */ } finally {
      setShareLoading(null);
    }
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/50">{"Connectez-vous pour acc\u00e9der \u00e0 la promotion."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Promotion / Parrainage</h1>
          <p className="text-white/50 mt-2">
            {"Partagez VIXUAL avec vos proches et suivez l'impact de vos actions."}
          </p>
        </div>

        {/* Stats cards - Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-slate-900/60 border-white/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center">
                <Users className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {loading ? "--" : stats?.totalClicks ?? 0}
                </p>
                <p className="text-white/40 text-xs">Clics</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-white/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {loading ? "--" : stats?.totalConversions ?? 0}
                </p>
                <p className="text-white/40 text-xs">Conversions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-white/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {loading ? "--" : `${(stats?.conversionRate ?? 0).toFixed(1)}%`}
                </p>
                <p className="text-white/40 text-xs">Taux conversion</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-white/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Gift className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {loading ? "--" : stats?.totalRewardsEarned ?? 0}
                </p>
                <p className="text-white/40 text-xs">VIXUpoints gagnes</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Rewards info */}
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-amber-400" />
              <div>
                <p className="text-white font-medium">Recompense parrainage</p>
                <p className="text-white/50 text-sm">Gagnez {REFERRAL_REWARD_VIXUPOINTS} VIXUpoints par filleul inscrit</p>
              </div>
            </div>
            {stats?.pendingRewards ? (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                {stats.pendingRewards} en attente
              </Badge>
            ) : null}
          </CardContent>
        </Card>

        {/* Referral link + QR Code */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-slate-900/60 border-white/10 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Link2 className="h-5 w-5 text-sky-400" />
                Votre lien de parrainage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white/70 text-sm font-mono truncate">
                  {referralLink || "Chargement..."}
                </div>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="border-white/15 text-white/70 hover:bg-white/5 shrink-0 gap-2"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copie !" : "Copier"}
                </Button>
              </div>
              <p className="text-white/30 text-xs mt-3">
                {"Partagez ce lien pour inviter vos amis. Chaque inscription via ce lien vous rapporte des VIXUpoints."}
              </p>
              
              {/* Social share buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={getShareUrl({ platform: "twitter", url: referralLink, title: "Decouvrez VIXUAL - Regarde, Soutiens, Participe !" })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 rounded-lg text-[#1DA1F2] text-sm transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </a>
                <a
                  href={getShareUrl({ platform: "facebook", url: referralLink })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-[#4267B2]/10 hover:bg-[#4267B2]/20 border border-[#4267B2]/30 rounded-lg text-[#4267B2] text-sm transition-colors"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </a>
                <a
                  href={getShareUrl({ platform: "linkedin", url: referralLink })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-[#0077B5]/10 hover:bg-[#0077B5]/20 border border-[#0077B5]/30 rounded-lg text-[#0077B5] text-sm transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
                <a
                  href={getShareUrl({ platform: "whatsapp", url: referralLink, title: "VIXUAL" })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-lg text-[#25D366] text-sm transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </CardContent>
          </Card>
          
          {/* QR Code */}
          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <QrCode className="h-5 w-5 text-purple-400" />
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {qrCodeUrl ? (
                <div className="bg-white p-2 rounded-lg">
                  <Image
                    src={qrCodeUrl}
                    alt="QR Code parrainage"
                    width={128}
                    height={128}
                    className="w-32 h-32"
                    unoptimized
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-white/10 rounded-lg animate-pulse" />
              )}
              <p className="text-white/40 text-xs mt-3 text-center">
                Scannez pour partager
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Share actions */}
        <Card className="bg-slate-900/60 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Share2 className="h-5 w-5 text-emerald-400" />
              Actions de partage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { channel: "email" as const, label: "Inviter par email", icon: Mail, color: "text-sky-400", bg: "bg-sky-500/15" },
                { channel: "link" as const, label: "Envoyer le lien", icon: Link2, color: "text-amber-400", bg: "bg-amber-500/15" },
                { channel: "social" as const, label: "Reseaux sociaux", icon: Globe, color: "text-emerald-400", bg: "bg-emerald-500/15" },
              ].map((item) => (
                <Button
                  key={item.channel}
                  onClick={() => handleShare(item.channel)}
                  disabled={shareLoading === item.channel}
                  variant="outline"
                  className="border-white/10 text-white/70 hover:bg-white/5 h-auto py-4 flex flex-col items-center gap-2"
                >
                  <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <span className="text-sm">{item.label}</span>
                </Button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-white/30 text-xs">
              <Clock className="h-3 w-3" />
              <span>{`Cooldown entre emails : ${stats?.cooldownHours ?? 72}h | Limite : 10 partages/jour`}</span>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="bg-sky-500/5 border border-sky-500/15 rounded-xl p-4">
          <p className="text-sky-400/80 text-sm leading-relaxed">
            {"Le système de promotion VIXUAL est conçu pour récompenser le bouche-à-oreille authentique. Les actions de partage sont soumises à des limites anti-abus (dix par jour, délai de soixante-douze heures entre emails). Vos statistiques sont mises à jour en temps réel."}
          </p>
        </div>
      </div>
    </div>
  );
}
