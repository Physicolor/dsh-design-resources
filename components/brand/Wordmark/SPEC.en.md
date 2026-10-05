---
source: components/brand/Wordmark/SPEC.md
source-sha256: ea2b0bfbab2dd4c9
translated-at: 2026-10-05
---
# Wordmark · SPEC

- id: wordmark
- category: brand
- source: `components/brand/Wordmark/` (`index.tsx` / `wordmark.module.css`)
- official-counterpart: the `//#region lib/types/BrandWordmark.js` block of `@deepseek-ai/dsh-client-ui-primitives/lib/index.js` (the official component has **no** companion `.module.css`)
- human-doc: `README.md` (judgement and trade-offs; this file holds facts only)

## geometry-source

Values are read one by one from the official `lib/index.js`; the notation is "value <- filename identifier / property".

| Value | Source |
| --- | --- |
| `viewBox "0 0 182 24"` / `"26 0 156 24"` | <- `lib/index.js` `BrandWordmark`'s `viewBox: includeMark ? "0 0 182 24" : "26 0 156 24"` |
| `size = 24`, `height = size`, `width = size * (includeMark ? 182 : 156) / 24` | <- `lib/index.js` `function BrandWordmark({ size = 24, className, includeMark = true })`'s `width` / `height` |
| Badge rectangle `x="129.348" y="5.5" width="52" height="14" rx="2"` | <- `lib/index.js` `jsx("rect", { x: "129.348", y: "5.5", width: "52", height: "14", rx: "2", fill: "currentColor" })` |
| Whale clip `23.16 × 17.0435`, `translate(0.141602 3.52185)` | <- `clipPath#dsh-wordmark-whale-clip > rect` in `lib/index.js`'s `<defs>` |
| Badge clip `46 × 14`, `translate(132.348 5.5)` | <- `clipPath#dsh-wordmark-badge-clip > rect` in `lib/index.js`'s `<defs>` |
| 17 path `d` strings: 9 for the lettering + 1 for the whale + 7 for the badge letters, with lengths 660 / 654 / 816 / 823 / 1173 / 827 / 820 / 45 / 97 / 3469 / 136 / 272 / 1023 / 190 / 188 / 1368 / 1370 in that order | <- the various `jsx("path", { d: … })` calls in the `BrandWordmark` region of `lib/index.js`; each one matches the `path@d` of `icons/brand/wordmark.svg` (compared character by character; in this repository's implementation the lengths of the 17 paths have been rechecked against the table above and agree) |
| Lettering and whale `fill="currentColor"` | <- the first 10 `jsx("path", { fill: "currentColor" })` in `lib/index.js` |
| Badge letters `fill="var(--dsw-alias-label-primary-inverted)"` | <- the last 7 `jsx("path", { fill: "var(--dsw-alias-label-primary-inverted)" })` in `lib/index.js` |
| Default `aria-hidden="true"` | <- `"aria-hidden": "true"` in `lib/index.js`'s `BrandWordmark` |

### Values proposed by this repository (not official values; with no corresponding official declaration)

- `--dsh-wordmark-badge-ink` (default `var(--dsw-alias-label-primary-inverted)`): the official component writes the token straight onto the `fill` attribute of the 7 paths. Promoted to a custom property, a wordmark that lands on a non-token background only needs one variable overridden, without touching the component; the default is exactly the official behaviour (again only these two tokens are used).
- `.mark { flex: none }` / `.mark { vertical-align: middle }`: the official component has neither companion CSS nor a default class. A brand mark dropped into a flex row should not be squeezed to a non-proportional size; the `<svg>` default baseline alignment knocks it out of alignment with the text beside it.
- The clipPath id is generated with `useId()` (with React's generated `:` filtered out): the official component writes the fixed ids `dsh-wordmark-whale-clip` / `dsh-wordmark-badge-clip`. With several wordmarks on one page a fixed id repeats, and although clips with identical geometry render the same, a duplicate id is invalid HTML and also confuses automation-test selectors.
- Omitting `fill="white"` on the clip `rect`: the official component includes it. A `clipPath` takes only the geometry, and the fill plays no part in rendering, so omitting it is visually equivalent while avoiding a non-token colour literal in the TSX.
- With `includeMark={false}` the whale path is **not rendered**: the official component renders it whether the switch is on or off. The whale's coordinates (roughly x 0.14 → 23.30) fall entirely outside the `26 0 156 24` viewBox and are cut off by the `<svg>`'s default `overflow: hidden`, so the result is visually equivalent, just one DOM node lighter.
- The `title` prop and passing `SVGProps` through: the official component accepts only `size` / `className` / `includeMark`. The wordmark is unreadable by default, and offering an optional graphic name is more useful; pass-through attributes make layout and testing easier.

### This repository's decisions (rewriting official behaviour)

- The badge letters' colour moves from "written on the `fill` attribute of the 7 paths" to "written on the `fill` of the `.badgeInk` group, with the value coming from `--dsh-wordmark-badge-ink`": the default rendering matches the official one (both `var(--dsw-alias-label-primary-inverted)`), and the only difference is how easily it can be overridden.
- The clipPath id changes from a fixed value to a value derived from `useId()` (`dsh-wordmark-whale-clip-<uid>` / `dsh-wordmark-badge-clip-<uid>`): the official component uses fixed ids, whereas this repository rewrites them as unique ids, avoiding duplicate ids when one page holds several instances.
- With `includeMark={false}` the whale path is not rendered: the official component always renders it. Visually equivalent (it is cut off by the viewBox), and this repository emits one DOM node fewer.
- Omitting the clip `rect`'s `fill="white"`: the official component has it; a `clipPath` does not look at the fill, so the result is visually equivalent.

The implementation is original to this repository: the path data is taken character by character from the official exported constants, the dimensions and clips are rewritten from the official formulas and attributes, and there is no official CSS available to copy.

## api

`WordmarkProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'width' | 'height' | 'title' | 'children'>`, `forwardRef<SVGSVGElement, WordmarkProps>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `number` | `24` | Height (px). Width = `size × 182 / 24` (with the mark) or `size × 156 / 24` (without) |
| `includeMark` | `boolean` | `true` | Whether to draw the whale in front; when off the viewBox becomes `26 0 156 24` and the badge stays |
| `title` | `string` | none | Once passed, renders `role="img"` + `<title>`; when not passed, `aria-hidden="true"` |
| `className` | `string` | none | Appended after `.mark` |
| the rest | `Omit<ComponentPropsWithoutRef<'svg'>, 'width' \| 'height' \| 'title' \| 'children'>` | — | Passed through to `<svg>` unchanged |
| `ref` | `Ref<SVGSVGElement>` | none | Pass it through to `<svg>` |

Size cross-reference:

| Height | Width (with the mark) | Width (without the mark) |
| --- | --- | --- |
| `24px` (default) | `182px` | `156px` |
| `32px` | `242.66666666666666px` | `208px` |
| `48px` | `364px` | `312px` |

## states

The component is a static graphic with no interaction states; the table below covers every rendering branch.

| State | Trigger | Behaviour |
| --- | --- | --- |
| Decorative (default) | No `title` passed (or an empty string) | `aria-hidden="true"`, and `role` is not emitted |
| Named | `title` non-empty | `role="img"` + `<title>{title}</title>`, and no `aria-hidden` |
| With the whale | `includeMark === true` (default) | `viewBox "0 0 182 24"`, width `size × 182 / 24`, the whale group is rendered |
| Without the whale | `includeMark === false` | `viewBox "26 0 156 24"`, width `size × 156 / 24`, the whale group is not rendered |
| Main colour | The outer `color` | The 9 lettering paths, the whale and the badge rectangle are all `fill="currentColor"` |
| Badge ink | `--dsh-wordmark-badge-ink` | The fill of the badge's 7 letter paths; default `var(--dsw-alias-label-primary-inverted)` |
| Hover / focus / disabled | — | The component defines no interaction styling of any kind |

## tokens

DSH semantic tokens:

- `--dsw-alias-label-primary-inverted` — the default for the badge letters' ink (the official wording)

Component-level CSS variables (internal to this repository, not DSH tokens):

- `--dsh-wordmark-badge-ink` (default `var(--dsw-alias-label-primary-inverted)`)

### Badge colours and the light/dark themes

The badge is two colour segments — the rounded rectangle in `currentColor`, the letters in `--dsh-wordmark-badge-ink` (default `var(--dsw-alias-label-primary-inverted)`):

| Theme | The commonly inherited `color` (token → actual value) | Rectangle background | Letter colour | Result |
| --- | --- | --- | --- | --- |
| Light (default `:root`) | `--dsw-alias-label-primary` → `--dsw-static-neutral-bluish-1000` (near black) | Near black | `--dsw-static-neutral-bluish-00` (white) | White letters on a dark background, readable |
| Dark (`body[data-ds-dark-theme]`) | `--dsw-alias-label-primary` → `--dsw-static-neutral-bluish-50` (near white) | Near white | `--dsw-static-neutral-bluish-800` (dark grey) | Dark letters on a light background, readable |

Where the values of the two colour segments come from: the `:root` block (line 138) and the `body[data-ds-dark-theme]` block (line 254) of `website/css/dsh-tokens.css`.

Note: **the badge background is `currentColor`**, so contrast depends on the parent's `color`. If the wordmark is placed on a brand-coloured block, a gradient or an image and inherits a non-label colour, `--dsw-alias-label-primary-inverted` no longer necessarily contrasts with that background. Two ways out: let the wordmark go on inheriting `--dsw-alias-label-primary`, or override only `--dsh-wordmark-badge-ink`.

`demo.html` holds both of these comparisons (the light block / the dark block).

## a11y

- The wordmark is a graphic: `aria-hidden="true"` by default, and a screen reader cannot read the "deepseek" inside it; in decorative situations leave the default alone, since the real text on the page carries the brand name (`AC-MF-14`).
- When the wordmark is the **only** brand information in that area, pass `title`, which renders `role="img"` + `<title>`.
- A more robust readable combination is "visible text + `FishMark`": it does not depend on the varying support for announcing `title`, and it saves one graphic announcement.
- The HARNESS in the badge is a graphic, not text; do not count on it to provide readable information.
- Do not invert the colours with something like CSS `filter: invert()`: both colour segments, the rectangle and the letters, flip together and contrast runs away (`AC-MF-08`: colour only through semantic tokens); to change colours, change `color` or `--dsh-wordmark-badge-ink`.
- Scale with `size`, not `transform: scale()`: a fractional scale makes thin strokes look fuzzy and blurs the badge letters too.
- Do not bind interaction handlers to the `<svg>`; when a click is needed, a real parent control carries it (`AC-MF-09`).

## checks

Binary constraints a machine can check (decidable as true / false, and directly expressible as lint rules).

1. With no `title` passed, `aria-hidden="true"` is present on the `<svg>`, and `role` is **not** emitted and `aria-label` is **not** emitted.
2. With `title` passed, `role="img"` and `<title>` are emitted, and `aria-hidden="true"` is **not** emitted.
3. `viewBox` is exactly `0 0 182 24` (`includeMark` true) or `26 0 156 24` (false).
4. `height` equals `size`; `width` equals `size × 182 / 24` or `size × 156 / 24`, and must not be rounded.
5. With `includeMark` false the whale path is not rendered (in the source the whale path sits inside the `includeMark ? … : null` branch).
6. The badge rectangle's attributes are `x="129.348" y="5.5" width="52" height="14" rx="2"`.
7. The geometry of the two `clipPath`s is `23.16 × 17.0435` @ `translate(0.141602 3.52185)` and `46 × 14` @ `translate(132.348 5.5)`.
8. The clip ids are unique: derived from `useId()` (without React's native `:` character), so that ids do not repeat when several wordmarks are rendered on one page.
9. The badge letters' colour has exactly one control point, `--dsh-wordmark-badge-ink`, whose default is `var(--dsw-alias-label-primary-inverted)`.
10. The 9 lettering paths, the 1 whale path and the badge rectangle are `fill="currentColor"`; no hexadecimal colour literal (`#`), `rgb(` or `hsl(` appears in the source.
11. No non-token colour such as `fill="white"` appears on the clip `rect`.
12. The `<svg>`'s `fill` is `none`.
13. The component imports no runtime dependency other than `react` (only `forwardRef` / `useId`), including `@deepseek-ai/*`.
14. `.mark` declares `flex: none` and `vertical-align: middle`; `.badgeInk` declares `fill: var(--dsh-wordmark-badge-ink)`.
15. The types already `Omit` `width` / `height` / `title` / `children`, and pass-through attributes must not override these four.
16. The `d` of the 17 paths reads character for character the same as `icons/brand/wordmark.svg` (lengths 660 / 654 / 816 / 823 / 1173 / 827 / 820 / 45 / 97 / 3469 / 136 / 272 / 1023 / 190 / 188 / 1368 / 1370 in that order).

### Differences from icons/brand/wordmark.svg (corrections to material this repository already had)

The `d` data of `icons/brand/wordmark.svg` reads character for character the same as the official one, but two attributes disagree (that SVG file itself is outside the scope of this task's writing, and was left unchanged):

1. **The fill colour of the badge letters**: the material writes the 7 letter paths as `fill="currentColor"`. The badge rectangle is `currentColor` as well, so the letters and the background are the same colour → HARNESS is completely invisible. The official definition is `var(--dsw-alias-label-primary-inverted)`, and this component follows the official one.
2. **Two `clipPath`s missing**: the official `<defs>` holds `dsh-wordmark-whale-clip` (`23.16 × 17.0435` @ `translate(0.141602 3.52185)`) and `dsh-wordmark-badge-clip` (`46 × 14` @ `translate(132.348 5.5)`), which the material lacks, so the overflowing parts of the whale and the badge letters are never trimmed. This component adds them.

By comparison, `icons/brand/fish.svg` matches the official `FISH_LOGO_PATH` exactly (`FishMark` uses that path directly).

## demo

- `components/brand/Wordmark/demo.html`

## Real scenes (reconciled against docs/reference screenshots)

| Shot | Region | Context | Captured ink |
| --- | --- | --- | --- |
| `01-hero.png` | The brand row in the left sidebar | The fish mark + "deepseek" + an inverted "HARNESS" badge | **187 × 18 @ (16, 28)** |
| `06-plugins.png` | The brand row in the left sidebar | Same as above | Same as above |

Reconciliation conclusion: inside the 182 × 24 viewBox at `size = 24`, the ink spans roughly x 0.14–181.35 / y 3.52–20.56 (about 181 × 17); placed at `y = 24` it lands at y 27.5–44.6, matching the captured (28…45). The width difference 187 − 181 = 6px is on the order of antialiasing.

### Known deviations (added by the screenshot reconciliation)

- `探索未至之境` at the centre of the Hero in `01-hero.png` is **not** a Wordmark: the official BrandWordmark has only the `deepseek` + `HARNESS` set of paths (`WORDMARK_VIEWBOX.withMark = '0 0 182 24'`), so the Chinese tagline is the page's own text and the demo does not include it in this component.
- The screenshots only ever show the one sidebar form, `size = 24` with `includeMark = true`. `includeMark={false}` and `size` 32 / 48 are marked "not covered by the screenshots" in the demo.

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Brand asset material: `icons/brand/wordmark.svg`, `icons/brand/fish.svg`
- Related clauses: `spec/60-accessibility.md` (`AC-MF-08`, `AC-MF-09`, `AC-MF-14`)
