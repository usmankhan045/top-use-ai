# Pinterest Playbook

**These rules are enforced automatically.** A hook validates every pin batch
file on save (`scripts/pinterest/validate-pins.js`), and reports violations
back so they get fixed rather than shipped. Run it by hand any time:

```bash
node scripts/pinterest/validate-pins.js
```

How pins for this site are written and designed. Read this before creating any
pin, exactly as `WRITING-PLAYBOOK.md` is read before writing any post.

Derived from the September 2026 rebuild, when an audit of the first 240 pins
found 231 of them sharing just three image prompts and 34 titles opening with
the same word.

---

## The one rule everything else serves

**No two pins may share a design or a sentence structure.**

Pinterest suppresses accounts that publish visually repetitive content, and
readers scroll past anything that looks like the last thing they scrolled past.
A template system produces exactly that, however good the template is.

The brand stays constant. Everything else varies.

---

## What stays constant

These four things make the account recognisable and must never change per pin:

| | |
|---|---|
| Graphite | `#22202E` |
| Electric lime | `#D6FF3F` |
| Warm off-white | `#FBFAF6` |
| Warm grey | `#5C5A68` |

Plus the `TOPUSEAI.COM` wordmark, the "tested, not hyped" voice, and the
1000x1500 (2:3) canvas.

No other colours except within a photograph itself.

---

## What must vary

Everything. Each pin composes its own image prompt from:

- **Layout archetype.** 24 available, 11 photographic and 13 typographic.
- **Composition twist.** Crop tighter than comfortable, sit the composition
  low, mirror the expected arrangement, tilt the whole layout, and so on.
- **Ground colour.** Which of the brand colours carries the background.
- **Photo treatment.** 35mm grain, hard directional light, flat overhead,
  single-source lamp, harsh flash, and others.
- **Logo placement.** Five positions, from a full lime band to a vertical
  wordmark up the left edge.
- **Body text style.** Loose list, run-on with lime dots, uneven columns,
  stamped block, lime-underlined rows.

### Hard constraints

- **No layout may repeat within a single day's six pins.**
- **No layout paragraph may be emitted twice, ever**, across all batches.
- About **two thirds photo-led**. Pure typography is the exception.
- Photographs must carry **no faces and no hands**. Generated people look
  uncanny and cheapen the pin.
- Every image must read at **200px wide**, which is how it is actually seen.

---

## Pin anatomy

Every pin carries four pieces of on-image text. Missing any one of them is
what makes a pin get ignored.

### 1. Headline

The hook. Large, bold, broken across lines deliberately. It poses a tension
without resolving it.

### 2. Subhead

**Required on every pin.** Roughly 30-35% of headline size, sentence case.

This names the subject plainly and gives away enough of the answer that the
pin is useful on its own. Without it the headline is a riddle and gets
scrolled past.

> **YOUTUBE DIDN'T BAN AI VIDEOS. IT BANNED THIS.**
> Mass-produced videos from the same template. AI is fine. YouTube's own team
> says so. What kills monetisation is uploading fifty near-identical videos
> with nothing original in any of them.

The click is then for *the specifics*, not for *what on earth this is about*.

### 3. Kicker (optional)

A small lime pill tag carrying a date, a source or a qualifier. Deliberately
offset so it does not align neatly with the headline.

### 4. Closing line

**Required on every pin.** Around 18-20% of headline size, in warm grey.

A quiet pointer to the full piece, phrased differently every time. Never a
button, never a banner, no arrow, no box:

- The full policy, in plain English, at topuseai.com
- Every licence compared at topuseai.com
- Setup walkthrough at topuseai.com
- Picks for 8GB, 16GB and 24GB at topuseai.com

---

## Writing the copy

### Every headline rests on a verified fact

Take it from the post's own `quick_answer`. Never invent a number, a date or a
claim for a pin. If the post has no surprising fact, the pin has no hook and
the post needs a better angle.

Headlines that work are reversals, specific numbers, or named things that turn
out not to be what the reader assumes:

| Post | Headline |
|---|---|
| n8n | 203,000 STARS. NOT OPEN SOURCE. |
| Otter | 300 MINUTES FREE. THREE IMPORTS. EVER. |
| AUTOMATIC1111 | MOST STARS. NO RELEASE SINCE FEB 2025. |
| X API | $0.015 PLAIN. $0.200 WITH A LINK. |
| Zapier vs n8n | ONE WORKFLOW. TEN TASKS. OR ONE. |
| faster-whisper | 59 SECONDS. OR 2 MINUTES 23. SAME MODEL. |

### Title shapes must vary

The failed batch had 34 titles starting with "Free" and 66 of 240 opening with
one of four words. Rotate through curiosity gaps, specific numbers, direct
questions, myth corrections, outcome-first, first person, imperatives,
comparisons and warnings.

**Target: no opening word used more than about 10% of the time.**

### Descriptions

- 290 to 500 characters. Under 290 reads as thin.
- Carry the substance rather than teasing it. Pinterest indexes this text, so
  specifics like "CC-BY-NC 4.0" and "47.67%" earn their place.
- No income promises anywhere, both for Pinterest policy and honesty.

### Alt text

Describe what is actually in the image, including the photograph. Never
duplicate the title.

### No em dashes

This applies to pin titles, descriptions and text set inside images, exactly
as it applies to posts. See `WRITING-PLAYBOOK.md`.

---

## Scheduling

- **6 pins per day**, each from a different post.
- Every post gets **3 pins**, spaced **2 days apart**, each a different angle.
- A post never appears twice on the same day.
- Link to the blog post URL only. **Never an affiliate link in a pin.** No
  link shorteners.

### The three angles

Each of a post's three pins targets a different reader:

1. The searchable, keyword-led framing.
2. The outcome or how-to framing.
3. The curiosity gap or correction.

---

## Boards

Six, all kept above 20 pins. Boards below that threshold get merged rather
than left thin.

| Board | Fits |
|---|---|
| Work From Home Ideas | Productivity, automation, business tools |
| Faceless YouTube Ideas | Video, voice, audio, faceless content |
| Blogging & SEO Tips | SEO tools, blogging, Pinterest strategy |
| AI Art & Wall Art | Image generation, art selling, logos |
| Passive Income Ideas | Money, digital products, side hustles |
| Free AI Tools | Local AI, open source, free alternatives |

---

## Files

| File | Contents |
|---|---|
| `PINTEREST-DONE-DAYS-1-5.md` | Archive of the retired template system. Do not re-upload. |
| `PINTEREST-BATCH-1.md` | Days 6 to 15, 60 pins |
| `PINTEREST-BATCH-2.md` | Days 16 to 27, 72 pins |
| `PINTEREST-BATCH-3.md` | Days 28 to 40, 78 pins |

Each pin block carries six copy blocks in fenced code for one-click copying:
title, description, alt text, board, link, image prompt. Nothing requires
filling in.

---

## Enforcement

`scripts/pinterest/validate-pins.js` checks the rules above mechanically. A
`PostToolUse` hook in `.claude/settings.json` runs it whenever a
`PINTEREST-BATCH-*.md` file is written, and a `PreToolUse` hook restates the
core rules before the write happens.

What it fails on:

- Any em dash, with the line number
- A missing title, description, alt text, board, link or prompt
- Title over 100 characters
- Description under 290 or over 500 characters
- Alt text under 20 characters, or identical to the title
- A board outside the six
- A link that is not a topuseai blog URL, or does not match the pin's slug
- A prompt missing `SUBHEAD:`, `CLOSING LINE:` or the 1000x1500 canvas
- A photo prompt that does not exclude faces and hands, or omit the 200px rule
- Any duplicated title, description, alt text or layout block
- A layout repeated inside one day
- Income-claim phrasing in a description

What it warns on:

- Photo mix outside 55 to 80 percent
- Any opening word used in more than 12 percent of titles
- A board under 20 pins

Run it directly at any time:

```bash
node scripts/pinterest/validate-pins.js                    # all batches
node scripts/pinterest/validate-pins.js docs/PINTEREST-BATCH-2.md
```

---

## Pre-publish checklist

- [ ] Headline rests on a fact from the post's `quick_answer`
- [ ] Subhead present, naming the subject and giving real information
- [ ] Closing line present, phrased unlike any other pin's
- [ ] Description 290 to 500 characters, carrying specifics
- [ ] Alt text describes the image, not the title
- [ ] Title under 100 characters
- [ ] No em dashes anywhere (`grep -n '—'` returns nothing)
- [ ] No layout repeated within the day's six pins
- [ ] No layout paragraph used in any previous batch
- [ ] Roughly two thirds of pins photo-led
- [ ] No faces or hands in any photograph
- [ ] Board assigned, and no board left under 20 pins
- [ ] Link is the blog post URL, never an affiliate link
- [ ] No income promises in any description

---

## Rebuilding pins

The generator lives in the session scratchpad rather than the repo, since it
is a one-off tool rather than site code. Its structure, if it needs rebuilding:

- `vocab.py` holds the layout archetypes, grounds, photo subjects and
  treatments.
- `gen.py` composes one prompt per pin, with a sliding window preventing
  near repeats and a disk-backed history preventing exact ones across
  separate batch builds.
- `copy_*.py` hold the hand-written copy, one entry per post with three
  angles each.
- `build_b*.py` render each batch in schedule order.

The copy is hand-written per post. It is not generated, and it should not be.
