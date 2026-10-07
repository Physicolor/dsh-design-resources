---
source: spec/80-conflicts.md
source-sha256: 9f4116cf086ccb18
translated-at: 2026-10-07
---
# 80 Conflict arbitration

- Applies to: the parties involved when several plugins occupy the same seat or the same stretch of visual space, and plugin authors who need to appeal.
- Force: carries MF / RC / AD, labelled clause by clause.
- Whether the criteria in this document can be detected automatically: the **existence** of a conflict can be (scan every seat's occupants and the set of order values); the **outcome of a ruling** can't — that takes negotiation.

## 1. Conflict types

<!-- demo: conflict-board | Conflict board: all three tables use the real occupancy registry (`data/raw/occupancy-2026-10-01.json`) — the "change the registration order" button reorders the entries that declare no order, and the visible sequence changes with it; that is the problem this rule exists to treat. The other two tables show three order 40 collisions, and one clearly declared comparison. -->

| Type | Manifestation | Auto-detectable |
| --- | --- | --- |
| Undeclared order | the entry falls to the default 0, and registration timing decides the sequence | Yes |
| Order collision | several occupants of one seat share the same value | Yes |
| single shadowing | a later occupant replaces an earlier one and the official UI disappears | Yes (occupant count >1 on a single seat) |
| Visual-space contention | too many controls in one row, hit areas squeezed below <20×20 | Semi-automatic |
| Semantic duplication | two plugins offer an entry point or an icon with the same name and the same function | No |

## 2. Measured facts

| Seat | Fact |
| --- | --- |
| `shell.overlay` | 14 occupants, 11 of them declaring no order, so those 11 all fall to the default 0; the stacking order follows registration timing and is unpredictable |
| `settings.section` | 11 occupants, of which research-cordis / dsh-market / ui-harmony all set order to 40, so the sequence can't be explained |
| `conversation.session.header.utilities` | 4 occupants, order -10 / -5 / undeclared (null) / 5 — a clean arrangement |

The root cause of a conflict is not "too many occupants" but "undeclared order". Eleven occupants on one seat, each declaring a different order, do not amount to a defect in themselves.

## 3. Resolution rules

- `CF-MF-01`: A conflict ruling looks only at declarations and configuration, never at registration timing. Judge any case where the visible order depends on registration timing as a defect, and put the responsibility on the party that didn't declare order. [Proposed here]
- `CF-MF-02`: When a single seat is shadowed, order plays no part in the ruling — order means nothing for single. The shadowed party may not counter by adjusting order.
- `CF-MF-03`: A new plugin joining a seat that already has occupants, and finding its target order taken, must first take a vacant value (the current maximum +10), and must not copy an existing value. [Proposed here, consistent with `SL-MF-05`]
- `CF-RC-04`: The interim ruling order for an order collision (no authoritative value; proposed by this repository):
  1. The party that declared an explicit intent for its range (metadata or README note) has priority;
  2. The party registered earlier in that seat's occupancy registry has priority;
  3. When they still can't be told apart, the later arrival yields the seat — that is, treat the conflict as the later arrival not having taken the value per `CF-MF-03`.
- `CF-MF-05`: On visual-space contention (more than 6 controls in one row, or hit areas squeezed below <20×20), the later arrival folds into a menu or collapses instead of asking the earlier arrival to shrink its controls. Basis [HIG]: function doesn't change with space, only how much of it stays visible.
- `CF-RC-06`: When two plugins offer an entry point for the same function in one area, the later arrival merges its entry point into its own panel instead of adding another top-level entry. [Proposed here]

## 4. The appeal path

1. Submit a "seat occupancy record" in the plugin repository: seat name, type, order, purpose, screenshot, plugin version.
2. Check it against that seat's occupancy set for a collision (this can be done automatically).
3. Open an issue directly in the occupying party's repository and cite this spec's clause number (for example: "`CF-MF-03`, `settings.section` order 40 is already taken").
4. Where a `replaceRisk: shadows-shipped-ui` seat is involved and the covering party offers no off switch → escalate to the DSH team. That is a question about the seat's risk level, beyond what a community spec can rule on.
5. Visual-space contention inside one plugin (its own controls crowding one another) is not a community conflict; check it yourself against 20-controls.md section 5.

## 5. The honest limits

This spec can't force anyone to change code. It does three things:

1. It turns the order requirement into something a check can detect: a missing order, a duplicated value, several occupants on a single seat — a script can list them all.
2. It turns a conflict from "looks messy" into "a defect you can name": it can name the seat, the occupants and the specific values.
3. It gives one shared yielding rule (`CF-MF-03`, `CF-RC-04`), so a negotiation has a default resolution instead of depending on who speaks first.

It can't do three things:

- It can't change the order in which the DSH runtime distributes seats; the official implementation is the authority on how that behaves.
- It can't decide for the DSH team which seats should merge and which should be promoted to `single`.
- It doesn't judge the value of a plugin's features. A conflict ruling covers seats and visual space, not feature competition; "my feature matters more than yours" is no reason to occupy anything.

## 6. Occupancy registry fields

This spec defines the fields; this repository maintains the registry data (outside the `spec/` directory): seat name, seat type, scope, replaceRisk, occupant bundle name, order, declaration source (manifest path), registration time, note. Within one seat order values have to be unique; when the registry is generated, it outputs one warning for a duplicated value and one for a missing value.
