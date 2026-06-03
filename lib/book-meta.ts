import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

// ─── Existing types (unchanged) ─────────────────────────────────────────────

export interface ChapterFile {
  slug: string
  filename: string
  title: string
  description: string
}

export interface BookPart {
  title: string
  chapters: string[]
}

export interface BookSeries {
  name: string
  position: number
}

// ─── New types for intelligent books ────────────────────────────────────────

export interface BookChapter {
  slug: string
  title: string
  filename: string
}

export interface BookPartExtended {
  number: number
  title: string
  chapterRange?: string
  chapters?: BookChapter[]
}

export interface BookAudience {
  icon: string
  title: string
  description: string
}

export interface BookFeaturedPreview {
  label?: string
  chapterRef: string
  title: string
  excerpt: string
}

export interface BookThematicSection {
  number: number
  title: string
  chapterRange: string
}

export interface BookStats {
  chapters?: number
  appendices?: number
  topics?: number
}

// ─── Extended BookMeta ──────────────────────────────────────────────────────

export interface BookMeta {
  // Existing fields (all preserved)
  slug: string
  title: string
  subtitle: string
  authors: string[]
  publisher: string
  language: string
  isbn: string
  asin: string
  published: string
  status: string
  edition: string
  series: BookSeries
  description: string
  keywords: string[]
  categories: string[]
  cover: string
  amazonUrl: string
  relatedCourse: string
  license: string
  parts: BookPart[]
  chapterFiles: ChapterFile[]

  // New fields (all optional — never break existing books)
  type?: 'standard' | 'intelligent'
  tags?: string[]
  coverImage?: string
  seriesPosition?: number
  stats?: BookStats
  youtubeId?: string
  thematicStructure?: BookThematicSection[]
  audiences?: BookAudience[]
  featuredPreview?: BookFeaturedPreview
  /** Extended parts with nested chapter objects (from book.json) */
  partsExtended?: BookPartExtended[]
  /** Flat chapter list for new components (derived from partsExtended or chapterFiles) */
  chapters?: BookChapter[]
}

// ─── Helpers (unchanged) ────────────────────────────────────────────────────

function extractTag(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern)
  return match ? match[1].trim() : null
}

function titleCase(slug: string): string {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function scanChapterFiles(dir: string): ChapterFile[] {
  let files: string[]
  try {
    files = readdirSync(dir).filter(f => f.endsWith('.html')).sort()
  } catch {
    return []
  }

  return files.map(filename => {
    const slug = filename.replace('.html', '')
    let title = titleCase(slug)
    let description = ''

    try {
      const html = readFileSync(join(dir, filename), 'utf-8')
      const t = extractTag(html, /<title[^>]*>([^<]+)<\/title>/i)
      if (t) title = t
      const d = extractTag(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
        ?? extractTag(html, /<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i)
      if (d) description = d
    } catch { /* ignore read errors */ }

    return { slug, filename, title, description }
  })
}

// ─── scanBooks (extended) ───────────────────────────────────────────────────

export function scanBooks(dir: string): BookMeta[] {
  let entries: string[]
  try {
    entries = readdirSync(dir).sort()
  } catch {
    return []
  }

  const books: BookMeta[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    try {
      if (!statSync(fullPath).isDirectory()) continue
    } catch {
      continue
    }

    const jsonPath = join(fullPath, 'book.json')
    let raw: Record<string, unknown>
    try {
      raw = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    } catch {
      continue // skip folders without valid book.json
    }

    const chapterFiles = scanChapterFiles(fullPath)

    // ── Parse existing fields ──────────────────────────────────────────
    const seriesObj = (raw.series as BookSeries) || { name: '', position: 0 }

    // ── Parse new optional fields (never throw) ────────────────────────
    const bookType = (raw.type as string) === 'intelligent' ? 'intelligent' as const
      : (raw.type as string) === 'standard' ? 'standard' as const
      : undefined

    const tags = Array.isArray(raw.tags) ? (raw.tags as string[]) : undefined
    const youtubeId = typeof raw.youtubeId === 'string' ? raw.youtubeId : undefined

    // coverImage: resolve relative path to public URL
    let coverImage: string | undefined
    if (typeof raw.coverImage === 'string' && raw.coverImage) {
      // If already an absolute path (starts with /), use as-is
      // Otherwise resolve to /books/[slug]/[filename]
      coverImage = raw.coverImage.startsWith('/')
        ? raw.coverImage
        : `/books/${entry}/${raw.coverImage}`
    }

    // stats
    const rawStats = raw.stats as Record<string, unknown> | undefined
    const stats: BookStats | undefined = rawStats ? {
      chapters: typeof rawStats.chapters === 'number' ? rawStats.chapters : undefined,
      appendices: typeof rawStats.appendices === 'number' ? rawStats.appendices : undefined,
      topics: typeof rawStats.topics === 'number' ? rawStats.topics : undefined,
    } : undefined

    // thematicStructure
    const thematicStructure = Array.isArray(raw.thematicStructure)
      ? (raw.thematicStructure as BookThematicSection[])
      : undefined

    // audiences
    const audiences = Array.isArray(raw.audiences)
      ? (raw.audiences as BookAudience[])
      : undefined

    // featuredPreview
    const rawPreview = raw.featuredPreview as Record<string, unknown> | undefined
    const featuredPreview: BookFeaturedPreview | undefined = rawPreview ? {
      label: typeof rawPreview.label === 'string' ? rawPreview.label : undefined,
      chapterRef: (rawPreview.chapterRef as string) || '',
      title: (rawPreview.title as string) || '',
      excerpt: (rawPreview.excerpt as string) || '',
    } : undefined

    // partsExtended — parse parts with nested chapter objects from book.json
    const rawParts = raw.parts as Array<Record<string, unknown>> | undefined
    let partsExtended: BookPartExtended[] | undefined
    if (Array.isArray(rawParts) && rawParts.length > 0 && rawParts[0].number != null) {
      // New-style parts with number, title, chapterRange, chapters[]
      partsExtended = rawParts.map(p => ({
        number: (p.number as number) || 0,
        title: (p.title as string) || '',
        chapterRange: typeof p.chapterRange === 'string' ? p.chapterRange : undefined,
        chapters: Array.isArray(p.chapters)
          ? (p.chapters as BookChapter[])
          : undefined,
      }))
    }

    // Flat chapters list: prefer partsExtended chapters, fall back to chapterFiles
    let chapters: BookChapter[] | undefined
    if (partsExtended) {
      chapters = partsExtended.flatMap(p => p.chapters ?? [])
    }
    if (!chapters || chapters.length === 0) {
      // Derive from scanned chapter files
      if (chapterFiles.length > 0) {
        chapters = chapterFiles.map(cf => ({
          slug: cf.slug,
          title: cf.title,
          filename: cf.filename,
        }))
      }
    }

    books.push({
      // Existing fields
      slug: entry,
      title: (raw.title as string) || titleCase(entry),
      subtitle: (raw.subtitle as string) || '',
      authors: (raw.authors as string[]) || [],
      publisher: (raw.publisher as string) || '',
      language: (raw.language as string) || 'en',
      isbn: (raw.isbn as string) || '',
      asin: (raw.asin as string) || '',
      published: (raw.published as string) || '',
      status: (raw.status as string) || 'in-progress',
      edition: (raw.edition as string) || '',
      series: seriesObj,
      description: (raw.description as string) || '',
      keywords: (raw.keywords as string[]) || [],
      categories: (raw.categories as string[]) || [],
      cover: (raw.cover as string) || '',
      amazonUrl: (raw.amazonUrl as string) || '',
      relatedCourse: (raw.relatedCourse as string) || '',
      license: (raw.license as string) || '',
      parts: (raw.parts as BookPart[]) || [],
      chapterFiles,

      // New fields
      type: bookType,
      tags,
      coverImage,
      seriesPosition: seriesObj.position || undefined,
      stats,
      youtubeId,
      thematicStructure,
      audiences,
      featuredPreview,
      partsExtended,
      chapters,
    })
  }

  // Sort by series position
  books.sort((a, b) => (a.series.position || 0) - (b.series.position || 0))

  return books
}
