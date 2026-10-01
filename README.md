---
description: "Design spec, seat directory, tokens, the official icon set and a reusable-source knowledge base for DeepSeek Harness plugin authors."
---

# DeepSeek Design Resources

<p align="center">
  <img src="icons/brand/fish.svg" alt="DeepSeek" width="72">
</p>

<p align="center">
  <strong>Making community plugins look like one product.</strong><br>
  Spec · Seat directory · Design tokens · Official icon set · Reusable source · Live component gallery
</p>

<p align="center">
  <a href="README.zh-CN.md">简体中文</a> · English
</p>

---

## Why this exists

DeepSeek Harness gives plugin authors a **technical stack and a development contract**: the Cordis plugin system, the slot (seat) mechanism, and `--dsw-*` design tokens. It does not give them a **design spec**: how large a control should be, how much space belongs between two of them, how long a transition runs, how to draw an icon, or who wins when two plugins want the same spot.

So plugins each do their own thing, and one screen ends up with mismatched button heights, arbitrary spacing and unpredictable stacking. That is not a plugin's fault — it is what happens without a spec and a check.

This repository supplies the missing layer. Three rules:

1. **No invented numbers.** Every size, gap and duration carries its source (the official client bundle, Apple HIG, OpenHarmony, or an explicit "this repository suggests"). Where no authority exists, it says so instead of inventing something that looks professional.
2. **No aesthetic verdicts.** The spec keeps things consistent and usable; it does not claim one style is prettier.
3. **If it cannot be decided, it is not a rule.** "Spacing should feel comfortable" is not a rule. "Two adjacent independent controls closer than 16px count as cramped" is. Every document states whether its criteria can be checked automatically.

## Layout

| Path | Contents |
| --- | --- |
| [`spec/`](spec/) | 10 documents: frame layout, seat selection, controls, tokens, motion, icons, accessibility, checklist, conflict arbitration |
| [`rules/`](rules/) | `rules.json` / `rules.csv` — the checklist in machine-readable form, for CI gates and auditors |
| [`data/`](data/) | Real data collected from a running harness: icon inventory, 90 seats, 113 semantic tokens |
| [`icons/`](icons/) | 75 official icons plus brand marks, exported verbatim (see [`icons/README.md`](icons/README.md)) |
| [`components/`](components/) | Reusable-source knowledge base: categorised, dependency-free React built on official tokens |
| [`website/`](website/) | The live gallery: a three-column site where specimens render as native HTML, with search |
| [`scripts/`](scripts/) | Collection and generation — every number here is reproducible, nothing is hand-recorded |

## Open the site

The site is **zero-build and works straight from disk**:

```
website/index.html
```

Or serve it locally (no cache, so a refresh always shows current files):

```sh
node scripts/serve.mjs        # → http://127.0.0.1:4173/
```

Every specimen renders as **live HTML**, not a mockup image, because these components were built with the WebUI stack in the first place. Pages on the left, the component in the middle, the rationale on the right ("why it is designed this way / when to reach for it / where the geometry comes from").

The site follows this repository's own spec, so it is the spec's first implementation rather than just a description of it:

- **the spec embeds runnable demos, not screenshots**: the three-column frame (hover any column and it is picked out), the composer's vertical structure, the right rail opening and closing, the selector chevron against a "animate a layout property" counter-example, the panel open/close motion, and the geometry of an official icon (board, safe area, bounding shape, stroke weight — switchable, with three size families side by side) — all native HTML, hoverable, clickable, copyable;
- **components are marked "ships with the product" or "proposed here"**: 18 of the 29 have no official counterpart at all; they are this repository's proposals for plugin authors, and the page says so plainly;
- **the index is a foldable tree**: groups are captions rather than toggles (a caption that hides its own contents saves height and loses the answer to "what is in here"), only component categories fold, and the fold control sits at the end of the row; exactly **one row** is ever lit — the one you opened;
- **specimens have no frame**: the live content sits directly on the page instead of in a box inside a box;
- **each column scrolls on its own** while the page itself never does, under a liquid-glass top bar content passes behind;
- **both rails drag to resize** (arrow keys work too) and remember their width and collapsed state;
- **either rail collapses entirely**, with an animated open/close;
- **Chinese and English** interface dictionaries; the spec prose and component docs are Chinese-only today and say so in English mode;
- **light and dark are both authored** — a design that survives light mode and collapses in dark mode counts as a defect here;
- **an operable motion bench** on the motion spec page: compare the five durations and both curves side by side, which is the one thing paper cannot do and an HTML reference can;
- **specimens render into a shadow root, not an iframe**: under `file://` every document is its own opaque origin, so a parent cannot read a frame's height or measure its content and the preview degrades silently; a shadow root isolates the demo's styles and needs no measuring because it takes part in normal layout;
- **tooltips are self-drawn** — not the browser's bubble, but the harness's own geometry (`padding 3/7`, `radius 8`, `13px/20`);
- **breadcrumbs and an on-this-page outline**: every drill-down page has a one-click way back, the rationale column lists jumpable sections, and a page carrying only metadata collapses that column instead of padding it.

## Regenerating the data

```sh
node scripts/collect-icons.mjs     # icon set      → icons/ + data/icons.json
node scripts/collect-tokens.mjs    # theme tokens  → data/tokens.json + website/css/dsh-tokens.css
node scripts/collect-slots.mjs     # seat directory (needs a snapshot under data/raw/)
node scripts/gen-rules.mjs         # checklist     → rules/rules.json
node website/gen-site.mjs          # everything    → website/js/data.js
node scripts/check-refs.mjs        # fail if a document names a seat that does not exist
node website/verify.mjs            # structure + data + real browser render + screenshots
```

The collectors read this machine's harness installation (`DSH_ASAR` / `DSH_PRIMITIVES` override the paths). `collect-tokens.mjs` needs the desktop `app.asar`; `collect-slots.mjs` needs a seat-tree snapshot captured from the harness's seat inspection surface.

## Relationship to dsh-ui-harmonizer

| Repository | Responsibility |
| --- | --- |
| **this one** | Spec, resources, reusable source, the site — "how it should be done" |
| [dsh-ui-harmonizer](https://github.com/Physicolor/dsh-ui-harmonizer) | Read-only compatibility auditing and targeted reconciliation — "how it actually turned out", reported in the settings page |

The spec obliges nobody to change their code; it makes conflicts **visible, explainable and one click from an issue**.

## Licensing scope

Original work (`spec/`, `components/`, `website/`, `scripts/`, `rules/`, the READMEs) is MIT.

`icons/` and `data/tokens.json` are **extracted from DeepSeek's official client packages**, copyright DeepSeek, and are included here for reference and interoperability with their source recorded. The MIT license does not cover them — check the official terms before reuse. See [`icons/README.md`](icons/README.md).

Where `spec/` ports rules from external design systems (Apple Human Interface Guidelines, OpenHarmony design documentation), the source is cited inside the clause.
