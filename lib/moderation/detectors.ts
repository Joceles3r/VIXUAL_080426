import { sql } from "@/lib/db"
import { createAlert } from "./alert-engine"

/** Vélocité anormale : plus de N actions en 30 secondes */
export async function detectVelocityAnomaly(userId: string, actionType: string): Promise<void> {
  try {
    const rows = await sql`
      SELECT COUNT(*) AS cnt FROM moderation_audit_log
      WHERE user_id = ${userId}::uuid
        AND triggered_by = ${actionType}
        AND created_at > NOW() - INTERVAL '30 seconds'
    `
    const count = Number(rows[0]?.cnt ?? 0)
    if (count >= 10) {
      await createAlert({
        type: "velocity_anomaly",
        severity: "important",
        userId,
        title: `Vélocité anormale détectée (${count} actions / 30s)`,
        description: `L'utilisateur a déclenché ${count} actions de type "${actionType}" en moins de 30 secondes. Comportement potentiellement automatisé (bot).`,
        suggestedAction: "Vérifier l'IP, examiner le journal d'activité, suspendre temporairement si confirmé",
        context: { actionType, count, windowSeconds: 30 },
      })
    }
  } catch (e) {
    console.warn("[detectVelocityAnomaly skipped]", (e as Error).message)
  }
}

/** Création de comptes en rafale depuis la même IP */
export async function detectRapidAccountCreation(ip: string): Promise<void> {
  if (!ip || ip === "unknown") return
  try {
    const rows = await sql`
      SELECT COUNT(*) AS cnt FROM users
      WHERE created_ip = ${ip}
        AND created_at > NOW() - INTERVAL '10 minutes'
    `
    const count = Number(rows[0]?.cnt ?? 0)
    if (count >= 5) {
      await createAlert({
        type: "rapid_account_creation",
        severity: "critical",
        title: `${count} comptes créés en 10 minutes depuis la même IP`,
        description: `IP ${ip} : ${count} comptes créés en moins de 10 minutes. Suspicion forte de création automatisée ou de farming.`,
        suggestedAction: "Bloquer l'IP, vérifier les comptes créés, suspendre préventivement",
        context: { ip, count, windowMinutes: 10 },
      })
    }
  } catch (e) {
    console.warn("[detectRapidAccountCreation skipped]", (e as Error).message)
  }
}

/** Auto-soutien suspect : un créateur dont les contributeurs sont tous très récents */
export async function detectSelfSupport(creatorId: string): Promise<void> {
  try {
    const rows = await sql`
      SELECT
        COUNT(*) AS total_contributors,
        COUNT(*) FILTER (WHERE u.created_at > NOW() - INTERVAL '7 days') AS recent_contributors
      FROM contributions i
      JOIN users u ON u.id = i.user_id
      JOIN contents c ON c.id = i.content_id
      WHERE c.creator_id = ${creatorId}::uuid
        AND i.created_at > NOW() - INTERVAL '30 days'
    `
    const total = Number(rows[0]?.total_contributors ?? 0)
    const recent = Number(rows[0]?.recent_contributors ?? 0)
    if (total >= 5 && recent / total >= 0.8) {
      await createAlert({
        type: "fraud_suspicion_self_support",
        severity: "important",
        userId: creatorId,
        title: `Suspicion d'auto-soutien : ${recent}/${total} contributeurs créés < 7 jours`,
        description: `Le créateur reçoit la majorité de ses contributions de comptes très récents. Pattern compatible avec une création de faux comptes pour s'auto-soutenir.`,
        suggestedAction: "Examiner les contributeurs : IP, email patterns, comportements. Geler les gains si confirmé.",
        context: { totalContributors: total, recentContributors: recent, ratio: recent / total },
      })
    }
  } catch (e) {
    console.warn("[detectSelfSupport skipped]", (e as Error).message)
  }
}

/** Signalements convergents : 3 utilisateurs distincts signalent la même personne en 24h */
export async function detectConvergentReports(targetUserId: string): Promise<void> {
  try {
    const rows = await sql`
      SELECT COUNT(DISTINCT reporter_id) AS distinct_reporters
      FROM reports
      WHERE reported_user_id = ${targetUserId}::uuid
        AND created_at > NOW() - INTERVAL '24 hours'
    `
    const count = Number(rows[0]?.distinct_reporters ?? 0)
    if (count >= 3) {
      await createAlert({
        type: "convergent_reports",
        severity: "important",
        userId: targetUserId,
        title: `${count} signalements convergents en 24h`,
        description: `${count} utilisateurs distincts ont signalé cet utilisateur dans les 24 dernières heures. Convergence anormale méritant investigation.`,
        suggestedAction: "Examiner les signalements, contacter l'utilisateur, suspendre si confirmé",
        context: { distinctReporters: count, windowHours: 24 },
      })
    }
  } catch (e) {
    console.warn("[detectConvergentReports skipped]", (e as Error).message)
  }
}

/** Chute brutale du Trust Score */
export async function detectTrustScoreDrop(userId: string): Promise<void> {
  try {
    const rows = await sql`
      SELECT COALESCE(SUM(trust_score_delta), 0) AS total_delta
      FROM moderation_audit_log
      WHERE user_id = ${userId}::uuid
        AND created_at > NOW() - INTERVAL '24 hours'
    `
    const totalDelta = Number(rows[0]?.total_delta ?? 0)
    if (totalDelta <= -30) {
      await createAlert({
        type: "trust_score_drop",
        severity: "critical",
        userId,
        title: `Chute brutale du Trust Score (${totalDelta} en 24h)`,
        description: `L'utilisateur a perdu ${Math.abs(totalDelta)} points de Trust Score en moins de 24h. Comportement potentiellement problématique.`,
        suggestedAction: "Examiner l'historique récent, déterminer la cause, intervenir si nécessaire",
        context: { totalDelta, windowHours: 24 },
      })
    }
  } catch (e) {
    console.warn("[detectTrustScoreDrop skipped]", (e as Error).message)
  }
}

/** Compte dormant qui se réveille pour une rafale d'actions */
export async function detectDormantBurst(userId: string): Promise<void> {
  try {
    const rows = await sql`
      SELECT
        u.last_active_at,
        u.created_at,
        (SELECT COUNT(*) FROM contributions WHERE user_id = u.id AND created_at > NOW() - INTERVAL '1 hour') AS recent_actions
      FROM users u
      WHERE u.id = ${userId}::uuid
      LIMIT 1
    `
    if (rows.length === 0) return
    const lastActiveRaw = rows[0].last_active_at
    const recentActions = Number(rows[0].recent_actions ?? 0)
    if (!lastActiveRaw) return
    const lastActive = new Date(lastActiveRaw as string)
    const daysDormant = Math.floor((Date.now() - lastActive.getTime()) / 86_400_000)
    if (daysDormant >= 90 && recentActions >= 10) {
      await createAlert({
        type: "dormant_account_burst",
        severity: "important",
        userId,
        title: `Réveil suspect d'un compte dormant`,
        description: `Compte inactif depuis ${daysDormant} jours, vient d'effectuer ${recentActions} actions en 1h. Pattern compatible avec un compte compromis ou racheté.`,
        suggestedAction: "Vérifier l'authenticité du propriétaire (email, 2FA), suspendre préventivement si doute",
        context: { daysDormant, recentActions },
      })
    }
  } catch (e) {
    console.warn("[detectDormantBurst skipped]", (e as Error).message)
  }
}
