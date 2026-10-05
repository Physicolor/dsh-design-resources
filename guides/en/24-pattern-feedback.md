---
source: guides/24-pattern-feedback.md
source-sha256: 14d2e3702b519b97
translated-at: 2026-10-05
---
# State and feedback

> Pick where a piece of feedback appears, how long it stays and how the user gets out of it, and tell empty data, loading, error and done apart.

The mistake plugin authors make most often is catching all four kinds of feedback in the same shell: "not loaded yet" is drawn as "no data yet", a one-off success still takes up a permanent slot, a failure gives one line of red text and no way out, and a completed action shows nothing at all. This page lays out the four kinds (empty, loading, error and done) in checkable tables covering where each one applies and what to use instead, which layer it sits on, its key states and durations, keyboard and focus, and its behaviour under themes and in narrow windows, and it gives binary self-check items in the "Spec" section. Official practice and what this repository proposes stay strictly apart; where official sources contradict each other, the item is marked `[Known deviation]`; every value carries a source marker and a file path.

## What this page gets you

- Work out which of the four kinds the feedback in front of you belongs to, and what to use instead when the current component is the wrong one.
- Decide whether it goes into the document flow or into an overlay, which seat it takes, and whether it has to declare `order` explicitly.
- Line up the key states and durations: enter, hold, exit, loop cycle.
- Handle keyboard, focus and screen-reader announcement: what can be Tabbed to, whether the announcement is polite or interrupting, and where focus goes after a close.
- Check the behaviour in light / dark, in a narrow window, and at 200% zoom.
- Run the binary items in the "Spec" section before you submit.

## The four kinds of feedback: where they apply and what replaces them

| Kind | Where it applies | Substitute when it is the wrong choice | Component | Layer |
| --- | --- | --- | --- | --- |
| Empty | There really is no data, a filter matched nothing, loading failed but the structure is still there, permission or quota is in the way, the last item was just deleted | Swap a running ring in while loading; swap an inline notice in for a one-line error; swap a guide page in when the user has to choose among several things | EmptyState | In the document flow |
| Loading | Running right now, duration cannot be estimated (the start of a conversation row, the left of a task row) | Switch to a progress bar once the duration can be worked out; show nothing at all for under about a second; switch to a static state dot or label once it is done / failed / warning | RunningRing, StateDot (ongoing) | In the document flow (inline with the row) |
| Error | The whole submission failed and the reason belongs to no single field; an unstable network, a quota about to fill up, an explanation of a downgraded state | Move a field-level error directly under its field; use a region with buttons or a dialog when the user has to pick an action; use a dialog for a blocking error | InlineNotice (error), EmptyState (+ retry) | In the document flow |
| Done | The action has finished and the user need not take another step (save, copy, reconnect) | Use an inline notice when the message needs a long read or hands-on fixing; use a dialog for a blocking confirmation; merge several messages into one line | Toast, StateDot (done) | Overlay |

### Empty state

<!-- component: empty-state | Empty state: icon (optional) plus title, description (optional), one primary action. What really renders in the product is the empty-state copy; this combination of parts was not measured. -->

- Geometry: title 14px / 22px, weight 500; description 13px / 20px; the two anchor to `.button` in the official `Button.module.css` and `.title` in `Modal.module.css` respectively, and the description uses the official composite token `--dsw-font-xs-13` (source: components/feedback/EmptyState/SPEC.md) `[Official source]`.
- Proposed values: 12px gap, 6px between title and description, 16px above the action, a 32×32 icon slot, `max-width: 280px`, `padding: 32px 12px` (source: components/feedback/EmptyState/SPEC.md) `[Proposed here]`.
- `[Known deviation]` What was measured in the product is the empty-state copy itself: `EBLgjq_emptyNotice` 284 × 16, `dsh_notification_empty` 530 × 20, `enhc-doctor-empty` 564 × 20; the "icon + title + description + action" combination never appeared in the capture (source: the scenes field of components/origins.json) `[Runtime measurement]`.

### Loading and running states

<!-- component: running-ring | A 14px running ring: a track at 25% opacity plus an arc that spins and stretches at the same time. It is the one at the start of a left-sidebar conversation row while it is "running", and every value comes from the running interface. -->

<!-- component: state-dot | Static state dot. ongoing runs a chase of 8 squares over 1 second; done / warning / error / idle are solid dots, all aria-hidden, and must be paired with text. -->

- Running ring: 14 × 14 inline, `viewBox="0 0 24 24"`, two `circle` elements with `cx/cy` 12 and `r` 9.5, `stroke-width` 2, track `opacity: .25`, arc `stroke-dasharray: 12 150`, rotation `1.5s linear infinite`, stretch `1.5s ease-in-out infinite`, colour `--dsw-alias-label-tertiary`, reduced motion parked at `18 150 / -3` (source: docs/reference/running-row.json, components/feedback/RunningRing/SPEC.md) `[Runtime measurement]`.
- Capture detail: the computed value caught mid-animation is `20.7652px, 150px` (source: docs/reference/running-row.json); `12 150` is the declared initial value and the value in the check items (source: components/feedback/RunningRing/SPEC.md) `[Runtime measurement]`.
- State dot `ongoing`: 10px outer diameter by default, `viewBox="0 0 10 10"`, 8 squares of 2 × 2 around the outside, an endless `1s` chase, `animation-delay = (index − 8) × 125ms`, four `opacity` stops at 1 / 0.6 / 0.35 / 0.15 split at 0 / 12.5% / 25% / 37.5%, blue taken from `--dsw-static-deepseek-450` (the alias layer has no matching step) (source: components/data-display/StateDot/SPEC.md) `[Official source]`.
- Rules: an ongoing cycle may only be `1s` or `1.5s` and must be `infinite` (MO-MF-12); one interface uses only one form for the same "in progress" (MO-MF-13); an endless loop may only express a process that is under way (MO-MF-07); animate only `transform` / `opacity` (MO-MF-08) (source: spec/40-motion.md) `[Proposed here]`.
- Do not put a spinner in place of determinate progress when the duration can be worked out (MO-MF-14); do not show a ring for a wait of under about a second (source: components/feedback/RunningRing/README.md) `[Proposed here]`.
- `[Known deviation]` Official has two implementations side by side: the primitives package gives `ongoing` a pixel chase matrix, while the start of a left-sidebar conversation row really renders a spinning ring, so the library version never appeared in the real interface; judged against HIG this is official inconsistency rather than a division of design labour, and plugins follow the product (source: components/feedback/RunningRing/SPEC.md, section 3.1 of spec/40-motion.md) `[Borrowed principle]`.

### Error

<!-- component: inline-notice | A general notice: icon (optional) plus copy, plus an optional close control. Every geometry value anchors to the official ConnectionIndicator, but the info / error tones have no counterpart in the product. -->

- Where it applies: the whole form failed to submit and the reason belongs to no single field; an unstable network, a quota nearly full, where a draft is stored; a reminder about a setting's side effect; the page still works and only one thing was downgraded (source: components/feedback/InlineNotice/README.md) `[Proposed here]`.
- Do not wrap a field-level error in a notice: the outer container renders the error copy below the input, and the caller passes `aria-invalid` and `aria-describedby` through (source: components/controls/Input/SPEC.md) `[Proposed here]`.
- Official counterpart (the `ConnectionIndicator` really mounted in the product): single-line height 28px, `padding: 0 8px`, corner radius 8px, type 12px / 18px at weight 500, icon container 14 × 14, `column-gap: 4px`, `transition: background-color 160ms ease-out, color 160ms ease-out`, `warn` = level-three warning background + warning label colour, `success` = level-three success background + success primary colour, focus ring 2px with a 2px outer offset (source: components/feedback/InlineNotice/SPEC.md, taken from `ConnectionIndicator.module.css` inside the product `app.asar`) `[Official source]`.
- Proposed values: a general notice is 32 high on one line with `padding: 0 10px` (the 20 × 20 close control has to fit inside; switch to the official 28 / 0 8 when it has to sit beside native product notices); the multi-line form uses `height: auto` plus `min-height: 32px`, 6px top and bottom padding, and `margin-top: 2px` on the icon; the info / error background is derived from the matching primary colour with `color-mix(in srgb, primary colour 10%, transparent)` (source: components/feedback/InlineNotice/SPEC.md) `[Proposed here]`.
- The default background when `tone` is omitted (`--dsw-alias-bg-module-platform`) is not the same value as the derived background when `tone="info"` is passed explicitly, so the caller passes it explicitly when that matters (source: the states table in components/feedback/InlineNotice/SPEC.md) `[Proposed here]`.
- `[Known deviation]` The `info` / `error` tones have no counterpart in the product; `--dsw-alias-state-error` has no tertiary variant, and `--dsw-alias-state-business-tertiary` is defined as a dark background under the dark theme, so it cannot serve directly as a light notice background (source: components/feedback/InlineNotice/SPEC.md) `[Known deviation]`.

### Done

<!-- component: toast | A momentary notice: top centre of the window, holds for 3 seconds, fades away on its own. Its role is alert and pointer events are off, so it cannot carry any action that needs a click. -->

- Where it applies: the action has finished and the user need not take any step; you want a fleeting sense of confirmation without a permanent slot (source: components/feedback/Toast/README.md) `[Proposed here]`.
- Official values: `position: fixed`, `top: 40px`, `left: 50%`, `translateX(-50%)`, `z-index: 1100`, `pointer-events: none`, `padding: 12px 16px`, corner radius 14px, type 14px / 22px, `width: max-content`, `max-width: min(640px, calc(100vw - 48px))`, background `--dsw-alias-button-contrast-fill`, text `--dsw-alias-label-primary-inverted`, shadow `--dsw-shadow-lv3` (source: components/feedback/Toast/SPEC.md, taken from `Toast.module.css` inside the product `app.asar`) `[Official source]`.
- Timeline: enter 160ms `ease-out` (a -6px shift plus opacity), hold `HOLD_MS = 3000ms`, fade out 1000ms, unmount timer at `holdMs + 1000ms`, mounted on `document.body`, root node `role="alert"` (source: components/feedback/Toast/SPEC.md) `[Official source]`.
- The static marks for the done state: `StateDot`'s `done` / `warning` / `error` take `--dsw-alias-state-success-primary` / `warn-primary` / `error-primary` respectively (source: components/data-display/StateDot/SPEC.md) `[Official source]`.
- `[Known deviation]` 160ms and 1000ms are not among the five steps of `MO-MF-01` (100 / 150 / 200 / 300 / 350ms) and do not satisfy "no more than 350ms"; the `ease-out` / `ease` curves are not equal to the standard curve of `MO-MF-04`. Following "official first" in section 4.1 of 00-overview, the official values stay, and items A30 / A31 of the checklist need a human confirmation (source: components/feedback/Toast/SPEC.md, spec/00-overview.md) `[Known deviation]`.

## Where it goes: in the document flow vs in an overlay

| Component | Layer | Landing spot | Basis |
| --- | --- | --- | --- |
| EmptyState | In the document flow | The vertical space of the block it occupies, replacing the original content | Component form (source: components/feedback/EmptyState/SPEC.md) `[Proposed here]` |
| InlineNotice | In the document flow | Beside the spot where the problem is (above or below the form), staying until it is closed | Component form (source: components/feedback/InlineNotice/SPEC.md) `[Proposed here]` |
| RunningRing / StateDot | In the document flow (inline with the row) | The start of a list row, before the inline text | Capture: a 16 × 20 slot at the start of a left-sidebar conversation row (source: docs/reference/running-row.json) `[Runtime measurement]` |
| Toast | Overlay | A frame-level overlay that spans every column and floats outside the scroll container | `createPortal(..., document.body)` plus `position: fixed` (source: components/feedback/Toast/SPEC.md) `[Official source]` |

- A frame-level overlay that crosses regions and covers the whole screen goes on `shell.overlay` and must declare `order` explicitly (source: step 5 of the content ownership decision tree in spec/10-frame-layout.md, `SL-MF-03` in spec/11-slot-seats.md, checklist A09) `[Proposed here]`.
- `conversation.input.overlay` is only for momentary UI that must sit on top of the input card, and must never be permanent (source: `FL-MF-04` in spec/10-frame-layout.md, checklist A04) `[Proposed here]`.
- Cross-region content must not escape its region's boundary via negative margin or absolute positioning; a frame-level overlay is the only exception and must go through `shell.overlay` (source: `FL-MF-08` in spec/10-frame-layout.md, checklist A05) `[Proposed here]`.
- `[Known deviation]` `shell.overlay` has 14 occupants, 11 of which declare no `order` and all fall to the default 0, so the stacking order is decided by registration timing and is unpredictable (source: data/raw/occupancy-2026-10-01.json, captured 2026-10-01; the occupant count changes with the plugins enabled on the machine) `[Runtime measurement]`.
- A new plugin entering a seat that already has occupants must take a vacant value (the current maximum + 10) and must not copy an existing value (`CF-MF-03`); a conflict is judged only from declarations and configuration, never from registration timing (`CF-MF-01`) (source: spec/80-conflicts.md) `[Proposed here]`.

## Key states and durations

| Form | Enter | Hold | Exit | Loop cycle | Source |
| --- | --- | --- | --- | --- | --- |
| Toast | 160ms `ease-out` | 3000ms | 1000ms fade out; unmount at hold + fade | None | components/feedback/Toast/SPEC.md `[Official source]` |
| RunningRing | None | Continuous | None (goes away with the row it is in) | Spin 1.5s `linear`; stretch 1.5s `ease-in-out` | docs/reference/running-row.json `[Runtime measurement]` |
| StateDot (ongoing) | None | Continuous | None | 1s endless, each square offset by 125ms | components/data-display/StateDot/SPEC.md `[Official source]` |
| InlineNotice (tone switch) | 160ms `ease-out` (background and text colour) | Permanent until closed | No animation, the node unmounts directly | None | components/feedback/InlineNotice/SPEC.md `[Official source]` |
| EmptyState | The SPEC lists no transition or animation at all | Permanent until the condition changes | None | None | components/feedback/EmptyState/SPEC.md `[Proposed here]` |

- Reduced-motion branch: the notice's transition is `none` under `prefers-reduced-motion: reduce` (source: components/feedback/InlineNotice/SPEC.md); Toast drops the slide-in shift and keeps only the delayed fade (source: components/feedback/Toast/SPEC.md); both running-ring animations stop (source: components/feedback/RunningRing/SPEC.md) `[Official source]`.

## Keyboard and focus (including screen-reader announcement)

| Component | Tab reachable | Keyboard | Where focus goes | Screen reader |
| --- | --- | --- | --- | --- |
| EmptyState | Not interactive itself; the controls in the action slot are each reachable | Decided by the controls in the slot | Decided by the controls in the slot | The caller passes `role="status"` through; add `aria-hidden` when it is announced elsewhere `[Proposed here]` |
| InlineNotice | The close control is a `<span>` with `role="button"` and `tabIndex=0` | Enter / Space closes it, and the component calls `preventDefault` and `stopPropagation` itself | After closing, focus falls back to `body`, and the caller should return it to the triggering element | No `alert` by default; when an announcement is needed the caller passes `role="status"` or `role="alert"` `[Proposed here]` |
| Toast | Unreachable (`pointer-events: none`, does not receive clicks) | None | None | A fixed `role="alert"`, which interrupts the current reading `[Official source]` |
| RunningRing / StateDot | Unreachable, `aria-hidden` | None | None | The ring uses a visually hidden "in progress"; a state dot must have its meaning carried by adjacent readable text `[Official source]` |

- Announcement semantics come in two levels: `status` announces politely and does not interrupt; `alert` interrupts the current reading. For an empty state or a notice that appears asynchronously, the caller passes the `role` through to the root node (source: components/feedback/EmptyState/SPEC.md, components/feedback/InlineNotice/SPEC.md) `[Official source]`.
- Toast receives no clicks and has no room for buttons, so it cannot carry an operation that is the only entry point; for an important or information-heavy message, lengthen `holdMs` or switch to InlineNotice (source: components/feedback/Toast/SPEC.md) `[Proposed here]`.
- General requirements: every interactive element is reachable by Tab and triggered by Enter / Space, in an order that matches the visual one (`AC-MF-09`); focus must be visible, and `outline: none` with no substitute is forbidden (`AC-MF-10`); the focus ring is 2px solid with a 2px outer offset (`AC-MF-11`); it must not be clipped by a container's `overflow: hidden` (`AC-MF-12`); an icon-only button must have an accessible name, and a decorative icon is `aria-hidden` (`AC-MF-14`) (source: spec/60-accessibility.md, checklist A47 / A48 / A49) `[Proposed here]`.

## Light and dark

- Colour comes only from `--dsw-*` semantic tokens, and no hard-coded colour value may appear in the source (`TK-MF-01`, checklist A23 / A19); the enhanced-contrast variant is the host theme's job, and bypassing tokens is forbidden (`AC-MF-08`, checklist A28) (source: spec/30-tokens.md, spec/60-accessibility.md) `[Proposed here]`.
- The tokens themselves are defined in pairs through `light-dark()`, for example `--dsw-alias-label-tertiary: light-dark(neutral-bluish-600, neutral-bluish-400)` (source: website/demos/a11y-board.html) `[Official source]`.
- `[Known deviation]` Measured on light-mode white: `--dsw-alias-label-primary` about 18.9:1, `label-secondary` about 5.8:1, `label-tertiary` about 3.7:1 (below 4.5:1), and it is the tertiary colour that 13px description text and 10px state labels use. Following "official first" in section 4.1 of 00-overview, this is recorded as a known deviation rather than overriding the official control; when a plugin uses `label-tertiary`, do not put key information there alone (source: spec/60-accessibility.md, live browser computation in website/demos/a11y-board.html) `[Runtime measurement]`.
- Contrast under the dark theme: no evidence (this repository has only computed it live for light-mode white; the contrast table in `a11y-board` reads the computed colour values of the current theme and left behind no dark-theme measurement numbers).
- The InlineNotice info / error background is derived with `color-mix` from the matching primary colour, so that one rule covers both themes at once (source: components/feedback/InlineNotice/SPEC.md) `[Proposed here]`.

## Narrow windows

| Component | Narrow-window behaviour | Source |
| --- | --- | --- |
| Toast | `max-width: min(640px, calc(100vw - 48px))`; the anchor is positioned from `rect.left + rect.width / 2` and re-measured on `resize` | components/feedback/Toast/SPEC.md `[Official source]` |
| InlineNotice | On one line `white-space: nowrap`, and copy that overflows is clipped, so switch to the multi-line form | components/feedback/InlineNotice/SPEC.md `[Official source]` |
| EmptyState | `max-width: 280px` plus 12px padding on each side, with text wrapping inside the container; the root node has no fixed `height` | components/feedback/EmptyState/SPEC.md `[Proposed here]` |
| RunningRing / StateDot | Fixed 14px / 10px, not scaled with the container; the text on the same line takes care of the part that gets truncated | components/feedback/RunningRing/SPEC.md, components/data-display/StateDot/SPEC.md `[Runtime measurement]``[Official source]` |

- Function does not change with space, only the amount made visible does: when the window narrows, collapse or fold, and never delete the entry point (`AC-MF-16`, checklist A51); never clamp a text container to a fixed pixel height (`AC-RC-17`, checklist B13); at 200% browser zoom, text is neither truncated nor overlapping (`AC-MF-15`, checklist A50) (source: spec/60-accessibility.md, spec/70-checklist.md) `[Proposed here]`.
- The official `ConnectionIndicator` in a narrow container: no evidence (the capture only covers a 1570 × 905 viewport, source: docs/reference/running-row.json) `[Runtime measurement]`.

## Accessibility

- Hit areas: no interactive element smaller than 20 × 20, a 28 × 28 target for regular controls, and adjacent hit areas that do not overlap (`AC-MF-01` / `AC-MF-03`, checklist A43); a container row holding an icon button is ≥28 high (`AC-MF-04`, checklist A44) (source: spec/60-accessibility.md) `[Proposed here]`.
- Toast is `pointer-events: none` throughout and is not an interactive element, so the hit-area requirement does not apply to it; the InlineNotice close control is 20 × 20, which meets the minimum but is smaller than the 28 × 28 target for regular controls (source: components/feedback/Toast/SPEC.md, components/feedback/InlineNotice/SPEC.md) `[Proposed here]`.
- Contrast: text at ≤17pt ≥4.5:1, at ≥18pt or bold ≥3:1 (`AC-MF-05`, checklist A45); non-text UI elements are proposed at ≥3:1 (`AC-MF-06`) (source: spec/60-accessibility.md) `[Proposed here]`.
- Colour must not be the only carrier of information (`AC-MF-07`, checklist A46): the notice's four tones differ only slightly in greyscale, so they need an icon or a stated status in the copy; a state dot must have adjacent readable text (source: components/feedback/InlineNotice/SPEC.md, components/data-display/StateDot/SPEC.md) `[Proposed here]`.
- Motion: a `prefers-reduced-motion: reduce` branch is required (`MO-MF-09`, checklist A34), implemented with a media query or a `matchMedia` listener (`MO-MF-10`); a loading indicator must not shift position by any large amount (source: spec/40-motion.md) `[Proposed here]`.
- A timed close is unfriendly to users with cognitive disabilities: when the message is heavy or important, lengthen `holdMs` or switch to InlineNotice (source: components/feedback/Toast/SPEC.md) `[Proposed here]`.

## Implementation resources

| Purpose | Path |
| --- | --- |
| Empty-state component (README / SPEC / demo) | components/feedback/EmptyState/ |
| Inline notice component | components/feedback/InlineNotice/ |
| Running ring component | components/feedback/RunningRing/ |
| Momentary notice component | components/feedback/Toast/ |
| Static state dot component | components/data-display/StateDot/ |
| Input error-state convention | components/controls/Input/SPEC.md |
| Captured data for the running state | docs/reference/running-row.json |
| Ongoing motion and the five duration steps | spec/40-motion.md |
| Seats and cross-region ownership | spec/10-frame-layout.md |
| Seat occupancy discipline | spec/11-slot-seats.md |
| Accessibility (contrast, hit areas, focus) | spec/60-accessibility.md |
| Conflict resolution | spec/80-conflicts.md |
| Seat occupancy snapshot | data/raw/occupancy-2026-10-01.json |
| Official / proposed attribution | components/origins.json |
| Demos (live contrast computation / conflict / motion) | website/demos/a11y-board.html, website/demos/conflict-board.html, website/demos/motion-select.html |
| Binary checklist before you submit | spec/70-checklist.md |

## Spec

Decidable items for plugin authors. The source column gives a rule number or a component file; an item with no matching rule is a proposal added on this page, and the reason is written in the same column.

| Item | Check (yes / no) | Source |
| --- | --- | --- |
| The four kinds of feedback do not share one shell | What appears while loading is not the empty-state copy; a failure and "there really is nothing" are not drawn the same way | components/feedback/EmptyState/README.md `[Proposed here]` |
| The frequency of continuous motion is compliant | The cycle is 1s or 1.5s and `animation-iteration-count: infinite` | `MO-MF-12`, checklist A32 |
| One message uses only one running form | A ring and a chasing square or three dots do not appear on the same row | `MO-MF-13` |
| A reduced-motion branch exists | The stylesheet contains `@media (prefers-reduced-motion: reduce)` | `MO-MF-09` / `MO-MF-10`, checklist A34 |
| Loops and transitions animate only compositor properties | No animating `width` / `height` / `top` / `left` / `margin` | `MO-MF-08`, checklist A33 |
| The overlay's seat and order | It goes on `shell.overlay` with `order` declared explicitly, taking the seat's current maximum +10 | `FL-MF-08`, `SL-MF-03`, `CF-MF-03`, checklist A09 / A10 |
| The input-card overlay holds no permanent UI | `conversation.input.overlay` contains no permanent element | `FL-MF-04`, checklist A04 |
| Nothing overflows its boundary | No negative margin or absolute positioning escaping its region | `FL-MF-08`, checklist A05 |
| Every colour comes from a semantic token | No hard-coded hex / rgb / hsl in the source | `TK-MF-01`, checklist A19 / A23 |
| Colour is not the only clue | The four tones and five states are still distinguishable in greyscale | `AC-MF-07`, checklist A46 |
| Text contrast passes | Text at ≤17pt ≥4.5:1 | `AC-MF-05`, checklist A45 |
| Hit areas pass | Interactive elements ≥20 × 20; a container row holding an icon button ≥28 high | `AC-MF-01` / `AC-MF-04`, checklist A43 / A44 |
| Focus is visible | A focus style exists, and it was not removed with `outline: none` and no substitute | `AC-MF-10` / `AC-MF-11`, checklist A48 |
| Decoration and naming are kept apart | Decorative icons are `aria-hidden`; an icon-only button has an accessible name | `AC-MF-14`, checklist A49 |
| A state dot always has text beside it | Every `StateDot` has readable text beside it carrying the meaning | the a11y section of components/data-display/StateDot/SPEC.md |
| A notice carries no mandatory operation | Toast carries no operation that is the only entry point; InlineNotice is not used for a pick-one-of-many | the a11y section of components/feedback/Toast/SPEC.md |
| Focus has somewhere to go after a close | When the notice unmounts, focus goes back to the element that triggered it | the a11y section of components/feedback/InlineNotice/SPEC.md |

## Sources and known deviations

### Basis

- `components/feedback/EmptyState/{README,SPEC}.md`, `components/feedback/InlineNotice/{README,SPEC}.md`, `components/feedback/RunningRing/{README,SPEC}.md`, `components/feedback/Toast/{README,SPEC}.md`, `components/data-display/StateDot/SPEC.md`: the geometry, states, a11y and checks of the four kinds of feedback.
- `components/controls/Input/SPEC.md`: a field-level error is rendered by the outer container, passing `aria-invalid` / `aria-describedby` through.
- `components/origins.json`: which components really exist in the product (the `official` and `scenes` fields).
- `docs/reference/running-row.json`: the captured SVG and animation values of the running ring at the start of a left-sidebar conversation row (a 1570 × 905 viewport).
- `spec/10-frame-layout.md`, `spec/11-slot-seats.md`, `spec/30-tokens.md`, `spec/40-motion.md`, `spec/60-accessibility.md`, `spec/70-checklist.md`, `spec/80-conflicts.md`: layer ownership, seat order, tokens, motion, accessibility, the checklist and conflict resolution.
- section 4.1 of `spec/00-overview.md`: how official implementations take priority.
- `data/raw/occupancy-2026-10-01.json`: a snapshot of seat occupants (captured 2026-10-01).
- `website/demos/a11y-board.html`: contrast computed live in the browser from the WCAG relative-luminance formula.

### Known deviations

- Official `ongoing` has two implementations (the pixel chase matrix in the primitives package and the spinning ring the product really renders), and only the latter appeared in the real interface.
- `label-tertiary` is about 3.7:1 on light-mode white, below 4.5:1, and the 13px description and 10px state label use it; recorded as official-first, without overriding the official control `[Runtime measurement]`.
- Toast's 160ms / 1000ms and `ease-out` / `ease` are not among the five steps and the standard curve of the motion spec; kept as official-first, and checklist A30 / A31 need a human confirmation `[Known deviation]`.
- EmptyState's "icon + title + description + action" combination and InlineNotice's `info` / `error` tones have no counterpart in the product, so that whole set of geometry is `[Proposed here]`.
- Contrast under the dark theme, and the official `ConnectionIndicator` in a narrow container: no evidence.
