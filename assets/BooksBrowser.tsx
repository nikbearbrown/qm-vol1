'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface BookPart {
  number: number
  title: string
  chapterRange?: string
}

interface Chapter {
  slug: string
  title: string
  filename: string
}

export interface BookMeta {
  slug: string
  title: string
  subtitle?: string
  authors: string[]
  status?: string
  series?: string
  seriesPosition?: number
  description?: string
  keywords?: string[]
  tags?: string[]
  parts?: BookPart[]
  chapters?: Chapter[]
  coverImage?: string
  type?: 'standard' | 'intelligent'
}

// Palette-safe fallback colors using bb variables for books without covers
const FALLBACK_COLORS = [
  { bg: 'var(--bb-2)', text: 'var(--bb-8)' },   // deep forest
  { bg: 'var(--bb-3)', text: 'var(--bb-8)' },   // brick
  { bg: 'var(--bb-5)', text: 'var(--bb-8)' },   // warm taupe
  { bg: 'var(--bb-1)', text: 'var(--bb-8)' },   // iron black
  { bg: 'var(--bb-4)', text: 'var(--bb-1)' },   // warm ochre (dark text — 5.8:1 on ochre)
]

function getFallbackColor(index: number) {
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

function CoverPlaceholder({
  book,
  index,
}: {
  book: BookMeta
  index: number
}) {
  const { bg, text } = getFallbackColor(index)
  return (
    <div
      className="w-full aspect-[2/3] flex flex-col justify-between p-4 select-none"
      style={{ backgroundColor: bg }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-widest opacity-60"
        style={{ color: text }}
      >
        Medhavy
        {book.seriesPosition != null && (
          <span className="ml-2">#{book.seriesPosition}</span>
        )}
      </div>
      <div>
        {book.authors[0] && (
          <p
            className="text-xs font-medium mb-2 opacity-80"
            style={{ color: text }}
          >
            {book.authors[0]}
            {book.authors.length > 1 && ` et al.`}
          </p>
        )}
        <h3
          className="text-lg font-bold leading-tight"
          style={{ color: text, fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}
        >
          {book.title}
        </h3>
      </div>
    </div>
  )
}

function BookCard({ book, index }: { book: BookMeta; index: number }) {
  const firstChapter = book.chapters?.[0]
  const href = firstChapter
    ? `/books/${book.slug}/${firstChapter.slug}`
    : `/books/${book.slug}`

  return (
    <Link href={href} className="group block">
      {/* Cover */}
      <div className="relative overflow-hidden rounded-sm shadow-md group-hover:shadow-xl transition-shadow duration-300">
        {book.coverImage ? (
          <div className="relative w-full aspect-[2/3]">
            <Image
              src={book.coverImage}
              alt={`Cover of ${book.title}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        ) : (
          <CoverPlaceholder book={book} index={index} />
        )}

        {/* Intelligent badge */}
        {book.type === 'intelligent' && (
          <div
            className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-semibold rounded-full"
            style={{ backgroundColor: 'var(--bb-4)', color: 'var(--bb-1)' }}
          >
            AI
          </div>
        )}

        {/* Series number badge */}
        {book.seriesPosition != null && (
          <div
            className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: 'var(--bb-1)', color: 'var(--bb-8)' }}
          >
            {book.seriesPosition}
          </div>
        )}
      </div>

      {/* Meta below cover */}
      <div className="mt-3 space-y-0.5">
        {book.authors.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {book.authors.join(', ')}
          </p>
        )}
        <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        {book.subtitle && (
          <p className="text-xs text-muted-foreground line-clamp-1">{book.subtitle}</p>
        )}
        {book.status && book.status !== 'published' && (
          <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border border-border rounded px-1.5 py-0.5">
            {book.status}
          </span>
        )}
      </div>
    </Link>
  )
}

export default function BooksBrowser({ books }: { books: BookMeta[] }) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  // Collect all tags from books
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const book of books) {
      if (book.tags) for (const t of book.tags) tagSet.add(t)
      if (book.keywords) for (const k of book.keywords) tagSet.add(k)
    }
    return Array.from(tagSet).sort()
  }, [books])

  const filtered = useMemo(() => {
    let result = books
    if (activeTag) {
      result = result.filter(
        (b) => b.tags?.includes(activeTag) || b.keywords?.includes(activeTag)
      )
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.subtitle?.toLowerCase().includes(q) ||
          b.authors.some((a) => a.toLowerCase().includes(q)) ||
          b.description?.toLowerCase().includes(q)
      )
    }
    return result
  }, [books, query, activeTag])

  // Split intelligent books to feature them first
  const intelligent = filtered.filter((b) => b.type === 'intelligent')
  const standard = filtered.filter((b) => b.type !== 'intelligent')

  return (
    <div className="space-y-10">
      {/* Search + filter */}
      <div className="space-y-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books…"
          className="w-full max-w-md h-10 px-4 rounded-md border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        />

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mr-1">
              Filter by topic:
            </span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  activeTag === tag
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-foreground hover:border-foreground'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No books match{activeTag ? ` "${activeTag}"` : ''}{query ? ` "${query}"` : ''}.
        </p>
      )}

      {/* Intelligent books — featured row */}
      {intelligent.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Intelligent Textbooks
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {intelligent.map((book, i) => (
              <BookCard key={book.slug} book={book} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Standard books */}
      {standard.length > 0 && (
        <section className="space-y-6">
          {intelligent.length > 0 && (
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                All Books
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {standard.map((book, i) => (
              <BookCard
                key={book.slug}
                book={book}
                index={intelligent.length + i}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
