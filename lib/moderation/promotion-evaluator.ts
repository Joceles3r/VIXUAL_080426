import { sql } from "@/lib/db"
import { promoteUser } from "@/lib/platform/user-level"
import { createAlert } from "./alert-engine"
import { logAudit } from "./audit"

/**
 * Évalue si un utilisateur remplit les conditions de promotion.
 *
 * - Niveau 1 → 2 : promotion AUTOMATIQUE + alerte info au PATRON pour validation a posteriori
 * - Niveau 2 → 3 : alerte de promotion EN ATTENTE, validation manuelle obligatoire par le PATRON
 */
export async function evaluatePromotion(
  userId: string,
): Promise<{ promoted: boolean; toLevel?: 2 | 3; reason?: string }> {
  try {
    const rows = await sql`
      SELECT
        u.id, u.user_level, u.trust_score, u.email, u.is_verified, u.created_at,
        u.display_name,
        EXTRACT(EPOCH FROM (NOW() - u.created_at)) / 86400 AS days_since_signup,
        EXTRACT(EPOCH FROM (NOW() - COALESCE(u.level_promoted_at, u.created_at))) / 86400 AS days_in_current_level,
        (SELECT COUNT(*) FROM contributions WHERE user_id = u.id) AS contributions,
        (SELECT COUNT(*) FROM contents WHERE creator_id = u.id) AS publications,
        (SELECT COUNT(*) FROM comments WHERE user_id = u.id AND is_flagged = false AND is_deleted = false) AS clean_comments,
        (SELECT COUNT(*) FROM creator_visibility_boost WHERE visitor_id = u.id) AS boosts_given,
        (SELECT COUNT(*) FROM moderation_alerts WHERE user_id = u.id AND status = 'approved' AND severity IN ('critical','important') AND created_at > NOW() - INTERVAL '30 days') AS recent_validated_alerts,
        (SELECT COUNT(*) FROM moderation_alerts WHERE user_id = u.id AND status = 'approved' AND severity IN ('critical','important') AND created_at > NOW() - INTERVAL '60 days') AS recent_validated_alerts_60d
      FROM users u
      WHERE u.id = ${userId}::uuid
      LIMIT 1
    `
    if (rows.length === 0) return { promoted: false, reason: "User not found" }

    const u = rows[0]
    const currentLevel = (u.user_level as number) ?? 1
    const trust = (u.trust_score as number) ?? 50
    const emailVerified = Boolean(u.is_verified)
    const daysSignup = Number(u.days_since_signup ?? 0)
    const daysInLevel = Number(u.days_in_current_level ?? 0)
    const contributions = Number(u.contributions ?? 0)
    const publications = Number(u.publications ?? 0)
    const cleanComments = Number(u.clean_comments ?? 0)
    const boostsGiven = Number(u.boosts_given ?? 0)
    const recentAlerts = Number(u.recent_validated_alerts ?? 0)
    const recentAlerts60d = Number(u.recent_validated_alerts_60d ?? 0)
    const userName = (u.display_name as string) ?? (u.email as string) ?? "Utilisateur"

    // ═══ Évaluation Niveau 1 → 2 ═══
    if (currentLevel === 1) {
      const actions =
        (contributions > 0 ? 1 : 0) +
        (publications > 0 ? 1 : 0) +
        (boostsGiven > 0 ? 1 : 0) +
        (cleanComments >= 3 ? 1 : 0)
      const conditions = {
        ancienneté: daysSignup >= 7,
        emailVérifié: emailVerified,
        actions: actions >= 3,
        trustScore: trust >= 50,
        pasDeSignalement: recentAlerts === 0,
      }
      const allOk = Object.values(conditions).every((v) => v)
      if (allOk) {
        // PROMOTION AUTOMATIQUE
        await promoteUser(userId, 2, "trust_threshold")
        await logAudit({
          eventType: "promotion_automatic",
          userId,
          levelBefore: 1,
          levelAfter: 2,
          triggeredBy: "promotion_evaluator",
          ruleName: "auto_l1_to_l2",
          context: { conditions, trust, daysSignup, actions },
        })
        // Alerte INFO au PATRON pour validation a posteriori
        await createAlert({
          type: "promotion_pending_l1_l2",
          severity: "standard",
          userId,
          title: `Promotion automatique : ${userName} → Niveau 2`,
          description: `L'utilisateur vient d'être promu Niveau 2 (toutes conditions remplies). Validation a posteriori recommandée.`,
          suggestedAction: "Vérifier le profil et confirmer ou révoquer si anomalie détectée",
          context: {
            conditions,
            trust,
            daysSignup,
            actions,
            contributions,
            publications,
            cleanComments,
            boostsGiven,
          },
        })
        return { promoted: true, toLevel: 2, reason: "auto_promotion_l1_l2" }
      }
    }

    // ═══ Évaluation Niveau 2 → 3 ═══
    if (currentLevel === 2) {
      const conditions = {
        moisEnNiveau2: daysInLevel >= 30,
        contributionsOuPublications: contributions >= 5 || publications >= 3,
        trustScore: trust >= 75,
        commentairesPropres: cleanComments >= 10,
        pasDeSignalement60j: recentAlerts60d === 0,
      }
      const allOk = Object.values(conditions).every((v) => v)
      if (allOk) {
        // PAS de promotion automatique. Alerte IMPORTANTE au PATRON pour validation manuelle.
        await createAlert({
          type: "promotion_pending_l2_l3",
          severity: "important",
          userId,
          title: `Validation requise : ${userName} → Niveau 3`,
          description: `L'utilisateur remplit toutes les conditions pour passer Niveau 3. Validation manuelle obligatoire par le PATRON.`,
          suggestedAction:
            "Examiner profil, historique, qualité des contributions. Approuver ou rejeter.",
          context: {
            conditions,
            trust,
            daysInLevel,
            contributions,
            publications,
            cleanComments,
          },
        })
        return { promoted: false, reason: "alert_created_l2_to_l3" }
      }
    }

    return { promoted: false, reason: "conditions_not_met" }
  } catch (e) {
    console.warn("[evaluatePromotion skipped]", (e as Error).message)
    return { promoted: false, reason: "error" }
  }
}
