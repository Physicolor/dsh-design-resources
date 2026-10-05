---
source: components/surfaces/Modal/SPEC.md
source-sha256: 9e1cd5c892548a54
translated-at: 2026-10-05
---
# Modal · SPEC

- id: modal
- category: surfaces
- source: `components/surfaces/Modal/` (`index.tsx` / `modal.module.css`)
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/Modal.module.css` and the `Modal` in `index.js` in the same directory
- human-doc: `README.md` (judgement and trade-offs; this file carries only facts)

## geometry-source

Values are read one by one from the official `Modal.module.css` and the `Modal` implementation in `index.js` in the same directory; the notation is "value ← filename selector / implementation".

| Value | Source |
| --- | --- |
| `position: fixed`, `inset: 0`, `z-index: 1000`, `padding: 24px`, centring flex | ← `Modal.module.css` `.root` |
| `background: var(--dsw-alias-bg-mask-1)`, `backdrop-filter: var(--dsw-mask-blur)` | ← `Modal.module.css` `.mask` |
| `gap: 20px`, `width: min(380px, 100%)`, `padding: 0 0 24px`, `border-radius: 24px`, `background: var(--dsw-alias-bg-layer-2)`, `box-shadow: var(--dsw-elevation-prominent)`, `overflow: hidden`, `border: 0`, `position: relative`, `z-index: 1` | ← `Modal.module.css` `.dialog` |
| `display: flex` / `flex-direction: column` / `width: 100%` | ← `Modal.module.css` `.content` |
| `padding: 22px 14px 12px 24px`, `gap: 8px`, `align-items: center`, `justify-content: space-between` | ← `Modal.module.css` `.header` |
| `font-size: 16px`, `line-height: 24px`, `font-weight: 500`, `color: var(--dsw-alias-label-primary)`, `margin: 0` | ← `Modal.module.css` `.title` |
| `width: 28px`, `height: 28px`, `border-radius: 8px`, `border: none`, `background: transparent`, `color: var(--dsw-alias-label-secondary)`, `cursor: pointer`, `flex: none` | ← `Modal.module.css` `.close` |
| `background: var(--dsw-alias-interactive-bg-hover)` | ← `Modal.module.css` `.close:hover` |
| `margin: 0`, `padding: 0 24px`, `font-size: 14px`, `line-height: 22px`, `font-weight: 400`, `color: var(--dsw-alias-label-primary)` | ← `Modal.module.css` `.description` |
| `margin-top: 20px`, `padding: 0 24px`, `min-width: 0`, `flex-direction: column` | ← `Modal.module.css` `.body` |
| `justify-content: flex-end`, `gap: 8px`, `padding: 0 24px`, `align-items: center` | ← `Modal.module.css` `.footer` |
| close icon `14px` | ← the official `index.js` `Modal`: `jsx(IconCloseOutline16, { size: 14 })` |
| `createPortal(..., document.body)`, `role="dialog"`, `aria-modal="true"`, `aria-label={title}`, the root is `role="presentation"`, the mask is `aria-hidden="true"`, clicking the mask runs `onClick={onClose}`, a document-level `keydown` tests for `Escape` and calls `onClose` | ← the official `index.js` `Modal` |

A comment at the top of the official file states that this set of geometry comes from Figma (Mask + Dialog):

- `Mask + Dialog 451:18655` (comment on `.root`) — mask + centred card. Note that this file's mask comment claims the light-theme mask is `rgba(0,0,0,0.24)` + `blur(2px)`, but in the live product the actual value of `--dsw-mask-blur` is `none`; this repository uses the actual value and does not treat that comment as fact.
- `r24, elevation-prominent, layer-2 fill, pb 24` (comment on `.dialog`).
- `Title row: pad l24/t22/r14/b12, SPACE_BETWEEN` (comment on `.header`).
- `wt510, rendered 500` (comment on `.title`) — Figma's 510 lands as 500 in CSS.

### Values proposed here (not official values)

- **Focus trap**: the official Modal has no focus trap. The official `index.js` only listens for `Escape` on the document; in the whole primitives package only `OnboardingSurface` uses the host's `inert`. But the official dialog already writes `aria-modal="true"`, which promises assistive technology that "the rest of the content is unreachable"; with no trap, Tab runs straight through onto the page behind the mask, so the promise and the behaviour disagree. This repository fills the gap: on open, move focus into the dialog (the first focusable element if there is one, otherwise the dialog itself); Tab / Shift+Tab cycle inside the dialog; on close, give focus back to the element that opened it. The implementation uses only `document.activeElement` and `querySelectorAll`, pulling in no dependency.
- `.dialog { outline: none }`: the dialog itself needs to be focusable via `.focus()` (with `tabIndex={-1}`), but it is a container, not a control, so it should not draw the default focus ring. The official implementation does not declare this explicitly.
- `.close { padding: 0 }` and `box-sizing: border-box` on `.dialog` / `.close`: the official CSS does not write `box-sizing`, and leans on the host's global `border-box` reset — the official `.close` is `width/height: 28px` plus the browser's default button padding, and only under a global `border-box` is it a 28×28 square. Components in this repository do not assume the host has a reset, so they declare `box-sizing: border-box` explicitly and zero the close button's padding (`0` involves no geometric trade-off; it just cancels out the default); the `Button` component's `.button` declares `box-sizing` explicitly too.
- `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px` on `.close:focus-visible`: the official `.close` has no focus style. Keyboard users need to see where focus is, and the notation matches the `:focus-visible` in the official `Switch.module.css`.
- No scroll locking (`body { overflow: hidden }`): the official component does not do it and this repository stays consistent; if you need to lock scrolling, handle it in the caller — do not change this component.

### Decisions in this repository (rewriting official behaviour)

- Focus trap (as above): the official component has only the `aria-modal="true"` promise and no matching behaviour, so this repository fills the gap, which is a deliberate rewrite of official behaviour. Other than that, the geometry, the `aria` structure, the `Escape` behaviour and the mask-click behaviour all match the official component, with no rewrites.

The implementation is original to this repository (geometry carried by CSS variables + a structured DOM); the geometry is equivalent, but it is not a copy of the official CSS.

## api

`ModalProps`, `forwardRef<HTMLDivElement, ModalProps>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | required | Whether to show it; when `false` nothing is rendered (no DOM left behind) |
| `onClose` | `() => void` | required | The close callback: Escape, clicking the mask and clicking the close button all call it |
| `title` | `string` | required | Rendered as the `<h2>` text and also used as the dialog's `aria-label`; must be a plain string |
| `closeLabel` | `string` | required | The close button's accessible name (e.g. `关闭` / `Close`) |
| `description` | `ReactNode` | none | One line of explanation below the title; not rendered when it is an empty string |
| `children` | `ReactNode` | none | The main content, rendered into `.body` |
| `footer` | `ReactNode` | none | The bottom action row, right-aligned |
| `className` | `string` | none | Appended to the dialog itself (to widen it, to change its background) |
| `ref` | `Ref<HTMLDivElement>` | none | Passed through to the dialog itself, and used by the internal focus trap |

Once you use this component, do not write your own mask layer: the mask's click-to-close, Escape and focus restore are all this component's job.

## states

| State | Trigger | Behaviour |
| --- | --- | --- |
| Closed | `open === false` | `return null`, no portal is rendered |
| Open | `open === true` | Portals to `document.body`, rendering `.root` / `.mask` / `.dialog` |
| No description | `description == null` or `=== ''` | `.description` is not rendered |
| No body | `children == null` | `.body` is not rendered |
| No footer | `footer == null` | `.footer` is not rendered |
| Close button hover | `.close:hover` | `background: var(--dsw-alias-interactive-bg-hover)` |
| Close button keyboard focus | `.close:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px` (value proposed here) |
| Dialog focused | `.dialog` with `tabIndex={-1}` | `outline: none` (the container shows no focus indicator) |
| Escape | document-level `keydown` | Calls `onClose` |
| Mask click | `.mask`'s `onClick` | Calls `onClose` |
| Focus enters | when `open` turns true | Focuses the first focusable element inside the dialog (`a[href]` / `button:not([disabled])` / `input:not([disabled]):not([type="hidden"])` / `select` / `textarea` / `[tabindex]:not([tabindex="-1"])`, and not `disabled`, not `aria-hidden="true"`); if there is none, focuses the dialog itself |
| Focus wraps | Tab / Shift+Tab inside the dialog | Cycles between the two ends; if focus is already outside the dialog it is pulled back (value proposed here) |
| Focus restore | on close | `restore?.focus()` gives it back to the `document.activeElement` from before the open (value proposed here) |

## tokens

DSH semantic tokens:

- `--dsw-alias-bg-mask-1` — the `.mask` background
- `--dsw-mask-blur` — `.mask`'s `backdrop-filter` (the actual value in the live product is `none`)
- `--dsw-alias-bg-layer-2` — `.dialog` background
- `--dsw-elevation-prominent` — `.dialog` shadow
- `--dsw-alias-label-primary` — the colour of `.title` / `.description`
- `--dsw-alias-label-secondary` — the `.close` icon colour
- `--dsw-alias-interactive-bg-hover` — the `.close:hover` background
- `--dsw-alias-brand-primary` — focus ring colour (value proposed here)

Component-level CSS variables (internal to this repository, not DSH tokens):

- `--dsh-modal-z` (`1000`)
- `--dsh-modal-pad` (`24px`, the viewport padding of `.root`)
- `--dsh-modal-width` (`380px`)
- `--dsh-modal-radius` (`24px`)
- `--dsh-modal-gap` (`20px`, shared by `.dialog`'s `gap` and `.body`'s `margin-top`)
- `--dsh-modal-pad-x` (`24px`, the horizontal padding of `.description` / `.body` / `.footer`)

## a11y

- **`title` must be a plain string**: the official component uses it as the title text and as the `aria-label` at the same time. Passing a node (a title with an icon or a `<code>`, say) leaves the dialog with no accessible name.
- **`closeLabel` is required**: the close button holds only an icon, so with no name a screen reader reads out an empty button. Pass localised copy (`关闭` / `Close`). Meets `AC-MF-14`.
- Focus trap (value proposed here): on open, focus enters the dialog ⇒ Tab cycles only inside the dialog ⇒ on close, focus returns to the trigger. All three steps are needed; doing only the first leaves keyboard users either unable to get out or unable to find their place again.
- Closing on Escape is a required exit; do not disable it in order to "force a choice" — a genuinely mandatory flow should change the product design, not remove the keyboard exit.
- Click-to-close on the mask is necessary for touch users (there is no Escape key on touch); but if that close would lose data, add your own second confirmation in `onClose`.
- Do not put auto-focus plus immediate submit in a dialog (an input destroyed on Enter, say); an accidental trigger costs too much.
- The icon is `aria-hidden="true"` and the name comes from the button's `aria-label`, so it is not read out twice.
- The close button's hit area is 28×28, meeting `AC-MF-01`'s 28×28 target for a regular control.
- The focus ring uses `outline` rather than `box-shadow`, so a parent's `overflow: hidden` cannot clip it (`AC-MF-12`).
- `z-index: 1000` is the official value: the host also has layers such as `Toast` (1100) / `Tooltip` (100), so do not change the overlay order inside this component, or a notice may end up covered.

## checks

Binary constraints a machine can check (decidable as true / false, and directly expressible as lint rules).

1. When `open === false` the component returns `null` and renders no DOM.
2. The dialog has an accessible name, and its source is the plain string `title` (`aria-label={title}`); the type of `title` must not be widened to `ReactNode`.
3. `closeLabel` is required in the type (not optional).
4. All three focus-trap steps are present: on open, focus the first focusable element inside the dialog (the dialog itself if there is none); Tab / Shift+Tab cycle inside it; on close, focus goes back to the `document.activeElement` from before the open.
5. The dialog itself carries `tabIndex={-1}`, and `.dialog` declares `outline: none`.
6. A `:focus-visible` style exists on the close button (`AC-MF-10`, checklist `A48`).
7. The focus ring spec is 2px solid + `--dsw-alias-brand-primary` + a 2px outward offset (`AC-MF-11`, checklist `A48`).
8. Close-on-Escape exists (a document-level `keydown` testing for `Escape`) and must not be removed.
9. The mask is `aria-hidden="true"`, and clicking it calls `onClose`.
10. It renders under `document.body` (`createPortal`); `.root`'s `z-index: 1000` matches the official value and must not be rewritten inside the component.
11. No scroll locking: the source must contain no write of `overflow` on `document.body`.
12. The close icon is `aria-hidden="true"`, and the accessible name comes only from the button's `aria-label` (`AC-MF-14`).
13. The close button's hit area is ≥ 20×20 (28×28 in practice, `AC-MF-01`).
14. `.dialog` and `.close` declare `box-sizing: border-box`, and `.close`'s `padding` is `0`.
15. `modal.module.css` contains no hexadecimal colour literals (`#`), no `rgb(`, no `hsl(`; every colour goes through `var(--dsw-*)`.
16. The component imports no runtime dependency other than `react` / `react-dom` (only `createPortal`) — including `@deepseek-ai/*`.
17. No nesting: only one Modal may be open at a time (human review, see "When not to use it" in `README.md`).

## demo

- `components/surfaces/Modal/demo.html`

## Real scenes (reconciled against docs/reference screenshots)

**Not covered by the screenshots**: none of the 7 screenshots shows a Modal anywhere.

Candidates ruled out one by one:

| Candidate | Shot | As captured | Why it is not this component |
| --- | --- | --- | --- |
| Settings panel | `03-settings-open.png` / `04-settings-models.png` / `05-settings-components.png` | About 790 × 800, **the content behind is neither dimmed nor blurred** (no mask) | The width is not `min(380px, 100%)`; there is no `bg-mask-1` mask layer; it is another surface, not a dialog |

Handling rule: the demo is only a **neutral geometry reproduction** (the title reads "Example title", the buttons read "Cancel / Confirm"); it notes on the page that "this scene does not appear in the screenshots, it is reproduced from geometry alone" and invents no use case.

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Related clauses: `spec/60-accessibility.md` (`AC-MF-01`, `AC-MF-10`, `AC-MF-11`, `AC-MF-12`, `AC-MF-14`), `spec/70-checklist.md` (`A48`)
