---
source: components/controls/Pill/SPEC.md
source-sha256: 99419c2f4f49866e
translated-at: 2026-10-05
---
# Pill · SPEC

- id: pill
- category: controls
- source: `components/controls/Pill/` (`index.tsx` / `pill.module.css`)
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/Pill.module.css` and `function Pill` in `lib/index.js`
- human-doc: `README.md` (the judgement and the trade-offs; this file holds facts only)

## geometry-source

Each value is read from the official `Pill.module.css`, one by one; the notation is "value ← file name selector".

| Value | Source |
| --- | --- |
| `height: 24px` / `padding: 0 8px` / `gap: 4px` / `border-radius: 12px` / `font-size: 12px` / `line-height: 18px` | `Pill.module.css` → `.pill` |
| `border: none` / `color: var(--dsw-alias-label-secondary)` / `background: var(--dsw-alias-bg-layer-2)` | `Pill.module.css` → `.pill` |
| `cursor: pointer` | `Pill.module.css` → `.interactive` |
| `background: var(--dsw-alias-interactive-bg-hover)` | `Pill.module.css` → `.interactive:hover` |
| `color: var(--dsw-alias-label-primary)` / `background: var(--dsw-alias-button-ghost-active-fill)` / `box-shadow: inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)` | `Pill.module.css` → `.active` |
| `display: inline-flex` / `align-items: center` | `Pill.module.css` → `.pill` |
| The shape branches: when `onClick` is present it renders `<button type="button">`, otherwise it renders `<span>`; `active` defaults to `false` | `lib/index.js` → `function Pill({ active = false, className, children, onClick, ...rest })` |

### Values proposed here (not official values)

- `box-sizing: border-box` on `.pill`: the official file has no explicit declaration for it. A Pill has no border (only a `box-shadow` inset stroke), so this changes none of the official geometry; it only stops a caller from computing the size wrongly when the `*` selector is missing.
- `.interactive:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }`: the official `Pill.module.css` has no focus style. A clickable Pill is a real button, and a keyboard user who tabs to it has to see where they landed. The pattern mirrors the official `Switch.module.css` `:focus-visible` rule, so the whole library stays consistent. Basis: `AC-MF-10` / `AC-MF-11` in `spec/60-accessibility.md`.

### Decisions made here (rewriting official behaviour)

- The official `function Pill` appends `className` to the class list unconditionally; this repository appends an external `className` only in the `onClick` branch, so the `className` of the static `<span>` branch is dropped. That is the behaviour of the existing implementation; it differs from the official one, and it is recorded here so that nobody mistakes it for a deliberate omission.

### Implementation notes

- The implementation here is original: the geometry is carried by component-level CSS variables on `.pill` (`--dsh-pill-height` / `--dsh-pill-pad-x` / `--dsh-pill-radius` / `--dsh-pill-gap` / `--dsh-pill-font-size` / `--dsh-pill-line-height`), and the state is switched by the two classes `.active` / `.interactive`. The geometry equals the official one, but it is not a copy of the official CSS.
- `--dsh-pill-*` are internal variables of this repository, not DSH tokens.

## api

`PillProps` is a discriminated union whose discriminant key is whether `onClick` is present.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `active` | `boolean` | `false` | Selected state, controlled; the component only paints the state, it does not hold it |
| `children` | `ReactNode` | none | The capsule content, usually short text or "icon + short text" |
| `className` | `string` | none | Class appended to the root node, for external layout positioning |
| `onClick` | `ButtonHTMLAttributes<HTMLButtonElement>['onClick']` | none | Its presence renders `<button type="button">`; without it a `<span>` renders, and the type level forbids passing it |
| Everything else (interactive branch) | `ButtonHTMLAttributes<HTMLButtonElement>` | — | Every native `button` attribute passes through |
| Everything else (static branch) | `HTMLAttributes<HTMLSpanElement>` | — | Every native `span` attribute passes through |
| `ref` | `Ref<HTMLButtonElement \| HTMLSpanElement>` | none | Passed through to the root node according to the branch |

`PillBaseProps` / `InteractivePillProps` / `StaticPillProps` are exported type aliases.

## states

| State | Trigger | Display |
| --- | --- | --- |
| Default (not selected) | `.pill` | `border: none`; `background: var(--dsw-alias-bg-layer-2)`; `color: var(--dsw-alias-label-secondary)` |
| hover | `.interactive:hover` | `background: var(--dsw-alias-interactive-bg-hover)` |
| active (selected) | `.active` | The text colour steps up to `--dsw-alias-label-primary`; the fill switches to `--dsw-alias-button-ghost-active-fill`; `inset 0 0 0 1px --dsw-alias-button-ghost-active-border` is layered on |
| Keyboard focus | `.interactive:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px` (proposed here) |
| Static | `onClick` not passed | Renders `<span>`, with no `cursor: pointer`, no hover, no focus state |
| Pressed | none | Neither the official CSS nor the implementation defines `:active`; this state is missing from the five states of `CT-MF-07` |

## tokens

DSH semantic tokens (all of them can be looked up in `data/tokens.json`):

- `--dsw-alias-bg-layer-2` — the unselected fill
- `--dsw-alias-label-secondary` — the unselected text colour
- `--dsw-alias-interactive-bg-hover` — the hover fill of a clickable capsule
- `--dsw-alias-label-primary` — the selected text colour
- `--dsw-alias-button-ghost-active-fill` — the selected fill
- `--dsw-alias-button-ghost-active-border` — the selected inset stroke colour
- `--dsw-alias-brand-primary` — the focus ring colour (proposed here)

Component-level CSS variables (internal to this repository, not DSH tokens):

- `--dsh-pill-height` (`24px`)
- `--dsh-pill-pad-x` (`8px`)
- `--dsh-pill-radius` (`12px`)
- `--dsh-pill-gap` (`4px`)
- `--dsh-pill-font-size` (`12px`)
- `--dsh-pill-line-height` (`18px`)

## a11y

- The clickable form is a native `<button type="button">`: Enter / Space trigger it natively, so you do not bind `keydown` yourself; the default `type` is `button`, so it will not submit unexpectedly inside a `<form>`.
- The static form is a `<span>`, neither a button nor a link; do not hang `role="button"` on it — when a click is needed, switch to the clickable form instead.
- `active` changes only the colours and the inset stroke, so assistive technology cannot read it. When it is used as a radio group, the caller has to supply `role="radiogroup"` + `role="radio"` on each capsule + `aria-checked` (or `aria-pressed`).
- A capsule with an icon and no text must have an accessible name, otherwise a screen reader reads out an empty name.
- The focus ring uses `outline` rather than `box-shadow`, so a parent's `overflow: hidden` cannot clip it.
- Hit area: 24px tall, below the 28×28 regular-control target of `AC-MF-01` and below the 20×20 minimum hit area; the vertical hit area depends on the caller adding padding or extending the hotspot (see item 5 under `checks`).
- Contrast: unselected pairs `label-secondary` with `bg-layer-2`, selected pairs `label-primary` with `button-ghost-active-fill`; both sets follow the theme, so do not override the colours yourself (`AC-MF-08`).
- Selected and unselected differ in shape through fill + inset stroke, so they stay distinguishable in greyscale (`AC-MF-07`).

## checks

Machine-checkable binary constraints (true / false settles each one; each can become a lint rule directly).

1. When `active` is true, all three hold at once: text colour `--dsw-alias-label-primary`, fill `--dsw-alias-button-ghost-active-fill`, `inset 0 0 0 1px --dsw-alias-button-ghost-active-border`.
2. With `onClick` passed, the root node is `<button>` with `type="button"`; without it the root is `<span>` and carries no `role`, `tabIndex` or `onKeyDown` (matching `CT-MF-11`: do not pass a span off as a button).
3. When `onClick` is not passed, `onClick` may be `undefined`; once it is passed, its type is non-nullable (both branches of the discriminated union hold).
4. A `:focus-visible` focus style exists, and it is not removed with `outline: none` and left unreplaced (`AC-MF-10`).
5. The focus ring spec is 2px solid + `--dsw-alias-brand-primary` + a 2px outer offset (`AC-MF-11`).
6. A clickable capsule with only an icon (no text child) has an accessible name.
7. The computed height of `.pill` on a clickable capsule reuses the official geometry per `CT-MF-01`, and must not be overridden from outside to 36px or 28px.
8. The source contains no hard-coded colour values (`TK-MF-01`) and no colour-value declarations beyond a literal `font-size`.
9. A static capsule must not have a click bound to it (the sibling constraint of `CT-MF-04`: a marker is not a button).
10. In one group of mutually exclusive capsules, at most one has `active` true (human review + a host state check).

## demo

- `components/controls/Pill/demo.html`

## Real captures (reconciled against the docs/reference screenshots)

| Image | Area | Context | As captured |
| --- | --- | --- | --- |
| `07-composer.png` | Tool row at the bottom of the composer card | `完全权限` (shield icon + label + dropdown arrow) | 24 tall |
| `07-composer.png` | Tool row at the bottom of the composer card | `DeepSeek V4.1 Flash High` + dropdown arrow | 24 tall |
| `01-hero.png` | Composer card on the new-session page | The same two capsules as above | 24 tall |

### Known deviations (added while reconciling the screenshots)

- Both capsules sit on a **white card**, and in the light theme `--dsw-alias-bg-layer-2` is `#fff` — so the screenshots show **no fill boundary**, and all you can measure is the ink of the content (icon 16 / label / arrow). In other words: you cannot tell from "is there a background fill" whether a page has a Pill.
- The three-way `外观` choice (`浅色` / `深色` / `跟随系统`) in the clean Settings capture is a row of side-by-side choice tiles, not a Pill, and the SegmentedControl in a mixed-plugin screenshot should not stand in for it either. It expresses a mutually exclusive appearance preference, and it is documented separately as a set of choice tiles. `Pill` has nothing to do with it.
- The `实验性` after each plugin name in `06-plugins.png` is a **Tag** (`tone=info`), not a Pill either — the two differ completely in height (24 vs 19) and fill colour.
- No capsule in the screenshots is in the selected state, so the look of `.active` (`ghost-active-fill` + `inset 0 0 0 1px`) has no capture behind it.

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist entries: `spec/70-checklist.md` (`A17`, `A18`, `A43`, `A46`, `A47`, `A48`, `A49`)
