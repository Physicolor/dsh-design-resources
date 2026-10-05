---
source: components/feedback/Toast/SPEC.md
source-sha256: 91ddc43ccce85432
translated-at: 2026-10-05
---

# Toast · SPEC

- id: toast
- category: feedback
- source: `components/feedback/Toast/` (`index.tsx` / `toast.module.css`)
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/Toast.module.css` and `Toast()` from `lib/index.js` in the same directory
- human-doc: `README.md` (judgement calls and trade-offs; this file holds facts only)

## geometry-source

Read as "value ← filename selector": the left column is what sits to the left of the arrow, the right column is "filename + selector".
The official sources live in `@deepseek-ai/dsh-client-ui-primitives/lib/`.

| Value | Source |
| --- | --- |
| `position: fixed` / `top: 40px` / `left: 50%` / `z-index: 1100` / `pointer-events: none` | `Toast.module.css` → `.toast` |
| `display: flex` / `align-items: center` / `gap: 10px` | `Toast.module.css` → `.toast` |
| `width: max-content` / `max-width: min(640px, calc(100vw - 48px))` | `Toast.module.css` → `.toast` |
| `padding: 12px 16px` / `border-radius: 14px` | `Toast.module.css` → `.toast` |
| `font-size: 14px` / `line-height: 22px` | `Toast.module.css` → `.toast` |
| `background: var(--dsw-alias-button-contrast-fill)` / `color: var(--dsw-alias-label-primary-inverted)` | `Toast.module.css` → `.toast` |
| `box-shadow: var(--dsw-shadow-lv3)` / `transform: translateX(-50%)` | `Toast.module.css` → `.toast` |
| `animation: dsh-toast-in 160ms ease-out, dsh-toast-fade 1000ms ease var(--dsh-toast-hold, 3000ms) forwards` | `Toast.module.css` → `.toast` |
| slide-in keyframes `translate(-50%, -6px)` → `translate(-50%, 0)`, `opacity 0` → `1` | `Toast.module.css` → `@keyframes dsh-toast-in` |
| fade-out keyframes `opacity: 0` | `Toast.module.css` → `@keyframes dsh-toast-fade` |
| under reduced motion the slide-in is dropped and only the delayed fade-out is kept | `Toast.module.css` → `@media (prefers-reduced-motion: reduce) .toast` |
| `display: grid` / `place-items: center` / `flex: none` / `color: var(--dsw-alias-state-warn-label)` | `Toast.module.css` → `.icon` |
| `min-width: 0` | `Toast.module.css` → `.text` |
| `HOLD_MS = 3000` / `FADE_MS = 1000` / the unmount timer is `holdMs + FADE_MS` | `index.js` → `Toast()` and the `HOLD_MS` / `FADE_MS` constants in the same file |
| `createPortal(..., document.body)` / `role="alert"` / the inline custom property `--dsh-toast-hold` | `index.js` → `Toast()` |
| the optional anchor is positioned by `rect.left + rect.width / 2`, and a window `resize` listener re-measures | `index.js` → `Toast()` |

### Values proposed by this repository (not official values)

- `--dsh-toast-icon-size: 16px`: the official `.icon` has layout properties only and no side length; the icon size follows the svg the caller passes in. 16px matches this repository's `Button` and `Input` icon containers, and also equals the default size of the official `IconWarningOutline16`.
- `box-sizing: border-box`: the official `.toast` does not declare it. The box width is `max-content` and it carries left and right padding; only with border-box declared does the `max-width` cap mean "640px including the padding", which matches the edge margin `calc(100vw - 48px)` is meant to leave.
- `font-family: inherit`: the official `.toast` declares no font family (it inherits from an ancestor). Writing inherit explicitly changes nothing; it only keeps a demo or host page's `body` rule from overriding it by accident.

### Implementation notes

- This repository's implementation is original: the geometry rides on a set of `--dsh-toast-*` component-level variables on `.toast`, and the keyframe names keep the official meaning but are organised by this repository itself.
- The official `Toast.module.css`'s `.toast` declares `font-size` / `line-height` only, and no `font-family`; this repository adds `inherit` (see above).

## api

`ToastProps`, a function component `Toast()`, no `forwardRef` (there is no DOM handle to expose).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `ReactNode` | none (required) | The notice copy; the caller supplies an already localised string or node |
| `icon` | `ReactNode` | none | Leading icon node, placed in a 16×16 icon container that takes the warning colour; the icon itself needs `aria-hidden` |
| `anchor` | `HTMLElement \| null` | none | The anchor element whose horizontal centre the toast follows; when omitted the toast is centred in the viewport |
| `holdMs` | `number` | `TOAST_HOLD_MS` (`3000`) | How long it stays fully opaque (milliseconds) |
| `onDone` | `() => void` | none (required) | Called once when the fade-out animation ends and the hold timer has run out; the caller unmounts the node here |
| `className` | `string` | none | Appended after the root node's class names |

Exported constants: `TOAST_HOLD_MS` (`3000`), `TOAST_FADE_MS` (`1000`).

## states

| State | Trigger | Behaviour |
| --- | --- | --- |
| Enter | Mount | `dsh-toast-in` 160ms ease-out: `opacity 0 → 1`, `translate(-50%, -6px) → translate(-50%, 0)` |
| Hold | From the end of the enter animation to `holdMs` | Fully opaque, static; `pointer-events: none` |
| Fade-out | After a `holdMs` delay | `dsh-toast-fade` 1000ms ease forwards → `opacity: 0` |
| Done callback | `holdMs + 1000ms` after mount | Calls `onDone()`; the caller removes the node |
| Anchor positioning | `anchor` passed | The inline `left` is set to the anchor's horizontal centre; a window `resize` listener re-measures; the listener is removed on unmount |
| Reduced motion | `prefers-reduced-motion: reduce` | The slide-in translation is dropped and only the delayed fade-out is kept |
| Pointer interaction | At any time | None: the root node is `pointer-events: none` and receives no clicks |
| No `icon` | `icon === undefined` | The icon container does not render |
| Non-browser environment | `typeof document === 'undefined'` | Returns `null` (SSR guard) |

## tokens

DSH semantic tokens (all of them can be looked up in `data/tokens.json`):

- `--dsw-alias-button-contrast-fill` — `.toast` ground
- `--dsw-alias-label-primary-inverted` — `.toast` text colour
- `--dsw-alias-state-warn-label` — `.icon` icon colour
- `--dsw-shadow-lv3` — `.toast` shadow

Component-level CSS variables (internal to this repository, not DSH tokens):

- `--dsh-toast-offset-top` (`40px`)
- `--dsh-toast-z` (`1100`)
- `--dsh-toast-gap` (`10px`)
- `--dsh-toast-pad-y` (`12px`) / `--dsh-toast-pad-x` (`16px`)
- `--dsh-toast-radius` (`14px`)
- `--dsh-toast-max-w` (`640px`) / `--dsh-toast-inset` (`48px`)
- `--dsh-toast-font-size` (`14px`) / `--dsh-toast-line-height` (`22px`)
- `--dsh-toast-icon-size` (`16px`, value proposed by this repository)
- `--dsh-toast-hold`: written inline by the component, with the value `holdMs + 'ms'`; it drives both the fade-out animation delay and the unmount timer (the official usage under the same name)

## a11y

- The root node is `role="alert"`: a screen reader interrupts whatever it is reading to announce this copy (the same as the official one).
- The root node must not be wrapped in `aria-hidden`: `role="alert"` is its only source of meaning.
- The icon container carries `aria-hidden="true"`; the icon should be a purely decorative svg, with the meaning written in the copy.
- `pointer-events: none` is deliberate: the notice bar receives no clicks, so it cannot carry the only way to reach an action.
- Under `prefers-reduced-motion: reduce` the slide-in translation is dropped and only a pure opacity change is kept.
- A timed dismissal is unfriendly to users with cognitive disabilities: when the message is long or important, make `holdMs` longer, or use `InlineNotice` instead.
- Remount rather than editing the copy in place: changing `text` on the same instance does not replay the animation and the timer, so the caller has to supply a `key`.
- Hit-area conclusion: not applicable. The component as a whole is `pointer-events: none` and is not an interactive element, so `AC-MF-01`'s hit-area requirement does not apply to it.

## checks

Machine-checkable binary constraints (a true / false judgement settles them, and they can become lint rules directly).

1. The root node has `role="alert"`.
2. The root node does not carry `aria-hidden` (the reverse check of `AC-MF-14`).
3. With `icon` passed, the icon container carries `aria-hidden="true"`.
4. In the source the root node's `pointer-events` resolves to `none`, and the root node has no pointer event handler such as `onClick` bound to it.
5. The `@media (prefers-reduced-motion: reduce)` branch exists, and the animation inside it contains no `transform` translation (`MO-MF-09`; checklist `A34`).
6. The unmount timer expression is `holdMs + TOAST_FADE_MS`, and `TOAST_FADE_MS` matches the fade-out keyframe's `1000ms`.
7. The inline custom property `--dsh-toast-hold` takes its value from `holdMs` (the same value drives both the animation delay and the timer).
8. With `anchor` passed, a `window` `resize` listener is registered and removed in the cleanup function.
9. The root node is mounted to `document.body` through `createPortal`.
10. The root node's width is `max-content` with a `max-width`, and no fixed width pinches the text container shut (`AC-RC-17`; checklist `B13`).
11. Duration values: slide-in `160ms`, fade-out `1000ms`, both taken from the official CSS, **not** among the five gears `MO-MF-01` allows (100 / 150 / 200 / 300 / 350), and not meeting "no more than 350ms" either. This repository gives the official anchor priority, so this item needs human confirmation (against checklist `A30`).
12. The transition curves are `ease-out` / `ease`, taken from the official source and not equal to `MO-MF-04`'s standard curve (`MO-MF-06`'s ban on a curve other than the official default). The official anchor takes priority, so this item needs human confirmation (against checklist `A31`).
13. The copy is a single short sentence of text (human review, see "How to use it well" in `README.md`).
14. No queue is maintained inside the component: when several notices appear at once, which one covers which is decided by the caller (`key` remounting) (human review, see "When not to use it" in `README.md`).

## demo

- `components/feedback/Toast/demo.html`

## Real scenes (reconciled against docs/reference screenshots)

**Not covered by the screenshots**: none of the 7 screenshots shows a banner at the top centre. A Toast is triggered by an interaction (a write failure, say), and the capture script is read-only throughout — it changes no setting and sends no message — so it could not be photographed.

Handling rule: the demo uses `.toast-static` to turn off `position: fixed` and the two animations (**not one geometry value changes**) for a static reproduction; the copy is always "example notice text", and it is labelled "this scenario does not appear in the screenshots; it is reproduced from geometry only".

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist entries: `spec/70-checklist.md` (`A30`, `A34`, `B13`)
