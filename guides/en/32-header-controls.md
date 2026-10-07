---
source: guides/32-header-controls.md
source-sha256: 5a656e7e897f12fb
translated-at: 2026-10-07
---
# Buttons at the top right of the conversation header and at the end of a turn

> Add buttons to the top right of the conversation header and to the action row at the end of a turn: which seat the semantics call for, how big the icon and the hit area are, which order to take, and how open and close should move.

## What this page gets you

- Pick the right one of the three places in the top right, and say why the other two are wrong.
- Settle the size, shape and five states of an icon button, including the semantic state of a toggle button.
- Work out the order to take from the existing occupants, instead of putting in 0 or 40 at random.
- Decide whether an action belongs to "the whole turn" or to "one message", and put it in the matching seat.
- Implement the open and close motion from the skeleton, so the edges do not come apart during the push.

## The top right has three places, with different semantics

They all sit on the right of the conversation header and they look alike, but the product gives them completely different purposes. Pick the wrong one and the interface still appears; what breaks is a judgement like "should that button next to it be here at all".

| Seat | Official purpose (translated) | What goes in it |
| --- | --- | --- |
| `conversation.session.header.actions` | Conversation actions beside the title | Actions about this conversation itself: rename, share, export |
| `conversation.session.header.utilities` | Right-aligned conversation utilities, ordered ascending | View-level utilities: panel toggle, summary toggle, more actions |
| `conversation.session.header.corner` | The far right corner beyond the edge of the utilities row, inside the header's own padding, **for one control** | Already taken by the right column toggle; do not touch it |

- `RG-MF-30`: To add a utility button, register in `conversation.session.header.utilities`; only when it describes "this conversation itself" does it go in `conversation.session.header.actions`. Test: take it out of the header — can the user still read this conversation? If not, it is actions; if yes, it is utilities. [Proposed here]
- `RG-MF-31`: Do not register `conversation.session.header.corner`. It is `single` and already occupied by the right column toggle, and a `single` seat has no coexistence, so occupying it means shadowing the product's sole entry point to the main flow (`SL-MF-09`, `SL-MF-10`). [Official source]

A concrete example: you want to add a "toggle the pinned summary" switch to the top right. It toggles a panel inside the current conversation and does not affect the conversation itself, so it goes in `conversation.session.header.utilities`, not actions, and certainly not corner where it would push the right column toggle out.

### A worked example, end to end: toggling the pinned summary (button + card + motion)

That sentence only answered "where does the button go". Below is the same example taken through all three questions — **where it goes → what it looks like → how it moves**. It doubles as this repository's self-check on whether one example is enough to start work. The demo is operable: click the tool button in the head and the card opens and closes.

<!-- demo: pinned-summary | A worked example, end to end (this repository's proposal, not a product capture): a button in the session head's tool row toggles a pinned-summary card floating on the band. The button's geometry is measured; the card's radius and elevation come from components/surfaces/Card; its placement and open/close behaviour are this repository's proposal. -->

**① Where it goes: the button and the card are two different placements**

| Thing | Placement | Basis |
| --- | --- | --- |
| The toggle button | `conversation.session.header.utilities` (the session head's right-aligned tool row) | It does not affect the session itself — `RG-MF-30` |
| The summary card itself | The band beside the reading column (no official seat; borrow one) | [Region map](../spec/05-region-map.md) §5.1; the borrowed-seat method is in [Places the product gives no seat](31-unofficial-regions.md) |
| The card's open/close state | Lives on the current session and is recomputed when you switch sessions | Everything in the centre column follows the session (`RG-MF-17`) |

**Why the card does not go in the right column**: the right column is the page's fourth column, never narrower than 300px, and the centre makes room for it; the band is the remainder after the text column is centred and can shrink to 0. A summary is meant to be read *beside* the text and changes with the current round, so it belongs to the centre column (`RG-MF-16`).

**② What it looks like: the width is derived, not chosen**

The reading column is a fixed **748px**, centred. On a 1085 / 1290px centre column that leaves:

```
remainder (per side) = (centre − 748) ÷ 2 = (1085 − 748) ÷ 2 ≈ 168px   (1290 with a plugin rail)
```

That remainder is all the band has. The card must not eat into the text, so:

- `RG-RC-50`: a card on the band takes its width from `min(273px, remainder − 32px)` and never goes below **240px**; below 240px it **folds back into the session head** (the first of the three zero-width behaviours) rather than squeezing further. [Proposed here]
- `RG-RC-51`: the card surface keeps [Card](../components/surfaces/Card/SPEC.md)'s resting tier — radius `--dsw-radius-xl` 20px, fill `--dsw-alias-bg-layer-2`, elevation `--dsw-elevation-soft`; do **not** invent a shadow or a border. [Proposed here]
- `RG-MF-52`: the card must not change the width of the text. It floats on the band; it is not a new column that narrows the reading column. [Proposed here]

**③ How it moves: what animates, and what absolutely does not**

Exactly **one** thing moves in this example: the card. The band does not move, the text does not move, the tool button does not move.

| Property | Value | Why |
| --- | --- | --- |
| Duration | **300ms**, same opening and closing | the "larger area entering" step of `MO-RC-01`; symmetry is `MO-RC-03` |
| Curve | `cubic-bezier(0.40, 0, 0.20, 1)` | `MO-RC-04` |
| What animates | `opacity` + `transform: translateY(4px)` | `MO-RC-08` forbids animating layout properties |
| What never animates | `width` / `padding` / `margin` | animating them reflows the text with it |
| `prefers-reduced-motion` | zero out the shift, keep the fade | `MO-RC-09` |
| On close | let the transition finish before unmounting, never `display:none` mid-flight | otherwise the user sees it snap out |
| Not enough width | the card folds into the tool row rather than shrinking to a sliver | the zero-width behaviour of `RG-RC-50` |

The button itself: `aria-pressed` carries open/closed (`RG-MF-34`), the icon is 16 × 16, the hit area 28 × 28, the radius 8 (`RG-MF-32`).

**④ Check it against this table before shipping**

| Yes / no | Criterion | Clause |
| --- | --- | --- |
|  | The button is in `utilities`, not actions and not corner | `RG-MF-30`, `RG-MF-31` |
|  | The card borrows the band, and the README says "the product has no seat here" | `RG-MF-20`, `RG-MF-25` |
|  | The card's width is derived from the remainder and does not change the text width | `RG-RC-50`, `RG-MF-52` |
|  | Durations and curve come from the reference steps, and it exits when the window narrows | `MO-RC-01`, `MO-RC-03`, `RG-RC-50` |
|  | The transition never touches `width` / `padding` / `margin` | `MO-RC-08` |
|  | Under reduced motion the shift is zeroed | `MO-RC-09` |
|  | The button carries `aria-pressed`, and its on/off difference is not colour alone | `RG-MF-34` |

## Size, shape and states

The measured values come from the capture (viewport 1570 × 905):

| Part | Measured |
| --- | --- |
| Top bar glyph icon | **16 × 16**, button hit area **28 × 28** |
| Conversation header chip | Container height **28**; icon **14 × 14**; label **12 / 16** in the tertiary colour |
| Turn tail message action button | **28 × 28**, radius **8** |

- `RG-MF-32`: The hit area of a top-right icon button is no smaller than 28 × 28; the icon itself is 16 × 16; corner radius comes only from 4 / 8 / 12 / 16 / 20 / 28 (source: [20 Controls](../spec/20-controls.md) and [60 Accessibility](../spec/60-accessibility.md)). [Runtime measurement]
- `RG-MF-33`: All five states — default, hover, pressed, visible keyboard focus, disabled. Where an official control itself is missing a state, leave it empty honestly rather than adding your own styling ([Overview section 4.1](../spec/00-overview.md)). [Proposed here]
- `RG-MF-34`: A toggle button must carry `aria-pressed` (or a semantic equivalent), and the icon or the shape must show a visible difference between on and off — telling them apart by colour alone is unreadable for users with colour vision deficiency. [Proposed here]
- `RG-MF-35`: An icon button must have a readable name; the focus ring must not be clipped by the header container. [Proposed here]

[Borrowed principle] Apple's HIG binds toolbar items to the view they act on and asks tools of the same kind to keep a consistent visual weight; Huawei's design guide suggests organising buttons by purpose, visual type and state rather than by size. Those two judgements can be borrowed; the platform numbers cannot: DSH is three full-height tracks, chrome is owned per column, and there is no global top bar, so "toolbar" here means **the header of one particular track**, and which track a row of buttons belongs to decides its ownership, not whether it looks like a toolbar.

## How to take an order

`conversation.session.header.utilities` is a `list` seat, and the product measurably has 4 occupants with orders of **-10 / -5 / undeclared (falling on the default 0) / 5**. This is the most explicable ordering in the whole repository, so do not mess it up.

- `RG-MF-36`: A new entry takes the seat's current maximum order + 10. By the measurements above, today that starts at **15**; reconcile it again on your own DSH after writing, because the number of occupants depends on which plugins are installed. [Proposed here]
- `RG-MF-37`: Do not take 0. 0 is the interval left to the product's existing items; a plugin taking 0 inserts itself into the product's relative order, and that order is not yours to set. [Proposed here]

The band table (full explanation in section 3 of [Seat directory and selection](../spec/11-slot-seats.md)):

| Interval | Purpose |
| --- | --- |
| ≤ -10 | Framework level, items ahead of the main flow |
| -9 .. -1 | Priority lead-in |
| 0 | The product's existing occupants |
| 1 .. 99 | Regular additions, in +10 steps |
| ≥ 100 | Reserved |

- `RG-MF-38`: Adjacent orders for the same plugin in the same seat are at least 5 apart, and no more than 3 entries. More than 3 means the seat is being used as a menu, so switch to carrying your own popup layer. [Proposed here]

## The action row at the end of a turn

The row of small icons at the bottom left of a completed turn in the screenshot (copy, insert, undo and so on) and the rating button at the bottom right are the same mechanism: **an action row rendered once a turn completes**.

| Seat | Official purpose (translated) | What goes in it |
| --- | --- | --- |
| `conversation.chat.turnTail` | Ordered feature contributions **before** the action row once a turn completes | Things about the whole turn: elapsed time, statistics, the entry point to this turn's summary |
| `conversation.chat.assistant-actions` | Ordered actions for one **finalised assistant message** | Actions about the message itself: copy, quote, retry, rate |

- `RG-MF-39`: If the action's subject is the whole turn it goes in `conversation.chat.turnTail`; if it is that message it goes in `conversation.chat.assistant-actions`. The counter-example is putting "how long this turn took" into the message action row — it belongs to no single message, and it is the same number on another message. [Proposed here]
- `RG-MF-40`: No more than 6 visible controls in an action row (`FL-RC-05`). Beyond that, fold them into a menu. [Proposed here]
- `RG-MF-41`: These action rows are `list` seats, so they too need an explicit order, taking the existing maximum +10. [Proposed here]

## Open and close: the motion skeleton

For a motion like a summary card, where "a click opens a panel", follow these five steps. For the concrete durations and curve steps, see [40 Motion](../spec/40-motion.md).

1. **First settle what moves.** Does only the card fade and shift, or does the centre column give way at the same time? If the card takes part of the centre column's width (a summary card pinned to the right of the text, for instance), then two things are moving at once.
2. **When two things move together they must read the same duration and easing variables.** Otherwise the two are at different points of the push, the edges come apart and the content jumps (`RG-MF-18`).
3. **Do not animate `width`.** A width transition keeps triggering layout recalculations and drops frames visibly in a long conversation. To free up space, animate `padding` or `margin` and have both sides reference the same variable.
4. **Do not remove instantly on close.** When an element that is exiting is turned off with `display: none`, the user sees it snap away. Let it run its own transition out before unmounting.
5. **Under `prefers-reduced-motion` it must degrade.** Displacement and scaling are cancelled, leaving a one-off opacity switch.

- `RG-MF-42`: Both sides of the open and close must reference the same set of duration and easing variables; do not write one set of numbers each. [Proposed here]
- `RG-MF-43`: A transition must not act on `width` / `height` or other layout-triggering properties; when space has to be given, animate `padding` / `margin` and keep the reserving side and the track in step. [Proposed here]
- `RG-MF-44`: Under `prefers-reduced-motion`, cancel displacement and scaling and keep the fade. [Proposed here]

**The concrete numbers (frozen 2026-10-06)**: both expand and collapse take **300ms** (the "larger area entering: panels, sidebars, overlays" step in [40 Motion](../spec/40-motion.md)'s five-step scale), on the standard curve `cubic-bezier(0.40, 0, 0.20, 1)` (`MO-RC-04`). Symmetric in and out is a hard requirement of `MO-RC-03`, so "collapse a touch faster" as a feel adjustment does not hold here. Express those two values as your own local variables and have both sides reference them — a placeholder and an overlay each hard-coding their own number is exactly the defect `RG-MF-42` rules on. Degrade per `MO-RC-09`: under `prefers-reduced-motion: reduce` zero out displacement and scaling and keep a single opacity switch; the state change itself is not dropped.

[Known deviation] Two existing facts disagree with the numbers above — do not copy them as examples: `components/controls/Switch/switch.module.css` line 21 sets `--dsh-switch-duration: 120ms` (outside the five-step scale, where `MO-RC-01` gives this class of small-element state change the 150ms step), and `components/feedback/InlineNotice/inline-notice.module.css` line 38 sets `160ms ease-out` (outside the scale and not the standard curve). Both are legacy values in the component implementations; this round does not change the implementations and logs them here so the next author does not copy them.

## Counter-examples

- **Putting a toggle in `conversation.session.header.corner`**: there is room for exactly one control there, and the right column toggle already has it; what you push out is the user's only entry point to open the right column.
- **Expressing "the panel is open" with `aria-pressed` when the button is really a link**: a semantic state only holds for a real button or switch; a link has to use `aria-expanded`.
- **Stealing focus when the panel opens**: the user pressed a utility button, so focus should stay there or move to the first interactive element inside the panel, not drift to some corner of the panel.
- **Hanging the same thing on both `utilities` and `turnTail`**: the user sees two identical buttons, one governing the whole conversation and one governing this turn.

## Self-check table

| Yes / no | Check | Clause |
| --- | --- | --- |
|  | A utility button goes in `utilities`; only the conversation's own actions go in `actions` | `RG-MF-30` |
|  | `conversation.session.header.corner` is not occupied | `RG-MF-31` |
|  | Hit area ≥ 28 × 28, icon 16 × 16, radius from the six allowed steps | `RG-MF-32` |
|  | All five states are present, and the ones the product is missing are left empty | `RG-MF-33` |
|  | A toggle button carries `aria-pressed`, and the on/off difference is not colour alone | `RG-MF-34` |
|  | order takes the existing maximum +10, and is not 0 | `RG-MF-36`, `RG-MF-37` |
|  | Turn-wide things go in turnTail, message actions in assistant-actions | `RG-MF-39` |
|  | No more than 6 visible controls in an action row | `RG-MF-40` |
|  | Both sides of the open and close reference the same duration and easing variables | `RG-MF-42` |
|  | The transition does not act on `width` / `height` | `RG-MF-43` |
|  | Displacement and scaling are cancelled under reduced-motion | `RG-MF-44` |

## Sources

- `data/slots.json`: official purpose text for `conversation.session.header.actions`, `.utilities`, `.corner`, `conversation.chat.turnTail` and `conversation.chat.assistant-actions` (collected 2026-10-01).
- `data/raw/occupancy-2026-10-01.json`: the 4 occupants of `conversation.session.header.utilities` and their orders (collected 2026-10-01 19:02; the count varies with the plugins enabled on this machine).
- `docs/reference/top-strip.json`, `docs/reference/composer-geometry.json`, `docs/reference/conversation-geometry.json`: the measured geometry of the top bar glyphs, the conversation header chip and the message action button.
- `spec/11-slot-seats.md`, `spec/20-controls.md` §7.1, `spec/40-motion.md`, `spec/60-accessibility.md`, `spec/80-conflicts.md`.
- [Apple HIG: Toolbars](https://developer.apple.com/cn/design/human-interface-guidelines/toolbars), [HUAWEI Vision Design Guide: Buttons](https://developer.huawei.com/consumer/en/doc/design-guides-V1/button-0000001052807858-V1): borrowing the judgement method and the organisation, not the platform numbers.
