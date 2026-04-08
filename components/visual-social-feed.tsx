"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Send, MessageCircle, Hash, ChevronDown, ChevronUp,
  X, Sparkles, Filter, ThumbsUp, CornerDownRight,
} from "lucide-react"
import { ReportButton } from "@/components/report-button"
import {
  type SocialPost, type SocialTag, type ListParams, type ContentType,
  VISUAL_SOCIAL_TAGS, TAG_LABELS, TAG_COLORS, TAG_CATEGORIES,
  MAX_BODY_LENGTH, MAX_TAGS_PER_POST, VISUAL_SOCIAL_ENABLE_VISUPOINTS_V1,
  ROLE_SOCIAL_CONFIG, timeAgo, getVisualSocialProvider,
} from "@/lib/visual-social/hybrid"

// ─── Role Badge ───
function RoleBadge({ role }: { role: string }) {
  const config = ROLE_SOCIAL_CONFIG[role] || ROLE_SOCIAL_CONFIG.guest
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${config.badgeColor}`}>
      {config.badgeLabel}
    </span>
  )
}

// ─── Avatar ───
function UserAvatar({ name, role }: { name: string; role: string }) {
  const config = ROLE_SOCIAL_CONFIG[role] || ROLE_SOCIAL_CONFIG.guest
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white ${config.badgeColor} ring-2 ring-white/10`}>
      {initials}
    </div>
  )
}

// ─── Tag Pill ───
function TagPill({ tag, selected, onClick }: { tag: SocialTag; selected?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${TAG_COLORS[tag]} ${selected ? "ring-2 ring-white/30 scale-105" : "hover:brightness-125"}`}
    >
      {"#"}{TAG_LABELS[tag]}
    </button>
  )
}

// ─── Post Card ───
function PostCard({
  post, replies, onLike, onReport, onReply, likedPosts, reportedPosts,
}: {
  post: SocialPost
  replies: SocialPost[]
  onLike: (id: string) => void
  onReport: (id: string) => void
  onReply: (parentId: string) => void
  likedPosts: Set<string>
  reportedPosts: Set<string>
}) {
  const [showReplies, setShowReplies] = useState(replies.length > 0)
  const hasLiked = likedPosts.has(post.id)
  const hasReported = reportedPosts.has(post.id)

  return (
    <div className="group relative bg-slate-900/60 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <UserAvatar name={post.authorName} role={post.authorRole} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-medium text-sm">{post.authorName}</span>
              <RoleBadge role={post.authorRole} />
              <span className="text-white/30 text-xs">{timeAgo(post.createdAtISO)}</span>
            </div>
          </div>
          {!hasReported && (
            <div className="opacity-0 group-hover:opacity-100 transition-all">
              <ReportButton
                targetId={post.id}
                targetType="comment"
                targetName={`Post de ${post.authorName}`}
                variant="minimal"
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Body */}
        <p className="text-white/80 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.body}</p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.map((tag) => <TagPill key={tag} tag={tag} />)}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onLike(post.id)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${
              hasLiked
                ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
            }`}
          >
            <ThumbsUp className={`h-3.5 w-3.5 ${hasLiked ? "fill-current" : ""}`} />
            {post.likeCount > 0 && <span className="font-mono">{post.likeCount}</span>}
          </button>

          <button
            onClick={() => onReply(post.id)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-all"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {post.replyCount > 0 && <span className="font-mono">{post.replyCount}</span>}
          </button>

          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="inline-flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-all ml-auto"
            >
              {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {replies.length} {replies.length === 1 ? "r\u00e9ponse" : "r\u00e9ponses"}
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="border-t border-white/5 bg-slate-950/40">
          {replies.map((reply) => (
            <div key={reply.id} className="p-4 pl-6 border-b border-white/5 last:border-b-0">
              <div className="flex items-start gap-3">
                <CornerDownRight className="h-4 w-4 text-white/15 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <UserAvatar name={reply.authorName} role={reply.authorRole} />
                    <span className="text-white font-medium text-sm">{reply.authorName}</span>
                    <RoleBadge role={reply.authorRole} />
                    <span className="text-white/30 text-xs">{timeAgo(reply.createdAtISO)}</span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mt-1">{reply.body}</p>
                  {reply.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {reply.tags.map((tag) => <TagPill key={tag} tag={tag} />)}
                    </div>
                  )}
                  <button
                    onClick={() => onLike(reply.id)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs mt-2 transition-all ${
                      likedPosts.has(reply.id)
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-white/5 text-white/40 hover:text-white/70"
                    }`}
                  >
                    <ThumbsUp className={`h-3 w-3 ${likedPosts.has(reply.id) ? "fill-current" : ""}`} />
                    {reply.likeCount > 0 && <span className="font-mono">{reply.likeCount}</span>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Composer ───
function PostComposer({
  onSubmit, replyTo, onCancelReply, contentType, contentId,
}: {
  onSubmit: (body: string, tags: SocialTag[], parentId?: string | null) => void
  replyTo?: string | null
  onCancelReply?: () => void
  contentType: ContentType | "global"
  contentId: string | null
}) {
  const [body, setBody] = useState("")
  const [selectedTags, setSelectedTags] = useState<SocialTag[]>([])
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, role } = useAuth()

  const roleConfig = ROLE_SOCIAL_CONFIG[role?.[0] || "guest"]
  const charsLeft = MAX_BODY_LENGTH - body.length
  const charsColor = charsLeft < 0 ? "text-red-400" : charsLeft < 100 ? "text-amber-400" : "text-white/30"
  const isReply = Boolean(replyTo)

  const handleSubmit = () => {
    const trimmed = body.trim()
    if (!trimmed) return
    if (trimmed.length > MAX_BODY_LENGTH) { setError(`Maximum ${MAX_BODY_LENGTH} caract\u00e8res.`); return }
    if (selectedTags.length < 1 && !isReply) { setError("S\u00e9lectionnez au moins 1 tag."); return }
    if (/https?:\/\//i.test(trimmed)) { setError("Les liens ne sont pas autoris\u00e9s."); return }

    onSubmit(trimmed, isReply ? selectedTags.length > 0 ? selectedTags : ["avis"] : selectedTags, replyTo)
    setBody("")
    setSelectedTags([])
    setError(null)
  }

  const toggleTag = (tag: SocialTag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else if (selectedTags.length < MAX_TAGS_PER_POST) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  if (!roleConfig?.canPost) {
    return (
      <div className="text-center py-6 bg-slate-900/40 rounded-xl border border-white/5">
        <MessageCircle className="h-6 w-6 text-white/15 mx-auto mb-2" />
        <p className="text-white/30 text-sm">{"Connectez-vous pour participer \u00e0 la discussion."}</p>
      </div>
    )
  }

  return (
    <Card className={`border-white/10 ${isReply ? "bg-slate-900/40" : "bg-slate-900/80"}`}>
      <CardContent className="p-4 space-y-3">
        {isReply && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <CornerDownRight className="h-3.5 w-3.5" />
              <span>{"R\u00e9pondre au post"}</span>
            </div>
            <button onClick={onCancelReply} className="text-white/30 hover:text-white/60">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <UserAvatar name={user?.name || "Moi"} role={role?.[0] || "guest"} />
          <div className="flex-1">
            <textarea
              value={body}
              onChange={(e) => { setBody(e.target.value); setError(null) }}
              placeholder={isReply ? "Votre r\u00e9ponse\u2026" : contentType === "global" ? "Partagez votre exp\u00e9rience sur VISUAL\u2026" : "Votre avis sur ce contenu\u2026"}
              rows={isReply ? 2 : 3}
              className="w-full bg-transparent text-white/90 text-sm placeholder:text-white/25 resize-none focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pl-12">
            {selectedTags.map((tag) => (
              <button key={tag} onClick={() => toggleTag(tag)} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${TAG_COLORS[tag]}`}>
                {"#"}{TAG_LABELS[tag]}
                <X className="h-3 w-3 opacity-50" />
              </button>
            ))}
          </div>
        )}

        {/* Tag Picker */}
        {showTagPicker && (
          <div className="pl-12 space-y-3 bg-black/20 rounded-lg p-3 border border-white/5">
            {TAG_CATEGORIES.map((cat) => (
              <div key={cat.key}>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1.5">{cat.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.tags.map((tag) => (
                    <TagPill key={tag} tag={tag} selected={selectedTags.includes(tag)} onClick={() => toggleTag(tag)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="pl-12 flex items-center gap-2 text-red-400 text-xs">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pl-12">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost" size="sm"
              onClick={() => setShowTagPicker(!showTagPicker)}
              className={`h-8 px-2 text-xs ${showTagPicker ? "text-emerald-400 bg-emerald-500/10" : "text-white/40 hover:text-white/70"}`}
            >
              <Hash className="h-3.5 w-3.5 mr-1" />
              Tags {selectedTags.length > 0 && `(${selectedTags.length}/${MAX_TAGS_PER_POST})`}
            </Button>
            <span className={`text-xs font-mono ${charsColor}`}>{charsLeft}</span>
          </div>
          <Button
            size="sm" onClick={handleSubmit}
            disabled={body.trim().length === 0 || charsLeft < 0}
            className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 px-4 text-xs font-semibold disabled:opacity-30"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            {isReply ? "R\u00e9pondre" : "Publier"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Feed Component ───
export default function VisualSocialFeed({
  mode = "global",
  contentType,
  contentId,
}: {
  mode?: "global" | "content"
  contentType?: ContentType
  contentId?: string
}) {
  const { user, role } = useAuth()
  const [roots, setRoots] = useState<SocialPost[]>([])
  const [repliesByParent, setRepliesByParent] = useState<Record<string, SocialPost[]>>({})
  const [filterTag, setFilterTag] = useState<SocialTag | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [reportedPosts, setReportedPosts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const provider = useMemo(() => getVisualSocialProvider(), [])

  const loadPosts = useCallback(async () => {
    setLoading(true)
    const params: ListParams = mode === "global"
      ? { global: true, limit: 30, tag: filterTag || undefined }
      : { contentType, contentId, limit: 30, tag: filterTag || undefined }
    const result = await provider.list(params)
    setRoots(result.roots)
    setRepliesByParent(result.repliesByParent)
    setLoading(false)
  }, [provider, mode, contentType, contentId, filterTag])

  useEffect(() => { loadPosts() }, [loadPosts])

  const handleNewPost = useCallback(async (body: string, tags: SocialTag[], parentId?: string | null) => {
    const result = await provider.create({
      contentType: mode === "global" ? "global" : (contentType || "global"),
      contentId: mode === "global" ? null : (contentId || null),
      authorUserId: user?.id || "me",
      authorName: user?.name || "Moi",
      authorRole: (role?.[0] || "visitor") as any,
      body,
      tags,
      parentId: parentId ?? null,
    })

    if (result.parentId) {
      setRepliesByParent((prev) => ({
        ...prev,
        [result.parentId!]: [...(prev[result.parentId!] || []), result],
      }))
      setRoots((prev) => prev.map((r) => r.id === result.parentId ? { ...r, replyCount: r.replyCount + 1 } : r))
    } else {
      setRoots((prev) => [result, ...prev])
    }
    setReplyTo(null)
  }, [provider, mode, contentType, contentId, user, role])

  const handleLike = useCallback(async (postId: string) => {
    if (likedPosts.has(postId)) return
    const result = await provider.like({ postId, userId: user?.id || "me" })
    if (result.liked) {
      setLikedPosts((prev) => new Set(prev).add(postId))
      setRoots((prev) => prev.map((p) => p.id === postId ? { ...p, likeCount: p.likeCount + 1 } : p))
      setRepliesByParent((prev) => {
        const next = { ...prev }
        for (const key in next) {
          next[key] = next[key].map((r) => r.id === postId ? { ...r, likeCount: r.likeCount + 1 } : r)
        }
        return next
      })
    }
  }, [provider, user, likedPosts])

  const handleReport = useCallback(async (postId: string) => {
    if (reportedPosts.has(postId)) return
    const result = await provider.report({ postId, userId: user?.id || "me", reason: "inappropriate" })
    if (result.reported) {
      setReportedPosts((prev) => new Set(prev).add(postId))
      if (result.autoHidden) {
        setRoots((prev) => prev.filter((p) => p.id !== postId))
      }
    }
  }, [provider, user, reportedPosts])

  // Tag stats for filtering
  const tagStats = useMemo(() => {
    const counts: Partial<Record<SocialTag, number>> = {}
    for (const post of roots) {
      for (const tag of post.tags) {
        counts[tag] = (counts[tag] || 0) + 1
      }
    }
    return VISUAL_SOCIAL_TAGS
      .map((tag) => ({ tag, count: counts[tag] || 0 }))
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [roots])

  const isContentMode = mode === "content"

  return (
    <div className="space-y-4">
      {/* Header */}
      {!isContentMode && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">VIXUAL Social</h2>
              <p className="text-white/40 text-xs">{"Fil global \u2014 La communaut\u00e9 VISUAL s'exprime"}</p>
            </div>
          </div>
          <Button
            variant="ghost" size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-8 px-3 text-xs ${showFilters ? "text-emerald-400 bg-emerald-500/10" : "text-white/40"}`}
          >
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            Filtrer
            {filterTag && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </Button>
        </div>
      )}

      {isContentMode && (
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="h-4 w-4 text-emerald-400" />
          <h3 className="text-white font-semibold text-sm">Discussion</h3>
          <span className="text-white/30 text-xs">{roots.length} {roots.length === 1 ? "post" : "posts"}</span>
          <Button
            variant="ghost" size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-7 px-2 text-xs ml-auto ${showFilters ? "text-emerald-400 bg-emerald-500/10" : "text-white/30"}`}
          >
            <Filter className="h-3 w-3 mr-1" />
            Filtrer
          </Button>
        </div>
      )}

      {/* Tag Filters */}
      {showFilters && tagStats.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/40 rounded-lg border border-white/5">
          {filterTag && (
            <button
              onClick={() => setFilterTag(null)}
              className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 mr-1"
            >
              <X className="h-3 w-3" />
              Effacer
            </button>
          )}
          {tagStats.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => setFilterTag(filterTag === tag ? null : tag)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${TAG_COLORS[tag]} ${
                filterTag === tag ? "ring-2 ring-white/30 scale-105" : "hover:brightness-125"
              }`}
            >
              {"#"}{TAG_LABELS[tag]}
              <span className="text-white/30 font-mono text-[10px]">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      {replyTo ? (
        <PostComposer
          onSubmit={handleNewPost}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          contentType={isContentMode ? (contentType || "global") : "global"}
          contentId={isContentMode ? (contentId || null) : null}
        />
      ) : (
        <PostComposer
          onSubmit={handleNewPost}
          contentType={isContentMode ? (contentType || "global") : "global"}
          contentId={isContentMode ? (contentId || null) : null}
        />
      )}

      {/* Feed */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/30 text-sm">Chargement...</p>
        </div>
      ) : roots.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-10 w-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">
            {filterTag ? "Aucun post pour ce filtre." : isContentMode ? "Aucune discussion pour ce contenu. Soyez le premier !" : "Aucun post pour le moment."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {roots.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              replies={repliesByParent[post.id] || []}
              onLike={handleLike}
              onReport={handleReport}
              onReply={setReplyTo}
              likedPosts={likedPosts}
              reportedPosts={reportedPosts}
            />
          ))}
        </div>
      )}

      {/* V1 notice */}
      {!VISUAL_SOCIAL_ENABLE_VISUPOINTS_V1 && !isContentMode && (
        <div className="text-center py-3 text-white/15 text-xs">
          {"V1 — Les VIXUpoints VIXUAL Social sont temporairement désactivés"}
        </div>
      )}
    </div>
  )
}
