---
source: spec/20-controls.md
source-sha256: 83c6daefec264534
translated-at: 2026-10-07
---
# 20 Controls spec

- Applies to: plugin authors rendering interactive controls anywhere in the main page.
- Force: includes MF / RC / AD, marked clause by clause.
- Whether the criteria in this document can be detected automatically: partly. Size, corner radius, font size and hit area can be reconciled against rendered computed styles (automatic); whether a variant choice is apt and whether the hierarchy is clear need human review.

## 1. Official control geometry

[DSH-CSS] The values below are read from the official uncompressed CSS source; the official comment notes the geometry came from a Figma component (instance 1:155).

| Control | Size and geometry |
| --- | --- |
| Button (default) | 36px high, padding 0 14px, gap 4px, border-radius `--dsw-radius-md` (12px), font size 14px / line height 22px |
| Button `.sm` | 28px high, padding 0 10px, border-radius `--dsw-radius-sm` (8px), font size 12px / line height 18px |
| Icon container inside a Button | 16×16 |
| Switch | 36×20 |
| Tag | 11px capsule |
| Pill | Used on a 24px text line |
| DisclosureRow | 24px compact disclosure row |
| FileTypeIcon | 28px file / folder icon |

- `CT-MF-01`: Reuse the official geometry when you implement the controls above; set no height, corner radius, padding or font size of your own. Detection: Button's computed height is only ever 36 or 28; the corner radius is only ever 12 or 8 (`--dsw-radius-md` / `--dsw-radius-sm`); Switch is only ever 36×20.

  [Known deviation] This section used to record the corner radius as "only ever 18 or 14", taken from the **out-of-date primitives copy** in `%DSH_HOME%/profiles`. The `Button.module.css` inside the `app.asar` the product actually loads says `border-radius: var(--dsw-radius-md)` (12px) and uses `var(--dsw-radius-sm)` (8px) for `.sm`, matching the six steps in the official `docs/ui-radius.md` (4/8/12/16/20/28). Take the step value when you write new UI; when you reuse an official control, leave its geometry alone.
- `CT-MF-02`: The icon container inside a Button is fixed at 16×16; an icon never changes the button height (a bigger icon does not raise the line height).
- `CT-MF-03`: FileTypeIcon stays at 28px — never scale it below the list row height. When the row height falls short, change the row height instead of shrinking the icon.

<!-- demo: controls-geometry | Official control measuring board: every cell's size, corner radius and font size is measured live in the browser and marked ✗ on the spot when it does not match; the second group is the five states (hover / focus-visible are real pseudo-classes — move the pointer over or press Tab for the real effect), the third group is the three counter-examples for CT-MF-11 / CT-MF-12. -->

## 2. Choosing a variant

| Need | Control to pick | Criterion |
| --- | --- | --- |
| Trigger an action, submit | Button default (h36) | The action is one step of the main flow |
| An action inside a compact row | Button `.sm` (h28) | The row height leaves no room for 36px |
| More than 3 actions in one row | Collapse them into a menu | Per [HIG] features do not change with space, only how many stay visible |
| Show the current selection / filter state | Pill | Expresses state on a 24px text line |
| Mark only, carry no action | Tag (11px) | No click behaviour |
| Boolean switch, takes effect immediately | Switch (36×20) | Takes effect the moment it changes; no submit semantics |
| Takes effect after confirmation | Button | Carries submit / cancel semantics |
| Collapse or expand a compact block | DisclosureRow (24px) | The content is secondary information |
| File / folder identity | FileTypeIcon (28px) | Expresses the type of the object |

- `CT-MF-04`: Never bind a click action to a Tag. A Tag is a mark, not a button; when a mark has to be clickable, use a Pill or a Button `.sm`. Why: a Tag's 11px visual size cannot meet the 20×20 minimum hit area unless you extend the hot zone explicitly (see 60-accessibility.md).
- `CT-MF-05`: Do not mix Button and Button `.sm` in one row to express actions at the same level; express a hierarchy difference with a primary and a secondary button (filled / outlined), not by mixing sizes. [Proposed here]
- `CT-MF-06`: Do not put a submit action on a Pill or a Tag, and do not use a Button for a pure state display.

## 3. States

- `CT-MF-07`: Every interactive control must define five states: default, hover, active, focus-visible, disabled. A missing state counts as a defect.
- `CT-MF-08`: State colours come from tokens only: hover → `--dsw-alias-interactive-bg-hover`; primary button fill `--dsw-alias-button-primary-fill`, with `--dsw-alias-label-primary-foreground` for the text on it; error `--dsw-alias-state-error-primary`; success `--dsw-alias-state-success-primary`; warning `--dsw-alias-state-warn-primary`; brand `--dsw-alias-brand-primary`.
- `CT-MF-09`: A disabled state must not merely drop overall opacity until it is unreadable; use `--dsw-alias-label-tertiary` for the text and keep it legible. [Proposed here]
- `CT-RC-10`: At most 1 primary button inside one region (header, footer or dock). Why: `--dsw-alias-button-primary-fill` expresses a single primary action; several primary buttons break the visual hierarchy. [Proposed here]

## 4. What not to do

- `CT-MF-11`: Do not build home-made substitutes for controls the product already ships: a custom checkbox, a custom switch, a fake dropdown, a `div` + onClick posing as a button.
- Automatic detection: a `role="button"` in the DOM with no keyboard event handling; or a self-drawn imitation control at height 36 / 28 / 20 whose styles do not come from an official class; or a self-drawn switch (a sliding switch whose width-to-height ratio is not 36:20).
- `CT-MF-12`: Do not use CSS to override an official control class's height, corner radius or font size. Detection: a plugin stylesheet overrides a geometry property on an official control class.
- `CT-MF-13`: A control in the tool row must match the height of the other controls in that row; icon buttons inside `conversation.input.left` / `.right` / `.plan` / `.model` / `.activity` use a 16×16 icon container, and containers inside the row are ≥28 (hit-area requirement, see 60-accessibility.md).

## 5. Spacing

- `CT-RC-14`: Take 8px as the horizontal spacing between adjacent controls in one row, 16px between groups. No authoritative figure exists: the official DSH CSS publishes only the padding and gap inside a control (Button's `gap 4px`, for instance), not a token for the space between controls. This repository proposes 8 / 16, because 8 matches [OH]'s 4/8 multiples and the 8vp baseline grid and 16 is the lower bound that passes [OH]'s own checklist item "spacing below 16vp counts as cramped".
- `CT-MF-15`: Vertical spacing under 16px between adjacent independent controls counts as cramped. [OH]
- `CT-MF-16`: All controls at the same level inside one region share the same spacing; hand-writing a different margin on each one counts as a defect (automatic detection: the set of spacing values among controls at the same level is not unique). [Proposed here]

## 6. Shortcut keycaps (ShortcutKeys)

The product ships this control: the `Ctrl Alt N` at the end of the new-session button row, the shortcut at the end of a menu item row, the keys inside a tooltip. The geometry comes from the client CSS module `_keys_38b9q_1` (the same batch as `_dot_1i3xo_2` and `_spinner_1i3xo_37`), in three forms:

| Form | Geometry | Where it is used |
| --- | --- | --- |
| Flat (default) | `.keys`: `display:inline-flex` · `align-items:center` · `gap:3px` · `font-size:12px` · `line-height:16px` · `white-space:nowrap` · colour `--dsw-alias-label-tertiary`; each `.key` only centres and sets `font:inherit` (**no background, no corner radius, no padding**); `+` is a `.separator` | End of the new-session button row in the left sidebar (captured: 19 × 16, 12/16, rgb(129,133,140), bg transparent, radius 0) |
| Tooltip bubble | `.tooltip`: `font-size:11px` · `line-height:14px` · `gap:2px`; `.tooltip .key`: `min-width:16px` · `height:16px` · `padding:0 2px` · `border-radius:4px` · background `--dsw-alias-tooltip-key-bg` (resolves to `color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)`; in the light theme that is #2c2c2e mixed with 18% white) | Keys inside a tooltip |
| Joined | `.joined`: `height:16px` · `padding:0 4px` · `border-radius:4px` · background `--dsw-alias-tooltip-key-bg`, with the inner `.key` dropping its own background | When a group of keys has to be drawn as one unit |

- `CT-MF-17`: The keycap has exactly these three forms; do not invent a fourth. A background or a corner radius on the flat form is **forbidden** — that is what the tooltip form looks like. Detection: scan flat keycaps for `background` / `border-radius`.
- `CT-MF-18`: The shortcut hint at the end of a button row stays invisible by default. The product writes `newSessionShortcut { opacity: 0; pointer-events: none }` and only reaches `opacity: 1` on `newSession:is(:hover, :focus-visible)`; at the same moment it adds `mask-image: linear-gradient(90deg, #000 calc(100% - 16px), #0000)` to the button text, letting text that gets crowded fade out instead of being cut off hard. Detection: a shortcut hint that stays visible counts as a violation.
- `CT-MF-19`: Keycaps are decoration to assistive technology (the product wraps them in an `aria-hidden="true"` container); when the key combination itself has to be read out by a screen reader, write it on the button's `aria-keyshortcuts` — the product does this in two places: search conversations `Control+Alt+K`, add workspace `Control+Alt+O`.

## 7. Conversation header chips, select-style menu cells and menu overlays

These three have never had a place in the spec, yet the product uses them every day (captured: `docs/reference/top-strip.json` and the product-side entries in the element inventory).

### 7.1 The conversation header chip

| Part | Measured value |
| --- | --- |
| Container | **28** high (measured `智能体团队` 93 × 28 @ [532, 11]) |
| Icon | **14 × 14**, colour `--dsw-alias-label-secondary` |
| Label | **12 / 16**, colour `--dsw-alias-label-tertiary` (measured 60 × 16 @ [572, 17]) |
| Collapse corner | 10 × 10, colour `--dsw-alias-label-tertiary` |
| Panel once expanded | a `dialog`, 320 × 141 · corner radius **12** · padding `8px 2px 0 2px` |
| Member row inside the panel | 288 × 52 · corner radius **8** · padding `10px 12px` · gap 8 · icon 14 × 14 |

- `CT-MF-20`: The conversation header chip's label is **12/16 in the tertiary colour**, and the container is 28 high. Detection: a chip label written at 13/20 or 14/22 counts as a violation (this repository's own reproduction once had it at 13/20 and was corrected to the captured value).
- Known product oversight (not a design decision): in the panel, the member row's name **takes no font-size token at all** and renders at Chromium's UA default for a button, `13.3333px`. Every other string in that panel is 12/16 or 13/20; this one alone is a browser default. A plugin author copying this spot copies the oversight with it, so the spec takes 13/20.

### 7.2 Select-style menu cells

Menu items such as the product's "model / reasoning level" are not a row of buttons but one cell: label on the left, current value on the right, collapse corner at the end (`wq12jW_cell*`, measured on the model menu).

| Part | Measured value |
| --- | --- |
| Left label | **13 / 20** · `--dsw-alias-label-primary` (measured 26 × 20 @ [1010, 731]) |
| Current value | **13 / 20** · `--dsw-alias-label-tertiary` (measured 174 × 20, on the same baseline as the label) |
| Collapse corner | **12 × 12** (measured @ [1222, 735]) |
| The menu item itself | **34** high · corner radius **12** · padding `0 8px` (a select-style `cell`, measured 240 × 34; a plain `item` is 136 × 34 with padding `6px 8px`) · gap 6 · 13/20 |
| Compact panel | **320 × 141** · corner radius 12 · padding `8px 2px 0 2px` (the one the conversation header chip expands into) |
| Empty hint | **284 × 16** · 12px size, centred |
| Corner badge `badge` | **14 × 10** (the `EXP` in the permission menu, for instance) |
| Selection tick | **14 × 14** (on the right of the menu item; appears only in the selected state) |

- `CT-MF-21`: A select-style menu item is three parts — label + current value + collapse corner — with the current value in the tertiary colour; do not turn the current value into a button and do not leave it out: the user opened the menu to see which one is selected now.

### 7.3 Menu overlays

| Part | Measured value |
| --- | --- |
| Corner radius | **16** (`--dsw-radius-lg`; the compact form is 12 = `--dsw-radius-md`) |
| Background | `rgba(248, 249, 250, 0.58)` (the material layer) |
| Backdrop blur | `--dsw-menu-backdrop-filter` = `blur(40px) saturate(150%)` |
| Height | Content-driven; the model menu measures 248 × 76 |

- `CT-MF-22`: A menu is an **overlay**: corner radius 16 (12 when compact), background from the material layer plus a backdrop blur. Do not draw a menu as an opaque white card, and do not give it a home-made shadow of its own — the elevation recipe is in the surface section of `components/patterns/SettingsPage/SPEC.md`.

### 7.4 Composer triggers (permission / model / open with)

The "click to pick one" controls in the input card's tool row measure as follows (`composer-geometry.json`, `top-strip.json`):

| Control | Measured | Geometry |
| --- | --- | --- |
| Permission capsule | **100 × 28** @ [580, 523] ("full permission") | corner radius **8** · padding `0 4px 0 8px` · gap 4 · label **13/20 · 500** (one weight step heavier than the other triggers: it is the permission for this send, something worth reading clearly) |
| Model selector | **180 × 28** @ [1066, 523] | Same geometry; label 13/20, with the effort level (High) beside the model name in the tertiary colour |
| Collapse corner | **14 × 14** | Tertiary colour |
| Open-with segmented button | **43 × 24** @ [1407, 13] (top bar) | corner radius **8** · a 1px centre seam separates "run" from "more open options"; the two halves measure **23 × 22** and **18 × 22** |
| Icon button (close / collapse / more) | **28 × 28** | corner radius **8** · icon 16 × 16 |

- `CT-MF-23`: Triggers in one row share the same height (28), the same corner radius (8) and 12 spacing; only the permission capsule's label goes one weight step heavier, the rest staying at the regular weight. Detection: a tool row where trigger heights or corner radii are not unique is a violation.
