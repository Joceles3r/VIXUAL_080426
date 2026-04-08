/**
 * VIXUAL Stripe Status Management
 * 
 * Gestion centralisee des statuts pour uniformiser UI, API et DB.
 */

import { 
  STRIPE_ACCOUNT_STATUSES, 
  VIXUAL_PAYMENT_STATUSES, 
  TICKET_GOLD_STATUSES,
  type StripeAccountStatus,
  type VixualPaymentStatus,
  type TicketGoldStatus,
} from "./constants";

// ── Labels francais pour l'UI ─────────────────────────────────────────────────

export const ACCOUNT_STATUS_LABELS: Record<StripeAccountStatus, string> = {
  none: "Aucun compte",
  pending: "En attente",
  restricted: "Restreint",
  verified: "Verifie",
  disabled: "Desactive",
};

export const PAYMENT_STATUS_LABELS: Record<VixualPaymentStatus, string> = {
  pending: "En attente",
  processing: "En cours",
  completed: "Complete",
  failed: "Echoue",
  refunded: "Rembourse",
  cancelled: "Annule",
};

export const TICKET_GOLD_STATUS_LABELS: Record<TicketGoldStatus, string> = {
  pending: "En attente",
  active: "Actif",
  expired: "Expire",
  cancelled: "Annule",
};

// ── Couleurs pour l'UI ────────────────────────────────────────────────────────

export const ACCOUNT_STATUS_COLORS: Record<StripeAccountStatus, string> = {
  none: "gray",
  pending: "amber",
  restricted: "orange",
  verified: "emerald",
  disabled: "red",
};

export const PAYMENT_STATUS_COLORS: Record<VixualPaymentStatus, string> = {
  pending: "amber",
  processing: "blue",
  completed: "emerald",
  failed: "red",
  refunded: "purple",
  cancelled: "gray",
};

export const TICKET_GOLD_STATUS_COLORS: Record<TicketGoldStatus, string> = {
  pending: "amber",
  active: "emerald",
  expired: "gray",
  cancelled: "red",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getAccountStatusLabel(status: StripeAccountStatus): string {
  return ACCOUNT_STATUS_LABELS[status] || status;
}

export function getPaymentStatusLabel(status: VixualPaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status] || status;
}

export function getTicketGoldStatusLabel(status: TicketGoldStatus): string {
  return TICKET_GOLD_STATUS_LABELS[status] || status;
}

export function isValidAccountStatus(status: string): status is StripeAccountStatus {
  return STRIPE_ACCOUNT_STATUSES.includes(status as StripeAccountStatus);
}

export function isValidPaymentStatus(status: string): status is VixualPaymentStatus {
  return VIXUAL_PAYMENT_STATUSES.includes(status as VixualPaymentStatus);
}

export function isValidTicketGoldStatus(status: string): status is TicketGoldStatus {
  return TICKET_GOLD_STATUSES.includes(status as TicketGoldStatus);
}
