import { sql } from "@/lib/db"
import type { ModerationEvent } from "./types"
import { logAudit } from "./audit"

const DELTA_RULES: Record<string, { delta: number; reason: string }> = {
  email_verified: { delta: 5, reason: "Email vérifié" },
  phone_verified: { delta: 5, reason: "Téléphone vérifié" },
  first_contribution: { delta: 3, reason: "Première contribution réussie" },
  first_publication: { delta: 5, reason: "Première publication menée à terme" },
  quiz_passed: { delta: 5, reason: "Quiz de connaissance plateforme validé" },
  comment_appreciated: { delta: 1, reason: "Commentaire apprécié" },
  boost_received: { delta: 1, reason: "Boost de visibilité reçu" },
  boost_given: { delta: 1, reason: "Boost de visibilité offert" },
  top10_entry: { delta: 5, reason: "Projet entré dans le TOP 10" },
  referral_success: { delta: 5, reason: "Filleul atteint le Niveau 2" },
  monthly_clean: { delta: 2, reason: "Mois sans incident" },
  report_validated: { delta: -10, reason: "Signalement validé contre l'utilisateur" },
  chargeback: { delta: -15, reason: "Chargeback Stripe enregistré" },
  content_removed: { delta: -20, reason: "Contenu retiré pour violation de charte" },
  fraud_attempt: { delta: -50, reason: "Tentative de fraude détectée" },
  inactivity_long: { delta: -5, reason: "Inactivité prolongée (> 90 jours)" },
}

export type TrustScoreRule = keyof typeof DELTA_RULES

export async function applyTrustScoreDelta(
  userId: string,
  ruleName: TrustScoreRule,
  triggerEvent: string,
): Promise<{ before: number; after: number; delta: number }> {
  const rule = DELTA_RULES[ruleName]
  if (!rule) return { before: 0, after: 0, delta: 0 }

  try {
    const rows = await sql`SELECT trust_score FROM users WHERE id = ${userId}::uuid LIMIT 1`
    if (rows.length === 0) return { before: 0, after: 0, delta: 0 }

    const before = (rows[0].trust_score as number | null) ?? 50
    const after = Math.max(0, Math.min(100, before + rule.delta))
    const realDelta = after - before

    if (realDelta !== 0) {
      await sql`UPDATE users SET trust_score = ${after} WHERE id = ${userId}::uuid`
    }

    await logAudit({
      eventType: "trust_score_change",
      userId,
      trustScoreBefore: before,
      trustScoreAfter: after,
      trustScoreDelta: realDelta,
      triggeredBy: triggerEvent,
      ruleName,
      context: { rule: rule.reason, originalDelta: rule.delta },
    })

    return { before, after, delta: realDelta }
  } catch (e) {
    console.warn("[trust score delta skipped]", (e as Error).message)
    return { before: 0, after: 0, delta: 0 }
  }
}

/** Hook principal à appeler depuis n'importe quel endroit du code après un événement */
export async function processModerationEvent(event: ModerationEvent): Promise<void> {
  try {
    switch (event.kind) {
      case "email_verified":
        await applyTrustScoreDelta(event.userId, "email_verified", "email_verified")
        break
      case "phone_verified":
        await applyTrustScoreDelta(event.userId, "phone_verified", "phone_verified")
        break
      case "contribution_success":
        await applyTrustScoreDelta(event.userId, "first_contribution", "contribution_success")
        break
      case "publication_success":
        await applyTrustScoreDelta(event.userId, "first_publication", "publication_success")
        break
      case "quiz_passed":
        await applyTrustScoreDelta(event.userId, "quiz_passed", "quiz_passed")
        break
      case "boost_received":
        await applyTrustScoreDelta(event.userId, "boost_received", "boost_received")
        break
      case "boost_given":
        await applyTrustScoreDelta(event.userId, "boost_given", "boost_given")
        break
      case "chargeback":
        await applyTrustScoreDelta(event.userId, "chargeback", "chargeback")
        break
      case "user_active":
        await sql`UPDATE users SET last_active_at = NOW() WHERE id = ${event.userId}::uuid`
        break
      default:
        // pas d'action spécifique pour les autres événements (utiles aux détecteurs)
        break
    }
  } catch (e) {
    console.warn("[processModerationEvent skipped]", (e as Error).message)
  }
}
