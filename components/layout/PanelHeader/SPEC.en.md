---
source: components/layout/PanelHeader/SPEC.md
source-sha256: a2510460ecac9829
translated-at: 2026-10-05
---
# PanelHeader · SPEC

- id: panelheader
- category: layout
- source: `components/layout/PanelHeader/` (`index.tsx` / `panelheader.module.css`)
- official-counterpart: **the product has corresponding interfaces**: the settings window content header `wCInkW_header` 612 × 54 (`padding 20px 14px 8px 10px` / `gap 8`) + a close button 28 × 28 with radius 8; the right panel header `tabStrip` 706 × 38; the left panel header `panelTitle` 28 × 22 (`docs/reference/settings-panel.json`, `data/ui-inventory.json`). This component extracts that set of headers into a reusable skeleton; its other geometry anchors are taken from `Modal.module.css` / `Button.module.css` / `Menu.module.css` / `DisclosureRow.module.css` in `@deepseek-ai/dsh-client-ui-primitives/lib/`
- measured-2026-10-02: the proposed values below (`md` 44px / `sm` 36px) disagree with the measurements (54 / 38). **Where there is a measurement, the measurement wins**; the proposed values apply only when this component is used as a standalone skeleton and is not placed next to a native product header (basis: 00-overview §4.1 "official first")
- human-doc: `README.md` (judgement and trade-offs; this file carries only facts)

## geometry-source

The notation is "value ← filename selector": the left column is the left of the arrow, the right column is "filename + selector".
The official source is `@deepseek-ai/dsh-client-ui-primitives/lib/`.

| Value | Source |
| --- | --- |
| `font-weight: 500` / `color: var(--dsw-alias-label-primary)` | `Modal.module.css` → `.title` (original comment: figma wt510, rendered 500) |
| title font size `font-size: 14px` / `line-height: 22px` | `Button.module.css` → `.button` (a panel title sits one step below a dialog title, so it does not take `Modal`'s 16/24) |
| `display: flex` / `align-items: center` / `justify-content: space-between` / `gap: 8px` | `Modal.module.css` → `.header` |
| `gap: 4px` inside the action area | `Button.module.css` → `.button` (`gap: 4px`) |
| hairline `0.5px` + `background: var(--dsw-alias-border-l1)` | `Menu.module.css` → `.separator` (`height: 0.5px; background: var(--dsw-alias-border-l1)`) |
| `--dsw-alias-label-tertiary` (description text colour) | `DisclosureRow.module.css` → `.leading` / `Menu.module.css` → `.itemIcon` (the official usage of the secondary / tertiary text colour) |
| `28×28` (the usual icon-button size in the action area, not this component's geometry) | `Modal.module.css` → `.close` (`width: 28px; height: 28px`) |

### Why `border-l1` and not `border-l2`

The official CSS uses l1 for separations inside a line / within one layer (`Menu.module.css`'s `.separator`), and l2 for the boundary between an overlay and the page (the top edge of `Menu.module.css`'s `.footer`). A panel header bar belongs to the former: what it divides is two stretches of content inside one and the same panel surface.

### Values proposed here (not official values)

- `min-height: 44px` (`md`) / `36px` (`sm`): the official CSS has no panel header bar. How 44px is arrived at: a title line height of 22px with 11px of visual slack above and below does not hold up, so it goes straight to 44, the multiple of 4 (= 22 + 11 + 11 rounded up to a multiple of 4), and it gives the 28px icon button on the right (the 28×28 of the official `Modal.module.css` `.close`) enough hit area; the 36px of `sm` lines up with the 36px height of the official `Button.module.css` `.md`, so the header bar is as tall as a `md` button beside it. 44 rather than 40 because: `Modal`'s `.close` is 28px, 44 - 28 = 16, 8px of slack above and below; 40 - 28 = 12, 6px above and below, which reads as cramped.
- `padding: 0 12px` (`md`) / `0 8px` (`sm`): the official CSS has no horizontal padding for a panel header bar. 12px differs both from the `padding: 8px 10px` of the official `Menu.module.css` `.item` and from the `padding: … 14px … 24px` of `Modal.module.css` `.header`; this repository takes 12px as the middle step for "panel edge to text", and it is a multiple of 4; `sm` takes 8px to keep the same rhythm.
- `gap: 4px` on `heading` (between the title and the description): the official CSS has no such spacing. The value follows this repository's rule that "spacing invented here is a multiple of 4"; a 2px step, tighter than 4px, sits closer visually, but it is not compliant, so it is not used. If a title and description need to sit closer still, the caller can override it.
- How the hairline is implemented (`box-shadow: inset 0 -0.5px 0 0`): the official CSS implements it with `border-top` / `background` (`Modal.module.css` `.footer`, `Menu.module.css` `.separator`). This repository switches to an inset `box-shadow` because the header bar has a fixed `min-height`, and a `border-bottom` would push the total height to 44.5px; `box-shadow` takes no part in layout, so the height stays a whole number.

### Implementation notes

- This repository's implementation is original: the geometry rides on `--dsh-ph-*` component-level variables plus a single class switching the size; the geometry is equivalent, but it is not a copy of the official CSS.
- `--dsh-ph-*` are internal variables of this repository, not DSH tokens.
- `--dsw-alias-label-primary` / `--dsw-alias-label-tertiary` / `--dsw-alias-border-l1` can all be looked up in `website/css/dsh-tokens.css` (both the light and the dark set have them).

## api

`PanelHeaderProps extends HTMLAttributes<HTMLDivElement>`, `forwardRef<HTMLDivElement, PanelHeaderProps>`. Exported type `PanelHeaderSize`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `ReactNode` | none (required) | The title text on the left, rendered as a `<div>`, 14/22, weight 500 |
| `description` | `ReactNode` | none | Supporting copy below the title (12/18, tertiary text colour); once passed, the header bar's height is driven by its content and `--dsh-ph-height` no longer applies |
| `actions` | `ReactNode` | none | The content of the action area on the right, usually a few `Button`s / icon buttons |
| `size` | `'md' \| 'sm'` | `'md'` | `md` is 44px tall with 12px of left and right padding; `sm` is 36px tall with 8px of left and right padding. When `description` is passed, the size step affects the padding only |
| `divider` | `boolean` | `true` | Whether to draw the bottom hairline |
| `children` | `ReactNode` | none | Appended inside `heading`, after `description` |
| `className` | `string` | none | Concatenated with the internal class names |
| everything else | `HTMLAttributes<HTMLDivElement>` | — | `id` / `aria-*` and so on are passed through to the root `<div>` unchanged |
| `ref` | `Ref<HTMLDivElement>` | none | Passed through to the root `<div>` |

## states

| State | Trigger | Behaviour |
| --- | --- | --- |
| Default (`md`) | `size` omitted | `min-height: 44px`; `padding: 0 12px` |
| `sm` | `size="sm"` | `min-height: 36px`; `padding: 0 8px` |
| With divider | `divider` is true (the default) | `box-shadow: inset 0 -0.5px 0 0 var(--dsw-alias-border-l1)` |
| Without divider | `divider={false}` | No `box-shadow` |
| With description | `description != null` | `.description` renders; the height is driven by its content (`min-height` still applies) |
| Without description | `description` is `null` / `undefined` | `.description` does not render |
| Without actions | `actions` is `null` / `undefined` | `.actions` does not render |
| Title too long | The text width exceeds the space available | `.title` truncates with `text-overflow: ellipsis` and does not wrap |
| Description too long | As above | `.description` truncates the same way |
| Title squeezing the action area | The title's natural width is too large | `.heading`'s `min-width: 0` lets it shrink, and `.actions` is `flex: none` so it stays whole |
| Interaction | At any time | None: this component renders no interactive element |

## tokens

DSH semantic tokens (all of them can be looked up in `data/tokens.json`):

- `--dsw-alias-label-primary` — the `.title` text colour
- `--dsw-alias-label-tertiary` — the `.description` text colour
- `--dsw-alias-border-l1` — the colour of the bottom hairline

Component-level CSS variables (internal to this repository, not DSH tokens):

- `--dsh-ph-height` (`44px` / `36px` under `.sm`)
- `--dsh-ph-pad-x` (`12px` / `8px` under `.sm`)
- `--dsh-ph-gap` (`8px`)
- `--dsh-ph-title-size` (`14px`)
- `--dsh-ph-title-line` (`22px`)

## a11y

- `title` is a plain text container, not a heading element. If a panel carries `<section>` / `<aside>` semantics, the caller should give it `aria-labelledby` and put an `id` on the title, or pass an `<h2>` straight in as `title`.
- If a button inside `actions` is icon-only, the caller must supply its `aria-label`; the icon itself should be `aria-hidden="true"` (`AC-MF-14`; checklist `A49`).
- A title that is too long is truncated with an ellipsis and does not wrap — the truncation affects the visuals only; a screen reader still reads the full text.
- The bottom hairline is purely decorative and carries no semantics (do not fake it with an `<hr>`).
- `title` sits in a flex child with `min-width: 0`, so the title cannot push the action area on the right out of the container (`AC-MF-16` / `FL-RC-05` usability in a narrow container).
- Hit-area conclusion: this component contains no interactive element, so the hit-area requirement does not apply to the root node; the controls inside `actions` are the responsibility of their own components (`AC-MF-01`). With icon buttons present, the container's line height is 44px for `md` / 36px for `sm`, both ≥ 28px (`AC-MF-04`; checklist `A44`).

## checks

Binary constraints a machine can check (decidable as true / false, and directly expressible as lint rules).

1. The `title` node carries `text-overflow: ellipsis` + `white-space: nowrap` + `overflow: hidden`, and does not wrap.
2. The `description` node has the same three properties.
3. `.heading` carries `min-width: 0`, and `.actions` carries `flex: none`.
4. When `actions` is `null` / `undefined`, the source does not render the `.actions` node.
5. When `divider` is false, the hairline's `box-shadow` is not rendered.
6. The hairline uses `box-shadow` and not `border-bottom`, and the root node's height is a whole number (44 / 36) rather than 44.5 / 36.5.
7. `size` is one of `md` / `sm`, and otherwise falls back to `md`.
8. The height is `44px` (`md`) / `36px` (`sm`), both ≥ 28px (`AC-MF-04`; checklist `A44`).
9. The class-name concatenation order is "base class + size class + divider class + external className", with the external class name appended last.
10. Every colour comes from a `--dsw-*` semantic token, and the source holds no hard-coded colour value (checklist `A19` / `A23`).
11. This component's source contains no `onClick` / `tabIndex` / `role` (it renders no interaction).
12. A string `title` is not rendered as `<h1>`–`<h6>` (so the page's heading outline is not broken).
13. A caller adding its own border passes `divider={false}`, and the source contains no combination of "a `border` and the hairline at the same time" (human review).

## demo

- `components/layout/PanelHeader/demo.html`

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist entries: `spec/70-checklist.md` (`A19`, `A23`, `A44`, `A49`)
