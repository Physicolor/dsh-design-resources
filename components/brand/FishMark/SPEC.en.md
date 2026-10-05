---
source: components/brand/FishMark/SPEC.md
source-sha256: 86c302fb53824d62
translated-at: 2026-10-05
---
# FishMark · SPEC

- id: fishmark
- category: brand
- source: `components/brand/FishMark/` (`index.tsx` / `fishmark.module.css`)
- official-counterpart: the `//#region lib/types/FishLogo.js` block of `@deepseek-ai/dsh-client-ui-primitives/lib/index.js` (the official component has **no** companion `.module.css`; the geometry has a single source, in the JS file)
- human-doc: `README.md` (judgement and trade-offs; this file holds facts only)

## geometry-source

Values are read one by one from the official `lib/index.js`, in the form "value ← filename identifier".

| Value | Source |
| --- | --- |
| `viewBox "0 0 23.16 17.04"` | ← `lib/index.js` `const FISH_LOGO_VIEWBOX = { width: 23.16, height: 17.04 }` (the comment on the line above reads: Native viewBox of FISH_LOGO_PATH) |
| default width `24` | ← `lib/index.js` `function FishLogo({ size = 24, className })` |
| `height = size * 17.04 / 23.16` (24 → 17.6580310880829) | ← `lib/index.js`, `height: size * FISH_LOGO_VIEWBOX.height / FISH_LOGO_VIEWBOX.width` in `FishLogo` |
| the path `d` (3448 characters) | ← `lib/index.js` `const FISH_LOGO_PATH`; character for character the same as the `path@d` of `icons/brand/fish.svg` (checked: the first 12 characters of the sha256 match on both sides at `5bee701f3922`, and both lengths are 3448) |
| svg `fill="none"`, path `fill="currentColor"` | ← `jsx("svg", { fill: "none", … })` and `jsx("path", { fill: "currentColor" })` in `FishLogo` of `lib/index.js` |
| `aria-hidden="true"` (the default form when no `title` is passed) | ← `"aria-hidden": "true"` in `FishLogo` of `lib/index.js` |

### Values proposed by this repository (not official values, with no corresponding official declaration)

- `.mark { flex: none }`: the official `FishLogo` accepts only `size` / `className`, with no default class styling of any kind. When a brand mark is put in a flex row (a brand bar holding, say, a fish mark plus a wordmark), it should not be squeezed into a non-proportional size.
- `.mark { vertical-align: middle }`: a `<svg>` aligns to the baseline by default and so sits visually low next to text in the same line; centring it lines it up with the middle of that text.
- the `title` prop (`role="img"` + `<title>`): the official component is always `aria-hidden="true"`, so the fish mark cannot be read out as a standalone graphic; in a brand area the fish mark is often the only brand information, so an optional title is provided. With no title passed the behaviour matches the official one exactly.
- forwarding `SVGProps` (`style`, `aria-*`, events and the like): the official component accepts only `size` / `className`; this repository opens it up so that the mark can take part in layout and in tests.

### Decisions taken by this repository (rewriting official behaviour)

- the size is not rounded: `height` follows the official formula and keeps its decimals (24 → 17.6580310880829), deliberately without rounding to whole pixels, so the graphic is not squashed. This choice of how to implement the official formula is this repository's; the values themselves come from the official source.
- when a `title` is present the component renders `role="img"` + `<title>` and **removes** `aria-hidden` (officially it is always `aria-hidden="true"`). This is a deliberate rewrite of the official accessibility behaviour by this repository; without a `title` the behaviour matches the official one.

The implementation is original to this repository: the path data is taken character for character from the official exported constant, the size is rewritten from the official formula, and there is no official CSS to copy.

## api

`FishMarkProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'width' | 'height' | 'title' | 'children'>`, `forwardRef<SVGSVGElement, FishMarkProps>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `number` | `24` | Width (px). Height = `size × 17.04 / 23.16`, keeping decimals without rounding |
| `title` | `string` | none | When passed, renders `role="img"` + `<title>`; when not passed, `aria-hidden="true"` |
| `className` | `string` | none | Appended after `.mark` |
| everything else | `Omit<ComponentPropsWithoutRef<'svg'>, 'width' \| 'height' \| 'title' \| 'children'>` | — | Forwarded to the `<svg>` unchanged; `width` / `height` / `title` / `children` are already excluded at the type level |
| `ref` | `Ref<SVGSVGElement>` | none | Forwarded to the `<svg>` |

Size reference (heights converted with the official ratio):

| Width | Height |
| --- | --- |
| `24px` (default) | `17.6580310880829px` |
| `32px` | `23.5440414507772px` |
| `48px` | `35.3160621761658px` |

## states

The component is a static graphic with no interactive state; the table below covers every render branch.

| State | Trigger | Behaviour |
| --- | --- | --- |
| Decorative (default) | no `title` passed (or an empty string) | `aria-hidden="true"`, no `role` output |
| Named | `title` non-empty | `role="img"` + `<title>{title}</title>`, no `aria-hidden` output |
| Size | `size` | `width = size`, `height = size × 17.04 / 23.16` |
| Colour | the outer `color` | the path's `fill="currentColor"`, following the parent's text colour |
| hover / focus / disabled | — | the component defines no interactive styling |

## tokens

This component uses no `--dsw-*` / `--dsh-*` variables:

- colour has a single control point, `fill="currentColor"`, and its value is determined by the caller's outer `color` (a semantic token such as `var(--dsw-alias-label-primary)` is recommended).
- the size lives in the `<svg>`'s `width` / `height` attributes and does not go through CSS.

Component-level classes (internal to this repository, not DSH tokens):

- `.mark` (`flex: none`, `vertical-align: middle`)

## a11y

- `aria-hidden="true"` by default — the fish mark is decorative by default and does not pollute the reading order.
- pass a `title` only when the fish mark is the **only** brand information in that area; it renders as `<title>` and is read out as the graphic's name.
- do not stack an `aria-label` on top of the decorative use: `aria-hidden="true"` together with `aria-label` contradicts itself.
- the colour comes from the outer `color`; use semantic tokens (`var(--dsw-alias-label-primary)` and the like) and do not hard-code a hex colour, so that the light and dark themes follow automatically.
- scale through `size`, not through CSS `transform: scale()`: a non-integer scale makes fine strokes look blurry.
- if the fish mark's clickable area comes from a wrapping parent element, make sure that element really is a focusable control (`<button>` / `<a>`) rather than hanging an `onClick` on the `svg` and leaving it at that (`AC-MF-09`, `AC-MF-13`).
- a purely decorative graphic must carry `aria-hidden` (`AC-MF-14`); when it is read out as a graphic it must be given an accessible name (`<title>`).

## checks

Binary constraints a machine can check (decidable as true / false, and directly expressible as lint rules).

1. When no `title` is passed, `aria-hidden="true"` is present on the `<svg>` and **no** `role` is output.
2. When no `title` is passed, no `aria-label` is present (it is mutually exclusive with `aria-hidden="true"`).
3. When a `title` is passed, `role="img"` and `<title>` are output, and `aria-hidden="true"` is **not** output.
4. `viewBox` is exactly `0 0 23.16 17.04` (matching the official `FISH_LOGO_VIEWBOX`).
5. `width` equals `size` and `height` equals `size × 17.04 / 23.16`, with no rounding.
6. `FISH_LOGO_PATH` is character for character the same as the official constant (checked by: the first 12 characters of the sha256 of the `path@d` of `icons/brand/fish.svg` and of the constant in this file match at `5bee701f3922`, and both lengths are 3448).
7. Colour has a single control point: the path is `fill="currentColor"`, and no hex colour literal (`#`), `rgb(` or `hsl(` appears in the source.
8. The `<svg>`'s `fill` is `none`.
9. The component imports no runtime dependency other than `react` (including `@deepseek-ai/*`).
10. No interaction handler such as `onClick` / `onKeyDown` is bound on the `<svg>` (the clickable area is carried by a parent control, `AC-MF-09`).
11. `.mark` declares `flex: none` and `vertical-align: middle`.
12. `width` / `height` / `title` / `children` are already `Omit`ted from the type, and a forwarded prop must not override those four.
13. `fishmark.module.css` contains no geometry value at all (the size goes through the svg attributes only), and no colour literal either.

## demo

- `components/brand/FishMark/demo.html`

## Real scenes (reconciled against docs/reference screenshots)

| Shot | Region | Context | Captured ink |
| --- | --- | --- | --- |
| `01-hero.png` | the brand row in the left sidebar | the fish mark at the leftmost edge of the brand lockup | **24 × 18 @ (16, 27)** |
| `06-plugins.png` | the brand row in the left sidebar | same as above | 24 × 18 @ (16, 27) |
| `01-hero.png` | the centred brand in the hero | the fish mark + `探索未至之境` | **33 × 24** |

Reconciliation conclusion: the one in the sidebar, captured at 24 × 18 @ (16, 27), matches both the "brand icon 24 × 18 @ (16, 27)" recorded in `docs/reference/README.md` and `_2H3hWW_brandMark` in `geometry.json` exactly.

### Known deviations (added by the screenshot reconciliation)

- In the bottom right of `06-plugins.png`, the floating round button holds a **blue whale icon decorated with little stars**, which does not match the official FishMark's **solid silhouette** (`currentColor`, no decoration); it is **not counted as a use case of this component** and is not included in the demo.
- The fish mark's natural ratio is `23.16 : 17.04` (≈ 1.359). The sidebar capture 24 × 18 has a ratio of 1.333 and the hero capture 33 × 24 has a ratio of 1.375; both fall within the 1px quantisation error, so no correction is needed.

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Brand asset material: `icons/brand/fish.svg`
- Related clauses: `spec/60-accessibility.md` (`AC-MF-09`, `AC-MF-13`, `AC-MF-14`)
