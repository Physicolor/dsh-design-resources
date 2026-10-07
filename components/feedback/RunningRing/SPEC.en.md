---
source: components/feedback/RunningRing/SPEC.md
source-sha256: 2436eb8e055df4ab
translated-at: 2026-10-07
---
# RunningRing · SPEC

- id: running-ring
- category: feedback
- source: `components/feedback/RunningRing/` (`index.tsx` / `running-ring.module.css`)
- official-counterpart: Really exists in the product — the running glyph at the start of a conversation row in the left sidebar, from the client CSS module `_spinner_1i3xo_37` (same module as the static state dot `_dot_1i3xo_2`). The official primitives package does **not** have this component; what the package provides for `ongoing` is a different pixel-chase matrix (`.matrix` in `StateDot.module.css`).
- human-doc: `README.md` (judgement and trade-offs; this file holds facts only)

## geometry-source

Collected from the running product: `docs/reference/running-row.json` (1570×905 viewport, at the start of a conversation row in the left sidebar).

| Value | Source |
| --- | --- |
| `width/height: 14` (as rendered inline) · `viewBox="0 0 24 24"` | The SVG attributes of `_spinner_1i3xo_37` (captured `<svg class="_spinner_1i3xo_37" data-state="ongoing" width="14" height="14" viewBox="0 0 24 24">`) |
| Two `circle`s: `cx/cy 12`, `r 9.5`, `fill: none`, `stroke: currentColor`, `stroke-width: 2`, `stroke-linecap: round` | `_spinnerTrack_1i3xo_47` / `_spinnerArc_1i3xo_48` |
| Track `opacity: .25` | `_spinnerTrack_1i3xo_47` |
| Arc `stroke-dasharray: 12 150` | `_spinnerArc_1i3xo_48` |
| Rotation `1.5s linear infinite`, `transform-origin: center` | `_spinnerMotion_1i3xo_42` (`animation: _dsh-state-dot-spin_1i3xo_1 1.5s linear infinite`) |
| Stretch `1.5s ease-in-out infinite` | `_spinnerArc_1i3xo_48` (`_dsh-state-dot-dash_1i3xo_1`) |
| Keyframes `spin`: `to { transform: rotate(360deg) }` | `@keyframes _dsh-state-dot-spin_1i3xo_1` |
| Keyframes `dash`: `0% 12 150 / 0` → `50% 24 150 / -6` → `to 12 150 / 0` | `@keyframes _dsh-state-dot-dash_1i3xo_1` |
| Colour `--dsw-alias-label-tertiary` | `_spinner_1i3xo_37 { color: … }` (measured rgb(129,133,140)) |
| Reduced motion: the animations stop, and the arc rests at `18 150 / -3` | The `@media (prefers-reduced-motion: reduce)` branch |
| The screen-reader text "in progress" (`进行中`) sits beside the ring and is itself visually hidden | The captured `hIlkoa_visuallyHidden` (`<span class="…">进行中</span>`) |

### The official side disagrees with itself: one implementation in the library, another in the product

The same "in progress" has two implementations in official code. That is **the official side not being unified**, not us copying it wrong:

| Implementation | Source | Form |
| --- | --- | --- |
| Pixel-chase matrix | `@deepseek-ai/dsh-client-ui-primitives/lib/StateDot.module.css` `.matrix` + `@keyframes dsh-state-dot-chase` | 10×10 viewBox; eight 2×2 squares around the outer ring, decaying cell by cell over 1s |
| Spinning ring (this component) | The client CSS module `_spinner_1i3xo_37`, which in the product actually renders at the start of a conversation row in the left sidebar | 24 viewBox, r 9.5, stroke 2, 1.5s spin + 1.5s stretch |

**Judged against Apple HIG** ([Progress indicators](https://developer.apple.com/cn/design/human-interface-guidelines/progress-indicators), 2023-09-12 version):

- HIG classifies a wait whose duration cannot be estimated as *indeterminate*, and its form is the activity indicator (spinner): "All platforms support a circular image that appears to spin".
- "Prefer an activity indicator (spinner) to communicate the status of a background operation or when space is constrained. Spinners are small and unobtrusive … good for communicating progress within a small area" — those 14px at the start of a conversation row are exactly "a small, space-constrained area", and the spinning ring is the right shape.
- "Keep progress indicators moving so people know something is continuing to happen. People tend to associate a stationary indicator with a stalled process or a frozen app" — which is why in the product it keeps looping; stopping under `prefers-reduced-motion` is a legitimate exception where **accessibility outranks this advice**, and the product keeps the meaning by resting on the frame where the arc is not yet complete (`18 150 / -3`), a handling this component copies.
- "Avoid labeling a spinning progress indicator … a label is usually unnecessary" — the product has no visible label and gives screen readers only "in progress" (`进行中`); this component's `label` therefore renders as visually hidden text rather than visible copy.

**Conclusion**: the pixel chase is a path the library keeps (more decorative, no more informative), and the product does not use it in the real interface. A plugin author reproducing "a conversation row is running" should follow the product — use the spinning ring. That is also why this repository lists it as a component of its own rather than folding it into `StateDot`.

### Values proposed by this repository (not official values)

- Keyframes renamed `dsh-design-running-ring-spin` / `-dash`: the official keyframe names (`_dsh-state-dot-spin_1i3xo_1`) carry a build hash, and same-named definitions overwrite each other on one page; the rename does not affect the form.
- `.root { display: inline-flex; align-items: center }`: a wrapper this repository adds so the ring lines up with the inline text beside it; in the product that layer is carried by the seat container (`hIlkoa_slot`).
- `focusable="false"`: a leftover attribute from IE / old Edge, ignored by modern browsers; it is written so that the inline SVG is never treated as a focusable element in any host.

## api

`RunningRingProps`, `forwardRef<HTMLSpanElement, RunningRingProps>`.

| Property | Type | Default | Notes |
| --- | --- | --- | --- |
| `size` | `number` | `14` | Render size (px). The viewBox is fixed at 24, so the size can scale while the stroke-width ratio stays the same |
| `label` | `ReactNode` | none | The description text for screen readers (such as `进行中`, "in progress"), rendered as a visually hidden element; when omitted it is not rendered |
| `className` | `string` | none | Appended after the class name of the outermost `<span>` |
| `ref` | `Ref<HTMLSpanElement>` | none | Passed through to the outermost `<span>` |

## states

| State | Trigger | Behaviour |
| --- | --- | --- |
| Default | — | 1.5s linear rotation + 1.5s back-and-forth stretch |
| Reduced motion | `prefers-reduced-motion: reduce` | Both animations stop; the arc rests at `18 150 / -3` |
| No label | `label` not passed | The ring only, invisible to assistive technology (`aria-hidden`) |
| With label | `label` passed | The ring stays `aria-hidden`, and the description text is provided by a visually hidden `<span>` |

The component has no interaction states at all: it is not a button, it accepts no click, and it has no hover / focus styling.

## tokens

- `--dsw-alias-label-tertiary` — the colour of the ring (the measured value of the one in the product, rgb(129,133,140), is its light-theme value)

## a11y

- The ring itself is `aria-hidden="true"`: it carries no readable text, so the state has to be expressed by the text beside it (or by `label`).
- **Screen readers only, no visible label** follows HIG (a spinner needs no visible label) and follows the product (the row start has only the ring; the text is `hIlkoa_visuallyHidden`).
- With `prefers-reduced-motion` it must stop: continuous rotation is a burden for users sensitive to vestibular motion; when it stops, keep the static signal of "an unfinished arc" — do not stop on a full circle (that reads as "done").
- It stands in for the status glyph at the start of a conversation row: **do not lose the row's own readable name** — the row text still has to say which conversation it is.

## checks

1. The root element is `<span>` and contains exactly one `<svg>` (plus one visually hidden `<span>` when `label` is present).
2. The `<svg>` carries `aria-hidden="true"` and `viewBox="0 0 24 24"`, with `width`/`height` equal to `size`.
3. Both `<circle>`s have `cx/cy` of 12 and `r` of 9.5; the track and the arc have `stroke-width` of 2 and `stroke-linecap` of round.
4. The track has `opacity: .25`; the arc starts as `stroke-dasharray: 12 150`.
5. Rotation is `1.5s linear infinite` and stretch is `1.5s ease-in-out infinite` (neither the duration nor the easing may be changed).
6. A `prefers-reduced-motion: reduce` branch exists, and in that branch the animation is `none` and the arc is `18 150 / -3`.
7. The component imports no runtime dependency other than `react` (including `@deepseek-ai/*`).
8. `running-ring.module.css` contains no hexadecimal colour literal, `rgb(` or `hsl(` (colour goes through `var(--dsw-*)` only).
9. The source contains no `onClick` / `onKeyDown` / `tabIndex` (it is not an interactive element).

## demo

- `components/feedback/RunningRing/demo.html`

## Related

- Human-readable version: `README.md`
- The static status in the same family: `components/data-display/StateDot/` (including the pixel-chase implementation in the official library)
- Motion tiers: `spec/40-motion.md`
- Reference: Apple HIG · Progress indicators (a spinner is *indeterminate*; prefer a spinner when space is constrained)
