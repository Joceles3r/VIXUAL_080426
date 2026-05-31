"use server"

/**
 * VIXUAL — Data Provider (Server-only)
 *
 * Couche d'acces aux donnees pour le dashboard utilisateur.
 * Lit depuis Neon PostgreSQL via lib/db, fallback gracieux sur des donnees
 * vides en cas d'erreur (jamais de mock fictif en production).
 */
import { sql, isDatabaseConfigured } from "./db"
import { USE_MOCK_DATA } from "./feature-flags"
import { MOCK_TRANSACTIONS } from "./mock-data"

export interface UserData {
  id: string
  email: string
  displayName: string
  role: string
  vixupointsBalance: number
  trustScore: number
}

export interface TransactionData {
  id: string
  amount: number
  type: string
  description: string
  createdAt: string
}

export interface TrustScoreData {
  score: number
  level: string
  updatedAt: string
}

/**
 * Recupere les donnees utilisateur depuis Neon.
 * En cas d'erreur DB, retourne null (le caller affichera un etat vide).
 */
export async function getUserData(userId: string, forceMock = false): Promise<UserData | null> {
  if (forceMock || USE_MOCK_DATA || !isDatabaseConfigured()) {
    return null
  }
  try {
    const rows = await sql`
      SELECT id, email, display_name, role, vixupoints_balance, trust_score
      FROM users WHERE id = ${userId} LIMIT 1
    `
    if (!rows || rows.length === 0) return null
    const r = rows[0] as {
      id: string
      email: string
      display_name: string
      role: string
      vixupoints_balance: number
      trust_score: number
    }
    return {
      id: r.id,
      email: r.email,
      displayName: r.display_name,
      role: r.role,
      vixupointsBalance: r.vixupoints_balance ?? 0,
      trustScore: r.trust_score ?? 50,
    }
  } catch (e) {
    console.error("[DataProvider] getUserData fallback:", (e as Error).message)
    return null
  }
}

/**
 * Recupere les transactions utilisateur.
 * En mode mock OU en cas d'erreur DB, retourne MOCK_TRANSACTIONS pour ne pas
 * casser l'UI dashboard.
 */
export async function getTransactions(
  userId: string,
  limit = 10,
  forceMock = false,
): Promise<TransactionData[]> {
  if (forceMock || USE_MOCK_DATA || !isDatabaseConfigured()) {
    return MOCK_TRANSACTIONS.slice(0, limit).map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      description: t.description,
      createdAt: t.date,
    }))
  }
  try {
    const rows = await sql`
      SELECT id, amount, type, description, created_at
      FROM wallet_transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return (rows as Array<{
      id: string
      amount: number
      type: string
      description: string
      created_at: string
    }>).map((r) => ({
      id: r.id,
      amount: r.amount,
      type: r.type,
      description: r.description,
      createdAt: r.created_at,
    }))
  } catch (e) {
    console.error("[DataProvider] getTransactions fallback:", (e as Error).message)
    return MOCK_TRANSACTIONS.slice(0, limit).map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      description: t.description,
      createdAt: t.date,
    }))
  }
}

/**
 * Recupere le trust score utilisateur depuis users.trust_score.
 */
export async function getTrustScore(userId: string, forceMock = false): Promise<TrustScoreData> {
  const fallback: TrustScoreData = {
    score: 50,
    level: "Neutre",
    updatedAt: new Date().toISOString(),
  }
  if (forceMock || USE_MOCK_DATA || !isDatabaseConfigured()) {
    return fallback
  }
  try {
    const rows = await sql`
      SELECT trust_score, updated_at
      FROM users WHERE id = ${userId} LIMIT 1
    `
    if (!rows || rows.length === 0) return fallback
    const r = rows[0] as { trust_score: number; updated_at: string }
    const score = r.trust_score ?? 50
    return {
      score,
      level: score >= 80 ? "Excellent" : score >= 60 ? "Bon" : score >= 40 ? "Neutre" : "Faible",
      updatedAt: r.updated_at,
    }
  } catch (e) {
    console.error("[DataProvider] getTrustScore fallback:", (e as Error).message)
    return fallback
  }
}

export async function isMockMode(): Promise<boolean> {
  return USE_MOCK_DATA
}
