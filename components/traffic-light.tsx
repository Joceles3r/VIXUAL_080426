"use client"

import { useState, useEffect } from "react"

interface TrafficLightProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function TrafficLight({ size = "md", className = "" }: TrafficLightProps) {
  const [activeLight, setActiveLight] = useState(0) // 0=red, 1=yellow, 2=green

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLight((prev) => (prev + 1) % 3)
    }, 700) // Slightly faster for more fun
    return () => clearInterval(interval)
  }, [])

  // Red disc is larger than others for emphasis
  const sizeClasses = {
    sm: { 
      redLight: "w-3.5 h-3.5", 
      light: "w-2.5 h-2.5", 
      gap: "gap-1", 
      padding: "p-1.5", 
      pole: "w-1.5 h-2",
      housing: "rounded-xl"
    },
    md: { 
      redLight: "w-6 h-6", 
      light: "w-4 h-4", 
      gap: "gap-1.5", 
      padding: "p-2", 
      pole: "w-2 h-3",
      housing: "rounded-2xl"
    },
    lg: { 
      redLight: "w-7 h-7", 
      light: "w-5 h-5", 
      gap: "gap-2", 
      padding: "p-2.5", 
      pole: "w-2.5 h-4",
      housing: "rounded-2xl"
    },
  }

  const { redLight, light, gap, padding, pole, housing } = sizeClasses[size]

  return (
    <div
      className={`flex flex-col items-center ${className}`}
      title="Le feu VIXUAL symbolise la progression des projets creatifs."
      role="img"
      aria-label="Feu tricolore VIXUAL : symbole identitaire de la progression des projets creatifs"
    >
      {/* Boitier du feu tricolore - Style fun avec gradient colore */}
      <div 
        className={`relative flex flex-col items-center ${gap} ${padding} ${housing} bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl border-2 border-slate-500/60`}
        style={{ 
          boxShadow: "0 8px 25px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.15), 0 0 20px rgba(100,100,100,0.1)",
          background: "linear-gradient(145deg, #475569 0%, #334155 30%, #1e293b 100%)"
        }}
      >
        {/* Petite visiere decorative en haut */}
        <div 
          className="absolute -top-1 left-1/2 -translate-x-1/2 w-4/5 h-1.5 rounded-t-lg"
          style={{ background: "linear-gradient(to bottom, #64748b, #475569)" }}
        />
        
        {/* Reflet lumineux sur le boitier */}
        <div className="absolute top-1 left-1 w-2 h-6 bg-gradient-to-b from-white/20 to-transparent rounded-full blur-sm" />
        
        {/* Rouge - PLUS GRAND */}
        <div 
          className={`${redLight} rounded-full transition-all duration-200 border-[3px] relative overflow-hidden ${
            activeLight === 0 
              ? "bg-gradient-to-br from-red-400 via-red-500 to-red-600 border-red-300 scale-110" 
              : "bg-gradient-to-br from-red-950 to-red-900 border-red-800/40"
          }`}
          style={activeLight === 0 ? { 
            boxShadow: "0 0 20px 8px rgba(239,68,68,0.7), 0 0 40px 12px rgba(239,68,68,0.4), inset 0 -3px 6px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.3)",
            animation: "bounce 0.5s ease-in-out infinite alternate"
          } : { boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)" }}
        >
          {activeLight === 0 && <div className="absolute top-1 left-1 w-2 h-2 bg-white/50 rounded-full blur-[2px]" />}
        </div>
        
        {/* Jaune */}
        <div 
          className={`${light} rounded-full transition-all duration-200 border-[3px] relative overflow-hidden ${
            activeLight === 1 
              ? "bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 border-yellow-200 scale-110" 
              : "bg-gradient-to-br from-yellow-950 to-amber-900 border-yellow-800/40"
          }`}
          style={activeLight === 1 ? { 
            boxShadow: "0 0 20px 8px rgba(250,204,21,0.7), 0 0 40px 12px rgba(250,204,21,0.4), inset 0 -3px 6px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.3)",
            animation: "bounce 0.5s ease-in-out infinite alternate"
          } : { boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)" }}
        >
          {activeLight === 1 && <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white/50 rounded-full blur-[2px]" />}
        </div>
        
        {/* Vert */}
        <div 
          className={`${light} rounded-full transition-all duration-200 border-[3px] relative overflow-hidden ${
            activeLight === 2 
              ? "bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 border-emerald-200 scale-110" 
              : "bg-gradient-to-br from-emerald-950 to-teal-900 border-emerald-800/40"
          }`}
          style={activeLight === 2 ? { 
            boxShadow: "0 0 20px 8px rgba(52,211,153,0.7), 0 0 40px 12px rgba(52,211,153,0.4), inset 0 -3px 6px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.3)",
            animation: "bounce 0.5s ease-in-out infinite alternate"
          } : { boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)" }}
        >
          {activeLight === 2 && <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white/50 rounded-full blur-[2px]" />}
        </div>
      </div>
      
      {/* Pied/Poteau du feu - Style ameliore */}
      <div 
        className={`${pole} rounded-b-md`}
        style={{ 
          background: "linear-gradient(to bottom, #64748b 0%, #475569 50%, #334155 100%)",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
        }}
      />
    </div>
  )
}
