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

DeepSeek Harness publicly provides **Cordis plugin APIs, slots, semantic tokens, UI primitives and client development guidance**. The relevant rules are distributed across GitHub documentation, agent guidance and source code; they are not yet organized as a complete design handbook around community plugin authors' interface tasks.

So plugins each do their own thing, and one screen ends up with mismatched button heights, arbitrary spacing and unpredictable stacking. That is not a plugin's fault — it is what happens without a spec and a check.

This repository organizes those references into a guide community plugin authors can discover and verify. Three rules:

1. **No invented numbers.** Every size, gap and duration carries its source (the official client bundle, Apple HIG, OpenHarmony, or an explicit "this repository suggests"). Where no authority exists, it says so instead of inventing something that looks professional.
2. **No arbitrary taste verdicts.** Visual quality is assessed through checkable criteria such as hierarchy, reading width, density, alignment, theme contrast and interaction feedback.
3. **If it cannot be decided, it is not a rule.** "Spacing should feel comfortable" is not a rule. "Two adjacent independent controls closer than 16px count as cramped" is. Every document states whether its criteria can be checked automatically.

## Layout

| Path | Contents |
| --- | --- |
| [`spec/`](spec/) | 10 documents: frame layout, seat selection, controls, tokens, motion, icons, accessibility, checklist, conflict arbitration |
| [`rules/`](rules/) | `rules.json` / `rules.csv` — the checklist in machine-readable form, for CI gates and auditors |
| [`guides/`](guides/) | Task-oriented guides: overview, official basis, principles, interface patterns, seats and integration, verification and sources |
| [`data/`](data/) | Collected from a running harness: 75 icons, 90 seats, tokens (palette 77 / light aliases 115 / dark aliases 119 / scale and type 207) and the element inventory. Calibers and capture times: [`docs/FACTS-2026-10-02.md`](docs/FACTS-2026-10-02.md) |
| [`icons/`](icons/) | 75 official icons plus brand marks, exported verbatim (see [`icons/README.md`](icons/README.md)) |
| [`components/`](components/) | Reusable-source knowledge base: categorised, dependency-free React built on official tokens |
| [`website/`](website/) | The plugin design guide and live component gallery, with navigation, article content, on-page contents and search |
| [`scripts/`](scripts/) | Collection and generation — every number here is reproducible, nothing is hand-recorded |

## Open the site

Published on GitHub Pages:

```
https://physicolor.github.io/dsh-design-resources/
```

The site is **zero-build and works straight from disk** as well:

```
website/index.html
```

Or serve it locally (no cache, so a refresh always shows current files):

```sh
node scripts/serve.mjs        # → http://127.0.0.1:4173/
```

Every specimen renders as **live HTML**, not a mockup image, because these components were built with the WebUI stack in the first place. Pages on the left, the component in the middle, the rationale on the right ("why it is designed this way / when to reach for it / where the geometry comes from").

The site follows this repository's own spec, so it is the spec's first implementation rather than just a description of it:

- **the spec embeds runnable demos, not screenshots**: the three-column frame (hover any column and it is picked out), the composer's vertical structure, the right rail opening and closing, the geometry of an official icon (board, safe area, bounding shape, stroke weight), the app-icon board (50 × 50 container, 36 × 36 artwork, the ink's circumscribed circle measured live), the control board (nine live readouts, five states, three counter-examples), the token board (six radii, four elevations, eight type roles, the same aliases resolved in both themes), the accessibility board (contrast computed from the WCAG formula, hit areas measured), the pre-flight checklist (clickable; one unchecked mandatory item blocks the release), the conflict board (real occupancy records; shuffle registration order and watch the order change) and the rule/source legend — all native HTML, hoverable, clickable, copyable. **Every spec document must carry an operable demo**, and the build enforces it (`every spec carries an operable demo` plus a per-page probe) — an empty stage counts as a failure;
- **the spec embeds a reproduction of the product interface, not a diagram**: the three-column frame, the composer's vertical structure and the right rail opening are the same `website/shell/` instance — every number taken from `docs/reference/` (boxes and computed styles harvested from the running product: the frame in `geometry.json`, the composer in `composer-geometry.json`, the conversation column in `conversation-geometry.json`, the top strip in `top-strip.json`, the dock under the card in `status-line.json`), and you can drag and click it directly;
- **the rule for reproducing anything is screenshot first, measure second, build third**: `docs/reference/` holds photographs of the real product, and any interface has to be explainable against them — if there is no source, it does not get drawn;
- **components are marked "ships with the product" or "proposed here"**: 3 of the 26 have no official counterpart at all (key-value list, mini bar, panel seat); they are this repository's proposals for plugin authors, and the page says plainly that the product has no such interface. The other 23 trace back to the product's own CSS modules or to the official primitives. A wrong label fails the build: every id in `components/origins.json` must sit in exactly one list, and every proposed component must name the real scene it serves;
- **the index is a foldable tree**: groups are captions rather than toggles (a caption that hides its own contents saves height and loses the answer to "what is in here"), only component categories fold — and **the whole row is the fold control**: closed it looks exactly like its leaf siblings (text and chevron, no box), and opening it lights the same pill; the row you are actually on is bolded on top of that, so "open" and "you are here" stay two separate signals;
- **specimens have no frame**: the live content sits directly on the page instead of in a box inside a box;
- **each column scrolls on its own** while the page itself never does, under a liquid-glass top bar content passes behind;
- **both rails drag to resize** (arrow keys work too) and remember their width and collapsed state;
- **either rail collapses entirely**, with an animated open/close;
- **Chinese and English, both complete**: the spec, the guides, the component documents and every specimen exist in both languages. Any Chinese left on an English page is a product string quoted verbatim, and it is followed by its English gloss. The contract and its gates are in [`docs/I18N.md`](docs/I18N.md);
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
node scripts/check-i18n.mjs        # fail if a translation is missing or stale (--update re-pins it)
node scripts/check-demos-i18n.mjs  # fail if a specimen still shows untranslated copy
node website/gen-site.mjs          # everything    → website/js/data.js
node scripts/gen-index.mjs         # inventory     → index.json (the package entry point)
node scripts/check-refs.mjs        # fail if a document names a seat that does not exist
node website/verify.mjs            # structure + data + real browser render + screenshots
npm run build                      # all of the above, in that order
```

The collectors read this machine's harness installation (`DSH_ASAR` / `DSH_PRIMITIVES` override the paths). `collect-tokens.mjs` needs the desktop `app.asar`; `collect-slots.mjs` needs a seat-tree snapshot captured from the harness's seat inspection surface.

## The set: spec plus runtime

These are two halves of one thing, and they are worth installing together: one says what the interface
should look like, the other makes it true inside the running product and reports what it could not fix.

| Repository | Role | The question it answers |
| --- | --- | --- |
| **dsh-design-resources** (this one) | Spec, resources, reusable source, the site | How the interface **should** be built — how big a control is, how wide a gap is, how long a motion lasts, how an icon is drawn |
| [dsh-ui-harmonizer](https://github.com/Physicolor/dsh-ui-harmonizer) | A runtime plugin inside the product | How it **actually** turned out — read-only compatibility auditing, reported in the settings page |

- Site: [physicolor.github.io/dsh-design-resources](https://physicolor.github.io/dsh-design-resources/)
- Runtime: [github.com/Physicolor/dsh-ui-harmonizer](https://github.com/Physicolor/dsh-ui-harmonizer)

The spec obliges nobody to change their code; it makes conflicts **visible, explainable and one click from an issue**.

## Licensing scope

Original work (`spec/`, `components/`, `website/`, `scripts/`, `rules/`, the READMEs) is MIT.

`icons/` and `data/tokens.json` are **extracted from DeepSeek's official client packages**, copyright DeepSeek, and are included here for reference and interoperability with their source recorded. The MIT license does not cover them — check the official terms before reuse. See [`icons/README.md`](icons/README.md).

Where `spec/` ports rules from external design systems (Apple Human Interface Guidelines, OpenHarmony design documentation), the source is cited inside the clause.
