/**
 * Détecte les user-agents évidents de bots/scrapers.
 * Pour les bots sophistiqués qui imitent un navigateur réel, combiner avec
 * Cloudflare Turnstile (voir section dédiée).
 */
const BOT_PATTERNS = [
  /curl\//i, /wget\//i, /python-requests/i, /python-urllib/i,
  /scrapy/i, /httpie/i, /httpclient/i, /node-fetch/i, /axios/i,
  /go-http-client/i, /okhttp/i, /java\//i, /apache-httpclient/i,
  /libwww-perl/i, /lwp::/i, /mechanize/i, /selenium/i, /puppeteer/i,
  /playwright/i, /headlesschrome/i, /phantomjs/i, /chrome-lighthouse/i,
  /^$/, // empty user-agent
]

const BOT_KEYWORDS = [
  "bot", "spider", "crawl", "slurp", "scraper", "harvest", "extract",
  "scan", "fetch", "wget", "ping", "monitor", "probe", "checker",
]

const ALLOWED_BOTS = [
  // Search engines (à ne pas bloquer)
  /googlebot/i, /bingbot/i, /duckduckbot/i, /baiduspider/i, /yandex/i,
  /applebot/i, /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
  /whatsapp/i, /telegrambot/i,
]

export type BotCheckResult = {
  isBot: boolean
  isAllowed: boolean
  reason?: string
}

export function checkUserAgent(userAgent: string | null): BotCheckResult {
  if (!userAgent || userAgent.trim().length === 0) {
    return { isBot: true, isAllowed: false, reason: "empty_user_agent" }
  }

  // Allowlist des bots légitimes
  if (ALLOWED_BOTS.some((p) => p.test(userAgent))) {
    return { isBot: true, isAllowed: true, reason: "allowed_search_bot" }
  }

  // Patterns évidents
  if (BOT_PATTERNS.some((p) => p.test(userAgent))) {
    return { isBot: true, isAllowed: false, reason: "bot_pattern_match" }
  }

  // Mots-clés suspects
  const lower = userAgent.toLowerCase()
  if (BOT_KEYWORDS.some((k) => lower.includes(k))) {
    return { isBot: true, isAllowed: false, reason: "bot_keyword_match" }
  }

  // Suspect : navigateur très ancien (signe de outil scripté)
  if (/firefox\/[0-3]\d?\./i.test(userAgent) || /chrome\/[0-3]\d?\./i.test(userAgent)) {
    return { isBot: true, isAllowed: false, reason: "ancient_browser_version" }
  }

  return { isBot: false, isAllowed: true }
}
