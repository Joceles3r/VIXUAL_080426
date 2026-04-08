"use client"

import { useState } from "react"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const languages = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
]

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState("fr")
  
  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 transition-all"
          aria-label="Changer de langue"
        >
          <Globe className="h-5 w-5 text-white/80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-gradient-to-b from-slate-900 to-slate-950 border-emerald-500/30 text-white"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setCurrentLang(lang.code)}
            className={`cursor-pointer focus:bg-emerald-600/30 focus:text-white ${
              currentLang === lang.code ? "bg-emerald-600/20" : ""
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            <span>{lang.label}</span>
            {currentLang === lang.code && (
              <span className="ml-auto text-emerald-400">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
