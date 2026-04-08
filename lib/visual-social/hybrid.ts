// lib/visual-social/hybrid.ts
// VIXUAL Social — Hybrid Provider (V1)
// - "Content Thread": discussion sous un contenu (video/podcast/text)
// - "Global Feed": fil interne global (tendances / derniers posts)
// - Feature flag OFF => Mock provider (pret pendant la construction)
// - Feature flag ON  => DB provider (a brancher quand pret)

export type ContentType = "video" | "podcast" | "text"

export type VIXUALSocialRole =
  | "guest"
  | "visitor"
  | "minor_visitor"
  | "porter"
  | "contributor"
  | "infoporter"
  | "contribureader"
  | "podcaster"
  | "auditor"

export type SocialStatus = "visible" | "hidden" | "pending" | "deleted"

export type SocialTag =
  | "avis"
  | "question"
  | "amelioration"
  | "bug"
  | "idee"
  | "casting"
  | "scenario"
  | "son"
  | "montage"
  | "investissement"
  | "spoiler"

export const VISUAL_SOCIAL_TAGS: SocialTag[] = [
  "avis",
  "question",
  "amelioration",
  "bug",
  "idee",
  "casting",
  "scenario",
  "son",
  "montage",
  "investissement",
  "spoiler",
]

export const TAG_LABELS: Record<SocialTag, string> = {
  avis: "Avis",
  question: "Question",
  amelioration: "Am\u00e9lioration",
  bug: "Bug",
  idee: "Id\u00e9e",
  casting: "Casting",
  scenario: "Sc\u00e9nario",
  son: "Son",
  montage: "Montage",
  investissement: "Investissement",
  spoiler: "Spoiler",
}

export const TAG_COLORS: Record<SocialTag, string> = {
  avis:            "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  question:        "bg-sky-500/20 text-sky-400 border-sky-500/30",
  amelioration:    "bg-amber-500/20 text-amber-400 border-amber-500/30",
  bug:             "bg-red-500/20 text-red-400 border-red-500/30",
  idee:            "bg-violet-500/20 text-violet-400 border-violet-500/30",
  casting:         "bg-pink-500/20 text-pink-400 border-pink-500/30",
  scenario:        "bg-orange-500/20 text-orange-400 border-orange-500/30",
  son:             "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  montage:         "bg-teal-500/20 text-teal-400 border-teal-500/30",
  investissement:  "bg-amber-500/20 text-amber-400 border-amber-500/30",
  spoiler:         "bg-slate-500/20 text-slate-400 border-slate-500/30",
}

export const TAG_CATEGORIES = [
  { key: "feedback" as const, label: "Retours", tags: ["avis", "question", "amelioration", "bug", "idee"] as SocialTag[] },
  { key: "creation" as const, label: "Cr\u00e9ation", tags: ["casting", "scenario", "son", "montage"] as SocialTag[] },
  { key: "other" as const,    label: "Autre", tags: ["investissement", "spoiler"] as SocialTag[] },
]

// VIXUpoints desactives en V1 pour eviter le farming
// avant que la moderation et l'anti-spam soient stables
export const VISUAL_SOCIAL_ENABLE_VISUPOINTS_V1 = false

// ─── Post type ───

export type SocialPost = {
  id: string
  contentType: ContentType | "global"
  contentId: string | null
  authorUserId: string
  authorName: string
  authorRole: VIXUALSocialRole
  body: string
  tags: SocialTag[]
  parentId: string | null
  depth: 0 | 1
  status: SocialStatus
  likeCount: number
  replyCount: number
  reportCount: number
  createdAtISO: string
}

// ─── Params ───

export type ListParams = {
  contentType?: ContentType
  contentId?: string
  global?: boolean
  tag?: SocialTag
  limit?: number
}

export type CreateParams = {
  contentType: ContentType | "global"
  contentId: string | null
  authorUserId: string
  authorName: string
  authorRole: VIXUALSocialRole
  body: string
  tags: SocialTag[]
  parentId?: string | null
}

export type LikeParams = { postId: string; userId: string }
export type ReportParams = { postId: string; userId: string; reason: string }

// ─── Provider interface ───

export interface VIXUALSocialProvider {
  list(params: ListParams): Promise<{ roots: SocialPost[]; repliesByParent: Record<string, SocialPost[]> }>
  create(params: CreateParams): Promise<SocialPost>
  like(params: LikeParams): Promise<{ liked: boolean }>
  report(params: ReportParams): Promise<{ reported: boolean; autoHidden?: boolean }>
}

// ─── Feature flag ───

export function isVIXUALSocialEnabled(): boolean {
  const raw =
    (typeof process !== "undefined" && (process.env.NEXT_PUBLIC_VISUAL_SOCIAL_ENABLED ?? process.env.VISUAL_SOCIAL_ENABLED)) ||
    "0"
  return raw === "1" || raw.toLowerCase() === "true"
}

// ─── Validation ───

export const MAX_BODY_LENGTH = 2000
export const MAX_TAGS_PER_POST = 3
export const MAX_POSTS_PER_DAY = 5
export const REPORT_THRESHOLD_HIDE = 3

export function normalizeTags(tags: string[]): SocialTag[] {
  const cleaned = tags
    .map((t) => t.trim().toLowerCase().replace(/^#/, "") as SocialTag)
    .filter((t) => VISUAL_SOCIAL_TAGS.includes(t))
  return Array.from(new Set(cleaned)).slice(0, MAX_TAGS_PER_POST)
}

export function assertCreateIsValid(p: CreateParams) {
  if (!p.authorUserId) throw new Error("Missing authorUserId")
  if (!p.authorRole) throw new Error("Missing authorRole")
  const body = p.body?.trim()
  if (!body || body.length < 1 || body.length > MAX_BODY_LENGTH) throw new Error("Invalid body length")
  if (!Array.isArray(p.tags)) throw new Error("tags required")
  const tags = normalizeTags(p.tags)
  if (tags.length < 1) throw new Error("At least 1 valid tag required")
  if (tags.length > MAX_TAGS_PER_POST) throw new Error("Max 3 tags")
}

// ─── Role config ───

export const ROLE_SOCIAL_CONFIG: Record<string, {
  canPost: boolean
  canReact: boolean
  badgeColor: string
  badgeLabel: string
}> = {
  guest:          { canPost: false, canReact: false, badgeColor: "bg-slate-600",   badgeLabel: "Invit\u00e9" },
  visitor:        { canPost: true,  canReact: true,  badgeColor: "bg-emerald-600", badgeLabel: "Visiteur" },
  minor_visitor:  { canPost: true,  canReact: true,  badgeColor: "bg-emerald-600", badgeLabel: "Visiteur" },
  listener:       { canPost: true,  canReact: true,  badgeColor: "bg-sky-600",     badgeLabel: "Auditeur" },
  investireader:  { canPost: true,  canReact: true,  badgeColor: "bg-indigo-600",  badgeLabel: "Investi-lecteur" },
  porter:         { canPost: true,  canReact: true,  badgeColor: "bg-red-600",     badgeLabel: "Porteur" },
  infoporter:     { canPost: true,  canReact: true,  badgeColor: "bg-sky-600",     badgeLabel: "Infoporteur" },
  podcaster:      { canPost: true,  canReact: true,  badgeColor: "bg-purple-600",  badgeLabel: "Podcasteur" },
  investor:       { canPost: true,  canReact: true,  badgeColor: "bg-amber-600",   badgeLabel: "Investisseur" },
}

// ─── Time utils ───

export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "\u00c0 l'instant"
  if (mins < 60) return `il y a ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `il y a ${days}j`
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

// ─── Mock Provider ───

function makeId(prefix = "p") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

function nowISO() {
  return new Date().toISOString()
}

function pastISO(hoursAgo: number) {
  const d = new Date()
  d.setHours(d.getHours() - hoursAgo)
  return d.toISOString()
}

const MOCK_AUTHORS: { name: string; role: VIXUALSocialRole }[] = [
  { name: "Marie C.", role: "visitor" },
  { name: "Lucas D.", role: "porter" },
  { name: "Sophie M.", role: "investor" },
  { name: "Thomas B.", role: "listener" },
  { name: "Julie R.", role: "podcaster" },
  { name: "Alex P.", role: "infoporter" },
  { name: "Camille V.", role: "visitor" },
  { name: "Nathan L.", role: "porter" },
]

const MOCK_GLOBAL_POSTS: SocialPost[] = [
  {
    id: "p_g1", contentType: "global", contentId: null,
    authorUserId: "u1", authorName: "Marie C.", authorRole: "visitor",
    body: "Je viens de d\u00e9couvrir un court-m\u00e9trage incroyable sur VISUAL. La photographie est magnifique, chaque plan raconte une histoire. Bravo au porteur !",
    tags: ["avis"], parentId: null, depth: 0, status: "visible",
    likeCount: 12, replyCount: 2, reportCount: 0, createdAtISO: pastISO(2),
  },
  {
    id: "p_g1r1", contentType: "global", contentId: null,
    authorUserId: "u2", authorName: "Lucas D.", authorRole: "porter",
    body: "Merci beaucoup ! \u00c7a fait plaisir d'avoir des retours aussi positifs de la communaut\u00e9.",
    tags: ["avis"], parentId: "p_g1", depth: 1, status: "visible",
    likeCount: 5, replyCount: 0, reportCount: 0, createdAtISO: pastISO(1),
  },
  {
    id: "p_g2", contentType: "global", contentId: null,
    authorUserId: "u3", authorName: "Sophie M.", authorRole: "investor",
    body: "Premi\u00e8re fois que j'investis sur un projet documentaire. Le pitch m'a convaincu d\u00e8s les premi\u00e8res lignes. H\u00e2te de voir le r\u00e9sultat final !",
    tags: ["investissement"], parentId: null, depth: 0, status: "visible",
    likeCount: 8, replyCount: 1, reportCount: 0, createdAtISO: pastISO(5),
  },
  {
    id: "p_g2r1", contentType: "global", contentId: null,
    authorUserId: "u4", authorName: "Thomas B.", authorRole: "listener",
    body: "Pareil ici, le documentaire sur l'art urbain est vraiment prometteur. Belle s\u00e9lection ce mois-ci.",
    tags: ["avis"], parentId: "p_g2", depth: 1, status: "visible",
    likeCount: 3, replyCount: 0, reportCount: 0, createdAtISO: pastISO(4),
  },
  {
    id: "p_g3", contentType: "global", contentId: null,
    authorUserId: "u5", authorName: "Julie R.", authorRole: "podcaster",
    body: "En tant que podcasteuse, VIXUAL Social c'est exactement ce qu'il manquait pour \u00e9changer avec notre communaut\u00e9. Des retours structur\u00e9s par tags, c'est top !",
    tags: ["idee", "amelioration"], parentId: null, depth: 0, status: "visible",
    likeCount: 15, replyCount: 0, reportCount: 0, createdAtISO: pastISO(8),
  },
  {
    id: "p_g4", contentType: "global", contentId: null,
    authorUserId: "u6", authorName: "Alex P.", authorRole: "infoporter",
    body: "Mon article sur les techniques de narration documentaire a re\u00e7u beaucoup de retours constructifs gr\u00e2ce aux tags #question. Continuez !",
    tags: ["question", "scenario"], parentId: null, depth: 0, status: "visible",
    likeCount: 7, replyCount: 0, reportCount: 0, createdAtISO: pastISO(12),
  },
  {
    id: "p_g5", contentType: "global", contentId: null,
    authorUserId: "u7", authorName: "Camille V.", authorRole: "visitor",
    body: "Apr\u00e8s 6 mois sur VISUAL, je suis pass\u00e9e de simple visiteuse \u00e0 investisseuse. La communaut\u00e9 ici est vraiment unique. Merci pour tout !",
    tags: ["avis"], parentId: null, depth: 0, status: "visible",
    likeCount: 20, replyCount: 0, reportCount: 0, createdAtISO: pastISO(18),
  },
  {
    id: "p_g6", contentType: "global", contentId: null,
    authorUserId: "u8", authorName: "Nathan L.", authorRole: "porter",
    body: "Mon projet vient d'atteindre 75% de financement ! Merci \u00e0 tous les investisseurs. Le tournage commence dans 3 semaines.",
    tags: ["investissement", "casting"], parentId: null, depth: 0, status: "visible",
    likeCount: 25, replyCount: 0, reportCount: 0, createdAtISO: pastISO(24),
  },
]

const MOCK_CONTENT_POSTS: SocialPost[] = [
  {
    id: "p_c1", contentType: "video", contentId: "content-1",
    authorUserId: "u1", authorName: "Marie C.", authorRole: "visitor",
    body: "La sc\u00e8ne d'ouverture est incroyable. Le jeu de lumi\u00e8re et les plans larges cr\u00e9ent une atmosph\u00e8re unique. Quelqu'un sait si le r\u00e9alisateur a d'autres projets ?",
    tags: ["avis", "scenario"], parentId: null, depth: 0, status: "visible",
    likeCount: 6, replyCount: 1, reportCount: 0, createdAtISO: pastISO(3),
  },
  {
    id: "p_c1r1", contentType: "video", contentId: "content-1",
    authorUserId: "u2", authorName: "Lucas D.", authorRole: "porter",
    body: "Oui, il travaille sur un nouveau projet ! Restez connect\u00e9s, l'annonce arrive bient\u00f4t sur VISUAL.",
    tags: ["avis"], parentId: "p_c1", depth: 1, status: "visible",
    likeCount: 3, replyCount: 0, reportCount: 0, createdAtISO: pastISO(2),
  },
  {
    id: "p_c2", contentType: "video", contentId: "content-1",
    authorUserId: "u3", authorName: "Sophie M.", authorRole: "investor",
    body: "J'ai investi dans ce projet et je ne regrette pas. La qualit\u00e9 de production est largement au-dessus de ce que j'attendais pour un premier film.",
    tags: ["investissement", "avis"], parentId: null, depth: 0, status: "visible",
    likeCount: 9, replyCount: 0, reportCount: 0, createdAtISO: pastISO(6),
  },
]

const mockStore: SocialPost[] = [...MOCK_GLOBAL_POSTS, ...MOCK_CONTENT_POSTS]

export function createMockProvider(): VIXUALSocialProvider {
  return {
    async list(params) {
      const limit = Math.min(params.limit ?? 30, 100)
      let roots = mockStore.filter((p) => p.depth === 0 && p.status === "visible")

      if (params.global) {
        roots = roots.filter((p) => p.contentType === "global")
      }
      if (params.contentType && params.contentId) {
        roots = roots.filter((p) => p.contentType === params.contentType && p.contentId === params.contentId)
      }
      if (params.tag) {
        roots = roots.filter((p) => p.tags.includes(params.tag!))
      }

      roots = roots.sort((a, b) => (a.createdAtISO < b.createdAtISO ? 1 : -1)).slice(0, limit)

      const replies = mockStore.filter(
        (p) => p.depth === 1 && p.status === "visible" && p.parentId && roots.some((r) => r.id === p.parentId)
      )
      const repliesByParent: Record<string, SocialPost[]> = {}
      for (const rep of replies.sort((a, b) => (a.createdAtISO > b.createdAtISO ? 1 : -1))) {
        const key = rep.parentId!
        if (!repliesByParent[key]) repliesByParent[key] = []
        repliesByParent[key].push(rep)
      }

      return { roots, repliesByParent }
    },

    async create(params) {
      assertCreateIsValid(params)
      const tags = normalizeTags(params.tags)
      const isReply = Boolean(params.parentId)
      const post: SocialPost = {
        id: makeId("p"),
        contentType: params.contentType,
        contentId: params.contentId,
        authorUserId: params.authorUserId,
        authorName: params.authorName || "Anonyme",
        authorRole: params.authorRole,
        body: params.body.trim(),
        tags,
        parentId: params.parentId ?? null,
        depth: isReply ? 1 : 0,
        status: "visible",
        likeCount: 0,
        replyCount: 0,
        reportCount: 0,
        createdAtISO: nowISO(),
      }
      mockStore.push(post)

      if (isReply) {
        const parent = mockStore.find((p) => p.id === params.parentId)
        if (parent) parent.replyCount += 1
      }

      return post
    },

    async like({ postId }) {
      const post = mockStore.find((p) => p.id === postId)
      if (!post) return { liked: false }
      post.likeCount += 1
      return { liked: true }
    },

    async report({ postId }) {
      const post = mockStore.find((p) => p.id === postId)
      if (!post) return { reported: false }
      post.reportCount += 1
      const autoHidden = post.reportCount >= REPORT_THRESHOLD_HIDE
      if (autoHidden) post.status = "hidden"
      return { reported: true, autoHidden }
    },
  }
}

// ─── DB Provider skeleton ───

export function createDbProvider(_deps: Record<string, unknown>): VIXUALSocialProvider {
  return {
    async list(_params) { throw new Error("DB provider not wired yet") },
    async create(_params) { throw new Error("DB provider not wired yet") },
    async like(_params) { throw new Error("DB provider not wired yet") },
    async report(_params) { throw new Error("DB provider not wired yet") },
  }
}

// ─── Factory ───

export function getVIXUALSocialProvider(deps?: Record<string, unknown>): VIXUALSocialProvider {
  return isVIXUALSocialEnabled() ? createDbProvider(deps ?? {}) : createMockProvider()
}

/** @deprecated Alias for backward compatibility - use getVIXUALSocialProvider */
export const getVisualSocialProvider = getVIXUALSocialProvider;
