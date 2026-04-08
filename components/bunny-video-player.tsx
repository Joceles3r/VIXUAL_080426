"use client";

/**
 * VIXUAL — components/bunny-video-player.tsx
 * 
 * Composant video Bunny.net unifie pour Stream (iframe) et Storage (video native).
 */

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BunnyVideoPlayerProps {
  /** URL de la video (HLS, MP4, ou embed URL) */
  src: string;
  /** Type de source */
  type?: "stream" | "storage" | "embed";
  /** URL du thumbnail */
  poster?: string;
  /** Titre pour accessibilite */
  title?: string;
  /** Autoplay (muted required for autoplay) */
  autoplay?: boolean;
  /** Loop video */
  loop?: boolean;
  /** Muted par defaut */
  muted?: boolean;
  /** Afficher les controles */
  controls?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
  /** Ratio d'aspect */
  aspectRatio?: "16/9" | "4/3" | "1/1" | "9/16";
  /** Callback quand la video demarre */
  onPlay?: () => void;
  /** Callback quand la video se termine */
  onEnded?: () => void;
  /** Callback en cas d'erreur */
  onError?: (error: string) => void;
}

// ── Composant Principal ───────────────────────────────────────────────────────

export function BunnyVideoPlayer({
  src,
  type = "storage",
  poster,
  title = "Video VIXUAL",
  autoplay = false,
  loop = false,
  muted = false,
  controls = true,
  className,
  aspectRatio = "16/9",
  onPlay,
  onEnded,
  onError,
}: BunnyVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted || autoplay);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detecter le type automatiquement si non specifie
  const detectedType = React.useMemo(() => {
    if (type !== "storage") return type;
    if (src.includes("iframe.mediadelivery.net")) return "embed";
    if (src.includes(".m3u8")) return "stream";
    return "storage";
  }, [src, type]);

  // Gestion du chargement
  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement | HTMLIFrameElement>) => {
    setIsLoading(false);
    setHasError(true);
    const message = "Impossible de charger la video";
    setErrorMessage(message);
    onError?.(message);
    console.error("[BunnyVideoPlayer] Error:", e);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    onPlay?.();
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onEnded?.();
  };

  // Controles
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  // Aspect ratio class
  const aspectClass = {
    "16/9": "aspect-video",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
    "9/16": "aspect-[9/16]",
  }[aspectRatio];

  // ── Render Embed (iframe) ───────────────────────────────────────────────────

  if (detectedType === "embed") {
    return (
      <div
        ref={containerRef}
        className={cn(
          "relative bg-black rounded-lg overflow-hidden",
          aspectClass,
          className
        )}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        )}
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          onLoad={() => setIsLoading(false)}
          onError={handleError}
        />
      </div>
    );
  }

  // ── Render Video Native ─────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group",
        aspectClass,
        className
      )}
    >
      {/* Loading state */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 p-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mb-3" />
          <p className="text-white/60 text-sm text-center">{errorMessage}</p>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoplay}
        loop={loop}
        muted={isMuted}
        playsInline
        className="absolute inset-0 w-full h-full object-contain"
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
      />

      {/* Custom controls overlay */}
      {controls && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Play/Pause center button */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </button>

          {/* Bottom controls bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
            <button
              onClick={toggleMute}
              className="p-2 text-white/80 hover:text-white transition-colors"
              aria-label={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Plein ecran"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Variantes Pre-configurees ─────────────────────────────────────────────────

export function BunnyProjectVideo(props: Omit<BunnyVideoPlayerProps, "aspectRatio">) {
  return <BunnyVideoPlayer {...props} aspectRatio="16/9" />;
}

export function BunnyPreviewVideo(props: Omit<BunnyVideoPlayerProps, "aspectRatio" | "controls">) {
  return <BunnyVideoPlayer {...props} aspectRatio="16/9" controls={false} muted autoplay loop />;
}

export default BunnyVideoPlayer;
