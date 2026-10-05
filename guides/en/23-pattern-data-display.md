---
source: guides/23-pattern-data-display.md
source-sha256: 8efd5114aaa12038
translated-at: 2026-10-05
---
# Data display

> Pick the right display form for a metric, a read-only field, a discrete state or a supplementary detail, based on how precise the reading has to be, what is being compared and where it sits in the information hierarchy.

There is no separate official "data display" component family, so this page supplies the form choices, the numbers behind them and the checks to run. Official practice and what this repository proposes are stated separately; where two implementations contradict each other the row is marked `[Known deviation]`; a value that has not been verified is labelled "no evidence".

## When it applies

- How much of a metric is used up: context window, cache hits, disk usage, task progress.
- The read-only fields of one object: model parameters, request headers, file information, environment variables.
- A column of discrete states: success / warning / failure / in progress / idle for a task, a conversation or a tool call.
- A block of supplementary detail that starts collapsed: per-file detail, raw parameters, advanced options.

## When not to use it, and what to use instead

| Your data | Do not use | Why | Use instead |
| --- | --- | --- | --- |
| You need to read an exact number | A bar that only shows a proportion | The percentage beside the bar is rounded | A key-value list, with the exact value written in the text |
| Several sets of data compared by length | A bar with a single track | There is no shared baseline, so lengths cannot be compared | A bar chart on a shared baseline |
| The user drags to change the value | A bar or a dot | Both are read-only displays and cannot take focus | A slider / an input control |
| On and off | A bar | Length expresses degree; a switch has only two states | Switch or a state dot |
| "Half done" | A state dot | A dot has only a few discrete steps | A mini bar |
| Only one or two rows, and the number itself is the point | A key-value list | Too broad a meaning, and the number does not stand out | A metric row with a value and a sublabel |
| The user needs to edit these fields | A key-value list | It is read-only and only conveys structure | An input control |
| The value is itself a list, a tree or a code block | A key-value list | Row spacing flattens block-level content | A custom card or a code block |
| The user has to see it every time | A disclosure row | It hides something unavoidable behind a drawer | Write it straight out as a heading plus body |
| Clicking it is meant to go somewhere else | A disclosure row | Expanding means "see more right here" | A link |
| Only one item of a set may be open | A disclosure row | A disclosure row can have several open at once | Tabs / a segmented control |

Source: "When not to use it" in `components/data-display/{MiniBar,KeyValueList,StateDot,DisclosureRow}/README.md`.

## Interface structure

| Form | Structure | Component id |
| --- | --- | --- |
| Key-value list | `<dl>` as a vertical flex, each row a `<div>` wrapping `<dt>` / `<dd>`; key column `max-content`, value column `1fr` | `key-value-list` |
| Mini bar | The root element is `role="progressbar"`; track `flex: 1` plus a fill (width = the percentage); an optional rounded percentage on the right | `mini-bar` |
| State dot | A marker plus adjacent text; colour and shape change with the state | `state-dot` |
| Disclosure row | A 24px row: a 16×16 icon box on the left (a 14×14 glyph inside) + a 13/24 title + optional collapsed-state extra | `disclosure-row` |

List-like containers use `list-row-group` (a group heading plus rows); a data panel inside the conversation flow uses `panel-seat`.

<!-- component: mini-bar | Mini bar. Four semantic tones, business / success / warn / error, with and without a percentage. -->
<!-- component: key-value-list | Key-value list. Keys are short words and values may wrap; divider and valueAlign, both optional. -->
<!-- component: state-dot | State dot. Five states; only in progress animates, and it stops under reduced motion. -->
<!-- component: disclosure-row | Disclosure row. Collapsed and expanded, with the whole row clickable or only the icon. -->

## Key states

| Form | State | Behaviour |
| --- | --- | --- |
| Key-value list | Long value | Wraps with `overflow-wrap: break-word`, never truncates and never bursts the container |
| Key-value list | Value aligned right | `valueAlign="end"`: `justify-self: end` + `text-align: end` |
| Mini bar | Value update | The fill width transitions with `width 120ms ease`; under reduced motion `transition: none` |
| Mini bar | `max <= 0` or not a finite number | `aria-valuemax` is 0 and progress stays at 0 (degenerate input) |
| Mini bar | Value out of range | Clamped to `[0, max]` before it is used, and `aria-valuenow` takes the clamped value too |
| State dot | `ongoing` | 8 squares of 2×2 run an infinite 1s chase animation, `animation-delay = (index − 8) × 125ms` |
| State dot | Reduced motion | The animation stops and every cell rests at `opacity: 0.6` |
| Disclosure row | Collapsed / expanded | Collapsed, the leading slot is "icon + hover arrow" and renders `collapsedContent`; expanded, only the arrow remains |
| Disclosure row | Hover (collapsed) | Icon `opacity 1→0`, arrow `0→1`, each `100ms ease`; only `opacity` moves |
| Data surface | Loading | Lists use a skeleton; other page-level loading uses a bare centred spinner; one page gets one loading style |
| Data surface | Failure | Keep the loaded data visible; do not clear the content to show the error |

Source: the `states` section of each of the four components' `SPEC.md`; the last two rows come from `.agents/skills/dsh-client-ui-ux/SKILL.md` ([Official source], https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/skills/dsh-client-ui-ux/SKILL.md).

## Keyboard and focus

| Form | Focusable | Keyboard behaviour |
| --- | --- | --- |
| Key-value list | No | Stays out of the Tab order; when a value holds a link or a button, focus lands on that element |
| Mini bar | No | Display only: `tabIndex` / `onClick` / `onKeyDown` must not appear in the source |
| State dot | No | Hard-coded `aria-hidden="true"`, so it stays out of the accessibility tree |
| Disclosure row | Yes (when `expandable` is true) | Whole row clickable: `role="button"` + `tabIndex=0`, Enter and Space trigger it, Space calls `preventDefault()`; icon only: a native `<button type="button">` |

Focus ring spec: 2px solid + `--dsw-alias-brand-primary`, offset 2px outward; when the container carries `overflow: hidden`, switch to the inner offset `-2px` (source: `components/data-display/DisclosureRow/SPEC.md`, following `AC-MF-11` / `AC-MF-12` in `spec/60-accessibility.md`) `[Proposed here]`.

## Light and dark

- Always take colours from `--dsw-*` semantic tokens, never a literal colour value (source: https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md) `[Official source]`.
- Colours across the four components: the key-value list takes `--dsw-alias-label-tertiary` for keys, `--dsw-alias-label-primary` for values and `--dsw-alias-border-l2` for the divider; the mini bar takes `--dsw-alias-border-l1` for the track and one of the four tones `business` / `success` / `warn` / `error` for the fill; the state dot takes success / warn / error / `label-tertiary` for `done` / `warning` / `error` / `idle` and `--dsw-static-deepseek-450` for `ongoing`; the disclosure row takes `label-tertiary` for the leading slot and `label-secondary` for the title (source: the `tokens` section of each of the four components' `SPEC.md`) `[Official source]`.
- The track picks `--dsw-alias-border-l1` (a translucent overlay: `#0000000a` in light, `#ffffff0f` in dark) rather than an opaque surface colour, so it adapts to the surface it sits on; the price is that on the light layer-1 background the track is very faint, so track visibility never carries information (source: `components/data-display/MiniBar/SPEC.md`) `[Proposed here]`.
- Token counts are quoted separately, per `counts` in `data/tokens.json`: palette 77 / lightAliases 115 / darkAliases 119 / scale 207 (source: `data/tokens.json`, collected from the shipped bundle by `scripts/collect-tokens.mjs`) `[Runtime measurement]`. The four scopes differ — `palette` and `scale` on `:root`, light on `body`, dark on `body[data-ds-dark-theme]` — so do not add them up and call it "113 tokens".
- Check every colour pair under both the light and the dark theme before you ship it (source: `.agents/skills/dsh-client-ui-ux/SKILL.md`) `[Official source]`.

## Narrow windows

- The key-value list's value column is `minmax(0, 1fr)`, both columns can shrink, and a long URL wraps instead of overflowing; a narrow width never changes the type size (`TK-RC-12`, source: `spec/30-tokens.md`) `[Proposed here]`.
- The mini bar's track is `flex: 1` and follows the container; fill and track share the same 999px radius, and the track carries `overflow: hidden` so a square fill corner cannot show at very narrow widths (source: `MiniBar/SPEC.md`) `[Proposed here]`.
- The state dot and the disclosure row are fixed-size elements and do not scale with the window; text in a row is ellipsised, and truncated text has to be readable in full on hover (source: `components/patterns/ListRowGroup/SPEC.md`) `[Official source]`.
- When the window narrows, collapse an entry point or fold it away, never delete it (`AC-MF-16`, source: `spec/60-accessibility.md`) `[Borrowed principle]`; never pin a text container with a fixed px height (`AC-RC-17`, same file) `[Proposed here]`.

## Accessibility

| Criterion | Requirement | Clause |
| --- | --- | --- |
| Accessible name | A mini bar needs a `label` or an `aria-label`, or a screen reader is left with nothing but "progress bar" | `AC-MF-14` |
| Progress semantics | `role="progressbar"` + `aria-valuemin` (fixed at 0) + `aria-valuemax` + `aria-valuenow`, none of them optional | Component checks |
| Visible percentage | Carries `aria-hidden="true"` and is never the only source of the number | Component checks |
| Colour is not the only cue | A state dot needs readable text beside it; when `tone` is `warn` / `error` the adjacent text has to say so | `AC-MF-07` |
| Hit area | The icon-only disclosure row has an effective hot area of 20×24, below the regular 28×28 target | `AC-MF-01` |
| Contrast | Tertiary text on a light white background is about 3.7:1, below 4.5:1 (see `[Known deviation]`) | `AC-MF-05` |
| Zoom | At 200% browser zoom text does not truncate or overlap | `AC-MF-15` |

## Implementation resources

| Use | Component id | Path |
| --- | --- | --- |
| Read-only detail for one object | `key-value-list` | [KeyValueList](../../components/data-display/KeyValueList/SPEC.md) |
| A single value as a proportion | `mini-bar` | [MiniBar](../../components/data-display/MiniBar/SPEC.md) |
| Marking a discrete state | `state-dot` | [StateDot](../../components/data-display/StateDot/SPEC.md) |
| Supplementary detail that starts collapsed | `disclosure-row` | [DisclosureRow](../../components/data-display/DisclosureRow/SPEC.md) |
| A grouped row list | `list-row-group` | [ListRowGroup](../../components/patterns/ListRowGroup/SPEC.md) |
| A data panel inside the conversation flow | `panel-seat` | [PanelSeat](../../components/patterns/PanelSeat/SPEC.md) |

## Specs

Units are px, written as "value (source: path or URL)"; each row carries its marker.

| Part | Value | Marker | Source |
| --- | --- | --- | --- |
| Key-value list · key | 13 / 20 | `[Official source]` | `KeyValueList/SPEC.md`, anchored to the official `ReadBlock.module.css` `.count` |
| Key-value list · value | 14 / 22 | `[Official source]` | Same, anchored to `Button.module.css` `.button` |
| Key-value list · column gap / vertical padding inside a row | 12 / 4 | `[Proposed here]` | Same, "proposed values": multiples of 4; the row height comes from the 13/20 and 14/22 line boxes |
| Key-value list · divider | 0.5 + `--dsw-alias-border-l2` | `[Official source]` | Same, anchored to `MarkdownText.module.css` `.markdown hr`; the 0.5px hairline policy is at https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md |
| Mini bar · bar height / gap to the percentage | 8 / 8 | `[Proposed here]` | `MiniBar/SPEC.md` "proposed values": both multiples of 4 |
| Mini bar · corner radius | 999 (capsule) | `[Official source]` | Same, anchored to `Tag.module.css` `.tag`; a capsule has to pair `corner-shape: round` in the same rule (source: https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md) |
| Mini bar · transition / percentage type size | `width 120ms ease` / 12 / 18 | `[Official source]` | Same, anchored to `Switch.module.css` `.thumb` and `Button.module.css` `.sm` |
| Mini bar · track colour | `--dsw-alias-border-l1` | `[Proposed here]` | Same; `#0000000a` in light, `#ffffff0f` in dark |
| State dot · outer diameter / solid core | 10 / `inset: 20%` (the core is 60% of the outer diameter) | `[Official source]` | `StateDot/SPEC.md`, anchored to `size = 10` in the official `lib/index.js` and `StateDot.module.css` `.dot::after` |
| State dot · ongoing | 8 squares of 2×2; `(index − 8) × 125ms`; steps `1 / 0.6 / 0.35 / 0.15` | `[Official source]` | Same, anchored to the official `MATRIX_CELLS` and `@keyframes dsh-state-dot-chase` |
| State dot · solid core as captured | 8 × 8 (implying an outer diameter of about 13.3) | `[Runtime measurement]` | `StateDot/SPEC.md` "real-world scenario", matching `docs/reference/04-settings-models.png` |
| Disclosure row · row height / leading box / embedded glyph | 24 / 16 / 14 | `[Official source]` | `DisclosureRow/SPEC.md`, anchored to the official `DisclosureRow.module.css` `.row`, `.leading` |
| Disclosure row · title / hover transition | 13 / 24, colour `--dsw-alias-label-secondary` / `opacity 100ms ease` | `[Official source]` | Same, `.title` |
| Disclosure row · effective hot area in the icon-only form | 20 × 24 | `[Proposed here]` | Same: the actual value once `::after { inset: -4px }` is clipped by 4px on the left |
| Row group · group heading / minimum row height | 12 / 16, padding `8px 10px` / 40 | `[Official source]` | `ListRowGroup/SPEC.md`, anchored to `Menu.module.css` `.label`, `.item` |
| Row group · row corner radius | 10 | `[Known deviation]` | Same; 10 is not on the official radius scale (4 / 8 / 12 / 16 / 20 / 28) |
| Panel container · corner radius / padding | 12 / `12px 16px` | `[Official source]` | `PanelSeat/SPEC.md`, anchored to `ReadBlock.module.css` `.block` and `HoverCard.module.css` `.card` |
| Official group heading / count | 14 / 22 at weight 500, 28 × 22 / 14px normal, colour `rgb(173, 178, 184)`, 8 × 19 | `[Runtime measurement]` | `data/ui-inventory.json` `fO69Vq_groupTitle`, `fO69Vq_count` (slot=main) |
| Settings page · plugin group heading | 14 / 22, weight 500, 28 × 22 | `[Runtime measurement]` | Same, `cc-groupTitle` (slot=settings.section) |
| Usage panel · key-value label / key-value value | 12 / 18, colour `rgb(129, 133, 140)`, 260 × 18 / 12 / 18, colour `rgb(15, 17, 21)` | `[Runtime measurement]` | Same, `duc-profile-kv-label`, `duc-profile-kv-value` |
| Settings page · mini meter label / value | 12 / 18, colour `rgb(129, 133, 140)`, 58 × 18 / 12 / 18, colour `rgb(97, 102, 107)`, 16 × 18 | `[Runtime measurement]` | Same, `cc-miniMeterLabel`, `cc-miniMeterValue` |
| Usage panel · proportion bar | 10 × 36, radius `3px 3px 0 0` | `[Runtime measurement]` | Same, `lc-ov-usage-bar lc-ov-usage-tokens` (a vertical bar with a translucent business-tone fill) |
| Context panel · percentage | 12px / line-height normal, weight 700, 34 × 16 | `[Runtime measurement]` | Same, `lc-sl-pct` |
| Usage panel · stat value / sublabel | 20 / normal, weight 600, 24 × 27 / 11 / normal, colour `rgb(97, 102, 107)`, 46 × 15 | `[Runtime measurement]` | Same, `lc-stat-value`, `lc-stat-sub` |
| Type size steps | 26 / 18 / 16 / 14 / 13 / 12 / 11 / 10 | `[Proposed here]` | `spec/30-tokens.md`: the `TK-RC-13` decision set; a size off the scale counts as a violation |
| Minimum hit area / regular target | 20 × 20 / 28 × 28 | `[Borrowed principle]` | `spec/60-accessibility.md` `AC-MF-01` (transcribed from HIG) |
| Text contrast threshold | ≤17pt needs 4.5:1; ≥18pt or bold 3:1 | `[Borrowed principle]` | `spec/60-accessibility.md` `AC-MF-05` (HIG citing WCAG) |
| Token counts | palette 77 / light 115 / dark 119 / scale 207 | `[Runtime measurement]` | `counts` in `data/tokens.json` |

## Observed official practice

1. Neutral dividers and strokes all use a 0.5px hairline, which Chromium paints as one device pixel; dashed hints and state-coloured strokes stay at 1px (source: https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md) `[Official source]`.
2. Corner radius only takes the six steps 4 / 8 / 12 / 16 / 20 / 28, each with its own token; concentric nesting uses `inner = max(0, outer − inset)`, so outer R16 with inset 4 gives inner R12 (source: https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md) `[Official source]`.
3. The shared component catalogue records the state marker as "a solid dot in a 10px slot plus a continuously spinning in-progress loader", and notes that it is `aria-hidden` and that naming it is the caller's job (source: https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-primitives/README.md) `[Official source]`.
4. The same catalogue records the disclosure row as a compact 24px row: on hover in the collapsed state it previews a down arrow, and in the expanded state it keeps an up arrow (source: same as above) `[Official source]`.
5. Officially, the plugin page uses a 14/22 group heading at weight 500 with a 14px tertiary-coloured count on its right; the group heading for third-party plugins on the settings page is also 14/22 at weight 500 (source: `fO69Vq_groupTitle`, `fO69Vq_count`, `cc-groupTitle` in `data/ui-inventory.json`) `[Runtime measurement]`.
6. The usage and context panels in the real interface are rendered by third-party plugins: key and value in a key-value row are both 12/18 and separated by colour alone; the stat value is 20px at weight 600 with an 11px sublabel; the proportion bar is a 10 × 36 vertical bar with a radius of 3 at the top (source: `duc-profile-kv-*`, `lc-stat-*`, `lc-ov-usage-bar`, `lc-sl-pct` in `data/ui-inventory.json`) `[Runtime measurement]`.
7. List loading uses a skeleton, other page-level loading uses a bare centred spinner, and one page gets one loading style only (source: https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/skills/dsh-client-ui-ux/SKILL.md) `[Official source]`.
8. On failure keep the data visible and never clear the content to show an error; check colour choices under both themes; functional CSS caps the weight at 500 (source: same as above) `[Official source]`.
9. When rendering untrusted model output, drop raw HTML, restrict links and parse ANSI escapes (source: https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-primitives/README.md) `[Official source]`.

## Recommended practice for plugin authors

1. Pick the form first, then the component; one number belongs in one component only; drawing a bar and listing it in a key-value list at the same time can leave the two inconsistent (source: `MiniBar/README.md`) `[Proposed here]`.
2. Put the exact reading in text and let the bar answer only "how far to full"; the visible percentage is rounded and `aria-hidden`, so it cannot be the only source of the number (source: `MiniBar/SPEC.md` `a11y`) `[Proposed here]`.
3. A bar needs a name: `label="cache hit rate"` or an `aria-label`; with no name a screen reader is left with "progress bar 82%" (source: same as above) `[Proposed here]`.
4. The scale has to degrade: when the denominator is zero, do not show "0%", which claims a number that cannot be worked out; use `aria-valuetext` and say so in the text (source: same as above) `[Proposed here]`.
5. The fuller it gets, the more it has to speak up: `warn` / `error` only change the colour, so the state has to be written in the adjacent text (`AC-MF-07`) `[Proposed here]`.
6. A state dot needs text beside it; both branches of the component hard-code `aria-hidden="true"`, so a dot with no text is a defect (source: `StateDot/SPEC.md` `a11y`) `[Proposed here]`.
7. Only "in progress" may animate continuously; a looping animation on any other state is a violation (source: `spec/40-motion.md` `MO-MF-07`) `[Proposed here]`.
8. Whatever starts collapsed has to be supplementary; the label has to read on its own, so write "Changed files" rather than "Details" (source: `DisclosureRow/README.md`) `[Proposed here]`.
9. On touch-first screens make the whole row clickable: the icon-only form has an effective hot area of just 20 × 24, below the regular 28 × 28 target (`AC-MF-01`) `[Borrowed principle]`.
10. Do not introduce a size off the scale: the decision set is {26, 18, 16, 14, 13, 12, 11, 10}, each paired with a line height (source: `spec/30-tokens.md` `TK-RC-13`) `[Proposed here]`.
11. For number typography prefer `label-primary` / `label-secondary`; if you use `label-tertiary`, do not put key information there alone (source: the measurement section of `spec/60-accessibility.md`) `[Runtime measurement]`.
12. A data panel carried by `panel-seat` brings no outer margin of its own; the conversation flow spacing belongs to the host (`FL-AD-07` suggests 16) (source: `PanelSeat/SPEC.md`) `[Proposed here]`.

## Sources and known deviations

| Item | Notes | Marker |
| --- | --- | --- |
| Two type scales for the key-value list | The measured plugin has key and value both at 12/18, separated by colour alone (`duc-profile-kv-label` / `-value` in `data/ui-inventory.json`); this repository's `KeyValueList` uses 13/20 for keys and 14/22 for values, putting the hierarchy into the type size. Both stay within the official steps; the trade-off differs | `[Known deviation]` |
| The shape of the state dot's ongoing state | The public README describes "a 14px spinning loader in tertiary grey"; this repository's `StateDot/SPEC.md` anchors an 8-cell blue chase matrix in the shipped bundle. The two descriptions do not look like the same thing | `[Known deviation]` |
| The disclosure row's arrow and its expanded body | The public README describes a down-arrow preview on hover when collapsed, an up arrow kept when expanded, and the title sitting beside the content; this repository's SPEC anchors "one direction, no rotation" with the child content rendered below the row | `[Known deviation]` |
| The direction of the proportion bar | The product's `lc-ov-usage-bar` is a 10 × 36 vertical bar with a radius of 3 at the top; this repository's `MiniBar` is a horizontal 999px capsule. The numbers from the two forms are not interchangeable | `[Known deviation]` |
| Percentage weight and line height | The product's `lc-sl-pct` is 12px / line-height normal at weight 700; this repository's `MiniBar` uses the 12/18 regular weight of `Button.module.css` `.sm` | `[Known deviation]` |
| Two accounts of the radius scale | The public `docs/ui-radius.md` gives only 4/8/12/16/20/28; this repository's `spec/30-tokens.md` `TK-MF-03` allows only 18 / 14 and the corner radius of the official container itself; the row group's row anchors at 10. The three do not agree, so check against the container you are in before you ship | `[Known deviation]` |
| The weight cap versus the measured 600/700 | Officially, new or changed functional CSS keeps the weight at or below 500, while the measured 600 / 700 appears in a third-party plugin's own drawing, which is not a counterexample to the official cap | `[Known deviation]` |
| Tertiary colour contrast | On a light white background `--dsw-alias-label-tertiary` is about 3.7:1, below the 4.5:1 of `AC-MF-05`, and the 13px caption and the 10px state label use exactly that; recorded under "official first" and never overriding an official control | `[Known deviation]` |
| The meter body of cc-miniMeter | The capture covers only the two text nodes `cc-miniMeterLabel` and `cc-miniMeterValue`; there is no measured geometry for the meter track and fill | No evidence |
| Whether the key-value list has an official counterpart | The official shared component catalogue has no key-value list, so its geometry is anchored item by item to existing official selectors | `[Known deviation]` |
| Table form / shadow scale | There is no table component under the `data-display` category; DSH publishes no shadow scale, so this page asserts no shadow value | No evidence |

## Evidence

- `components/data-display/{KeyValueList,MiniBar,StateDot,DisclosureRow}/{README.md,SPEC.md}`
- `components/patterns/{ListRowGroup,PanelSeat}/SPEC.md`, `components/layout/SettingsRow/SPEC.md`
- `data/ui-inventory.json` (`duc-profile-kv-*`, `lc-ov-usage-bar`, `lc-sl-pct`, `lc-stat-*`, `cc-miniMeter*`, `cc-groupTitle`, `fO69Vq_groupTitle`, `fO69Vq_count`)
- `counts` in `data/tokens.json`; `spec/30-tokens.md`, `spec/60-accessibility.md`
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/skills/dsh-client-ui-ux/SKILL.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-primitives/README.md
