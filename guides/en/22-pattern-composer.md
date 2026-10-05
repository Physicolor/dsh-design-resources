---
source: guides/22-pattern-composer.md
source-sha256: f75800665e4db335
translated-at: 2026-10-05
---
# Composer extensions

> Pick the insertion point around the current input task, and keep clear of the send, stop, permission and model entries.

## What this page gets you

- Decide whether a piece of content belongs in the composer at all, or somewhere else
- Pick the one right seat among `conversation.input.*` / `conversation.composer.*`
- Add content following the official geometry and order discipline, without covering an official sole entry point
- Run this page's self-check table before you deliver

## What the composer is for, and the risk

The composer holds the core entries: send, stop, permission and the model picker. An insertion point in the wrong place can cover those actions, or squeeze the plugin's own entry. This page explains what each insertion point is for, the official measured geometry, the ordering rules, and how to avoid covering anything.

## When it applies

- Your entry acts on "this input" or "this send": attachments, presets, parameters, templates, context toggles.
- You want a full-width status or hint strip above or below the composer card.
- You want a transient overlay inside the composer card that has to sit on top of the card (completion, dropdown, hint).

## When not to use it

| What you have | Why it does not belong in the composer | Use instead |
| --- | --- | --- |
| A global settings item, a preference switch | Nothing to do with "this input"; it holds space on every send | `settings.section` (a `single` seat; occupancy discipline in [11-slot-seats.md](../../spec/11-slot-seats.md) section 4) |
| Switching or navigating objects across conversations | The composer belongs to the current conversation | The left sidebar, `sidebar` |
| A permanent collapsible view panel | Composer height is a hard budget; the panel pushes the composer card out of view | The rightbar, `rightbar` |
| Information tied to the conversation that has to stay for a long time | The composer changes with the draft; it is not the place for long-lived state | The conversation area, `conversation.view` / `conversation.session` |
| A full-screen or cross-region overlay | An overlay inside the composer card is for transient UI only | `shell.overlay`, and it has to declare `order` explicitly |

Source: [10-frame-layout.md](../../spec/10-frame-layout.md) sections 3 and 4 (the content-ownership decision tree and the cross-region decision table).

## Interface structure

The composer is a vertical stack. Top to bottom it has three parts, each with its own name:

| Part | Seat | Position |
| --- | --- | --- |
| Above the composer card | `conversation.input.dock` | Full width, above the composer card |
| The composer card itself | `conversation.composer.bar` | The card and its toolbar row |
| Below the composer card | `conversation.composer.dock` | The status line under the card |

Inside the card there is one more layer: `conversation.input.overlay` (an overlay that floats inside the card). The toolbar row splits left and right: `conversation.input.left` (compact controls on the left of the row) and `conversation.input.right` (compact controls before the send action); there are also several `single` seats (`.permission` / `.plan` / `.model` / `.activity`).

Source: `data/slots.json` (`conversation.input.dock` has the `purpose` "Full-width entries above the composer card.", `conversation.composer.dock` "Ambient entries below the composer card.", `conversation.input.overlay` "Floating entries rendered inside the resident composer card."). 90 seats in total (source: `counts.seats` in `data/slots.json`).

<!-- demo: frame-composer | The composer's vertical structure. The space on either side is not "what is left over" but named seats with a purpose. -->

## Key states

| State | Trigger | What you see |
| --- | --- | --- |
| No conversation | No conversation selected | `conversation.composer.bar` is `session-maybe` and renders a "lazy" composer card; the other composer seats are `session` and do not render |
| Conversation, single line | One line of draft | Composer card 780 × 98 |
| Conversation, multiple lines | Several lines of draft | The card grows to 780 × 114 (measured on the new-conversation page), and the composer seat is 128 high |
| Overlay open | Completion or dropdown opened | Only then may a covering layer appear inside the card |
| Empty | The draft is empty | The placeholder line `描述你想要构建的内容, / 调用指令, @ 文件或对话` is visible |

Source: seat kind/scope and purpose come from `data/slots.json`; the dimensions come from the measured size table in [10-frame-layout.md](../../spec/10-frame-layout.md) §2 and `docs/reference/composer-geometry.json`.

## Keyboard and focus

- The composer publishes no official keyboard contract. Behaviour such as Enter to send and Shift+Enter for a newline is not recorded in any file this repository can check: **no evidence**. Do not assert it in your own docs.
- The seat tree declares no Tab order for `conversation.input.*`, and there is **no evidence** for the focusable sequence inside the composer card either.
- Two of these have evidence and are actionable: `AC-MF-09` requires every interactive element to be reachable by Tab and triggerable with Enter/Space, in visual order; `AC-MF-14` requires icon-only buttons to have an accessible name. The matching checklist items are `A47` and `A49`.
- The official build already does this in the composer: the plus button's accessible name is `添加文件或调用指令`, and the permission pill's is `访问模式，当前：完全权限` (source: the `arias` field in `data/ui-inventory.json` for `cls` `RlGAzG_add` and `dlU_AG_trigger`).
- When you add a button to `conversation.input.left` / `.right`, use a 16×16 icon container and an inline container height of ≥28 (`CT-MF-13`).

## Light and dark

- Take every colour from a `--dsw-*` semantic token; never hard-code one (`TK-MF-01`). Colour anchors available inside the composer card: the card itself is `--dsw-alias-bg-layer-1`, placeholder and supporting text use `--dsw-alias-label-tertiary`, and toolbar trigger labels use `--dsw-alias-label-secondary`.
- Known deviation: on a light white background `--dsw-alias-label-tertiary` has a contrast ratio of about 3.7:1, below 4.5:1, and the composer placeholder line and toolbar labels are using it. This is existing product behaviour, recorded as a deviation under "official first" rather than overriding an official control; the conclusion for plugin authors: **do not put key information in this colour alone** (source: [60-accessibility.md](../../spec/60-accessibility.md) §3).
- When it was captured, the composer card's background was `rgb(255, 255, 255)` (source: the `bg` of `RlGAzG_card` in `docs/reference/composer-geometry.json`). That is a light-theme value; do not write it into your plugin as a constant.

## Narrow windows

- The composer card width is `min(780px, 100%)` (source: `.sh-card` in `website/shell/shell.css`, whose comment points at `RlGAzG_card`). It already handles narrow windows.
- The rule for adding something: a narrower space changes only how much is visible, not what the function does. As the window narrows, collapse or fold an entry away, never remove it (`AC-MF-16`, checklist item `A51`).
- No more than 6 visible controls in one part (`FL-RC-05`, checklist item `B01`). The official build's own comparable toolbar sample, `conversation.session.header.utilities`, has only 4 (source: `data/raw/occupancy-2026-10-01.json`, captured 2026-10-01).
- Toolbar control height has to match the rest of the row (`CT-MF-13`). Let your own container wrap; do not clamp text with a fixed px height (`AC-RC-17`).

## Accessibility

| Criterion | Value | Clause | Source |
| --- | --- | --- | --- |
| Hit area of a regular control | 28×28 | `AC-MF-01` | [60-accessibility.md](../../spec/60-accessibility.md) §2 |
| Smallest hit area | 20×20 | `AC-MF-01` | Same as above |
| Container row height for a button with an icon | ≥28 | `AC-MF-04` | Same as above |
| Text contrast at ≤17pt | ≥4.5:1 | `AC-MF-05` | Same as above, §3 |
| Non-text element contrast | ≥3:1 | `AC-MF-06` | Same as above, proposed here |
| Focus ring | 2px solid + `--dsw-alias-brand-primary` + 2px outer offset | `AC-MF-11` | Same as above, §4 |

## Coexisting with others

The composer's seats are shared: `conversation.input.left` / `.right`, `conversation.input.dock`, `conversation.composer.dock` and `conversation.input.overlay` are all `list` seats, so several plugins sit in them at the same time.

| Kind of conflict | What you see | What you do |
| --- | --- | --- |
| No order declared | The entry lands on the default 0, and registration timing decides the sequence | Declare it: take the current maximum and add 10 (`SL-MF-03`, `SL-MF-05`) |
| Order collision | Several occupants of one seat share a value | Take a free value first; once they collide, resolve in this order: declared range intent, then earlier registration, then the later arrival yields (`CF-MF-03`, `CF-RC-04`) |
| Contest for visual space | Too many controls in one row, and the hit area is squeezed below 20×20 | The later arrival folds into a menu or a collapse row; it may not ask the earlier one to shrink (`CF-MF-05`) |
| Semantic duplication | Two plugins offer an entry with the same name and the same function | The later arrival merges its entry into its own panel and adds no new top-level entry (`CF-RC-06`) |

- One plugin puts no more than 3 entries in the same seat (`SL-AD-07`, checklist item `B04`); more than that means you are using the seat as a menu, so switch to `keyed` or a popup layer of your own.
- Within one bundle, adjacent orders in the same seat are at least 5 apart (`SL-RC-06`, checklist item `B03`).
- Occupying a `single` seat means covering official UI: your plugin README or manifest has to state explicitly that this plugin covers the official X interface, and offer an off switch (`SL-MF-08`, checklist item `A11`).
- Conflict resolution is about seats and visual space, not about functional value; "my feature matters more" is not a reason to occupy ([80-conflicts.md](../../spec/80-conflicts.md) §5).

## Implementation resources

| Purpose | Component id | Path |
| --- | --- | --- |
| A compact trigger or status pill in a toolbar | `pill` | [components/controls/Pill](../../components/controls/Pill/SPEC.md) |
| An action that needs submit semantics or confirmation | `button` | [components/controls/Button](../../components/controls/Button/SPEC.md) |
| A boolean switch that takes effect immediately | `switch` | [components/controls/Switch](../../components/controls/Switch/SPEC.md) |
| Key hints inside a tooltip | `shortcut-keys` | [components/controls/ShortcutKeys](../../components/controls/ShortcutKeys/SPEC.md) |
| Building a toolbar container of your own | `toolbarrow` | [components/layout/ToolbarRow](../../components/layout/ToolbarRow/SPEC.md) |

<!-- component: pill | The three states and the focus ring of a clickable pill. The permission pill and the model picker in the composer toolbar belong to this same geometry family. -->

## Specs

Units are px. Unless marked otherwise, values are computed styles measured live in the browser.

| Part | Value | Marker | Source |
| --- | --- | --- | --- |
| Composer card | 780 × 114 (new-conversation page), radius 28, padding `8px 0 0 0` | `[Official source]` | `docs/reference/composer-geometry.json` `RlGAzG_card` |
| Where the card radius comes from | `var(--dsw-radius-panel)` resolves to 28 | `[Official source]` | `radius: 28px` of `RlGAzG_card` in `docs/reference/composer-geometry.json` |
| Composer card width | `min(780px, 100%)` | `[Proposed here]` | `website/shell/shell.css` `.sh-card` |
| Spacing inside the card | gap 12 | `[Official source]` | the `gap` of `RlGAzG_card` in `docs/reference/composer-geometry.json` |
| Composer container | 780 × 52 (`RlGAzG_input`), placeholder line 754 × 24 | `[Official source]` | Same as above, `RlGAzG_input`, `RlGAzG_placeholder` |
| Toolbar row | 780 × 42, padding `2px 8px 6px 8px`, gap 12 | `[Official source]` | Same as above, `RlGAzG_row` |
| Inline tool area in the row | 140 × 28 | `[Official source]` | Same as above, `RlGAzG_tools` |
| Plus button | 28 × 28, radius 999, background `rgb(245, 246, 247)` | `[Official source]` | Same as above, `RlGAzG_add`; for the accessible name see `data/ui-inventory.json` |
| Send button | 34 × 34, radius 999, background `rgb(65, 118, 230)` | `[Official source]` | Same as above, `RlGAzG_primary` |
| Permission pill | 100 × 28, radius 8, padding `0 4px 0 8px`, gap 4, label 13/20 at weight 500 | `[Official source]` | Same as above, `dlU_AG_trigger` |
| Model picker | 180 × 28, radius 8, padding `0 4px 0 8px`, gap 4, label 13/20 | `[Official source]` | Same as above, `wq12jW_trigger` |
| Width of the toolbar triggers | The difference between 100 and 180 comes from label length (labels 52 and 118 wide), not from two fixed widths | `[Official source]` | Same as above, `dlU_AG_triggerLabel` (52 × 20), `wq12jW_triggerLabel` (118 × 20) |
| Trigger chevron | 14 × 14, tertiary colour | `[Official source]` | Same as above, `dlU_AG_chevron` |
| Composer seat height | 128 (1283 × 128 on the new-conversation page) | `[Official source]` | [10-frame-layout.md](../../spec/10-frame-layout.md) §2 |
| Status line below the card (dock) | `RlGAzG_dock` 464 × 26, padding-top 4, gap 12 | `[Official source]` | the chain node with `cls` `RlGAzG_dock` in `docs/reference/status-line.json` |
| Two levels inside the dock | Outer container `iq1doa_root` gap 12, inner pill `iq1doa_pill` gap 6 padding `1px 8px` | `[Official source]` | Same as above; the captured text looks like `≈$0.0013` (12/20, colour `rgb(129, 133, 140)`) |
| Toolbar plus hit area | 28 × 28 | `[Runtime measurement]` | the `size` of `RlGAzG_add` in `data/ui-inventory.json`; the same value in `docs/reference/composer-geometry.json` |
| Toolbar trigger hit area | 100 × 28 (permission), 180 × 28 (model) | `[Runtime measurement]` | the `size` of `dlU_AG_trigger` in `data/ui-inventory.json`; the same value in `docs/reference/composer-geometry.json` |

## Observed official practice

Each item below is how the product actually renders it, with evidence.

1. The composer is a vertical stack of three parts, each with its own seat name; it is not a free canvas (source: `conversation.input.dock` / `conversation.composer.bar` / `conversation.composer.dock` in `data/slots.json`).
2. The toolbar splits left and right: on the left, "add something" and "the permission for this send"; on the right, "model" and "send" (source: `docs/reference/composer-geometry.json`: `RlGAzG_add` at x=540, `dlU_AG_trigger` at x=580, `wq12jW_trigger` at x=1066, `RlGAzG_primary` at x=1270).
3. The toolbar opens only two `list` seats, left and right; the rest are `single` (source: `conversation.input.left` / `.right` are `list` in `data/slots.json`, while `.permission` / `.plan` / `.model` / `.activity` / `.attachments` are `single`).
4. The official build gives the toolbar triggers one geometry: the same height 28, the same radius 8, labels 13/20 (source: `dlU_AG_trigger` and `wq12jW_trigger` in `docs/reference/composer-geometry.json`, where both have a `rect` height of 28, a `radius` of 8 and a `font` of `13px/20px`).
5. The official build itself bolds one trigger by a step: the permission pill's `font` is `13px/20px 500`, while the model picker is a regular weight (source: the two `font` fields in `docs/reference/composer-geometry.json`). The spec records this as "only the permission pill is one step heavier" ([20-controls.md](../../spec/20-controls.md) `CT-MF-23`).
6. The dock below the card gets its content from its occupant and its box from the product: it sits between the card and the bottom edge of the viewport (source: the header comment of `website/shell/parts/composer.js`: `composerSeat ends up flush with the bottom edge of the viewport: card → dock 26px → bottom 4px`).
7. The official accessible practice in the toolbar is explicit naming: the plus button `添加文件或调用指令`, the permission pill `访问模式，当前：完全权限` (source: `arias` in `data/ui-inventory.json`).

## Recommended practice for plugin authors

The following is what this repository recommends, with the reason.

1. **Answer "which part does this belong to" first; if the answer is not unique, do not start.** Reason: `FL-MF-01` requires one owner; the composer's three parts differ in width and scrolling behaviour, so the wrong part breaks first in a narrow window. (`[Proposed here]`)
2. **Add only controls that act on this input or this send.** Put global switches in the conversation header or the rightbar; reason: `FL-MF-03`. (`[Proposed here]`)
3. **Among the vertical insertion points, the order of preference is: `conversation.input.dock` > `conversation.composer.dock` > `conversation.input.overlay`.** The first two are stable full-width insertion points; the third is for transient UI only (completion, dropdown, hint) and never permanent. Reason: `FL-MF-04`; checklist item `A04` checks directly whether the overlay holds permanent UI. (`[Proposed here]`)
4. **Put read-only status in `conversation.composer.dock`, never a sole action entry.** Reason: that row reads visually as ambient information, not an action area; and at only 26px high it is hard to reach the hit-area minimum. (`[Proposed here]`)
5. **A new `list` entry has to declare `order` explicitly, set to the seat's current maximum + 10.** Reason: an undeclared order falls to the default 0 and registration timing decides the sequence; the official `shell.overlay`, where 11 of 14 occupants declare no order, is the counter-example, while the -10 / -5 / 5 of `conversation.session.header.utilities` is the good example (`SL-MF-03`, `SL-MF-05`; `data/raw/occupancy-2026-10-01.json`, captured 2026-10-01). (`[Proposed here]`)
6. **Do not occupy a `single` seat.** `conversation.input.permission` / `.plan` / `.model` / `.activity` / `.attachments` are all `single` with `replaceRisk: shadows-shipped-ui`, so occupying one covers an official control (source: `data/slots.json`). (`[Proposed here]`)
7. **Never cover an official sole entry point.** How to tell: in the official UI the control sits in a `single` seat and has no alternative path; in the composer, send and stop clearly belong to this class. (`SL-MF-09`, checklist item `A12`) (`[Proposed here]`)
8. **Controls in one row share height, radius and spacing, and the icon container is fixed at 16×16.** Trigger height 28, radius 8, spacing 12 (`CT-MF-23`); inline container height ≥28 (`CT-MF-13`). (`[Proposed here]`)
9. **A button has to be a real `<button>`, not a `div` + `onClick` stand-in.** `CT-MF-11` flags a `role="button"` with no keyboard event handling as a violation. (`[Proposed here]`)
10. **Use your own classes; do not override official control classes.** `CT-MF-12` flags "a plugin style overriding the geometry properties of an official control class". (`[Proposed here]`)
11. **Offer an off switch.** Whenever your plugin adds a visible element to the composer, it has to be removable in one click; reason: the composer's space budget belongs to the user, and `SL-MF-08` already requires an off switch for seats that cover official UI, so a visible addition to the composer is held to the same standard. (`[Proposed here]`)
12. **No more than 6 visible controls in one part; fold the rest into a menu of your own.** `FL-RC-05`, checklist item `B01`. (`[Proposed here]`)
13. **Give every icon-only button an accessible name.** `AC-MF-14`, checklist item `A49`; the official build already does this in the composer (see item 7 in "Observed official practice"). (`[Proposed here]`)

## Self-check table

| Yes / No | Check | Clause |
| --- | --- | --- |
|  | You can say in one sentence which part of the composer the new UI belongs to | `FL-MF-01` |
|  | Only controls that act on this input or this send | `FL-MF-03` |
|  | No permanent UI inside `conversation.input.overlay` | `FL-MF-04` |
|  | Every seat id comes from an official DSH declaration, none invented | `SL-MF-01` |
|  | Every `list` entry declares `order` explicitly, and none collide | `SL-MF-03` / `SL-MF-05` |
|  | Send, stop, settings and close are not covered | `SL-MF-09` |
|  | Controls in one row share height and radius; icon containers are 16×16 | `CT-MF-02` / `CT-MF-13` |
|  | Every interactive element has a hit area ≥20×20, and regular controls reach 28×28 | `AC-MF-01` |
|  | Icon-only buttons have an accessible name | `AC-MF-14` |
|  | As the window narrows, function folds away rather than disappearing | `AC-MF-16` |

## Sources and known deviations

| Item | Notes | Marker |
| --- | --- | --- |
| Two values for the composer card height | `composer-geometry.json` measures 780 × 114 (new-conversation page); the comment in `website/shell/parts/composer.js` says 780 × 98 for a single line inside a conversation; [10-frame-layout.md](../../spec/10-frame-layout.md) §2 keeps both and notes the scenario for each. Not a contradiction: two different draft line counts | `[Known deviation]` |
| The parent seat of `conversation.input.dock` | `data/slots.json` records the parent as `conversation.content` (depth 0), while the raw tree in `data/raw/slot-tree-2026-10-01.json` places it under `conversation.composer.bar` (whose `purpose` is nevertheless "above the composer card"). The two snapshots disagree; **the seat name, kind and purpose agree in both, only the parent differs**. When you decide placement, go by the raw tree, and do not infer above/below from the `parent` field | `[Known deviation]` |
| Which seat the "dock below the card" maps to | In the raw tree "below the composer card" is `conversation.composer.dock`, but the `.sh-status` comment in `website/shell/shell.css` calls it `conversation.input.dock`. Take the raw tree's `purpose` as the description of position | `[Known deviation]` |
| Horizontal spacing in the toolbar | `CT-RC-14` suggests 8px between adjacent controls in a row, while the measured toolbar uses `gap 12`. Where a measurement exists, it wins ([components/layout/ToolbarRow/SPEC.md](../../components/layout/ToolbarRow/SPEC.md) item 11 records this deviation) | `[Known deviation]` |
| Enter / Shift+Enter behaviour in the composer | Not recorded in any file this repository can check | No evidence |
| Tab order inside the composer card | The seat tree does not declare it | No evidence |
| `z-index` of the composer overlay | DSH publishes no overlay elevation token, so this repository makes no claim. Menu values 100 / 1100 and Modal 1000 are this repository's implementation values, not official published ones | No evidence |
| Whether the card radius 28 sits on the radius scale | `TK-MF-03` allows only 18 / 14 and "the official container's own radius"; 28 is the container's own radius, not a new value | `[Known deviation]` |
| Group spacing in the dock | The capture chain shows 12 (`iq1doa_root` gap), while the comment in `website/shell/parts/composer.js` says 14 between groups. The two disagree; the captured 12 wins | `[Known deviation]` |
| How many plugins occupy the composer | This repository's occupancy snapshot (`data/raw/occupancy-2026-10-01.json`) covers only four seats — `shell.overlay` / `settings.section` / `conversation.session.header.utilities` / `sidebar.footer.action` — and **does not capture the composer** | No evidence |

Note on borrowed principles: the `[OH]` (the 4/8 multiples and the spacing check) and `[HIG]` (hit areas, contrast) cited on this page are borrowed principles, cited after being transcribed into this repository's spec; no platform-specific values are cited (such as system component names or mobile units). For the transcription see [20-controls.md](../../spec/20-controls.md) §5 and [60-accessibility.md](../../spec/60-accessibility.md) §1.

## Evidence

Files this page actually read:

- `website/shell/parts/composer.js`
- `website/shell/shell.css`
- `docs/reference/composer-geometry.json`
- `docs/reference/status-line.json`
- `data/slots.json`
- `data/raw/slot-tree-2026-10-01.json`
- `data/raw/occupancy-2026-10-01.json`
- `data/ui-inventory.json`
- `spec/10-frame-layout.md`
- `spec/11-slot-seats.md`
- `spec/20-controls.md`
- `spec/30-tokens.md`
- `spec/60-accessibility.md`
- `spec/70-checklist.md`
- `spec/80-conflicts.md`
- `components/controls/Pill/SPEC.md`
- `components/controls/ShortcutKeys/SPEC.md`
- `components/layout/ToolbarRow/SPEC.md`
- `website/demos/README.md`
