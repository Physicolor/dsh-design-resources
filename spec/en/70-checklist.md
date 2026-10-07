---
source: spec/70-checklist.md
source-sha256: f3f26107d3af3b89
translated-at: 2026-10-07
---
# 70 Pre-submission checklist

- Applies to: authors submitting a plugin (self-check) and reviewers checking one.
- Force: the checklist adds no force of its own; an item's force is inherited from the document it belongs to.
- Whether this document's criteria are machine-checkable: labelled item by item. Labels: automatic = a script decides it from source / build output / rendered result; semi-automatic = a script proposes candidates and a human confirms; human review = can't be automated.

How to use it: every item is binary (yes / no). A "no" on any item in the Required group blocks submission; a "no" in the Recommended group needs its reason written in the README. The motion group sits in Recommended: the official client publishes no duration or curve values ([40 Motion](40-motion.md) §0), so this repository's five steps and standard curve are a **reference**, not an official requirement.

## A. Required (mandatory)

<!-- demo: preflight-checklist | Checklist (clickable): its items, clause ids and detection methods are copied item by item from this page; it demonstrates the checklist's own mechanics — all binary, a single "no" in the Required group blocks submission, and a "no" in the Recommended group needs its reason in the README. -->

| No. | Criterion (all yes to pass) | Clause | Detection |
| --- | --- | --- | --- |
| A01 | The region a new UI belongs to is unique, and you can say in one sentence which column / band that is | FL-MF-01 | Human review |
| A02 | An operation the main flow must go through doesn't live only in the rightbar; collapsing the rightbar still lets the main flow finish | FL-MF-02 | Human review |
| A03 | The tool row holds only controls that act on this input or this send | FL-MF-03 | Human review |
| A04 | No permanently resident UI in `conversation.input.overlay` | FL-MF-04 | Semi-automatic |
| A05 | Cross-region UI doesn't use negative margin or absolute positioning to reach past its region and cover a neighbouring one | FL-MF-08 | Semi-automatic |
| A06 | In `sidebar.footer.action`, one button = one list entry, no wrapper | FL-MF-09 / SL-MF-13 | Automatic |
| A07 | Every seat id used comes from an official DSH declaration, none invented | SL-MF-01 | Automatic |
| A08 | Seat scope matches session dependence (something you don't need without a session uses `session`) | SL-MF-02 | Semi-automatic |
| A09 | Every `list` seat entry declares order explicitly | SL-MF-03 | Automatic |
| A10 | order doesn't collide with the seat's existing occupants, and takes the current maximum +10 | SL-MF-05 | Automatic |
| A11 | Occupying a `shadows-shipped-ui` seat comes with an explicit declaration and an off switch | SL-MF-08 | Semi-automatic |
| A12 | Doesn't cover an official single entry point (send, stop, the main settings entry, close) | SL-MF-09 | Human review |
| A13 | A `keyed` seat uses a stable key, with no timestamp / random number | SL-MF-11 | Semi-automatic |
| A14 | A `chain` seat falls back to the official implementation when nothing matches | SL-MF-12 | Human review |
| A15 | Button height is 36 or 28 only; corner radius 12 or 8 only | CT-MF-01 | Automatic |
| A16 | The icon container inside a Button is 16×16 and doesn't raise the button height | CT-MF-02 | Automatic |
| A17 | Tag has no click action bound | CT-MF-04 | Semi-automatic |
| A18 | Every interactive control has the five states default/hover/active/focus-visible/disabled (don't add what an official control doesn't provide, per 00-overview §4.1) | CT-MF-07 | Semi-automatic |
| A19 | All state colours come from `--dsw-*` semantic tokens | CT-MF-08 | Automatic |
| A20 | No home-made substitute for a control that officially exists (fake switch / fake dropdown / a div posing as a button) | CT-MF-11 | Semi-automatic |
| A21 | CSS doesn't override an official control's height, corner radius or font size | CT-MF-12 | Automatic |
| A22 | Adjacent independent controls sit ≥16px apart vertically | CT-MF-15 | Automatic |
| A23 | No hard-coded colour value in source or build output (hex / rgb / hsl / named colour) | TK-MF-01 | Automatic |
| A24 | Every font size comes from `--dsw-font-*` tokens | TK-MF-02 | Automatic |
| A25 | Corner radius uses only the official scale, never mixing r8/r10/r12 | TK-MF-03 | Automatic |
| A26 | Elevation is expressed through background layers, not carried by box-shadow | TK-MF-05 | Semi-automatic |
| A27 | No assumption of a light theme (no hard-coded light background or dark text) | TK-MF-07 | Automatic |
| A28 | Custom colours provide all three variants: light / dark / Increase Contrast | TK-MF-08 | Semi-automatic |
| A29 | Font size and line height are used as a pair | TK-MF-11 | Semi-automatic |
| A30 | Icon render size falls in an official size family (16×16/14×14/8×14/8.5×10.5/20×20), with no scaling outside the family | IC-MF-01 | Automatic |
| A31 | Icons in the same row / same toolbar share one size | IC-MF-02 | Automatic |
| A32 | A self-drawn icon matches the visual weight of official icons in the same family (area ratio deviation ≤25%), stroke inside the recommended range (1.25–1.5 for the 16 family) | IC-MF-04 / IC-MF-05 | Human review + semi-automatic |
| A33 | A single container doesn't mix icons of different styles, and no emoji serves as a semantic icon | IC-MF-06 / IC-MF-07 | Semi-automatic |
| A34 | SVG uses `currentColor`, with no embedded fixed colour and no hard-coded width/height | IC-MF-08 / IC-MF-12 | Automatic |
| A35 | An asymmetric icon is optically centred, with a basis for the compensation | IC-MF-09 | Human review |
| A36 | A self-drawn icon follows the three-part naming scheme, with authored name / component name / file name all in agreement | IC-MF-11 | Automatic |
| A37 | Every interactive element has a hit area ≥20×20, regular controls reach 28×28, and adjacent hit areas don't overlap | AC-MF-01 / AC-MF-03 | Automatic |
| A38 | The container row holding a button with an icon is ≥28 tall | AC-MF-04 | Automatic |
| A39 | Text at ≤17pt has contrast ≥4.5:1; at ≥18pt or bold, ≥3:1 | AC-MF-05 | Automatic |
| A40 | Colour isn't the only carrier of information (states stay distinguishable in greyscale) | AC-MF-07 | Semi-automatic |
| A41 | Tab reaches every interactive element, Enter/Space triggers it, and the order matches what's on screen | AC-MF-09 | Semi-automatic |
| A42 | Focus stays visible: `outline: none` never removes it without a replacement; the focus ring is 2px + 2px outer offset + `--dsw-alias-brand-primary` | AC-MF-10 / AC-MF-11 | Semi-automatic |
| A43 | Icon buttons have an accessible name; decorative icons carry `aria-hidden` | AC-MF-14 | Automatic |
| A44 | At 200% browser zoom, text isn't clipped or overlapping | AC-MF-15 | Semi-automatic |
| A45 | When the window narrows, functionality collapses rather than disappears | AC-MF-16 | Human review |
| A46 | New UI declares which level of the centre column it occupies (fill / tab / floating band), and that matches where it actually renders | RG-MF-01 | Semi-automatic |
| A47 | When occupying a region the product gives no seat to (the band beside the centre column, using `conversation.input.overlay` as a panel), the README states "the product has no seat here" and gives the fallback | RG-MF-08 / RG-MF-20 | Semi-automatic |
| A48 | A control registered in `sidebar.footer.action` shares the settings entry's row and vertical centre line, and keeps the icon-button family's sizes (icon 16×16, hit area ≥28×28) | RG-MF-45 | Semi-automatic |
| A49 | An icon button that draws only a glyph carries a readable name; its focus ring is not clipped by the header or footer container | RG-MF-47 | Automatic |
| A50 | A card floating on the band does not change the width of the text (its width is derived from the remainder, not taken from the column) | RG-MF-52 | Semi-automatic |

## B. Recommended (a deviation needs its reason in the README)

| No. | Criterion | Clause | Detection |
| --- | --- | --- | --- |
| B01 | No more than 6 visible controls in one band | FL-RC-05 | Automatic |
| B02 | order follows the recommended banding (1..99 regular, rising by +10) | SL-RC-04 | Automatic |
| B03 | Entries of the same bundle in the same seat keep their order values at least 5 apart | SL-RC-06 | Automatic |
| B04 | One plugin has no more than 3 entries in the same seat | SL-AD-07 | Automatic |
| B05 | At most 1 primary button in one region | CT-RC-10 | Semi-automatic |
| B06 | Adjacent controls in a row sit 8px apart; groups 16px apart | CT-RC-14 | Automatic |
| B07 | No new home-made font-size token | TK-RC-04 | Automatic |
| B08 | Body ≥14, secondary ≥13, minimum 12; no text smaller than 12px | TK-RC-10 | Automatic |
| B09 | Elements at the same level share one font size | TK-RC-12 | Automatic |
| B10 | A 16 icon pairs with 14-size text; a 14 icon pairs with 12-size text | IC-RC-03 | Automatic |
| B11 | No fixed px height clamps a text container | AC-RC-17 | Semi-automatic |
| B12 | The two sides of the centre-column band's open/close (the reserving side and the track) reference the same duration and easing variables | RG-MF-42 | Automatic |
| B13 | Entry and exit durations are symmetrical | MO-RC-03 | Automatic |
| B14 | Transition durations come from 100/150/200/300/350 and never exceed 350ms (an official control's own value is kept as-is) | MO-RC-01 | Automatic |
| B15 | Interactive transitions use `cubic-bezier(0.40, 0, 0.20, 1)` (an official control's own curve is kept as-is) | MO-RC-04 | Automatic |
| B16 | No infinite looping animation (loading excepted) | MO-RC-07 | Automatic |
| B17 | No animation on layout properties such as width/height/top/left/margin | MO-RC-08 | Automatic |
| B18 | A `prefers-reduced-motion: reduce` branch exists, implemented as a media query or a matchMedia listener | MO-RC-09 / MO-RC-10 | Automatic |
| B19 | Interactive animation measures or is assessed at 60FPS | MO-RC-11 | Human review (frame rate can be measured) |
| B20 | No more than 2 animation groups run at once, and no animation on first paint | MO-RC-12 / MO-RC-13 | Semi-automatic |
| B21 | A card or overlay on the band takes its width from `min(273px, remainder − 32px)`, and folds back into the session head below 240px | RG-RC-50 | Semi-automatic |
| B22 | The card surface keeps Card's resting tier (radius 20, `--dsw-alias-bg-layer-2`, `--dsw-elevation-soft`), with no home-made shadow or border | RG-RC-51 | Semi-automatic |

## C. Reviewer notes

- A09 and A10 are the most frequent violations and the easiest to automate: collect the order set of each `list` seat's occupants, and missing values (undeclared, falling to the default 0) and duplicate values can be listed straight away.
- A23, A24, A30, A34, A36 and A40 can be merged into one static scan, recommended as the first gate in a plugin's CI.
- Human-review items cluster in A01–A04, A12, A14, A32, A35 and A45: a script can't give a single answer, so the reviewer confirms each one against the wording of the corresponding document.
- The motion group (B13–B20) is **not an official requirement**: the official client publishes only a few motions (the workspace search box expanding, the left and right rails opening and closing) and no duration or curve values at all. Judge these items by whether they break what the user expects, not as an official compliance gate.
