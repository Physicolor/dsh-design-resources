---
source: spec/10-frame-layout.md
source-sha256: 8f31c72497214e8c
translated-at: 2026-10-07
---
# 10 Main page frame

- Applies to: plugin authors adding UI anywhere in the main interface.
- Force: includes MF / RC / AD, marked clause by clause.
- Machine-checkable criteria in this document: partly. Seat choice (the slot id in the manifest and in the code) is statically checkable; "does this content belong in this region" can only be reviewed by hand.

## 1. Responsibilities of the three columns

[measured] The DSH main page is a three-column layout: the left sidebar `sidebar`, the centre column `main` / `main.conversation` (the current session), and the rightbar `rightbar`. This section covers the **division of responsibility** — what each column holds; for "which segments make up this screen, and which of them official material gives no seat at all", see the [region map](05-region-map.md). The split between them: 05 answers "does it have a name", this document answers "which column does it belong to".

| Area | Responsibility | Allowed content | Disallowed content |
| --- | --- | --- | --- |
| Left sidebar `sidebar` | Global navigation and object lists | Session switching, lists, the plugin sidebar entry (`sidebar.footer.action`) | Message content of the current session, temporary detail panels |
| Centre column `main.conversation` | All content and interaction of the current session | Conversation log, input, session-level tools and state | Global settings entries unrelated to any session |
| Rightbar `rightbar` | Panels that stay visible and relate loosely to the current session | Temporary viewing content: context, inspector, previews, cited sources | Operations the main flow cannot do without (clicking it is the only way to finish the task) |

- `FL-MF-01`: Any new UI must be able to answer "which column does it belong to", and the answer must be unique. If it is not unique, the design is not settled. [Proposed here]
- `FL-MF-02`: Operations the main flow must go through must never sit in the rightbar alone. The rightbar carries more weight by nature (always visible, level with the centre column) but can be collapsed; the main flow must still be completable once it is collapsed. [Proposed here]

<!-- demo: frame-columns | Three-column anatomy. Move the pointer over any column or any band and it is marked out — see where things sit first, then read the clauses below. -->

## 2. The centre column in three bands

| Band | Seat | Responsibility |
| --- | --- | --- |
| Top | `conversation.header` | Session identity and operations that apply globally to this session; for the tool row see `conversation.session.header.utilities` |
| Conversation log | `conversation.view` → `conversation.session` | The message stream itself and its inline attachments |
| Input area | `conversation.composer.bar` | The input card and its tool row: the two list seats `conversation.input.left` / `.right`, plus single seats such as `.plan` / `.model` / `.activity` / `.permission` |

The input area has three further vertical insertion points: `conversation.input.dock` (above the input card), `conversation.composer.dock` (below the input card), and `conversation.input.overlay` (a floating layer inside the input card).

### Measured sizes (1570 × 905 viewport)

The spec body used to cover responsibilities only, never sizes; the numbers we measured stayed in `docs/reference/`. The few that bear on this page are recorded here, so you can check the layout against them when it changes.

| Area | Measured | Source |
| --- | --- | --- |
| Left sidebar | **280 × 905** (drag handle 8px wide @ x = 276) | `geometry.json` |
| Centre column | 1290 × 905 @ x = 280 (with no plugin rightbar) | Same as above |
| Conversation header | **1290 × 50**; title left edge = centre column + 28; top bar tool right edge = viewport − 12 | `top-strip.json` |
| New-session page header | **1290 × 40** (no session identity, just an empty header — hence 10px shorter than the conversation page) | `top-strip.json`, element inventory |
| Conversation header tabs | **26 × 26** each (width follows the text; measured `对话` 26 × 26), three tabs **139 × 26** in total, spacing 25 | `top-strip.json` |
| Collapse corner | 10 × 10 on the chip; 12 × 12 on the workspace row | `top-strip.json`, `composer-geometry.json` |
| Top bar glyphs (panel toggle / more actions / agent team) | **16 × 16** (button hit area 28 × 28) | `top-strip.json` |
| Input area seat | Centre column width × **128** high; measured **1283 × 128** on the new-session page, **853 × 128** on the conversation page (with a plugin column) | `conversation-geometry.json` |
| Activity row | **748 × 33** (the whole row is clickable; inside it a 14/22 title + an elapsed-time figure 9 × 17) | Element inventory |
| Timeline scale | **28 × 10** (the vertical scale on the right of the conversation, changing colour when selected) | Element inventory |
| Message action buttons | **28 × 28** · radius **8** (after the timestamp; measured timestamp 43 × 24 / 28 × 24) | Element inventory |
| New-session page workspace row | Workspace button **162 × 28** · label 110 × 20 · `预览版` badge **52 × 21** (radius 999) | `composer-geometry.json` |
| New-session page brand row | Fish mark **34 × 25** · agent preset seat button **106 × 28** · seat label 52 × 20 | `composer-geometry.json` |
| User bubble | **525 × 64** (one measured), radius 20 · padding `10px 16px` | `conversation-geometry.json` |
| Message timestamp | **43 × 24** · 13/24 · tertiary colour (after it the 28 × 28 action button) | Element inventory |
| Rightbar entry row | **380 × 68** · radius **20** · padding `14px 20px` · gap 14 | Element inventory |
| Rightbar collapse glyph | **15 × 15** | Element inventory |
| Conversation header chip | Height **28** (icon **14 × 14**, label 12/16) | `top-strip.json`, spec in 20-controls §7.1 |
| Reading column | **748 wide, centred**, 32 padding on each side | `conversation-geometry.json` |
| Input card | **780 × 114** (hero; 780 × 98 for a single line in a conversation), radius 28 | `composer-geometry.json` |
| Input area interior | Input area **776 × 52** · placeholder line **754 × 24** · left plus button **28 × 28** · send round button **34 × 34** | `composer-geometry.json` |
| Dock below the card | Height **26** (padding-top 4 + content 22) | `status-line.json` |

- `FL-MF-03`: Put only controls that act on this input or this send in the tool row (`conversation.input.left` / `.right` / `.plan` / `.model` / `.activity`); put global switches in `conversation.header` or the rightbar. [Proposed here]
- `FL-MF-04`: Use `conversation.input.dock` / `composer.dock` to extend the capability list for this input (attachments, parameters, presets); use `conversation.input.overlay` only for transient UI that has to sit on top of the input card (completions, dropdowns, tips), never for something permanently visible. [Proposed here]
- `FL-RC-05`: Keep no more than 6 visible controls in one band. No authoritative figure exists; this repository proposes 6, because the comparable official tool row, `conversation.session.header.utilities`, holds 4 items, and past 6 items a 28×28 hit area and the visual density cannot both be satisfied. Move the excess into a menu (per [HIG]: features do not change with space, only how many stay visible).

<!-- demo: frame-composer | The input area's vertical structure. The whitespace on either side is not "the space that is left over" but named seats with a purpose. -->

## 3. Content-ownership decision tree

Answer in order; the first "yes" settles the ownership:

1. Does it have to exist with no session selected? No → the conversation area (`session` scope), go to step 2.
2. Is it a global setting or preference? Yes → `settings.section` (a single seat; for the discipline on occupying it, see 11-slot-seats.md section 4).
3. Is it for switching between sessions / workspaces / objects? Yes → the left sidebar `sidebar`.
4. Is it tightly bound to the current session but has to stay visible and collapse on demand? Yes → the rightbar `rightbar`.
5. Is it a cross-region, full-screen frame-level overlay? Yes → `shell.overlay`, and it has to declare `order` explicitly (see `SL-MF-01`).
6. All no → it does not belong to the main page frame; make it a standalone page or document instead of pushing it into an existing region.

## 4. Cross-region decision table

| Content type | First choice | Second choice | Disallowed | Clause |
| --- | --- | --- | --- | --- |
| Information about the current session | Conversation area `conversation.view` / `session` | Rightbar (temporary viewing only) | Left sidebar | `FL-MF-06` |
| Session-level information that needs to stay put | Conversation area | Rightbar (must be collapsible) | — | `FL-MF-06` |
| Global settings | `settings.section` | — | Conversation area, left sidebar list area | `FL-MF-01` |
| Object switching / navigation | Left sidebar | — | Rightbar | `FL-MF-01` |
| Temporary viewing (previews, inspector, sources) | Rightbar | Inline expansion inside the conversation area | — | `FL-MF-02` |
| Cross-region overlay | `shell.overlay` | `conversation.input.overlay` (inside the input card only) | Absolutely positioned overflow | `FL-MF-08` |

- `FL-MF-06`: Session-related information goes in the conversation area first, the rightbar second. No authoritative figure exists; this repository proposes settling it this way, because the rightbar carries more weight by nature and stays put, so long-lived information there keeps squeezing the width of the centre column's main flow, and the rightbar can be collapsed — collapsing makes the information disappear.

<!-- demo: frame-rightbar | The two layouts with the rightbar open and closed. Click the rightbar and watch how the centre column gives way. -->

## 5. Spacing and boundaries

- `FL-AD-07`: The vertical band boundary spacing between the centre column's bands. No authoritative figure exists (DSH has not published tokenised layout spacing); this repository proposes 16px, because (a) 16 is a multiple of 8, matching [OH]'s 4/8 multiples and the 8vp baseline grid, and (b) an official [OH] checklist item calls spacing below 16vp "cramped", making 16 the lower bound that passes.
- `FL-MF-08`: Cross-region content does not use negative margins or absolute positioning to reach past its region boundary and cover a neighbouring region. The frame-level overlay is the only exception, and it has to go through `shell.overlay`. [Proposed here]

## 6. Entry discipline at the bottom of the left sidebar

- `FL-MF-09`: [measured] Each button in `sidebar.footer.action` is its own list entry (one entry, one button); do not wrap several buttons in one wrapper element. The shell manages the spacing and alignment of that area, and wrapping breaks the alignment.
- Violation test: the subtree rendered by a single list entry in that seat contains more than one interactive control. Machine-checkable (walk the DOM after rendering).
