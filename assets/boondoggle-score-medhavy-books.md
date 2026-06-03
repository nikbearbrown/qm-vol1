# BOONDOGGLE SCORE
**System:** Medhavy Intelligent Book System  
**SDD Completion:** Partial — component output exists (BooksBrowser.tsx, IntelligentBookLanding.tsx, book.json schema); no formal /v1–/v4 on record  
**Score generated:** 2026-05-27  
**Team Claude fluency:** Level II (manage a conversation thread as persistent context)  

---

## PHASE LEGEND
F = Foundation  
C = Core System Skeleton  
I = Integration Layer  
B = Full Feature Build  
H = Hardening  
R = Release  

---

## STEP 1 · PHASE F · HUMAN TASK

**LABOR:** Human  
**SUPERVISORY CAPACITY:** [PF] Problem Formulation — deciding what goes into the extended BookMeta type before Claude sees any code; this is the schema contract for every downstream step.

**ACTION:** Open `lib/book-meta.ts`. Confirm the full list of new fields `scanBooks()` must return: `type`, `stats`, `youtubeId`, `thematicStructure`, `audiences`, `featuredPreview`, `coverImage`, `tags`. For each field, decide: (a) does it live in `book.json` and get parsed at scan time, or (b) is it read lazily in the page component? Flag any field that needs a type not already in the file. Write your decision as a comment block at the top of `lib/book-meta.ts` before Step 2 begins.

**HANDOFF CONDITION:** A written list of every new field, its type, and its parse location (scan-time vs. lazy). No ambiguity about where `coverImage` is stored relative to the book directory.

**DEPENDENCY:** None.

---

## STEP 2 · PHASE F · CLAUDE TASK

**LABOR:** Claude  
**CONTEXT REQUIRED:** Current contents of `lib/book-meta.ts`; the field list + parse decisions from Step 1; the `IntelligentBookMeta` interface from `IntelligentBookLanding.tsx`.

**PROMPT:**
```
You are extending the book metadata scanner for a Next.js App Router project.

Here is the current lib/book-meta.ts:
[PASTE FULL CURRENT FILE]

Here is the IntelligentBookMeta interface from IntelligentBookLanding.tsx:
[PASTE INTERFACE BLOCK]

The human has decided the following fields are parsed at scan time from book.json:
[PASTE STEP 1 FIELD LIST]

Task: Rewrite lib/book-meta.ts to:
1. Extend the BookMeta type with every field from the list above (use TypeScript optional fields)
2. In scanBooks(), parse each new field from book.json using optional chaining — if the field is absent, the property is undefined (never throw)
3. coverImage, if present in book.json as a relative path like "cover.jpg", should be resolved to the public URL "/books/[slug]/cover.jpg"
4. Do not change the return type name BookMeta — extend it in place
5. Do not change any existing field names or their behavior

Return the complete rewritten file. TypeScript only. No migration scripts. No test files.
```

**EXPECTED OUTPUT:** A complete `lib/book-meta.ts` with the extended `BookMeta` type and updated `scanBooks()` function. Every new field is optional. No existing field is broken.

**HANDOFF CONDITION:** Every field from Step 1's list appears in the returned `BookMeta` type as an optional property. The `scanBooks()` function does not throw on a `book.json` that omits any new field. The return type name `BookMeta` is unchanged.

**DEPENDENCY:** Step 1 complete.

---

## STEP 3 · PHASE F · HUMAN TASK

**LABOR:** Human  
**SUPERVISORY CAPACITY:** [PA] Plausibility Auditing — checking that Claude's type extension does not break the existing books that lack the new fields.

**ACTION:** Open Claude's returned `lib/book-meta.ts`. Verify: (1) Every existing field is still present with its original type. (2) Every new field is `?` optional. (3) The `coverImage` resolution logic produces `/books/[slug]/cover.jpg` — not an absolute disk path. (4) Drop the file into the repo locally (`npm run dev`) and navigate to `/books` — confirm the existing books still render without errors.

**HANDOFF CONDITION:** No TypeScript errors on `npm run build --dry`. Existing books pages load without runtime errors. New fields appear as `undefined` (not thrown) for books without them.

**DEPENDENCY:** Step 2 complete.

---

## STEP 4 · PHASE C · CLAUDE TASK

**LABOR:** Claude  
**CONTEXT REQUIRED:** The `BooksBrowser.tsx` file already generated (drop-in replacement); the current `app/books/page.tsx`; the confirmed `BookMeta` type from Step 2.

**PROMPT:**
```
You are updating a Next.js App Router server component.

Here is the current app/books/page.tsx:
[PASTE CURRENT FILE]

Here is the new BooksBrowser.tsx client component:
[PASTE BooksBrowser.tsx]

Here is the confirmed BookMeta type:
[PASTE BookMeta interface]

Task: Rewrite app/books/page.tsx to:
1. Import BooksBrowser from "./BooksBrowser"
2. Pass the full BookMeta[] array (including all new fields) to <BooksBrowser books={books} />
3. Keep the existing page metadata (title, description)
4. Keep the existing container/layout wrapper
5. Do not add any new sections, headings, or UI beyond what currently exists in page.tsx

Return the complete rewritten page.tsx. No other files.
```

**EXPECTED OUTPUT:** A complete `app/books/page.tsx` that passes the full `BookMeta[]` to `BooksBrowser` and is otherwise identical to the current file in structure and metadata.

**HANDOFF CONDITION:** The only diff between old and new `page.tsx` is (a) the BooksBrowser import and (b) the props passed to it. No new layout, no new sections, no removed sections.

**DEPENDENCY:** Step 3 complete.

---

## STEP 5 · PHASE C · CLAUDE TASK

**LABOR:** Claude  
**CONTEXT REQUIRED:** `IntelligentBookLanding.tsx` (already generated); the current `app/books/[slug]/page.tsx`; the confirmed `BookMeta` type.

**PROMPT:**
```
You are updating a Next.js App Router server component.

Here is the current app/books/[slug]/page.tsx:
[PASTE CURRENT FILE]

Here is IntelligentBookLanding.tsx:
[PASTE IntelligentBookLanding.tsx]

Here is the confirmed BookMeta type (which extends IntelligentBookMeta):
[PASTE BookMeta interface]

Task: Update app/books/[slug]/page.tsx to:
1. Import IntelligentBookLanding from "./IntelligentBookLanding"
2. After the book is loaded, add this conditional before the existing return:
   if (book.type === 'intelligent') return <IntelligentBookLanding book={book} />
3. The existing return (standard book detail view) is unchanged — it remains as the fallback
4. Keep all existing metadata generation, notFound() handling, and generateStaticParams

Return the complete rewritten file. Do not change any logic that does not relate to the conditional.
```

**EXPECTED OUTPUT:** `app/books/[slug]/page.tsx` with the `IntelligentBookLanding` conditional inserted in the correct position. All existing logic is unchanged.

**HANDOFF CONDITION:** The conditional appears after the book is loaded and before the existing return. `generateStaticParams` is unmodified. Standard (non-intelligent) books still render the original detail view.

**DEPENDENCY:** Step 3 complete. (Parallel to Step 4 — no dependency between Steps 4 and 5.)

---

## STEP 6 · PHASE C · HUMAN TASK

**LABOR:** Human  
**SUPERVISORY CAPACITY:** [PA] Plausibility Auditing — catching any silent failure in the conditional routing before a real book.json is in place.

**ACTION:** Create a minimal test `book.json` in `public/books/test-intelligent/` with `"type": "intelligent"` and the minimum required fields (title, authors, one chapter). Start the dev server. Navigate to `/books/test-intelligent`. Confirm: (1) IntelligentBookLanding renders (not the old detail view). (2) Change `"type"` to `"standard"` — confirm the old detail view renders. (3) Delete the test directory when done.

**HANDOFF CONDITION:** Both rendering paths confirmed working in dev. No console errors on either path.

**DEPENDENCY:** Steps 4 and 5 complete.

---

## STEP 7 · PHASE I · HUMAN TASK

**LABOR:** Human  
**SUPERVISORY CAPACITY:** [IJ] Interpretive Judgment — only the human knows which chapter files actually exist in the cancer textbook directory and what their real slugs are.

**ACTION:** In `public/books/cancer-biology/` (or whatever the slug will be), list all existing `.html` chapter files. Record their exact filenames. Count chapters per part. Confirm the YouTube ID for the demo video. Confirm the cover image filename. Confirm the exact author names as they should appear publicly. This information cannot be inferred from any existing file — it requires direct filesystem inspection and editorial decision.

**HANDOFF CONDITION:** A complete inventory: exact chapter filenames with titles, part assignments, YouTube ID, cover image path, confirmed author list. Ready to hand to Step 8.

**DEPENDENCY:** Step 6 complete.

---

## STEP 8 · PHASE I · CLAUDE TASK

**LABOR:** Claude  
**CONTEXT REQUIRED:** The `book.json.example` file generated earlier; the chapter inventory from Step 7; the confirmed author list, YouTube ID, cover image path.

**PROMPT:**
```
You are writing a book.json metadata file for a Next.js books system.

Here is the schema reference (book.json.example):
[PASTE book.json.example]

Here is the chapter inventory for this book:
Title: Cancer Biology and Therapeutics
Subtitle: A Thorough Intelligent Textbook
Authors: [PASTE CONFIRMED AUTHOR LIST]
Cover image: [PASTE FILENAME]
YouTube ID: [PASTE ID]
Chapters by part: [PASTE CHAPTER INVENTORY FROM STEP 7]
Stats: [PASTE CHAPTER COUNT, APPENDIX COUNT, TOPIC COUNT]

Task: Write a complete book.json for this book using the schema reference.
Rules:
- type must be "intelligent"
- Every chapter filename must exactly match the inventory — do not invent filenames
- thematicStructure must accurately reflect the part assignments from the inventory
- slug for each chapter must be the filename without the .html extension
- Do not add fields not in the schema reference
- Return valid JSON only — no comments, no markdown fencing
```

**EXPECTED OUTPUT:** A valid, complete `book.json` with every chapter filename matching the Step 7 inventory exactly.

**HANDOFF CONDITION:** Every `filename` in the output matches a real file in the chapter inventory. No invented chapter titles. Valid JSON (passes `JSON.parse`). `"type": "intelligent"` is present.

**DEPENDENCY:** Step 7 complete.

---

## STEP 9 · PHASE I · HUMAN TASK

**LABOR:** Human  
**SUPERVISORY CAPACITY:** [IJ] Interpretive Judgment — verifying that what Claude generated matches what exists on disk, and that chapter titles are editorially correct.

**ACTION:** Place Claude's `book.json` in the book directory. Run `npm run dev`. Navigate to `/books/cancer-biology` (or the correct slug). Verify: (1) Every chapter in the TOC section links to a real chapter file. (2) Author names display correctly. (3) The thematic structure matches the actual intellectual organization of the book — not just the file count. (4) The cover image loads. (5) The YouTube embed renders (or is absent without error if ID is placeholder).

**HANDOFF CONDITION:** All chapter links resolve. No broken images. No console errors. Thematic structure confirmed editorially correct by someone who knows the book.

**DEPENDENCY:** Step 8 complete.

---

## STEP 10 · PHASE I · CLAUDE TASK

**LABOR:** Claude  
**CONTEXT REQUIRED:** The final versions of `BooksBrowser.tsx`, `IntelligentBookLanding.tsx`, and `app/books/[slug]/page.tsx`; the `ACCESSIBILITY.md` forbidden patterns section.

**PROMPT:**
```
You are an accessibility auditor for a Next.js application using a strict design system.

Here are the forbidden patterns from the project's ACCESSIBILITY.md:
- Never use raw Tailwind color classes: text-teal-*, bg-teal-*, text-blue-*, text-green-*, etc.
- Never use same-hue-family pairings without verification
- Opacity-reduced text below /80 on body text requires explicit contrast verification

Here are the files to audit:
[PASTE BooksBrowser.tsx]
[PASTE IntelligentBookLanding.tsx]

Task: Scan both files for:
1. Any raw Tailwind color class (text-{color}-{shade}, bg-{color}-{shade}, border-{color}-{shade}) that is NOT derived from the bb palette or semantic CSS variables
2. Any inline style using a hex color not from this list: #121212, #1F3D1A, #8C3422, #C8860E, #5C5A4E, #8C8878, #999387, #FFFFFF
3. Any opacity modifier below /80 applied to body text

For each finding: file name, line reference (approximate), the offending class or style, and the correct replacement using var(--bb-N) or a semantic Tailwind class.

If no violations are found, state that explicitly.
```

**EXPECTED OUTPUT:** Either a clean bill of health ("no violations found") or a specific list of violations with exact replacements. No general observations — specific findings only.

**HANDOFF CONDITION:** Either zero violations reported, or every reported violation has been fixed in the source files and the audit re-run confirms clean.

**DEPENDENCY:** Steps 4 and 5 complete.

---

## STEP 11 · PHASE I · HUMAN TASK

**LABOR:** Human  
**SUPERVISORY CAPACITY:** [PA] Plausibility Auditing — Claude's palette audit catches class names but cannot see rendered contrast ratios in a real browser.

**ACTION:** With the dev server running, open Chrome DevTools → Accessibility panel. Navigate to: (1) `/books` — check that book title text on the fallback colored cards passes 4.5:1. (2) `/books/cancer-biology` — check the hero heading (bb2 on bb8), the dark audience section (bb8 on bb1), and the feature cards. Flag any combination that fails. Do NOT use opacity hacks to fix failures — consult `ACCESSIBILITY.md` Section 3 for compliant combinations.

**HANDOFF CONDITION:** No text/background combination in either page fails WCAG AA (4.5:1 for body, 3:1 for large text). Failures are fixed in source before Step 12.

**DEPENDENCY:** Step 10 complete.

---

## STEP 12 · PHASE B · HUMAN TASK

**LABOR:** Human  
**SUPERVISORY CAPACITY:** [EI] Executive Integration — coordinating with Jugal to resolve the repo access gap identified in the email chain; this is an organizational decision, not a technical one.

**ACTION:** Decide: (a) add Jugal as a collaborator to `nikbearbrown/medhavy_com` on GitHub, or (b) take Jugal's work and integrate it yourself. If (a): add collaborator, send Jugal the repo URL, and establish a branch naming convention before he pushes. If (b): confirm that Steps 1–11 produce everything needed without Jugal's files (they do — the Boondoggle builds from scratch in the Guardian palette). Either way: the decision must be made before Step 12 closes, because it determines who pushes the final commit.

**HANDOFF CONDITION:** Either Jugal has confirmed access and a branch to push to, OR the decision is made to proceed without Jugal's files (using the Boondoggle output only). No ambiguity about who pushes.

**DEPENDENCY:** Step 9 complete.

---

## STEP 13 · PHASE H · CLAUDE TASK

**LABOR:** Claude  
**CONTEXT REQUIRED:** The `git diff` or list of all changed files; the current `CLAUDE.md`; the current "Site structure" and "Books system" sections.

**PROMPT:**
```
You are updating a CLAUDE.md file that serves as the authoritative system documentation for a Next.js project.

Here is the current CLAUDE.md (relevant sections):
[PASTE Books system section, Site structure section, Remaining work section]

Here is what changed in this session:
1. lib/book-meta.ts — extended BookMeta type with: type, stats, youtubeId, thematicStructure, audiences, featuredPreview, coverImage, tags
2. app/books/BooksBrowser.tsx — rewritten: now shows cover images in a 6-column grid with Guardian-palette fallback cards; splits intelligent books into a featured row
3. app/books/[slug]/page.tsx — now conditionally renders IntelligentBookLanding when book.type === 'intelligent'
4. app/books/[slug]/IntelligentBookLanding.tsx — new file: full intelligent book landing page template (Hero, Features, Video, Thematic Structure, Audience, TOC sections)
5. public/books/cancer-biology/book.json — new file: first instance of an intelligent book

Task: Update CLAUDE.md to reflect these changes. Specifically:
1. Update the "Books system" section to document the new book.json fields and the IntelligentBookLanding conditional
2. Update "Site structure" item 5 (/books/[slug]) to note the intelligent book landing page path
3. Remove "Cancer textbook integration" or similar from Remaining work if present
4. Add to Remaining work: any follow-on tasks that were deferred

Rules:
- Do not change any section not listed above
- Match the existing CLAUDE.md formatting exactly (markdown tables, code blocks, bullet style)
- Return only the sections that changed — not the full document

```

**EXPECTED OUTPUT:** The updated text for the specific CLAUDE.md sections that changed. Formatted to drop in as replacements. No other sections touched.

**HANDOFF CONDITION:** Every change from this session is documented. No section references a file or behavior that no longer exists. "Remaining work" is accurate.

**DEPENDENCY:** Steps 9 and 11 complete.

---

## STEP 14 · PHASE H · HUMAN TASK

**LABOR:** Human  
**SUPERVISORY CAPACITY:** [IJ] Interpretive Judgment — CLAUDE.md is the document a future engineer (including Jugal) will rely on to understand the system. Claude cannot judge whether the description of IntelligentBookLanding accurately captures the editorial intent.

**ACTION:** Read Claude's CLAUDE.md updates. Verify: (1) The description of IntelligentBookLanding is accurate enough that a new engineer could add a second intelligent book without asking a verbal question. (2) The `book.json` field list is complete and matches the confirmed Step 1 decisions. (3) The conditional rendering logic is described correctly. Edit anything Claude got wrong before merging.

**HANDOFF CONDITION:** CLAUDE.md accurately describes the system as built. A new engineer reading it could add a second intelligent book with no verbal guidance.

**DEPENDENCY:** Step 13 complete.

---

## STEP 15 · PHASE H · CLAUDE TASK

**LABOR:** Claude  
**CONTEXT REQUIRED:** All changed files from this session.

**PROMPT:**
```
Write a Git commit message for the following changes to a Next.js project (medhavy.com):

Changed files:
- lib/book-meta.ts — extended BookMeta type (type, stats, youtubeId, thematicStructure, audiences, featuredPreview, coverImage, tags)
- app/books/BooksBrowser.tsx — rewritten with cover image grid, Guardian-palette fallbacks, intelligent book featured row
- app/books/[slug]/page.tsx — conditional IntelligentBookLanding render for books with type: intelligent
- app/books/[slug]/IntelligentBookLanding.tsx — new intelligent book landing page template (6 sections)
- public/books/cancer-biology/book.json — first intelligent book instance
- CLAUDE.md — updated Books system documentation

Format: conventional commits style
Subject line: 50 characters max, imperative mood
Body: 3–5 lines, what changed and why, no bullet points
No "feat:" prefix needed — this project does not use conventional commit types

Return the commit message only. No preamble.
```

**EXPECTED OUTPUT:** A well-formed commit message, subject ≤ 50 chars, body 3–5 lines.

**HANDOFF CONDITION:** Subject line is ≤ 50 characters. Body does not contain bullet points. Message accurately describes what changed.

**DEPENDENCY:** Step 14 complete.

---

## STEP 16 · PHASE R · HUMAN TASK

**LABOR:** Human  
**SUPERVISORY CAPACITY:** [TO] Tool Orchestration — deciding the push sequence and verifying the Vercel deployment succeeded.

**ACTION:** (1) Stage all changed files: `git add lib/book-meta.ts app/books/ public/books/cancer-biology/ CLAUDE.md`. (2) Commit with Claude's message from Step 15. (3) Push to `main`. (4) Monitor Vercel dashboard until deployment succeeds (green). (5) Navigate to `medhavy.com/books` and `medhavy.com/books/cancer-biology` in production. Confirm both pages render correctly. (6) Share the production URL with Sri and Jugal per the email chain.

**HANDOFF CONDITION:** Vercel deployment status is green. Both `/books` and `/books/cancer-biology` load correctly in production. The team has been notified.

**DEPENDENCY:** Step 15 complete.

---

## SCORE SUMMARY

**Total steps:** 16  
**Claude tasks:** 7 (44% of steps)  
**Human tasks:** 9 (56% of steps)  

---

**CRITICAL PATH:**  
Step 1 → Step 2 → Step 3 → Step 5 → Step 6 → Step 7 → Step 8 → Step 9 → Step 12 → Step 13 → Step 14 → Step 15 → Step 16  
*(13 steps on critical path — Step 4 and Steps 10–11 run in parallel off the critical path)*

---

**HIGHEST-RISK HANDOFFS:**

1. **Step 2 → Step 3** (BookMeta type extension)  
Claude extending an existing type library risks breaking the `scanBooks()` return for existing books. The handoff condition (no TypeScript errors, existing books load) must be verified in a real `npm run build` — not just a visual scan.

2. **Step 8 → Step 9** (book.json generation from chapter inventory)  
Claude generates filenames from a human-provided inventory. If Step 7's inventory has a typo or a missing file, Claude propagates it silently into the JSON. The human verification in Step 9 is the only place this gets caught — and it requires actually clicking every chapter link in the browser, not just reading the JSON.

3. **Step 12** (repo access decision)  
This is the only step with an organizational dependency outside the codebase. If the decision is deferred, the push in Step 16 has no clear owner. The handoff condition must be satisfied explicitly — not assumed.

---

**SUPERVISORY CAPACITY DISTRIBUTION:**

| Capacity | Steps | Count |
|---|---|---|
| [PA] Plausibility Auditing | 3, 6, 11 | 3 |
| [PF] Problem Formulation | 1 | 1 |
| [TO] Tool Orchestration | 16 | 1 |
| [IJ] Interpretive Judgment | 7, 9, 14 | 3 |
| [EI] Executive Integration | 12 | 1 |

**Note:** [EI] appears only once (Step 12). This is appropriate for a single-system build. If Jugal's work and the Boondoggle output are being reconciled across two concurrent threads, Step 12 becomes a heavier EI task — the human must decide which version of each file is authoritative before any merge.

---

**WHAT IS MISSING FROM THIS SCORE:**

No formal /v4 (User and Business Needs) exists for this build. This means there is no documented Need that the `thematicStructure` or `audiences` fields serve — they were carried over from Jugal's design by observation. If a second intelligent book is added and those fields are absent, there is no Need document to consult for whether their absence is acceptable. When /v4 is completed for the Books system, Steps 7–9 can be extended with a Need-mapping check on every `book.json` field.
