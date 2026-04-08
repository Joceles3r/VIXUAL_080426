"use client"

import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSoundContext } from "./sound-provider"

export function SoundToggle() {
  const { enabled, toggle, playSpark } = useSoundContext()

  const handleClick = () => {
    toggle()
    // Joue le jingle principal lors de l'activation
    if (!enabled) {
      setTimeout(() => playSpark(), 100)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={enabled ? "Désactiver les sons" : "Activer les sons"}
          >
            {enabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4 opacity-50" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{enabled ? "Sons activés" : "Sons désactivés"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
