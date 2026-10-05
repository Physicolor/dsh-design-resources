---
source: spec/60-accessibility.md
source-sha256: 4eed0fe71b430e38
translated-at: 2026-10-05
---
# 60 Accessibility

- Applies to: every plugin UI that contains interaction.
- Force: mostly MF, with a few clauses at RC. (No AD clauses.)
- Whether the criteria in this document can be detected automatically: partly. Hit areas, contrast, aria attributes and the presence of a focus style can be detected automatically or semi-automatically; greyscale distinguishability and keyboard-path completeness need human checking.

## 1. Sources and baselines

<!-- demo: a11y-board | Accessibility measurement board: contrast is computed live from the resolved colour values with the WCAG relative-luminance formula, hit areas are measured live off the rendered box model, the focus ring is walked live with Tab, and greyscale really strips the colour out — this page's criteria already say "machine-checkable", so compute them on the spot. -->

[HIG] is the only source that publishes an official size table: on macOS a control's hit area is 28×28pt by default and 20×20pt at minimum (the only official size table HIG has). DSH's official CSS publishes no hit-area rule, but its Button is h36 by default and `.sm` is h28, which matches that table (`.sm` is exactly 28). This spec therefore takes 28 / 20 as the hit-area criteria.

The contrast thresholds likewise come from the WCAG that [HIG] cites: 4.5:1 for text at 17pt and below; 3:1 at 18pt or bold.

## 2. Hit areas

| Item | Value | Source |
| --- | --- | --- |
| Hit area, regular control | 28×28 | [HIG] default |
| Minimum hit area | 20×20 | [HIG] minimum |
| Official Button | 36 tall | [DSH-CSS] |
| Official Button `.sm` | 28 tall | [DSH-CSS] |

- `AC-MF-01`: keep the hit area of any interactive element (including padding or an extended hot zone) at 20×20 or larger; regular controls target 28×28.
- `AC-MF-02`: hit area and visual size can differ. A clickable 11px Tag expands its hot zone to ≥20×20; a pure marker Tag never binds a click (consistent with `CT-MF-04`).
- `AC-MF-03`: adjacent hit areas never overlap. Test: the centre-to-centre distance between two neighbouring interactive elements is ≥ the sum of their two hit radii.
- `AC-MF-04`: a container row that holds icon buttons stays ≥28 tall. A 16×16 visual icon plus a 28 hit area is the common combination; test: a tool row container whose computed height is <28 is a violation (machine-checkable).

## 3. Contrast and colour

- `AC-MF-05`: text at 17pt or below carries a contrast of ≥4.5:1; text at 18pt or above, or bold text, ≥3:1. [HIG] (citing WCAG)
- `AC-MF-06`: non-text UI elements (icons, boundaries, switch tracks) target a contrast of ≥3:1. This comes from WCAG's non-text contrast requirement, not from anything [HIG] states explicitly; this repository recommends adopting it. [Proposed here]
- `AC-MF-07`: colour is never the only carrier of information. [HIG] A state also carries a difference in text, icon or shape. Test: turn the interface greyscale and the difference between any two states is still recognisable (screenshot detection plus human confirmation).
- `AC-MF-08`: the Increase Contrast variant requirement is in [HIG] (a custom colour needs three sets: light + dark + Increase Contrast). In DSH the way to carry it out is to use semantic tokens only, so the increased contrast falls to the host theme; never bypass the tokens (consistent with 30-tokens.md).

[measured] Ran the numbers on the product's own semantic colours (the formula is computed live in the demo, not looked up in a table): in the light theme on white, `--dsw-alias-label-primary` is about 18.9:1 and `label-secondary` about 5.8:1, both passing; **`label-tertiary` is about 3.7:1, below 4.5:1**, and 13px explanatory text and 10px status labels use exactly that one. This is the product's existing implementation, so it is handled per 00-overview §4.1 "official first": **record it as a known deviation, don't override the official control**. The actionable conclusion for plugin authors: prefer `label-primary` / `label-secondary` for body and explanatory text; when you do use `label-tertiary`, don't put key information there alone.

## 4. Focus and keyboard

- `AC-MF-09`: every interactive element is reachable by Tab and can be triggered with Enter or Space; the Tab order matches the visual order (WCAG 2.4.3).
- `AC-MF-10`: focus is always visible. Never remove the focus style with `outline: none` without providing a replacement. Test (automatic): `outline: none` / `outline: 0` on a selector with no alternative focus style is a violation.
- `AC-MF-11`: focus-ring spec. DSH publishes no focus-ring values, so there is no authoritative value; this repository proposes 2px solid, colour `--dsw-alias-brand-primary`, 2px outer offset, corner radius following the control (r18 / r14). Why: 2px stays legible in both the dark and the light theme, and it doesn't change the control's geometry.
- `AC-MF-12`: a container's `overflow: hidden` never clips the focus ring. If it does clip, switch to an inset focus style. Test: tab to a control on a region boundary and the focus ring stays fully visible (semi-automatic).
- `AC-MF-13`: nothing is mouse-only. Don't offer a context menu or dragging as the only way to interact; provide a keyboard equivalent. [Proposed here]

## 5. Semantics and zoom

- `AC-MF-14`: an icon-only button carries an accessible name (`aria-label` or visible text); a purely decorative icon is `aria-hidden`.
- `AC-MF-15`: font sizes respond to system or browser zoom. [OH] Test: at 200% browser zoom, text is not truncated, doesn't overlap and isn't clipped by its container.
- `AC-MF-16`: function doesn't change with space, only how much of it stays visible. [HIG] When the window narrows, tuck entries away or fold them (into a menu, into an overlay); never delete an entry point — this is a structural requirement, unrelated to `FL-RC-05` and `MO-*`.
- `AC-RC-17`: never pin a text container shut with a fixed px height; the container height accommodates the line height after zoom. [Proposed here]

## 6. Detectability reference

| Clause | How it is detected | Degree of automation |
| --- | --- | --- |
| `AC-MF-01` `AC-MF-03` `AC-MF-04` | Measure the element box model after render | Automatic |
| `AC-MF-05` `AC-MF-06` | Compute foreground/background colours and contrast | Automatic (needs the token's real value resolved correctly) |
| `AC-MF-07` | Greyscale screenshot comparison | Semi-automatic |
| `AC-MF-09` `AC-MF-13` | Keyboard traversal script | Semi-automatic |
| `AC-MF-10` `AC-MF-12` | Style scan + human confirmation | Semi-automatic |
| `AC-MF-14` `AC-MF-15` | Attribute scan / zoomed rendering | Automatic and semi-automatic |
| `AC-MF-16` | Narrow-width screenshot checked for a disappearing entry point | Human |
