/**
 * MODULE TEST-LAB VIXUAL — GENERATEUR DE PROFILS (8 ROLES)
 * Profils 100% fictifs, jamais persistes dans la table users.
 * Inclut Trust Score, niveau utilisateur, et balance VIXUpoints simules.
 */

import type { TestRole, TestUser, TestUserExtended } from "./types"

const FIRST_NAMES = ["Alex", "Sophie", "Lucas", "Emma", "Noah", "Lina", "Hugo", "Maya", "Tom", "Zoe", "Leo", "Anna"]
const LAST_NAMES = ["Martin", "Dubois", "Bernard", "Petit", "Roux", "Moreau", "Laurent", "Leroy", "Garcia"]

/** Distribution Trust Score realiste : majorite 40-70, minorite haut/bas */
function generateTrustScore(role: TestRole, index: number): number {
  // Pseudo-aleatoire deterministe
  const base = (index * 17 + role.length * 7) % 100
  // Distribution gaussienne approximative centree sur 55
  const score = Math.round(30 + base * 0.5 + Math.sin(index) * 15)
  return Math.max(0, Math.min(100, score))
}

/** Niveau derive du Trust Score + anciennete simulee */
function deriveLevel(trustScore: number, daysActive: number, role: TestRole): 1 | 2 | 3 {
  if (role === "guest" || role === "visitor") return 1
  if (trustScore >= 75 && daysActive >= 30) return 3
  if (trustScore >= 50 && daysActive >= 7) return 2
  return 1
}

/** Balance VIXUpoints realiste selon le profil */
function generateVixupointsBalance(role: TestRole, daysActive: number): number {
  if (role === "guest") return 0
  if (role === "visitor") return Math.min(2500, daysActive * 35 + (daysActive % 7) * 15)
  if (role === "creator" || role === "infoporteur" || role === "podcasteur") return daysActive * 50
  return daysActive * 25
}

function makeExtendedUser(index: number, role: TestRole, simulatedDaysActive: number): TestUserExtended {
  const first = FIRST_NAMES[index % FIRST_NAMES.length]
  const last = LAST_NAMES[index % LAST_NAMES.length]
  const trustScore = generateTrustScore(role, index)
  const daysActive = Math.max(0, simulatedDaysActive - (index % 5))
  const level = deriveLevel(trustScore, daysActive, role)

  return {
    id: `test_${role}_${index}`,
    name: `${first} ${last}`,
    email: `${role}_${index}@vixual.test`,
    role,
    walletBalance: 0,
    trustScore,
    level,
    vixupointsBalance: generateVixupointsBalance(role, daysActive),
    daysActive,
    contributionsMade:
      role === "contributor" || role === "contribu_lecteur" || role === "auditeur"
        ? Math.floor(daysActive / 4)
        : 0,
    publicationsMade:
      role === "creator" || role === "infoporteur" || role === "podcasteur"
        ? Math.floor(daysActive / 7)
        : 0,
  }
}

export function generateTestUsers(config: {
  visitors: number
  creators: number
  contributors: number
  infoporteurs?: number
  podcasteurs?: number
  auditeurs?: number
  contribu_lecteurs?: number
  guests?: number
  simulatedDaysActive?: number
}): TestUser[] {
  return generateTestUsersExtended(config) as TestUser[]
}

export function generateTestUsersExtended(config: {
  visitors: number
  creators: number
  contributors: number
  infoporteurs?: number
  podcasteurs?: number
  auditeurs?: number
  contribu_lecteurs?: number
  guests?: number
  simulatedDaysActive?: number
}): TestUserExtended[] {
  const days = config.simulatedDaysActive ?? 14
  const users: TestUserExtended[] = []
  let idx = 0

  for (let i = 0; i < (config.guests ?? 0); i++, idx++) users.push(makeExtendedUser(idx, "guest", days))
  for (let i = 0; i < config.visitors; i++, idx++) users.push(makeExtendedUser(idx, "visitor", days))
  for (let i = 0; i < config.creators; i++, idx++) users.push(makeExtendedUser(idx, "creator", days))
  for (let i = 0; i < config.contributors; i++, idx++) users.push(makeExtendedUser(idx, "contributor", days))
  for (let i = 0; i < (config.infoporteurs ?? 0); i++, idx++) users.push(makeExtendedUser(idx, "infoporteur", days))
  for (let i = 0; i < (config.podcasteurs ?? 0); i++, idx++) users.push(makeExtendedUser(idx, "podcasteur", days))
  for (let i = 0; i < (config.auditeurs ?? 0); i++, idx++) users.push(makeExtendedUser(idx, "auditeur", days))
  for (let i = 0; i < (config.contribu_lecteurs ?? 0); i++, idx++) {
    users.push(makeExtendedUser(idx, "contribu_lecteur", days))
  }

  return users
}

/** Statistiques de repartition par profil/niveau pour le resume */
export function aggregateUserStats(users: TestUserExtended[]): {
  byRole: Record<TestRole, number>
  byLevel: { level1: number; level2: number; level3: number }
  avgTrustScore: number
} {
  const byRole = {
    guest: 0,
    visitor: 0,
    creator: 0,
    contributor: 0,
    infoporteur: 0,
    podcasteur: 0,
    auditeur: 0,
    contribu_lecteur: 0,
  } as Record<TestRole, number>

  let l1 = 0
  let l2 = 0
  let l3 = 0
  let totalTrust = 0
  for (const u of users) {
    byRole[u.role]++
    if (u.level === 1) l1++
    else if (u.level === 2) l2++
    else l3++
    totalTrust += u.trustScore
  }

  return {
    byRole,
    byLevel: { level1: l1, level2: l2, level3: l3 },
    avgTrustScore: users.length > 0 ? Math.round(totalTrust / users.length) : 0,
  }
}
