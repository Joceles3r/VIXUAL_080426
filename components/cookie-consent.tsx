"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Cookie } from "lucide-react";

type CookiePreferences = {
  necessary: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    preferences: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("visual-cookie-consent");
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem("visual-cookie-consent", JSON.stringify(prefs));
    localStorage.setItem("visual-cookie-consent-date", new Date().toISOString());
    setShowBanner(false);

    // Log consent to server for RGPD audit trail (fire & forget)
    fetch("/api/consent/cookies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferences: prefs, timestamp: new Date().toISOString() }),
    }).catch(() => {
      // Non-blocking
    });
  };

  const acceptAll = () => {
    saveConsent({ necessary: true, preferences: true, analytics: true, marketing: true });
  };

  const rejectAll = () => {
    saveConsent({ necessary: true, preferences: false, analytics: false, marketing: false });
  };

  const acceptSelected = () => {
    saveConsent(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-950/95 backdrop-blur-sm border-t border-white/10">
      {!showDetails ? (
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/15 flex items-center justify-center shrink-0">
              <Cookie className="h-5 w-5 text-teal-400" />
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              {"Nous utilisons des cookies pour am\u00e9liorer votre exp\u00e9rience. "}
              <Link href="/legal/cookies" className="text-teal-400 hover:text-teal-300 underline underline-offset-2">
                En savoir plus
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
              className="border-white/15 text-white/60 hover:text-white hover:bg-white/5"
            >
              Personnaliser
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={rejectAll}
              className="border-white/15 text-white/60 hover:text-white hover:bg-white/5"
            >
              Refuser
            </Button>
            <Button
              size="sm"
              onClick={acceptAll}
              className="bg-teal-600 hover:bg-teal-500 text-white"
            >
              Tout accepter
            </Button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-slate-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Cookie className="h-4 w-4 text-teal-400" />
                {"G\u00e9rer mes pr\u00e9f\u00e9rences cookies"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Necessary */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{"N\u00e9cessaires"}</p>
                  <p className="text-white/40 text-xs">{"Session, authentification, s\u00e9curit\u00e9"}</p>
                </div>
                <Switch checked disabled className="data-[state=checked]:bg-teal-600" />
              </div>

              {/* Preferences */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{"Pr\u00e9f\u00e9rences"}</p>
                  <p className="text-white/40 text-xs">{"Langue, th\u00e8me, personnalisation"}</p>
                </div>
                <Switch
                  checked={preferences.preferences}
                  onCheckedChange={(v) => setPreferences((p) => ({ ...p, preferences: v }))}
                  className="data-[state=checked]:bg-teal-600"
                />
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">Analyse</p>
                  <p className="text-white/40 text-xs">{"Statistiques d'utilisation, performance"}</p>
                </div>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={(v) => setPreferences((p) => ({ ...p, analytics: v }))}
                  className="data-[state=checked]:bg-teal-600"
                />
              </div>

              {/* Marketing (disabled for now) */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">Marketing</p>
                  <p className="text-white/40 text-xs">{"Actuellement d\u00e9sactiv\u00e9"}</p>
                </div>
                <Switch checked={false} disabled />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="border-white/15 text-white/60"
                >
                  Retour
                </Button>
                <Button
                  size="sm"
                  onClick={acceptSelected}
                  className="bg-teal-600 hover:bg-teal-500 text-white"
                >
                  Valider mes choix
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
