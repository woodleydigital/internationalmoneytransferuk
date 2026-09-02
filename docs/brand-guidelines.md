# IMT UK — Brand Guidelines

**Status:** v1.0
**Last substantive update:** 2026-09-02
**Assets:** [`/public/brand/`](../public/brand) — see §7 before changing any of them.

---

## 1. What this identity has to do

This is not decoration. Two things in the standard make brand identity load-bearing:

1. **Brand-identity resolution is our named weakness** (standard §4.1). "International Money
   Transfer UK" is a generic phrase, so multiple entities can plausibly own it. The identity
   is what makes the domain resolve as a *brand* rather than a keyword string — and that is
   the precondition for the EMD mechanism firing at all.
2. **Design effort is a quality signal** (S2). Google's Quality Rater Guidelines cite human
   effort and involvement, and website representation vectors classify sources as expert,
   apprentice or amateur partly from visual and layout features. A template look actively
   works against us.

**Audience.** People moving £50,000–£500,000 for a property purchase, an emigration, an
inheritance or a business payment. Typically 45–70. This is often the largest single
transaction of their life.

**Therefore the brand reads: sober, precise, quietly authoritative.** Closer to a
surveyor's report or an ombudsman than to a consumer fintech app. Deliberately *not*
playful, urgent, or growth-marketed.

---

## 2. The mark

The mark encodes what the site actually does.

```
  ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁    ← the mid-market reference, at full length
  ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁ ▁▁▁▁▁▁▁     ← what you actually receive · and the margin
```

Two bars of equal total extent. The upper bar is the mid-market rate. The lower bar is split:
the muted teal is the amount that reaches the recipient, and the brass tip is the margin that
made up the difference. **The brass segment is the subject of the whole business.**

It is geometric, has no gradients or effects, and works down to 16px because it is four
rectangles.

### 2.1 Variants

| File | Use |
|---|---|
| `logo-imt-uk.svg` | **Primary.** Mark plus the drawn IMT UK wordmark. Light backgrounds. |
| `logo-imt-uk-reversed.svg` | Dark backgrounds. The tile drops away; bars sit on the surface. |
| `mark.svg` | Square contexts — avatars, app icons, social profiles. |
| `favicon.svg` | Browser tab. Heavier bars so it survives 16px. |

The wordmark is **drawn as vector paths, not set in a typeface.** It needs no font to render
correctly, cannot reflow, and is identical on every platform.

### 2.2 The full name is never inside the logo

The logo says "IMT UK". The full name "International Money Transfer UK" appears beside it as
**real HTML text**. This is deliberate on two counts: S1 §4.8 forbids putting essential text
only inside an image, and the full string is the one doing brand-identity disambiguation
work (standard §4.1). An acronym alone does not disambiguate — "IMT" has many owners.

### 2.3 Clear space and minimum size

- **Clear space:** the height of one bar (5 units at the 48-unit tile size) on every side.
  Nothing intrudes.
- **Minimum sizes:** primary lockup 120px wide; mark 24px; favicon 16px.
- Below 120px, drop the wordmark and use `mark.svg` rather than shrinking the lockup.

### 2.4 Misuse

Do not recolour the mark outside the palette · do not add gradients, shadows or outlines ·
do not stretch or rotate · do not place the light lockup on a mid-tone background · do not
reorder or resize the bars, since their relative lengths carry the meaning · do not set the
wordmark in a typeface as a substitute for the drawn paths.

---

## 3. Colour

Deep teal and brass. The choice is competitive as much as aesthetic: **this market is
saturated with blue** — XE, OFX, TorFX, Currencies Direct, Halo, Key Currency, and the
high-street banks are all blue or blue-and-red — while Wise owns bright green. A deep,
green-shifted teal sits in neither camp and still reads institutional.

### 3.1 Palette

| Token | Hex | Role |
|---|---|---|
| `brand-900` | `#062626` | Logo tile, footer, deepest surfaces |
| `brand-800` | `#0A3234` | Dark surface alternative |
| `brand-700` | `#0F3D3E` | **Primary.** Headings, wordmark, buttons |
| `brand-600` | `#165052` | Links, hover states |
| `brand-500` | `#1E6A6C` | Secondary interactive |
| `brand-300` | `#6FA8A9` | The "received" bar; muted marks on dark |
| `brand-100` | `#D8E8E8` | Tinted panels |
| `brand-50` | `#F0F7F7` | Lightest tint, reversed marks |
| `accent-700` | `#7A5210` | Accent text on light |
| `accent-600` | `#96661A` | Accent text, accent surfaces |
| `accent-500` | `#B8811F` | **The margin figure.** The brass bar. |
| `accent-100` | `#F5E9D0` | Accent tint |
| `ink` | `#101D1E` | Primary text |
| `body` | `#3D4B4B` | Body text |
| `muted` | `#677878` | Secondary text, captions |
| `line` | `#D3DDDD` | Decorative dividers **only** |
| `line-strong` | `#768C8C` | Form control borders — see §3.3 |
| `wash` | `#F6F9F9` | Panel background |

### 3.2 Brass does semantic work

`accent-500` is reserved for **the margin** — the cost the user was not shown. It is the
brass tip in the mark and it is the emphasis on the margin figure in the checker. It is not
a general highlight colour, and using it decoratively dilutes the one thing it means.

**It is deliberately not red.** Standard §1.5 requires the tool to report rather than accuse:
a margin is a legitimate charge. Brass is notable without being an alarm. There is no red in
this palette at all.

### 3.3 Verified contrast

Computed, not assumed. All pairings below meet WCAG 2.1 AA; most reach AAA.

| Pairing | Ratio | Requirement |
|---|---:|---|
| `ink` on white | 17.26 | 4.5 — AAA |
| `body` on white | 9.10 | 4.5 — AAA |
| `muted` on white | 4.63 | 4.5 |
| `brand-700` on white | 11.95 | 4.5 — AAA |
| white on `brand-700` | 11.95 | 4.5 — AAA |
| `accent-700` on white | 6.90 | 4.5 |
| `accent-600` on white | 4.99 | 4.5 |
| `ink` on `wash` | 16.31 | 4.5 — AAA |
| white on `brand-900` | 15.99 | 4.5 — AAA |
| `brand-300` on `brand-900` | 5.98 | 4.5 |
| `accent-500` on `brand-900` | 4.72 | 4.5 |
| `line-strong` on white | 3.24 | 3.0 — UI components |
| `line-strong` on `wash` | 3.06 | 3.0 — UI components |

**`line` fails 3:1 by design and that is fine** — it is for decorative dividers only. Every
form control border uses `line-strong`, because under WCAG 1.4.11 the border is the only
thing indicating the control exists. Never use `line` on an input.

---

## 4. Typography

**System stack. No webfonts.**

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, sans-serif;
```

This is a considered trade, not a shortcut. Standard §7 sets Core Web Vitals targets and
§2.7 makes retrieval cost a ranking input; a webfont costs render-blocking bytes and risks
layout shift for a brand personality the logo already carries. The identity lives in the
mark, the palette and the layout.

If a webfont is added later: one variable font, self-hosted, subset to Latin, preloaded,
`font-display: swap`, and metrics matched to the fallback to avoid CLS.

**Scale.** H1 30px/1.2 bold · H2 20px/1.3 semibold · body 16px/1.6 · small 14px/1.5.
Measure caps at ~70 characters. Numbers in results are set larger than surrounding text —
the figure is the answer.

---

## 5. Voice

Follows from the audience and from standard §1.5.

**We do:** state figures plainly and immediately · name the source and date of every number ·
say what we do not know · use plain English for regulated concepts, then name them precisely.

**We do not:** accuse a named provider · imply a margin is a scam · use urgency, scarcity or
growth-marketing language · claim to compare or quote when we do not · say "free" without
qualification · use exclamation marks.

The tone test: *would this sentence be at home in a surveyor's report?*

---

## 6. Application

- **Header:** primary lockup at 32px height, followed by the full name as HTML text.
- **Footer:** reversed lockup on `brand-900`, with the full NAP block. Consistent NAP is
  load-bearing for the EMD (standard §4.1).
- **The checker:** `wash` panel, `line-strong` borders, `brand-700` submit button. The total
  cost figure is the largest text on the page; the margin figure carries `accent-700`.
- **No decorative stock photography anywhere.** S1 §2.8 is explicit that stock imagery is not
  visual evidence. Any image on this site must carry information — a chart, a diagram, a
  real photograph of the actual office.

---

## 7. Asset URLs are permanent

Standard non-negotiable 9: changing media URLs measurably costs rankings, and S3 documents
real image-ranking loss from a partial image migration.

Once these files are live at `/brand/…`, **those paths do not change.** A redesign replaces
the file contents at the same URL. New variants get new filenames; they never rename existing
ones. This applies to the `logo` in `Organization` schema, which search engines associate
with the entity over time.

| Path | Permanent |
|---|---|
| `/brand/logo-imt-uk.svg` | yes |
| `/brand/logo-imt-uk-reversed.svg` | yes |
| `/brand/mark.svg` | yes |
| `/brand/favicon.svg` | yes |
