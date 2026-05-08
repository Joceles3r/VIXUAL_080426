import { sql } from "@/lib/db"
import { getPlatformVersion } from "@/lib/platform/version"
import { createAlert } from "./alert-engine"

/**
 * Évalue si la plateforme globale devrait basculer V1→V2 ou V2→V3.
 * Ne bascule JAMAIS automatiquement. Crée une alerte au PATRON qui décide.
 * À déclencher périodiquement (cron quotidien recommandé).
 */
export async function evaluatePlatformProgression(): Promise<void> {
  try {
    const currentVersion = await getPlatformVersion()
    if (currentVersion === "V3") return

    const rows = await sql`SELECT * FROM moderation_platform_health LIMIT 1`
    if (rows.length === 0) return
    const h = rows[0]

    const totalUsers = Number(h.users_last_30d ?? 0)
    const usersL2 = Number(h.users_level2 ?? 0)
    const usersL3 = Number(h.users_level3 ?? 0)
    const totalContents = Number(h.total_contents ?? 0)
    const totalContributionsEur = Number(h.total_contributions_eur ?? 0)
    const criticalPending = Number(h.critical_alerts_pending ?? 0)

    if (currentVersion === "V1") {
      const conditions = {
        utilisateursMin1000: totalUsers >= 1000,
        niveau2Min200: usersL2 >= 200,
        contenusMin100: totalContents >= 100,
        contributionsMin5000: totalContributionsEur >= 5000,
        pasDeAlerteCritiquePendante: criticalPending === 0,
      }
      const allOk = Object.values(conditions).every((v) => v)
      if (allOk) {
        await createAlert({
          type: "platform_v1_to_v2_ready",
          severity: "important",
          title: "VIXUAL est prête à basculer V1 → V2",
          description: `Tous les seuils sont atteints. La plateforme dispose de la masse critique pour ouvrir les fonctionnalités V2 (8 profils, paiement hybride, podcasts, écrits).`,
          suggestedAction: "Examiner les indicateurs en détail puis basculer via /admin/platform-state",
          context: {
            conditions,
            snapshot: { totalUsers, usersL2, totalContents, totalContributionsEur },
          },
          expiresInHours: 168,
        })
      }
    }

    if (currentVersion === "V2") {
      const v2DaysRows = await sql`
        SELECT EXTRACT(EPOCH FROM (NOW() - changed_at)) / 86400 AS days_in_v2
        FROM platform_version_history
        WHERE to_version = 'V2'
        ORDER BY changed_at DESC
        LIMIT 1
      `
      const daysInV2 = Number(v2DaysRows[0]?.days_in_v2 ?? 0)

      const conditions = {
        utilisateursMin5000: totalUsers >= 5000,
        niveau3Min100: usersL3 >= 100,
        sixMoisEnV2: daysInV2 >= 180,
        pasDeAlerteCritiquePendante: criticalPending === 0,
      }
      const allOk = Object.values(conditions).every((v) => v)
      if (allOk) {
        await createAlert({
          type: "platform_v2_to_v3_ready",
          severity: "important",
          title: "VIXUAL est prête à basculer V2 → V3",
          description: `Tous les seuils sont atteints. La plateforme a une communauté mature et stable, prête pour l'ouverture complète V3 (Vixual Social, Ticket Gold, Trust Score visible).`,
          suggestedAction: "Examiner les indicateurs en détail puis basculer via /admin/platform-state",
          context: { conditions, snapshot: { totalUsers, usersL3, daysInV2 } },
          expiresInHours: 168,
        })
      }
    }
  } catch (e) {
    console.warn("[evaluatePlatformProgression skipped]", (e as Error).message)
  }
}
