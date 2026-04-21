"use client"

import React from "react"

import {
  BookOpen,
  HelpCircle,
  Trophy,
  Compass,
  Film,
  FileText,
  Mic,
  LayoutDashboard,
  User,
  Users,
  Settings,
  Mail,
  Star,
  Upload,
  Wallet,
  History,
  Heart,
  MessageCircle,
  Share2,
  Crown,
  Shield,
  Archive,
  Rocket,
} from "lucide-react"

// VERROU FINAL: Cles officielles uniquement
export type VixualRole =
  | "guest"
  | "visitor"
  | "creator"
  | "contributor"
  | "infoporteur"
  | "podcasteur"
  | "auditeur"
  | "contribu_lecteur"

/** @deprecated Use VixualRole instead */
export type VisualRole = VixualRole

export type NavItem = {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  roles?: VixualRole[]
}

export type NavMenu = {
  label: string
  items: NavItem[]
}

// Menu "Découvrir" (public)
export const DISCOVER_MENU: NavMenu = {
  label: "Découvrir",
  items: [
    { label: "Guide des profils", href: "/guide-profiles", icon: Crown },
    { label: "Comment ça marche", href: "/how-it-works", icon: BookOpen },
    { label: "Guide Paiements", href: "/guide-stripe", icon: Wallet },
    { label: "FAQ", href: "/faq", icon: HelpCircle },
    { label: "Classements TOP 10/100/500", href: "/leaderboard", icon: Trophy },
    { label: "Top Contributeurs", href: "/top-contributors", icon: Star },
    { label: "Trust Score", href: "/trust-score", icon: Shield },
    { label: "Ticket Gold", href: "/ticket-gold", icon: Rocket },
    { label: "Soutien Libre", href: "/soutien-libre", icon: Heart },
  ],
}

// Menu "Explorer" (public)
export const EXPLORE_MENU: NavMenu = {
  label: "Explorer",
  items: [
    { label: "Films & Videos", href: "/explore?tab=video", icon: Film },
    { label: "Livres & Articles", href: "/explore?tab=text", icon: FileText },
    { label: "Podcasts", href: "/explore?tab=podcast", icon: Mic },
    { label: "Tout Explorer", href: "/explore", icon: Compass },
    { label: "Archives & Statistiques", href: "/archives-statistiques", icon: Archive },
    { label: "Vixual Social", href: "/social", icon: MessageCircle },
  ],
}

// Menu "Mon Espace" (inscrits) + items conditionnels par roles - VERROU FINAL
export const MY_SPACE_MENU: NavMenu = {
  label: "Mon Espace",
  items: [
    // Commun (tous les inscrits)
    {
      label: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["visitor", "creator", "contributor", "infoporteur", "contribu_lecteur", "podcasteur", "auditeur"],
    },
    {
      label: "Mon profil",
      href: "/dashboard/profile",
      icon: User,
      roles: ["visitor", "creator", "contributor", "infoporteur", "contribu_lecteur", "podcasteur", "auditeur"],
    },
    {
      label: "Parametres",
      href: "/dashboard/settings",
      icon: Settings,
      roles: ["visitor", "creator", "contributor", "infoporteur", "contribu_lecteur", "podcasteur", "auditeur"],
    },
    {
      label: "Support (Boite interne)",
      href: "/support/mailbox",
      icon: Mail,
      roles: ["visitor", "creator", "contributor", "infoporteur", "contribu_lecteur", "podcasteur", "auditeur"],
    },

    // VISITEUR (+ tous les inscrits)
    {
      label: "Mes VIXUpoints",
      href: "/dashboard/visupoints",
      icon: Star,
      roles: ["visitor", "creator", "contributor", "infoporteur", "contribu_lecteur", "podcasteur", "auditeur"],
    },
    {
      label: "Mes favoris / suivis",
      href: "/dashboard/favorites",
      icon: Heart,
      roles: ["visitor", "creator", "contributor", "infoporteur", "contribu_lecteur", "podcasteur", "auditeur"],
    },

    // CREATEUR (video)
    {
      label: "Deposer un film/video",
      href: "/upload",
      icon: Upload,
      roles: ["creator"],
    },
    {
      label: "Mes films & videos",
      href: "/dashboard/projects?type=video",
      icon: Film,
      roles: ["creator"],
    },

    // INFOPORTEUR (ecrit)
    {
      label: "Deposer un livre/article",
      href: "/upload/text",
      icon: Upload,
      roles: ["infoporteur"],
    },
    {
      label: "Mes livres & articles",
      href: "/dashboard/projects?type=text",
      icon: FileText,
      roles: ["infoporteur"],
    },

    // PODCASTEUR (podcast)
    {
      label: "Deposer un podcast",
      href: "/upload/podcast",
      icon: Upload,
      roles: ["podcasteur"],
    },
    {
      label: "Mes podcasts",
      href: "/dashboard/projects?type=podcast",
      icon: Mic,
      roles: ["podcasteur"],
    },

    // CONTRIBUTEUR (video)
    {
      label: "Mes contributions (films & videos)",
      href: "/dashboard/investments?type=video",
      icon: Film,
      roles: ["contributor"],
    },

    // CONTRIBU-LECTEUR (ecrit)
    {
      label: "Mes contributions (livres & articles)",
      href: "/dashboard/investments?type=text",
      icon: FileText,
      roles: ["contribu_lecteur"],
    },

    // AUDITEUR (podcast)
    {
      label: "Explorer les podcasts",
      href: "/explore?type=podcast",
      icon: Compass,
      roles: ["auditeur"],
    },
    {
      label: "Mes contributions (podcast)",
      href: "/dashboard/investments?type=podcast",
      icon: Mic,
      roles: ["auditeur"],
    },

    // PROMOTION / PARRAINAGE (tous les inscrits)
    {
      label: "Promotion / Parrainage",
      href: "/dashboard/promo",
      icon: Share2,
      roles: ["visitor", "creator", "contributor", "infoporteur", "contribu_lecteur", "podcasteur", "auditeur"],
    },

    // WALLET (contributeurs + createurs)
    {
      label: "Mon wallet / gains",
      href: "/dashboard/wallet",
      icon: Wallet,
      roles: ["contributor", "contribu_lecteur", "auditeur", "creator", "infoporteur", "podcasteur"],
    },
    {
      label: "Historique",
      href: "/dashboard/history",
      icon: History,
      roles: ["contributor", "contribu_lecteur", "auditeur", "creator", "infoporteur", "podcasteur"],
    },
  ],
}

// Admin (hors profils — visibilite geree par isAdmin, pas par roles)
export const ADMIN_ITEM = {
  label: "Administration",
  href: "/admin",
  icon: Settings,
} as const

// Helper pour vérifier les rôles
export function hasAnyRole(userRoles: VisualRole[], itemRoles?: VisualRole[]) {
  if (!itemRoles || itemRoles.length === 0) return true
  return itemRoles.some((r) => userRoles.includes(r))
}
