---
source: spec/00-overview.md
source-sha256: 64a9c2ee9c7968e9
translated-at: 2026-10-05
---
# 00 Overview: The DSH design spec layer

- Applies to: community authors writing plugins for DeepSeek Harness (DSH), plugin reviewers, and everyone who contributes UI that has to coexist with other people's UI in the same interface.
- Force: this is the meta document. It sets how the other documents label their force, how they number clauses, and how they label where values come from; it carries no mandatory clause of its own.
- Whether the criteria in this document can be detected automatically: not applicable (meta document). The "detectability label" this document defines is applied by 70-checklist.md.

## 1. What the gap is

The compatibility layer DSH officially offers plugin authors covers the technology stack: the Cordis plugin system, slot seat declarations, the `--dsw-*` design tokens. It answers "where can I mount, which variables can I use, which semantic colours exist"; it doesn't answer "how big, how far apart, how fast, and who goes first when two plugins share a spot".

The consequences are on record, not hypothetical:

| Seat | Occupants | Verified fact |
| --- | --- | --- |
| `shell.overlay` | 14 | 11 of them don't declare `order`, so all fall to the default 0, and the stacking order follows registration timing — unpredictable |
| `settings.section` | 11 | research-cordis / dsh-market / ui-harmony all set order to 40; the resulting order can't be explained |
| `conversation.session.header.utilities` | 4 | order is -10 / -5 / undeclared (null) / 5 — a clean, explainable arrangement |

All three are `list` seats; the only difference is whether order gets declared. This gap is what this repository exists to fill.

## 2. Force levels

<!-- demo: rule-legend | Rule and source legend: the three force levels (MF / RC / AD) and the five source labels laid out the way they really render — a label is only citable when it looks and reads the same across documents. -->

| Marker | Name | Meaning | On violation |
| --- | --- | --- | --- |
| MF | Mandatory | Not meeting it counts as a defect; review can reject | Fix it, or write down the reason for an exception |
| RC | Recommended | Follow it by default; a deviation needs its reason in the plugin README | Doesn't block a merge, but goes on the record |
| AD | Advisory | Material for a trade-off; judge per scenario | Nothing to explain |

A document can carry all three levels at once. Every clause labels its own force explicitly; a sentence with no label is not a clause.

## 3. Rule numbering and citation

Number format: `<domain>-<force>-<number>`, e.g. `FL-MF-03` (frame domain, mandatory, clause 3). Domain codes: FL frame, SL seats, CT controls, TK tokens, MO motion, IC icons, AC accessibility, CF conflicts.

70-checklist.md cites ids only and never repeats the values from the body text; the body text is the source of truth for values. Cite it as "per DSH Design Resources `FL-MF-03`".

## 4. Labelling where values come from (the root constraint of this repository)

Every value carries a source label:

| Label | Meaning |
| --- | --- |
| [HIG] | Official Apple Human Interface Guidelines text |
| [OH] | The full OpenHarmony official documentation |
| [DSH-CSS] | DSH's official uncompressed CSS source (some comments say the value came from a Figma component instance) |
| [measured] | Counted in full over this machine's DSH assets and declarations; the method is reproducible |
| [repo-recommendation] | No authoritative value exists; the value and the reasoning this repository offers |

Iron rule: a value with no source label is a defect. When a dimension genuinely has no authoritative value, write it as "no authoritative value; this repository recommends X because Y" — don't go silent and don't invent a source. Apple HIG publishes no 8pt grid and no official motion durations; this repository doesn't claim they exist.

## 4.1 Official first (the boundary of this spec)

When a value in this spec conflicts with what an official control already ships, **the official implementation wins**, and the clause doesn't apply in that scenario:

| Conflict | What to do | Example |
| --- | --- | --- |
| The transition duration and curve an official control ships | Keep the official value; don't force it onto the 40-motion steps | The Switch thumb is the official `120ms ease`, off the five steps |
| A state an official control doesn't provide | Don't add styling of your own; record it as "official doesn't provide it" | Switch has no hover state; Pill has no active state |
| Spacing inside an official control, or between a control and its own icon | Don't apply the spacing advice for the space between controls | Between Button text and its icon is the official `gap: 4px` |

Why: this spec governs **newly written UI** and **coordination between plugins**, not the overturning of the product's existing implementation. Overriding an official control's geometry to satisfy this spec is exactly what `CT-MF-12` forbids.

Two right moves when you hit this kind of conflict: write it into that component's SPEC under "Known deviations", or mark it `false` in the matching check and note why — **don't change the official control**. This clause distils four conflicts found in a single pass during the 2026-10 component documentation rework (Switch transition, missing Switch/Pill states, Toast entry and exit durations, Toolbar inline spacing).

## 5. What it doesn't do

- It doesn't put subjective style preference in place of quality assessment: no brand hue, no illustration style. Visual quality is judged on checkable criteria — information hierarchy, reading width, density, alignment, theme contrast, interaction states, focus visibility.
- It doesn't repeat the official technical documentation: seat declaration syntax and token variable names follow DSH official docs; this spec covers usage, combination and conflict handling only.
- It doesn't pretend it can enforce anything: this spec is a repository artefact, not a DSH runtime validator. It makes a violation findable and nameable; it can't make a violation impossible (see 80-conflicts.md section 5).

## 6. The documents

| File | Contents |
| --- | --- |
| 10-frame-layout.md | The three-column frame and the three-way split of the middle column: who owns what, and the decision tree for content ownership |
| 11-slot-seats.md | How to choose a seat, the order rules for list seats, discipline for single occupancy |
| 20-controls.md | Official control geometry, how to pick a variant, no home-made substitutes |
| 30-tokens.md | Semantic tokens as the only source, depth through background layers, the type scale |
| 40-motion.md | The five duration steps, the standard curve, reduced-motion, performance budget |
| 50-icons.md | Facts about the official icon set, size families, when to draw your own, naming |
| 60-accessibility.md | Hit areas 28/20, contrast, focus ring, keyboard reachability |
| 70-checklist.md | The binary pre-submit checklist |
| 80-conflicts.md | How to settle seat and visual-space conflicts, and how to appeal |
