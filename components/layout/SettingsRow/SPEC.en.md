---
source: components/layout/SettingsRow/SPEC.md
source-sha256: be745db2ab92894a
translated-at: 2026-10-07
---
# SettingsRow · SPEC

- id: settingsrow
- category: layout
- source: `components/layout/SettingsRow/` (`index.tsx` / `settingsrow.module.css`)
- official-counterpart: **the product has a matching interface**: the settings row itself `_3HsggG_row` 564 × 77 · `padding 16px 0` · `gap 8`, the text column `gap 4`, title 398 × 22, description 398 × 18 (12px / 18px), the selector on the right 110 × 36 with corner radius 12; the same row family appears in 8 places (`docs/reference/settings-panel.json`). This component extracts it into one reusable row; its other geometry anchors are taken from `Button.module.css` / `Modal.module.css` / `Menu.module.css` / `ReadBlock.module.css` in `@deepseek-ai/dsh-client-ui-primitives/lib/`
- measured-2026-10-02: the proposed values below (`min-height 44` / `padding 12` / `gap 12`) disagree with the measurements (77 / `16px 0` / 8). **Where there is a measurement, the measurement wins**; the proposed values apply only when it is used as a standalone skeleton (basis: 00-overview §4.1 "official first")
- human-doc: `README.md` (judgement and trade-offs; this file carries only facts)

## geometry-source

The notation is "value ← filename selector": the left column holds what stands to the left of the arrow, the right column holds "filename + selector".
The official source is `@deepseek-ai/dsh-client-ui-primitives/lib/`.

| Value | Source |
| --- | --- |
| title `font-size: 14px` / `line-height: 22px` | `Button.module.css` → `.button` (panel / settings-item titles reuse this size step, matching `PanelHeader`) |
| title colour `color: var(--dsw-alias-label-primary)` | `Modal.module.css` → `.title` / `Button.module.css` → `.button` |
| description font `font: var(--dsw-font-xs-13)` (`13px/20px`) | the official composite token; the official consumption site is `ReadBlock.module.css` → `.count` |
| description colour `color: var(--dsw-alias-label-tertiary)` | `Menu.module.css` → `.itemIcon` |
| divider `border-top: 0.5px solid var(--dsw-alias-border-l2)` | `Menu.module.css` → `.footer` |
| `border-radius: 10px` | `Menu.module.css` → `.item` (so that the hover background does not show square corners) |
| hover background `background: var(--dsw-alias-interactive-bg-hover)` | `Menu.module.css` → `.item:hover:not(:disabled)` / `Button.module.css` → `.ghost:hover` |
| `gap: 8px` on `.control` | `Menu.module.css` → `.item` (`gap: 8px`) |
| `gap: 4px` on `.text` | `Button.module.css` → `.button` (`gap: 4px`) |

### Why the divider uses `border-l2` and not `border-l1`

The official CSS uses `l2` for "the boundary between an overlay / a section and what lies outside it" (the top edge of `Menu.module.css`'s `.footer`; the comment verbatim: *l1 is near-invisible on the menu surface*), and `l1` for dividing content within one and the same layer (`.separator`). Between settings items there is a dividing line that has to be visible, so it takes `l2`.

### Values proposed here (not official values, all multiples of 4)

- `min-height: 44px`: the official CSS has no settings row. How 44 is arrived at: a title line height of 22 + 11px of visual slack above and below → take 44, a multiple of 4; it also leaves 8px above and below when a 28px icon button sits on the right (the 28×28 of the official `Modal.module.css` `.close`).
- `padding: 12px` (the same value top / bottom and left / right): `12` is a multiple of 4, and it is the shared horizontal rhythm of this repository's panel-class components (the `md` step of `PanelHeader` is 12px too), lining the settings panel up with the panel header bar on the left.
- `gap: 12px` (text area ↔ control area): a multiple of 4. 12px rather than 8px, so that the "label" and the "switch" keep clear breathing room — 8px makes the two visually stick together on a long title row.
- `gap: 8px` on `.control`: the same value as `gap: 8px` on `.item` in the official `Menu.module.css`, for when one row holds several controls.
- The whole-row hover background on `.row:hover`: the official CSS has no "settings row" to go by. It is added because the root node is clickable (`<label>`), and a mouse user needs to see that. When a row does not need hover feedback, the caller can override the `background` of `.row:hover`.
- The `10px` corner radius serves the hover background only; no hover background, no corner radius needed.
- The hairline uses `box-shadow: inset 0 -0.5px 0 0` rather than the official `border-bottom`: this row has a `min-height` and a corner radius, so `border-bottom` would push the total height to 44.5px and would be cut into an arc by the radius. `box-shadow` takes no part in layout.

### Implementation notes

- This repository's implementation is original: CSS variables carry the geometry + a single class switches the divider; the geometry is equivalent, but it is not a copy of the official CSS.
- `--dsh-sr-*` are internal variables of this repository, not DSH tokens.
- `.description` prefers the official composite token `--dsw-font-xs-13` (gated by `@supports`); when the host has not injected it, the longhand fallback carries the same set of values (`13px` / `20px`, through `--dsh-sr-desc-size` / `--dsh-sr-desc-line`). Longhand rather than the `font` shorthand, because a shorthand fallback value has to bring its own `font-family`, and there is no reliable family to write here.

## api

`SettingsRowProps extends LabelHTMLAttributes<HTMLLabelElement>`, `forwardRef<HTMLLabelElement, SettingsRowProps>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `ReactNode` | none (required) | The settings item's title, 14/22, `var(--dsw-alias-label-primary)` |
| `description` | `ReactNode` | none | Optional supporting text, 13/20, the official composite token `--dsw-font-xs-13`, `var(--dsw-alias-label-tertiary)` |
| `control` | `ReactNode` | none | The control area on the right, usually a `Switch` / `Input` / `Button` / `<select>` |
| `divider` | `boolean` | `true` | Whether to draw the bottom hairline (`0.5px` + `var(--dsw-alias-border-l2)`) |
| `children` | `ReactNode` | none | Appended inside `.text`, after `description` |
| `className` | `string` | none | Concatenated with the internal class names |
| everything else | `LabelHTMLAttributes<HTMLLabelElement>` | — | `onClick` / `aria-*` and so on are passed through to the root `<label>` unchanged |
| `ref` | `Ref<HTMLLabelElement>` | none | Passed through to the root `<label>` |

## states

| State | Trigger | Behaviour |
| --- | --- | --- |
| Default | — | The root node is a `<label>`; `display: flex` + `align-items: center` + `justify-content: space-between`; `gap: 12px`; `min-height: 44px`; `padding: 12px` |
| With divider | `divider` is true (the default) | `box-shadow: inset 0 -0.5px 0 0 var(--dsw-alias-border-l2)` |
| Without divider | `divider={false}` | No `box-shadow` |
| Hover | `.row:hover` | `background: var(--dsw-alias-interactive-bg-hover)`; the `10px` corner radius takes effect |
| With description | `description != null` | `.description` renders, `4px` away from the title |
| Without description | `description` is `null` / `undefined` | `.description` does not render |
| Without control | `control` is `null` / `undefined` | `.control` does not render |
| Long title | The text width exceeds the space available | `.text` carries `min-width: 0` and can shrink inside the row |
| The host has not injected the composite token | `font: var(--dsw-font-xs-13)` is not supported | `.description` falls back to the `13px` / `20px` longhand values |
| Interaction | At any time | The component itself listens for no events; the interaction of the controls inside the row is the controls' responsibility |

## tokens

DSH semantic tokens (all of them can be looked up in `data/tokens.json`):

- `--dsw-alias-label-primary` — the `.title` text colour
- `--dsw-alias-label-tertiary` — the `.description` text colour
- `--dsw-alias-border-l2` — the colour of the bottom hairline
- `--dsw-alias-interactive-bg-hover` — the `.row:hover` background
- `--dsw-font-xs-13` — the composite token for the description text (`13px/20px`, font family included)

Component-level CSS variables (internal to this repository, not DSH tokens):

- `--dsh-sr-min-height` (`44px`)
- `--dsh-sr-pad-y` (`12px`) / `--dsh-sr-pad-x` (`12px`)
- `--dsh-sr-gap` (`12px`)
- `--dsh-sr-desc-size` (`13px`) / `--dsh-sr-desc-line` (`20px`): the fallback values for when the composite token is unavailable

## a11y

- The root node is a `<label>`, and the first form control inside the row is implicitly associated with it (where `AC-MF-14`'s accessible name comes from): **one form control per row**. Two would make the label point at the first and leave the second without a name.
- An `onClick` on the `<label>` fires once more from the control itself (event bubbling); when you put toggle logic in `onClick`, take care not to toggle twice — if the control's own `onChange` can take it, give it to the control.
- The title is a `<span>`, not a heading element. If the whole settings block carries `<section>` semantics, the caller gives that section an `aria-labelledby`, or simply uses `<fieldset><legend>`.
- If the control on the right is an icon-only button it must carry an `aria-label`; a `Switch` must carry an `aria-label` (`role="switch"` needs a readable name) (`AC-MF-14`; checklist `A49`).
- The description is tertiary text colour: it carries supporting information, so do not put anything you "must know in order to operate" in the description alone (`AC-MF-05` / `AC-MF-07`).
- The divider between rows is purely decorative and carries no semantics.
- Focus: the official `Input.module.css` / `Switch.module.css` define focus styles for the control itself only, not for "the row". This component does not touch the controls; the keyboard focus ring is provided by the control on the right itself (the `:focus-visible` of the official `Switch.module.css`: 2px `--dsw-alias-brand-primary`); the whole-row hover background serves mouse users only (checklist `A48`).
- Hit-area conclusion: the row is `min-height: 44px` and the whole row is clickable; the hit area of the controls inside the row is the responsibility of their own components (`AC-MF-01`). With a 28px icon button present there is 8px of slack above and below, and the container's line height is ≥ 28 (`AC-MF-04`; checklist `A44`).

## checks

Binary constraints a machine can check (decidable as true / false, and directly expressible as lint rules).

1. The root node is a `<label>`.
2. At most one form control element inside a row (`input` / `select` / `textarea` / `[role="switch"]` count ≤ 1); otherwise it is a violation (`AC-MF-14`).
3. When `divider` is false, the hairline's `box-shadow` is not rendered.
4. The hairline colour is `var(--dsw-alias-border-l2)` (checklist `A19`).
5. The hairline uses `box-shadow` and not `border-bottom`, and the root node's height is a whole number (`44px`) rather than `44.5px`.
6. When `control` is `null` / `undefined`, the source does not render the `.control` node.
7. `.text` carries `min-width: 0`.
8. `.row`'s `min-height` is ≥ 28px (measured `44px`; `AC-MF-04`; checklist `A44`).
9. `.description`'s fallback font size is `13px` and line height `20px`, and the composite token is preferred through `@supports (font: var(--dsw-font-xs-13))` (`TK-MF-11`; checklist `B08`).
10. Every colour comes from a `--dsw-*` semantic token, and the source holds no hard-coded colour value (checklist `A23`).
11. No fixed `height`, only `min-height`, so enlarged text is not clipped (`AC-RC-17`; checklist `B13`).
12. The source contains no `aria-disabled` posing as native disabling; whether a control inside the row is disabled is expressed by the control itself.
13. The last row of a list gets `divider={false}` from the caller, or is overridden by a parent with `:last-child` (human review, see "How to use it well" in `README.md`).
14. The component's source does not itself render an `<h1>`–`<h6>` for `.title` (so the page's heading outline is not broken).

## demo

- `components/layout/SettingsRow/demo.html`

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist entries: `spec/70-checklist.md` (`A19`, `A23`, `A44`, `A48`, `A49`, `B08`, `B13`)
