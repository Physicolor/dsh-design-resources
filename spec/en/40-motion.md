---
source: spec/40-motion.md
source-sha256: f81bfb9678175592
translated-at: 2026-10-07
---
# 40 Motion spec (reference steps, not an official requirement)

- Applies to: plugin UI containing transitions or animation.
- Force: **every clause is RC (recommended) or AD (advisory); this document has no MF (mandatory) clauses.** The official client publishes no duration or curve values, so these are steps you may copy; judging happens in B13–B20 of the [70 checklist](70-checklist.md).
- Whether the criteria in this document can be detected automatically: yes (duration values, curve functions, whether a reduce media query exists, and whether a layout property is animated can all be found by static scan).

## 0. Where the values come from (read first)

DSH does not publish its motion durations or easing curve values. Apple HIG does not publish a motion duration table either — any claim that "HIG specifies 200ms" is invented. This spec therefore takes its motion values from a single authoritative source: the five duration steps and the standard curve in [OH] (the full OpenHarmony official documentation). That is not the same as where control geometry comes from (DSH official CSS), so name the source whenever you cite a value.

**Which motions the official client actually has** ([Runtime measurement]): its transitions cluster in a few places — the workspace search box expanding and collapsing, the left rail opening and closing, the right rail opening and closing, the session head's tab switch, and overlays and menus appearing and disappearing. Many other interactions have no transition at all. This document is therefore a **reference**, not a replica of official behaviour: keep an official control's own transition where one exists (see [Overview 4.1](00-overview.md)), and only fall back to the steps below where there is nothing official to copy — saying in your README that those values are this repository's suggestion.

## 1. The five duration steps

The official [OH] five steps: 100 / 150 / 200 / 300 / 350 ms.

| Duration | Where it applies |
| --- | --- |
| 100ms | Micro-feedback: press, hover colour change, state dot toggle |
| 150ms | Small element state change: Switch, Checkbox, Tag, Pill |
| 200ms | Ordinary transition: expand/collapse, fade in and out, movement under 100px |
| 300ms | A larger region entering: a panel, sidebar or overlay appearing |
| 350ms | The ceiling: a full-screen or large panel entering |

- `MO-RC-01`: a transition duration must be one of 100 / 150 / 200 / 300 / 350. Intermediate values such as 250, 400 and 500 are forbidden, and so is anything past 350ms. Check: the value set of `transition-duration` and `animation-duration` must be a subset of those five steps.
- `MO-RC-02`: within one state change, every element involved uses the same duration step. When you want a sense of hierarchy, use a staggered delay of no more than 100ms rather than switching to different durations. [Proposed here]
- `MO-RC-03`: entry and exit durations must be symmetrical. Why: no authoritative source backs asymmetry, and asymmetry makes a cancelled action feel sluggish. [Proposed here]

[Known deviation] Two transition values in this repository's component implementations fall outside those five steps — do not treat them as examples when you read the component sources: `components/controls/Switch/switch.module.css` line 21 sets `--dsh-switch-duration: 120ms` (the step for this class of small-element state change is 150ms), and `components/feedback/InlineNotice/inline-notice.module.css` line 38 sets `160ms ease-out` (outside the scale and not the standard curve). This round logs them without changing the implementations, so that an unrelated edit does not move existing visual behaviour; a new transition still has to take its duration from the five steps of `MO-RC-01` and its curve from the standard curve in `MO-RC-04`, and these two legacy values set no precedent. [Proposed here]

## 2. Easing curves

- `MO-RC-04`: the standard curve is `cubic-bezier(0.40, 0, 0.20, 1)`, used for the great majority of movement and size changes. [OH]
- `MO-RC-05`: the linear curve (`linear`) is only allowed for ongoing progress (a progress bar, the movement of a skeleton screen), never for interaction feedback. [Proposed here]
- `MO-RC-06`: using defaults that are not aligned with the official curve, such as `ease` / `ease-in-out`, as an interaction transition curve is forbidden. Check: scan `transition-timing-function`; only the standard curve, `linear` (progress only) and `steps()` (discrete frames only) are allowed. [Proposed here]

## 3. What moves and what doesn't

| Where motion belongs | Where it doesn't belong |
| --- | --- |
| A state change (hover, selected, disabled) | A first-screen entrance performance (blocks flying in one by one, delayed reveals) |
| Appearing and disappearing (overlay, menu, panel) | A looping decorative animation (breathing, a slowly rotating decorative shape) |
| A change of position (a list item moving, a drag settling into place) | Text typing itself out character by character (except the native behaviour of streamed content) |
| Progress and loading | Changing size on hover so the layout reflows |
| Expanding and collapsing | Purely decorative scrolling on a value change |

- `MO-RC-07`: an infinite looping animation is forbidden unless it expresses a process in progress (loading, generating). Any other looping animation counts as a violation.
- `MO-RC-08`: do not animate properties that trigger layout (width, height, top, left, margin, padding). Use `transform` and `opacity`. Why: [OH] makes 60FPS mandatory for interaction animation; only `transform` / `opacity` reach that reliably without triggering a layout reflow. Check: scan the transition property list.

<!-- demo: motion-select | Even something as small as the arrow to the right of a select is motion. The left side is the right way to do it; the right side is the counter-example that animates with layout properties. Click "Auto play" to watch it loop. -->

<!-- demo: motion-panels | Right up to the whole page shifting when the left and right columns open and close. Click the button to open and close them by hand, or let them loop on their own. -->

## 3.1 Motion in progress (loading / running)

Continuing motion is not one of the five duration steps — `MO-RC-01` governs a state transition (a click, an opening), while this section governs something that keeps running. The official product has three coexisting implementations for it, all with a period of 1s or 1.5s:

| Form | Period and curve | Source |
| --- | --- | --- |
| Running ring (spin + arc stretch) | spin `1.5s linear infinite`; stretch `1.5s ease-in-out infinite` | client CSS module `_spinnerMotion_1i3xo_42` / `_spinnerArc_1i3xo_48`; component at `components/feedback/RunningRing/` |
| Pixel chase (the `ongoing` state of `StateDot` in the library) | `1s` infinite, four discrete steps (`opacity` 1 / 0.6 / 0.35 / 0.15), the `animation-delay` of each cell 125ms apart | `@deepseek-ai/dsh-client-ui-primitives/lib/StateDot.module.css` `@keyframes dsh-state-dot-chase` |
| Three dots appearing in turn | `1.5s` infinite, `step-end` | `ConnectionIndicator.module.css` `.secondDot` / `.thirdDot` |
| The whale animation on the running hint line | Glyph **14 × 14**, shown with the `深度求索中，用时 …` line | Captured: the running hint in the left sidebar conversation row and above the input area |

- `MO-RC-12`: the period of an ongoing animation must be `1s` or `1.5s` only, and it must be `infinite`. Check: scan the `animation-duration` of every `animation-iteration-count: infinite`.
- `MO-RC-13`: for the same "in progress" message, use one form per interface. If the session row starts with a running ring, do not hang three dots or a chase square on that same row — they are three official implementations, not three levels of granularity.
- `MO-RC-14`: when determinate progress is available (you know how much is left), do not use a spinner. That is Apple HIG's leaning ([Progress indicators](https://developer.apple.com/cn/design/human-interface-guidelines/progress-indicators): prefer determinate when the duration can be known, because it helps the user decide whether to go and do something else first). The official library ships no progress bar component today; a plugin that needs one builds it, but **do not treat a spinner as the "close enough" substitute**.

**The official product contradicts itself here (judged against HIG)**: the official primitives package gives `ongoing` a pixel chase matrix, while what the product actually renders at the start of a session row is a spinning ring — two implementations side by side, and the library's one never appears in the real interface. HIG files a wait of unknown duration as indeterminate, whose form is the spinner ("All platforms support a circular image that appears to spin"), and suggests preferring a spinner in a small, space-constrained area. **Verdict: this is the official product not having settled on one, not a deliberate division of design labour; follow the product (the spinning ring), and the chase matrix appears only where the library's `StateDot` is unavoidable.** (A live comparison sits in the preview in `components/feedback/RunningRing/`.)

## 4. prefers-reduced-motion (mandatory)

- `MO-RC-09`: respond to `prefers-reduced-motion: reduce`. In that mode, every non-essential movement, scaling and rotation becomes instant (0ms); opacity changes and loading indicators may stay, but a loading indicator takes no large movement.
- `MO-RC-10`: use a CSS media query, or listen to `matchMedia` changes at runtime; do not read the result once at startup and hard-code it (when the user switches the setting in the system, it takes effect at once). [Proposed here]
- Check: a stylesheet that contains no `prefers-reduced-motion` is a violation (machine-checkable).

## 5. Performance budget

- `MO-RC-11`: interaction animation holds 60FPS the whole way through. [OH] follows from the definition of 60FPS: a per-frame budget of about 16.7ms.
- `MO-RC-12`: no more than 2 animation groups run at once on one screen. No authoritative value exists; this repository proposes 2, because concurrent animation is the main source of dropped frames, and concurrent animations compete with each other for attention. [Proposed here]
- `MO-RC-13`: the first screen carries no animation. Why: a first-screen animation pushes back time-to-interactive, and the first screen has no state change to express anyway. [Proposed here]
- `MO-AD-14`: an element inside a long scrolling list plays no appearance animation (virtual scrolling fires it over and over). [Proposed here]

## 6. What can and cannot be detected

- Detectable automatically: whether a duration falls in the five steps, whether it goes past 350ms, whether the curve is the standard curve, whether an infinite looping animation exists, whether a `prefers-reduced-motion` branch exists, whether a layout property is animated.
- Not detectable automatically: whether the motion is "appropriate" (whether it belongs at all, whether the rhythm feels natural) — that needs human review.
