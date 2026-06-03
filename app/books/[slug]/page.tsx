import Link from 'next/link'
import { notFound } from 'next/navigation'
import { join } from 'path'
import { scanBooks } from '@/lib/book-meta'
import { Badge } from '@/components/ui/badge'
import { BookOpen } from 'lucide-react'
import IntelligentBookLanding from './IntelligentBookLanding'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const books = scanBooks(join(process.cwd(), 'public', 'books'))
  const book = books.find(b => b.slug === slug)
  if (!book) return { title: 'Books - Medhavy' }
  return {
    title: `${book.title} - Books`,
    description: book.description || book.title,
  }
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const books = scanBooks(join(process.cwd(), 'public', 'books'))
  const book = books.find(b => b.slug === slug)

  if (!book) notFound()

  // Intelligent books get their own landing page
  if (book.type === 'intelligent') {
    return (
      <IntelligentBookLanding
        book={{
          slug: book.slug,
          title: book.title,
          subtitle: book.subtitle || undefined,
          description: book.description || undefined,
          authors: book.authors,
          coverImage: book.coverImage,
          stats: book.stats,
          youtubeId: book.youtubeId,
          thematicStructure: book.thematicStructure,
          audiences: book.audiences,
          featuredPreview: book.featuredPreview,
          parts: book.partsExtended,
          chapters: book.chapters,
        }}
      />
    )
  }

  // Standard book detail view (unchanged)
  const hasParts = book.parts.length > 0 && book.parts.some(p => p.chapters.length > 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Top Navigation Bar */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-[4rem] z-30 animate-in slide-in-from-top-4 fade-in duration-500 fill-mode-both">
        <div className="container px-4 md:px-6 mx-auto py-3">
          <Link
            href="/books"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">
              &larr;
            </span> 
            Back to Library
          </Link>
        </div>
      </div>

      <div className="container px-4 md:px-6 mx-auto py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 mb-16 items-start">
            {/* Book Cover with Glassmorphism shadow */}
            {book.cover && (
              <div className="shrink-0 group perspective-1000 animate-in zoom-in-95 fade-in duration-700 fill-mode-both">
                <div className="relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/50 group-hover:shadow-primary/20 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
                  <img
                    src={book.cover}
                    alt={`${book.title} cover`}
                    className="w-56 md:w-64 object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
              </div>
            )}

            {/* Book Metadata */}
            <div className="flex-1 space-y-6">
              <div className="animate-in slide-in-from-right-8 fade-in duration-700 fill-mode-both" style={{ animationDelay: '150ms' }}>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant={book.status === 'published' ? 'default' : 'secondary'} className="px-3 py-1 font-semibold tracking-wide uppercase text-[10px]">
                    {book.status}
                  </Badge>
                  {book.series.name && (
                    <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {book.series.name} &middot; #{book.series.position}
                    </span>
                  )}
                  {book.edition && (
                    <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {book.edition} Edition
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 leading-tight text-foreground">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="text-xl md:text-2xl text-muted-foreground font-serif italic mb-6">
                    {book.subtitle}
                  </p>
                )}

                {book.authors.length > 0 && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-full border border-border/50 text-sm mb-6">
                    <span className="text-muted-foreground">By</span>
                    <span className="font-semibold text-foreground">{book.authors.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 p-6 rounded-2xl bg-muted/30 border border-border/50 animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-both" style={{ animationDelay: '300ms' }}>
                {book.publisher && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Publisher</p>
                    <p className="text-sm font-medium text-foreground">{book.publisher}</p>
                  </div>
                )}
                {book.isbn && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">ISBN</p>
                    <p className="text-sm font-medium text-foreground">{book.isbn}</p>
                  </div>
                )}
                {book.published && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Published</p>
                    <p className="text-sm font-medium text-foreground">{book.published}</p>
                  </div>
                )}
              </div>

              {book.description && (
                <div className="prose prose-neutral dark:prose-invert max-w-none animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-both" style={{ animationDelay: '400ms' }}>
                  <p className="text-lg leading-relaxed text-foreground/80">{book.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-4 animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-both" style={{ animationDelay: '500ms' }}>
                {book.amazonUrl && (
                  <a
                    href={book.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-md px-8 text-sm font-bold shadow-md transition-all hover:-translate-y-0.5 bg-foreground text-background hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Buy on Amazon
                  </a>
                )}
                {book.relatedCourse && (
                  <Link
                    href={book.relatedCourse}
                    className="inline-flex h-11 items-center justify-center rounded-md border-2 border-border/60 bg-transparent px-8 text-sm font-bold shadow-sm transition-all hover:bg-accent hover:text-accent-foreground hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Related Course
                  </Link>
                )}
              </div>

              {book.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-6 border-t border-border/40 animate-in fade-in duration-700 fill-mode-both" style={{ animationDelay: '600ms' }}>
                  {book.keywords.map(k => (
                    <Badge key={k} variant="outline" className="text-xs bg-background/50 hover:bg-accent transition-colors cursor-default border-border/60">
                      {k}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table of Contents Section */}
          {(hasParts || book.chapterFiles.length > 0) && (
            <div className="pt-16 mt-8 border-t border-border/40 relative">
              {/* Decorative background element */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-in fade-in zoom-in duration-1000 fill-mode-both" style={{ animationDelay: '700ms' }} />
              
              <div className="flex items-center gap-4 mb-10 animate-in slide-in-from-left-8 fade-in duration-700 fill-mode-both" style={{ animationDelay: '700ms' }}>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                    Table of Contents
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Navigate through the chapters and sections</p>
                </div>
              </div>

              {hasParts ? (
                <div className="space-y-12">
                  {book.parts.map((part, i) => (
                    <div 
                      key={i} 
                      className="relative pl-6 md:pl-8 animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-both"
                      style={{ animationDelay: `${800 + i * 200}ms` }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-border/40" />
                      <div className="absolute left-[-5px] top-2 w-[11px] h-[11px] rounded-full bg-background border-2 border-primary" />
                      
                      <h3 className="text-2xl font-bold mb-6 text-foreground tracking-tight">{part.title}</h3>
                      <div className="grid gap-3">
                        {part.chapters.map((ch, idx) => {
                          const file = book.chapterFiles.find(f => f.slug === ch)
                          return (
                            <div key={ch}>
                              {file ? (
                                <Link
                                  href={`/books/${book.slug}/${file.slug}`}
                                  className="group flex items-center p-4 rounded-xl border border-border/40 bg-background/50 hover:bg-accent hover:border-foreground/30 transition-all shadow-sm hover:shadow-md"
                                >
                                  <span className="w-8 text-center text-sm font-bold text-muted-foreground mr-4 opacity-50 group-hover:text-primary group-hover:opacity-100 transition-colors">
                                    {idx + 1}.
                                  </span>
                                  <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {file.title}
                                  </span>
                                  <span className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                    &rarr;
                                  </span>
                                </Link>
                              ) : (
                                <div className="flex items-center p-4 rounded-xl border border-border/20 bg-muted/20">
                                  <span className="w-8 text-center text-sm font-bold text-muted-foreground mr-4 opacity-30">
                                    {idx + 1}.
                                  </span>
                                  <span className="text-base text-muted-foreground/60 italic">{ch}</span>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {book.chapterFiles.map((file, idx) => (
                    <Link
                      key={file.slug}
                      href={`/books/${book.slug}/${file.slug}`}
                      className="group flex items-start gap-4 p-5 rounded-2xl border border-border/50 bg-background hover:bg-accent/50 hover:border-foreground/30 transition-all shadow-sm hover:shadow-md animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-both"
                      style={{ animationDelay: `${800 + idx * 100}ms` }}
                    >
                      <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center shrink-0 border border-border/50 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                        <span className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">
                          {idx + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {file.title}
                        </p>
                        {file.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                            {file.description}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center">
                          <span className="text-primary">&rarr;</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
