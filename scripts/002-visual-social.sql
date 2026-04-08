-- ─────────────────────────────────────────────
-- VISUAL SOCIAL (Mode B tags) — V1
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS social_posts (
  id BIGSERIAL PRIMARY KEY,

  content_type TEXT NOT NULL CHECK (content_type IN ('video','podcast','text')),
  content_id TEXT NOT NULL,

  author_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_role TEXT NOT NULL,

  parent_id BIGINT REFERENCES social_posts(id) ON DELETE CASCADE,
  depth SMALLINT NOT NULL DEFAULT 0 CHECK (depth IN (0,1)),

  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),

  status TEXT NOT NULL DEFAULT 'visible'
    CHECK (status IN ('visible','hidden','pending','deleted')),
  moderation_reason TEXT,

  like_count INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  report_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_posts_content
  ON social_posts (content_type, content_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_social_posts_parent
  ON social_posts (parent_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_social_posts_author
  ON social_posts (author_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_social_posts_status
  ON social_posts (status, created_at DESC);


CREATE TABLE IF NOT EXISTS social_tags (
  id BIGSERIAL PRIMARY KEY,
  tag TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_tags_tag
  ON social_tags (tag);


CREATE TABLE IF NOT EXISTS social_post_tags (
  post_id BIGINT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES social_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_social_post_tags_tag
  ON social_post_tags (tag_id, post_id);


CREATE TABLE IF NOT EXISTS social_reactions (
  post_id BIGINT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id, reaction)
);

CREATE INDEX IF NOT EXISTS idx_social_reactions_post
  ON social_reactions (post_id, created_at DESC);


CREATE TABLE IF NOT EXISTS social_reports (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_social_reports_post
  ON social_reports (post_id, created_at DESC);


-- Anti-spam simple (sans Redis)
CREATE TABLE IF NOT EXISTS social_rate_limits (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('post','reply','report','like')),
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, action, window_start)
);

CREATE INDEX IF NOT EXISTS idx_social_rate_limits_user
  ON social_rate_limits (user_id, action, window_start DESC);

-- Seed official tags V1
INSERT INTO social_tags(tag) VALUES
  ('avis'),('question'),('amelioration'),('bug'),('idee'),
  ('casting'),('scenario'),('son'),('montage'),('investissement'),('spoiler')
ON CONFLICT(tag) DO NOTHING;
