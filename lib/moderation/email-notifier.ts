import { sendEmail } from "@/lib/email/resend"
import { PATRON_EMAIL as PATRON_EMAIL_CONST } from "@/lib/admin/roles"

const PATRON_EMAIL = process.env.PATRON_EMAIL ?? PATRON_EMAIL_CONST
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vixual.fr"

interface CriticalAlertEmailInput {
  type: string
  title: string
  description: string
  alertId: string
}

export async function sendCriticalAlertEmail(input: CriticalAlertEmailInput): Promise<void> {
  const link = `${SITE_URL}/admin/moderation?alert=${input.alertId}`
  const subject = `[VIXUAL] Alerte critique : ${input.title}`
  const html = `
    <div style="font-family:system-ui;max-width:560px;margin:0 auto;padding:24px;background:#0a0118;color:#fff">
      <div style="background:linear-gradient(135deg,#dc2626 0%,#7f1d1d 100%);padding:20px;border-radius:12px;margin-bottom:20px">
        <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700">Alerte critique VIXUAL</h1>
      </div>
      <h2 style="color:#f0abfc;font-size:16px;margin-bottom:8px">${escapeHtml(input.title)}</h2>
      <p style="color:#cbd5e1;line-height:1.6;font-size:14px">${escapeHtml(input.description)}</p>
      <p style="color:#94a3b8;font-size:12px;margin-top:16px"><strong>Type :</strong> <code style="background:#1e293b;padding:2px 6px;border-radius:4px">${escapeHtml(input.type)}</code></p>
      <div style="margin-top:24px">
        <a href="${link}" style="display:inline-block;background:#d946ef;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Examiner l'alerte
        </a>
      </div>
      <p style="color:#64748b;font-size:11px;margin-top:32px;border-top:1px solid #334155;padding-top:16px">
        Cet email est envoyé automatiquement aux alertes critiques uniquement. Pour gérer toutes les alertes, consultez le tableau de bord admin.
      </p>
    </div>
  `
  try {
    await sendEmail(PATRON_EMAIL, subject, html)
  } catch (e) {
    console.warn("[moderation email skipped]", (e as Error).message)
  }
}

export async function sendWeeklyHealthReport(snapshot: Record<string, unknown>): Promise<void> {
  const subject = "[VIXUAL] Rapport hebdomadaire de santé"
  const rows = Object.entries(snapshot)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#94a3b8">${escapeHtml(k)}</td><td style="padding:6px 12px;color:#fff;font-weight:600">${escapeHtml(String(v))}</td></tr>`,
    )
    .join("")
  const html = `
    <div style="font-family:system-ui;max-width:560px;margin:0 auto;padding:24px;background:#0a0118;color:#fff">
      <h1 style="color:#f0abfc">Rapport hebdomadaire VIXUAL</h1>
      <table style="width:100%;border-collapse:collapse;background:#1e293b;border-radius:8px;overflow:hidden">
        ${rows}
      </table>
      <p style="margin-top:20px"><a href="${SITE_URL}/admin/moderation" style="color:#d946ef">Voir le tableau de bord complet</a></p>
    </div>
  `
  try {
    await sendEmail(PATRON_EMAIL, subject, html)
  } catch (e) {
    console.warn("[moderation weekly email skipped]", (e as Error).message)
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
