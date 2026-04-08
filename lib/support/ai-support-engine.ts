/**
 * VIXUAL AI SUPPORT ENGINE
 * 
 * Systeme de support intelligent avec:
 * - IA Triage: Classification automatique des tickets
 * - IA Reponse: Reponses automatiques aux questions simples
 * - IA Escalade: Detection des cas necessitant intervention humaine
 * - IA Surveillance: Monitoring des patterns et alertes
 */

// ── Types ──

export type TicketPriority = "urgent" | "important" | "normal" | "faible";

export type TicketCategory = 
  | "paiement"
  | "compte"
  | "contenu"
  | "technique"
  | "signalement"
  | "partenariat"
  | "autre";

export type TicketStatus = 
  | "nouveau"
  | "en_triage"
  | "reponse_auto"
  | "escalade"
  | "en_cours"
  | "resolu"
  | "ferme";

export type EscalationTarget = 
  | "admin"
  | "admin_adjoint"
  | "support_paiement"
  | "support_technique"
  | "moderation"
  | "legal";

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
  aiTriageScore: number;
  aiSuggestedResponse?: string;
  escalationTarget?: EscalationTarget;
  assignedTo?: string;
  responses: TicketResponse[];
  metadata: {
    userRoles: string[];
    userTrustScore: number;
    relatedContentId?: string;
    relatedTransactionId?: string;
  };
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorType: "user" | "ai" | "support" | "admin";
  message: string;
  createdAt: Date;
  isAutomatic: boolean;
}

export interface AITriageResult {
  category: TicketCategory;
  priority: TicketPriority;
  confidence: number;
  escalationNeeded: boolean;
  escalationTarget?: EscalationTarget;
  suggestedResponse?: string;
  keywords: string[];
}

// ── Support Message Types (Admin Panel) ──

export type MessagePriority = "urgent" | "important" | "normal" | "low";
export type MessageCategory = 
  | "payment"
  | "technical"
  | "account"
  | "content"
  | "general"
  | "abuse"
  | "stripe_onboarding"
  | "ticket_gold"
  | "creator_support"
  | "archives_stats";

export type MessageStatus = "new" | "in_progress" | "waiting_user" | "resolved" | "closed";

export interface SupportMessage {
  id: string;
  userId: string;
  category: MessageCategory;
  priority: MessagePriority;
  subject: string;
  body: string;
  assignedEmployeeId?: string;
  status: MessageStatus;
  aiConfidence: number;
  aiAutoReplied: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const MESSAGE_PRIORITIES: Record<MessagePriority, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "rose" },
  important: { label: "Important", color: "amber" },
  normal: { label: "Normal", color: "sky" },
  low: { label: "Faible", color: "slate" },
};

export const MESSAGE_CATEGORIES: Record<MessageCategory, { label: string; description: string }> = {
  payment: { label: "Paiement", description: "Questions liees aux paiements et Stripe" },
  technical: { label: "Technique", description: "Bugs et problemes techniques" },
  account: { label: "Compte", description: "Gestion de compte et profil" },
  content: { label: "Contenu", description: "Questions sur les contenus" },
  general: { label: "General", description: "Questions generales" },
  abuse: { label: "Signalement", description: "Signalements d'abus ou fraude" },
  stripe_onboarding: { label: "Onboarding Stripe", description: "Activation compte Stripe" },
  ticket_gold: { label: "Ticket Gold", description: "Questions sur les Tickets Gold" },
  creator_support: { label: "Support Createur", description: "Aide aux createurs" },
  archives_stats: { label: "Archives/Stats", description: "Questions archives et statistiques" },
};

// ── Constants ──

export const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; slaHours: number }> = {
  urgent: { label: "Urgent", color: "rose", slaHours: 2 },
  important: { label: "Important", color: "amber", slaHours: 8 },
  normal: { label: "Normal", color: "sky", slaHours: 24 },
  faible: { label: "Faible", color: "slate", slaHours: 72 },
};

export const CATEGORY_CONFIG: Record<TicketCategory, { label: string; icon: string; defaultPriority: TicketPriority }> = {
  paiement: { label: "Paiement / Transaction", icon: "CreditCard", defaultPriority: "important" },
  compte: { label: "Compte / Profil", icon: "User", defaultPriority: "normal" },
  contenu: { label: "Contenu / Projet", icon: "Film", defaultPriority: "normal" },
  technique: { label: "Probleme technique", icon: "Settings", defaultPriority: "normal" },
  signalement: { label: "Signalement / Abus", icon: "AlertTriangle", defaultPriority: "important" },
  partenariat: { label: "Partenariat / Business", icon: "Handshake", defaultPriority: "faible" },
  autre: { label: "Autre", icon: "HelpCircle", defaultPriority: "faible" },
};

export const ESCALATION_CONFIG: Record<EscalationTarget, { label: string; roles: string[] }> = {
  admin: { label: "Administrateur", roles: ["admin"] },
  admin_adjoint: { label: "Admin Adjoint", roles: ["admin_adjoint", "admin"] },
  support_paiement: { label: "Support Paiement", roles: ["support_paiement", "admin_adjoint", "admin"] },
  support_technique: { label: "Support Technique", roles: ["support_technique", "admin_adjoint", "admin"] },
  moderation: { label: "Moderation", roles: ["moderator", "admin_adjoint", "admin"] },
  legal: { label: "Service Juridique", roles: ["admin"] },
};

// ── Keywords for AI Triage ──

const KEYWORDS: Record<TicketCategory, string[]> = {
  paiement: ["paiement", "argent", "virement", "stripe", "carte", "remboursement", "transaction", "facture", "euro", "EUR", "wallet", "retrait"],
  compte: ["compte", "profil", "mot de passe", "email", "connexion", "inscription", "supprimer", "modifier", "parametres"],
  contenu: ["video", "film", "podcast", "article", "projet", "upload", "publication", "contenu", "supprimer mon"],
  technique: ["bug", "erreur", "probleme", "ne fonctionne pas", "bloque", "lent", "crash", "page blanche"],
  signalement: ["signaler", "abus", "harcelement", "spam", "arnaque", "faux", "inapproprie", "illegal"],
  partenariat: ["partenariat", "collaboration", "sponsor", "entreprise", "b2b", "commercial"],
  autre: [],
};

const URGENT_KEYWORDS = ["urgent", "immediat", "bloque", "impossible", "argent perdu", "arnaque", "harcelement", "menace"];
const ESCALATION_KEYWORDS = ["avocat", "justice", "plainte", "remboursement total", "fermer mon compte", "donnees personnelles", "rgpd"];

// ── AI Triage Functions ──

/**
 * Analyse un ticket et determine sa categorie, priorite et si escalade necessaire
 */
export function triageTicket(subject: string, message: string, userTrustScore: number): AITriageResult {
  const fullText = `${subject} ${message}`.toLowerCase();
  const words = fullText.split(/\s+/);
  
  // Detecter la categorie
  let detectedCategory: TicketCategory = "autre";
  let maxMatches = 0;
  const foundKeywords: string[] = [];
  
  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    const matches = keywords.filter(kw => fullText.includes(kw.toLowerCase()));
    if (matches.length > maxMatches) {
      maxMatches = matches.length;
      detectedCategory = category as TicketCategory;
      foundKeywords.push(...matches);
    }
  }
  
  // Detecter la priorite
  let priority = CATEGORY_CONFIG[detectedCategory].defaultPriority;
  const hasUrgentKeyword = URGENT_KEYWORDS.some(kw => fullText.includes(kw));
  if (hasUrgentKeyword) {
    priority = "urgent";
  }
  
  // Ajuster priorite selon Trust Score
  if (userTrustScore >= 80 && priority !== "urgent") {
    // Utilisateurs fiables peuvent avoir une priorite legerement elevee
    if (priority === "faible") priority = "normal";
  }
  if (userTrustScore < 30) {
    // Utilisateurs a risque - priorite normale max sauf si vraiment urgent
    if (priority === "important" && !hasUrgentKeyword) priority = "normal";
  }
  
  // Detecter si escalade necessaire
  const needsEscalation = ESCALATION_KEYWORDS.some(kw => fullText.includes(kw));
  let escalationTarget: EscalationTarget | undefined;
  
  if (needsEscalation) {
    if (fullText.includes("rgpd") || fullText.includes("donnees personnelles") || fullText.includes("avocat")) {
      escalationTarget = "legal";
    } else if (fullText.includes("remboursement total") || fullText.includes("argent")) {
      escalationTarget = "support_paiement";
    } else {
      escalationTarget = "admin_adjoint";
    }
  }
  
  // Categorie specifique -> escalation specifique
  if (detectedCategory === "signalement") {
    escalationTarget = "moderation";
  }
  if (detectedCategory === "paiement" && priority === "urgent") {
    escalationTarget = "support_paiement";
  }
  
  // Calculer le score de confiance
  const confidence = Math.min(0.95, 0.5 + (maxMatches * 0.1) + (hasUrgentKeyword ? 0.2 : 0));
  
  // Generer une reponse suggeree si confiance elevee et pas d'escalade
  let suggestedResponse: string | undefined;
  if (confidence >= 0.7 && !needsEscalation) {
    suggestedResponse = generateAutoResponse(detectedCategory, subject);
  }
  
  return {
    category: detectedCategory,
    priority,
    confidence,
    escalationNeeded: needsEscalation,
    escalationTarget,
    suggestedResponse,
    keywords: foundKeywords,
  };
}

/**
 * Genere une reponse automatique basee sur la categorie
 */
function generateAutoResponse(category: TicketCategory, subject: string): string {
  const responses: Record<TicketCategory, string> = {
    paiement: `Bonjour,

Merci de nous avoir contactes concernant votre paiement.

Voici quelques points a verifier:
- Assurez-vous que votre carte bancaire est valide et non expiree
- Verifiez que vous avez suffisamment de fonds disponibles
- Pour les virements, le delai est de 2 a 7 jours ouvrables

Si le probleme persiste, notre equipe paiement va examiner votre dossier dans les plus brefs delais.

Cordialement,
L'equipe VIXUAL`,

    compte: `Bonjour,

Merci pour votre message concernant votre compte.

Pour les problemes de connexion:
- Utilisez la fonction "Mot de passe oublie" si necessaire
- Verifiez que vous utilisez la bonne adresse email

Pour modifier vos informations:
- Rendez-vous dans Parametres > Mon profil

Si vous avez besoin d'aide supplementaire, n'hesitez pas a preciser votre demande.

Cordialement,
L'equipe VIXUAL`,

    contenu: `Bonjour,

Merci de nous avoir contactes au sujet de votre contenu.

Pour toute question concernant:
- L'upload: verifiez le format et la taille de votre fichier
- La publication: assurez-vous d'avoir rempli tous les champs obligatoires
- La modification: rendez-vous dans votre tableau de bord > Mes projets

Notre equipe reste a votre disposition pour vous accompagner.

Cordialement,
L'equipe VIXUAL`,

    technique: `Bonjour,

Merci de nous avoir signale ce probleme technique.

En attendant notre analyse:
- Essayez de vider le cache de votre navigateur
- Testez avec un autre navigateur (Chrome, Firefox, Safari)
- Verifiez votre connexion internet

Notre equipe technique va examiner ce probleme et vous tiendra informe.

Cordialement,
L'equipe VIXUAL`,

    signalement: `Bonjour,

Merci d'avoir pris le temps de nous signaler ce probleme.

Votre signalement a ete transmis a notre equipe de moderation qui va l'examiner dans les meilleurs delais.

Nous prenons tres au serieux tous les signalements et nous vous informerons des suites donnees.

Cordialement,
L'equipe VIXUAL`,

    partenariat: `Bonjour,

Merci pour votre interet pour un partenariat avec VIXUAL.

Notre equipe va examiner votre proposition et reviendra vers vous si celle-ci correspond a notre vision.

En attendant, vous pouvez consulter notre page "A propos" pour en savoir plus sur VIXUAL.

Cordialement,
L'equipe VIXUAL`,

    autre: `Bonjour,

Merci de nous avoir contactes.

Notre equipe va examiner votre demande et vous repondra dans les meilleurs delais.

N'hesitez pas a consulter notre FAQ en attendant: /faq

Cordialement,
L'equipe VIXUAL`,
  };
  
  return responses[category];
}

/**
 * Determine le routage du ticket vers l'equipe appropriee
 */
export function routeTicket(ticket: SupportTicket): EscalationTarget {
  // Si escalation deja definie, la respecter
  if (ticket.escalationTarget) {
    return ticket.escalationTarget;
  }
  
  // Routage par priorite
  if (ticket.priority === "urgent") {
    if (ticket.category === "paiement") return "support_paiement";
    if (ticket.category === "signalement") return "moderation";
    return "admin_adjoint";
  }
  
  // Routage par categorie
  switch (ticket.category) {
    case "paiement":
      return "support_paiement";
    case "technique":
      return "support_technique";
    case "signalement":
      return "moderation";
    case "partenariat":
      return "admin_adjoint";
    default:
      return "admin_adjoint";
  }
}

/**
 * Calcule le temps SLA restant
 */
export function calculateSLARemaining(ticket: SupportTicket): { hoursRemaining: number; isOverdue: boolean } {
  const slaHours = PRIORITY_CONFIG[ticket.priority].slaHours;
  const createdAt = new Date(ticket.createdAt);
  const deadline = new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);
  const now = new Date();
  
  const hoursRemaining = Math.max(0, (deadline.getTime() - now.getTime()) / (60 * 60 * 1000));
  
  return {
    hoursRemaining: Math.round(hoursRemaining * 10) / 10,
    isOverdue: now > deadline,
  };
}

/**
 * Cree un nouveau ticket avec triage automatique
 */
export function createSupportTicket(
  userId: string,
  userEmail: string,
  userName: string,
  subject: string,
  message: string,
  userRoles: string[],
  userTrustScore: number,
  relatedContentId?: string,
  relatedTransactionId?: string
): SupportTicket {
  const triage = triageTicket(subject, message, userTrustScore);
  const now = new Date();
  
  const ticket: SupportTicket = {
    id: `tkt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    userEmail,
    userName,
    subject,
    message,
    category: triage.category,
    priority: triage.priority,
    status: triage.escalationNeeded ? "escalade" : (triage.suggestedResponse ? "reponse_auto" : "en_triage"),
    createdAt: now,
    updatedAt: now,
    aiTriageScore: triage.confidence,
    aiSuggestedResponse: triage.suggestedResponse,
    escalationTarget: triage.escalationTarget || routeTicket({
      category: triage.category,
      priority: triage.priority,
    } as SupportTicket),
    responses: [],
    metadata: {
      userRoles,
      userTrustScore,
      relatedContentId,
      relatedTransactionId,
    },
  };
  
  // Ajouter la reponse auto si disponible
  if (triage.suggestedResponse && !triage.escalationNeeded) {
    ticket.responses.push({
      id: `resp_${Date.now()}`,
      ticketId: ticket.id,
      authorId: "ai_support",
      authorName: "Assistant VIXUAL",
      authorType: "ai",
      message: triage.suggestedResponse,
      createdAt: now,
      isAutomatic: true,
    });
  }
  
  return ticket;
}
