---
source: components/data-display/MiniBar/SPEC.md
source-sha256: fdb4101c1f6aff3c
translated-at: 2026-10-07
---
# MiniBar · SPEC

- id: mini-bar
- category: data-display
- source: `components/data-display/MiniBar/` (`index.tsx` / `mini-bar.module.css`)
- official-counterpart: none. MiniBar is not in the export list of the official `@deepseek-ai/dsh-client-ui-primitives/lib/index.js`; the geometry is anchored item by item to selectors the official UI already has (see below)
- human-doc: `README.md` (judgement and trade-offs; this file holds facts only)

## geometry-source

Read every row as "value ← filename selector".

| Value | Source |
| --- | --- |
| corner radius `border-radius: 999px` | `Tag.module.css` → `.tag` (capsule geometry) |
| transition `transition: width 120ms ease` | `Switch.module.css` → `.thumb` (`transition: transform 120ms ease`; duration and easing copied verbatim) |
| fill colour `var(--dsw-alias-state-business-primary)` (default) | the same batch of state-primary tokens that `Tag.module.css` → `.tag[data-tone='info']` uses (in Tag that tone is called `info`, in this component `business`); for the values see `website/css/dsh-tokens.css` |
| `success` / `warn` / `error` fill colours | the same batch of tokens as `Tag.module.css` → `.tag[data-tone='success'\|'warning'\|'danger']` (`--dsw-alias-state-{success,warn,error}-primary`; Tag writes warn as `warning`) |
| percentage text `font-size: 12px`, `line-height: 18px` | `Button.module.css` → `.sm` |
| percentage text colour `var(--dsw-alias-label-tertiary)` | `Menu.module.css` → `.label` (tertiary text colour) |
| dropping the transition under `prefers-reduced-motion: reduce` | the same approach as `Toast.module.css` (inside that media query it keeps only the fade-out) |

### Values proposed here (not official values)

- Bar height `8px`: the official UI has no bar chart to copy. 8px is a multiple of 4 (keeping the spacing and size grid consistent across the library), and it pairs with the 32px row height of a list row. The more common 6px is slimmer but is not a multiple of 4, so this repository does not use it; 4px is too thin on a light track and its corner radius is barely visible.
- The `gap: 8px` between the bar and the percentage: a multiple of 4, the same value as the gap between adjacent rows, so two components side by side do not end up with two sets of spacing.
- The track colour is `var(--dsw-alias-border-l1)` rather than `var(--dsw-alias-bg-module-platform)`: the former is a semi-transparent overlay colour (light `#0000000a`, dark `#ffffff0f`, see `website/css/dsh-tokens.css`) and adapts to any surface it sits on; the latter is an opaque, fixed surface colour (light `#f9fafb`, dark `#353638`, again in that file), and when it is set into a `--dsw-alias-bg-layer-2` card it reads as a grey that is "close to but not equal to" the card background, so the edges look dirty.
  **The cost has to be spelled out**: on a light `bg-layer-1` the track is only about `#f5f5f5`, very faint. MiniBar therefore does not treat "track visibility" as a carrier of information — the value is always carried by `aria-valuenow` / `aria-valuemax`; add `showPercent` when a visual reading is needed.
- `overflow: hidden` (track): the official CSS has no equivalent. The fill and the track both have a 999px corner radius, so under normal conditions nothing overflows; it is added so that, at very narrow widths, the fill's square corners do not show through when the browser clamps the radius.
- `font-variant-numeric: tabular-nums` (percentage): the official UI does not use this property; when several bars are stacked vertically, tabular figures keep the width of the percentage column from jittering.
- `aria-hidden="true"` on the visible percentage: under the ARIA spec the descendants of `role="progressbar"` are already presentational, and marking it explicitly here keeps a few screen reader implementations from announcing "82%" and `aria-valuenow` twice.
- Invariant: the root element is the one carrying `role="progressbar"`, `{...rest}` is spread first and the computed `aria-valuenow/min/max` are written after it, so those three values are always derived from `value`/`max` and can never be overridden by external props.

### Implementation notes

The implementation is original to this repository: the rules are organised with CSS variables plus a `data-tone` attribute (the way colours are chosen follows the official Tag), geometrically equivalent but not a copy of the official CSS.

## api

`MiniBarProps extends HTMLAttributes<HTMLDivElement>`, `forwardRef<HTMLDivElement, MiniBarProps>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | required | Current value; anything outside `[0, max]` is clamped, and a non-finite number counts as 0 |
| `max` | `number` | `100` | Full value; anything `<= 0` is treated as 0, so the progress stays at 0 |
| `showPercent` | `boolean` | `false` | Show percentage text on the right (rounded with `Math.round`) |
| `tone` | `'business' \| 'success' \| 'warn' \| 'error'` | `'business'` | Semantic colour of the fill |
| `label` | `string` | none | Accessible name; when it is not passed and an `aria-label` is passed from outside, the latter is used |
| `aria-label` | `string` | none | Same as `label`, with `label` taking precedence |
| `className` | `string` | none | Joined to the internal class names |
| Everything else | `HTMLAttributes<HTMLDivElement>` | — | Passed through to the root element unchanged (`aria-valuenow/min/max` are overridden by the component) |
| `ref` | `Ref<HTMLDivElement>` | none | Passed through to the root element |

`MiniBarTone` is an exported type alias. The clamping rules: `safeMax = Number.isFinite(max) && max > 0 ? max : 0`; `safeValue = Number.isFinite(value) ? value : 0`; `clamped = safeMax > 0 ? Math.min(Math.max(safeValue, 0), safeMax) : 0`.

## states

| State | Trigger | Appearance |
| --- | --- | --- |
| Default | — | Track `flex: 1`, fill width `percent%`, root element `role="progressbar"` |
| Percentage shown | `showPercent === true` | Rounded percentage text rendered on the right, with `aria-hidden="true"` |
| Percentage not shown | `showPercent === false` (default) | Only the track and the fill are rendered |
| Tone | `tone` | `business` (default) / `success` / `warn` / `error` each override the fill background |
| Value update | `value` changes | The fill width runs a 120ms ease transition |
| Reduced motion | `prefers-reduced-motion: reduce` | `transition: none` on `.fill` |
| Degenerate input | `max <= 0`, or a non-finite number | `aria-valuemax` is 0 and the progress stays at 0 (`percent = 0`) |
| Out-of-range value | `value` outside `[0, max]` | The clamped value is used in the calculation, `aria-valuenow` takes the clamped value too, and no illegal value ever appears |
| No name | neither `label` nor `aria-label` passed | The root element has no `aria-label` (a screen reader is left with "progress bar"), and filling that in is the caller's responsibility |
| Interactive states | — | This component has no hover / active / focus / disabled; it cannot take focus and does not enter the tab order |

## tokens

DSH semantic tokens (all of them can be looked up in `data/tokens.json`):

- `--dsw-alias-border-l1` — track background (the token this repository settled on)
- `--dsw-alias-state-business-primary` — default fill colour
- `--dsw-alias-state-success-primary` / `--dsw-alias-state-warn-primary` / `--dsw-alias-state-error-primary` — semantic fill colours
- `--dsw-alias-label-tertiary` — percentage text colour

Component-level CSS variables (internal to this repository, not DSH tokens; defined on `.bar`):

- `--dsh-bar-height` = `8px`
- `--dsh-bar-gap` = `8px`

## a11y

- An accessible name is mandatory: `label="缓存命中率"`, or pass `aria-label` from outside. With no name a screen reader announces only "progress bar 82%", and the user cannot tell which metric this is.
- `role="progressbar"` together with `aria-valuemin` (fixed at 0) / `aria-valuemax` / `aria-valuenow` — none of the three may be omitted: a screen reader works out the percentage from `valuenow / valuemax`, and given `valuenow` alone it reads the value as a 0–100 scale.
- `value` is clamped before it is written into `aria-valuenow`, so no illegal state where `aria-valuenow` exceeds `aria-valuemax` can appear.
- When `max <= 0`, `aria-valuemax` is 0; this is degenerate input (a ratio whose denominator is 0, for example). At that point the caller should switch to `aria-valuetext="暂无数据"`, and must not display "cannot be worked out" as "0%".
- The visible text of `showPercent` is marked `aria-hidden` and must not be treated as the only source of the value; the value belongs either in `aria-*` or in a separate piece of visible text.
- `tone` changes colour only, and colour is not the only cue (`AC-MF-07`): if `warn` / `error` expresses information that has to be known, such as "over the limit", write it in the text beside the bar as well.
- The bar is a display-only element: it cannot take focus and cannot be interacted with; keep the rest of the text in the row in normal DOM order, and do not shuffle it with CSS `order`.

## checks

Machine-checkable binary constraints (decidable as true / false, and directly expressible as lint rules).

1. The root element carries `role="progressbar"` and outputs all three of `aria-valuemin` / `aria-valuemax` / `aria-valuenow`.
2. At least one of `label` and `aria-label` is non-empty; otherwise it is a violation (a screen reader gets no accessible name).
3. The `{...rest}` spread sits before `role` and the three `aria-value*`: an externally passed `aria-valuenow` / `aria-valuemax` / `aria-valuemin` must not override the values the component computes.
4. The value of `aria-valuenow` has to fall within the closed interval `[0, aria-valuemax]`.
5. When `max <= 0` or is a non-finite number, `aria-valuemax` outputs 0 and the fill width is 0 (never `NaN` or negative).
6. When `showPercent === true`, the percentage text node carries `aria-hidden="true"`.
7. The fill element declares `transition: width 120ms ease`, and the stylesheet contains a `@media (prefers-reduced-motion: reduce)` branch (`MO-RC-09`, corresponding to `A34` in `spec/70-checklist.md`).
8. The `border-radius` of both the track and the fill is `999px`, and the track declares `overflow: hidden`.
9. The percentage text declares `font-variant-numeric: tabular-nums` (`§ proposed values`).
10. `tone` affects `background` only and must not change height, width or corner radius.
11. The bar is display-only: the source must contain no `tabIndex`, `onClick`, `onKeyDown`.
12. A usage site must not let colour become the only cue: when `tone` is `warn` / `error`, readable text explaining that state must sit next to it (human review, `AC-MF-07`, corresponding to `A46` in `spec/70-checklist.md`).

## demo

- `components/data-display/MiniBar/demo.html`

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist entries: `spec/70-checklist.md` (`A34`, `A46`)
- Accessibility clauses: `spec/60-accessibility.md` (`AC-MF-07`)
- Motion clauses: `spec/40-motion.md` (`MO-RC-09`)
