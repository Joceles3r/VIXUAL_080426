"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Upload,
  FileText,
  ImageIcon,
  Info,
  Check,
  X,
  Bold,
  Italic,
  List,
  Heading,
  AlertCircle,
  Shield,
  CreditCard,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { VisualHeader } from "@/components/visual-header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { TEXT_CATEGORIES } from "@/lib/mock-data"
import { CAUTION_EUR } from "@/lib/payout/constants"

export default function UploadTextPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [cautionLoading, setCautionLoading] = useState(false)

  const hasPaidCaution = user?.depositStatus?.infoporter10 ?? false
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    investmentGoal: "",
    isFree: false,
  })
  const [content, setContent] = useState("")
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 150))
      setUploadProgress(i)
    }

    // Redirect to projects page
    router.push("/dashboard/projects?type=text")
  }

  if (!user || !user.roles.includes("infoporter")) {
    return (
      <div className="min-h-screen bg-slate-950">
        <VisualHeader />
        <main className="pt-24 pb-12 cinema-section">
          <div className="container mx-auto px-4">
            <Card className="max-w-lg mx-auto bg-slate-900/50 border-white/10">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <X className="h-8 w-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Accès restreint
                </h2>
                <p className="text-white/60 mb-6">
                  Vous devez avoir le statut Infoporteur pour déposer un écrit.
                  Payez la caution de 10€ pour débloquer cette fonctionnalité.
                </p>
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white">
                    Retour au tableau de bord
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <VisualHeader />

      <main className="pt-24 pb-12 cinema-section">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>

          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Déposer un écrit
              </h1>
              <p className="text-white/60">
                Partagez votre creation litteraire avec la communaute VIXUAL
              </p>
            </div>

            {/* Caution Gate */}
            {!hasPaidCaution && (
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                      <Shield className="h-6 w-6 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{"Caution requise"}</h3>
                      <p className="text-white/60 text-sm mb-4">
                        {"Pour publier du contenu sur VIXUAL, vous devez d'abord payer la caution createur de "}
                        {CAUTION_EUR.creator}
                        {"€. Cette caution est remboursable en cas de résiliation de votre compte."}
                      </p>
                      <Button
                        onClick={async () => {
                          if (!user) return
                          setCautionLoading(true)
                          try {
                            const res = await fetch("/api/stripe/caution", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ userId: user.id, cautionType: "creator" }),
                            })
                            const result = await res.json()
                            if (result.error) {
                              alert(result.error)
                            } else {
                              alert("Caution payee avec succes (mock). En production, Stripe Checkout s'ouvrira.")
                            }
                          } catch {
                            alert("Erreur de paiement")
                          } finally {
                            setCautionLoading(false)
                          }
                        }}
                        disabled={cautionLoading}
                        className="bg-amber-600 hover:bg-amber-500 text-white"
                      >
                        {cautionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CreditCard className="h-4 w-4 mr-2" />
                        )}
                        {"Payer la caution ("}
                        {CAUTION_EUR.creator}
                        {"€)"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cover image */}
              <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-amber-400" />
                    Image de couverture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      coverFile
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    {coverFile ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                          <Check className="h-6 w-6 text-emerald-400" />
                        </div>
                        <p className="text-white font-medium">{coverFile.name}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCoverFile(null)}
                          className="bg-transparent border-white/20 text-white hover:bg-white/10"
                        >
                          Changer l'image
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                          <ImageIcon className="h-6 w-6 text-white/60" />
                        </div>
                        <p className="text-white mb-2">
                          Ajoutez une image de couverture pour votre écrit
                        </p>
                        <p className="text-white/60 text-sm">
                          JPG, PNG - Format portrait recommandé
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            setCoverFile(e.target.files?.[0] || null)
                          }
                        />
                      </label>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Details */}
              <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Info className="h-5 w-5 text-sky-400" />
                    Informations du projet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">
                      Titre
                    </Label>
                    <Input
                      id="title"
                      placeholder="Le titre de votre écrit"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="bg-slate-800 border-white/20 text-white placeholder:text-white/40"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">
                      Résumé / Accroche
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez votre écrit en quelques lignes pour attirer les lecteurs..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="bg-slate-800 border-white/20 text-white placeholder:text-white/40 min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-white">
                        Genre
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger className="bg-slate-800 border-white/20 text-white">
                          <SelectValue placeholder="Sélectionnez un genre" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/20">
                          {TEXT_CATEGORIES.filter((c) => c !== "Tous").map(
                            (category) => (
                              <SelectItem
                                key={category}
                                value={category}
                                className="text-white hover:bg-white/10"
                              >
                                {category}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goal" className="text-white">
                        Objectif d'investissement (€)
                      </Label>
                      <Input
                        id="goal"
                        type="number"
                        min="100"
                        max="20000"
                        placeholder="Ex: 2000"
                        value={formData.investmentGoal}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            investmentGoal: e.target.value,
                          })
                        }
                        className="bg-slate-800 border-white/20 text-white placeholder:text-white/40"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Contenu gratuit</p>
                      <p className="text-white/60 text-sm">
                        Permettre la lecture gratuite de votre écrit
                      </p>
                    </div>
                    <Switch
                      checked={formData.isFree}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isFree: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Content editor */}
              <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-amber-400" />
                      Contenu
                    </span>
                    <span className="text-sm font-normal text-white/60">
                      {wordCount.toLocaleString()} mots
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Simple toolbar */}
                  <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <Heading className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  <Textarea
                    placeholder="Commencez à écrire votre texte ici...

Vous pouvez copier-coller votre contenu depuis un document Word ou Google Docs. Le formatage de base sera conservé."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-slate-800 border-white/20 text-white placeholder:text-white/40 min-h-[400px] font-serif text-lg leading-relaxed"
                    required
                  />

                  <p className="text-white/50 text-sm">
                    Astuce : Vous pouvez également importer un fichier .txt ou .docx
                  </p>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Importer un fichier
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upload progress */}
              {isUploading && (
                <Card className="bg-slate-900/50 border-emerald-500/30">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          Publication en cours...
                        </span>
                        <span className="text-emerald-400">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2 bg-slate-800" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                  disabled={isUploading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white"
                  disabled={isUploading || !content || !coverFile || !hasPaidCaution}
                >
                  {!hasPaidCaution ? "Caution requise" : isUploading ? "Publication..." : "Publier l'écrit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
