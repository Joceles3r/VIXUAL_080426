/**
 * VIXUAL TICKET GOLD ENGINE
 * 
 * Systeme de boost temporaire simple et equitable:
 * - 5EUR par ticket
 * - Boost de visibilite pendant 48h
 * - Maximum 1 ticket par mois par projet
 * 
 * INTERDIT:
 * - Modification des votes
 * - Gain financier direct
 * - Acces gratuit massif
 */

// ── Types ──

export interface TicketGold {
  id: string;
  projectId: string;
  userId: string;
  purchasedAt: Date;
  activatedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  boostMultiplier: number;
  stripePaymentId?: string;
}

export interface TicketGoldPurchase {
  projectId: string;
  userId: string;
  paymentIntentId?: string;
}

export interface TicketGoldStatus {
  canPurchase: boolean;
  reason?: string;
  lastPurchaseDate?: Date;
  nextAvailableDate?: Date;
  activeTicket?: TicketGold;
}

export interface ProjectVisibilityBoost {
  projectId: string;
  baseVisibility: number;
  boostedVisibility: number;
  boostActive: boolean;
  boostExpiresAt?: Date;
  badge: "boost_gold" | null;
}

// ── Constants ──

export const TICKET_GOLD_CONFIG = {
  /** Prix en centimes EUR */
  priceEurCents: 500,
  /** Prix affiche */
  priceDisplay: "5,00 EUR",
  /** Duree du boost en heures */
  boostDurationHours: 48,
  /** Cooldown entre achats (jours) */
  cooldownDays: 30,
  /** Multiplicateur de visibilite */
  boostMultiplier: 0.5, // +50% de visibilite
  /** Nom affiche */
  displayName: "Ticket Gold",
  /** Badge affiche */
  badgeText: "Boost Gold actif",
  /** Description courte */
  shortDescription: "Boostez la visibilite de votre projet pendant 48h",
} as const;

// ── Core Functions ──

/**
 * Verifie si un utilisateur peut acheter un Ticket Gold pour un projet
 */
export function canPurchaseTicketGold(
  projectId: string,
  userId: string,
  existingTickets: TicketGold[]
): TicketGoldStatus {
  const now = new Date();
  
  // Trouver le ticket actif pour ce projet
  const activeTicket = existingTickets.find(
    t => t.projectId === projectId && t.isActive && t.expiresAt && new Date(t.expiresAt) > now
  );
  
  if (activeTicket) {
    return {
      canPurchase: false,
      reason: "Un Ticket Gold est deja actif sur ce projet",
      activeTicket,
    };
  }
  
  // Verifier le cooldown (1 mois)
  const lastTicket = existingTickets
    .filter(t => t.projectId === projectId && t.userId === userId)
    .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime())[0];
  
  if (lastTicket) {
    const lastPurchaseDate = new Date(lastTicket.purchasedAt);
    const cooldownEnd = new Date(lastPurchaseDate);
    cooldownEnd.setDate(cooldownEnd.getDate() + TICKET_GOLD_CONFIG.cooldownDays);
    
    if (now < cooldownEnd) {
      return {
        canPurchase: false,
        reason: `Vous devez attendre ${Math.ceil((cooldownEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} jours avant de pouvoir racheter un Ticket Gold pour ce projet`,
        lastPurchaseDate,
        nextAvailableDate: cooldownEnd,
      };
    }
  }
  
  return {
    canPurchase: true,
  };
}

/**
 * Cree un nouveau Ticket Gold
 */
export function createTicketGold(
  projectId: string,
  userId: string,
  stripePaymentId?: string
): TicketGold {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setHours(expiresAt.getHours() + TICKET_GOLD_CONFIG.boostDurationHours);
  
  return {
    id: `tg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    userId,
    purchasedAt: now,
    activatedAt: now,
    expiresAt,
    isActive: true,
    boostMultiplier: TICKET_GOLD_CONFIG.boostMultiplier,
    stripePaymentId,
  };
}

/**
 * Calcule le score de visibilite avec boost Ticket Gold
 * 
 * Formule: visibility = base + engagement + freshness + boost
 * boost = base * 0.5 (si Ticket Gold actif)
 */
export function calculateBoostedVisibility(
  baseVisibility: number,
  engagementScore: number,
  freshnessScore: number,
  hasActiveTicketGold: boolean
): ProjectVisibilityBoost & { finalScore: number } {
  // Score de base sans boost
  const unboostedScore = baseVisibility + engagementScore + freshnessScore;
  
  // Calculer le boost si actif
  const boostAmount = hasActiveTicketGold 
    ? Math.round(baseVisibility * TICKET_GOLD_CONFIG.boostMultiplier)
    : 0;
  
  const finalScore = unboostedScore + boostAmount;
  
  return {
    projectId: "",
    baseVisibility,
    boostedVisibility: finalScore,
    boostActive: hasActiveTicketGold,
    badge: hasActiveTicketGold ? "boost_gold" : null,
    finalScore: Math.min(100, finalScore), // Cap a 100
  };
}

/**
 * Verifie et desactive les tickets expires
 */
export function checkAndExpireTickets(tickets: TicketGold[]): TicketGold[] {
  const now = new Date();
  return tickets.map(ticket => {
    if (ticket.isActive && ticket.expiresAt && new Date(ticket.expiresAt) <= now) {
      return { ...ticket, isActive: false };
    }
    return ticket;
  });
}

/**
 * Formate le temps restant du boost
 */
export function formatBoostTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const diff = new Date(expiresAt).getTime() - now.getTime();
  
  if (diff <= 0) return "Expire";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}min restantes`;
  }
  return `${minutes} minutes restantes`;
}

// ── UI Helpers ──

export const TICKET_GOLD_UI = {
  badge: {
    text: TICKET_GOLD_CONFIG.badgeText,
    icon: "Rocket",
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/30",
  },
  card: {
    gradient: "from-amber-500/20 to-yellow-600/20",
    borderColor: "border-amber-500/30",
  },
  button: {
    text: `Acheter Ticket Gold - ${TICKET_GOLD_CONFIG.priceDisplay}`,
    gradient: "from-amber-500 to-yellow-600",
    hoverGradient: "hover:from-amber-400 hover:to-yellow-500",
  },
} as const;

/**
 * Genere les metadata Stripe pour le paiement
 */
export function getStripeMetadata(projectId: string, userId: string): Record<string, string> {
  return {
    product_type: "ticket_gold",
    project_id: projectId,
    user_id: userId,
    boost_duration_hours: String(TICKET_GOLD_CONFIG.boostDurationHours),
    boost_multiplier: String(TICKET_GOLD_CONFIG.boostMultiplier),
  };
}
