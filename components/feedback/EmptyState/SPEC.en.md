---
source: components/feedback/EmptyState/SPEC.md
source-sha256: 68cd46461436b40f
translated-at: 2026-10-05
---
# EmptyState · SPEC

- id: empty-state
- category: feedback
- source: `components/feedback/EmptyState/` (`index.tsx` / `empty-state.module.css`)
- official-counterpart: **The product has a matching UI**: empty-state copy really does render in the product — `EBLgjq_emptyNotice` 284 × 16, `dsh_notification_empty` 530 × 20 (`settings.section`), `enhc-doctor-empty` 564 × 20. The official primitives package has no EmptyState component; that combined "icon + title + description + action" shape was not measured in the product, see "Known deviations"
- human-doc: `README.md` (judgement and trade-offs; this file holds facts only)

## geometry-source

The notation is "value ← file name selector": the left column is the value to the left of the arrow, and the right column is "file name + selector".
The official sources live in `@deepseek-ai/dsh-client-ui-primitives/lib/`. This component has no official counterpart, so the table below lists only the entries with an official anchor; all the rest are in the "Proposed values in this repository" section.

| Value | Source |
| --- | --- |
| `font-size: 14px` / `line-height: 22px` | The official composite token `--dsw-font-s-14` (that is `14px/22px`); the official consumption site `Button.module.css` → `.button` |
| `font-weight: 500` | `Modal.module.css` → `.title` (original comment: figma wt510, renders 500) |
| `font: var(--dsw-font-xs-13)` (`13px/20px`, font family included) | The official composite token `--dsw-font-xs-13`; the official consumption site `ReadBlock.module.css` → `.count` |
| `color: var(--dsw-alias-label-primary)` (title) | `Modal.module.css` → `.title` |
| `color: var(--dsw-alias-label-secondary)` (description) | Colour chosen by this repository, taken from the semantic level (secondary text); the official CSS has no selector of the same structure to anchor to |
| `color: var(--dsw-alias-label-tertiary)` (icon slot) | `Menu.module.css` → `.itemIcon` (the official common use of the secondary / tertiary text colour) |

### Proposed values in this repository (not official values)

- `gap: 12px`: proposed value. A multiple of 4; among spacings of the same family 8px is too tight (the icon and the title stick together) and 16px too loose.
- `margin-top: 6px` between the title and the description: proposed value. The two are two lines of the same piece of copy and should sit tighter than the 12px block spacing, so it takes half the rhythm of the flex `gap` (offset with `calc(-1 * 12px + 6px) = -6px`). 6 is not a multiple of 4; it is chosen deliberately here, for the reason just given.
- `margin-top: 16px` on the action slot: proposed value. The action and the text are two different levels, so the spacing should be clearly larger than the in-block spacing (12px); 16px it is.
- The icon slot `32×32`: proposed value. One step smaller than this repository's `Button` `md` height (36px); 32 is a multiple of 4, and the icon itself is usually passed in as a 24–32px line drawing.
- The icon colour `--dsw-alias-label-tertiary`: proposed colour value. An empty state's icon is atmosphere rather than information, so it takes the tertiary text colour.
- `max-width: 280px`: proposed value. Empty-state copy is usually 1–2 lines; at a font size of 14px, 280px is about 20 Chinese characters to a line, and anything longer should break onto two lines.
- `padding: 32px 12px`: proposed value, a multiple of 4. An empty container needs room to breathe; the 12px on each side is the margin that keeps the text off the edge when the container is squeezed narrow.
- `text-wrap: pretty`: proposed value. It avoids an orphan on the last line; browsers that do not support it ignore the declaration, with no side effects.
- `justify-content: center` + `width: auto`: proposed value. The children of a flex column container are shrink-to-fit, so when their natural width falls short of 280px the title / description shrink to their content width and then centre; `max-width` is only the ceiling for long text — the component never stretches the text across the whole line.

### Implementation notes

- This repository's implementation is original: the geometry is carried by `--dsh-empty-*` variables, and the layout uses a flex column plus a negative-margin fine-tune; no official CSS was copied.
- Every spacing value is a multiple of 4, with the single exception of the `6px` between the title and the description (reason above).

## api

`EmptyStateProps extends HTMLAttributes<HTMLDivElement>`, `forwardRef<HTMLDivElement, EmptyStateProps>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `ReactNode` | none | Icon node, rendered inside the 32×32 icon slot; when omitted, the whole icon slot is not rendered |
| `title` | `ReactNode` | none (required) | Title, rendered as `<p>`, 14/22, weight 500 |
| `description` | `ReactNode` | none | Supporting description, 13/20, secondary colour; when omitted it is not rendered |
| `action` | `ReactNode` | none | Action slot, placed below the title / description with 16px spacing, centred horizontally |
| `className` | `string` | none | Concatenated with the internal class names |
| the rest | `HTMLAttributes<HTMLDivElement>` | — | `role` / `aria-hidden` / `aria-live` and the like pass through to the root node unchanged |
| `ref` | `Ref<HTMLDivElement>` | none | Passes through to the root node |

## states

| State | Trigger | Behaviour |
| --- | --- | --- |
| Full form | `icon` + `title` + `description` + `action` all passed | icon slot → title (12px spacing) → description (6px from the title) → action (16px spacing) |
| Minimal form | only `title` passed | A single centred line of text |
| No icon | `icon` not passed | The `.icon` node is not rendered; the `gap` is carried between the remaining children |
| No description | `description` not passed | `.description` is not rendered, and the negative margin goes with it |
| No action | `action` not passed | `.action` is not rendered |
| Long title | The text's natural width exceeds 280px | It wraps at `max-width`; `text-wrap: pretty` takes effect |
| Narrow title | The text's natural width falls short of 280px | The child shrinks to its content width and centres; it does not fill the container |
| No official counterpart | — | Every state of this component is defined by this repository; there is no "official state" to compare against |

## tokens

DSH semantic tokens (all of them can be looked up in `data/tokens.json`):

- `--dsw-font-xs-13` — the font shorthand of `.description` (`13px/20px`, font family included)
- `--dsw-font-s-14` — the composite token the title's 14/22 corresponds to; this repository writes the equivalent longhand in `.title` (`font-size` + `line-height`) and does not reference the token directly
- `--dsw-alias-label-primary` — `.title` text colour
- `--dsw-alias-label-secondary` — `.description` text colour
- `--dsw-alias-label-tertiary` — `.icon` icon colour

Component-level CSS variables (internal to this repository, not DSH tokens):

- `--dsh-empty-icon-slot` (`32px`)
- `--dsh-empty-gap` (`12px`)
- `--dsh-empty-title-desc-gap` (`6px`)
- `--dsh-empty-action-gap` (`16px`)
- `--dsh-empty-max-w` (`280px`)
- `--dsh-empty-pad-y` (`32px`) / `--dsh-empty-pad-x` (`12px`)

## a11y

- The icon slot carries `aria-hidden="true"`: the icon is only atmosphere and the meaning is carried by the title and the description; there is no empty state that is only an icon with no text at all.
- The title renders as `<p>` and not `<h2>`: an empty state often appears in the middle of a document structure, and forcing in a heading level would break the page's heading outline. When it needs to take part in the outline, the caller puts its own heading outside the empty state.
- An empty state often appears asynchronously (a filter was clicked, the last item was deleted). When it needs announcing, the caller passes `role="status"` through to the root node; `status` is a polite announcement that does not interrupt what is being read.
- If the whole empty state is only a visual placeholder and its content is announced elsewhere already, the caller adds `aria-hidden="true"` to the root node so it is not read twice.
- The button inside the action slot: only an icon-only button needs `aria-label`, a decorative icon needs `aria-hidden` (`AC-MF-14`).
- Contrast: `--dsw-alias-label-tertiary` can fall below the body-text standard under either the dark or the light theme (`AC-MF-05`), so it is used on the icon only; the title and the description use `primary` / `secondary` respectively.
- Hit-area conclusion: this component itself contains no interactive element, so the hit-area requirement does not apply to the root node; the controls inside the action slot are the responsibility of their own components (`AC-MF-01`).

## checks

Machine-checkable binary criteria (a true / false judgement, ready to become lint rules).

1. When `title` is not passed, the rendered result is an empty-state block with no title node — the caller has to pass `title`.
2. When `icon` is not passed, the source renders no `.icon` node (no empty placeholder element).
3. When `description` is not passed, the source renders no `.description` node.
4. When `action` is not passed, the source renders no `.action` node.
5. When `icon` is passed, the icon slot carries `aria-hidden="true"` (`AC-MF-14`; checklist `A49`).
6. The title node is a `<p>`, not an `<h1>`–`<h6>`.
7. `.empty` is a flex column container with `align-items: center` / `justify-content: center`, and its children do not fill the whole line.
8. Both `.title` and `.description` carry a `max-width`, so long text wraps inside the container without overflowing (`AC-MF-15`; checklist `A50`).
9. The `.description` spacing is `calc(-1 * var(--dsh-empty-gap) + var(--dsh-empty-title-desc-gap))`, a net value of `6px`.
10. The root node has no fixed `height` (only `padding` and `gap`), so text is not clipped after it is enlarged (`AC-RC-17`; checklist `B13`).
11. Every colour comes from a `--dsw-*` semantic token, with no hard-coded colour value in the source (checklist `A19` / `A23`).
12. The description's font size is `13px`, no smaller than `B08`'s 12px minimum, and it is paired with its line height (`TK-MF-11`).
13. No spacing value other than `--dsh-empty-*` may appear in this component's styles (self-invented spacing all goes through variables, taking a multiple of 4 or the 6px between the title / description).

## demo

- `components/feedback/EmptyState/demo.html`

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist items: `spec/70-checklist.md` (`A19`, `A23`, `A49`, `A50`, `B08`, `B13`)
