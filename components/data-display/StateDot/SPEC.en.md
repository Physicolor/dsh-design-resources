---
source: components/data-display/StateDot/SPEC.md
source-sha256: fef8b1026bdd0bd7
translated-at: 2026-10-05
---
# StateDot · SPEC

- id: state-dot
- category: data-display
- source: `components/data-display/StateDot/` (`index.tsx` / `state-dot.module.css`)
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/StateDot.module.css` and the `function StateDot({ state, size = 10, className })` in `lib/index.js` of the same directory
- human-doc: `README.md` (judgements and trade-offs; this file holds facts only)

## geometry-source

Read every row as "value ← filename selector".

| Value | Source |
| --- | --- |
| Default outer diameter `10px` (Figma size) | `lib/index.js` → `function StateDot({ state, size = 10, ... })` |
| `flex: none` | `StateDot.module.css` → `.dot`, `.matrix` |
| `position: relative`, `display: inline-block` | `StateDot.module.css` → `.dot` |
| Halo `inset: 0`, `border-radius: 50%`, `background: currentColor`, `opacity: 0.1` | `StateDot.module.css` → `.dot::before` |
| Solid core `inset: 20%`, `border-radius: 50%`, `background: currentColor` | `StateDot.module.css` → `.dot::after` (the file comment states it is the 6/10 scaling) |
| `corner-shape: round` | `StateDot.module.css` → `.dot::before`, `.dot::after` |
| `done` → `var(--dsw-alias-state-success-primary)` | `StateDot.module.css` → `.dot[data-state='done']` |
| `warning` → `var(--dsw-alias-state-warn-primary)` | `StateDot.module.css` → `.dot[data-state='warning']` |
| `error` → `var(--dsw-alias-state-error-primary)` | `StateDot.module.css` → `.dot[data-state='error']` |
| `idle` → `var(--dsw-alias-label-tertiary)` | `StateDot.module.css` → `.dot[data-state='idle']` |
| `ongoing` → `var(--dsw-static-deepseek-450)` | `StateDot.module.css` → `.dot, .matrix { --dsh-state-ongoing: ... }`; the comment at the top of the file states that the ongoing blue has no matching token at the alias layer, and that `state-business-primary` is the 500 step rather than the 450 step here |
| `viewBox="0 0 10 10"`, `shape-rendering: crispEdges` | `lib/index.js` → the `ongoing` branch of `StateDot` |
| 8 `2×2` squares, outer-ring coordinates `0/4/8`, clockwise from top-left | `lib/index.js` → `const MATRIX_CELLS` (comment: *Outer 3x3 matrix cells (2px pixels on a 10px grid), clockwise from top-left*) |
| `animation-delay = (index - 8) × 125ms` (the 8 cells are staggered one step apart) | `lib/index.js` → in the `ongoing` branch of `StateDot`, `animationDelay` is computed as `(index - MATRIX_CELLS.length) * 125` |
| `.cell` → `fill: currentColor`, `opacity: 0.15`, `animation: 1s infinite` | `StateDot.module.css` → `.cell` |
| Keyframe with four steps `1 / 0.6 / 0.35 / 0.15`, breaks at `0 / 12.5% / 25% / 37.5%` | `StateDot.module.css` → `@keyframes dsh-state-dot-chase` |
| Both the component and the SVG are `aria-hidden="true"` | `lib/index.js` → both branches |

### Proposed here (not official values)

- The `@media (prefers-reduced-motion: reduce)` branch: the official `StateDot.module.css` has no such branch at all.
  This repo adds it, taking `animation: none` plus all cells parked on the middle step `opacity: 0.6`.
  The reason: `MO-MF-09` in `spec/40-motion.md` is mandatory (its criterion is literally "a stylesheet that does not contain
  `prefers-reduced-motion` is a violation"), and the chase animation counts as the "non-essential continuous motion" that clause
  names; with the animation stopped, ongoing is still distinguishable from the other four states by "the shape of the square matrix
  + the blue" (`AC-MF-07` does not carry information through animation).
- The keyframe name becomes `dsh-design-state-dot-chase` (officially it is `dsh-state-dot-chase`): **this is not a value proposal,
  it is a naming decision**. The reason is that if the official theme and this repo's source are loaded on the same page, identical
  keyframe names overwrite each other; every value matches the official one.

### Implementation notes

The implementation is original to this repo: the geometry is carried by a component-level variable (`--dsh-statedot-ongoing`), the rules are reorganised and the keyframes renamed; the values are equivalent to the official ones line by line, rather than being a copy of the official CSS.

## api

`StateDotProps`, `forwardRef<StateDotRef, StateDotProps>`; `StateDotRef = HTMLSpanElement | SVGSVGElement`.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `state` | `'done' \| 'warning' \| 'ongoing' \| 'error' \| 'idle'` | required | The state to express; `ongoing` renders the square matrix, the rest render a solid dot |
| `size` | `number` | `10` | Outer diameter (px); the halo and the solid core scale proportionally (`inset: 20%`) |
| `className` | `string` | none | Extra layout class names; the caller decides margins, alignment and so on |
| `ref` | `Ref<StateDotRef>` | none | Passes through to `<span>` in dot form and to `<svg>` in matrix form |

`StateDotState` / `StateDotRef` are exported type aliases. This component does not accept `...rest` pass-through and accepts no props beyond the three above.

## states

| State | Trigger | Presentation |
| --- | --- | --- |
| `done` | `state="done"` | `<span aria-hidden="true">`, `width` / `height` set to `size`, colour `--dsw-alias-state-success-primary` |
| `warning` | `state="warning"` | Same as above, colour `--dsw-alias-state-warn-primary` |
| `error` | `state="error"` | Same as above, colour `--dsw-alias-state-error-primary` |
| `idle` | `state="idle"` | Same as above, colour `--dsw-alias-label-tertiary` (the "no activity" case outside the three outcome colours) |
| `ongoing` | `state="ongoing"` | `<svg>` + `data-state="ongoing"`, `viewBox="0 0 10 10"`, 8 `2×2` squares running a 1s infinite chase animation |
| Reduced motion | `prefers-reduced-motion: reduce` | `.cell` gets `animation: none` and all cells park at `opacity: 0.6` (`§ proposed here`) |
| Size | `size` | Outer diameter = `size`; the inner-circle ratio is unchanged (`::after`'s `inset: 20%` is a percentage) |
| Decorative | all states | Both the component and the `<svg>` hard-code `aria-hidden="true"` and stay out of the accessibility tree |
| Interaction states | — | No hover / active / focus / disabled; not focusable and not in the Tab order |

## tokens

DSH semantic tokens (all findable in `data/tokens.json`):

- `--dsw-alias-state-success-primary` — `done`
- `--dsw-alias-state-warn-primary` — `warning`
- `--dsw-alias-state-error-primary` — `error`
- `--dsw-alias-label-tertiary` — `idle`
- `--dsw-static-deepseek-450` — `ongoing` (a static step; the official comment notes that the alias-layer `state-business-primary` is the 500 step)

Component-level CSS variables (internal to this repo, not DSH tokens; defined on `.dot` / `.matrix`):

- `--dsh-statedot-ongoing` = `var(--dsw-static-deepseek-450)`

## a11y

- Both branches hard-code `aria-hidden="true"`: the state information is completely invisible to assistive technology, so the text beside it has to carry the semantics (`<span><StateDot state="error" /> Build failed</span>`). A usage with only a dot and no text is a defect.
- State must not be carried by colour alone (`AC-MF-07`): converted to greyscale, `done`'s green and `idle`'s grey can look close, so the text has to spell out the outcome rather than just giving a dot.
- `ongoing`'s infinite loop animation is allowed by `MO-MF-07` (that clause permits looping animation only for "expressing a process that is in progress"); the other four states must not add a looping animation.
- `size` changes only the outer diameter, not the inner-circle ratio. The official default is 10px; when scaling up to 12–16px for use at the start of a line, you need to confirm for yourself that it aligns with the line height of the text on that line — the official source gives no use case for a size other than 10px.
- `idle` uses `--dsw-alias-label-tertiary`: it is the tertiary text colour, and on `bg-layer-1/2` its non-text contrast is about the same as secondary body text. When placing an `idle` dot on a lighter or darker background colour, re-check the contrast (`AC-MF-06` suggests ≥3:1 for non-text elements).
- With reduced motion the animation is stopped, but ongoing is still distinguishable from the other four states by "the shape of the square matrix + the blue", so the information does not depend on animation (`AC-MF-07`).

## checks

Machine-checkable binary constraints (decidable true / false, ready to become lint rules directly).

1. Both the dot branch and the matrix branch output `aria-hidden="true"`.
2. When `state === 'ongoing'` it renders `<svg>` with a `viewBox` of `0 0 10 10` and contains 8 `2×2` `<rect>`s.
3. The matrix squares' `animationDelay` is `(index - 8) * 125` (in ms), not a hard-coded value.
4. The other four states' `data-state` matches `state`, and the colour mapping maps one-to-one onto the four token families `success` / `warn` / `error` / `label-tertiary`.
5. `ongoing`'s blue comes from `--dsw-static-deepseek-450` and must not be switched to `--dsw-alias-state-business-primary`.
6. The stylesheet contains an `@media (prefers-reduced-motion: reduce)` branch, and under that branch `.cell`'s `animation` is `none` (`MO-MF-09`, matching `A34` in `spec/70-checklist.md`).
7. The keyframe name is `dsh-design-state-dot-chase` and must not use the official `dsh-state-dot-chase` (to avoid the same-name overwrite).
8. The keyframe's four steps are `1 / 0.6 / 0.35 / 0.15`, with breaks at `0 / 12.5% / 25% / 37.5%`.
9. Apart from `ongoing`, no state may add an `animation` or `@keyframes` declaration (`MO-MF-07`).
10. `.dot::after`'s `inset` is `20%` (a percentage, so the inner-circle ratio survives scaling) and must not be written as a fixed px value.
11. The component takes no `...rest` pass-through, and the source must not anywhere spread other props onto the root element.
12. State must not be carried by colour alone: every use site needs adjacent readable text (human review, `AC-MF-07`, matching `A46` in `spec/70-checklist.md`).

## demo

- `components/data-display/StateDot/demo.html`

## Real captures (reconciled against the docs/reference screenshots)

| Image | Region | Context | Captured |
| --- | --- | --- | --- |
| `04-settings-models.png` | Model provider row, after "DeepSeek" | A green solid dot | Solid core **8 × 8** |
| `04-settings-models.png` | Model provider row, after "Command Code" | A green solid dot | Solid core **8 × 8** |

### Known deviations (added by the screenshot reconciliation)

- The capture shows a solid core of **8 × 8**. Reverse-inferred from `.dot::after { inset: 20% }` (core = 60% of the outer diameter), the outer diameter is about **13.3px**, whereas the default outer diameter recorded in the SPEC is **10px** (the Figma size), and the `a11y` section also says "the official source gives no use case for a size other than 10px". So that use site passed a `size` larger than the default. This repo's demo still reproduces it at the default 10px and labels the captured value in that group; **the default is not changed on this basis**.
- `02-session.png` — to the left of "1 background task running" in the session page header there is a **hollow ring** (about 13px, even stroke width, spinner look), which is **not StateDot** (StateDot is a solid core + a 10% halo and is never a hollow ring in any state). Do not treat it as a use case of this component.

## Related

- Human-readable version: `README.md`
- Dual-track writing convention: `docs/WRITING.md`
- Checklist entry: `spec/70-checklist.md` (`A32`, `A34`, `A46`)
- Motion clauses: `spec/40-motion.md` (`MO-MF-07`, `MO-MF-09`)
- Accessibility clauses: `spec/60-accessibility.md` (`AC-MF-06`, `AC-MF-07`)
