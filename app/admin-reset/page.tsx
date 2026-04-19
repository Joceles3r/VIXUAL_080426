"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminResetPage() {
  const [email, setEmail] = useState("jocelyndru@gmail.com")
  const [newPassword, setNewPassword] = useState("Vixual2026!")
  const [secretKey, setSecretKey] = useState("VIXUAL_TEMP_RESET_2026")
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, secretKey })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(`Succes! Mot de passe reinitialise pour ${data.user.email} (${data.user.role})`)
      } else {
        setResult(`Erreur: ${data.error}`)
      }
    } catch (error) {
      setResult(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0A0A1B 0%, #1a1a3e 100%)" }}>
      <Card className="w-full max-w-md border-[#7A00FF]/30" style={{ background: "rgba(10, 10, 27, 0.9)" }}>
        <CardHeader>
          <CardTitle className="text-white">Reinitialisation Admin VIXUAL</CardTitle>
          <CardDescription className="text-gray-400">
            Page temporaire - A SUPPRIMER apres utilisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/50 border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-300">Nouveau mot de passe</label>
            <Input 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-black/50 border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-300">Cle secrete</label>
            <Input 
              value={secretKey} 
              onChange={(e) => setSecretKey(e.target.value)}
              className="bg-black/50 border-gray-700 text-white"
            />
          </div>
          
          <Button 
            onClick={handleReset} 
            disabled={loading}
            className="w-full bg-[#7A00FF] hover:bg-[#6200cc]"
          >
            {loading ? "Reinitialisation..." : "Reinitialiser le mot de passe"}
          </Button>
          
          {result && (
            <div className={`p-3 rounded text-sm ${result.startsWith("Succes") ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"}`}>
              {result}
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-4">
            Apres reinitialisation, connectez-vous sur /login avec vos nouveaux identifiants.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
