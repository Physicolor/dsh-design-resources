---
source: spec/11-slot-seats.md
source-sha256: a05e67858a2cbb76
translated-at: 2026-10-05
---
# 11 Seat directory and selection guide

- Applies to: any plugin that declares a slot.
- Force: carries MF / RC / AD, labelled clause by clause.
- Whether the criteria in this document can be detected automatically: mostly yes. Whether a seat id is declared, whether a list seat declares its order, whether orders collide, whether a seat with `replaceRisk: shadows-shipped-ui` is occupied — all scan statically; "do I actually need this seat" is a matter for human review.

## 1. The seat model

<!-- demo: seat-map | Seat map: every seat in the tree has its name, kind, scope, child-seat count and purpose copied from the measured seat tree (`data/slots.json`, 90 in all); the interface above is a product replica, and the pointer marks whichever column it sweeps over — a seat is a live container, not a box on a diagram. -->

[measured] DSH officially declares 90 UI seats (`data/slots.json`, `counts.seats`, collected 2026-10-01: `single` 38 · `list` 34 · `keyed` 15 · `chain` 3). A seat has one of four kinds and one of three scopes, and carries a `replaceRisk` label.

| Kind | Semantics | Multi-plugin relationship |
| --- | --- | --- |
| `single` | Sole occupancy | One occupant replaces another; occupying it covers the official UI |
| `list` | List | Many plugins coexist, ordered by ascending order |
| `keyed` | Dispatched by key | Picks the render target from the key the layer above passes down |
| `chain` | Selector routing | Can replace a whole routing result |

| Scope | Render condition |
| --- | --- |
| `root` | Global; exists with no session |
| `session-maybe` | Present with no session, but its content relates to the session |
| `session` | Renders only once a session is selected |

| replaceRisk | Meaning | Occupancy discipline |
| --- | --- | --- |
| `none` | Safe addition | Follow sections 2 and 3 |
| `shadows-shipped-ui` | Occupying it covers the official UI — high risk | Add the discipline in section 4 |

The authoritative seat list is whatever DSH itself declares (it moves between versions); this spec doesn't copy the list, it only sets out how to choose a seat and how to occupy one. A seat id comes from that declaration — never invent one.

## 2. The selection flow

Work through these in order, and stop as soon as a step settles the seat:

1. Does official material already have a seat for this kind of content? → Reuse that seat. Inventing a seat name is forbidden (an undeclared seat is not guaranteed to render). `SL-MF-01`
2. Must it exist with no session? Yes → the scope is `root` or `session-maybe`; no → the scope is `session`, so no empty shell renders when there's no session. `SL-MF-02`
3. Several plugins need to coexist → `list`; you need to dispatch among several targets of the same kind → `keyed`; you need to take over a stretch of routing → `chain`; sole replacement → `single` (go to section 4).
4. The target seat's `replaceRisk` is `shadows-shipped-ui` → apply the discipline in section 4.
5. The seat is `list` → declare its order (section 3).

## 3. Order rules for list seats

- `SL-MF-03`: [measured] A `list` seat declares its order explicitly — never lean on the default 0. Evidence: of the 14 occupants of `shell.overlay`, 11 declare no order, so all of them land on the default 0 and the stacking order follows registration timing and can't be predicted; the counter-example is `conversation.session.header.utilities`, where three of the 4 occupants declare -10 / -5 / 5 explicitly, so the order is explainable and the last one still declares nothing. The occupant snapshot is in `data/raw/occupancy-2026-10-01.json` (collected 2026-10-01; the numbers move with which plugins are enabled on this machine, so cite the date whenever you quote them).
- `SL-RC-04`: order is best split into bands. There's no authoritative value; this repository proposes the bands below, so that "forgot to declare" and "deliberately centred" stay distinguishable and later insertions have room.

| Band | Purpose |
| --- | --- |
| ≤ -10 | Reserved: framework-level, in front of the main flow |
| -9 .. -1 | Priority lead-in |
| 0 | Reserved for official existing occupants; a plugin takes 0 only to anchor against an official entry |
| 1 .. 99 | Ordinary additions, in steps of +10 |
| ≥ 100 | Reserved, blocking user-level insertions |

- `SL-MF-05`: When adding an occupant to a seat that already has occupants, take the seat's current largest order + 10. Colliding with an existing value counts as a defect (for what to do, see 80-conflicts.md). [Proposed here]
- `SL-RC-06`: For several entries from one bundle in one seat, keep neighbouring orders at least 5 apart. Why: [measured] the official template `conversation.session.header.utilities` steps by exactly 5 (-10 / -5 / 5). The gap requirement itself is proposed here.
- `SL-AD-07`: One plugin registers no more than 3 entries in one seat. More than that means the seat is being used as a menu — move to `keyed`, or ship your own popover. [Proposed here]

## 4. Discipline for occupying single and shadows-shipped-ui seats

- `SL-MF-08`: A plugin occupying a seat whose `replaceRisk` is `shadows-shipped-ui` states plainly in its manifest or README that "this plugin covers the official X interface", and offers an off switch, so a user can bring the official interface back with one click. [Proposed here]
- `SL-MF-09`: Never cover an official one-of-a-kind entry point: send, stop, the main settings entry, close. The test: in the official UI that control sits in a `single` seat and has no alternative path. [Proposed here]
- `SL-MF-10`: A `single` seat takes no order arbitration — order means nothing for `single`. The covered party follows the appeal path in section 4 of 80-conflicts.md.

## 5. keyed and chain

- `SL-MF-11`: The key of a `keyed` seat is stable (a constant or a stable identifier); no timestamps, random numbers or per-session counters. Changing a key is a breaking change. [Proposed here (official material doesn't publish a key-stability requirement)]
- `SL-MF-12`: When a `chain` seat occupant doesn't match, it falls back to the official implementation — it never swallows input it doesn't know. [Proposed here]

## 6. The bottom entry in the left sidebar

- `SL-MF-13`: In `sidebar.footer.action`, one button = one list entry. A wrapper around several buttons is forbidden (the seat-side statement of the same discipline as `FL-MF-09`). [measured]
- `SL-RC-14`: In this seat, orders step by +10 inside the 1..99 band from `SL-RC-04`; a bundle usually needs only 1 entry here (fold the entry into the plugin's own panel). [Proposed here]

## 7. Self-check

Before you ship, confirm: the seat comes from an official declaration; the scope agrees with the session dependency; a list seat has an explicit order and no collision; a shadows-shipped-ui seat comes with a statement and an off switch. This matches the SL group in 70-checklist.md.
