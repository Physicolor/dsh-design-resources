---
source: guides/31-unofficial-regions.md
source-sha256: 5a3ff0ad52b39a5a
translated-at: 2026-10-07
---
# Places the product gives no seat

> Name the four places the product gives no seat, know how to borrow a seat to reach them, what you have to declare in your README, and how to coexist with the plugins that borrow the same place.

## What this page gets you

- Name the four places the product gives no seat, and tell whether your content lands in one of them.
- Put an interface there by borrowing a seat, while stating plainly "the product has no such seat" and what the degradation does.
- Avoid the three most common borrowing accidents: fighting for layer order at the `body` level, spilling over a neighbour, and failing to exit when the window narrows.
- Know where the community convention around this has formed, and that it is not an official standard yet.

## First, the four places with no seat

The list of places comes from section 5 of the [Region map](../spec/05-region-map.md). Here we only add one line on why it has no seat.

| Place | Official seat | Why there is none | How others use it |
| --- | --- | --- | --- |
| The bands either side of the reading column in the centre column | None | The reading column is centred at a fixed width, so whatever the centre column has beyond it is a **by-product of centring**, not a seat | Borrow a floating seat such as `conversation.input.overlay`, then move it over with absolute positioning |
| `conversation.input.overlay` itself | Yes, but its purpose is "floating entries inside the composer card" | The product never defined it as a centre-column panel | It is used as the conversation panel on the right of the centre column |
| An entry to a standalone plugin settings window | None | The product offers only two granularities: one preference row in General settings, and one page inside Settings | Use `settings.section` to land in the host settings window |
| A global top bar / a window-level command bar | None | The window is three full-height tracks, with no bar spanning them | Nowhere to put it; do not assemble one out of `shell.overlay` |

One thing is worth saying first, because it decides your approach: **a third-party plugin cannot mint a new seat.** The official client package's rule is that "rendering a slot you did not declare, or declaring a slot someone else already declared, fails at load time". So "apply for a seat for the band" is not a road that exists; borrowing is the only way.

## How to borrow a seat

Four steps; skip one and it breaks in someone else's environment.

**Step 1: pick a defensible seat.** Three conditions at once — it is a `list` (several plugins can coexist), its `replaceRisk` is `none` (it does not replace official UI), and its official purpose text stands up to your usage. The third is the one most often skipped: `conversation.input.overlay` says "floating entries rendered inside the resident composer card", so when you borrow it your thing **has to still be a floating entry**; calling a whole resident panel with a border, a title and an icon a "floating entry" is using the seat name to get past review.

**Step 2: write it down in the README.** One sentence, two facts: the product has no such seat, and which one you borrowed. Without it, the next person assumes this is an official area.

**Step 3: settle layer order, but look for a registry first.** This is the step with the most accidents; see the next section.

**Step 4: settle the degradation.** A borrowed seat can be changed by the product at any time, so you have to write down what happens after the change.

- `RG-MF-20`: A borrowed implementation must state "the product has no such seat; this plugin borrows X" in its README and give the degradation behaviour; missing counts as a defect (the guide-side expansion of `RG-MF-08`). [Proposed here]
- `RG-MF-21`: A borrowed seat must satisfy all three at once — `list`, `replaceRisk: none`, and an official purpose text consistent with your usage; satisfying only the first two is not a pass. [Proposed here]

## Layer order: do not decide it yourself, look for a registry first

**These accidents are all real, and none of them raises an error:**

- The layer audit tooling in the public repository `MeteorNOX/DeepSeek-Balance-Whale-Widget` recorded two silent accidents: once its layer candidate table referenced a flag that does not exist, so the whole layer chain threw on first call and an empty `catch` swallowed the exception, leaving nothing visible in the interface; another time a third party added an overlay hanging off `body` without registering it in the candidate table, so two windows covered each other and neither side reported anything. Its interoperability answer was to expose a private global function so other plugins can register their own masks. [Official source]

That is the full shape of "you covered someone else's window on their machine, and the console is clean". It never shows up on your development machine, because there you usually have only your own plugin installed.

**So:**

- `RG-MF-22`: Do not fight over layer order with `body` level, `documentElement` level or a huge `z-index`. First check whether the current environment has a public layer registry (the product has none; the community has versions each plugin maintains). When there is no registry, keep your overlay inside the positioning context of the seat you borrowed, and do not climb. [Proposed here]
- `RG-MF-23`: A new raised surface follows the official rule: `border: 0` with `--dsw-elevation-*`; do not stack another border layer or invent your own shadow. [Official source]

### Where the community convention lives

The centre-column band already has a community convention under maintenance, kept by `dsh-ui-harmonizer`: it splits "width occupancy" and "layer order" into two independent registration axes, and defines a compliance checklist and a zero-change compatibility matrix. **It is not an official standard**, it is a community convention; before you use it, read its current version rather than copying some plugin's implementation.

- `RG-RC-24`: A plugin that will live permanently on this band should register its width occupancy and layer order under the public centre-column band convention instead of inventing its own; that is what lets you coexist with the plugins already there (a statistics rail, a balance widget) first time. [Proposed here]

## Zero width: the band disappears first

The band's width is the remainder once the reading column is centred; it can shrink to 0, while the borrowed seat does not disappear with it. So as the window narrows, your overlay starts to overflow or reposition.

- `RG-MF-25`: Content that borrows the band must have an explicit zero-width behaviour, one of three: collapse to a single button, fold into the dock inside the composer card, or hide entirely. **Landing on top of the text is not allowed.** The test is to narrow the window until the reading column reaches its minimum width, and watch whether your interface exits or stacks on top. [Proposed here]
- `RG-MF-26`: A borrowed overlay must not keep occupying interaction space while the composer card is invisible; when the composer card exits, the overlay exits with it. [Proposed here]

## Coexisting with other borrowing plugins

Several fixed layers will share the same band. There is no official ordering between them, because there is no seat table here at all.

- `RG-RC-27`: When several plugins share one band, the earlier arrival keeps its place and the later arrival folds — collapse, narrow, or merge into an existing card; do not ask the earlier arrival to give way. [Proposed here]
- `RG-RC-28`: Do not render "one copy on each side" (one in the band, one in the right column) to dodge the decision about where it belongs. The user sees the same information twice. [Proposed here]

## Self-check table

| Yes / no | Check | Clause |
| --- | --- | --- |
|  | The README states "the product has no such seat" and the name of the borrowed seat | `RG-MF-20` |
|  | The borrowed seat is a list, `replaceRisk` is none, and its purpose text holds up | `RG-MF-21` |
|  | Layer order is not contested with `body` level or a huge z-index | `RG-MF-22` |
|  | A raised surface uses `border: 0` + official elevation, with no invented shadow | `RG-MF-23` |
|  | With the window narrowed to the reading column's minimum, the interface exits instead of stacking on the text | `RG-MF-25` |
|  | The overlay occupies no interaction space while the composer card is invisible | `RG-MF-26` |
|  | When several plugins share one space, the later arrival folds | `RG-RC-27` |
|  | The same information is not placed once in the centre column and once in the right column | `RG-RC-28` |

## Sources

- `data/slots.json`: official purpose text for `conversation.input.overlay`, `conversation.input.dock`, `conversation.composer.dock`, `settings.section` and `shell.overlay` (collected 2026-10-01).
- `packages/client/AGENTS.md`: "rendering a slot you did not declare, or declaring a slot someone else already declared, both fail at load time".
- `docs/web-styling.md`: the rule that a raised surface uses `border: 0` with official elevation.
- The public `MeteorNOX/DeepSeek-Balance-Whale-Widget` repository: its layer audit tooling and the two silent accidents it recorded (this is third-party plugin source, not a native DSH implementation).
- `dsh-widgets` client source: how it actually borrows `conversation.input.overlay` to land in the band.
- `spec/05-region-map.md` section 5, `spec/15-middle-column.md`, `spec/30-tokens.md` (elevation and layer order).
