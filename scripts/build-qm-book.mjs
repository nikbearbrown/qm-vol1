/**
 * build-qm-book.mjs
 *
 * Converts the "Quantum Mechanics — Volume 1" Markdown source into self-contained,
 * Guardian-palette-styled HTML chapter files for medhavy.com's books system.
 *
 * Source : qm-vol1/quantum-mechanics-vol1/chapters/*.md   (sibling project, outside the repo)
 * Output : public/books/quantum-mechanics-vol1/*.html      (one per chapter)
 *
 * Each output file is a standalone document (its own <style> + MathJax) rendered
 * inside the /books/[slug]/[...chapter] iframe. Figures live in ./images, interactive
 * simulations in ./simulations (both copied alongside).
 *
 * Run:  node scripts/build-qm-book.mjs
 * Override the source dir with QM_SRC=/abs/path/to/chapters if it moves.
 */

import { createRequire } from 'module'
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const MarkdownIt = require('markdown-it')

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dirname, '..')

const SRC = process.env.QM_SRC ||
  '/Users/gauravbakale/Documents/personal/projects/medhavy/qm-vol1/quantum-mechanics-vol1/chapters'
const DST = join(REPO, 'public', 'books', 'quantum-mechanics-vol1')

const md = new MarkdownIt({ html: true, linkify: true, typographer: true, breaks: false })

// ─── Helpers ────────────────────────────────────────────────────────────────

function escAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function titleCase(slug) {
  return slug.replace(/^\d+-/, '').split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

/** First real paragraph, stripped to plain text for <meta description>. */
function firstPara(src) {
  const lines = src.split('\n')
  let started = false
  const buf = []
  for (const ln of lines) {
    const t = ln.trim()
    if (!started) {
      if (t === '' || t === '---' || t.startsWith('#') || t.startsWith('<') || t.startsWith('![')) continue
      started = true
      buf.push(t)
    } else {
      if (t === '' || t === '---' || t.startsWith('#') || t.startsWith('<')) break
      buf.push(t)
    }
  }
  let s = buf.join(' ')
  s = s
    .replace(/\$\$[^$]*\$\$/g, '')
    .replace(/\$[^$]*\$/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return s.slice(0, 180).replace(/\s+\S*$/, '') // trim to word boundary
}

// ─── Markdown → HTML body ─────────────────────────────────────────────────────

function convert(src) {
  const embeds = []
  const dmath = []
  const imath = []

  // 1. Extract interactive-simulation embeds (raw HTML) → comment placeholders.
  src = src.replace(
    /<!--\s*MEDHAVY-EMBED start[\s\S]*?<!--\s*MEDHAVY-EMBED end[^>]*-->/g,
    (block) => {
      const cleaned = block
        .replace(/\.\.\/simulations\//g, 'simulations/')
        .replace(/\.\.\/images\//g, 'images/')
      const i = embeds.length
      embeds.push(cleaned)
      return `\n\n<!--QM_EMBED_${i}-->\n\n`
    }
  )

  // 2. Extract display math ($$...$$, may span lines and carry \tag{}) → tokens.
  src = src.replace(/\$\$([\s\S]+?)\$\$/g, (_m, inner) => {
    const i = dmath.length
    dmath.push(inner.trim())
    return `@@QMD${i}@@`
  })

  // 3. Extract inline math ($...$) → tokens.
  src = src.replace(/\$([^$\n]+?)\$/g, (_m, inner) => {
    const i = imath.length
    imath.push(inner)
    return `@@QMI${i}@@`
  })

  // 4. Wrap "image + italic caption" pairs into <figure> blocks (raw HTML).
  src = src.replace(
    /!\[([^\]]*)\]\(([^)]+)\)[ \t]*\n\*([^\n]+?)\*[ \t]*(?=\n|$)/g,
    (_m, alt, url, cap) => {
      const u = url.replace(/\.\.\/images\//, 'images/').replace(/\.\.\/simulations\//, 'simulations/')
      return `\n\n<figure class="qm-figure"><img src="${u}" alt="${escAttr(alt)}" loading="lazy" />` +
        `<figcaption>${cap.trim()}</figcaption></figure>\n\n`
    }
  )

  // 5. Render Markdown.
  let html = md.render(src)

  // 6. Restore & fix paths.
  html = html.replace(/\.\.\/simulations\//g, 'simulations/').replace(/\.\.\/images\//g, 'images/')
  html = html.replace(/<!--QM_EMBED_(\d+)-->/g, (_m, i) => embeds[+i])
  html = html.replace(/@@QMD(\d+)@@/g, (_m, i) => `\\[${dmath[+i]}\\]`)
  html = html.replace(/@@QMI(\d+)@@/g, (_m, i) => `\\(${imath[+i]}\\)`)
  // Open simulation links in a new tab (they'd otherwise replace the chapter iframe).
  html = html.replace(/<a href="(simulations\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener"')

  return html
}

// ─── Page template (Guardian palette + Inter + MathJax) ───────────────────────

function page({ title, description, body, eyebrow }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escAttr(title)}</title>
<meta name="description" content="${escAttr(description)}" />
<meta name="keywords" content="quantum mechanics, physics, Schrödinger equation, wave function, Medhavy, interactive textbook" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<script>
window.MathJax = {
  tex: { inlineMath: [['\\\\(','\\\\)']], displayMath: [['\\\\[','\\\\]']], tags: 'none', processEscapes: true },
  options: { skipHtmlTags: ['script','noscript','style','textarea','pre','code'] }
};
</script>
<script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<style>
:root {
  --bb-1:#121212; --bb-2:#1F3D1A; --bb-3:#8C3422; --bb-4:#C8860E;
  --bb-5:#5C5A4E; --bb-6:#8C8878; --bb-7:#999387; --bb-8:#FFFFFF;
  --bg:#FFFFFF; --surface:#F7F6F2; --text:#1a1a1a; --muted:#5C5A4E;
  --border:#e6e4dd; --heading:#1F3D1A; --link:#1F3D1A; --accent:#C8860E;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg:#121212; --surface:#1c1c1c; --text:#ededed; --muted:#a5a196;
    --border:#2a2a2a; --heading:#7bb46e; --link:#8fca82; --accent:#e0a63a;
  }
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0; background: var(--bg); color: var(--text);
  font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  font-size: 18px; line-height: 1.75; text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
::selection { background: var(--accent); color: #fff; }
.qm-reader { max-width: 760px; margin: 0 auto; padding: 3.25rem 1.5rem 6rem; }
.qm-eyebrow {
  display: inline-flex; align-items: center; gap: .55rem;
  font-size: .72rem; font-weight: 600; letter-spacing: .16em; text-transform: uppercase;
  color: var(--muted); margin: 0 0 1rem;
}
.qm-eyebrow::before { content:""; width: 1.6rem; height: 2px; background: var(--accent); display:inline-block; }
h1 {
  color: var(--heading); font-weight: 800; letter-spacing: -.02em;
  font-size: clamp(1.9rem, 4vw, 2.5rem); line-height: 1.12; margin: 0 0 1.6rem;
}
h2 {
  color: var(--heading); font-weight: 700; letter-spacing: -.015em;
  font-size: 1.5rem; line-height: 1.25; margin: 3rem 0 1rem; padding-top: .4rem;
}
h3 { color: var(--text); font-weight: 700; font-size: 1.18rem; margin: 2.2rem 0 .8rem; }
h4 { color: var(--text); font-weight: 600; font-size: 1.02rem; letter-spacing: .01em; margin: 1.8rem 0 .6rem; }
p { margin: 1.1rem 0; }
strong { color: var(--heading); font-weight: 700; }
a { color: var(--link); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--link) 35%, transparent); transition: border-color .15s; }
a:hover { border-bottom-color: var(--link); }
ul, ol { margin: 1.1rem 0; padding-left: 1.4rem; }
li { margin: .4rem 0; }
li::marker { color: var(--bb-6); }
blockquote {
  margin: 1.6rem 0; padding: .2rem 0 .2rem 1.2rem;
  border-left: 3px solid var(--accent); color: var(--muted); font-style: italic;
}
hr {
  border: 0; height: 1px; width: 42%; margin: 2.8rem auto;
  background: linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent);
}
code {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: .88em; background: var(--surface); padding: .12em .38em; border-radius: 5px;
  border: 1px solid var(--border);
}
pre {
  background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
  padding: 1.1rem 1.25rem; overflow-x: auto; line-height: 1.55; font-size: .9rem;
}
pre code { background: none; border: 0; padding: 0; }
/* Figures */
figure.qm-figure { margin: 2rem 0; text-align: center; }
figure.qm-figure img {
  max-width: 100%; height: auto; border: 1px solid var(--border);
  border-radius: 10px; background: #fff; padding: .5rem;
}
figure.qm-figure figcaption, figure.medhavy-sim figcaption {
  margin-top: .7rem; font-size: .84rem; color: var(--muted); line-height: 1.55;
  text-align: center; font-style: italic;
}
/* Interactive simulation embeds */
figure.medhavy-sim {
  margin: 2.25rem 0; padding: .75rem; background: var(--surface);
  border: 1px solid var(--border); border-radius: 14px;
}
figure.medhavy-sim iframe {
  width: 100%; height: 540px; border: 1px solid var(--border) !important;
  border-radius: 10px; background: #fff; display: block;
}
figure.medhavy-sim figcaption { font-style: normal; text-align: left; padding: 0 .3rem; }
figure.medhavy-sim figcaption strong { color: var(--accent); }
/* Tables (notation, comparisons) */
table { width: 100%; border-collapse: collapse; margin: 1.6rem 0; font-size: .94rem; }
th, td { text-align: left; padding: .6rem .8rem; border-bottom: 1px solid var(--border); vertical-align: top; }
thead th { color: var(--heading); font-weight: 700; border-bottom: 2px solid var(--bb-7); }
tbody tr:nth-child(even) { background: color-mix(in srgb, var(--surface) 60%, transparent); }
/* Math overflow on small screens */
mjx-container[display="true"] { overflow-x: auto; overflow-y: hidden; max-width: 100%; padding: .2rem 0; }
img { max-width: 100%; }
</style>
</head>
<body>
<article class="qm-reader">
<p class="qm-eyebrow">${escAttr(eyebrow)}</p>
${body}
</article>
</body>
</html>
`
}

// ─── Build ────────────────────────────────────────────────────────────────────

function build() {
  if (!existsSync(SRC)) {
    console.error('Source chapters not found at', SRC)
    process.exit(1)
  }
  const files = readdirSync(SRC).filter(f => f.endsWith('.md')).sort()
  let n = 0
  for (const f of files) {
    const slug = f.replace(/\.md$/, '')
    const raw = readFileSync(join(SRC, f), 'utf-8')
    const h1 = (raw.match(/^#\s+(.+?)\s*$/m) || [])[1] || titleCase(slug)
    const title = h1.replace(/\s+/g, ' ').trim()
    const description = firstPara(raw) || `${title} — Quantum Mechanics, Volume 1.`
    const body = convert(raw)
    const out = page({
      title,
      description,
      body,
      eyebrow: 'Quantum Mechanics · Volume 1',
    })
    writeFileSync(join(DST, `${slug}.html`), out, 'utf-8')
    n++
    console.log(`  ✓ ${slug}.html  —  ${title.slice(0, 60)}`)
  }
  console.log(`\nBuilt ${n} chapter files into ${DST}`)
}

build()
