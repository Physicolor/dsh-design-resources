---
source: guides/30-seats-integration.md
source-sha256: ba16cd98ee5d0f74
translated-at: 2026-10-07
---
# Seat selection and extension integration

> Settle the extension seat, the replacement risk and how plugins coexist before you design the interface.

This page is for DSH third-party plugin authors. You do not need the official monorepo's internal docs; you only need `data/slots.json` and the public `docs/subsystems/slots.md` to put your UI in the right place. Seats change between versions, and the authoritative list is DSH's own declaration, so this page only covers how to choose one and the discipline for occupying it.

## Start with the numbers

<!-- demo: seat-map | Seat map: each seat's name, kind, scope and purpose in the tree are copied from the measured seat tree (data/slots.json, 90 seats in total). The interface above is a reproduction of the product; whichever column the pointer sweeps over gets highlighted. -->

<!-- demo: conflict-board | Conflict board: all three tables use the real occupancy registry (data/raw/occupancy-2026-10-01.json)—the "change the timing" button reorders the entries that declare no order, and the visible order changes with it. -->

| Fact | Value | Source |
| --- | --- | --- |
| Total seats | 90 (source: `data/slots.json`'s `counts.seats`) `[Runtime measurement]` | Collected 2026-10-01 |
| By kind | `single` 38 / `list` 34 / `keyed` 15 / `chain` 3 (source: `data/slots.json`'s `counts.byKind`) `[Runtime measurement]` | Same as above |
| By scope | `root` 42 / `session` 43 / `session-maybe` 5 (source: `data/slots.json`'s `counts.byScope`) `[Runtime measurement]` | Same as above |
| By replacement risk | `shadows-shipped-ui` 41 / `none` 49 (source: `data/slots.json`'s `counts.byRisk`) `[Runtime measurement]` | Same as above; the two groups add up to 90 |

The 41 high-risk seats are not 41 "do not touch" seats. What `shadows-shipped-ui` actually means is "occupying it shadows some official interface", and most of them are simply not worth touching; the four `chain` seats (`shell.quota-notice` / `sidebar.right.tab.guide` / `conversation.composer`, source: `data/slots.json`) are semantically a route takeover, which is not at all the same thing as adding one more entry point.

## What the official code does (observed official practice)

Everything below is a checkable official practice, from the public repository github.com/deepseek-ai/deepseek-harness (master, version 0.2.0-rc.2, the same version running on this machine).

| Fact | Where the text is |
| --- | --- |
| UI crosses package boundaries only through slots; a component never gets `ctx`, and data and callbacks arrive as props | `packages/client/AGENTS.md` (the ctx discipline section, slot and props discipline) `[Official source]` |
| Contributing to someone else's slot uses `ctx.slots.inject(key, () => ctx.slots.register(...))`; it waits for the real declaration, removes the contribution when the declaration collapses, runs again after a re-declaration, and goes away with the calling fiber | `packages/client/AGENTS.md` item 4, `docs/subsystems/slots.md` `[Official source]` |
| A bare `slots.register` into an undeclared slot is still an error (it fails at load time) | `packages/client/AGENTS.md` item 4 `[Official source]` |
| You can only render slot keys declared in your own `children`; a declaration is the authorisation, and one live entry owns only one declaration | `docs/subsystems/slots.md` `[Official source]` |
| A seat name mirrors the composition path: `<domain>.<entry>.<hole>` (for example `tool.call.toolview`) | `packages/client/AGENTS.md` item 2 `[Official source]` |
| `single` and an "already occupied keyed unit" are **replacement points**; an additive extension should look for a new list `id` or an unoccupied key | the Extension rules in `docs/subsystems/slots.md` `[Official source]` |
| A `list` unit is addressed by the required `id`, sorted by `order`, and only then by registration order | Cardinality and scope in `docs/subsystems/slots.md` `[Official source]` |
| Registration always goes inside `apply`, module-level side effects are forbidden, and every registered contribution has to be disposable (HMR-safe) | `packages/client/AGENTS.md`, `packages/AGENTS.md` `[Official source]` |
| One UI feature = one plugin package; the `dsh.client` manifest pins `platform: 'web'` and must have a `./client` export | `packages/client/AGENTS.md` `[Official source]` |
| A raised surface is `border: 0` + `box-shadow: var(--dsw-elevation-*)`; do not stack a `--dsw-alias-border-*` border on it | `docs/web-styling.md` (Component rules) `[Official source]` |
| Corner radius only takes 4 / 8 / 12 / 16 / 20 / 28, mapping to `--dsw-radius-xs/sm/md/lg/xl/panel` | `docs/ui-radius.md` (Select the radius) `[Official source]` |

The official code writes down the `order` discipline but gives no banding values, and it does not say "a list seat holds at most this many entries". Those two are proposed here; see the next section.

## What the occupancy registry says

`data/raw/occupancy-2026-10-01.json` is a real snapshot of occupants on this machine at 2026-10-01 19:02 (collected via `cordis_inspect_query` → client / Slots / listSubTree). Its `caveat` says plainly that the number of occupants depends on which plugins were installed at the time, and that the collection time has to be stated alongside any citation.

| Seat | Kind / scope | Occupants | Undeclared order | Known collisions | Source |
| --- | --- | --- | --- | --- | --- |
| `shell.overlay` | list / root | 14 | 11 | none | `data/raw/occupancy-2026-10-01.json` `[Runtime measurement]` |
| `settings.section` | list / root | 11 | 0 | three at order 40 (research-cordis / market / ui-harmony) | Same as above `[Runtime measurement]` |
| `conversation.session.header.utilities` | list / session | 4 | 1 | none | Same as above `[Runtime measurement]` |
| `sidebar.footer.action` | list / root | 4 | 2 | none | Same as above `[Runtime measurement]` |

The three occupants with `order` 40 (research-cordis / market / ui-harmony, source: `settings.section.summary.orderFortyIds` in the same file) and the 11 `shell.overlay` occupants that declare no order are two faces of the same defect: **the visible order is no longer decided by a declaration**. Under `CF-MF-01`, an order that depends on registration timing counts as a defect, and the fault lies with the side that declared nothing.

## Adjudication rules

| Clause | Rule | Force | Source |
| --- | --- | --- | --- |
| `CF-MF-01` | A conflict is judged on declarations and configuration only, never on registration timing; an order that depends on timing is a defect | Mandatory (this repository) | `spec/80-conflicts.md` `[Proposed here]` |
| `CF-MF-02` | order takes no part in the adjudication when a `single` is shadowed—order means nothing for single, and the shadowed side may not fight back by tuning order | Mandatory (this repository) | Same as above `[Proposed here]` |
| `CF-MF-03` | When you enter a seat that already has occupants, if the order you want is taken you must pick a vacant value (the current maximum +10) and must not copy an existing value | Mandatory (this repository) | Same as above `[Proposed here]` |
| `CF-MF-05` | When visual space is contested (more than 6 controls on a row, or a hit area squeezed below 20×20), the later arrival folds into a menu or a disclosure and may not ask the earlier one to shrink | Mandatory (this repository) | Same as above `[Proposed here]`, checklist A43 |
| `CF-RC-04` | Provisional adjudication of an order collision: whoever declared an interval intent wins → whoever registered earlier wins → if they are still indistinguishable, the later arrival yields | Recommended (this repository) | Same as above `[Proposed here]` |

The appeal path is written in section 4 of `spec/80-conflicts.md`: first submit a seat occupancy registration (seat name, kind, order, purpose, screenshot, plugin version), then raise an issue against the occupying repository under the rule number. Where a `shadows-shipped-ui` seat is involved and the shadowing side offers no off switch, report it to DSH officially—that is beyond what a community convention can adjudicate.

## Recommended practice for plugin authors

Everything below is proposed here, with the reasoning. It constrains **interfaces you write from now on**; it does not overturn the product's own implementation.

| Recommendation | Reason | Marker |
| --- | --- | --- |
| Seat ids always come from `data/slots.json`, never made up | An undeclared slot is not guaranteed to render; `A07` is an automated check | `[Proposed here]` |
| First decide "does it have to exist with no conversation?", then pick `root` / `session-maybe` / `session` | Pick wrong and it renders an empty shell when there is no conversation; `A08` is a semi-automated check | `[Proposed here]` |
| Prefer a new list `id`; use an unoccupied key when you need to distribute across targets; use `chain` only when you really are taking over a route | The official code is explicit that `single` and an occupied keyed unit are replacement points (`docs/subsystems/slots.md`) | `[Proposed here]` |
| Declare order explicitly on every list entry, taking that seat's current maximum +10 | `A09` / `A10` are the most frequent violations and the easiest to automate | `[Proposed here]` |
| order bands: ≤ -10 framework level, -9..-1 leading, 0 reserved for the official existing items, 1..99 regular in +10 steps, ≥100 reserved | It makes "forgot to declare" distinguishable from "deliberately in the middle", and leaves room for later insertions; `B02` | `[Proposed here]` |
| Adjacent orders for the same bundle in the same seat are at least 5 apart, and no more than 3 entries per seat | `B03` / `B04`; beyond that the seat is being used as a menu, so switch to `keyed` or carry your own popup layer | `[Proposed here]` |
| When occupying a `shadows-shipped-ui` seat, state "this shadows the official X interface" in the README and provide an off switch | `A11`; `SL-MF-08` | `[Proposed here]` |
| Do not shadow an official sole entry point: send, stop, the main settings entry, close | `A12`, `SL-MF-09`; the test is whether that control sits in a `single` in the official UI with no alternative path | `[Proposed here]` |
| A `keyed` key must be a constant or a stable identifier; timestamps / random numbers / per-session incrementing integers are forbidden | `A13`; changing a key is a breaking change (the official docs publish no key stability requirement) | `[Proposed here]` |
| A `chain` must fall back to the official implementation when it matches nothing, and must not swallow unknown input | `A14`, `SL-MF-12` | `[Proposed here]` |
| Put registration inside `apply`, use `ctx.slots.inject` rather than a bare `register`, and make sure it can be disposed | The official text is explicit; under HMR a module-level side effect registers twice | `[Proposed here]` |
| A new raised surface uses `border: 0` + `--dsw-elevation-*`; do not put a second border layer on an official control | The elevation spec in the official `docs/web-styling.md` rejects a border paired with a shadow | `[Proposed here]` |
| Corner radius only takes 4 / 8 / 12 / 16 / 20 / 28 | Official `docs/ui-radius.md`; `A25` is an automated check | `[Proposed here]` |

## "Where should my UI go?", the decision flow

Work through it in order, and stop at whichever step gives you an answer:

0. Settle the region first: which track and which band does it belong to? If you cannot tell, read the [Region map](../spec/05-region-map.md). If it lands in the centre column, fix the level — fill it, take a tab, or float a band — with [What the centre column can hold](../spec/15-middle-column.md). `RG-MF-01`
1. Does official code already have a seat for this kind of content? If so reuse it, do not invent one. `SL-MF-01` / `A07`
2. No seat exists, but the content really does belong on this screen? Follow the borrowing discipline in [Places the product gives no seat](31-unofficial-regions.md) and state that the product has none; do not force it into whichever seat name looks closest. `RG-MF-08`
3. Does it have to exist with no conversation? Yes → `root` or `session-maybe`; no → `session`. `SL-MF-02` / `A08`
4. Need several plugins to coexist → `list`; need to distribute across several targets of the same kind → `keyed`; need to take over a stretch of routing → `chain`; an exclusive replacement → `single` (go to step 7)
5. The target is a `list` → declare order explicitly, taking the existing maximum +10. `SL-MF-03` / `SL-MF-05`
6. The target is a `keyed` → the key must be stable. `SL-MF-11`
7. The target `replaceRisk` is `shadows-shipped-ui` → write the declaration, give an off switch, and confirm you are not shadowing a sole entry point. `SL-MF-08` / `SL-MF-09`

## Self-check table

| Yes / No | Check | Clause | Detection |
| --- | --- | --- | --- |
|  | The interface declares which level it occupies, and that matches where it actually renders | RG-MF-01 | Semi-automated |
|  | Occupying a region the product gives no seat to comes with "the product has no seat here" and a fallback | RG-MF-08 | Semi-automated |
|  | Every seat id used comes from the official DSH declaration | SL-MF-01 | Automated |
|  | Scope matches whether it depends on a conversation | SL-MF-02 | Semi-automated |
|  | Every list entry declares order explicitly | SL-MF-03 | Automated |
|  | order does not collide and takes the existing maximum +10 | SL-MF-05 | Automated |
|  | A `shadows-shipped-ui` occupancy has a declaration and an off switch | SL-MF-08 | Semi-automated |
|  | Send / stop / the main settings entry / close are not shadowed | SL-MF-09 | Human review |
|  | Stable key for `keyed` | SL-MF-11 | Semi-automated |
|  | A `chain` falls back to the official implementation when it matches nothing | SL-MF-12 | Human review |
|  | In `sidebar.footer.action`, one button = one list entry, no wrapper | FL-MF-09 / SL-MF-13 | Automated |
|  | No more than 6 visible controls on a row | FL-RC-05 | Automated |

<!-- component: panel-seat | Insert a block with its own border and title into the conversation flow. The seat itself is real (data/slots.json holds 90 seats), but the block's own body was not measured in this repository—it is proposed, so reconcile it against the real interface yourself before using it (see the scenes in components/origins.json). -->

## Known deviations

| Item | Note | Marker |
| --- | --- | --- |
| The nature of "order must be declared explicitly" | The official `docs/subsystems/slots.md` only says a list is sorted by order and then by registration order; it **does not write "an undeclared order is a defect" into the official rules**. That is this repository's discipline (`SL-MF-03`), based on the measured consequences of 11 undeclared orders | `[Known deviation]` |
| Button radius disagrees with the official radius spec | Lines 13 and 14 of this repository's `spec/20-controls.md` and `components/controls/Button/SPEC.md` record the official Button as `md` r18 / `sm` r14; the official `docs/ui-radius.md` allows only 4/8/12/16/20/28 and lists Button `sm` R8, `md` R12. The readings do not match the spec; for the details and how it is handled, see the known deviations list in [40-selfcheck-sources.md](40-selfcheck-sources.md) | `[Known deviation]` |
| How `replaceRisk` is judged | The `byRisk` in `data/slots.json` is computed by this repository's tools from the seat tree (`shadows-shipped-ui` 41 / `none` 49); the public official docs give only the semantics "`single` and an occupied keyed unit are replacement points", and publish no classification count of 41 | `[Known deviation]` |
| The banding values for `order` | The official docs publish no banding at all. The ≤-10 / -9..-1 / 0 / 1..99 / ≥100 of `SL-RC-04` are all `[Proposed here]` | `[Proposed here]` |
| Whether the official code marks seats in the DOM | A seat is described in `docs/reference/README.md` as a `display: contents` logical node with `[data-slot]`, but the public `docs/subsystems/slots.md` never mentions that attribute; this repository makes no claim about it | No evidence |
| Where `conversation.input.activity` belongs | The opening of `docs/subsystems/slots.md` describes `conversation.input.activity` as "an action between the model selector and send", but the shipped hierarchy tree at the end of that page does not list it | `[Known deviation]` |
| Number of occupants in the composer | The occupant snapshot covers only 4 seats and **did not collect the composer**, so "how many plugins occupy the composer" has no evidence | No evidence |

## Evidence

Files and URLs actually read:

- `data/slots.json` (the full `counts` and `seats` tables)
- `data/raw/occupancy-2026-10-01.json` (collected 2026-10-01 19:02)
- `data/raw/slot-tree-2026-10-01.json`
- `spec/11-slot-seats.md`, `spec/70-checklist.md`, `spec/80-conflicts.md`, `spec/00-overview.md`
- `components/origins.json`, `components/controls/Button/SPEC.md`, `components/controls/Button/button.module.css`
- `docs/reference/README.md`, `website/demos/README.md`
- https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/AGENTS.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/slots.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md
