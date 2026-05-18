/**
 * VIXUAL — lib/briefing/email-template.ts
 * Template email HTML du briefing quotidien.
 */
import type { BriefingData } from "@/lib/briefing/collector"

export function renderBriefingEmail(data: BriefingData): { subject: string; html: string; text: string } {
  const d = new Date(data.date).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })
  const totalAlerts = data.alerts.critical + data.alerts.warning + data.alerts.info
  const subject = `VIXUAL — Briefing du ${d}${data.alerts.critical > 0 ? " ALERTE" : ""}`

  const text = [
    "Bonjour Jocelyn,",
    "",
    "=== A TRAITER AUJOURD'HUI ===",
    `Critiques : ${data.alerts.critical}`,
    `Importantes : ${data.alerts.warning}`,
    `Standards : ${data.alerts.info}`,
    "",
    "=== ACTIVITE 24h ===",
    `Nouveaux inscrits : ${data.activity.newUsers}`,
    `Nouveaux contenus : ${data.activity.newContents}`,
    `Contributions : ${data.activity.contributions} (${data.activity.revenueEur} EUR)`,
    "",
    "=== EN ATTENTE ===",
    `Demandes de chaine : ${data.pending.channelRequests}`,
    "",
    "=== SANTE TECHNIQUE ===",
    `${data.health.db ? "OK" : "KO"} Base de donnees`,
    `${data.health.stripe ? "OK" : "KO"} Stripe configure`,
    `${data.health.bunny ? "OK" : "KO"} Bunny.net configure`,
    `${data.health.resend ? "OK" : "KO"} Emails Resend`,
    "",
    `Tableau de bord : ${process.env.NEXT_PUBLIC_BASE_URL ?? "https://vixual.app"}/admin/daily-briefing`,
  ].join("\n")

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://vixual.app"
  const critColor = data.alerts.critical > 0 ? "#ef4444" : "#22c55e"
  const warnColor = data.alerts.warning > 0 ? "#f59e0b" : "#22c55e"
  const dbColor = data.health.db ? "#22c55e" : "#ef4444"
  const dbLabel = data.health.db ? "OK" : "KO"
  const stripeColor = data.health.stripe ? "#22c55e" : "#f59e0b"
  const stripeLabel = data.health.stripe ? "Configure" : "Non configure"
  const bunnyColor = data.health.bunny ? "#22c55e" : "#f59e0b"
  const bunnyLabel = data.health.bunny ? "Configure" : "Non configure"
  const resendColor = data.health.resend ? "#22c55e" : "#ef4444"
  const resendLabel = data.health.resend ? "OK" : "KO"

  const html = [
    '<!DOCTYPE html>',
    '<html><head><meta charset="utf-8"><title>' + subject + '</title></head>',
    '<body style="margin:0;padding:0;background:#030307;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;">',
    '<div style="max-width:600px;margin:0 auto;padding:32px 24px;color:#fff;">',
    '  <h1 style="font-size:24px;font-weight:800;background:linear-gradient(90deg,#ec4899,#a855f7,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0 0 8px;">VIXUAL</h1>',
    '  <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 32px;">Briefing du ' + d + '</p>',
    '',
    '  <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.5);margin:24px 0 12px;">A traiter</h2>',
    '  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;">',
    '    <tr><td style="padding:8px 0;color:#fff;font-size:15px;">Alertes critiques</td><td style="padding:8px 0;color:' + critColor + ';font-size:15px;font-weight:700;text-align:right;">' + data.alerts.critical + '</td></tr>',
    '    <tr><td style="padding:8px 0;color:#fff;font-size:15px;">Alertes importantes</td><td style="padding:8px 0;color:' + warnColor + ';font-size:15px;font-weight:700;text-align:right;">' + data.alerts.warning + '</td></tr>',
    '    <tr><td style="padding:8px 0;color:#fff;font-size:15px;">Alertes standards</td><td style="padding:8px 0;color:rgba(255,255,255,0.8);font-size:15px;font-weight:700;text-align:right;">' + data.alerts.info + '</td></tr>',
    '  </table>',
    '',
    '  <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.5);margin:24px 0 12px;">Activite 24h</h2>',
    '  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;">',
    '    <tr><td style="padding:6px 0;color:rgba(255,255,255,0.8);">Nouveaux inscrits</td><td style="text-align:right;color:#fff;font-weight:700;">' + data.activity.newUsers + '</td></tr>',
    '    <tr><td style="padding:6px 0;color:rgba(255,255,255,0.8);">Nouveaux contenus</td><td style="text-align:right;color:#fff;font-weight:700;">' + data.activity.newContents + '</td></tr>',
    '    <tr><td style="padding:6px 0;color:rgba(255,255,255,0.8);">Contributions</td><td style="text-align:right;color:#fff;font-weight:700;">' + data.activity.contributions + '</td></tr>',
    '    <tr><td style="padding:6px 0;color:rgba(255,255,255,0.8);">Revenus du jour</td><td style="text-align:right;color:#22c55e;font-weight:700;">' + data.activity.revenueEur + ' EUR</td></tr>',
    '  </table>',
    '',
    '  <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.5);margin:24px 0 12px;">Sante technique</h2>',
    '  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;">',
    '    <tr><td style="padding:6px 0;color:rgba(255,255,255,0.8);">Base de donnees</td><td style="text-align:right;font-weight:700;color:' + dbColor + ';">' + dbLabel + '</td></tr>',
    '    <tr><td style="padding:6px 0;color:rgba(255,255,255,0.8);">Stripe</td><td style="text-align:right;font-weight:700;color:' + stripeColor + ';">' + stripeLabel + '</td></tr>',
    '    <tr><td style="padding:6px 0;color:rgba(255,255,255,0.8);">Bunny.net</td><td style="text-align:right;font-weight:700;color:' + bunnyColor + ';">' + bunnyLabel + '</td></tr>',
    '    <tr><td style="padding:6px 0;color:rgba(255,255,255,0.8);">Emails Resend</td><td style="text-align:right;font-weight:700;color:' + resendColor + ';">' + resendLabel + '</td></tr>',
    '  </table>',
    '',
    '  <div style="text-align:center;margin:32px 0 16px;">',
    '    <a href="' + baseUrl + '/admin/daily-briefing" style="display:inline-block;padding:14px 32px;background:linear-gradient(90deg,#ec4899,#a855f7,#3b82f6);color:#fff;text-decoration:none;border-radius:999px;font-weight:700;">Ouvrir le tableau de bord</a>',
    '  </div>',
    '',
    '  <p style="text-align:center;color:rgba(255,255,255,0.3);font-size:11px;margin:24px 0 0;">VIXUAL — ' + totalAlerts + ' alerte(s) en attente</p>',
    '</div></body></html>',
  ].join("\n")

  return { subject, html, text }
}
