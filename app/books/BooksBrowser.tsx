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
  series?: { name: string; position: number }
  seriesPosition?: number
  description?: string
  keywords?: string[]
  tags?: string[]
  parts?: BookPart[]
  chapters?: Chapter[]
  coverImage?: string
  type?: 'standard' | 'intelligent' | 'live'
  customHref?: string // for hardcoded books like cancer-textbook
}

// Modern gradient fallbacks based on Guardian palette
const FALLBACK_GRADIENTS = [
  { bg: 'linear-gradient(135deg, var(--bb-2), #112A10)', text: 'var(--bb-8)' },   // deep forest gradient
  { bg: 'linear-gradient(135deg, var(--bb-3), #5E1A0F)', text: 'var(--bb-8)' },   // brick gradient
  { bg: 'linear-gradient(135deg, var(--bb-5), #3B3931)', text: 'var(--bb-8)' },   // warm taupe gradient
  { bg: 'linear-gradient(135deg, var(--bb-1), #050505)', text: 'var(--bb-8)' },   // iron black gradient
  { bg: 'linear-gradient(135deg, var(--bb-4), #9E6503)', text: 'var(--bb-1)' },   // warm ochre gradient
]

function getFallbackGradient(index: number) {
  return FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length]
}

function CoverPlaceholder({ book, index }: { book: BookMeta; index: number }) {
  const { bg, text } = getFallbackGradient(index)
  return (
    <div
      className="w-full aspect-[2/3] flex flex-col justify-between p-5 select-none relative overflow-hidden"
      style={{ background: bg }}
    >
      {/* Subtle glass overlay for a premium feel */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div
          className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70"
          style={{ color: text }}
        >
          Medhavy
          {book.seriesPosition != null && (
            <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-sm">#{book.seriesPosition}</span>
          )}
        </div>
        <div>
          {book.authors && book.authors.length > 0 && (
            <p
              className="text-xs font-medium mb-3 opacity-80"
              style={{ color: text }}
            >
              {book.authors[0]}
              {book.authors.length > 1 && ` et al.`}
            </p>
          )}
          <h3
            className="text-xl font-bold leading-tight drop-shadow-md"
            style={{ color: text, fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}
          >
            {book.title}
          </h3>
        </div>
      </div>
    </div>
  )
}

function BookCard({ book, index }: { book: BookMeta; index: number }) {
  const firstChapter = book.chapters?.[0]
  const href = book.customHref 
    ? book.customHref 
    : firstChapter
      ? `/books/${book.slug}/${firstChapter.slug}`
      : `/books/${book.slug}`

  return (
    <Link href={href} className="group flex flex-col h-full">
      {/* Cover container with modern shadow & lift animation */}
      <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-300 ring-1 ring-border/50 group-hover:ring-border">
        {book.coverImage ? (
          <div className="relative w-full aspect-[2/3]">
            <Image
              src={book.coverImage}
              alt={`Cover of ${book.title}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Subtle gradient overlay to make text/badges pop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <CoverPlaceholder book={book} index={index} />
        )}

        {/* Badges */}
        {book.type === 'intelligent' && (
          <div
            className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold rounded-full shadow-md backdrop-blur-md bg-white/90 text-black border border-white/20 uppercase tracking-wider"
          >
            AI
          </div>
        )}
        {book.type === 'live' && (
          <div
            className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold rounded-full shadow-md backdrop-blur-md bg-destructive text-destructive-foreground border border-destructive/20 uppercase tracking-wider flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live
          </div>
        )}
      </div>

      {/* Meta below cover */}
      <div className="mt-4 flex-1 flex flex-col">
        {book.authors && book.authors.length > 0 && (
          <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mb-1">
            {book.authors.join(', ')}
          </p>
        )}
        <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        {book.subtitle && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{book.subtitle}</p>
        )}
        {book.status && book.status !== 'published' && (
          <div className="mt-auto pt-3">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {book.status}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default function BooksBrowser({ books }: { books: BookMeta[] }) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  // Hardcoded Live Textbook
  const liveTextbooks: BookMeta[] = [
    {
      slug: 'cancer-biology',
      title: 'Cancer Biology and Therapeutics',
      subtitle: 'An Intelligent Interactive Personalized Textbook',
      authors: ['Evin Gultepe', 'Nicholas Brown', 'Srinivas Sridhar'],
      status: 'published',
      description: 'An Intelligent Interactive Personalized Textbook and a comprehensive, research-grade resource spanning the full arc of oncology education.',
      coverImage: '/images/cancer-cover.png',
      type: 'live',
      customHref: '/cancer-textbook',
      tags: ['Oncology', 'Biology'],
    }
  ]

  // Combine fetched books with hardcoded live textbooks for filtering purposes
  const allBooks = useMemo(() => [...liveTextbooks, ...books], [books])

  // Collect all tags from books
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const book of allBooks) {
      if (book.tags) for (const t of book.tags) tagSet.add(t)
      if (book.keywords) for (const k of book.keywords) tagSet.add(k)
    }
    return Array.from(tagSet).sort()
  }, [allBooks])

  const filtered = useMemo(() => {
    let result = allBooks
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
          (b.authors && b.authors.some((a) => a.toLowerCase().includes(q))) ||
          b.description?.toLowerCase().includes(q)
      )
    }
    return result
  }, [allBooks, query, activeTag])

  // Split books into categories
  const live = filtered.filter((b) => b.type === 'live')
  const intelligent = filtered.filter((b) => b.type === 'intelligent')
  const standard = filtered.filter((b) => b.type !== 'intelligent' && b.type !== 'live')

  return (
    <div className="space-y-16">
      {/* Search + filter with modern glassmorphism */}
      <div className="sticky top-[4.5rem] z-30 -mx-4 px-4 py-4 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm transition-all">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="relative max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Medhavy Library…"
              className="w-full h-11 pl-10 pr-4 rounded-full border border-border/60 bg-background/50 hover:bg-background focus:bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mr-2">
                Topics:
              </span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
                    activeTag === tag
                      ? 'bg-foreground text-background border-foreground shadow-md scale-105'
                      : 'border-border/60 text-foreground/80 hover:border-foreground/40 hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-20 pt-4">
        {filtered.length === 0 && (
          <div className="text-center py-20 px-4 rounded-2xl border border-dashed border-border/60 bg-muted/30">
            <p className="text-muted-foreground text-lg mb-2">No books found</p>
            <p className="text-sm text-muted-foreground/70">
              Try adjusting your search "{query}" or clearing the "{activeTag}" filter.
            </p>
            <button 
              onClick={() => { setQuery(''); setActiveTag(null); }}
              className="mt-6 px-4 py-2 bg-background border border-border rounded-md text-sm font-medium hover:bg-accent transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Live Books — featured top row */}
        {live.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-700 fill-mode-both">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                </span>
                Live Textbooks
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
              {live.map((book, i) => (
                <div 
                  key={book.slug}
                  className="animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700 fill-mode-both"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <BookCard book={book} index={i} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Intelligent Books */}
        {intelligent.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-700 fill-mode-both" style={{ animationDelay: '200ms' }}>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                Intelligent Textbooks
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
              {intelligent.map((book, i) => (
                <div 
                  key={book.slug}
                  className="animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700 fill-mode-both"
                  style={{ animationDelay: `${(i + 2) * 150}ms` }}
                >
                  <BookCard book={book} index={live.length + i} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Standard books */}
        {standard.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-700 fill-mode-both" style={{ animationDelay: '400ms' }}>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                Medhavy Library
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
              {standard.map((book, i) => (
                <div 
                  key={book.slug}
                  className="animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700 fill-mode-both"
                  style={{ animationDelay: `${(i + 4) * 100}ms` }}
                >
                  <BookCard
                    book={book}
                    index={live.length + intelligent.length + i}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
