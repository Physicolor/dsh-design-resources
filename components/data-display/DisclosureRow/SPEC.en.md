---
source: components/data-display/DisclosureRow/SPEC.md
source-sha256: 76c104e20720a53e
translated-at: 2026-10-05
---
# DisclosureRow · SPEC

- id: disclosure-row
- category: data-display
- source: `components/data-display/DisclosureRow/` (`index.tsx` / `disclosure-row.module.css`)
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/DisclosureRow.module.css` and `lib/index.js` in the same directory
- human-doc: `README.md` (judgement and trade-offs; this file holds facts only)

## geometry-source

Values are read one by one from the official `DisclosureRow.module.css` / `lib/index.js`; the notation is "value ← filename selector".

| Value | Source |
| --- | --- |
| `display: flex` / `flex-direction: column` / `width: 100%` / `min-width: 0` | `DisclosureRow.module.css` → `.root` |
| `position: relative` / `overflow: hidden` / `display: flex` / `align-items: center` / `min-width: 0` | `DisclosureRow.module.css` → `.row` |
| Row height `24px` | `DisclosureRow.module.css` → `.row` (officially `height: calc(24px + var(--dsh-content-font-delta, 0px))`, taking the delta default of 0) |
| `cursor: pointer` | `DisclosureRow.module.css` → `.row[data-expandable]` |
| leading `16×16` / `position: relative` / `flex: none` / `inline-flex` centred / `margin-right: 6px` / `padding: 0` / `border: none` / `background: none` | `DisclosureRow.module.css` → `.leading` |
| leading colour `var(--dsw-alias-label-tertiary)` | `DisclosureRow.module.css` → `.leading` |
| leading glyph `14×14` | `DisclosureRow.module.css` → `.leading svg:not([data-state])` (file comment: a StateDot carrying `data-state` keeps its own fixed size and does not go through this rule) |
| `cursor: pointer` | `DisclosureRow.module.css` → `button.leading` |
| `opacity: 1` / `transition: opacity 100ms ease` | `DisclosureRow.module.css` → `.iconIdle` |
| `position: absolute` / `inset: 0` / `margin: auto` / `opacity: 0` / `transition: opacity 100ms ease` | `DisclosureRow.module.css` → `.chevronHover` |
| On hover `iconIdle → 0`, `chevronHover → 1` | `DisclosureRow.module.css` → `.row:hover .iconIdle`, `.row:hover .chevronHover` |
| Title `flex: none` / `13px` / `line-height: 24px` / `color: var(--dsw-alias-label-secondary)` | `DisclosureRow.module.css` → `.title` (officially `var(--dsh-content-font-size-secondary, 13px)` and `calc(24px + delta)`, taking the defaults) |
| The collapsed state renders "icon + hover chevron" and the expanded state renders the chevron only; the chevron preview follows `expandable` by default | `lib/index.js` → `previewChevron = expandable` and `collapsedLeading` |
| When expandable and the whole row is clickable: `role="button"` / `tabIndex=0` / `aria-expanded` / `onClick` / `onKeyDown` | `lib/index.js` → the `rowExpands` branch |
| Icon-button-only form: `<button type="button" aria-expanded>` | `lib/index.js` → the `expandable && !rowExpands` branch |
| Enter and Space trigger it, with `event.preventDefault()` | `lib/index.js` → `toggleFromKeyboard` |
| `collapsedContent` renders only when not expanded | `lib/index.js` → `(keepContentWhenOpen \|\| !open) && collapsedContent` (this repository does not expose `keepContentWhenOpen`, fixing it at `false`) |
| Chevron shape: 14×14, 1.4px stroke | Drawn by this repository, **the official path data was not copied**; officially `IconChevronDownOutline14` is used (a 14×14 filled outline shape). Officially the chevron points the same way in both the "collapsed hover" and the "expanded" state (no rotation), and this component does the same |

### Values proposed by this repository (not official values)

- `.row:focus-visible` → `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`. The official `DisclosureRow.module.css` has no focus style at all. The spec comes from `AC-MF-11` in `spec/60-accessibility.md`, written the same way as the `:focus-visible` of the official `Switch.module.css`.
- `.leading:focus-visible` → the same 2px brand-primary, `outline-offset: -2px` (an inner offset). The official `.row` has `overflow: hidden`, the leading box sits flush against the row's left edge, and a focus ring with a 2px outer offset would be clipped away; `AC-MF-12` explicitly requires switching to an inner offset in this situation.
- `button.leading::after { inset: -4px }` → a transparent pseudo-element with no background and no border, extending the icon-only form's hit area by 4px on each side. The 4px on the left is clipped away by the `.row`'s `overflow: hidden`, so **the effective hit area is 20×24** (`AC-MF-01`'s minimum is 20×20; the regular 28×28 control target is not reached, which is why `expandOnRowClick` is the better recommendation). The visible geometry does not change.
- `@media (prefers-reduced-motion: reduce)` branch → `transition: none`. The official stylesheet has no such branch. The reason recorded in the original README: `MO-MF-09` in `spec/40-motion.md` is mandatory; the matching machine-checkable entry is `A34` in `spec/70-checklist.md` (a stylesheet without `prefers-reduced-motion` is a violation).

### Decisions in this repository (rewriting official behaviour, not adding values)

- The official `.row` height is `calc(24px + var(--dsh-content-font-delta, 0px))`, the `.leading` box is `calc(16px + delta)`, the in-row glyph is `calc(14px + delta)`, and the title font size is `var(--dsh-content-font-size-secondary, 13px)` — the whole set exists to follow DSH's font-size preference (the host publishes `--dsh-content-font-delta` on `body`). **This repository deliberately drops that axis and fixes the four values to their official defaults at delta = 0** (24px / 16px / 14px / 13px-24px).
  1. These two variables are not in the token table `website/css/dsh-tokens.css` that this repository reads (a full-text grep for `content-font-delta` and `content-font-size-secondary` returns nothing); the host publishes them at runtime, so a third-party plugin cannot obtain them in its own demo or on a standalone page.
  2. This repository positions itself as "zero-dependency source you can use as is", and an adaptive axis that silently fails outside the host only adds to the cost of understanding.
  An author who needs to follow the font preference only has to swap the four CSS variables back to the official `calc(... + var(--dsh-content-font-delta, 0px))` set, with the geometry structure unchanged.
- The implementation is original to this repository: the geometry is carried by component-level CSS variables on `.root` and the rules are reorganised, with the values equivalent to the official ones one by one — it is not a copy of the official CSS.

## api

`DisclosureRowProps` (`index.tsx`), `forwardRef<HTMLDivElement, DisclosureRowProps>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `ReactNode` | none | The in-row icon of the collapsed state; it sits in a 16×16 box and renders at 14×14 inside; it fades out when the whole row is hovered |
| `title` | `ReactNode` | required | The row title, 13px / 24px |
| `open` | `boolean` | required (controlled) | Whether it is expanded; the component keeps no state of its own |
| `expandable` | `boolean` | required | Whether it can be expanded; at `false` there is no chevron, no interaction semantics, and it cannot be tabbed to |
| `onToggle` | `() => void` | required | The expand / collapse callback; both the keyboard and the click go through it |
| `expandOnRowClick` | `boolean` | `false` | Whether the whole row can be clicked to toggle; at `false` only the 16×16 icon button on the left can toggle |
| `collapsedContent` | `ReactNode` | none | Secondary information attached after the title while collapsed; it is not rendered once expanded |
| `children` | `ReactNode` | none | The detail rendered below the row once expanded |
| `className` | `string` | none | The root element's class name, for layout from the outside |
| `ref` | `Ref<HTMLDivElement>` | none | Forwarded to the root element |

## states

| State | Trigger | Behaviour |
| --- | --- | --- |
| Collapsed | `open === false` | The leading box renders "icon + hover chevron" (when `expandable` is true); `collapsedContent` renders |
| Expanded | `open === true` | The leading box renders the chevron only; `collapsedContent` does not render; `children` renders below the row |
| Not expandable | `expandable === false` | No chevron, no `role`, no `tabIndex`, no `aria-expanded`, no `cursor: pointer` |
| Whole row clickable | `expandable && expandOnRowClick` | The row itself is the button, `cursor: pointer` (`.row[data-expandable]`) |
| Icon only clickable | `expandable && !expandOnRowClick` | The row is not a button, the leading box is a `<button type="button">` |
| Hover (collapsed) | `.row:hover` | `.iconIdle` → `opacity: 0`, `.chevronHover` → `opacity: 1`, 100ms ease each, and only `opacity` moves |
| Keyboard focus | `:focus-visible` | 2px solid `--dsw-alias-brand-primary`; `.row` takes a 2px outer offset, `button.leading` an inner offset of -2px |
| Reduced motion | `prefers-reduced-motion: reduce` | `transition: none` on `.iconIdle` / `.chevronHover` |
| Disabled | — | This component has no `disabled` state; use `expandable={false}` when it must not be interactive |

## tokens

DSH semantic tokens (all of them can be looked up in `data/tokens.json`):

- `--dsw-alias-label-tertiary` — the colour of the leading icon and chevron
- `--dsw-alias-label-secondary` — the title colour
- `--dsw-alias-brand-primary` — the focus ring colour (a value proposed by this repository)

Component-level CSS variables (internal to this repository, not DSH tokens; defined on `.root`):

- `--dsh-disclosure-row-height` = `24px`
- `--dsh-disclosure-leading-size` = `16px`
- `--dsh-disclosure-glyph-size` = `14px`
- `--dsh-disclosure-title-size` = `13px`

## a11y

- Whole-row button form (`expandable && expandOnRowClick`): the row element carries `role="button"`, `tabIndex={0}`, `aria-expanded={open}`, `onClick`, `onKeyDown`.
- Icon-button-only form (`expandable && !expandOnRowClick`): `aria-expanded={open}` lands on the 16×16 `<button type="button">` on the left, and the row itself is not a button.
- Keyboard: `toggleFromKeyboard` handles Enter and Space; Space calls `event.preventDefault()` (otherwise the page scrolls). In the icon-only form the native `<button>` provides Enter / Space.
- The expanded content area has no `role="region"` and no `aria-controls` association with the row (that is how the official implementation is). The expanded / collapsed state is carried by the row's `aria-expanded`.
- The expandability cue in the collapsed state is the **shape** difference between "icon" and "chevron", and does not rely on colour (`AC-MF-07`). The hover cue exists for the mouse only; a keyboard user relies on the focus ring and `aria-expanded`.
- The focus style uses `outline` rather than `box-shadow`: `.row` has `overflow: hidden`, while `outline` is drawn on the element's own box and is not clipped.
- The 24px row height is below `AC-MF-01`'s 28×28 regular hit-area target; where touch is the primary input, use `expandOnRowClick`, or give a larger row spacing on the outside.

## checks

Binary constraints a machine can check (decidable as true / false, and directly expressible as lint rules).

1. When `expandable && expandOnRowClick` is true, the row element carries `role="button"`, `tabIndex` and `aria-expanded` at the same time. No → violation (`CT-MF-11`'s counter-example reading is "a `role="button"` appears with no keyboard event handling").
2. When `expandable && expandOnRowClick` is true, the row element has `onKeyDown` bound, and that handler covers Enter and Space and calls `preventDefault()`.
3. When `expandable && !expandOnRowClick` is true, `aria-expanded` appears on the leading `<button>`, and that element is `type="button"`.
4. When `expandable === false`, no `role`, `tabIndex`, `aria-expanded`, `data-expandable` or chevron shape is output.
5. The component holds no expanded state: `useState` / `useReducer` for `open` does not appear in the source.
6. `collapsedContent` renders only when `open === false`.
7. The icon-only form's interactive element has an effective hit area ≥ 20×20 (`AC-MF-01`'s minimum): decided jointly by `button.leading::after { inset: -4px }` and the clipping on the left side of `.row`, it is actually 20×24 → passes; whether it reaches the 28×28 regular target → not met.
8. A `:focus-visible` focus style exists, and it is not removed with `outline: none` and left with no replacement (`AC-MF-10`).
9. A control inside an `overflow: hidden` container uses an inner-offset focus ring (`AC-MF-12`): `button.leading`'s `outline-offset` is a negative value.
10. The stylesheet includes a `@media (prefers-reduced-motion: reduce)` branch (`A34`, machine-checked).
11. The stroke width of the self-drawn chevron falls in `IC-MF-05`'s suggested range 1.25–1.5 (currently 1.4).
12. The expandability cue in the collapsed state does not rest on colour alone: a shape difference (icon vs chevron) exists before and after hover (`AC-MF-07`).
13. The expanded and collapsed states use a chevron of the same direction, with no rotation.
14. `keepContentWhenOpen = false` is fixed across the whole repository: that prop does not appear in the source.

## demo

- `components/data-display/DisclosureRow/demo.html`

## Real scenes (reconciled against docs/reference screenshots)

| Shot | Region | Context | As captured |
| --- | --- | --- | --- |
| `02-session.png` | The conversation stream, before each tool call | `已完成分析` / `已读取文件` / `已写入文件并执行了命令` / `修改了文件并执行了命令` / `正在运行命令` | Row height 24; leading box 16×16 (the embedded icon about 14); 6px from the icon to the text; title 13px `label-secondary` |
| `07-composer.png` | Above the composer | `深度求索中，用时 7 分 25 秒 …` | The same geometry, but the icon and the text are blue |

Reconciliation conclusion: the leading 16×16 + `margin-right: 6px` + 13px title match `.leading` / `.title` one by one.

### Known deviations (added by the screenshot reconciliation)

- The `深度求索中，用时 X 分 X 秒 …` row **has the same geometry as this component**, but its icon and text are tinted business blue, not `.title`'s `label-secondary`. That is a caller's tinting of the title, **not counted as this component's default look**, and it is not covered in the demo.
- The screenshots capture **collapsed states only**: the `iconIdle → chevronHover` shape swap on `.row:hover`, and the expanded body (`data-expandable` + `aria-expanded="true"`), have no evidence in the screenshots, and the matching groups are marked "not covered by the screenshots" in the demo.

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist entries: `spec/70-checklist.md` (`A02`, `A20`, `A34`, `A38`, `A43`, `A46`, `A48`)
