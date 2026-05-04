/**
 * MODULE TEST-LAB VIXUAL — SIMULATEUR STRIPE
 * Aucune transaction reelle. Resultat purement deterministe.
 * SECURITE : si VIXUAL_TEST_LAB_ALLOW_REAL_STRIPE !== "true", tout est simule.
 */

import type {
  TestPaymentBehavior,
  TestProject,
  TestTransaction,
  TestUser,
} from "./types"

/** Verifie si le mode simulation est force (par defaut : oui). */
function isStripeSimulationForced(): boolean {
  return process.env.VIXUAL_TEST_LAB_ALLOW_REAL_STRIPE !== "true"
}

function getPaymentStatus(
  successPercent: number,
  failedPercent: number,
  index: number,
): TestPaymentBehavior {
  const roll = (index * 37) % 100
  if (roll < failedPercent) return "failed"
  if (roll < failedPercent + 5) return "requires_action"
  if (roll < successPercent + failedPercent) return "success"
  return "success"
}

export function generateStripeTestTransactions(
  config: {
    successfulPaymentsPercent: number
    failedPaymentsPercent: number
  },
  users: TestUser[],
  projects: TestProject[],
): TestTransaction[] {
  // SECURITE : forcer le mode simulation
  const provider = isStripeSimulationForced() ? "simulation" : "stripe_test"

  const contributors = users.filter((u) => u.role === "contributor")
  const transactions: TestTransaction[] = []

  contributors.forEach((user, index) => {
    const project = projects[index % projects.length]
    if (!project) return

    const status = getPaymentStatus(
      config.successfulPaymentsPercent,
      config.failedPaymentsPercent,
      index,
    )

    transactions.push({
      id: `test_tx_${index}`,
      userId: user.id,
      projectId: project.id,
      amount: [2, 5, 10, 20][index % 4],
      status,
      provider,
    })
  })

  return transactions
}

/** Cartes Stripe TEST officielles (jamais utilisables en prod). */
export const STRIPE_TEST_CARDS = [
  { label: "Paiement OK", number: "4242 4242 4242 4242", color: "emerald" },
  { label: "Paiement refuse", number: "4000 0000 0000 0002", color: "red" },
  { label: "Authentification requise", number: "4000 0025 0000 3155", color: "amber" },
] as const
