"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calculator } from "lucide-react";
import {
  INVESTMENT_TIERS_EUR,
  getVotesForInvestment,
  getVixupointsForInvestment,
} from "@/lib/payout/constants";

export function SupportSimulator() {
  const [amount, setAmount] = useState(10);

  // Snap to the nearest valid tier
  const validTiers = [...INVESTMENT_TIERS_EUR];
  const snappedAmount = useMemo(() => {
    const closest = validTiers.reduce((prev, curr) =>
      Math.abs(curr - amount) < Math.abs(prev - amount) ? curr : prev
    );
    return closest;
  }, [amount]);

  const votes = getVotesForInvestment(snappedAmount);
  const visupoints = getVixupointsForInvestment(snappedAmount);

  // Conservative projection model (indicative)
  const potentialReturn = {
    conservative: snappedAmount * 1.2,
    moderate: snappedAmount * 1.5,
    optimistic: snappedAmount * 2.0,
  };

  return (
    <Card className="bg-slate-900/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-emerald-400" />
          {"Simulateur de soutien"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount slider */}
        <div>
          <label className="text-white/70 text-sm mb-3 block">
            {"Montant du soutien : "}
            <span className="text-white font-bold text-lg">{snappedAmount}&nbsp;{"EUR"}</span>
          </label>
          <Slider
            value={[amount]}
            onValueChange={([v]) => setAmount(v)}
            min={2}
            max={20}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white/40 mt-1.5">
            <span>{"2\u00a0\u20ac"}</span>
            <span>{"20\u00a0\u20ac"}</span>
          </div>
        </div>

        {/* Quick-select buttons */}
        <div className="flex flex-wrap gap-2">
          {[2, 5, 10, 15, 20].map((tier) => (
            <Button
              key={tier}
              variant={snappedAmount === tier ? "default" : "outline"}
              size="sm"
              onClick={() => setAmount(tier)}
              className={
                snappedAmount === tier
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "border-white/15 text-white/60 hover:text-white"
              }
            >
              {tier}&nbsp;{"EUR"}
            </Button>
          ))}
        </div>

        {/* Results: votes & visupoints */}
        <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">{"Votes gagn\u00e9s"}</span>
            <span className="text-emerald-400 font-bold text-lg">{votes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">VIXUpoints</span>
            <span className="text-amber-400 font-bold text-lg">+{visupoints}</span>
          </div>
        </div>

        {/* Projection */}
        <div className="space-y-3">
          <p className="text-white/60 text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            {"Recompenses potentielles (si le projet est recompense en cycle de cloture) :"}
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-black/20 rounded-lg p-3 border border-white/5">
              <p className="text-xs text-white/40 mb-1">Prudent</p>
              <p className="text-emerald-400 font-bold">{potentialReturn.conservative.toFixed(2)}&nbsp;{"EUR"}</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3 border border-white/5">
              <p className="text-xs text-white/40 mb-1">{"Mod\u00e9r\u00e9"}</p>
              <p className="text-emerald-400 font-bold">{potentialReturn.moderate.toFixed(2)}&nbsp;{"EUR"}</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3 border border-white/5">
              <p className="text-xs text-white/40 mb-1">Optimiste</p>
              <p className="text-emerald-400 font-bold">{potentialReturn.optimistic.toFixed(2)}&nbsp;{"EUR"}</p>
            </div>
          </div>
          <p className="text-white/30 text-xs leading-relaxed">
            {"* Estimations indicatives. Les soutiens servent avant tout a aider les createurs. Certaines participations peuvent etre recompensees selon les regles officielles VIXUAL — aucun gain n'est garanti."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
