/**
 * IntelligentBookLanding.tsx
 *
 * Template for an "Intelligent Textbook" landing page.
 * Drop this into app/books/[slug]/ and call it from page.tsx when book.type === 'intelligent'.
 *
 * Usage in app/books/[slug]/page.tsx:
 *   if (book.type === 'intelligent') return <IntelligentBookLanding book={book} />
 *
 * book.json fields used by this template:
 *   title, subtitle, description, authors
 *   stats: { chapters, appendices, topics }
 *   youtubeId: string
 *   thematicStructure: { number, title, chapterRange }[]
 *   audiences: { icon, title, description }[]
 *   featuredPreview: { label, chapterRef, title, excerpt }
 *   parts: { number, title, chapterRange }[]
 *   chapters: { slug, title, filename }[]
 *   coverImage: string
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookChapter {
  slug: string
  title: string
  filename: string
}

interface BookPart {
  number: number
  title: string
  chapterRange?: string
  chapters?: BookChapter[]
}

interface BookAudience {
  icon: string         // emoji or short label
  title: string
  description: string
}

interface BookFeaturedPreview {
  label?: string       // e.g. "Featured Preview"
  chapterRef: string   // e.g. "Chapter 2, Section 3"
  title: string
  excerpt: string
}

interface BookThematicSection {
  number: number
  title: string
  chapterRange: string  // e.g. "Ch. 1–9"
}

export interface IntelligentBookMeta {
  slug: string
  title: string
  subtitle?: string
  description?: string
  authors: string[]
  coverImage?: string
  stats?: {
    chapters?: number
    appendices?: number
    topics?: number
  }
  youtubeId?: string
  thematicStructure?: BookThematicSection[]
  audiences?: BookAudience[]
  featuredPreview?: BookFeaturedPreview
  parts?: BookPart[]
  chapters?: BookChapter[]
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
      <span
        className="inline-block w-4 h-px"
        style={{ backgroundColor: 'var(--bb-4)' }}
        aria-hidden="true"
      />
      {children}
    </p>
  )
}

function StatPill({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <span className="font-semibold text-foreground">{value}</span>
      <span>{label}</span>
    </div>
  )
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function HeroSection({ book }: { book: IntelligentBookMeta }) {
  const firstChapterHref = book.chapters?.[0]
    ? `/books/${book.slug}/${book.chapters[0].slug}`
    : '#'

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div className="space-y-6">
            <div>
              <span
                className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border mb-6"
                style={{ borderColor: 'var(--bb-7)', color: 'var(--bb-5)' }}
              >
                Medhavy Presents
              </span>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05]"
                style={{ color: 'var(--bb-2)' }}
              >
                {book.title}
              </h1>

              {book.subtitle && (
                <p className="mt-3 text-lg text-muted-foreground font-medium">
                  {book.subtitle}
                </p>
              )}
            </div>

            {book.description && (
              <p className="text-base text-muted-foreground leading-relaxed max-w-prose">
                {book.description}
              </p>
            )}

            {/* Authors */}
            {book.authors.length > 0 && (
              <div
                className="border-l-2 pl-4"
                style={{ borderColor: 'var(--bb-7)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                  Authors
                </p>
                <p className="text-sm text-foreground">
                  {book.authors.join(', ')}
                </p>
              </div>
            )}

            {/* Stats */}
            {book.stats && (
              <div className="flex flex-wrap gap-4">
                {book.stats.chapters != null && (
                  <StatPill value={book.stats.chapters} label="Chapters" />
                )}
                {book.stats.appendices != null && (
                  <StatPill value={book.stats.appendices} label="Appendices" />
                )}
                {book.stats.topics != null && (
                  <StatPill value={`${book.stats.topics}+`} label="Topics" />
                )}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={firstChapterHref}
                className="inline-flex h-11 items-center justify-center rounded-md px-7 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                style={{ backgroundColor: 'var(--bb-2)', color: 'var(--bb-8)' }}
              >
                Explore the Textbook
              </Link>
              <a
                href="#contents"
                className="inline-flex h-11 items-center justify-center rounded-md border px-7 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                style={{ borderColor: 'var(--bb-1)', color: 'var(--bb-1)' }}
              >
                View Contents
              </a>
            </div>
          </div>

          {/* Right: cover */}
          <div className="flex justify-center md:justify-end">
            {book.coverImage ? (
              <div className="relative w-72 aspect-[2/3] rounded shadow-2xl overflow-hidden">
                <Image
                  src={book.coverImage}
                  alt={`Cover of ${book.title}`}
                  fill
                  sizes="288px"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div
                className="w-72 aspect-[2/3] rounded shadow-2xl flex flex-col justify-between p-8"
                style={{ backgroundColor: 'var(--bb-2)' }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-widest opacity-60"
                  style={{ color: 'var(--bb-8)' }}
                >
                  Medhavy
                </p>
                <div>
                  <p
                    className="text-sm font-medium opacity-80 mb-3"
                    style={{ color: 'var(--bb-8)' }}
                  >
                    {book.authors[0]}
                  </p>
                  <h2
                    className="text-2xl font-bold leading-tight"
                    style={{
                      color: 'var(--bb-8)',
                      fontFamily: 'Georgia, serif',
                    }}
                  >
                    {book.title}
                  </h2>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

const DEFAULT_FEATURES = [
  {
    icon: '⌕',
    title: 'Ask anything, instantly',
    description:
      'No more hunting through indexes or searching around the topic. Get immediate answers drawn directly from the text.',
  },
  {
    icon: '✓',
    title: 'Authoritative resources',
    description:
      'Precise answers drawn from expert-vetted content, ensuring high accuracy and trust.',
  },
  {
    icon: '⚡',
    title: 'Study smarter',
    description:
      'Whether you\u2019re previewing a chapter or reviewing before an exam, the AI adapts to where you are.',
  },
  {
    icon: '\u25FB',
    title: 'Built for depth',
    description:
      'Ideal for complex subjects where understanding why matters as much as what.',
  },
]

function FeaturesSection({ book }: { book: IntelligentBookMeta }) {
  return (
    <section className="py-20 bg-muted">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-4">
            A textbook you can talk to.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Traditional textbooks give you the information &mdash; Medhavy textbooks help you
            understand it. Every title comes with a built-in AI study companion that has
            read the entire book, so you can ask questions in plain language and get
            precise, contextual answers drawn directly from the text.
          </p>
          <blockquote
            className="mt-8 border-l-2 pl-5 text-left italic text-foreground"
            style={{ borderColor: 'var(--bb-5)' }}
          >
            &ldquo;Like having an expert explain every page, just to you.&rdquo;
          </blockquote>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {DEFAULT_FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-border bg-background p-6 space-y-3"
            >
              <span
                className="text-2xl"
                aria-hidden="true"
                style={{ color: 'var(--bb-5)' }}
              >
                {f.icon}
              </span>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function VideoSection({ youtubeId }: { youtubeId: string }) {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 md:px-6 mx-auto max-w-3xl text-center">
        <SectionLabel>Video Tutorial</SectionLabel>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-4">
          See the Textbook in Action
        </h2>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Watch how this intelligent textbook delivers an interactive, AI-powered
          learning experience &mdash; from chapter navigation to the built-in study companion.
        </p>

        <div className="relative rounded-lg overflow-hidden shadow-xl border border-border">
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="Textbook tutorial"
              width="100%"
              height="100%"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function ThematicStructureSection({ book }: { book: IntelligentBookMeta }) {
  const parts = book.thematicStructure ?? []
  const preview = book.featuredPreview

  return (
    <section className="py-20 bg-muted">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: structure list */}
          <div>
            <h2 className="text-3xl font-bold tracking-tighter text-foreground mb-3">
              Thematic Structure
            </h2>
            {book.subtitle && (
              <p className="text-muted-foreground mb-8 leading-relaxed">
                A carefully organized journey through the complexities of {book.title.toLowerCase()}.
              </p>
            )}
            <ol className="space-y-3">
              {parts.map((part) => (
                <li key={part.number} className="flex items-start gap-4">
                  <span
                    className="flex-none w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-background"
                    style={{ backgroundColor: 'var(--bb-1)' }}
                  >
                    {part.number}
                  </span>
                  <span className="text-foreground font-medium pt-0.5">
                    {part.title}
                    {part.chapterRange && (
                      <span className="text-muted-foreground font-normal">
                        {' '}&mdash; {part.chapterRange}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Right: featured preview */}
          {preview && (
            <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
              <span
                className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border mb-4"
                style={{ borderColor: 'var(--bb-7)', color: 'var(--bb-5)' }}
              >
                {preview.label ?? 'Featured Preview'}
              </span>
              <h3 className="font-bold text-lg text-foreground mb-1">
                {preview.chapterRef}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{preview.title}</p>
              <hr className="border-border mb-4" />
              <p className="text-sm text-foreground leading-relaxed mb-2">
                {preview.excerpt.slice(0, 280)}
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--bb-6)' }}
              >
                {preview.excerpt.slice(280, 420)}&hellip;
              </p>
              <button
                className="mt-4 text-xs font-semibold border rounded-full px-4 py-1.5 transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                style={{ borderColor: 'var(--bb-1)', color: 'var(--bb-1)' }}
                onClick={() => document.getElementById('contents')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Read more in the full edition
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

const DEFAULT_AUDIENCES: BookAudience[] = [
  {
    icon: '🎓',
    title: 'Students',
    description:
      'Master complex material with interactive, personalized study sessions that adapt to your pace.',
  },
  {
    icon: '🔬',
    title: 'Researchers',
    description:
      'Quickly dive into deep mechanisms and access expert-vetted literature easily.',
  },
  {
    icon: '👩\u200D🏫',
    title: 'Educators',
    description: 'Enhance your curriculum with a dynamic, research-grade resource.',
  },
  {
    icon: '📋',
    title: 'Lecturers',
    description:
      "Leverage AI companions to help your students understand 'why' as well as 'what'.",
  },
]

function AudienceSection({ audiences }: { audiences?: BookAudience[] }) {
  const list = audiences ?? DEFAULT_AUDIENCES
  return (
    <section
      className="py-20"
      style={{ backgroundColor: 'var(--bb-1)' }}
    >
      <div className="container px-4 md:px-6 mx-auto text-center">
        <h2
          className="text-3xl md:text-4xl font-bold tracking-tighter mb-4"
          style={{ color: 'var(--bb-8)' }}
        >
          Who this book is for
        </h2>
        <p
          className="text-base mb-12 max-w-xl mx-auto"
          style={{ color: 'var(--bb-6)' }}
        >
          Designed for a wide audience, adapting its depth to your needs.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {list.map((a) => (
            <div
              key={a.title}
              className="rounded-lg p-6 text-left space-y-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <span
                className="inline-flex w-10 h-10 items-center justify-center rounded-lg text-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
                aria-hidden="true"
              >
                {a.icon}
              </span>
              <h3
                className="font-semibold"
                style={{ color: 'var(--bb-8)' }}
              >
                {a.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--bb-6)' }}
              >
                {a.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TableOfContentsSection({ book }: { book: IntelligentBookMeta }) {
  const parts = book.parts ?? []
  const flatChapters = book.chapters ?? []

  // If parts contain their own chapter lists, use them; else use flat list
  const hasParts = parts.length > 0

  return (
    <section id="contents" className="py-20 bg-background">
      <div className="container px-4 md:px-6 mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-3">
            Full Table of Contents
          </h2>
          {book.stats && (
            <p className="text-muted-foreground">
              A comprehensive breakdown of all{' '}
              {book.stats.chapters && `${book.stats.chapters} chapters`}
              {book.stats.appendices && ` and ${book.stats.appendices} appendices`}.
            </p>
          )}
        </div>

        {hasParts ? (
          <div className="space-y-10">
            {parts.map((part) => (
              <div key={part.number}>
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.15em]"
                    style={{ color: 'var(--bb-5)' }}
                  >
                    Part {part.number} &middot; {part.chapterRange}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-5">
                  {part.title}
                </h3>
                {part.chapters && (
                  <div className="space-y-2">
                    {part.chapters.map((ch, i) => (
                      <ChapterRow
                        key={ch.slug}
                        chapter={ch}
                        bookSlug={book.slug}
                        index={i + 1}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {flatChapters.map((ch, i) => (
              <ChapterRow
                key={ch.slug}
                chapter={ch}
                bookSlug={book.slug}
                index={i + 1}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function ChapterRow({
  chapter,
  bookSlug,
  index,
}: {
  chapter: BookChapter
  bookSlug: string
  index: number
}) {
  return (
    <Link
      href={`/books/${bookSlug}/${chapter.slug}`}
      className="group flex items-center gap-4 p-4 rounded-lg border border-border hover:border-foreground transition-colors"
    >
      <span
        className="flex-none w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-background"
        style={{ backgroundColor: 'var(--bb-5)' }}
      >
        {index}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Chapter {index}
        </p>
        <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
          {chapter.title}
        </p>
      </div>
      <span className="flex-none text-muted-foreground group-hover:text-foreground transition-colors" aria-hidden="true">
        &rarr;
      </span>
    </Link>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function IntelligentBookLanding({
  book,
}: {
  book: IntelligentBookMeta
}) {
  return (
    <div>
      <HeroSection book={book} />
      <FeaturesSection book={book} />
      {book.youtubeId && <VideoSection youtubeId={book.youtubeId} />}
      {(book.thematicStructure?.length || book.featuredPreview) && (
        <ThematicStructureSection book={book} />
      )}
      <AudienceSection audiences={book.audiences} />
      <TableOfContentsSection book={book} />
    </div>
  )
}
