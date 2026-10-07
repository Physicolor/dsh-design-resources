---
source: components/layout/ToolbarRow/SPEC.md
source-sha256: 0ffaf0b1608bc02f
translated-at: 2026-10-07
---
# ToolbarRow · SPEC

- id: toolbarrow
- category: layout
- source: `components/layout/ToolbarRow/` (`index.tsx` / `toolbarrow.module.css`)
- official-counterpart: **the product has corresponding interfaces**: the composer card toolbar row `RlGAzG_row` 780 × 42 · `padding 2px 8px 6px 8px` · `gap 12`, with the inline tools area `RlGAzG_tools` 140 × 28; controls in the same seat `RlGAzG_add` 28 × 28, `RlGAzG_primary` 34 × 34, `dlU_AG_trigger` 100 × 28 (`docs/reference/composer-geometry.json`, `data/ui-inventory.json`). This component extracts that row into a reusable container; its other geometry anchors are taken from `ConnectionIndicator.module.css` / `Button.module.css` / `Menu.module.css` in `@deepseek-ai/dsh-client-ui-primitives/lib/`
- measured-2026-10-02: the proposed values below (`md` 32 / `sm` 28 high) disagree with the measurements (row height 42, inline controls 28). **Where there is a measurement, the measurement wins**; the proposed values apply only when this component is used as a standalone skeleton (basis: 00-overview §4.1 "official first")
- human-doc: `README.md` (judgement and trade-offs; this file carries only facts)

## geometry-source

The notation is "value ← filename selector": the left column is the left of the arrow, the right column is "filename + selector".
The official source is `@deepseek-ai/dsh-client-ui-primitives/lib/`.

| Value | Source |
| --- | --- |
| `min-height: 28px` (`md`) | `ConnectionIndicator.module.css` → `.indicator` (`height: 28px`) |
| `background: var(--dsw-alias-button-tool-bar-fill)` (the `filled` variant's background) | `Button.module.css` → `.toolbar` |
| `gap: 4px` (the default spacing) | `Button.module.css` → `.button` (`gap: 4px`) |
| `min-height: 28px` + `gap: 4px` (`sm`) | `Button.module.css` → `.sm` (`height: 28px`) — a `Button size="sm"` just fills an `sm`-step toolbar |
| hairline `0.5px` + `border-bottom: 0.5px solid var(--dsw-alias-border-l1)` | `Menu.module.css` → `.separator` (`height: 0.5px; background: var(--dsw-alias-border-l1)`) |
| `border-radius: 8px` | `ConnectionIndicator.module.css` → `.indicator` (`border-radius: 8px`) — invisible on a transparent background, and visible only under `filled`; not the official `Button`'s 18px pill, because the whole toolbar is not a pill |

### Why `plain` (transparent) is the default and not the official toolbar fill

The official `Button.module.css` `.toolbar` background is a semi-transparent dark grey, designed for overlay buttons that float on top of chat content. If an ordinary in-page toolbar section carried it by default, it would add a stray grey band on top of a light panel; so this component makes `filled` an explicit option, switched on only when the row really floats above content.

### Values proposed here (not official values)

- `padding: 0 12px` (`md`) / `0 8px` (`sm`): the official CSS has no toolbar container. 12px is a multiple of 4 and stays on the same order of magnitude as `padding: 0 8px` in the official `ConnectionIndicator.module.css` `.indicator` (slightly wider, because a toolbar holds several elements rather than a single pill). `sm` takes 8px, in proportion to that step's own 28px height.
- `gap` defaults to **4px** (the exact value in the official `Button.module.css` `.button`) rather than 8px: adjacent buttons in a toolbar usually carry their own padding already, and 4px groups them closer to the official toolbar shape (officially 4px is used for the gap inside a button and around a Menu separator). The `sm` step is 4px as well.
- `z-index: 1` (`sticky`): the official menu uses 100 / 1100 and Modal uses 1000, all of them overlay levels. A toolbar only covers the content that follows inside the same container, so 1 is enough, and it will not bury a menu.
- `flex-wrap: wrap`: the official CSS has no list container to refer to; this is a value proposed here so that narrow containers stay usable. Where wrapping is not acceptable, pass your own `style` to override it to `nowrap`, or write your own container.
- `border-radius: 8px`: not an official requirement, only there so the rectangular `filled` background has rounded corners; if it fills the whole row, override it to 0 yourself.

### Implementation notes

- This repository's implementation is original: CSS variables carry the geometry, with a single class switching the variant / size; the geometry is equivalent, but it is not a copy of the official CSS.
- `--dsh-tb-*` are internal variables of this repository, not DSH tokens.
- `--dsw-alias-button-tool-bar-fill` / `--dsw-alias-border-l1` can both be looked up in `website/css/dsh-tokens.css` (the light and the dark set both have them).

## api

`ToolbarRowProps extends HTMLAttributes<HTMLDivElement>`, `forwardRef<HTMLDivElement, ToolbarRowProps>`. Exported types `ToolbarRowVariant` / `ToolbarRowSize`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'plain' \| 'filled'` | `'plain'` | `plain` is a transparent background for an ordinary toolbar section inside a page / panel; `filled` uses the official toolbar button background, for an overlay toolbar floating above content |
| `size` | `'md' \| 'sm'` | `'md'` | `md` has a 32px row height and 12px of left and right padding; `sm` has a 28px row height and 8px of left and right padding; both steps use a 4px gap |
| `divider` | `boolean` | `false` | bottom hairline (`0.5px` + `var(--dsw-alias-border-l1)`) |
| `sticky` | `boolean` | `false` | `position: sticky; top: 0; z-index: 1`; the outer scrolling container must not have `overflow: hidden` |
| `children` | `ReactNode` | none | the controls inside the row |
| `className` | `string` | none | concatenated with the internal class names, with the external class name appended last |
| everything else | `HTMLAttributes<HTMLDivElement>` | — | `role` / `aria-label` / `style` and so on are passed through to the root `<div>` unchanged |
| `ref` | `Ref<HTMLDivElement>` | none | passed through to the root `<div>` |

## states

| State | Trigger | Behaviour |
| --- | --- | --- |
| Default (`plain` + `md`) | `variant` / `size` omitted | `background: transparent`; `min-height: 28px`; `padding: 0 12px`; `gap: 4px` |
| `filled` | `variant="filled"` | `background: var(--dsw-alias-button-tool-bar-fill)`, with `border-radius: 8px` visible |
| `sm` | `size="sm"` | `min-height: 28px`; `padding: 0 8px`; `gap: 4px` |
| With divider | `divider` is true | `border-bottom: 0.5px solid var(--dsw-alias-border-l1)` |
| Without divider | `divider` is false (the default) | no `border-bottom` |
| Sticky | `sticky` is true | `position: sticky`; `top: 0`; `z-index: 1` |
| Narrow container | The content's total width exceeds the container | `flex-wrap: wrap` wraps to the next line without overflowing or clipping (`AC-MF-16`) |
| Interaction | At any time | None: this component is a pure layout container; it renders no interactive element and carries no `role` |

## tokens

DSH semantic tokens (all of them can be looked up in `data/tokens.json`):

- `--dsw-alias-button-tool-bar-fill` — the `filled` variant's background
- `--dsw-alias-border-l1` — the bottom hairline's colour

Component-level CSS variables (internal to this repository, not DSH tokens):

- `--dsh-tb-height` (`32px` / `28px` under `.sm`)
- `--dsh-tb-pad-x` (`12px` / `8px` under `.sm`)
- `--dsh-tb-gap` (`4px`, the same in both steps)

## a11y

- This component is a pure layout container and has no `role`. A row of action buttons should each be a `<button>`.
- Do not give it `role="toolbar"` unless you really implement arrow-key focus movement between the buttons — the ARIA `toolbar` semantics require keyboard arrow-key navigation; if you add it, supply an `aria-label` at the same time.
- If a button is icon-only, the caller must supply its `aria-label`; the icon itself should be `aria-hidden="true"` (`AC-MF-14`; checklist `A49`).
- Under the light theme the `variant="filled"` background is a semi-transparent dark grey, and text on top of it must be inverted (`Button variant="toolbar"` already handles this through official tokens); do not put dark body text straight onto it (`AC-MF-05`).
- `sticky` makes the toolbar cover the content below it; use `divider` or a background colour to separate it from the scrolling content.
- Hit-area conclusion: this component contains no interactive element; the container's line height, `md` 32px / `sm` 28px, is ≥ 28px in both cases, meeting `AC-MF-04` (a container holding icon buttons has a line height ≥ 28; checklist `A44`). The hit areas of the controls inside the row are the responsibility of their own components (`AC-MF-01`).

## checks

Binary constraints a machine can check (decidable as true / false, and directly expressible as lint rules).

1. `variant` is one of `plain` / `filled`; `size` is one of `md` / `sm`; an out-of-range value falls back to the default.
2. `min-height` is `32px` (`md`) / `28px` (`sm`), both ≥ 28px (`AC-MF-04`; checklist `A44`).
3. Under the `plain` variant `background` is `transparent`, and the source never writes `--dsw-alias-button-tool-bar-fill` as a default.
4. When `divider` is false the root node has no `border-bottom`.
5. The hairline colour is `var(--dsw-alias-border-l1)` (checklist `A19`).
6. When `sticky` is true, `position: sticky` + `top: 0` + `z-index: 1`; when false, no `position: sticky` appears.
7. `flex-wrap: wrap` is in effect by default (unless the caller overrides it through `style`), and a narrow container does not clip content (`AC-MF-16`; checklist `A51`, human-confirmed that no entry point disappears).
8. The class-name concatenation order is "base class + variant class + size class + divider class + sticky class + external className", with the external class name appended last.
9. The component's source does not write a `role` of its own; when `role="toolbar"` appears, arrow-key handling and an `aria-label` must both be present (otherwise it is a violation).
10. Every colour comes from a `--dsw-*` semantic token, and the source holds no hard-coded colour value (checklist `A23`).
11. `gap` is `4px`, which disagrees with the "8px between adjacent controls in a row" that `CT-RC-14` suggests: this repository follows the official `Button.module.css` `.button`'s `gap: 4px` (checklist `B06`; a deviation, to be confirmed at repository level).
12. Controls within one toolbar share the same height (`CT-MF-13`; checklist `A44`): the `md` step pairs with `Button`'s default size, the `sm` step with `Button size="sm"`.
13. One toolbar holds no more than 6 visible controls (`FL-RC-05`; checklist `B01`); beyond that, a human review should confirm whether they go into a menu.

## demo

- `components/layout/ToolbarRow/demo.html`

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist entries: `spec/70-checklist.md` (`A19`, `A23`, `A44`, `A49`, `A51`, `B01`, `B06`)
