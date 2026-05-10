/**
 * Liste des domaines d'emails jetables/temporaires les plus connus.
 * Mise à jour : tous les domaines évidents à mai 2026.
 * Pour une liste exhaustive en production, considérer Kickbox ou Mailgun Validation API.
 */
const DISPOSABLE_DOMAINS = new Set<string>([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
  "guerrillamailblock.com", "10minutemail.com", "10minutemail.net",
  "tempmail.com", "tempmail.net", "temp-mail.org", "throwaway.email",
  "trashmail.com", "trashmail.net", "yopmail.com", "yopmail.fr",
  "yopmail.net", "sharklasers.com", "grr.la", "spam4.me", "guerrillamail.de",
  "tempinbox.com", "fakeinbox.com", "fakemail.fr", "fakemail.net",
  "getairmail.com", "getnada.com", "mintemail.com", "mohmal.com",
  "mytemp.email", "tempr.email", "throwawaymail.com", "tmail.ws",
  "tmpmail.org", "tmpmail.net", "dispostable.com", "dropmail.me",
  "harakirimail.com", "instantemailaddress.com", "mailcatch.com",
  "mailnesia.com", "maildrop.cc", "mailtemp.info", "minutemail.com",
  "moakt.com", "nada.email", "nowmymail.com", "nwldx.com",
  "spamgourmet.com", "spamgourmet.net", "spamgourmet.org", "spamherelots.com",
  "spambox.us", "spambog.com", "tafmail.com", "temp-mail.io",
  "temp-mail.ru", "tempemail.com", "tempemail.net", "tempmailaddress.com",
  "tempmailer.com", "tempmailer.de", "tempymail.com", "thankyou2010.com",
  "vmailbox.org", "wegwerfmail.de", "wegwerfmail.net", "wegwerfmail.org",
  "yepmail.com", "zippymail.in", "0clickemail.com", "0wnd.net",
])

/** Retourne true si le domaine est jetable. Insensible à la casse. */
export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false
  const domain = email.split("@")[1]?.trim().toLowerCase()
  if (!domain) return false
  return DISPOSABLE_DOMAINS.has(domain)
}

/** Retourne true si l'email est "manifestement suspect" (jetable + autres patterns) */
export function isSuspiciousEmail(email: string): boolean {
  if (isDisposableEmail(email)) return true
  // Pattern de plus en plus utilisé : "+test123" en grand nombre
  const local = email.split("@")[0] ?? ""
  if ((local.match(/\+/g)?.length ?? 0) > 3) return true
  // Nombres aléatoires dans le local part > 10 chiffres consécutifs
  if (/\d{10,}/.test(local)) return true
  return false
}
