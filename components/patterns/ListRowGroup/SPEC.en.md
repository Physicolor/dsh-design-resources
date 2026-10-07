---
source: components/patterns/ListRowGroup/SPEC.md
source-sha256: 03f76f194a7bb306
translated-at: 2026-10-07
---
# ListRowGroup · SPEC

- id: list-row-group
- category: patterns
- source: `components/patterns/ListRowGroup/` (`index.tsx` / `list-row-group.module.css`)
- official-counterpart: **The product has a counterpart UI**: a row group with a group title is rendered by the product's own CSS modules — `fO69Vq_groupTitle` 28 × 22 + `count` 8 × 19 (slot=main), `RotMhW_groupTitle` 56 × 22 + `groupToggle` 76 × 22 (slot=settings.plugins.tab), `cc-group` 564 × 225, `KZf9OG_groupHead` 564 × 16 (slot=settings.section). The official `lib/index.js` export list has no row group; every geometry value is taken from the matching selector in the official `Menu.module.css`
- human-doc: `README.md` (judgements and trade-offs; this file holds facts only)

## geometry-source

Read every row as "value ← filename selector".

| Value | Source |
| --- | --- |
| Group title `padding: 8px 10px`, `font-size: 12px`, `line-height: 16px` | `Menu.module.css` → `.label` |
| Group title colour `--dsw-alias-label-tertiary` | `Menu.module.css` → `.label` (`color`) |
| Row `min-height: 40px`, `padding: 8px 10px`, `border-radius: 10px`, `gap: 8px`, `font-size: 14px`, `line-height: 22px` | `Menu.module.css` → `.item` |
| Row text colour `--dsw-alias-label-primary` | `Menu.module.css` → `.item` (`color`) |
| Row hover background | `Menu.module.css` → `.item:hover:not(:disabled)` |
| Row active background | `Button.module.css` → `.ghost:active`'s `--dsw-alias-interactive-bg-active` |
| Row disabled `opacity: 0.4` | `Menu.module.css` → `.item:disabled` |
| Leading icon container `16×16` + `--dsw-alias-label-tertiary` | `Menu.module.css` → `.itemIcon` |
| Row text truncation (`min-width: 0` / `overflow: hidden` / `text-overflow: ellipsis` / `white-space: nowrap`) | `Menu.module.css` → `.itemLabel` |
| Row gap `0` | `Menu.module.css` → `.list` (`gap: 0`) |
| Separator `height: 0.5px`, `margin: 4px 2px`, `background: var(--dsw-alias-border-l1)` | `Menu.module.css` → `.separator` |
| Automatic hairline width and colour (`0.5px` + `--dsw-alias-border-l1`) | Same as above (`Menu.module.css` → `.separator`), carried by `border-top` instead |
| Trailing content `gap: 8px` | `Menu.module.css` → `.item` (`gap: 8px`), `.check`'s `flex: none` |

### Proposed here (no official source)

- The automatic hairline is implemented with `.rows > * + * { border-top: 0.5px solid var(--dsw-alias-border-l1) }`:
  officially the caller inserts a standalone `.separator` element. This repository draws it automatically by default (sparing the caller the insertion work),
  but does **not** copy the official white space of 2px on each side and 4px above and below — the border sits flush against the row edge, and the row already carries 8px of padding.
  When you need the official separator with its white space, pass `separator="none"` and insert `ListRowSeparator` yourself.
  Using both at once produces a double line.
- `.groupLabel`'s `font-weight: inherit`: the official `.label` sets no font weight (it inherits from the parent),
  while this component's title carries its semantics with `<hN>`, which browsers bold by default, so inheriting explicitly restores the official look.
- The `interactive` row's `:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px }`:
  the official `Menu.module.css` defines no focus style on `.item`; the declaration matches the official
  `Switch.module.css` `:focus-visible`.
- The `interactive` row's active background uses `--dsw-alias-interactive-bg-active`: the official `Menu.module.css` defines
  hover only, with no `:active`; this component borrows the same token from `.ghost:active` in the official `Button.module.css` so a press gives feedback.
- `interactive` defaults to `false`: the official `.item` is a button to begin with (a menu cell is always clickable). A row in
  a row group is often display only (with an action button on the right), and making it a button by default would turn "clicked and nothing happened" into
  the norm; so the default is `<div>`, and the caller chooses explicitly.

### Implementation notes

The implementation is original to this repository (geometry carried by CSS variables plus single-class switching); it does not copy the official CSS source.

## api

Three components are exported: `ListRowGroup`, `ListRow`, `ListRowSeparator`.

`ListRowGroupProps extends Omit<HTMLAttributes<HTMLElement>, 'title'>`, `forwardRef<HTMLElement, ListRowGroupProps>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `ReactNode` | none | Group title; when it is not passed, no title row renders and no `aria-labelledby` is emitted |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | The heading's semantic level |
| `separator` | `'hairline' \| 'none'` | `'hairline'` | Divider between rows: an automatic hairline, or left to the caller to insert `ListRowSeparator` |
| `className` | `string` | none | Joined to the internal class name |
| Everything else | `Omit<HTMLAttributes<HTMLElement>, 'title'>` | — | Passed through to the root `<section>` |
| `ref` | `Ref<HTMLElement>` | none | Passed through to the root `<section>` |

`ListRowProps extends HTMLAttributes<HTMLElement>`, `forwardRef<HTMLElement, ListRowProps>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `interactive` | `boolean` | `false` | Whether the whole row renders as `<button type="button">`; once on, the row must contain no other interactive control |
| `disabled` | `boolean` | `false` | Takes effect only with `interactive`; passed through to the native `disabled` |
| `leading` | `ReactNode` | none | Leading content, placed in the 16×16 icon container |
| `trailing` | `ReactNode` | none | Trailing content (a count, a state dot, an arrow) |
| `className` | `string` | none | Joined to the internal class name |
| Everything else | `HTMLAttributes<HTMLElement>` | — | With `interactive`, passed through to `<button>` as `ButtonHTMLAttributes<HTMLButtonElement>`; otherwise passed through to `<div>` |
| `ref` | `Ref<HTMLElement>` | none | Passed through to the root element |

`ListRowSeparatorProps = HTMLAttributes<HTMLDivElement>`, `forwardRef<HTMLDivElement, ListRowSeparatorProps>`; it always emits `aria-hidden="true"`.

`ListRowHeadingLevel` / `ListRowSeparatorMode` are exported type aliases.

## states

| State | Trigger | Presentation |
| --- | --- | --- |
| Group has a title | `title != null` | Renders `<hN id>`, and the root `<section>` emits an `aria-labelledby` pointing at it |
| Group has no title | `title == null` | No title row renders and no `aria-labelledby` is emitted |
| Automatic hairline | `separator === 'hairline'` (default) | `.rows > * + *` gets `border-top: 0.5px solid var(--dsw-alias-border-l1)` |
| Manual separator | `separator === 'none'` | No border is added; the caller inserts `ListRowSeparator` |
| Display row | `interactive === false` (default) | Root element `<div>`, no `cursor: pointer`, no hover / active / focus styles, does not enter the Tab order |
| Interactive row | `interactive === true` | Root element `<button type="button">`, `cursor: pointer` |
| hover | `.rowInteractive:hover:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-hover)` |
| active | `.rowInteractive:active:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-active)` |
| disabled | `.rowInteractive:disabled` | `opacity: 0.4` + `cursor: not-allowed` |
| Keyboard focus | `.rowInteractive:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px` (`§ proposed here`) |
| Text too long | The row title exceeds the available width | `overflow: hidden` + `text-overflow: ellipsis` + `white-space: nowrap` |
| No leading / no trailing | `leading` / `trailing` is `null` | The corresponding container does not render |

## tokens

DSH semantic tokens (all findable in `data/tokens.json`):

- `--dsw-alias-label-tertiary` — group title colour, leading icon colour, trailing content colour
- `--dsw-alias-label-primary` — row text colour
- `--dsw-alias-border-l1` — the colour of the automatic hairline and of `ListRowSeparator`
- `--dsw-alias-interactive-bg-hover` — row hover background
- `--dsw-alias-interactive-bg-active` — row active background (`§ proposed here`)
- `--dsw-alias-brand-primary` — focus ring colour (`§ proposed here`)

This component defines no component-level CSS variables; the geometry is written straight on the classes.

## a11y

- The group title is a real heading element (default `<h3>`, adjustable with `headingLevel`) and the target of `aria-labelledby`, so assistive technology takes it as the name of the group. The heading text has to read on its own ("Startup behaviour", not "Behaviour").
- `interactive` is only for rows where the whole row is one action: it then renders `<button type="button">`, and both the keyboard and screen readers work normally. Never put a button or a link inside the row — a nested button is invalid HTML, and what a click means is unclear.
- The default `<div>` row is not focusable and does not enter the Tab order, and that is deliberate: when the row holds a button, focus should land on the button rather than stopping on the row first. Do not add an `onClick` to the `<div>` without a role just to "make the whole row clickable".
- For text truncated with an ellipsis inside a row: a screen reader reads the full text, while sighted users cannot. Key information has to be reachable on hover through a `title` attribute or by expanding the row.
- The row height is fixed at 40px, and a control inside the row must not have a hit area smaller than 28×28 (see `Button`'s `sm` size, `AC-MF-01`). Put a 28px icon button into a 40px row and there is still 8px of padding; do not use negative margins to "align" it.
- The separator is pure decoration (`ListRowSeparator` carries `aria-hidden="true"`) and carries no information; do not express grouping hierarchy with "line / no line" — the group title expresses it.
- An interactive row's focus ring uses `outline` rather than `box-shadow`, matching the official `Switch.module.css` `:focus-visible` (`AC-MF-11`).

## checks

Machine-checkable binary constraints (decidable true / false, ready to become lint rules directly).

1. When `title` is present, the root `<section>`'s `aria-labelledby` points at the heading element's `id`; when `title` is absent that attribute is not emitted.
2. `headingLevel` renders as one of `h2`–`h6`, never `h1`.
3. With `separator === 'hairline'`, the automatic hairline falls only on `.rows > * + *` (no line before the first row).
4. With `interactive === true` the root element is `<button>` with `type="button"`; with `interactive === false` the root element is `<div>`.
5. A row with `interactive === true` must contain no `<button>` / `<a>` / `[role="button"]` (the caller's responsibility; a lint can scan the demos and the doc examples).
6. A row with `interactive === false` emits no `tabIndex` and binds no `onClick` / `onKeyDown`.
7. With `interactive === true` a `:focus-visible` focus style exists, specified as `2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px` (`AC-MF-10` / `AC-MF-11`).
8. A control inside the row has a hit area ≥ 28×28 (`AC-MF-01`, the regular-control target, matching `A43` in `spec/70-checklist.md`).
9. `ListRowSeparator` always emits `aria-hidden="true"`.
10. The row text container declares `overflow: hidden` / `text-overflow: ellipsis` / `white-space: nowrap` together.
11. `interactive`'s default is `false` (`interactive = false` in the source must not be removed).
12. `headingLevel`'s default is `3`; `separator`'s default is `'hairline'`.
13. `ListRowSeparator`'s geometry is `height: 0.5px` / `margin: 4px 2px` / `background: var(--dsw-alias-border-l1)`.
14. Key information truncated by the ellipsis must have a way to be seen in full: the row element carries a `title`, or the row offers an expansion entry point (human review, see "How to use it well" in `README.md`).
15. A group holds no more than 6 rows; beyond that, regroup (`FL-RC-05` advises no more than 6 visible controls in one section, matching `B01` in `spec/70-checklist.md`, human review).

## demo

- `components/patterns/ListRowGroup/demo.html`

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist entry: `spec/70-checklist.md` (`A43`, `A48`, `B01`)
- Accessibility clauses: `spec/60-accessibility.md` (`AC-MF-01`, `AC-MF-10`, `AC-MF-11`)
- Layout clauses: `spec/10-frame-layout.md` (`FL-RC-05`)
