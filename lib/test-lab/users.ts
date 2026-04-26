/**
 * MODULE TEST-LAB VIXUAL — GENERATEUR DE PROFILS
 * Profils 100 % fictifs, jamais persistes dans la table users.
 */

import type { TestRole, TestUser } from "./types"

const FIRST_NAMES = ["Alex", "Sophie", "Lucas", "Emma", "Noah", "Lina", "Hugo", "Maya"]
const LAST_NAMES = ["Martin", "Dubois", "Bernard", "Petit", "Roux", "Moreau"]

function makeUser(index: number, role: TestRole): TestUser {
  const first = FIRST_NAMES[index % FIRST_NAMES.length]
  const last = LAST_NAMES[index % LAST_NAMES.length]

  return {
    id: `test_${role}_${index}`,
    name: `${first} ${last}`,
    email: `${role}_${index}@vixual.test`,
    role,
    walletBalance: 0,
  }
}

export function generateTestUsers(config: {
  visitors: number
  creators: number
  contributors: number
}): TestUser[] {
  const users: TestUser[] = []

  for (let i = 0; i < config.visitors; i++) users.push(makeUser(i, "visitor"))
  for (let i = 0; i < config.creators; i++) users.push(makeUser(i, "creator"))
  for (let i = 0; i < config.contributors; i++) users.push(makeUser(i, "contributor"))

  return users
}
