---
source: spec/05-region-map.md
source-sha256: ba6c2952645753d7
translated-at: 2026-10-07
---

# 05 Region map: what the screen is made of once you open a conversation

- Applies to: any plugin author about to put an interface somewhere on the main screen, and anyone reviewing those interfaces.
- Force: contains RG / AD clauses, each marked.
- Machine-checkable: region ownership is semi-checkable (whether the slot ids in a manifest and in code belong to the column you claim); "did the product ever give this area a slot" is a static comparison against `data/slots.json`. Slot names and purposes come from the measured seat tree (collected 2026-10-01).

This page answers the question that comes first: **the patch of screen you are about to touch — does the product have a name for it?** If it does, the seat directory speaks. If it does not, section 5 speaks. Skipping this step costs you time on every later decision, because you can no longer tell "I picked the wrong seat" apart from "there is no seat here".

## 1. Three full-height tracks, no global top bar

[Official source] The main screen is three full-height tracks, and chrome — page header, tool rows, status rows — belongs to each track separately. There is no top bar spanning the window, and no window-level status bar.

That settles how every "where does this button go" question gets asked: **first which track, then which band inside that track.** Habits from other desktop apps lead you wrong here. Those have one window-level command bar that global actions go into; this one gives each track its own head.

| Track | Seat root | What it holds |
| --- | --- | --- |
| Left column | `sidebar` | Global navigation and the managed object list (workspaces, conversations) |
| Centre column | `main` → `main.conversation` | The selected panel; during a conversation, the conversation itself |
| Right column | `rightbar` | A track the centre makes room for, or nothing at all |

`main` is a `keyed` / root seat, described officially as "central panel selected by sidebar entry id"; `main.conversation` is the `single` / `session-maybe` conversation shell beneath it. The right column's official purpose is one sentence: **"The right column: a track the centre makes room for, or nothing."** The centre gives up space for it; without it, the centre is full width. That sentence grounds every conclusion in section 4.

<!-- demo: frame-columns | A region map of one screen: the product replica is built from measured sizes (left sidebar 280, centre column fluid, right column openable), and the pointer marks whichever part it sweeps over. The two bands beside the reading column are **a by-product of centring the text** and have no name in the official seat tree; the callouts sit outside the window — the real product draws none of these marks. -->

- `RG-MF-01`: New UI must declare which track and which band it belongs to; a declaration that disagrees with where it actually renders is a defect (the region-side wording of `FL-MF-01`). [Proposed here]

## 2. What the left column is made of

Six bands, top to bottom. The first three belong to the host; the last three include additive seats.

| Band | What you see | Official seat | Ownership |
| --- | --- | --- | --- |
| Brand row | Mark and product name | `sidebar.brand.mark`, `sidebar.brand.name` | Host `single`; only the mark survives collapse |
| Global panel entries | `插件`, `自动化任务` | `sidebar.panellist` | `list` / root, **additive**; the global panel icon list |
| Workspace and conversation list | Workspaces, conversations, search | `sidebar.workspaces` | Host `single`, officially covering "section header, search, the grouped/flat session list, and every workspace dialog". Not replaceable as a whole; contribute to its declared child seats |
| Hover actions and the "…" menu on a row | Buttons at a row's end, menu items | `sidebar.workspaces.session.row.action`, `sidebar.workspaces.session.menu.item` | Two `list` / root seats, **additive** |
| Foot: settings entry | `设置` | `sidebar.settings` | Host `single` |
| Foot: extension actions | Empty with no plugins | `sidebar.footer.action` | `list` / root, **additive**; officially "optional actions beside Settings" |

The desktop shell can also show an account entry, which occupies `settings.launcher` (`single` / root; it opens the shell's own settings panel). It is not an ordinary plugin menu item.

- `RG-MF-02`: [Official source] One list entry in `sidebar.footer.action` renders one control; a wrapper holding several buttons is forbidden. The shell owns the spacing and alignment of that band (same discipline as `FL-MF-09` and `SL-MF-13`).

## 3. What the centre column is made of

During a conversation the centre column holds four bands, plus one thing that is not a seat at all (section 5).

| Band | What it holds | Official seat | Scope |
| --- | --- | --- | --- |
| Resident navigation header | Global navigation to the left of the conversation title; present with no conversation selected | `conversation.header` → `conversation.header.leading` | `session-maybe` / `root` |
| Conversation header | Conversation title, title-adjacent actions, right-aligned utilities, far corner | `conversation.session.header` → `.actions` (title-adjacent), `.utilities` (right-aligned, ascending), `.corner` (far corner, **one control only**) | `session` |
| View area | Conversation views registered in `conversation.view`, **rendered one at a time** | `conversation.view` → `conversation.session` → `conversation.chat.node` | `session` |
| Composer card | Editor and its tool row | `conversation.composer.bar` → `conversation.input.left` / `.right` (two `list`), `.plan` / `.model` / `.activity` / `.permission` (`single`) | `session` / `session-maybe` |
| Insertion points around the card | Full-width entries above, ambient entries below, floating entries inside | `conversation.input.dock` (above), `conversation.composer.dock` (below), `conversation.input.overlay` (inside the card) | `session` |

Three official meanings that are easy to miss:

- `conversation.view` is officially "registered Conversation target Views, rendered one at a time" — **that is the mechanism behind the host's tab strip**, not three hard-coded pages. Whoever registers here adds one more switchable view.
- `conversation.composer` is `chain` / `session`, officially "selector-routed replacements for the current Session's resident composer". It is a routing takeover, not an additive entry point.
- `conversation.session.header.corner` is `single` / `session`, officially "the header's far-right corner, past the utilities' edge and into the header's own padding, **for one control**". It is already taken (the right column's toggle lives there), and `single` has no coexistence: a second control only shadows the first. Read section 4 of `spec/11-slot-seats.md` before touching it.

<!-- demo: session-tabs | The tab strip in the conversation header is a host-rendered conversation view, not three hard-coded pages; registering into conversation.view is that path. -->

## 4. What the right column is made of once open

The right column is **the fourth column of the page**, not a floating card over the centre column [Official source]. Its width and the way it appears are therefore declarative, unlike the floating layers inside the centre column.

| Part | Official seat | Note |
| --- | --- | --- |
| The track itself | `rightbar` | `single` / root; whether the track exists is decided by the root-scoped right column controller |
| Session content | `rightbar.session` | `single` / `session`, selected by that controller |
| Tab body | `sidebar.right.pane.tab` | `keyed` / session, dispatched by the id of the type in force for `tab.kind` |
| Tab title | `sidebar.right.pane.tab.title` | `keyed` / session, same key |
| Extra items at the end of a tab's menu | `sidebar.right.tab.menu.item` | `list` / session, **additive** |
| Directory actions on the files tab | `sidebar.right.tab.files.actions` | `list` / session, **additive** |
| Toolbar actions on the document preview | `sidebar.right.tab.document.actions` | `list` / session, **additive** |
| The two host actions on the start page | No dedicated seat | An empty-conversation right column shows a file tree and a new terminal, both host start-page content |
| Open / close switch | `conversation.session.header.corner` | Sits in the conversation header's far corner |

**Only the action slots inside a tab are additive.** `rightbar`, `rightbar.session` and `sidebar.right.pane.tab` are all `shadows-shipped-ui` replacement points: registering there **replaces** that piece of product UI, it does not sit beside it.

## 5. Areas the product gives no seat

This section is why this page exists. These four places have **no** corresponding seat in the published seat table. They are not "you have not found it yet"; there is nothing to find. When your plugin touches one of them, say so in these terms so the next author does not have to guess again.

### 5.1 The empty bands either side of the conversation column

The reading column is centred at a fixed width. Whatever the centre column has beyond that width is split evenly left and right. This empty band **has no name in the seat tree**; it is not a seat, it is a by-product of centring.

Plugins in the wild already use it as a resident information band (commonly called a rail), and they get there by borrowing another seat — most often `conversation.input.overlay`: render a floating entry inside the composer card, then absolute-position it into the centre column's right side. That is **a plugin's implementation choice**, not an area the product provides.

- `RG-MF-03`: A plugin that puts anything in this band must state in its README "the product has no seat here; this plugin borrows X", and describe what happens when X is changed by the product. [Proposed here]
- `RG-MF-04`: A borrowed implementation must not be described as an official area or as the host right column. The official purpose text of the borrowed seat is the yardstick — `conversation.input.overlay`, for instance, is "floating entries rendered inside the resident composer card". [Proposed here]
- `RG-AD-05`: This band disappears first as the window narrows, while the seat does not — the floating entry ends up overflowing or repositioning. Anything depending on it must exit cleanly at zero width rather than land on top of the text. [Proposed here]

Choosing between this band and the right column is a matter of structural difference, not visual taste: the right column sets its own width, makes the centre give way, and is never narrower than 300px; the band is the remainder after the text column and can be 0. The full criteria and counter-examples are in [15 What the centre column can hold](15-middle-column.md) and in the guide [Can the centre column be used on its own?](../guides/en/15-middle-column.md).

### 5.2 `conversation.input.overlay` used as a general panel

The official purpose is one sentence: "floating entries rendered inside the resident composer card" (`list` / `session`). The product never says it can be a centre-column panel, and never says it cannot.

The reality: **no plugin can mint a slot.** The product's `packages/client/AGENTS.md` states that rendering a slot you did not declare, or declaring one someone else declared, fails at load time, and a bare `slots.register` into an undeclared slot is a load-time error too. The empty band has no seat; a plugin that wants to put something there must borrow an existing `list`, and `conversation.input.overlay` is what the community currently borrows.

- `RG-MF-06`: A floating entry in `conversation.input.overlay` must not keep occupying interaction space while the composer card is invisible; it exits with the card. [Proposed here]
- `RG-RC-07`: Do not render the same interface in both `conversation.input.overlay` and `rightbar.session` to dodge the choice; the user sees the same information twice. [Proposed here]

### 5.3 A plugin's own settings window

`settings.section` is "one settings page per list entry", carried by the host settings window; `settings.general.item` is one preference row inside the General section. **There is no seat for a settings window owned by a plugin.** This is the product not covering it, not a gap. See "The boundary of a standalone plugin window" in [20-pattern-settings](../guides/en/20-pattern-settings.md).

### 5.4 The global top bar itself

Back to section 1: there is no global top bar. So any plan to "collect every plugin's global buttons into one window-level command bar" **has nowhere to live** in today's seat tree. `shell.overlay` is a frame-wide floating layer (`list` / root, above every column and outside their scroll containers) — a layer, not a bar. Building a resident bar out of it means inventing chrome that does not exist, and it will fight `conversation.header` for the same visual space.

### 5.5 Summary

| Place | Official seat | Status | Read this |
| --- | --- | --- | --- |
| Empty bands either side of the conversation column | None | Plugins borrow `conversation.input.overlay` and similar | Section 5.1, [guides/15](../guides/en/15-middle-column.md) |
| The borrowed seat itself (`conversation.input.overlay`) | Exists, but not for panels | Official purpose is a composer-card layer; using it as a panel is a plugin choice | Section 5.2, [guides/21](../guides/en/21-pattern-sidebar-panel.md) |
| A standalone plugin settings window entry | None | Put it in the host settings window via `settings.section` | [guides/20](../guides/en/20-pattern-settings.md) |
| A global top bar / window command bar | None | Does not exist; `shell.overlay` is a layer, not a bar | Section 5.4 |

- `RG-MF-08`: For all four rows above where the seat is "None", plugin documentation must state the conclusion "the product has no seat here" and name the seat it actually borrows. Missing that is a defect. [Proposed here]

## 6. How to use this map

1. Which track does your content belong to? If the answer is not unique, the design is not settled (`RG-MF-01`).
2. If it lands in the centre column: should it fill the column, become a tab in `conversation.view`, or stay a band inside the centre column? Read [15 What the centre column can hold](15-middle-column.md).
3. If it lands in the left or right column: find an additive child seat with `replaceRisk: none` in `data/slots.json`; do not replace a whole host block. Read [11 Slot directory and selection](11-slot-seats.md).
4. If none of the three tracks has a seat for it: match it against section 5 and record the conclusion in your plugin docs per `RG-MF-08`.
5. If it genuinely spans tracks and covers the screen: only `shell.overlay`, with an explicit order.

## 7. Sources

- `data/slots.json` (the `name` / `kind` / `scope` / `purpose` text of all 90 seats; collected 2026-10-01) `[Runtime measurement]`
- `data/raw/slot-tree-2026-10-01.json` (raw seat tree) `[Runtime measurement]`
- `docs/reference/chrome.json`, `docs/reference/clean-capture/19-rightbar-empty.png` (the right column's start page as captured) `[Runtime measurement]`
- `packages/client/AGENTS.md`: slot declaration and contribution discipline ("rendering a slot you didn't declare, or declaring one someone else declared, fails at load") `[Official source]`
- `docs/subsystems/slots.md`: seat cardinality, scope and extension rules `[Official source]`
- `spec/10-frame-layout.md`, `spec/11-slot-seats.md`, `spec/80-conflicts.md`: region duties, seat discipline, conflict adjudication
