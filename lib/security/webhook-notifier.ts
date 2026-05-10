/**
 * Notifie via webhook personnel (Discord, Slack, Telegram, ou URL custom).
 * Configuration via .env :
 *   SECURITY_WEBHOOK_URL=https://discord.com/api/webhooks/...
 *   SECURITY_WEBHOOK_KIND=discord|slack|telegram|custom
 *   TELEGRAM_BOT_TOKEN=...
 *   TELEGRAM_CHAT_ID=...
 *
 * Si SECURITY_WEBHOOK_URL est vide → silencieux (les emails restent actifs)
 */

export type AlertLevel = "info" | "warning" | "critical"

interface WebhookPayload {
  title: string
  message: string
  level: AlertLevel
  context?: Record<string, unknown>
}

export async function sendSecurityWebhook(payload: WebhookPayload): Promise<void> {
  const kind = process.env.SECURITY_WEBHOOK_KIND ?? "discord"

  if (kind === "telegram") {
    return sendTelegram(payload)
  }

  const url = process.env.SECURITY_WEBHOOK_URL
  if (!url) return // module désactivé

  try {
    if (kind === "discord") {
      await sendDiscord(url, payload)
    } else if (kind === "slack") {
      await sendSlack(url, payload)
    } else {
      await sendCustom(url, payload)
    }
  } catch (e) {
    console.warn("[webhook notification failed]", (e as Error).message)
  }
}

async function sendDiscord(url: string, p: WebhookPayload) {
  const color =
    p.level === "critical" ? 0xdc2626 : p.level === "warning" ? 0xf59e0b : 0x6366f1
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: p.title,
          description: p.message,
          color,
          fields: p.context
            ? Object.entries(p.context)
                .slice(0, 10)
                .map(([k, v]) => ({
                  name: k,
                  value: String(v).slice(0, 100),
                  inline: true,
                }))
            : [],
          timestamp: new Date().toISOString(),
          footer: { text: "VIXUAL Security" },
        },
      ],
    }),
  })
}

async function sendSlack(url: string, p: WebhookPayload) {
  const emoji =
    p.level === "critical"
      ? ":rotating_light:"
      : p.level === "warning"
        ? ":warning:"
        : ":information_source:"
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `${emoji} *${p.title}*\n${p.message}`,
      attachments: p.context
        ? [
            {
              fields: Object.entries(p.context)
                .slice(0, 10)
                .map(([k, v]) => ({ title: k, value: String(v), short: true })),
            },
          ]
        : [],
    }),
  })
}

async function sendTelegram(p: WebhookPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const emoji = p.level === "critical" ? "[CRIT]" : p.level === "warning" ? "[WARN]" : "[INFO]"
  const ctxStr = p.context
    ? "\n\n" +
      Object.entries(p.context)
        .slice(0, 10)
        .map(([k, v]) => `- *${k}* : ${v}`)
        .join("\n")
    : ""

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `${emoji} *${p.title}*\n\n${p.message}${ctxStr}`,
      parse_mode: "Markdown",
    }),
  })
}

async function sendCustom(url: string, p: WebhookPayload) {
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  })
}
