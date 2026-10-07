---
source: spec/30-tokens.md
source-sha256: 683715135f7acda7
translated-at: 2026-10-07
---
# 30 Colour and type

- Applies to: any plugin UI that brings its own styles.
- Force: carries MF / RC / AD, labelled clause by clause.
- Whether this document's criteria are machine-checkable: yes (the main criteria can all be scanned statically from source or from a build artefact).

## 1. Semantic tokens only

Colours, font sizes and corner radii all go through `--dsw-*` semantic tokens. A semantic token is worth having because it does three things at once: a theme switch needs no code change, elevation is expressed the same way throughout, and a single regex settles the review.

- `TK-MF-01`: Don't hard-code colours. Check (machine-checkable): a hex colour starting with `#`, `rgb(` / `rgba(` / `hsl(` / `hsla(`, or a CSS named colour (white, black, red, grey and so on) appears in the source or in a build artefact.
- Exceptions (not counted as violations): image and illustration assets, `transparent`, `currentColor`, `none`, and `fill="currentColor"` inside an SVG asset.
- `TK-MF-02`: Take font sizes from the `--dsw-font-*` tokens (the verified shapes are `--dsw-font-s-14`, `--dsw-font-xs-13`, `--dsw-font-xxs-12`); don't write a literal px font size. Check: a `font-size: <number>px` appears in a style declaration.
- `TK-MF-03`: Corner radius has only the official scale: 18 (default button), 14 (small button), plus whatever radius an official container carries itself. Don't invent intermediate values such as r8 / r10 / r12 and mix them in. [DSH-CSS]
- `TK-RC-04`: For a font size with no matching token (the official Tag's 11px, say), reuse the official component rather than adding a home-made token such as `--dsw-font-xxs-11`. [DSH-CSS]: 11px appears in the official Tag geometry but isn't in the verified font-size token list.

## 2. Semantic mapping

| Purpose | Token |
| --- | --- |
| Body text / primary label | `--dsw-alias-label-primary` |
| Secondary label | `--dsw-alias-label-secondary` |
| Third-level note, helper text | `--dsw-alias-label-tertiary` |
| Page base | `--dsw-alias-bg-base` |
| Layer-1 container | `--dsw-alias-bg-layer-1` |
| Layer-2 container | `--dsw-alias-bg-layer-2` |
| Overlay | `--dsw-alias-bg-overlay` |
| Weak border / divider | `--dsw-alias-border-l1` |
| Strong border | `--dsw-alias-border-l2` |
| Hover background | `--dsw-alias-interactive-bg-hover` |
| Error | `--dsw-alias-state-error-primary` |
| Success | `--dsw-alias-state-success-primary` |
| Warning | `--dsw-alias-state-warn-primary` |
| Brand | `--dsw-alias-brand-primary` |
| Primary button fill | `--dsw-alias-button-primary-fill` |
| Primary button text | `--dsw-alias-label-primary-foreground` |

- `TK-MF-05`: Express elevation with background layers (`bg-base` < `bg-layer-1` < `bg-layer-2` < `bg-overlay`), not with `box-shadow`. Why: the means DSH has published for elevation are background layers and borders (`border-l1` / `border-l2`); DSH publishes no shadow scale table, so a shadow elevation has no authoritative value and can't serve as an elevation criterion.
- `TK-MF-06`: Don't express the same elevation twice, once with a background layer and once with a shadow (one elevation, one means only). [Proposed here]

## 3. Theme

- `TK-MF-07`: Don't assume a light theme. Any style that leans on a hard-coded light background or hard-coded dark text is a violation (the same detection as `TK-MF-01`).
- `TK-MF-08`: A custom colour needs three variants: light, dark and Increase Contrast. [HIG] How it's carried out in DSH: pick a semantic token that holds up in every theme rather than inventing a colour value; when a new colour is genuinely needed, go through the official DSH token proposal instead of inlining a colour value in the plugin.
- `TK-MF-09`: The contrast threshold between text and background is in 60-accessibility.md; a token swap isn't an automatic pass — check it.

## 4. The type scale

<!-- demo: token-scale | Token gauge: six corner-radius steps, four elevation levels and eight font-size steps, plus the same batch of semantic colours resolved twice, once in light and once in dark. Every reading is a live browser measurement — radius read from the computed value, elevation from box-shadow, font size from font-size/line-height, colour value from backgroundColor. -->

| DSH token | Pixels | Typical use | Nearest corresponding [HIG] step |
| --- | --- | --- | --- |
| `--dsw-font-s-14` | 14 / line height 22 | body text, buttons | between Title3 15/20 and Body 13/16 |
| `--dsw-font-xs-13` | 13 | secondary notes | close to Body 13/16, Headline 13/16 |
| `--dsw-font-xxs-12` | 12 | smallest helper text | close to Callout 12/15 |

The 11-step HIG scale belongs to the macOS system and the DSH tokens belong to the plugin system; the two aren't the same scale, so the table above is an approximate correspondence only, and no one should read it as a claim that DSH implements the HIG scale.

- `TK-RC-10`: Body text 14 (`--dsw-font-s-14`), helper notes 13, 12 at the smallest. Body text doesn't go below 12px. No authoritative value (DSH publishes no minimum font-size rule); this repository recommends 12, because: [HIG] puts the minimum body size at 13pt; the smallest token DSH already has is 12; below 12 no token is left and contrast is hard to hold.
- `TK-MF-11`: Use font size and line height as a pair. Every HIG step is given as a font-size/line-height pair; changing the font size alone and leaving the line height mismatched counts as a defect.
- `TK-RC-12`: Within one interface, elements at the same level keep one font size; a narrower container changes the layout, not the font size. [Proposed here], consistent with the [HIG] line that function doesn't change with space, only how much is visible.

### 4.1 Font sizes measured in the interface

The element inventory records the font size of every run of text in the interface; the results fall into two piles:

| Pile | Type size | Source |
| --- | --- | --- |
| Official steps | 26/32 · 18/26 · 16/24 · 14/22 · 13/20 · 12/18 · 11/17 · 10/15 | the `--dsw-font-*` scale (`26/32` in the hero title, `18/26` in the settings page header, `10/15` in the plugin row status label) |
| Non-official steps | `13.3333px` (Chromium's default font size for a button) · `12.65px` · `9px` | all of them appear in **plugin-drawn** text (some sections on the settings page, the small stat text in `shell.overlay`) |

- `TK-RC-13`: **Don't introduce a type size off the scale.** Not one entry in the second pile is a design decision: `13.3333px` is the default the browser gives `<button>` (that text never sets a font size at all), while `12.65px` and `9px` are values a plugin threw in casually. Check: scan computed font sizes; a size that, paired with its line height, isn't in {26, 18, 16, 14, 13, 12, 11, 10} is a violation.

## 5. What this document doesn't claim

- DSH publishes no complete token list, so this document lists only the verified semantic tokens. Before citing a new token you must confirm it exists in the `:root` computed style of the current profile (machine-checkable).
- DSH publishes no shadow scale table; this spec therefore asserts nothing about shadow values, and on that basis rules out shadows for expressing elevation.
