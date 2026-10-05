---
source: components/feedback/InlineNotice/SPEC.md
source-sha256: 218bdb8da1e067c6
translated-at: 2026-10-05
---
# InlineNotice · SPEC

- id: inline-notice
- category: feedback
- source: `components/feedback/InlineNotice/` (`index.tsx` / `inline-notice.module.css`)
- official-counterpart: **The product has a matching interface**: the client really mounts the official `ConnectionIndicator` (disconnected / reconnect notice) (`state` / `disconnectedLabel` / `onReconnect`). The measured single-line geometry is `height: 28px` / `padding: 0 8px` / `border-radius: var(--dsw-radius-sm)` (8px) / `font 12px 500 / 18px` / `display: inline-grid` + `14px max-content` + `column-gap: 4px`, taken from `@deepseek-ai/dsh-client-ui-primitives/lib/ConnectionIndicator.module.css` inside the product's `app.asar` (reconciled 2026-10-02, replacing the 32px / 0 10px captured by an earlier version). warn / success use the tone's three-tier ground, and the derivation borrows the `color-mix` trick from `Tag.module.css`; the info / error tones have no product counterpart.
- Differences from this component (deliberate, not a copy error): the official `ConnectionIndicator` is a connection indicator with a 14px icon plus a run of status text, measured at **28 high / padding 0 8px** for a single line; this component is a general-purpose notice bar and takes **32 high / padding 0 10px** for a single line (the value proposed here, since a 20×20 dismiss control has to fit inside it; see the derivation below). To sit next to a product-native notice, switch to the official 28 / 0 8
- human-doc: `README.md` (judgement calls and tradeoffs; this file holds facts only)

## geometry-source

Read as "value ← file name selector": the left column is what sits to the left of the arrow, the right column is "file name + selector".
The official sources live in `@deepseek-ai/dsh-client-ui-primitives/lib/`.

| Value | Source |
| --- | --- |
| `height: 28px` / `padding: 0 8px` / `border-radius: 8px` | `ConnectionIndicator.module.css` → `.indicator` |
| `box-sizing: border-box` / `border: none` | `ConnectionIndicator.module.css` → `.indicator` |
| `font-size: 12px` / `font-weight: 500` / `line-height: 18px` / `white-space: nowrap` | `ConnectionIndicator.module.css` → `.indicator` |
| `display: inline-grid` / `grid-template-columns: 14px max-content` / `column-gap: 4px` / `align-items: center` | `ConnectionIndicator.module.css` → `.indicator` |
| `transition: background-color 160ms ease-out, color 160ms ease-out` | `ConnectionIndicator.module.css` → `.indicator` |
| icon container `14×14` / `display: grid` / `place-items: center` | `ConnectionIndicator.module.css` → `.icon` |
| `warn` = `background: var(--dsw-alias-state-warn-tertiary)` + `color: var(--dsw-alias-state-warn-label)` + `cursor: pointer` | `ConnectionIndicator.module.css` → `.warning` |
| on press `background: color-mix(in srgb, var(--dsw-alias-state-warn-tertiary), var(--dsw-alias-state-warn-primary) 10%)` | `ConnectionIndicator.module.css` → `.warning:active` |
| `success` = `background: var(--dsw-alias-state-success-tertiary)` + `color: var(--dsw-alias-state-success-primary)` | `ConnectionIndicator.module.css` → `.success` |
| focus ring `outline: 2px solid` in the tone colour + `outline-offset: 2px` | `ConnectionIndicator.module.css` → `.warning:focus-visible` (this repository swaps the colour for a per-tone variable) |
| `gap: 4px` (the spacing value this repository's flex form carries over) | `ConnectionIndicator.module.css` → `.indicator`'s `column-gap` |
| `color-mix(in srgb, primary colour 10%, transparent)` derived ground | `Tag.module.css` → `.tag`'s per-tone branches (that file uses the same trick for success / info / danger, and 12% for warning) |

The official source writes `flex: none` on `.indicator`; this repository's root node is an inline flex container and needs no shrink protection, so it is rewritten onto `.icon`.

### Decisions in this repository (rewriting official behaviour)

- **Layout uses flex, not the official two-column grid**: the official `grid-template-columns: 14px max-content` exists so the two text runs before and after hover keep each other's width stable and nothing jitters — a need only ConnectionIndicator has. A general notice bar's text length varies with content anyway, so `inline-flex + gap: 4px` (still the official 4px gap value) is equivalent and simpler. No spare empty column appears on the right when the dismiss button shows up either.
- **With `onDismiss` the root node becomes a `<button>` and the whole bar is clickable to dismiss**: the official ConnectionIndicator's warning branch is also a whole-bar `<button>` (click to reconnect), so the same interaction model carries over here.
- **The dismiss control is a `role="button"` + `tabIndex=0` `<span>` rather than a `<button>`**: when `onDismiss` is passed the root node is itself a `<button>`, and HTML does not allow a button inside a button. The Enter / Space keys are handled by the component itself (`preventDefault` + `stopPropagation`, so nothing fires twice).

### Proposed values in this repository (not official numbers)

- **The `info` / `error` grounds**: the official set has no complete "three-tier ground + primary colour" combination to use —
  `--dsw-alias-state-success-tertiary` / `--dsw-alias-state-warn-tertiary` both exist, and `--dsw-alias-state-business-tertiary` (= `--dsw-static-deepseek-100`) exists too, but in the dark theme it is defined as a "dark ground" such as `--dsw-static-deepseek-800`, so using it directly as a light notice bar's ground looks too dark in the light theme; `--dsw-alias-state-error` has no tertiary variant at all, only `primary` / `secondary`.
  To cover both themes with one rule, this repository adds no new token and instead derives the ground from the matching primary colour with the trick the official `Tag.module.css` already uses, `color-mix(in srgb, primary colour 10%, transparent)`.
- **The multiline form `.multiline`**: the official ConnectionIndicator only ships a single-line 28px form. Height becomes `auto` + `min-height: 32px`, and the top and bottom padding is `6px`.
  Where 6px comes from: centring an 18px line height in 32px leaves `(32 - 18) / 2 = 7px` above and below; spacing we invent ourselves follows this repository's rule of multiples of 4, and 4px is tighter than the original form, so 6px is the value "between 4 and 7 that does not look loose", while still letting the single-line total come back to around 32px (6 + 18 + 6 = 30 < 32, with `min-height` as the backstop that brings it up to 32).
- **The icon's `margin-top: 2px` in the multiline form**: the text's first line has a line height of 18px and the icon is 14px, so the centring difference is `(18 - 14) / 2 = 2px`. This is derived from the official numbers, not a newly invented size.
- **The dismiss control `.dismiss`**: the official component has no dismiss state. A 20×20 hit area, 6px corner radius, `margin: 0 -4px 0 2px` (the negative right margin cancels part of the 10px padding so the icon still reads as sitting against the right edge), default `opacity: 0.75`, hover ground `color-mix(in srgb, currentColor 12%, transparent)`.
  The 20px hit area meets `AC-MF-01`'s 20×20 minimum, but falls short of the same criterion's "28×28 regular control target"; the notice bar itself is only 32px high, and that is a deliberate tradeoff.

### Implementation notes

- This repository's implementation is original: the geometry is carried by `--dsh-notice-*` variables, and the four tone classes override one shared set of variables.
- Each colour token was reconciled against `website/css/dsh-tokens.css` and exists there (both the light and the dark set): `--dsw-alias-state-business-primary` / `--dsw-alias-state-success-primary` / `--dsw-alias-state-success-tertiary` / `--dsw-alias-state-warn-label` / `--dsw-alias-state-warn-primary` / `--dsw-alias-state-warn-tertiary` / `--dsw-alias-state-error-primary`.

## api

`InlineNoticeProps extends HTMLAttributes<HTMLElement>`, `forwardRef<HTMLElement, InlineNoticeProps>`. Exports the type `InlineNoticeTone`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tone` | `'info' \| 'success' \| 'warn' \| 'error'` | `'info'` | Tone, decides the ground and the text / icon colour |
| `icon` | `ReactNode` | none | Leading status icon, placed in a 14×14 container, coloured to follow the tone's text colour |
| `children` | `ReactNode` | none | The text |
| `multiline` | `boolean` | `false` | Multiline form: height `auto` + `min-height: 32px`, top and bottom padding 6px each |
| `onDismiss` | `() => void` | none | Passing it renders the dismiss control on the right and turns the root node into a `<button type="button">` |
| `dismissLabel` | `string` | `'关闭提示'` | Accessible name of the dismiss control |
| `className` | `string` | none | Appended after the root node's class names |
| the rest | `HTMLAttributes<HTMLElement>` | — | `role` / `onClick` / `aria-*` and so on pass straight through to the root node |
| `ref` | `Ref<HTMLElement>` | none | Passes through to the root node |

## states

| State | Trigger | Behaviour |
| --- | --- | --- |
| Default (info) | `tone` omitted | Ground `var(--dsw-alias-bg-module-platform)`; text `var(--dsw-alias-label-secondary)`; accent `var(--dsw-alias-state-business-primary)` |
| `info` | `tone="info"` | Ground `color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent)`; text and accent `--dsw-alias-state-business-primary` (proposed value) |
| `success` | `tone="success"` | Ground `--dsw-alias-state-success-tertiary`; text and accent `--dsw-alias-state-success-primary` |
| `warn` | `tone="warn"` | Ground `--dsw-alias-state-warn-tertiary`; text and accent `--dsw-alias-state-warn-label` |
| `error` | `tone="error"` | Ground `color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent)`; text and accent `--dsw-alias-state-error-primary` (proposed value) |
| Single line | `multiline` false | `white-space: nowrap`; `height: 32px`; `align-items: center` |
| Multiline | `multiline` true | `white-space: normal`; `height: auto` + `min-height: 32px`; `align-items: flex-start`; `padding: 6px 10px` |
| Multiline icon | `.multiline` with `icon` passed | Icon `margin-top: 2px` |
| Dismissible | `onDismiss` passed | Root node is `<button type="button">`, `cursor: pointer`; the dismiss control renders |
| Press | `.actionable:active` | Ground `color-mix(in srgb, var(--dsh-notice-bg), var(--dsh-notice-accent) 10%)` |
| Dismiss control default | `.dismiss` | `20×20`, `6px` corner radius, `margin: 0 -4px 0 2px`, `opacity: 0.75` |
| Dismiss control hover | `.dismiss:hover` | Ground `color-mix(in srgb, currentColor 12%, transparent)`, `opacity: 1` |
| Dismiss control keyboard focus | `.dismiss:focus-visible` | `outline: 2px solid currentColor` + `outline-offset: 1px` + `opacity: 1` |
| Root button hover / focus | `.actionable:hover .dismiss` / `.actionable:focus-visible .dismiss` | Dismiss control `opacity: 1` |
| Keyboard focus | `.notice:focus-visible` | `outline: 2px solid var(--dsh-notice-accent)` + `outline-offset: 2px` |
| Reduced motion | `prefers-reduced-motion: reduce` | `transition: none` |
| No `icon` | `icon === undefined` | The icon container does not render |

## tokens

DSH semantic tokens (all of them can be looked up in `data/tokens.json`):

- `--dsw-alias-label-secondary` — default text colour
- `--dsw-alias-bg-module-platform` — default ground
- `--dsw-alias-state-business-primary` — the `info` accent and the source of its derived ground
- `--dsw-alias-state-success-tertiary` / `--dsw-alias-state-success-primary` — `success` ground / text
- `--dsw-alias-state-warn-tertiary` / `--dsw-alias-state-warn-label` — `warn` ground / text
- `--dsw-alias-state-error-primary` — the `error` accent and the source of its derived ground

Component-level CSS variables (internal to this repository, not DSH tokens):

- `--dsh-notice-text` (default `--dsw-alias-label-secondary`; each of the four tone classes overrides it once)
- `--dsh-notice-bg` (default `--dsw-alias-bg-module-platform`; each of the four tone classes overrides it once)
- `--dsh-notice-accent` (per tone; also used for the icon colour and the focus ring colour)
- `--dsh-notice-pad-y` (`6px`, proposed value in this repository)
- `--dsh-notice-dismiss-size` (`20px`, proposed value in this repository)

## a11y

- Without `onDismiss` the root node is a `<div>` and the `role` the caller passes stays as written (for example `role="status"`); with `onDismiss` the root node is a `<button type="button">`, so the caller needs to pass `aria-label` too, saying what clicking it will do.
- When a screen reader should announce it unprompted, the caller passes `role="alert"`; for static display it is not passed, because `alert` interrupts whatever is being read.
- The icon container carries `aria-hidden="true"`: the icon is decoration, and the meaning has to be in the text.
- Colour is not the only cue (`AC-MF-07`): the four grounds differ little in greyscale or with colour vision deficiency, so an icon is needed or the state has to be spelled out in the text.
- The focus ring uses `outline` (`AC-MF-10` / `AC-MF-11` / `AC-MF-12`): the colour is the current tone's `--dsh-notice-accent`, and `outline` rather than `box-shadow` is used so a parent's `overflow: hidden` cannot clip it.
- The dismiss control carries an `aria-label` (default `关闭提示`, overridable with `dismissLabel`), is itself focusable (`tabIndex=0`), and Enter / Space can trigger it (`AC-MF-09`).
- After dismissal focus lands back on `body`: the caller should return focus to the element that triggered it once it has unmounted.
- Hit-area conclusion: the single-line form is `32px` high and the dismiss control is `20×20`, both meeting `AC-MF-01`'s `20×20` minimum; the dismiss control does not meet the same criterion's `28×28` regular control target (a deliberate tradeoff, see above).

## checks

Machine-checkable binary constraints (a true / false judgement settles them, and they can become lint rules directly).

1. `tone` is one of `info` / `success` / `warn` / `error`, otherwise it falls back to `info`.
2. The root node's class names include the tone class; when `multiline` is true they include the multiline class.
3. With `onDismiss` passed, the root node renders as `<button>` with `type="button"`; without it, as `<div>`.
4. With `onDismiss` passed, the dismiss control is a `role="button"` `<span>` (a button inside a button must not appear in the source).
5. With `onDismiss` passed, the dismiss control carries a non-empty `aria-label` (`AC-MF-14`; checklist `A49`).
6. The dismiss control's `onClick` and `onKeyDown` both call `stopPropagation`, and `onKeyDown` calls `preventDefault` for Enter / Space (so it does not fire twice).
7. With `icon` passed, the icon container carries `aria-hidden="true"`.
8. The root node has a `:focus-visible` focus style, and does not use `outline: none` with no replacement (`AC-MF-10`; checklist `A48`).
9. The focus ring is 2px solid + 2px outer offset (`AC-MF-11`).
10. The dismiss control has a `:focus-visible` style (checklist `A48`).
11. The `@media (prefers-reduced-motion: reduce)` branch exists (`MO-MF-09`; checklist `A34`).
12. Every ground and text colour comes from a `--dsw-*` semantic token or a `color-mix` derivation, with no hard-coded colour value in the source (checklist `A19` / `A23`).
13. Adjacent hit areas do not overlap (`AC-MF-03`): the dismiss control and the root button stand in a master–subordinate relationship inside one hit area, and the dismiss control itself is not an independent adjacent element.
14. The four tones are distinguishable in greyscale or backed by an icon / text cue (`AC-MF-07`; checklist `A46`, semi-automatic).
15. In the single-line form, text longer than the container does not wrap (`white-space: nowrap`) — the caller has to move to the multiline form (human review, see "How to use it well" in `README.md`).

## demo

- `components/feedback/InlineNotice/demo.html`

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist items: `spec/70-checklist.md` (`A19`, `A23`, `A34`, `A46`, `A48`, `A49`)
