// ================================
// MEDIUM CLONE - DATABASE SCHEMA
// Run these in Supabase SQL Editor
// ================================

/*
-- 1️⃣ USERS TABLE (Enhanced)
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255),
  firstname VARCHAR(50),
  lastname VARCHAR(50),
  display_name VARCHAR(100),
  avatar TEXT DEFAULT 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
  bio TEXT,
  oauth_provider VARCHAR(20), -- 'google', 'github', 'twitter'
  oauth_id VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(oauth_provider, oauth_id)
);

-- 2️⃣ TOPICS TABLE (Categories/Tags users can follow)
CREATE TABLE IF NOT EXISTS topics (
  topic_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  followers_count INT DEFAULT 0,
  posts_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3️⃣ POSTS TABLE (Enhanced with drafts, status, reading time)
CREATE TABLE IF NOT EXISTS posts (
  post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  content TEXT NOT NULL,
  content_json JSONB, -- For structured editor content
  cover_image TEXT,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'unlisted', 'archived'
  visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'followers', 'premium'
  reading_time INT DEFAULT 1, -- minutes
  claps_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4️⃣ POST_TOPICS (Many-to-Many)
CREATE TABLE IF NOT EXISTS post_topics (
  post_id UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, topic_id)
);

-- 5️⃣ CLAPS TABLE (Medium-style, up to 50 per user per post)
CREATE TABLE IF NOT EXISTS claps (
  clap_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  count INT DEFAULT 1 CHECK (count >= 1 AND count <= 50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 6️⃣ COMMENTS TABLE (Threaded)
CREATE TABLE IF NOT EXISTS comments (
  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(comment_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  claps_count INT DEFAULT 0,
  is_highlighted BOOLEAN DEFAULT FALSE,
  highlight_start INT, -- For inline comments
  highlight_end INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7️⃣ FOLLOWERS TABLE (User follows User)
CREATE TABLE IF NOT EXISTS followers (
  follower_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- 8️⃣ TOPIC_FOLLOWERS (User follows Topic)
CREATE TABLE IF NOT EXISTS topic_followers (
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);

-- 9️⃣ BOOKMARKS (Save posts for later)
CREATE TABLE IF NOT EXISTS bookmarks (
  bookmark_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 🔟 READING_HISTORY (Track what users read)
CREATE TABLE IF NOT EXISTS reading_history (
  history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
  read_percentage INT DEFAULT 0,
  time_spent INT DEFAULT 0, -- seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 1️⃣1️⃣ NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- 'follow', 'clap', 'comment', 'reply', 'publish'
  post_id UUID REFERENCES posts(post_id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(comment_id) ON DELETE CASCADE,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1️⃣2️⃣ LISTS (Reading lists like Medium)
CREATE TABLE IF NOT EXISTS lists (
  list_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1️⃣3️⃣ LIST_POSTS
CREATE TABLE IF NOT EXISTS list_posts (
  list_id UUID NOT NULL REFERENCES lists(list_id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (list_id, post_id)
);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_claps_post ON claps(post_id);
CREATE INDEX IF NOT EXISTS idx_followers_following ON followers(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING gin(to_tsvector('english', title || ' ' || content));
*/

export const SCHEMA_VERSION = '2.0.0';
