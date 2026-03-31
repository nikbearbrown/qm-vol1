'use client'

import Link from 'next/link'

const SOCIAL_LINKS = [
  { name: 'GitHub', href: 'https://github.com/Medhavy' },
  { name: 'Substack', href: 'https://medhavy.substack.com/' },
  { name: 'YouTube', href: 'https://www.youtube.com/@NikBearBrown' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t bg-background">
      <div className="container px-4 md:px-6 mx-auto py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Company Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Medhavy AI, LLC</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>30 N Gould St Ste N</p>
              <p>Sheridan, WY 82801</p>
              <p>
                <a href="mailto:medhavy@humanitarians.ai" className="hover:text-foreground transition-colors">
                  medhavy@humanitarians.ai
                </a>
              </p>

            </div>
          </div>

          {/* Placeholder column for future content */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Platform</h3>
            <div className="flex flex-col gap-2">
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <a href="https://hub.medhavy.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Medhavy Learning Hub
              </a>
              <Link href="/medhavy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                What is Medhavy?
              </Link>
            </div>
          </div>

          {/* Members */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Members</h3>
            <div className="flex flex-col gap-2">
              <a href="https://www.nikbearbrown.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Nik Bear Brown
              </a>
              <a href="https://srinivassridhar.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Srinivas Sridhar
              </a>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Connect</h3>
            <div className="flex flex-col gap-2">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Legal</h3>
            <div className="flex flex-col gap-2">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/privacy/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
              <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          &copy; {currentYear} Medhavy AI, LLC. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
