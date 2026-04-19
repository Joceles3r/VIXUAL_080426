"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  Ticket,
  Target,
  TrendingUp,
  Play,
  Heart,
  MessageSquare,
  Clock,
  CheckCircle2,
  Lock,
  Gift,
  Sparkles,
  Eye,
  Share2,
  Info,
  ChevronRight,
  Zap,
} from "lucide-react";
import {
  VIXUPOINTS_GAINS,
  DAILY_VIXUPOINTS_CAP,
  getDiscoveryPassStatus,
  getDailyObjectives,
  PEDAGOGIC_MESSAGES,
  getProfileConfig,
  type DiscoveryPassStatus,
  type DailyObjective,
} from "@/lib/vixupoints-engine";

export default function VisitorDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for API data
  const [vixupoints, setVixupoints] = useState(0);
  const [dailyEarned, setDailyEarned] = useState(0);
  const [excerptViewsToday, setExcerptViewsToday] = useState(0);
  const [interactionsToday, setInteractionsToday] = useState(0);
  const [passUnlocked, setPassUnlocked] = useState(false);
  const [passUsed, setPassUsed] = useState(false);
  
  const profile = user?.roles?.[0] || "visitor";
  const isMinor = user?.isMinor ?? false;
  const profileConfig = getProfileConfig(isMinor ? "visitor_minor" : profile);
  
  // Pass Decouverte status
  const passStatus = getDiscoveryPassStatus(
    passUnlocked,
    passUsed,
    excerptViewsToday,
    dailyEarned,
    interactionsToday
  );
  
  // Objectifs quotidiens
  const objectives = getDailyObjectives(excerptViewsToday, interactionsToday, passUnlocked);
  const completedObjectives = objectives.filter(o => o.completed).length;
  
  // Progression vers le plafond
  const dailyProgress = (dailyEarned / DAILY_VIXUPOINTS_CAP) * 100;
  const totalProgress = profileConfig.totalCap 
    ? (vixupoints / profileConfig.totalCap) * 100 
    : 0;
  
  useEffect(() => {
    // Charger les donnees depuis les APIs
    async function loadData() {
      // Si pas d'utilisateur connecte, utiliser des valeurs par defaut
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Charger le solde VIXUpoints
        const balanceRes = await fetch(`/api/visupoints/balance?userId=${user.id}`);
        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setVixupoints(balanceData.balance || 0);
          setDailyEarned(balanceData.caps?.daily?.used || 0);
        }
        
        // Charger le statut du Pass Decouverte
        const passRes = await fetch(`/api/visupoints/discovery-pass?userId=${user.id}`);
        if (passRes.ok) {
          const passData = await passRes.json();
          if (passData.status) {
            setExcerptViewsToday(passData.status.progress?.excerpts?.current || 0);
            setInteractionsToday(passData.status.progress?.interactions?.current || 0);
            setPassUnlocked(passData.status.isUnlocked || false);
            setPassUsed(passData.status.isUsed || false);
          }
        }
      } catch (err) {
        console.error("[v0] Error loading visitor data:", err);
        setError("Impossible de charger vos donnees");
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [user?.id]);
  
  // Actions
  const handleUnlockPass = () => {
    if (passStatus.canUnlock) {
      setPassUnlocked(true);
    }
  };
  
  const handleUsePass = () => {
    if (passUnlocked && !passUsed) {
      setPassUsed(true);
      // Credit bonus VIXUpoints
      setVixupoints(prev => prev + VIXUPOINTS_GAINS.fullContentView);
      setDailyEarned(prev => prev + VIXUPOINTS_GAINS.fullContentView);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Mon Espace Visiteur</h1>
        <p className="text-white/60 text-sm">{PEDAGOGIC_MESSAGES.welcome}</p>
      </div>
      
      {/* Bloc 1: VIXUpoints */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                <Star className="h-7 w-7 text-amber-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">VIXUpoints</p>
                <p className="text-3xl font-bold text-white">{vixupoints.toLocaleString()}</p>
                {profileConfig.totalCap && (
                  <p className="text-amber-400/70 text-xs mt-0.5">
                    / {profileConfig.totalCap.toLocaleString()} max
                  </p>
                )}
              </div>
            </div>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              Mode V1
            </Badge>
          </div>
          
          {/* Progression totale */}
          {profileConfig.totalCap && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>Progression totale</span>
                <span>{Math.round(totalProgress)}%</span>
              </div>
              <Progress value={totalProgress} className="h-2 bg-black/30" />
            </div>
          )}
          
          {/* Progression journaliere */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/50 mb-1">
              <span>{"Aujourd'hui: " + dailyEarned + " / " + DAILY_VIXUPOINTS_CAP + " pts"}</span>
              <span>{Math.round(dailyProgress)}%</span>
            </div>
            <Progress 
              value={dailyProgress} 
              className="h-1.5 bg-black/30"
            />
          </div>
          
          {/* Info V1 */}
          <div className="mt-4 bg-black/20 rounded-lg p-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-400/70 shrink-0 mt-0.5" />
            <p className="text-white/50 text-xs">
              {PEDAGOGIC_MESSAGES.conversion}. Utilisation future en cours de preparation.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Bloc 2: Pass Decouverte */}
      <Card className={`border ${
        passUsed 
          ? "bg-slate-800/50 border-white/10" 
          : passUnlocked 
            ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30"
            : "bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border-sky-500/30"
      }`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                passUsed 
                  ? "bg-slate-700/50" 
                  : passUnlocked 
                    ? "bg-emerald-500/20"
                    : "bg-sky-500/20"
              }`}>
                <Ticket className={`h-6 w-6 ${
                  passUsed ? "text-white/30" : passUnlocked ? "text-emerald-400" : "text-sky-400"
                }`} />
              </div>
              <div>
                <h3 className="text-white font-semibold">Pass Decouverte</h3>
                <p className="text-white/50 text-xs">{PEDAGOGIC_MESSAGES.passUnlock}</p>
              </div>
            </div>
            
            {passUsed ? (
              <Badge className="bg-slate-700/50 text-white/50 border-white/10">
                <Lock className="h-3 w-3 mr-1" />
                Utilise
              </Badge>
            ) : passUnlocked ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Disponible
              </Badge>
            ) : (
              <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30">
                <Target className="h-3 w-3 mr-1" />
                A debloquer
              </Badge>
            )}
          </div>
          
          {passUsed ? (
            <div className="bg-black/20 rounded-lg p-4 text-center">
              <p className="text-white/60 text-sm">
                {"Vous avez utilise votre Pass aujourd'hui."}
              </p>
              <p className="text-white/40 text-xs mt-1">
                {"Revenez demain pour un nouvel acces gratuit !"}
              </p>
            </div>
          ) : passUnlocked ? (
            <div className="space-y-3">
              <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
                <p className="text-emerald-400 font-medium text-center">
                  {"Votre Pass est pret !"}
                </p>
                <p className="text-white/50 text-xs text-center mt-1">
                  {"Accedez gratuitement a 1 contenu complet de votre choix."}
                </p>
              </div>
              <Button 
                onClick={handleUsePass}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                {"Utiliser mon Pass"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progression vers deblocage */}
              <div>
                <div className="flex justify-between text-xs text-white/50 mb-1">
                  <span>Progression</span>
                  <span>{Math.round(passStatus.unlockProgress)}%</span>
                </div>
                <Progress value={passStatus.unlockProgress} className="h-2 bg-black/30" />
              </div>
              
              {/* Options de deblocage */}
              <div className="grid grid-cols-3 gap-2">
                <div className={`bg-black/20 rounded-lg p-3 text-center border ${
                  passStatus.unlockRequirements.excerptViews.current >= passStatus.unlockRequirements.excerptViews.required
                    ? "border-emerald-500/30"
                    : "border-white/5"
                }`}>
                  <Eye className={`h-5 w-5 mx-auto mb-1 ${
                    passStatus.unlockRequirements.excerptViews.current >= passStatus.unlockRequirements.excerptViews.required
                      ? "text-emerald-400"
                      : "text-white/40"
                  }`} />
                  <p className="text-white/70 text-xs font-medium">
                    {passStatus.unlockRequirements.excerptViews.current}/{passStatus.unlockRequirements.excerptViews.required}
                  </p>
                  <p className="text-white/40 text-[10px]">extraits</p>
                </div>
                <div className={`bg-black/20 rounded-lg p-3 text-center border ${
                  passStatus.unlockRequirements.vixupoints.current >= passStatus.unlockRequirements.vixupoints.required
                    ? "border-emerald-500/30"
                    : "border-white/5"
                }`}>
                  <Star className={`h-5 w-5 mx-auto mb-1 ${
                    passStatus.unlockRequirements.vixupoints.current >= passStatus.unlockRequirements.vixupoints.required
                      ? "text-emerald-400"
                      : "text-white/40"
                  }`} />
                  <p className="text-white/70 text-xs font-medium">
                    {passStatus.unlockRequirements.vixupoints.current}/{passStatus.unlockRequirements.vixupoints.required}
                  </p>
                  <p className="text-white/40 text-[10px]">pts</p>
                </div>
                <div className={`bg-black/20 rounded-lg p-3 text-center border ${
                  passStatus.unlockRequirements.interactions.current >= passStatus.unlockRequirements.interactions.required
                    ? "border-emerald-500/30"
                    : "border-white/5"
                }`}>
                  <Heart className={`h-5 w-5 mx-auto mb-1 ${
                    passStatus.unlockRequirements.interactions.current >= passStatus.unlockRequirements.interactions.required
                      ? "text-emerald-400"
                      : "text-white/40"
                  }`} />
                  <p className="text-white/70 text-xs font-medium">
                    {passStatus.unlockRequirements.interactions.current}/{passStatus.unlockRequirements.interactions.required}
                  </p>
                  <p className="text-white/40 text-[10px]">interaction</p>
                </div>
              </div>
              
              <p className="text-white/40 text-xs text-center">
                {"Completez l'une des conditions ci-dessus pour debloquer votre Pass."}
              </p>
              
              {passStatus.canUnlock && (
                <Button 
                  onClick={handleUnlockPass}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {"Debloquer mon Pass"}
                </Button>
              )}
            </div>
          )}
          
          {/* Reset info */}
          <div className="mt-4 flex items-center justify-center gap-2 text-white/30 text-xs">
            <Clock className="h-3 w-3" />
            <span>Reset a minuit</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Bloc 3: Progression / Niveaux */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            Ma Progression
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Niveau actuel */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Niveau Visiteur</span>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                {vixupoints < 500 ? "Debutant" : vixupoints < 1500 ? "Actif" : vixupoints < 3000 ? "Engage" : "Expert"}
              </Badge>
            </div>
            <Progress 
              value={Math.min((vixupoints % 1000) / 10, 100)} 
              className="h-2 bg-slate-800"
            />
            <p className="text-white/40 text-xs mt-2">
              {vixupoints < 500 
                ? `${500 - vixupoints} pts pour niveau Actif`
                : vixupoints < 1500
                  ? `${1500 - vixupoints} pts pour niveau Engage`
                  : vixupoints < 3000
                    ? `${3000 - vixupoints} pts pour niveau Expert`
                    : "Niveau maximum atteint !"}
            </p>
          </div>
          
          {/* Actions recommandees */}
          <div>
            <p className="text-white/60 text-xs mb-2">Actions pour progresser :</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/20 rounded-lg p-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-sky-400" />
                <div>
                  <p className="text-white/80 text-xs font-medium">Regarder</p>
                  <p className="text-sky-400 text-[10px]">+{VIXUPOINTS_GAINS.activeViewing} pts</p>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-400" />
                <div>
                  <p className="text-white/80 text-xs font-medium">Interagir</p>
                  <p className="text-pink-400 text-[10px]">+{VIXUPOINTS_GAINS.interaction} pts</p>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-emerald-400" />
                <div>
                  <p className="text-white/80 text-xs font-medium">Partager</p>
                  <p className="text-emerald-400 text-[10px]">+{VIXUPOINTS_GAINS.share} pts</p>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 flex items-center gap-2">
                <Gift className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-white/80 text-xs font-medium">Contribuer</p>
                  <p className="text-amber-400 text-[10px]">+{VIXUPOINTS_GAINS.contribution} pts</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Bloc 4: Objectifs du jour */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Target className="h-5 w-5 text-sky-400" />
            {"Objectifs du jour"}
            <Badge className="ml-auto bg-sky-500/20 text-sky-400 border-sky-500/30 text-xs">
              {completedObjectives}/{objectives.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {objectives.map((objective) => (
              <div 
                key={objective.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  objective.completed 
                    ? "bg-emerald-500/10 border-emerald-500/20" 
                    : "bg-black/20 border-white/5"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  objective.completed ? "bg-emerald-500/20" : "bg-white/5"
                }`}>
                  {objective.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <span className="text-white/40 text-sm">{objective.current}/{objective.target}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${objective.completed ? "text-emerald-400" : "text-white/80"}`}>
                    {objective.title}
                  </p>
                  <p className="text-white/40 text-xs truncate">{objective.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-medium ${objective.completed ? "text-emerald-400" : "text-amber-400"}`}>
                    +{objective.reward}
                  </p>
                  <p className="text-white/30 text-xs">pts</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* CTA Explorer */}
      <Card className="bg-gradient-to-r from-sky-500/10 to-purple-500/10 border-sky-500/30">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <p className="text-white font-medium">{PEDAGOGIC_MESSAGES.engagement}</p>
                <p className="text-white/50 text-xs">{"Explorez les contenus pour gagner des VIXUpoints"}</p>
              </div>
            </div>
            <Link href="/explore">
              <Button className="bg-sky-600 hover:bg-sky-500 text-white">
                {"Explorer"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
