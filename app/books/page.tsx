import { join } from 'path'
import type { Metadata } from 'next'
import { scanBooks } from '@/lib/book-meta'
import BooksBrowser from './BooksBrowser'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Books - Medhavy',
  description: 'The companion book series for the Medhavy curriculum.',
}

export default function BooksPage() {
  const books = scanBooks(join(process.cwd(), 'public', 'books'))

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-muted/50 via-background to-background pt-20 pb-12 border-b border-border/40">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" aria-hidden="true" />
        
        <div className="container relative px-4 md:px-6 mx-auto">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2" />
              Medhavy Library
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Interactive Books & Textbooks
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-[800px] leading-relaxed">
              Explore the companion book series for the Medhavy curriculum. Discover our collection of intelligent, conversational textbooks that adapt to your learning style.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 md:px-6 mx-auto py-12">
        <BooksBrowser books={books} />
      </div>
    </div>
  )
}
