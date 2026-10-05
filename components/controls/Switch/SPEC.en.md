---
source: components/controls/Switch/SPEC.md
source-sha256: f9b083595c567db2
translated-at: 2026-10-05
---
# Switch · SPEC

- id: switch
- category: controls
- source: `components/controls/Switch/` (`index.tsx` / `switch.module.css`)
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/Switch.module.css` and `function Switch` in `lib/index.js`
- human-doc: `README.md` (judgement and trade-offs; this file carries facts only)

## geometry-source

Every value is read from the official `Switch.module.css`, written as "value ← filename selector".

| Value | Source |
| --- | --- |
| `width: 36px` / `height: 20px` / `padding: 2px` / `border: 0` / `border-radius: 10px` / `corner-shape: round` | `Switch.module.css` → `.switch` |
| `box-sizing: border-box` / `position: relative` / `flex: 0 0 auto` / `cursor: pointer` | `Switch.module.css` → `.switch` |
| `background: var(--dsw-alias-border-l3)` | `Switch.module.css` → `.switch` |
| `background: var(--dsw-alias-brand-primary)` | `Switch.module.css` → `.switch[aria-checked='true']` |
| `cursor: default` / `opacity: 0.5` | `Switch.module.css` → `.switch:disabled` |
| `outline: 2px solid var(--dsw-alias-brand-primary)` / `outline-offset: 2px` | `Switch.module.css` → `.switch:focus-visible` |
| `width: 16px` / `height: 16px` / `border-radius: 50%` / `corner-shape: round` | `Switch.module.css` → `.thumb` |
| `display: block` / `background: var(--dsw-alias-label-primary-foreground)` / `transition: transform 120ms ease` | `Switch.module.css` → `.thumb` |
| `transform: translateX(16px)` | `Switch.module.css` → `.switch[aria-checked='true'] .thumb` |
| The root node is `<button type="button" role="switch">`, carrying `aria-checked` / `aria-label` / `title` / `disabled`; its child is `<span class=thumb>` | `lib/index.js` → `function Switch({ checked, onChange, label, disabled = false, title, className })` |

The official source comment (at the top of `Switch.module.css`) explains why the track's corner radius is written `corner-shape: round`: the track radius is half its own height (10px = 20px / 2), and the global superellipse rule treats that as "not round enough" and squares off both ends, so they fight the circular thumb inside; the `corner-shape` spec recognises only 50%, 100% and ≥99px radii, and cannot recognise a "full round relative to its own box only", so it has to opt out explicitly. The same goes for the thumb.

### Values proposed here (not official values)

- `@media (prefers-reduced-motion: reduce) { .thumb { transition: none; } }`: the official `Switch.module.css` declares no reduced-motion branch. The travel is only 16px and the duration 120ms, so the impact is small, but users with vestibular sensitivity are more sensitive to horizontal sliding, and following the system preference to turn the transition off costs nothing. Basis: `MO-MF-09` in `spec/40-motion.md` (must respond to `prefers-reduced-motion: reduce`).

### Known deviations (recorded as found, not an invention of this repository)

- The official transition is `120ms ease`. `MO-MF-01` in `spec/40-motion.md` requires a duration of 100 / 150 / 200 / 300 / 350 (the `MO-MF-01` table files Switch under the 150ms step), and `MO-MF-06` forbids `ease` as an interaction transition curve. This repository keeps the official values as they are, because `CT-MF-01` requires reusing the official geometry and `CT-MF-12` forbids overriding the geometry properties of official controls. The two clauses conflict here, so it is recorded here rather than quietly rewritten; the corresponding entry in `checks` is therefore judged false.

### Implementation notes

- The implementation here is original: the geometry is carried by component-level CSS variables on `.switch` (`--dsh-switch-width` / `--dsh-switch-height` / `--dsh-switch-pad` / `--dsh-switch-thumb-size` / `--dsh-switch-thumb-offset` / `--dsh-switch-duration`), and the state is driven by the `aria-checked` attribute selector.
- Appearance hangs off `aria-checked` rather than a separate, parallel class: the visual state and the state assistive technology reads come from the same attribute, so they cannot lie to each other.
- `--dsh-switch-*` are internal variables of this repository, not DSH tokens.

## api

`SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'children' | 'type'>`, `forwardRef<HTMLButtonElement, SwitchProps>`. The component is fully controlled and keeps no state of its own.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | required | Current state, controlled |
| `onChange` | `(next: boolean) => void` | required | The state a click asks to switch to (`!checked`) |
| `label` | `string` | required | Accessible name, written into `aria-label`; the switch has no visible text, so this is the only source of a name |
| `disabled` | `boolean` | `false` | Whether to reject input; set it to `true` while a write is in flight as well |
| `title` | `string` | none | Hover tooltip, usually explaining why the switch is locked |
| `className` | `string` | none | Class appended to the root node, for external layout positioning |
| Everything else | `ButtonHTMLAttributes<HTMLButtonElement>` | — | Passed through to the root `<button>`; `onChange` / `children` / `type` are excluded |
| `ref` | `Ref<HTMLButtonElement>` | none | Passed through to the root `<button>` |

## states

| State | Trigger | Appearance |
| --- | --- | --- |
| Off | default | Track background `--dsw-alias-border-l3`; thumb `translateX(0)` |
| On | `aria-checked='true'` | Track background `--dsw-alias-brand-primary`; thumb `translateX(16px)` |
| Transition | `.thumb` | `transition: transform 120ms ease` |
| hover | none | Neither the official CSS nor this implementation defines `:hover`; this state is missing from the five states `CT-MF-07` requires, and `cursor: pointer` only signals clickability |
| active (pressed) | none | No `:active` visuals are defined |
| Keyboard focus | `.switch:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px` |
| disabled | `.switch:disabled` | `cursor: default` + `opacity: 0.5`; both focus and clicks are blocked by the native `disabled` |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` | `transition: none` on `.thumb` (a value proposed here) |

## tokens

DSH semantic tokens:

- `--dsw-alias-border-l3` — track background in the off state
- `--dsw-alias-brand-primary` — track background in the on state; focus ring colour
- `--dsw-alias-label-primary-foreground` — thumb colour

Component-level CSS variables (internal to this repository, not DSH tokens):

- `--dsh-switch-width` (`36px`)
- `--dsh-switch-height` (`20px`)
- `--dsh-switch-pad` (`2px`)
- `--dsh-switch-thumb-size` (`16px`)
- `--dsh-switch-thumb-offset` (`16px`)
- `--dsh-switch-duration` (`120ms`)

## a11y

- `label` is required: the switch has no visible text, and `aria-label` is its only name; leave it out and a screen reader announces only a nameless "switch".
- `role="switch"` + `aria-checked` is the combination ARIA specifies; do not substitute `aria-pressed`.
- `onChange(!checked)` is only a "request", not "already switched". When a failed write has to be rolled back, let the parent hold the truth; do not change the visuals first inside the component as an optimistic update.
- While a write is in flight, set `disabled` (the official comment says this explicitly: it is not only for switches locked down by a deployment), and explain why with `title`.
- Keyboard: the root node is a native `<button>`, both Space and Enter toggle it, and `focus-visible` already provides a 2px focus ring; do not bind your own `onKeyDown` for Space, since handling it twice fires twice.
- Disabling uses the native `disabled` attribute rather than a wrapper with `aria-disabled`, so focus and clicks are genuinely blocked.
- Hit area: 20px × 36px — the width passes, the height falls below the 28×28 target for regular controls in `AC-MF-01` and also below the 20×20 minimum hit area; the vertical hit area relies on the caller's spacing or an extended hot zone (see `checks`).
- Between off and on the switch differs in two places, thumb travel and track fill, so the two states stay distinguishable when converted to greyscale (`AC-MF-07`).

## checks

Machine-checkable binary constraints (decidable as true / false, directly expressible as lint rules).

1. The root node is a `<button>` with `type="button"`, `role="switch"`, and `aria-checked` bound to `checked`.
2. `label` is a required prop and ends up on `aria-label`; an empty string is not allowed.
3. The switch's appearance is driven by `[aria-checked='true']`; the source contains no second, parallel state class alongside `aria-checked`.
4. The track in the on state is `--dsw-alias-brand-primary`; the track in the off state is `--dsw-alias-border-l3`.
5. In the on state the thumb is `translateX(16px)`; the transition animates only `transform`, never a layout property (`MO-MF-08`).
6. The geometry is 36×20; `CT-MF-01` requires reusing the official geometry, and it must not be overridden from outside.
7. A `:focus-visible` focus style exists, and it is not removed with `outline: none` and left without a replacement (`AC-MF-10`).
8. The focus ring is 2px solid + `--dsw-alias-brand-primary` + a 2px outer offset (`AC-MF-11`).
9. A `prefers-reduced-motion: reduce` branch exists and turns the thumb transition off (`MO-MF-09`, `MO-MF-10`; a value proposed here).
10. Disabling uses the native `disabled`; the source must not contain a form that substitutes `aria-disabled` for `disabled`.
11. The track has `:hover` visuals (`CT-MF-07` requires all five of default / hover / active / focus-visible / disabled). Current judgement: false.
12. The transition duration is 150ms and the curve is `cubic-bezier(0.40, 0, 0.20, 1)` (`MO-MF-01`, `MO-MF-06`). Current judgement: false, see "Known deviations".

## demo

- `components/controls/Switch/demo.html`

## Real-world scenes (checked against docs/reference screenshots)

| Image | Area | Context | Real capture |
| --- | --- | --- | --- |
| `03-settings-open.png` | Settings → General, right of the `显示代码工作视图` row | On | **36 × 20** |
| `06-plugins.png` | Official group · end of the `智能体团队` / `自动授权审查` / `自动化任务` rows | On | **36 × 20** |
| `06-plugins.png` | Official group · end of the `语音输入` row | Off | **36 × 20** |
| `06-plugins.png` | Installed group · end of the `Better Sidebar` row | Off | **36 × 20** |

Conclusion of the check: the real capture **36 × 20** matches `.switch` in `Switch.module.css` (36 × 20 / padding 2px / r10) item by item, with no correction needed.

### Known deviations (added by the screenshot check)

- The track background in the on state is `--dsw-alias-brand-primary`, which in the light theme is **near-black** (`#0f1115`) rather than the usual brand blue. The switch on the `显示代码工作视图` row in the real capture is a pure black capsule with a white thumb, which corroborates that token's value.

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist entries: `spec/70-checklist.md` (`A15`, `A18`, `A30`, `A31`, `A34`, `A43`, `A46`, `A47`, `A48`, `A49`)
