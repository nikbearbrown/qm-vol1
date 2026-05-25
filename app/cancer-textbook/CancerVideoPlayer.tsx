'use client'

import { useRef, useEffect, useState } from 'react'
import { Play } from 'lucide-react'

export default function CancerVideoPlayer() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Playback is now handled by the iframe.

  return (
    <section
      ref={sectionRef}
      id="video-tutorial"
      aria-labelledby="video-heading"
      className="py-20 md:py-32 relative overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section header with fade-in */}
        <div
          className={`text-center max-w-3xl mx-auto mb-14 space-y-4 transition-all duration-700 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <Play className="w-4 h-4" aria-hidden="true" />
            Video Tutorial
          </span>
          <h2
            id="video-heading"
            className="text-3xl md:text-4xl font-bold tracking-tight"
          >
            See the Textbook in Action
          </h2>
          <p className="text-lg text-foreground/70 dark:text-foreground/75 leading-relaxed">
            Watch how the Cancer Biology and Therapeutics textbook delivers
            an interactive, AI-powered learning experience — from chapter
            navigation to the built-in study companion.
          </p>
        </div>

        {/* Video container with scale-up animation */}
        <div
          className={`max-w-4xl mx-auto transition-all duration-1000 ease-out ${
            isVisible
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-12'
          }`}
          style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}
        >
          <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-foreground/10 bg-black">
            {/* Decorative glow behind the video */}
            <div
              className="absolute -inset-4 bg-gradient-to-tr from-primary/15 to-destructive/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"
              aria-hidden="true"
            />

            {/* Video element */}
            <div style={{ maxWidth: 1280 }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                <iframe 
                  src="https://northeastern-my.sharepoint.com/personal/agarwal_au_northeastern_edu/_layouts/15/embed.aspx?UniqueId=6b53f72f-9f93-4a54-bc7d-acc01bedaa19&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" 
                  width="1280" 
                  height="720" 
                  frameBorder="0" 
                  scrolling="no" 
                  allowFullScreen 
                  title="Medhavy_Cancer_Tutorial 1.mp4" 
                  style={{ border: 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: '100%', maxWidth: '100%' }}
                ></iframe>
              </div>
            </div>
          </div>

          {/* Caption below video */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Cancer Biology and Therapeutics — Guided Tutorial
          </p>
        </div>
      </div>
    </section>
  )
}
