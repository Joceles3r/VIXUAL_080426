"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Heart, 
  Search, 
  ArrowRight, 
  Users,
  Star,
  Info,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { SOUTIEN_LIBRE_CONFIG, type Creator } from "@/lib/soutien-libre/engine";

// Mock creators for demo
const MOCK_CREATORS: Creator[] = [
  { id: "c1", slug: "marie-dupont", displayName: "Marie Dupont", bio: "Realisatrice de documentaires independants", stripeAccountId: "acct_1", stripeAccountStatus: "active" },
  { id: "c2", slug: "jean-martin", displayName: "Jean Martin", bio: "Auteur de romans fantastiques", stripeAccountId: "acct_2", stripeAccountStatus: "active" },
  { id: "c3", slug: "sophie-bernard", displayName: "Sophie Bernard", bio: "Podcasteuse science et technologie", stripeAccountId: "acct_3", stripeAccountStatus: "active" },
];

export default function SoutienLibrePage() {
  const router = useRouter();
  const { isAuthed, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [followedCreators, setFollowedCreators] = useState<Creator[]>([]);
  const [popularCreators, setPopularCreators] = useState<Creator[]>(MOCK_CREATORS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCreators() {
      try {
        // En production, charger depuis l'API
        if (isAuthed) {
          const res = await fetch("/api/soutien-libre/followed");
          if (res.ok) {
            const data = await res.json();
            setFollowedCreators(data.creators || []);
          }
        }
      } catch (err) {
        console.error("Erreur chargement createurs:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadCreators();
  }, [isAuthed]);

  const filteredCreators = popularCreators.filter(
    (c) =>
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-400" />
            Soutien Libre
          </h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-500/20 border border-rose-500/30 mb-6">
            <Heart className="h-10 w-10 text-rose-400" />
          </div>
          <h2 className="text-4xl font-bold mb-4 text-white">
            Soutenez un createur
          </h2>
          <p className="text-rose-300 text-xl font-medium mb-3">
            Vous connaissez un createur sur VIXUAL ?
          </p>
          <p className="text-white/70 text-lg mb-6">
            Un petit geste peut faire une grande difference. Aidez un projet a demarrer, 
            encouragez un createur a continuer, participez a une aventure.
          </p>
          
          {/* Info Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Info className="h-4 w-4 text-amber-400" />
            <span className="text-amber-300 text-sm">
              Soutien libre, sans impact sur le classement VIXUAL
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="bg-white/5 border-white/10 mb-8 max-w-2xl mx-auto">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input
                placeholder="Rechercher un createur par nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </CardContent>
        </Card>

        {/* Followed Creators */}
        {isAuthed && followedCreators.length > 0 && (
          <section className="mb-12">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              Createurs que vous suivez
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {followedCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          </section>
        )}

        {/* Popular / Search Results */}
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" />
            {searchQuery ? "Resultats de recherche" : "Createurs populaires"}
          </h3>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
                  <CardContent className="p-6 h-40" />
                </Card>
              ))}
            </div>
          ) : filteredCreators.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <p className="text-white/60">Aucun createur trouve</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Info Section */}
        <section className="mt-16 max-w-3xl mx-auto">
          <Card className="bg-gradient-to-br from-rose-500/10 to-purple-500/10 border-rose-500/20">
            <CardHeader>
              <CardTitle className="text-rose-300 flex items-center gap-2">
                <Info className="h-5 w-5" />
                Comment fonctionne le Soutien Libre ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/70">
              <p>
                Le <strong className="text-white">Soutien Libre</strong> vous permet d&apos;aider directement 
                un createur de maniere simple et volontaire.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span><strong className="text-white">Sans impact</strong> sur le classement du projet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span><strong className="text-white">Pas de votes</strong> ni d&apos;avantages lies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span><strong className="text-white">Commission de 7%</strong> pour faire fonctionner VIXUAL</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span><strong className="text-white">Paiement securise</strong> par carte bancaire via Stripe</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function CreatorCard({ creator }: { creator: Creator }) {
  const canReceive = creator.stripeAccountId && creator.stripeAccountStatus === "active";
  
  return (
    <Link href={`/soutien-libre/${creator.slug}`}>
      <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-rose-500/30 transition-all cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {creator.displayName.charAt(0)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white truncate group-hover:text-rose-300 transition-colors">
                {creator.displayName}
              </h4>
              {creator.bio && (
                <p className="text-white/60 text-sm line-clamp-2 mt-1">
                  {creator.bio}
                </p>
              )}
              
              <div className="mt-3 flex items-center gap-2">
                {canReceive ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                    <Heart className="h-3 w-3 mr-1" />
                    Peut recevoir des soutiens
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                    Stripe non active
                  </Badge>
                )}
              </div>
            </div>
            
            <ArrowRight className="h-5 w-5 text-white/30 group-hover:text-rose-400 transition-colors shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
