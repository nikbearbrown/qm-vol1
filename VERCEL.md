# Vercel Setup Guide — medhavy.com

This document covers everything you need to configure on the Vercel side to get this site fully operational. Follow the steps in order.

---

## 1. Connect the GitHub repo

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the GitHub repo: `nikbearbrown/medhavy_com`
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: `.` (default)
5. Build command: `next build` (default)
6. Output directory: `.next` (default)
7. Click **Deploy** — the first deploy will likely fail until environment variables are set (that's fine)

---

## 2. Add the Neon database (PostgreSQL)

### Option A — Via Vercel Marketplace (recommended)

1. In your Vercel project → **Storage** tab → **Create Database**
2. Choose **Neon** → click **Continue**
3. Select region closest to your users (e.g., `us-east-1`)
4. Vercel automatically sets `DATABASE_URL` in your project environment variables

### Option B — Bring your own Neon project

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string from **Dashboard → Connection Details**
3. Add it manually as `DATABASE_URL` in Vercel (see Environment Variables section below)

### Run the database migrations

After the database is connected, open the **Neon SQL Editor** (either via Vercel Storage tab → Open in Neon, or directly at neon.tech) and run the following SQL. All statements are safe to re-run.

```sql
-- Substack sections and articles
CREATE TABLE IF NOT EXISTS substack_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  substack_url TEXT NOT NULL,
  article_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS substack_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES substack_sections(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  excerpt TEXT,
  content TEXT,
  original_url TEXT,
  published_at TIMESTAMPTZ,
  display_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, slug)
);

ALTER TABLE substack_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE substack_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_sections" ON substack_sections FOR SELECT USING (true);
CREATE POLICY "public_read_articles" ON substack_articles FOR SELECT USING (true);
CREATE POLICY "service_role_sections" ON substack_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_articles" ON substack_articles FOR ALL USING (true) WITH CHECK (true);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT NOT NULL UNIQUE,
  byline TEXT,
  cover_image TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_published_posts" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "service_role_blog" ON blog_posts FOR ALL USING (true) WITH CHECK (true);

-- Blog post column migrations (safe if columns already exist)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS byline TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Tools
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  tool_type TEXT DEFAULT 'link',
  claude_url TEXT,
  chatgpt_url TEXT,
  artifact_id TEXT,
  artifact_embed_code TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_tools" ON tools FOR SELECT USING (true);
CREATE POLICY "service_role_tools" ON tools FOR ALL USING (true) WITH CHECK (true);

-- Videos (optional, for future use)
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_id TEXT NOT NULL UNIQUE,
  tags TEXT[] DEFAULT '{}',
  pinned BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_videos" ON videos FOR SELECT USING (published = true);
CREATE POLICY "service_role_videos" ON videos FOR ALL USING (true) WITH CHECK (true);
```

---

## 3. Add Vercel Blob (image uploads)

1. In your Vercel project → **Storage** tab → **Create Database**
2. Choose **Blob** → click **Continue**
3. Name it anything (e.g., `medhavy-blob`)
4. Vercel automatically sets `BLOB_READ_WRITE_TOKEN` in your project environment variables

This powers cover image uploads in the blog editor and any other image upload features.

---

## 4. Set environment variables

Go to your Vercel project → **Settings** → **Environment Variables**. Add the following:

| Variable | Value | Required |
|---|---|---|
| `DATABASE_URL` | Neon connection string (set automatically if using Vercel Marketplace) | Yes |
| `ADMIN_PASSWORD` | Strong password for `/admin/login` — pick something secure | Yes |
| `NEXT_PUBLIC_SITE_URL` | `https://medhavy.com` | Yes |
| `BLOB_READ_WRITE_TOKEN` | Set automatically when Blob store is created | Yes |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID, e.g. `G-XXXXXXXXXX` | Optional |
| `NEXT_PUBLIC_ANTHROPIC_API_KEY` | Only needed if embedding AI assistant directly | Optional |

Set all variables for **Production**, **Preview**, and **Development** environments unless noted otherwise. `ADMIN_PASSWORD` should be Production-only or use different values per environment.

---

## 5. Configure the custom domain

1. In your Vercel project → **Settings** → **Domains**
2. Add `medhavy.com` and `www.medhavy.com`
3. Vercel will show you DNS records to add at your domain registrar:
   - **A record**: `@` → Vercel's IP (shown in dashboard)
   - **CNAME record**: `www` → `cname.vercel-dns.com`
4. Once DNS propagates (up to 48 hours, usually faster), Vercel provisions an SSL certificate automatically

---

## 6. Redeploy after setup

After setting all environment variables:

1. Go to your Vercel project → **Deployments**
2. Find the most recent deployment → click the three-dot menu → **Redeploy**
3. Or just push a commit to `main` — Vercel auto-deploys on every push

---

## 7. Verify the setup

After deployment, check these URLs:

| URL | What to verify |
|---|---|
| `https://medhavy.com` | Home page loads |
| `https://medhavy.com/blog` | Blog feed loads (empty is fine) |
| `https://medhavy.com/tools` | Tools page loads |
| `https://medhavy.com/substack` | Substack hub loads (empty is fine) |
| `https://medhavy.com/admin/login` | Admin login form appears |
| `https://medhavy.com/sitemap.xml` | Sitemap renders with routes |
| `https://medhavy.com/robots.txt` | Robots file renders |

Log in at `/admin/login` with your `ADMIN_PASSWORD` and confirm the dashboard loads.

---

## 8. Post-setup: add initial tools

Once the admin dashboard is working, add these two tools via `/admin/dashboard/tools`:

1. **Subby** — Substack writing assistant
   - Tool type: `artifact`
   - Artifact ID: `6dc0c6cf-32e0-4f53-94b9-f6d01cc4df9c`

2. **CRITIQ** — Peer review & paper development protocol
   - Tool type: `artifact`
   - Artifact ID: `a53d969f-5aaf-45f6-9992-2c6a00a4122f`

---

## Auto-deploy workflow

Every push to `main` on GitHub triggers a Vercel production deployment automatically. No manual action needed after initial setup. Preview deployments are created for all other branches and pull requests.
