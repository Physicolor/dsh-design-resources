---
source: components/data-display/KeyValueList/SPEC.md
source-sha256: 6da959e47d973703
translated-at: 2026-10-07
---
# KeyValueList · SPEC

- id: key-value-list
- category: data-display
- source: `components/data-display/KeyValueList/` (`index.tsx` / `key-value-list.module.css`)
- official-counterpart: none. The export list of the official `@deepseek-ai/dsh-client-ui-primitives/lib/index.js` has no KeyValueList; the geometry is anchored item by item to existing official selectors (see below)
- human-doc: `README.md` (judgement and trade-offs; this file holds facts only)

## geometry-source

Each row reads as "value ← filename selector".

| Value | Source |
| --- | --- |
| Key `font-size: 13px`, `line-height: 20px` | The official composite token `--dsw-font-xs-13`; the official consumption point is `ReadBlock.module.css` → `.count` (`font: var(--dsw-font-xs-13)`) |
| Key colour `var(--dsw-alias-label-tertiary)` | `Menu.module.css` → `.label` (the tertiary text colour) |
| Value `font-size: 14px`, `line-height: 22px` | `Button.module.css` → `.button` (equivalent to the composite token `--dsw-font-s-14`) |
| Value colour `var(--dsw-alias-label-primary)` | `Button.module.css` → `.button` |
| Divider `0.5px solid var(--dsw-alias-border-l2)` | `markdown/MarkdownText.module.css` → `.markdown hr` (`height: 0.5px` + `background: var(--dsw-alias-border-l2)`) |

`--dsw-font-xs-13` is consumed in the official stylesheets through the `font:` shorthand (ReadBlock, DiffBlock, SearchBlock, WebBlock …); this repository uses only two of its parts, 13px/20px, so it writes them as `font-size` + `line-height` to keep the shorthand from overriding `font-family` as well.

### Values proposed by this repository (not official values)

- `column-gap: 12px` between the key column and the value column: the official UI has no such two-column layout to copy, so this is a multiple of 4 (4×3). 12px is the smallest gap at which the two columns still read as separate at a glance when the key is a short word (2–4 characters).
- `padding: 4px 0` per row: the official list item (`padding: 8px 10px` on Menu's `.item`) is designed for a clickable row; a key-value row is not clickable, so it takes 4px (4×1); the row height itself is set by the 13/20 and 14/22 line boxes, leaving about 8px of breathing room between rows.
- `grid-template-columns: minmax(0, max-content) minmax(0, 1fr)`: the official UI has no matching layout; this is the split this repository chose for "short keys, long values"; `minmax(0, …)` is there so both columns can shrink below 0 without overflowing (the default `min-width: auto` lets a long URL blow out the container).
- `overflow-wrap: break-word` (value): the official files do not use this property on ordinary text; a long URL or path with no spaces has to be able to break.
- `divider` draws between rows with an adjacent-sibling selector: the official `.markdown hr` is a standalone horizontal rule element with no "row divider" form, so this repository uses `.item + .item` to keep the line from appearing before the first row.

### Implementation notes

The implementation is original to this repository: the rules are organised with grid and data attributes (`.list[data-align]` / `[data-value-align]` / `[data-divider]`); the geometry is equivalent, but this is not a copy of the official CSS.

## api

`KeyValueListProps extends HTMLAttributes<HTMLDListElement>`, `forwardRef<HTMLDListElement, KeyValueListProps>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `KeyValueItem[]` (`{ key: ReactNode; value: ReactNode }`) | required | Rendered in the order passed in; no sorting, no de-duplication |
| `align` | `'start' \| 'center'` | `'center'` | Vertical alignment of key and value; the effect is noticeable when a value wraps onto several lines |
| `valueAlign` | `'start' \| 'end'` | `'start'` | Horizontal alignment of the value column; `end` puts the whole column flush with the right edge of the container |
| `divider` | `boolean` | `false` | Draws a 0.5px hairline between rows (not before the first row) |
| `className` | `string` | none | Concatenated with the internal class name, for the caller's own layout |
| Everything else | `HTMLAttributes<HTMLDListElement>` | — | `aria-label` and the like are forwarded to `<dl>` unchanged |
| `ref` | `Ref<HTMLDListElement>` | none | Forwarded to `<dl>` |

`KeyValueItem` / `KeyValueListAlign` / `KeyValueListValueAlign` are exported type aliases. Rows use `index` as the React key (static display data, never reordered, added or removed).

## states

| State | Trigger | What it looks like |
| --- | --- | --- |
| Default | — | The root element `<dl>` is a vertical flex; each row is a `<div>` wrapping `<dt>` / `<dd>` |
| Vertically centred | `align === 'center'` (default) | Row `align-items: center` |
| Top-aligned | `align === 'start'` | Row `align-items: start`; when the value wraps to several lines the key stays at the top |
| Value left-aligned | `valueAlign === 'start'` (default) | The value follows the key column |
| Value right-aligned | `valueAlign === 'end'` | Value column `justify-self: end` + `text-align: end`, the whole column flush with the right edge of the container |
| With divider | `divider === true` | `.item + .item` gets `border-top: 0.5px solid var(--dsw-alias-border-l2)`; no line before the first row |
| No divider | `divider === false` (default) | `data-divider` is not emitted |
| Long value | The value exceeds the remaining width | `overflow-wrap: break-word` wraps it; the container is not blown out |
| Interactive states | — | This component has no hover / active / focus / disabled; it cannot be focused and does not enter the Tab order |

## tokens

DSH semantic tokens (all of them can be looked up in `data/tokens.json`):

- `--dsw-alias-label-tertiary` — key text colour
- `--dsw-alias-label-primary` — value text colour
- `--dsw-alias-border-l2` — divider colour

Component-level CSS variables (internal to this repository, not DSH tokens; defined on `.list`):

- `--dsh-kv-column-gap` = `12px`
- `--dsh-kv-row-padding` = `4px`

## a11y

- The semantics come from native elements: `<dl>` / `<dt>` / `<dd>` let a screen reader read every key-value pair as "term — description", with no `role` or `aria-*` needed. That is why this is not spelled out with `<div>` + `<span>`.
- When the whole group needs a name (for example "request headers"), use an outer `<section aria-labelledby>`, or pass `aria-label` straight to the `<dl>`; do not add roles to `<dt>` / `<dd>`.
- No focus or interaction is set: a key-value pair is pure display content. If the value itself is a link or a button, put the interactive element inside the `<dd>` and make sure it has readable text.
- The value colour `--dsw-alias-label-primary` and the key colour `--dsw-alias-label-tertiary` both get their contrast from host tokens in either theme; do not nest another colour-changing element inside the `value` to lighten it.
- Long values wrap rather than truncate (`overflow-wrap: break-word`), so there is never a case where the complete value cannot be copied.
- The default `margin-inline-start` of `dd` has been zeroed, so the browser's default indent does not break the two-column alignment.

## checks

Binary constraints a machine can check (decidable as true / false, and can be turned directly into lint rules).

1. The root element is a `<dl>`, every key-value pair is carried by a `<dt>` and a `<dd>`, and the two are wrapped by the same grouping element.
2. No `role` is emitted on `<dl>` / `<dt>` / `<dd>` other than what is forwarded from the outside.
3. `items` renders in the order passed in: the source must not call `sort` / `filter` / `reverse` on `items`.
4. When `divider === true`, the divider falls only on `.item + .item`, and there is no line before the first row.
5. When `valueAlign === 'end'`, the value column declares both `justify-self: end` and `text-align: end`.
6. The value element declares `overflow-wrap: break-word`.
7. Both the key and the value element declare `min-width: 0` (grid children can shrink and do not overflow the container).
8. `<dd>`'s `margin` is zeroed (`margin: 0`); the browser's default `margin-inline-start` is not kept.
9. The component emits no `tabIndex` and binds no `onClick` / `onKeyDown` (pure display).
10. The value text must not be wrapped in an extra colour-changing element (human review, see `README.md` "How to use it well").
11. The field order is decided by the caller before `items` is passed in; the component must not rely on reordering to "sort out" the order (same root as item 3, human review).

## demo

- `components/data-display/KeyValueList/demo.html`

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
