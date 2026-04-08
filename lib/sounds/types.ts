/**
 * VIXUAL Sound System - Types
 * 
 * Identité sonore officielle de VIXUAL
 * Jingles courts, mémorisables, positifs, futuristes
 */

export type SoundName =
  | "spark"       // Jingle principal (~2s) - ouverture, découverte
  | "pulse"       // Mini notification (~0.6s) - notifications, messages
  | "win"         // Gain utilisateur (~1.2s) - argent, VIXUpoints, TOP
  | "boost"       // Projet populaire (~1.4s) - tendance, badges
  | "click"       // Clic UI (~0.1s) - interactions boutons
  | "success"     // Succès action (~0.8s) - confirmation
  | "error"       // Erreur (~0.4s) - échec action

export interface SoundConfig {
  name: SoundName
  description: string
  duration: number // en secondes
  volume: number   // 0-1
}

export const SOUND_CONFIGS: Record<SoundName, SoundConfig> = {
  spark: {
    name: "spark",
    description: "Vixual Spark - Jingle principal d'ouverture",
    duration: 2.0,
    volume: 0.6,
  },
  pulse: {
    name: "pulse",
    description: "Vixual Pulse - Mini notification",
    duration: 0.6,
    volume: 0.4,
  },
  win: {
    name: "win",
    description: "Vixual Win - Gain utilisateur",
    duration: 1.2,
    volume: 0.5,
  },
  boost: {
    name: "boost",
    description: "Vixual Boost - Projet populaire/tendance",
    duration: 1.4,
    volume: 0.5,
  },
  click: {
    name: "click",
    description: "Clic UI discret",
    duration: 0.1,
    volume: 0.2,
  },
  success: {
    name: "success",
    description: "Succès d'action",
    duration: 0.8,
    volume: 0.4,
  },
  error: {
    name: "error",
    description: "Erreur/échec",
    duration: 0.4,
    volume: 0.3,
  },
}

export interface SoundState {
  enabled: boolean
  volume: number // 0-1 master volume
}

export const DEFAULT_SOUND_STATE: SoundState = {
  enabled: true,
  volume: 0.7,
}
