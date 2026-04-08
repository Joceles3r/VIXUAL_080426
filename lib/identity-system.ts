/**
 * VIXUAL - Système d'identité, anonymat et protection des pseudonymes
 * Version: V1
 * 
 * Principes:
 * - Identité réelle (privée) connue uniquement par VIXUAL
 * - Identité publique (visible) = pseudo ou nom d'artiste
 * - Classement discret: Prénom + initiale du nom
 * - Avatars animés avec émojis
 */

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export type VerificationLevel = 1 | 2 | 3

export interface UserIdentity {
  // Identité réelle (PRIVÉE - jamais exposée publiquement)
  realFirstName: string
  realLastName: string
  documentType?: 'cni' | 'passport' | 'permit' | 'residence'
  documentVerified: boolean
  selfieVerified: boolean
  stripeConnectVerified: boolean
  
  // Identité publique (VISIBLE)
  pseudonym?: string
  displayName: string // Prénom + initiale (ex: "Lucas M.")
  avatarEmoji: string
  avatarColor: string
  
  // Vérification
  verificationLevel: VerificationLevel
  isOfficialAccount: boolean
  isCelebrity: boolean
  badges: UserBadge[]
}

export interface UserBadge {
  type: 'top10' | 'top50' | 'top100' | 'top500' | 'verified' | 'certified' | 'official'
  label: string
  icon: string
  color: string
}

export interface ContributorScore {
  totalContributed: number
  projectsDiversity: number // nombre de projets différents
  regularParticipation: number // 0-100
  seniority: number // mois sur la plateforme
  communityBonus: number // 0-100
  globalScore: number
  rank: number
}

export interface ReservedUsername {
  username: string
  type: 'celebrity' | 'brand' | 'institution' | 'sensitive'
  status: 'reserved' | 'attributed' | 'blocked'
  owner?: string
  variants: string[]
}

// ══════════════════════════════════════════════════════════════
// CONSTANTES
// ══════════════════════════════════════════════════════════════

export const AVATAR_EMOJIS = [
  '😊', '😎', '🤩', '🥳', '😇', '🤗', '🧐', '🤠',
  '👨‍🎨', '👩‍🎤', '🧑‍💻', '👨‍🚀', '👩‍🔬', '🧙‍♂️', '🦸‍♀️', '🦹‍♂️',
  '🎭', '🎬', '🎤', '🎧', '📚', '✍️', '🎨', '🎵',
  '🌟', '💫', '✨', '🔥', '💎', '🏆', '🎯', '🚀'
]

export const AVATAR_COLORS = [
  { name: 'emerald', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-300' },
  { name: 'teal', bg: 'bg-teal-500/20', border: 'border-teal-500/40', text: 'text-teal-300' },
  { name: 'sky', bg: 'bg-sky-500/20', border: 'border-sky-500/40', text: 'text-sky-300' },
  { name: 'violet', bg: 'bg-violet-500/20', border: 'border-violet-500/40', text: 'text-violet-300' },
  { name: 'rose', bg: 'bg-rose-500/20', border: 'border-rose-500/40', text: 'text-rose-300' },
  { name: 'amber', bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-300' },
  { name: 'orange', bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-300' },
  { name: 'cyan', bg: 'bg-cyan-500/20', border: 'border-cyan-500/40', text: 'text-cyan-300' },
]

export const CONTRIBUTOR_BADGES: Record<string, UserBadge> = {
  top10: { type: 'top10', label: 'Top 10 Contributeur', icon: '🏅', color: 'text-amber-400' },
  top50: { type: 'top50', label: 'Top 50 Contributeur', icon: '🥇', color: 'text-amber-300' },
  top100: { type: 'top100', label: 'Top 100 Contributeur', icon: '⭐', color: 'text-yellow-300' },
  top500: { type: 'top500', label: 'Top 500 Contributeur', icon: '🔥', color: 'text-orange-400' },
  verified: { type: 'verified', label: 'Profil vérifié', icon: '✔', color: 'text-teal-400' },
  certified: { type: 'certified', label: 'Créateur certifié', icon: '⭐', color: 'text-emerald-400' },
  official: { type: 'official', label: 'Compte officiel', icon: '👑', color: 'text-violet-400' },
}

export const VERIFICATION_LEVELS: Record<VerificationLevel, { label: string; description: string; color: string }> = {
  1: { label: 'Profil confirmé', description: 'Email vérifié', color: 'text-slate-400' },
  2: { label: 'Profil vérifié', description: 'Identité vérifiée', color: 'text-teal-400' },
  3: { label: 'Compte officiel', description: 'Célébrité ou marque vérifiée', color: 'text-violet-400' },
}

// Mots sensibles réservés
export const SENSITIVE_USERNAMES = [
  'admin', 'administrator', 'support', 'help', 'contact',
  'official', 'vixual', 'vixualofficial', 'vixualsupport',
  'moderator', 'mod', 'staff', 'team', 'system',
]

// ══════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ══════════════════════════════════════════════════════════════

/**
 * Génère un nom d'affichage discret: Prénom + initiale du nom
 * Ex: "Jean Dupont" -> "Jean D."
 */
export function generateDiscreetDisplayName(firstName: string, lastName: string): string {
  const cleanFirst = firstName.trim()
  const cleanLast = lastName.trim()
  
  if (!cleanFirst || !cleanLast) return cleanFirst || 'Utilisateur'
  
  const initial = cleanLast.charAt(0).toUpperCase()
  return `${cleanFirst} ${initial}.`
}

/**
 * Génère un avatar aléatoire (emoji + couleur)
 */
export function generateRandomAvatar(): { emoji: string; color: typeof AVATAR_COLORS[0] } {
  const emoji = AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)]
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
  return { emoji, color }
}

/**
 * Génère un avatar basé sur le nom (déterministe)
 */
export function generateAvatarFromName(name: string): { emoji: string; color: typeof AVATAR_COLORS[0] } {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const emoji = AVATAR_EMOJIS[hash % AVATAR_EMOJIS.length]
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length]
  return { emoji, color }
}

/**
 * Calcule le score global d'un contributeur
 * Formule:
 * - 50% montant contribué
 * - 20% diversification des projets
 * - 15% participation régulière
 * - 10% ancienneté sur la plateforme
 * - 5% bonus communautaire
 */
export function calculateContributorScore(
  totalContributed: number,
  projectsDiversity: number,
  regularParticipation: number, // 0-100
  seniorityMonths: number,
  communityBonus: number // 0-100
): number {
  // Normalisation des valeurs
  const maxContribution = 10000 // 10000€ = score max
  const maxDiversity = 50 // 50 projets = score max
  const maxSeniority = 24 // 24 mois = score max
  
  const contributionScore = Math.min(totalContributed / maxContribution, 1) * 100
  const diversityScore = Math.min(projectsDiversity / maxDiversity, 1) * 100
  const seniorityScore = Math.min(seniorityMonths / maxSeniority, 1) * 100
  
  const globalScore = 
    (contributionScore * 0.50) +
    (diversityScore * 0.20) +
    (regularParticipation * 0.15) +
    (seniorityScore * 0.10) +
    (communityBonus * 0.05)
  
  return Math.round(globalScore * 10) / 10 // arrondi à 1 décimale
}

/**
 * Détermine le badge de rang d'un contributeur
 */
export function getContributorRankBadge(rank: number): UserBadge | null {
  if (rank <= 10) return CONTRIBUTOR_BADGES.top10
  if (rank <= 50) return CONTRIBUTOR_BADGES.top50
  if (rank <= 100) return CONTRIBUTOR_BADGES.top100
  if (rank <= 500) return CONTRIBUTOR_BADGES.top500
  return null
}

/**
 * Vérifie si un pseudonyme est disponible
 */
export function isUsernameAvailable(
  username: string,
  reservedUsernames: ReservedUsername[]
): { available: boolean; reason?: string } {
  const normalized = username.toLowerCase().replace(/[_\-\s]/g, '')
  
  // Vérifier les mots sensibles
  if (SENSITIVE_USERNAMES.includes(normalized)) {
    return { available: false, reason: 'Ce nom est réservé par VIXUAL.' }
  }
  
  // Vérifier les pseudonymes protégés
  for (const reserved of reservedUsernames) {
    const reservedNormalized = reserved.username.toLowerCase().replace(/[_\-\s]/g, '')
    
    if (normalized === reservedNormalized) {
      return { available: false, reason: 'Ce pseudonyme est protégé.' }
    }
    
    // Vérifier les variantes
    for (const variant of reserved.variants) {
      const variantNormalized = variant.toLowerCase().replace(/[_\-\s]/g, '')
      if (normalized === variantNormalized) {
        return { available: false, reason: 'Ce pseudonyme est protégé.' }
      }
    }
  }
  
  return { available: true }
}

/**
 * Génère les variantes d'un pseudonyme à bloquer
 */
export function generateUsernameVariants(username: string): string[] {
  const base = username.toLowerCase()
  const variants: string[] = [
    base,
    base.replace(/\s/g, ''),
    base.replace(/\s/g, '_'),
    base.replace(/\s/g, '-'),
    base.replace(/\s/g, '.'),
  ]
  
  // Ajouter les inversions pour les noms composés
  const parts = base.split(/[\s_\-.]/)
  if (parts.length === 2) {
    variants.push(`${parts[1]}${parts[0]}`)
    variants.push(`${parts[1]}_${parts[0]}`)
    variants.push(`${parts[1]}-${parts[0]}`)
  }
  
  return [...new Set(variants)]
}

/**
 * Crée une identité utilisateur complète
 */
export function createUserIdentity(
  firstName: string,
  lastName: string,
  pseudonym?: string
): UserIdentity {
  const avatar = generateAvatarFromName(`${firstName} ${lastName}`)
  
  return {
    realFirstName: firstName,
    realLastName: lastName,
    documentType: undefined,
    documentVerified: false,
    selfieVerified: false,
    stripeConnectVerified: false,
    pseudonym,
    displayName: generateDiscreetDisplayName(firstName, lastName),
    avatarEmoji: avatar.emoji,
    avatarColor: avatar.color.name,
    verificationLevel: 1,
    isOfficialAccount: false,
    isCelebrity: false,
    badges: [],
  }
}

/**
 * Obtient les indicateurs de confiance pour un profil
 */
export function getTrustIndicators(identity: UserIdentity): Array<{ icon: string; label: string; color: string }> {
  const indicators: Array<{ icon: string; label: string; color: string }> = []
  
  if (identity.documentVerified && identity.selfieVerified) {
    indicators.push({ icon: '✔', label: 'Identité vérifiée', color: 'text-teal-400' })
  }
  
  if (identity.stripeConnectVerified) {
    indicators.push({ icon: '💳', label: 'Paiement sécurisé', color: 'text-emerald-400' })
  }
  
  if (identity.isOfficialAccount) {
    indicators.push({ icon: '👑', label: 'Compte officiel', color: 'text-violet-400' })
  }
  
  if (identity.badges.length > 0) {
    const topBadge = identity.badges[0]
    indicators.push({ icon: topBadge.icon, label: topBadge.label, color: topBadge.color })
  }
  
  if (indicators.length === 0) {
    indicators.push({ icon: '⚠', label: 'Profil débutant', color: 'text-slate-400' })
  }
  
  return indicators
}

// ══════════════════════════════════════════════════════════════
// DONNÉES MOCK POUR DÉMONSTRATION
// ══════════════════════════════════════════════════════════════

export const MOCK_TOP_CONTRIBUTORS: Array<{
  rank: number
  displayName: string
  avatarEmoji: string
  avatarColor: string
  score: number
  totalContributed: number
  projectsCount: number
  badge: UserBadge | null
}> = [
  { rank: 1, displayName: 'Lucas M.', avatarEmoji: '🚀', avatarColor: 'emerald', score: 94.5, totalContributed: 8500, projectsCount: 42, badge: CONTRIBUTOR_BADGES.top10 },
  { rank: 2, displayName: 'Sophie D.', avatarEmoji: '✨', avatarColor: 'violet', score: 91.2, totalContributed: 7200, projectsCount: 38, badge: CONTRIBUTOR_BADGES.top10 },
  { rank: 3, displayName: 'Karim B.', avatarEmoji: '🔥', avatarColor: 'amber', score: 88.7, totalContributed: 6800, projectsCount: 35, badge: CONTRIBUTOR_BADGES.top10 },
  { rank: 4, displayName: 'Emma T.', avatarEmoji: '💎', avatarColor: 'sky', score: 85.3, totalContributed: 5900, projectsCount: 31, badge: CONTRIBUTOR_BADGES.top10 },
  { rank: 5, displayName: 'Hugo L.', avatarEmoji: '🎯', avatarColor: 'teal', score: 82.1, totalContributed: 5200, projectsCount: 28, badge: CONTRIBUTOR_BADGES.top10 },
  { rank: 6, displayName: 'Léa R.', avatarEmoji: '🌟', avatarColor: 'rose', score: 79.4, totalContributed: 4800, projectsCount: 26, badge: CONTRIBUTOR_BADGES.top10 },
  { rank: 7, displayName: 'Thomas P.', avatarEmoji: '🏆', avatarColor: 'orange', score: 76.8, totalContributed: 4400, projectsCount: 24, badge: CONTRIBUTOR_BADGES.top10 },
  { rank: 8, displayName: 'Chloé G.', avatarEmoji: '💫', avatarColor: 'cyan', score: 74.2, totalContributed: 4100, projectsCount: 22, badge: CONTRIBUTOR_BADGES.top10 },
  { rank: 9, displayName: 'Maxime N.', avatarEmoji: '🎭', avatarColor: 'violet', score: 71.5, totalContributed: 3800, projectsCount: 20, badge: CONTRIBUTOR_BADGES.top10 },
  { rank: 10, displayName: 'Julie F.', avatarEmoji: '🎬', avatarColor: 'emerald', score: 68.9, totalContributed: 3500, projectsCount: 18, badge: CONTRIBUTOR_BADGES.top10 },
]

export const MOCK_RESERVED_USERNAMES: ReservedUsername[] = [
  { username: 'DavidGuetta', type: 'celebrity', status: 'reserved', variants: ['David_Guetta', 'David-Guetta', 'GuettaDavid'] },
  { username: 'Netflix', type: 'brand', status: 'reserved', variants: ['NetflixFR', 'Netflix_FR'] },
  { username: 'Nike', type: 'brand', status: 'reserved', variants: ['NikeFR', 'Nike_France'] },
  { username: 'VIXUALOfficial', type: 'sensitive', status: 'attributed', owner: 'VIXUAL', variants: ['VIXUAL_Official'] },
]
