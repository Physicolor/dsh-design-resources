---
source: components/patterns/PanelSeat/SPEC.md
source-sha256: d947a4283c0fca51
translated-at: 2026-10-07
---
# PanelSeat · SPEC

- id: panel-seat
- category: patterns
- source: `components/patterns/PanelSeat/` (`index.tsx` / `panel-seat.module.css`)
- official-counterpart: none. The export list of the official `lib/index.js` has no such skeleton; every piece of geometry is anchored to a checked value, item by item below
- human-doc: `README.md` (judgement and trade-offs; this file holds facts only)

## geometry-source

Read each row as "value ← filename selector".

| Value | Source |
| --- | --- |
| Container corner radius `12px` | `ReadBlock.module.css` → `.block` (`--dsl-read-radius: 12px`) |
| `surface` background colour `--dsw-alias-markdown-code-block` | `ReadBlock.module.css` → `.block` (`background`) |
| Title row `gap: 12px` | `ReadBlock.module.css` → `.banner` (`gap: 12px`) |
| Title `font-size: 14px` / `line-height: 22px` | `Button.module.css` → `.button`, `Modal.module.css` → `.description` |
| Title `font-weight: 500` | `Modal.module.css` → `.title`, `Tag.module.css` → `.tag` (`font-weight: 500`) |
| Hairline at the bottom of the title row `0.5px` + `--dsw-alias-border-l1` | `Menu.module.css` → `.separator` (`height: 0.5px` / `background: var(--dsw-alias-border-l1)`) |
| Action area `gap: 4px` | `Button.module.css` → `.button` (`gap: 4px`) |
| `inset` padding `12px 16px` | `HoverCard.module.css` → `.card` (`padding: 12px 16px`) |

Two of these are "borrowed" rather than "serving the same purpose", explained below:

- The official `.separator` is a standalone element; this component carries the same **0.5px width + `--dsw-alias-border-l1` colour** on a `border-bottom` instead, so the official "4px of white space above and below" never appears — between the title row and the body there is only one run of padding.
- The `12px 16px` comes from the official `HoverCard`'s overlay padding; this component is likewise "a small block floating above the content", so the magnitude is comparable.

### Proposed here (no official source)

- `.seat` uses `display: inline-flex` + `max-width: 100%`: **inside the conversation flow it should not fill the width**. The official `ReadBlock.module.css` `.block` sets no width (block-level, following its parent container), and its width is decided by the host's content column; PanelSeat is a block a plugin adds on its own, and shrinking to its content width stops a two-line notice from taking over the whole message area. When it needs to fill, the parent container gives it `width: 100%`.
- Title row `padding-bottom: 8px`: a multiple of 4; leaves some breathing room between the title text and the hairline.
- Body `padding-top: 12px`: a multiple of 4; the same magnitude as `--dsh-pseat-gap: 12px`, so the rhythm above and below the title row matches.
- `role="group"` rather than letting `<section>` become a `region` landmark: there is no official convention for this, so this repository chooses "produce no landmark" — a single conversation can hold a dozen PanelSeats, and if every one registered as `region` the screen reader's landmark list would lose its meaning. When a landmark is needed, pass `role="region"` explicitly.
- `inset` defaults to `false`: the conversation flow's row spacing is controlled by the host (`spec/10-frame-layout.md` `FL-AD-07` suggests 16px). An extra ring of padding on the container would stack with the host spacing and double the white space; turn `inset` on only when `variant="surface"` needs its own paper-like feel.
- First and last body elements `margin-top/bottom: 0`: avoids stacking with the container padding into double white space.

### Implementation notes

The implementation is original to this repository (geometry carried by CSS variables + a single class toggle); no official CSS source was copied.

## api

`PanelSeatProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>`, `forwardRef<HTMLDivElement, PanelSeatProps>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `ReactNode` | required | The title row text; `aria-labelledby` points at it |
| `actions` | `ReactNode` | none | The action area on the right of the title row, usually one `sm`-sized `Button` |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | The semantic level of the title |
| `variant` | `'plain' \| 'surface'` | `'plain'` | `plain` is transparent; `surface` fills with `--dsw-alias-markdown-code-block` |
| `inset` | `boolean` | `false` | Whether to add `12px 16px` of padding to the container |
| `role` | `string` | none (the component fills in `'group'` by default) | When passed explicitly it overrides the default role, for example `'region'` |
| `className` | `string` | none | Joined to the internal class name |
| Everything else | `Omit<HTMLAttributes<HTMLDivElement>, 'title'>` | — | Forwarded to the root `<div>` |
| `ref` | `Ref<HTMLDivElement>` | none | Forwarded to the root `<div>` |

`PanelHeadingLevel` is an exported type alias.

## states

| State | Trigger | Behaviour |
| --- | --- | --- |
| Default | Always | The root element is `display: inline-flex` + `flex-direction: column` + `max-width: 100%`, corner radius 12px |
| Transparent | `variant === 'plain'` (default) | No background colour; typography and layout set it apart from the parent container |
| Paper-like surface | `variant === 'surface'` | `background: var(--dsw-alias-markdown-code-block)` |
| No padding | `inset === false` (default) | The container adds no padding; spacing is left to the host |
| With padding | `inset === true` | `padding: 12px 16px` |
| Default role | `role` not passed explicitly | The root element is `role="group"`, producing no landmark |
| Explicit landmark | `role="region"` passed in | The root element's role is overridden; it becomes a region you can jump to |
| Title too long | The title exceeds the available width | `text-overflow: ellipsis` + `white-space: nowrap` + `overflow: hidden` |
| No action area | `actions == null` | The action area is not rendered |
| First and last body elements | Always | `.body > :first-child { margin-top: 0 }`, `.body > :last-child { margin-bottom: 0 }` |
| Focus and interaction | — | The component itself sets no `tabIndex`, does not `autoFocus` and listens for no global keys; hover / active / disabled are all undefined |

## tokens

DSH semantic tokens (all of them can be looked up in `data/tokens.json`):

- `--dsw-alias-label-primary` — title and body text colour
- `--dsw-alias-border-l1` — the hairline at the bottom of the title row
- `--dsw-alias-markdown-code-block` — the `surface` form's background colour

Component-level CSS variables (internal to this repository, not DSH tokens; defined on `.seat`):

- `--dsh-pseat-radius` = `12px`
- `--dsh-pseat-pad-x` = `16px`
- `--dsh-pseat-pad-y` = `12px`
- `--dsh-pseat-gap` = `12px`
- `--dsh-pseat-header-gap` = `8px` (`§ proposed values`)
- `--dsh-pseat-action-gap` = `4px`
- `--dsh-pseat-body-gap` = `12px` (`§ proposed values`)

## a11y

- It does not steal focus: the component sets no `tabIndex`, does not `autoFocus`, listens for no global keys and does not move focus on mount. A plugin inserting a block should not take the user's input focus out of the input box.
- The title row is a real heading element (default `<h3>`), `aria-labelledby` points at it, and assistive technology can announce "which block this is". When several PanelSeats are inserted in one conversation, their title texts have to be distinguishable from one another ("Build output", not "Result").
- `role="group"` by default, producing no landmark; pass `role="region"` only when the user should be able to jump between blocks with a shortcut, and keep the count down (`FL-RC-05` suggests no more than 6 visible controls in the same section, and the same goes for landmarks: fewer is better).
- An over-long title is truncated with an ellipsis (`text-overflow: ellipsis`). Do not put essential information in the title with only a visual ellipsis and no `title` attribute — a screen reader reads it out, a sighted user cannot read it in full; put essential information in the body.
- The buttons in `actions` must carry readable text or an `aria-label` themselves (icon-only buttons especially).
- Interactive controls in the body follow order: `role="group"` does not change the Tab order; in DOM order the keyboard goes through the title row's actions and then into the body.
- The margins of the first and last body elements are zeroed, so they do not stack with the container padding into double white space (this does not affect focus rings or hit areas).

## checks

Binary constraints a machine can check (decidable as true / false, and directly expressible as lint rules).

1. The root element emits `aria-labelledby`, and it points at the title element's `id`.
2. When `role` is not passed explicitly, the root element's role is `group`; when `role` is passed, the passed value wins (it must not be overridden by the default).
3. The source contains no `tabIndex`, `autoFocus`, `document.addEventListener` or `focus()` call.
4. `headingLevel` renders as one of `h2`–`h6`, never `h1`.
5. The container is `display: inline-flex` + `max-width: 100%` (it does not fill the width), and a parent container can override that with `width: 100%`.
6. With `variant === 'surface'` the background colour is `--dsw-alias-markdown-code-block`; with `plain` no `background` is declared.
7. With `inset === true` the padding is `12px 16px`; with `false` the container has no padding.
8. The title row's `border-bottom` is `0.5px` wide and coloured `--dsw-alias-border-l1`.
9. The margins of the first and last body elements are 0 (both the `.body > :first-child` and `.body > :last-child` rules are present).
10. The title element declares `overflow: hidden` + `text-overflow: ellipsis` + `white-space: nowrap`.
11. When `actions == null` the action area container is not rendered.
12. The component imports no other component from this repository (the source has no relative-path import, only `react` and its own CSS Modules).
13. When inserted into the conversation flow it must not bring any outer spacing of its own (`.seat` declares no `margin`); spacing is left to the host (`FL-AD-07` suggests 16px).
14. The placement must be a conversation seat (a vertical insertion point such as `conversation.view` / `conversation.session` / `conversation.input.dock`), and it must not be used on a settings page or in the rightbar (human review, section 4 of `spec/10-frame-layout.md`).
15. Adjacent PanelSeats in the same stretch of conversation must not repeat their title text (human review, see "How to use it well" in `README.md`).
16. No more than 2 visible controls inside `actions` (`FL-RC-05` caps visible controls in the same section at 6, and one block of content should take only a small share of that; corresponds to `B01` in `spec/70-checklist.md`, human review).

## demo

- `components/patterns/PanelSeat/demo.html`

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist entries: `spec/70-checklist.md` (`A43`, `B01`)
- Cross-region decisions and spacing clauses: `spec/10-frame-layout.md` (`FL-AD-07`, `FL-RC-05`)
