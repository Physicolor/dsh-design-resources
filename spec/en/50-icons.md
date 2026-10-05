---
source: spec/50-icons.md
source-sha256: c4b1c0e406e1a16c
translated-at: 2026-10-05
---
# 50 Icon spec

- Applies to: authors who use icons in plugin UI, or who need to draw their own SVG.
- Force: includes MF / RC / AD, marked clause by clause.
- Whether the criteria in this document are machine-checkable: mostly (size, viewBox, naming, fill/stroke attributes and inline colour values all scan statically); "is the visual weight consistent" and "is the optical centring right" need a human review, though this document gives a checkable measure for each.

## 1. Facts about the official icon set

[measured] A full count over this machine's DSH official icon assets (the method is reproducible):

| Item | Fact |
| --- | --- |
| Total icons | 75 |
| Implementation | All filled paths: `fill="currentColor"`, and 75/75 carry no `stroke=` attribute at all |
| Size families | 53 at 16×16; 19 at 14×14; 1 at 8×14; 1 at 8.5×10.5; 1 at 20×20 |
| Authored name | `ic_ds_<name>_<style>_<size>`, e.g. `ic_ds_close_outline_16` |
| Component name | `Icon<Name><Style><Size>`, e.g. `IconCloseOutline16` |
| File name | `<name>-<style>-<size>.svg`, e.g. `close-outline-16.svg` |

Note: the `outline` in a name refers to the visual style, not to the SVG implementation — official icons are always implemented as filled paths. So a phrase like "official icons stroke at 1.5" does not apply to DSH assets.

- `IC-MF-01`: When you reuse an official icon, use an official size family (16×16, 14×14, 8×14, 8.5×10.5, 20×20). Never render a 16-family SVG at an off-family size such as 12 or 18; when you need something smaller, move to the 14 family or to an 8×14 / 8.5×10.5 structural icon. Check: the rendered size ∈ the family set above.

<!-- demo: icon-anatomy | Real official icons blown up, with the artboard, safe area, element bounding outline and stroke weight measured out for you. Toggle the annotations on and off, or compare the three size families side by side. -->

## 2. Choosing a size

| Size | Use |
| --- | --- |
| 16×16 | Default: inside buttons ([DSH-CSS] the official button icon container is 16×16), tool rows, list rows |
| 14×14 | Compact rows, Button `.sm` (h28), dense lists |
| 8×14 / 8.5×10.5 | Structural decoration (tree connector lines and the like); carries no interaction |
| 20×20 | The occasional large icon, used for its official purpose |

- `IC-MF-02`: Icons in one row or one toolbar share a single size. Check: the set of rendered icon sizes inside one container has exactly one member.
- `IC-RC-03`: Icon size pairs with the font size of the text beside it: a 16 icon with 14 body text, a 14 icon with 12 text. [Proposed here], from the same root as [HIG]'s "match the weight of an icon to the weight of the text beside it".

## 3. Criteria for icons you draw yourself

- `IC-MF-04`: An icon you draw yourself matches the visual weight of official icons in the same family. The checkable measure: under the same viewBox, compare the ratio "shape fill area / bounding-box area" against a sample of official icons from that family and take the deviation. No authoritative figure exists (DSH publishes no visual-weight threshold); this repository proposes a deviation ≤25%, because it gives a human eye-check a recomputable measure and avoids undecidable wording such as "looks about right".
- `IC-MF-05`: The visual stroke width of an icon you draw yourself. Official material does not tokenise stroke width. Measured sample (counting only icons whose paths are straight segments throughout, n=10): the 16 family has a median visual stroke of 1.301 (6 samples), the 14 family spans 1.181–1.427 (3 samples); the 12 family has just one sample (measured 3.508), with neither the sample count nor the measured value enough to support an inference, so it is not used. On that basis: take 1.25–1.5 for a 16-family custom stroke and 1.1–1.3 for the 14 family. No authoritative figure; a value proposed by this repository, because it lines up with the measured official median. Measurement method: parse parallel line-segment pairs in the path and take the smallest perpendicular gap; curved paths stay out of the count.
- `IC-MF-06`: Never mix icon styles: one container does not show fill-based line icons, multicolour illustration icons and third-party-style icons at the same time. Check: the icon sources inside one container have exactly one primary source. Half machine-checkable (assets can be tagged by source), half human (visual style).
- `IC-MF-07`: Never use emoji as an interface-semantic icon (button, status, list prefix). [Proposed here]
- `IC-MF-08`: An icon uses `currentColor` and embeds no fixed colour value (**interface-semantic icons**; app icons are another layer, see §6). Check (automatic): a `fill="#`, `stroke="#` or named colour inside the SVG is a violation. Why: it matches the theme requirement in 30-tokens.md.

## 4. Optical centring

- `IC-MF-09`: An asymmetric icon (triangle, arrow, play, tick) is optically centred inside its container, not geometrically centred. [HIG]
- The checkable measure: read the offset between the bounding-box centre and the container centre first; a shape whose weight is clearly off-centre may take a compensating shift. No authoritative figure exists (for the compensation amount); this repository proposes: no more than 1px of compensation in the 16 family, and the visual offset on either axis comes out smaller than the geometric one (the compensation makes it more centred, never less).
- `IC-MF-10`: An icon inside a button lines up visually with the text baseline; [DSH-CSS] the official button lays out horizontally with `gap 4px`, so never fake the spacing with an extra margin.

## 5. Naming

- `IC-MF-11`: An icon you draw yourself follows DSH's three-part naming (authored name / component name / file name agree). [measured]
- [OH]'s six-part naming `ic_<module>_<function>_<position>_<colour>_<state>_<number>` is isomorphic to DSH naming; the mapping is:

| OpenHarmony field | DSH equivalent |
| --- | --- |
| module | the prefix of name (e.g. close, panel-left) |
| function | the body of name |
| position | carried by where the component is used; does not enter the icon name |
| colour | carried by `currentColor` and tokens; does not enter the icon name |
| state | the style field (outline / fill) |
| number | the size field (16 / 14 / 8 and so on) |

- `IC-MF-12`: An icon you draw yourself embeds no colour and no size (that is, no hard-coded width/height — the component passes them in), otherwise it cannot adapt to the 14 / 16 families or to theme switching.

## 6. App icons (the layer in the plugin list)

The first five sections are about **interface-semantic icons**: monochrome, going through `currentColor`, sized from the 16 / 14 families. The product also has another layer of icon — the coloured icon at the left of each row in the plugin list. It is the plugin's **identity mark**, and its rules are completely different.

<!-- demo: app-icon-board | Real plugin icons plus measured row geometry: container 50 × 50 with radius 16, artwork 36 × 36 (7px on every side). The three measuring boards below compute "file canvas / ink bounding box / circumscribed circle" live from the icon file's real paths; turn the annotations off with one click to compare against the original image. -->

Collected from `docs/reference/plugin-row.json` (one row on the plugins page, 1570 × 905 viewport):

| Part | Measured |
| --- | --- |
| Row card | 976 × 66 · radius 20 (`padding 8px` / `gap 14px` sit on the content container inside the row; the row itself has padding 0) |
| Icon container | **50 × 50 · radius 16** · 1px `rgba(0,0,0,.12)` border · transparent background (the icon brings its own colour) |
| Icon artwork | **36 × 36**, centred in the container → **7px** on every side |
| Icon source | the plugin's own `icon.svg`, rendered by the product inlined as `data:image/svg+xml;base64` (not a glyph from the icon set) |
| Title | **14 / 20 · 500** |
| Description | **13 / 18 · 400** |

- `IC-MF-13`: An app icon is drawn in a **50 × 50, radius 16** container, with the artwork centred at **36 × 36**; never let the shape fill the container.
- `IC-MF-14`: **An app icon is multicolour, and meant to be** — it is an identity mark, not interface semantics. `IC-MF-08` (an icon goes through `currentColor`) constrains interface-semantic icons only; make app icons monochrome too and shape is the only difference left between plugins, so nothing in the list tells you at a glance which is which.
- `IC-MF-15`: Every app icon in one list shares the same container size and radius, while the artwork's visual weight may differ — one shared container is what keeps the icons from reading as two different sets.
- `IC-RC-18`: Give an app icon **two versions, light and dark**, rather than letting one file guess the background. Measured evidence: the product's own front-end icons do exactly this — two files, `favicon.svg` and `favicon-dark.svg`, chosen with `media="(prefers-color-scheme: dark)"` (see `dsh-web-frontend/dist/index.html` inside the local `app.asar`). The dark version is not the light one inverted: in the local `dsh-widgets` pair, the bottom-right square is `#5B9BF5` in the light version and `#7CB7FF` in the dark one, and the base plate changes from `#FFFFFF` to `#0B0C0E`.

**Whitespace does not mean the space is underused.** [measured] The 7px from container to artwork is the product's own (50 − 36 = 14, 7 on each side); the further ring from artwork to the shape's outer edge is the icon file's own inset — in the demo, two 36 × 36 plugin icons have ink of only around 20 × 20 (measured live in the browser from the real paths). Stack the two bands of whitespace and the shape sits about 15px from the container edge.

DSH does not write down why the product leaves that much room; what can be cited is the same principle stated in Apple's App icons guidance: keep content centred, to "avoid truncation when the system adjusts corners or applies masking" [^1]; keep the background simple, "you don't need to fill the entire icon canvas with content" [^1]. **This clause records it as the "same root" only; it does not claim DSH was deliberately modelled on it** — the repository holds geometric evidence alone: push the shape out to the edge and the corner crop bites a corner off the content, and that holds on any platform.

Compare the division of labour between the two layers (which DSH itself does not spell out, and which this section fills in):

| | Interface-semantic icon | App icon |
| --- | --- | --- |
| Colour | must be `currentColor`, following the theme | Multicolour, the plugin's own brand colours |
| Size | the 16 / 14 families, chosen from the text beside it | fixed 36 × 36, mounted in a 50 × 50 container |
| Shape | you draw the shape yourself, optically centred | the container supplies radius 16; the shape never touches the edge |
| Source | `data/icons.json` (the product icon set) | each plugin's own `icon.svg` |
| Used in | buttons, the start of a row, status, navigation | the plugin list, plugin details, the plugin market |

## 7. Glyphs inlined in the product (the ones not in the icon set)

The official icon set is 75 **files** (§1), but the product interface also holds a batch of glyphs inlined straight into components: left sidebar navigation, top bar tools, that row in the composer. They have no file of their own and no authored name, so a plugin author can only read them off the interface. The element inventory identifies them by "viewBox + first path fingerprint", and there are **59** of them (the same glyph appearing in several places counts once).

| Glyph | Path fingerprint (opening) | Rendered size | Used in |
| --- | --- | --- | --- |
| Search | `M6.58727 11.8586…` | 14 × 14 | Left sidebar search |
| New session | `M2.37091 11.2501…` | 14 × 14 | Left sidebar new-session button |
| Plugins | `M7.84457 5.06199…` | 16 × 16 | Left sidebar panel navigation |
| Automation tasks | `M8 14C11.3137 14…` | 16 × 16 | Left sidebar panel navigation |
| Usage centre | `M12.0997 8.54554…` | 16 × 16 | Left sidebar bottom entry |
| Settings | `M8 9.75012C8.9665…` | 16 × 16 | Left sidebar bottom settings |
| Add workspace | `M5.54492 2.06738…` | 16 × 16 | Left sidebar workspace title row |
| Agent team | `M6 8.25C7.51878…` | 14 × 14 | Conversation header chip |
| Collapse corner | `M4 6L7.29289 9.29289…` | 10 × 10 | chip and menu |
| More (ellipsis) | `M3 9C3.55228 9 4 8.55228…` | 15 × 15 | Conversation header tools |
| Plus | `M8 2V14` | 14 × 14 | Composer "Add" |
| External-link arrow | `M14.4782 4.84067…` | 12 × 16 | Settings page |

- `IC-MF-16`: **Do not copy the inline glyphs.** They have no authored name, no multi-size families, and no unified inset or stroke the way the icon set has; when you want a glyph such as "search" or "settings", find the same meaning among the 75 files in §1, or draw your own per §3 / §4.
- `IC-MF-17`: The handful of inline glyphs at 10 × 10 / 15 × 15 / 12 × 16 (collapse corner, ellipsis, arrow) are the exception to `IC-MF-01` — **they are glyphs that scale with the font size, not standalone icons**; an icon a plugin draws itself still takes its size from the five families 16 / 14 / 8×14 / 8.5×10.5 / 20.

## 8. Sources

The `[n]` markers in the body point here. Quotations serve only to settle places DSH itself has not spelled out; wherever DSH already states something, DSH governs.

- [1] Apple Inc. *App icons*, Human Interface Guidelines. <https://developer.apple.com/cn/design/human-interface-guidelines/app-icons> (fetched 2026-10-02 from the same site's data endpoint `…/tutorials/data/design/human-interface-guidelines/app-icons.json`). The two source sentences quoted in §6: *"Keep primary content centered to avoid truncation when the system adjusts corners or applies masking."* and *"Prefer a simple background … you don't need to fill the entire icon canvas with content."*
