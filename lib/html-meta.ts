import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

export interface HtmlDocMeta {
  slug: string
  filename: string
  title: string
  description: string
  tags: string[]
}

export interface GroupedHtmlDocs {
  folder: string
  folderTitle: string
  docs: HtmlDocMeta[]
}

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

export function scanHtmlDir(dir: string): HtmlDocMeta[] {
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
    let tags: string[] = []

    try {
      const html = readFileSync(join(dir, filename), 'utf-8')
      const t = extractTag(html, /<title[^>]*>([^<]+)<\/title>/i)
      if (t) title = t
      const d = extractTag(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
        ?? extractTag(html, /<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i)
      if (d) description = d
      const k = extractTag(html, /<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i)
        ?? extractTag(html, /<meta\s+content=["']([^"']+)["']\s+name=["']keywords["']/i)
      if (k) tags = k.split(',').map(t => t.trim()).filter(Boolean)
    } catch {}

    return { slug, filename, title, description, tags }
  })
}

/** Recursively collect all HTML docs under a directory, preserving relative paths as slugs. */
function scanHtmlDirRecursive(base: string, rel: string = ''): HtmlDocMeta[] {
  const fullDir = rel ? join(base, rel) : base
  let entries: string[]
  try {
    entries = readdirSync(fullDir).sort()
  } catch {
    return []
  }

  const docs: HtmlDocMeta[] = []
  for (const entry of entries) {
    const fullPath = join(fullDir, entry)
    try {
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        docs.push(...scanHtmlDirRecursive(base, rel ? `${rel}/${entry}` : entry))
      } else if (entry.endsWith('.html')) {
        const slug = rel ? `${rel}/${entry.replace('.html', '')}` : entry.replace('.html', '')
        let title = titleCase(entry.replace('.html', ''))
        let description = ''
        let tags: string[] = []
        try {
          const html = readFileSync(fullPath, 'utf-8')
          const t = extractTag(html, /<title[^>]*>([^<]+)<\/title>/i)
          if (t) title = t
          const d = extractTag(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
            ?? extractTag(html, /<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i)
          if (d) description = d
          const k = extractTag(html, /<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i)
            ?? extractTag(html, /<meta\s+content=["']([^"']+)["']\s+name=["']keywords["']/i)
          if (k) tags = k.split(',').map(t => t.trim()).filter(Boolean)
        } catch {}
        docs.push({ slug, filename: entry, title, description, tags })
      }
    } catch {
      continue
    }
  }
  return docs
}

/** Scan subdirectories of `dir`, returning docs grouped by top-level folder name, sorted alphabetically. Recurses into nested subdirectories. */
export function scanHtmlSubdirs(dir: string): GroupedHtmlDocs[] {
  let entries: string[]
  try {
    entries = readdirSync(dir).sort()
  } catch {
    return []
  }

  const groups: GroupedHtmlDocs[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    try {
      if (!statSync(fullPath).isDirectory()) continue
    } catch {
      continue
    }

    const docs = scanHtmlDirRecursive(dir, entry)

    if (docs.length > 0) {
      groups.push({
        folder: entry,
        folderTitle: titleCase(entry),
        docs: docs.sort((a, b) => a.title.localeCompare(b.title)),
      })
    }
  }

  return groups
}
