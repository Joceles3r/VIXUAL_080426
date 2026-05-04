/**
 * VIXUAL Sound Synthesizer
 * 
 * Génère les jingles VIXUAL via Web Audio API
 * Aucun fichier externe requis - sons générés dynamiquement
 * 
 * Tonalité : Sol (G) comme note de base
 * Style : futuriste, lumineux, positif
 */

import type { SoundName } from "./types"

// Fréquences des notes (Hz)
const NOTES = {
  G4: 392.00,   // Sol4
  A4: 440.00,   // La4
  B4: 493.88,   // Si4
  C5: 523.25,   // Do5
  D5: 587.33,   // Ré5
  E5: 659.25,   // Mi5
  G5: 783.99,   // Sol5
  A5: 880.00,   // La5
  C6: 1046.50,  // Do6
  E6: 1318.51,  // Mi6
  G6: 1567.98,  // Sol6
  C7: 2093.00,  // Do7
}

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

// Oscillateur avec enveloppe ADSR
function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
  attack = 0.02,
  decay = 0.1,
  sustain = 0.7,
  release = 0.15
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, startTime)
  
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(volume, startTime + attack)
  gain.gain.linearRampToValueAtTime(volume * sustain, startTime + attack + decay)
  gain.gain.setValueAtTime(volume * sustain, startTime + duration - release)
  gain.gain.linearRampToValueAtTime(0, startTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(startTime)
  osc.stop(startTime + duration + 0.1)
}

// Accord (plusieurs notes simultanées)
function playChord(
  ctx: AudioContext,
  freqs: number[],
  startTime: number,
  duration: number,
  volume: number
) {
  freqs.forEach((freq) => {
    playTone(ctx, freq, startTime, duration, volume / freqs.length, "sine", 0.05, 0.15, 0.6, 0.3)
  })
}

// Shimmer effect (brillance)
function playShimmer(
  ctx: AudioContext,
  baseFreq: number,
  startTime: number,
  duration: number,
  volume: number
) {
  const harmonics = [1, 2, 3, 4, 5]
  harmonics.forEach((h, i) => {
    const detune = Math.random() * 10 - 5
    playTone(
      ctx,
      baseFreq * h + detune,
      startTime + i * 0.02,
      duration - i * 0.05,
      volume / (h * 2),
      "sine",
      0.01,
      0.05,
      0.3,
      duration * 0.5
    )
  })
}

// ══════════════════════════════════════════════════════════════
// JINGLES VIXUAL
// ══════════════════════════════════════════════════════════════

/**
 * VIXUAL Spark - Jingle principal (~2s)
 * Structure: pling → pling-plong → whoom
 * Notes: G5 → G5-C6 → C6+E6+G6 (accord)
 */
function playSpark(ctx: AudioContext, masterVolume: number) {
  const now = ctx.currentTime
  const vol = masterVolume * 0.6

  // 1. Ouverture - pling (G5)
  playTone(ctx, NOTES.G5, now, 0.35, vol, "sine", 0.01, 0.05, 0.8, 0.2)
  
  // 2. Montée - pling-plong (G5 → C6)
  playTone(ctx, NOTES.G5, now + 0.5, 0.25, vol * 0.9, "sine", 0.01, 0.05, 0.7, 0.15)
  playTone(ctx, NOTES.C6, now + 0.75, 0.35, vol, "sine", 0.01, 0.08, 0.8, 0.2)

  // 3. Signature finale - whoom (accord C6+E6+G6)
  playChord(ctx, [NOTES.C6, NOTES.E6, NOTES.G6], now + 1.3, 0.7, vol * 1.1)
  playShimmer(ctx, NOTES.C6, now + 1.4, 0.5, vol * 0.3)
}

/**
 * VIXUAL Pulse - Mini notification (~0.6s)
 * Structure: pling-ting
 */
function playPulse(ctx: AudioContext, masterVolume: number) {
  const now = ctx.currentTime
  const vol = masterVolume * 0.4

  playTone(ctx, NOTES.E5, now, 0.2, vol, "sine", 0.01, 0.03, 0.7, 0.1)
  playTone(ctx, NOTES.G5, now + 0.25, 0.3, vol * 1.1, "sine", 0.01, 0.05, 0.6, 0.15)
}

/**
 * VIXUAL Win - Gain utilisateur (~1.2s)
 * Structure: ting → ta-da
 * Notes: C6 → G6 → C7
 */
function playWin(ctx: AudioContext, masterVolume: number) {
  const now = ctx.currentTime
  const vol = masterVolume * 0.5

  // Ting
  playTone(ctx, NOTES.C6, now, 0.25, vol, "sine", 0.01, 0.05, 0.8, 0.15)
  
  // Ta-da (montée festive)
  playTone(ctx, NOTES.G6, now + 0.35, 0.25, vol * 1.1, "sine", 0.01, 0.05, 0.8, 0.15)
  playTone(ctx, NOTES.C7, now + 0.65, 0.5, vol * 1.2, "sine", 0.02, 0.1, 0.7, 0.25)
  
  // Sparkle
  playShimmer(ctx, NOTES.C7, now + 0.7, 0.4, vol * 0.25)
}

/**
 * VIXUAL Boost - Projet populaire (~1.4s)
 * Structure: pulse → rising tone → sparkle
 */
function playBoost(ctx: AudioContext, masterVolume: number) {
  const now = ctx.currentTime
  const vol = masterVolume * 0.5

  // Pulse basse
  playTone(ctx, NOTES.G4, now, 0.15, vol * 0.8, "sine", 0.01, 0.03, 0.6, 0.08)
  
  // Rising tone (montée progressive)
  playTone(ctx, NOTES.C5, now + 0.2, 0.2, vol * 0.9, "sine", 0.01, 0.05, 0.7, 0.1)
  playTone(ctx, NOTES.E5, now + 0.4, 0.2, vol, "sine", 0.01, 0.05, 0.7, 0.1)
  playTone(ctx, NOTES.G5, now + 0.6, 0.25, vol * 1.1, "sine", 0.01, 0.05, 0.8, 0.12)
  
  // Sparkle final
  playChord(ctx, [NOTES.C6, NOTES.E6], now + 0.9, 0.45, vol * 0.9)
  playShimmer(ctx, NOTES.G5, now + 1.0, 0.35, vol * 0.2)
}

/**
 * Click UI (~0.1s)
 */
function playClick(ctx: AudioContext, masterVolume: number) {
  const now = ctx.currentTime
  playTone(ctx, NOTES.G5, now, 0.08, masterVolume * 0.15, "sine", 0.005, 0.02, 0.5, 0.03)
}

/**
 * Success (~0.8s)
 */
function playSuccess(ctx: AudioContext, masterVolume: number) {
  const now = ctx.currentTime
  const vol = masterVolume * 0.4

  playTone(ctx, NOTES.G5, now, 0.2, vol, "sine", 0.01, 0.05, 0.7, 0.1)
  playTone(ctx, NOTES.C6, now + 0.25, 0.5, vol * 1.1, "sine", 0.02, 0.1, 0.6, 0.25)
}

/**
 * Error (~0.4s)
 */
function playError(ctx: AudioContext, masterVolume: number) {
  const now = ctx.currentTime
  const vol = masterVolume * 0.3

  playTone(ctx, NOTES.E5, now, 0.15, vol, "sawtooth", 0.01, 0.03, 0.5, 0.08)
  playTone(ctx, NOTES.C5, now + 0.18, 0.2, vol * 0.8, "sawtooth", 0.01, 0.03, 0.4, 0.1)
}

// ══════════════════════════════════════════════════════════════
// API PUBLIQUE
// ══════════════════════════════════════════════════════════════

const SOUND_PLAYERS: Record<SoundName, (ctx: AudioContext, vol: number) => void> = {
  spark: playSpark,
  pulse: playPulse,
  win: playWin,
  boost: playBoost,
  click: playClick,
  success: playSuccess,
  error: playError,
}

export async function playSound(name: SoundName, masterVolume = 0.7): Promise<void> {
  if (typeof window === "undefined") return
  
  try {
    const ctx = getAudioContext()
    
    // Resume context si suspendu (autoplay policy)
    if (ctx.state === "suspended") {
      await ctx.resume()
    }

    const player = SOUND_PLAYERS[name]
    if (player) {
      player(ctx, masterVolume)
    }
  } catch (err) {
    console.warn("[VIXUAL Sound] Failed to play sound:", name, err)
  }
}

export function stopAllSounds(): void {
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
}
