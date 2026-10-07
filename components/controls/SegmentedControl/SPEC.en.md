---
source: components/controls/SegmentedControl/SPEC.md
source-sha256: 8127719f961c29e8
translated-at: 2026-10-07
---
# SegmentedControl · SPEC

- id: segmentedcontrol
- category: controls
- source: `components/controls/SegmentedControl/` (`index.tsx` / `segmentedcontrol.module.css`)
- official-counterpart: the official package contains `SegmentedControl.module.css` and a `SegmentedControl` export in the product's `app.asar`; this proves the source package offers the primitive, not that the current host UI uses this repository's look. In the mixed screenshot, `duc-seg` 234 × 28 / `duc-seg-thumb` 42 × 24 / `duc-seg-btn` 44 × 24 are plugin content.
- human-doc: `README.md` (judgement and trade-offs; this file carries only facts)

## geometry-source

The official primitives export SegmentedControl; the values below are read from the official CSS, and this repository's implementation only combines them. The notation is "value ← file name selector". The fact that the component package exports it does not mean every generic segmented UI in any screenshot is the host UI.

### screenshot provenance

`docs/reference/05-settings-components.png` is a mixed-plugin screenshot; the "Components" page in it contains Command Code and dsh-widgets content, and cannot serve as evidence of the DSH host's native segmented control. The HTML example for that image is on hold. For the host conversation header's "Conversation / Trajectory / Context", see `guides/21-pattern-sidebar-panel.md`; that is a conversation-view tab, not an example of this component in Settings → General.

| value ← file name selector |
| --- |
| container `padding: 4px` / between segments `gap: 0` ← `Menu.module.css` `.list` |
| container `border-radius: 12px` ← `Pill.module.css` `.pill` |
| container background `var(--dsw-alias-bg-module-platform)` ← the `background` of `Tag.module.css` `.tag[data-tone='neutral']` |
| segment height `36px` (`md`) ← `Button.module.css` `.md` |
| segment height `28px` / `font-size: 12px` / `line-height: 18px` / `padding: 0 10px` (`sm`) ← `Button.module.css` `.sm` |
| segment `font-size: 14px` / `line-height: 22px` / `padding: 0 14px` ← `Button.module.css` `.button` |
| icon and text inside a segment `gap: 4px` ← `Button.module.css` `.button` (same value in `Pill.module.css` `.pill`) |
| unselected segment text colour `var(--dsw-alias-label-secondary)` ← `Pill.module.css` `.pill` |
| selected segment text colour `var(--dsw-alias-label-primary)` ← `Pill.module.css` `.active` |
| selected segment fill `var(--dsw-alias-button-ghost-active-fill)` / border `box-shadow: inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)` ← `Pill.module.css` `.active` |
| unselected segment hover background `var(--dsw-alias-interactive-bg-hover)` ← `Pill.module.css` `.interactive:hover` (same value in `Button.module.css` `.ghost:hover`) |
| icon container `16×16` ← `Button.module.css` `.icon` |
| the source of the `8px` segment radius ← `Input.module.css` `.wrap`'s `border-radius: 8px`; `8 = 12 (outer, Pill) − 4 (padding, Menu)` |

### Values proposed here (not official values)

The official CSS has no such values; each one gets its reason.

| value | rationale |
| --- | --- |
| segment radius `8px` | Concentric radius: outer r12 + 4px padding, so the inner part takes 12 − 4 = 8. Not the official Button `.sm`'s r14: that segment is a capsule, and forcing that radius onto a square segment would clash with the outer r12; not an in-between r10/r12 either, to avoid `TK-MF-03`'s "inventing and mixing in-between corner radii". |
| the `:active` background of an unselected segment `var(--dsw-alias-interactive-bg-active)` | The official `Pill` has only `:hover`, no `:active`; `CT-MF-07` requires all five states, so this takes the same-named token from `Button.module.css` `.ghost:active` rather than inventing a new colour. |
| focus ring `2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px` | Neither the official `Button` nor `Pill` has a keyboard focus style; `AC-MF-10` / `AC-MF-11` require a visible focus ring. The segment sits in the container's 4px padding, and with a 2px outward offset the ring lands exactly inside the container's bounds, so it is not clipped. |
| the container's `gap: 0` | Taken straight from `Menu.module.css` `.list`'s `gap: 0`; segments are told apart by the selected segment's fill and `inset` border, with no extra spacing (extra spacing would put two adjacent borders side by side and muddy the look). |
| hover / active only on unselected segments | A selected segment already has a `ghost-active-fill` fill; stacking a hover background on top would make it "change colour" under the cursor, reading as unselected. |

### Decisions in this repository (rewriting official behaviour)

- **Added a whole-group `disabled` prop.** The API given by the task has no `disabled`, but `CT-MF-07` requires five states for every interactive control, so it was added: the button uses the native `disabled`, the text drops to `--dsw-alias-label-tertiary` (`CT-MF-09`: not by lowering overall opacity), and the selected segment keeps its fill so you can still read "which segment is current".
- **Chose `radiogroup` / `radio` semantics over `tablist` / `tab`.** Both semantics require "a set of mutually exclusive items, arrow-key movement, a single Tab stop", and this component satisfies all of them. The difference is in the outcome: every tab in a `tablist` must point at a `tabpanel` with `aria-controls`, and what it switches is visible content; this component renders and controls no panel at all — all it produces is a value (`onChange`), which is exactly `radiogroup` semantics. Using `tablist` without a `tabpanel` would make a screen reader announce "tab 1 of 2" with no panel to be found, which is lying about semantics. The price of `radiogroup` is that a screen reader announces "radio button", which fits the "mutually exclusive view switch" case just as well.

### Implementation notes

- This repository's implementation is original: the geometry is carried by component-level CSS variables on `.control` (`--dsh-seg-pad` / `--dsh-seg-radius` / `--dsh-seg-inner-radius` / `--dsh-seg-height` / `--dsh-seg-pad-x` / `--dsh-seg-font-size` / `--dsh-seg-line-height` / `--dsh-seg-gap` / `--dsh-seg-icon`), and `.sm` overrides only four of them. No official CSS source was copied.
- `--dsh-seg-*` are internal variables of this repository, not DSH tokens.
- `className` can override local variables from outside to fine-tune segment width.

## api

`SegmentedControlProps<Value extends string> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'aria-label' | 'children'>`, exported through `forwardRef` (the public type keeps its generic, and the literal values of `options` narrow `value` / `onChange`).

| prop | type | default | description |
| --- | --- | --- | --- |
| `options` | `ReadonlyArray<{ value: Value; label: ReactNode; icon?: ReactNode }>` | required | All segments, in render order; `value` must be unique within the group |
| `value` | `Value` | required | The currently selected value (controlled) |
| `onChange` | `(value: Value) => void` | required | Fires only when clicking or keyboard-selecting another segment |
| `size` | `'md' \| 'sm'` | `'md'` | `md` is the standard 36px segment, `sm` the compact 28px segment |
| `disabled` | `boolean` | `false` | Disables the whole group (decision in this repository): buttons use the native `disabled`, the container gets `aria-disabled` |
| `aria-label` | `string` | required | Accessible name, placed on the `role="radiogroup"` container |
| the rest | `HTMLAttributes<HTMLDivElement>` | — | `id` / `className` / `style` / `data-*` pass through to the container |
| `ref` | `ForwardedRef<HTMLDivElement>` | none | Passes through to the container |

`SegmentedControlSize` / `SegmentedControlOption` are exported type aliases.

## states

| state | trigger | behaviour |
| --- | --- | --- |
| unselected | `.option` | transparent background; text `--dsw-alias-label-secondary` |
| hover | `.option:hover:not(:disabled):not([aria-checked='true'])` | `background: var(--dsw-alias-interactive-bg-hover)` |
| active (pressed) | `.option:active:not(:disabled):not([aria-checked='true'])` | `background: var(--dsw-alias-interactive-bg-active)` (value proposed here) |
| selected | `.option[aria-checked='true']` | text `--dsw-alias-label-primary`; fill `--dsw-alias-button-ghost-active-fill`; `box-shadow: inset 0 0 0 1px --dsw-alias-button-ghost-active-border` |
| keyboard focus | `.option:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px` (value proposed here) |
| whole group disabled | `.disabled .option` | `cursor: not-allowed`; text drops to `--dsw-alias-label-tertiary`; the selected segment keeps its fill, and its text drops too |
| Tab stop | `tabIndex` | the selected segment is `0`, the rest are `-1` (roving tabindex) |
| no selection | `value` not in `options` | `checkedIndex === -1`, the Tab stop falls on the first segment; no segment is lit |
| arrow keys | `ArrowRight` / `ArrowDown` / `ArrowLeft` / `ArrowUp` / `Home` / `End` | focus and selection move together (follow-focus), wrapping at both ends; `preventDefault` stops the page from scrolling |
| reduced motion | — | the component has no transitions or animations, so there is no `prefers-reduced-motion` branch |

## tokens

DSH semantic tokens:

- `--dsw-alias-bg-module-platform` — container background
- `--dsw-alias-label-secondary` — unselected segment text colour
- `--dsw-alias-label-primary` — selected segment text colour
- `--dsw-alias-label-tertiary` — segment text colour when the whole group is disabled
- `--dsw-alias-interactive-bg-hover` — unselected segment hover background
- `--dsw-alias-interactive-bg-active` — unselected segment pressed background (value proposed here)
- `--dsw-alias-button-ghost-active-fill` — selected segment fill
- `--dsw-alias-button-ghost-active-border` — selected segment inset border colour
- `--dsw-alias-brand-primary` — focus ring colour (value proposed here)

Component-level CSS variables (internal to this repository, not DSH tokens):

- `--dsh-seg-pad` (`4px`)
- `--dsh-seg-radius` (`12px`)
- `--dsh-seg-inner-radius` (`8px`)
- `--dsh-seg-height` (`36px` / `28px` under `.sm`)
- `--dsh-seg-pad-x` (`14px` / `10px` under `.sm`)
- `--dsh-seg-font-size` (`14px` / `12px` under `.sm`)
- `--dsh-seg-line-height` (`22px` / `18px` under `.sm`)
- `--dsh-seg-gap` (`4px`)
- `--dsh-seg-icon` (`16px`)

## a11y

- `aria-label` is a required prop: `role="radiogroup"` must have an accessible name, or a screen reader will only announce "radio button group" without saying what is being chosen. The container also carries `aria-orientation="horizontal"`.
- `role="radio"` + `aria-checked`: the selected state is expressed through ARIA, not colour (`AC-MF-07`: after conversion to greyscale there is still the shape difference of fill + inset border).
- **roving tabindex**: only the selected segment has `tabIndex=0`, the rest have `-1`. When `value` is not in `options` (no selection) it falls on the first segment, guaranteeing the group always has one Tab stop, or keyboard users would skip the whole group (`AC-MF-09`).
- Arrow keys follow the follow-focus model: `←` `→` (and `↑` `↓` `Home` `End`) both move focus and change the selection, consistent with a native radio group; `preventDefault` keeps the page itself from being scrolled by the arrow keys.
- Each segment is a native `<button type="button">`: reachable with `Tab`, triggerable with `Enter` / `Space`, and it will not accidentally submit inside a `<form>`.
- Icons are decorative: the `icon` node is wrapped in `aria-hidden="true"`, and the name comes only from `label`. **Giving only an icon and no text leaves that segment with no accessible name**, so `label` must be provided as well (visually hidden text for screen readers is fine) (`AC-MF-14`).
- Disabled: the buttons are really `disabled` (both focus and clicks are blocked), and the container also carries `aria-disabled="true"` so a screen reader can announce the whole-group state.
- The focus ring uses `outline` (not `box-shadow`), and the segment is held inside the container's 4px padding, so it is not clipped (`AC-MF-12`).
- Segment height has only two steps (36 / 28); the click target is the segment itself, both ≥28px high (`AC-MF-01`); adjacent segments' hit areas do not overlap (`AC-MF-03`).
- Known trade-off (stated plainly): under the light theme `--dsw-alias-bg-module-platform` is `#f9fafb`, barely different from the page background `#fff`, so the container itself is almost invisible; in that case the selected segment's fill and inset border still carry "which segment is current" (under the dark theme the container is `#353638`, a clear contrast). For the rendered result of both themes see `demo.html` (switch the host theme to dark and look again).

## checks

Binary constraints that can be detected automatically (true / false settles each one, and each can become a lint rule directly).

1. The container is `role="radiogroup"` with a non-empty `aria-label`; each segment is `role="radio"` with `aria-checked` bound to `option.value === value`.
2. The container carries `aria-orientation="horizontal"`; when `disabled` is true the container carries `aria-disabled="true"`.
3. Exactly one `tabIndex` in the group is `0`, the rest are all `-1`; when `value` is not in `options` segment 0 is `0`.
4. The arrow-key handler covers the six keys `ArrowRight` / `ArrowDown` / `ArrowLeft` / `ArrowUp` / `Home` / `End`, and calls `preventDefault`.
5. `onChange` fires only when the new value differs from the previous `value`.
6. Each segment is a native `<button type="button">`; when `disabled` is true each segment carries the native `disabled` (not an `aria-disabled` wrapper).
7. The segment radius is the concentric radius 8 = outer 12 − padding 4 (value proposed here).
8. The container `gap` is `0`, with no extra spacing between segments (value proposed here).
9. The hover and active rules carry `:not([aria-checked='true'])`, so the selected segment does not stack a hover / active background (value proposed here).
10. A `:focus-visible` focus style exists, and it is not removed with `outline: none` leaving nothing in its place (`AC-MF-10`).
11. The focus ring spec is 2px solid + `--dsw-alias-brand-primary` + a 2px outward offset (`AC-MF-11`).
12. When the whole group is disabled the text drops to `--dsw-alias-label-tertiary`, not replaced by lowering overall opacity (`CT-MF-09`).
13. The icon container inside a segment is fixed at 16×16 with `flex: none`, and the icon node carries `aria-hidden="true"` (`AC-MF-14`).
14. The two sizes' segment heights are 36px and 28px, both ≥28px (`AC-MF-01`), and adjacent segments' hit areas do not overlap (`AC-MF-03`).
15. The unselected segment's `:active` background comes from `--dsw-alias-interactive-bg-active`, a different official token from the hover background (value proposed here).
16. The component has no transitions or animations, so there is no movement that needs a `prefers-reduced-motion` override (the premise of `MO-RC-09` does not hold).

## demo

- `components/controls/SegmentedControl/demo.html`

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist entries: `spec/70-checklist.md` (`A18`, `A19`, `A25`, `A36`, `A43`, `A46`, `A47`, `A48`, `A49`)
