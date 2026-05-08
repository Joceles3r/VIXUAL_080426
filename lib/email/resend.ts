import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.EMAIL_FROM ?? "VIXUAL <noreply@vixual.fr>"

export async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  if (!resend) { console.log("[Email mock]", to, subject); return { success: true } }
  try { await resend.emails.send({ from: FROM, to, subject, html }); return { success: true } }
  catch (e: unknown) { return { success: false, error: e instanceof Error ? e.message : "Send failed" } }
}

export const TEMPLATES = {
  passwordReset: (name: string, link: string) => ({
    subject: "Reinitialisation de votre mot de passe VIXUAL",
    html: `<div style="font-family:system-ui;max-width:520px;margin:0 auto;padding:24px"><h2>Bonjour ${name},</h2><p>Vous avez demande a reinitialiser votre mot de passe.</p><p><a href="${link}" style="background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Reinitialiser</a></p><p style="color:#888;font-size:13px">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez ce message.</p></div>`,
  }),
  welcome: (name: string) => ({
    subject: "Bienvenue sur VIXUAL — Vois-les avant tout le monde.",
    html: `<div style="font-family:system-ui;max-width:520px;margin:0 auto;padding:24px"><h2>Bienvenue ${name} !</h2><p>VIXUAL est une plateforme de streaming participative dediee aux createurs independants. <strong>Regarde — Soutiens — Participe.</strong></p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/explore" style="background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Explorer les contenus</a></p></div>`,
  }),
  parentalConsent: (guardianName: string, minorName: string, consentLink: string) => ({
    subject: `Consentement parental requis pour ${minorName}`,
    html: `<div style="font-family:system-ui;max-width:520px;margin:0 auto;padding:24px"><h2>Bonjour ${guardianName},</h2><p>${minorName} souhaite s'inscrire sur VIXUAL et a indique votre adresse comme tuteur legal.</p><p>VIXUAL est une plateforme de streaming participatif. En tant que mineur, ${minorName} ne pourra pas effectuer de paiement ni recevoir d'argent — uniquement gagner des VIXUpoints (plafonnes a 100 EUR).</p><p><a href="${consentLink}" style="background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">Donner mon consentement</a></p></div>`,
  }),
  monthlyGain: (name: string, amount: string, link: string) => ({
    subject: `Vos gains VIXUAL ce mois-ci : ${amount}`,
    html: `<div style="font-family:system-ui;max-width:520px;margin:0 auto;padding:24px"><h2>Bonjour ${name},</h2><p>Le cycle est clos. Vos gains de ce mois s'elevent a <strong>${amount}</strong>.</p><p><a href="${link}" style="background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">Voir mon Wallet</a></p></div>`,
  }),
}
