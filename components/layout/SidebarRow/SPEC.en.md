---
source: components/layout/SidebarRow/SPEC.md
source-sha256: e0c284d0906b571b
translated-at: 2026-10-07
---
# SidebarRow · SPEC

- id: sidebarrow
- category: layout
- source: `components/layout/SidebarRow/` (`index.tsx` / `sidebarrow.module.css`)
- official-counterpart: **The product has a counterpart UI**: the left sidebar rows are rendered by the product's own CSS modules — the session row `sessionRow` 256 × 32 (`role=treeitem`, 22 occurrences), the project row 256 × 34, the panel row 252 × 36, the new-session button 252 × 38, the overflow button 256 × 28 (`data/ui-inventory.json`). The geometry that belongs to menu cells (`Menu.module.css`'s `.item`: min-height 40 / padding 8px 10px / radius 10 / gap 8) only applies to "an item inside a pop-up menu"; this component's left sidebar row does not use it
- measured-2026-10-02: the table under geometry-source below cites `Menu.module.css` `.item` (40px) — that is a pop-up menu cell, not a left sidebar row. **For left sidebar scenarios the measurements in section 1 of this document are the authority**
- human-doc: `README.md` (judgement calls and tradeoffs; this file holds facts only)

## The product's left sidebar rows (measured)

**One thing to get straight first**: this component is a **proposal** assembled from geometry borrowed from the official `Menu.module.css` `.item` (40 high, radius 10, padding 8px 10px), and the product's own left sidebar rows are not that size — they come from their own client CSS modules and measure like this (`docs/reference/geometry.json` and the element inventory):

| Row | Measured | Source |
| --- | --- | --- |
| New-session button `newSession` | **252 × 38** · radius **12** · 14px text (for the row-end shortcut see 20-controls §6) | the skeleton table in `docs/reference/README.md` |
| Collapse button `iconButton toggle` | **28 × 28** · radius **8** (right end of the brand row) | same as above |
| Session list container `list` | **270 × 527** · padding `0 5px 16px 4px` | `geometry.json` |
| Group subheading `sectionLabel` | **39 × 20** ("Workspace", "Ungrouped", 13px tier) | element inventory |
| "More" on hover `sessionOverflowButton` | **256 × 28** · radius 8 · padding `0 12px 0 28px` (the 28px on the left is reserved for the leading glyph) | element inventory |
| List-bottom fade `fade` | **256 × 24** (sits on the bottom edge when a long list is clipped) | element inventory |
| Search row `searchExpanded` | **252 × 30** · radius 12; input **196 × 20**, clear button **24 × 24** | element inventory |
| Session row `sessionRow` | **256 × 32** · radius **12** · padding `0 8px` · gap 0 · 14px text | the client module's hashed `sessionRow` (`role="treeitem"`) |
| Workspace row `projectRow` | **256 × 34** · radius **12** · padding `0 8px` · gap 6 | same as above |
| Panel navigation row `panelRow` | **252 × 36** · radius **12** · padding `7px 8px` · gap 8 · 14/22 | same as above |
| Row-end time `time` | **38 × 16** · 12/16 · `--dsw-alias-label-tertiary` (text like "10 minutes", "1 hour") | same as above |
| Panel title `panelTitle` | 28 × 22 · 14/22 (text "Plugins", "Automated tasks") | same as above |
| Left sidebar bottom entry `lc-ov-entry` | **260 × 42** · radius 12 · padding `0 10px` | the skeleton table in `docs/reference/README.md` (measured from geometry.json) |
| Left sidebar bottom "Settings" row `triggerRow` | **260 × 34** · radius 12 · padding `0 10px` (label 28 × 22 · 14/22) | same as above |

**Verdict (the official UI is inconsistent with itself)**: inside one left sidebar, three kinds of row are 32 / 34 / 36 high — different heights, the same 12 radius. This is not a layout accident: the session row has to hold a status glyph, the workspace row a collapse caret, the panel navigation row a 16px icon, and each pushes out a different height. **But a plugin has no reason to follow the three tiers**: when a plugin adds a row to the left sidebar, take either the session row tier (32 high) or the panel row tier (36 high); do not invent a fourth number.

## geometry-source

Read as "value ← file name selector": the left column is what sits to the left of the arrow, the right column is "file name + selector".
The official sources live in `@deepseek-ai/dsh-client-ui-primitives/lib/`.

| Value | Source |
| --- | --- |
| `min-height: 40px` / `padding: 8px 10px` / `border-radius: 10px` / `gap: 8px` / `font-size: 14px` / `line-height: 22px` / `color: var(--dsw-alias-label-primary)` / `text-align: left` | `Menu.module.css` → `.item` (original comment: figma `.Menu_cell`, min-h 40 / r10 / pad 10/8 / 14-22 / gap 8) |
| Hover ground `background: var(--dsw-alias-interactive-bg-hover)` | `Menu.module.css` → `.item:hover:not(:disabled)` |
| `opacity: 0.4` / `cursor: not-allowed` | `Menu.module.css` → `.item:disabled` |
| Icon container `16×16` / `flex: none` / `color: var(--dsw-alias-label-tertiary)` | `Menu.module.css` → `.itemIcon` |
| `flex: 1` / `min-width: 0` / `overflow: hidden` / `text-overflow: ellipsis` / `white-space: nowrap` | `Menu.module.css` → `.itemLabel` |
| Trailing check `flex: none` / `color: var(--dsw-alias-label-primary)` | `Menu.module.css` → `.check` |
| `fill` selected state `background: var(--dsw-alias-interactive-bg-hover)` | `Menu.module.css` → `.selectedFill` (original comment: Fill-mode selection: the row holds the hover fill instead of a check) |
| `check` selected state keeps a transparent ground | `Menu.module.css` → `.selected` (original comment: Selected cell keeps the plain fill (marker is the trailing check)) |
| Press / deepened hover `background: var(--dsw-alias-interactive-bg-active)` | `Button.module.css` → `.ghost:active` |
| Checkbox `16×16` / `margin: 0` / `accent-color: var(--dsw-alias-button-primary-fill)` | `RiskConfirmation.module.css` → `.acknowledgement input` (`width: 16px; height: 16px; accent-color: var(--dsw-alias-button-primary-fill)`) |

### Decisions in this repository (rewriting official behaviour)

- **`fill` uses `var(--dsw-alias-interactive-bg-hover)`, not `var(--dsw-alias-bg-module-platform)`**: the official `Menu.module.css` already defines `.selectedFill` as the hover ground, and that is the only officially sanctioned "fill-style selection" in the repository, so using its value directly carries the least risk. `--dsw-alias-bg-module-platform` is a module-level surface colour (the official `Tag.module.css` uses it as the tag ground for the `neutral` tone); using it as a row ground would blur "selected" and "tag-ground noise" into the same grey.
- **`--dsw-specific-sidebar-nav-item-active` is not used**: that token belongs to the `--dsw-specific-*` family rather than `--dsw-alias-*` and is not in the semantic token table the component convention allows. If the sidebar as a whole is already `--dsw-specific-sidebar-fill`, the caller can override `.selectedFill`'s `background` itself.

### Proposed values in this repository (not official numbers)

- `border-radius: 10px` keeps the original value: the official `.item` is 10px, not a multiple of 4, and is **not** rounded to a multiple of 4.
- `:focus-visible`'s `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: -2px`: the official `Menu.module.css` has no in-row focus style (the menu relies on `aria-activedescendant` or whole-menu focus). A sidebar row is a real button and must have a visible focus ring; the negative offset is there so the ring falls inside the row and is not clipped by the sidebar's `overflow: hidden` (`AC-MF-12`). It is written the same way as the official `Switch.module.css` / `ConnectionIndicator.module.css` `:focus-visible` blocks, with only the offset changed.
- `.trailing`'s `12px / 18px`: the official `Menu.module.css` has no trailing text slot. The pair is taken from the official `Button.module.css` `.sm` 12/18 (the smallest text tier in that file), so supporting information such as a count or a shortcut sits one tier lighter than the title.
- `min-width: 0` on `.row`: the official CSS writes it on `.itemLabel`; this component writes it on the button as well, because a real sidebar carries the row on a `width: 100%` button and the button itself also needs to be compressible.

### Implementation notes

- This repository's implementation is original: CSS variables carry the geometry and a single class toggles the selected state; the geometry is equivalent but it is not a copy of the official CSS.
- `--dsh-sb-*` are internal variables of this repository, not DSH tokens.
- `--dsw-alias-interactive-bg-active` has been reconciled against `website/css/dsh-tokens.css` and exists there (the official `Button.module.css` `.ghost:active` uses that token too).

## api

`SidebarRowProps extends ButtonHTMLAttributes<HTMLButtonElement>`, `forwardRef<HTMLButtonElement, SidebarRowProps>`. Exports the type `SidebarRowSelectionStyle`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | none | The row title |
| `icon` | `ReactNode` | none | Leading icon, placed in the 16×16 leading container; give the icon node `aria-hidden="true"` yourself |
| `selected` | `boolean` | `false` | Whether it is selected; written into `aria-pressed` (not written in the `checkbox` form) |
| `checkbox` | `boolean` | `false` | Multi-select form: renders a real `<input type="checkbox">`, and clicking anywhere on the row toggles it; do not pass `selected` in this form |
| `checked` | `boolean` | `false` | The checked state in the `checkbox` form |
| `checkboxLabel` | `string` | none | The checkbox's `aria-label`; required when the row holds no readable text |
| `selectionStyle` | `'check' \| 'fill'` | `'check'` | How the selected state is drawn: `check` keeps a transparent ground plus a trailing check; `fill` spreads the hover ground across the whole row |
| `trailing` | `ReactNode` | none | Trailing node, such as a count or a shortcut hint; in `check` selection the check is appended to its right |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Fixed default in the component, so a form does not submit by accident |
| `className` | `string` | none | Concatenated with the internal class names, with the external class name appended last |
| the rest | `ButtonHTMLAttributes<HTMLButtonElement>` | — | `onClick` / `disabled` / `aria-*` and so on pass straight through to `<button>` |
| `ref` | `Ref<HTMLButtonElement>` | none | Passes through to `<button>` |

## states

| State | Trigger | Behaviour |
| --- | --- | --- |
| Default | — | `background: transparent`; text `var(--dsw-alias-label-primary)` |
| Hover | `.row:hover:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-hover)` |
| Press | `.row:active:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-active)` |
| Disabled | `.row:disabled` | `opacity: 0.4` + `cursor: not-allowed` |
| Keyboard focus | `.row:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: -2px` |
| Selected (`check`) | `selected` and `selectionStyle="check"` | Keeps a transparent ground; a `16×16` check renders at the trailing end in `var(--dsw-alias-label-primary)`; `aria-pressed="true"` |
| Selected (`fill`) | `selected` and `selectionStyle="fill"` | `background: var(--dsw-alias-interactive-bg-hover)` across the whole row |
| Selected (`fill`) hover | `.selectedFill:hover:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-active)` |
| Multi-select | `checkbox` true | Renders `<input type="checkbox" readOnly tabIndex={-1}>` in the leading slot; does not render `aria-pressed`; does not render the trailing check |
| No icon | `icon` not passed and `checkbox` false | The leading node does not render |
| Checked but not selected | `selected` false | No check renders and no fill class is added |
| Title too long | Text width exceeds the available space | `.label` truncates with `text-overflow: ellipsis` and does not wrap |
| No trailing node | `trailing` not passed | `.trailing` does not render |
| Not selected (`fill`) | `selected` false | `.selectedFill` is not added |

## tokens

DSH semantic tokens (all of them can be looked up in `data/tokens.json`):

- `--dsw-alias-label-primary` — row text colour / trailing check colour
- `--dsw-alias-label-tertiary` — leading icon colour / `.trailing` text colour
- `--dsw-alias-interactive-bg-hover` — hover ground / `fill` selected ground
- `--dsw-alias-interactive-bg-active` — press ground / `fill` selected-hover ground
- `--dsw-alias-brand-primary` — focus ring colour
- `--dsw-alias-button-primary-fill` — the checkbox's `accent-color`

Component-level CSS variables (internal to this repository, not DSH tokens):

- `--dsh-sb-min-height` (`40px`)
- `--dsh-sb-pad-x` (`10px`) / `--dsh-sb-pad-y` (`8px`)
- `--dsh-sb-gap` (`8px`)
- `--dsh-sb-radius` (`10px`)

## a11y

- The row is a `<button type="button">`, so it is natively Tab-reachable and activates with Enter / Space (`AC-MF-09`); do not replace it with `<div onClick>`.
- `selected` is written as `aria-pressed={true|false}`; the caller should wrap each group of selectable rows in a container with an `aria-label` (such as `<nav aria-label="Conversation list">`), otherwise the user does not know this row of buttons is a group of mutually exclusive choices.
- In the `checkbox` form `aria-pressed` is not rendered (to avoid clashing with the checkbox's `checked` semantics); the `<input>` itself is `readOnly` with `tabIndex={-1}`, so focus stays on the button and the checkbox is only a state display. The `<input>` is `readOnly`, so its `onChange` never fires from a user action; listen for the button's `onClick` to toggle.
- In the `checkbox` form, if the row holds no readable text, `checkboxLabel` is required (`AC-MF-14`).
- Icons must be `aria-hidden="true"`: the `leading` container as a whole is marked `aria-hidden`, and the name comes from the row's text (`AC-MF-14`; checklist `A49`).
- The trailing check is pure decoration (`aria-hidden`): the selected semantics are already expressed by `aria-pressed`.
- Disabling uses the native `disabled` attribute, not an `opacity` class, so focus and clicks are genuinely blocked.
- When the title is too long it is truncated with an ellipsis; truncation is visual only and a screen reader still reads the full text; when the full text should show on hover, the caller adds `title`.
- The focus ring uses `outline` with a negative offset so the sidebar's `overflow: hidden` cannot clip it (`AC-MF-10` / `AC-MF-11` / `AC-MF-12`; checklist `A48`).
- Hit-area conclusion: the row is `min-height: 40px` and `100%` wide, far larger than `AC-MF-01`'s 20×20 and the 28×28 regular control target; in the `checkbox` form the `16×16` checkbox is an in-row state display with `tabIndex={-1}` and is not a hit area of its own.

## checks

Machine-checkable binary criteria (decidable as true / false, ready to become lint rules).

1. The row node is a `<button>` with a default `type` of `button` (`type = 'button'` must not be removed from the source).
2. When `checkbox` is false, `aria-pressed` equals `selected`; when true, `aria-pressed` is not rendered.
3. When `checkbox` is true it renders `<input type="checkbox">` carrying `readOnly` and `tabIndex={-1}`.
4. When `checkbox` is true the `<input>` measures `16×16` and its `accent-color` is `var(--dsw-alias-button-primary-fill)` (checklist `A19`).
5. When `checkbox` is true and the row holds no readable text, `checkboxLabel` must be present (`AC-MF-14`).
6. The `<input>`'s `onClick` calls `stopPropagation`, so the row button's `click` does not fire twice.
7. `selectionStyle` is one of `check` / `fill`, otherwise it falls back to `check`.
8. When `selected` is true and `selectionStyle` is `check`, the trailing check renders; with `fill` the fill class is added to the root node and no check renders.
9. When `icon` is present the `leading` container carries `aria-hidden="true"` and measures `16×16`.
10. `.label` carries all three: `overflow: hidden` + `text-overflow: ellipsis` + `white-space: nowrap`.
11. A `:focus-visible` focus style exists, and the source never writes `outline: none` without putting something in its place (`AC-MF-10`).
12. The focus ring is 2px solid + `--dsw-alias-brand-primary`; the offset is `-2px` (`AC-MF-11` / `AC-MF-12`; checklist `A48`).
13. The disabled state uses the native `disabled`; the source must not contain an `aria-disabled` substitute for `disabled`.
14. The row's minimum height is ≥ 28px (measured `40px`; `AC-MF-01` / `AC-MF-04`; checklist `A43` / `A44`).
15. `.row` carries `min-width: 0` (the button itself is compressible).
16. The class name concatenation order is "base class + selected fill class + external className", with the external class name appended last.
17. Every colour comes from a `--dsw-*` semantic token, with no hard-coded colour value in the source (checklist `A23`).
18. This component must not be used for display only: the source contains no static usage that "can neither be clicked, nor carries an `onClick`, nor changes `aria-pressed`" (human review, see `README.md` "How to use it well").

## demo

- `components/layout/SidebarRow/demo.html`

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist items: `spec/70-checklist.md` (`A19`, `A23`, `A43`, `A44`, `A48`, `A49`)
