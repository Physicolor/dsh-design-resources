---
source: spec/15-middle-column.md
source-sha256: 7e1b842adc4302ea
translated-at: 2026-10-07
---

# 15 What the centre column can hold

- Applies to: plugin authors who want their interface to appear in the centre column (the conversation area).
- Force: contains RG / AD clauses, each marked.
- Machine-checkable: the occupancy level is semi-checkable (do the registered seat ids match the level you declare); "fill it or take a tab" can only be reviewed by a person.

This page answers a question that has gone unanswered: **I don't want to build just a floating layer — I want my interface to fill the centre column or to become one of those tabs. May I, and on what grounds?** The answer up front: the centre column has **three** uses, not two, and the right column is not "a bigger floating layer" — it is a track with a completely different structure.

## 1. The centre column has three uses

| Level | How you get in | How many are visible at once | Its relation to the current conversation |
| --- | --- | --- | --- |
| A Full-page panel | Register a `main` panel and put an entry icon in the left sidebar's `sidebar.panellist` | One | None; it exists without a conversation |
| B Conversation view tab | Register a conversation view in `conversation.view` | One (**only one is rendered at a time**) | Another way of looking at the same conversation |
| C Insertion point inside the centre column | `conversation.input.dock` / `conversation.composer.dock` / `conversation.input.overlay`, or borrowing a seat to land in the band beside the column | Visible at the same time as the text | Follows the current turn |

These are not three sizes of one thing; they are three different relationships. Picking the wrong level does not cost you looks — it costs you **the feature**: put something that must be read beside the text into level B, and the user has to keep switching tabs; put a workbench unrelated to any conversation into level C, and it vanishes the moment the user switches conversation.

## 2. Level A: a full-page panel

[Official source] `main` is a `keyed` / root seat, officially "central panel selected by sidebar entry id"; `sidebar.panellist` is a `list` / root seat, officially "global panel icons". The two seats are the two ends of one mechanism: **the entry icon and the centre-column panel it selects are tied together by the same entry id.**

[Runtime measurement] In a clean profile, clicking a global panel icon at the top of the left sidebar switches the centre column from a conversation to a full page. A conversation is not the only thing the centre column can show; it is one of several.

When to use it:

- Your interface is a **workbench of its own** — the plugin's list, configuration or report page — with no relation to which conversation the user is in.
- The user is willing to leave the current conversation for it and come back afterwards.

- `RG-MF-10`: Level A content must have an entry icon in `sidebar.panellist`, and the icon and the panel entry must share one id; registering a panel with no way back to it is a defect. [Proposed here]
- `RG-MF-11`: Level A must not depend on current-conversation state. It renders with no conversation selected at all (`main` is root scope). [Official source]

> No evidence: this repository has not captured a third-party plugin going all the way through "`sidebar.panellist` entry icon + `main` full-page panel". The seat semantics above come from the official purpose text and from official panels in a clean profile; check the third-party path against your own DSH version.

## 3. Level B: a conversation view tab

[Official source] `conversation.view` is a `list` / `session` seat, officially "registered Conversation target Views, **rendered one at a time**". The tab strip in the conversation header — `对话`, trajectory, context — is what it renders, not three hard-coded pages.

"Rendered one at a time" decides who belongs at level B: **it can only be another view of the same conversation.** The body text itself always occupies one of the slots, so the price of level B is that the user cannot see the text right now.

When to use it:

- The content is another presentation of the current conversation: trajectory, context, review, export preview.
- It is mutually exclusive with the conversation — while the user is looking at this, they did not need the text anyway.

- `RG-MF-12`: Level B content must be able to answer "is this the same data as the conversation text, seen another way?". If it cannot, keep it out of `conversation.view`. [Proposed here]
- `RG-MF-13`: A view registered in `conversation.view` must not assume it renders alongside the text; titles, empty states and scrolling have to hold up at full page width. [Proposed here]

> No evidence: the official purpose text says it is a registering `list` seat, but this repository has not measured whether "a third-party registration makes a tab chip appear in the conversation header". Until that is checked, do not write "register and a tab appears" in your README as a known fact.

## 4. Level C: insertion points and floating bands inside the centre column

Beyond the body text, the centre column has a set of insertion points that travel with the composer card. Their official purposes, one by one:

| Seat | Official purpose | What it suits |
| --- | --- | --- |
| `conversation.input.dock` | Full-width entries **above** the composer card | Attachments, parameters, presets — things this input will use |
| `conversation.composer.dock` | Ambient entries **below** the composer card | Status lines, usage summaries, readings that change with the conversation |
| `conversation.input.overlay` | Floating entries rendered **inside** the resident composer card | Transient UI: completion, dropdowns, notices |

And a fourth way: absolute-position a floating entry from `conversation.input.overlay` into the empty band on the right of the centre column. That band **has no official seat** (see section 5.1 of the [Region map](05-region-map.md)); this is a borrowed implementation.

When to use level C:

- The content must be **seen beside the text**; the user does not want to switch views.
- The content **changes with the current turn or the current input**, so a new conversation means a new set.
- The content can disappear at any moment without breaking the main flow.

- `RG-MF-14`: Persistent level C content must not go into `conversation.input.overlay`. Its official purpose is "floating entries rendered inside the resident composer card", and `FL-MF-04` in `spec/10-frame-layout.md` already limits it to transient UI. For something permanent, use `conversation.input.dock` or `conversation.composer.dock`. [Proposed here]
- `RG-MF-15`: A borrowed implementation in the empty band must exit at zero width (`RG-AD-05`) and must not narrow the text — the band is the remainder after the text column is centred, not a reservation. [Proposed here]

## 5. The line against the right column: five structural differences

"Centre or right column" cannot be answered by visual taste, only by measurable difference. All five come from official data and official source:

| Dimension | Level C inside the centre column | Right column |
| --- | --- | --- |
| What it is | A piece of slack inside the centre column: half the space left over once the text column is centred | **The fourth column of the page.** Officially: a track the centre makes room for, or nothing |
| Where its width comes from | Derived: `floor((centre width − text width) / 2) − gutter − inset`, **which can be 0** | Declarative: it sets its own width (default ratio 0.45, floor 300px, ceiling 0.7×) |
| Who yields to whom | No official yielding order, because it is not a competitor; it disappears as soon as the text hits its floor (640 / 680) | The official `columns` order says it plainly: the right column shrinks first, then loses its track, and only then may the centre drop below 400 |
| How several coexist | Several fixed layers in one list slot, with **no notion of tabs** | A tab ring: each plugin takes one tab |
| Lifecycle | Scrolls with the conversation; its height is the text's scroll area | One dock face per conversation, and switching conversation can pin the previous one |

<!-- demo: frame-rightbar | The two layouts, right column open and closed. The centre gives up width for it — that is the difference between "the fourth column" and "slack inside the centre column": click the right column and watch the centre yield. -->

Two criteria follow:

- `RG-MF-16`: Content that **must stay reachable and must not vanish as the window narrows** belongs in the right column, not at level C. [Proposed here]
- `RG-MF-17`: Content that must **persist across conversations, or be pinned across them**, belongs in the right column. Everything in the centre column follows the current conversation. [Proposed here]

## 6. The decision order

Ask in order; the first "yes" is the answer:

1. Does it hold up outside a conversation, and is the user willing to leave the current conversation for it? → **Level A** (`main` panel + `sidebar.panellist` entry).
2. Is it another view of the same conversation, mutually exclusive with the text? → **Level B** (`conversation.view`).
3. Does it need to be seen beside the text and change with the current turn or input? → **Level C** (`conversation.input.dock` / `conversation.composer.dock`; only transient UI goes in `conversation.input.overlay`).
4. Must it stay reachable always, or persist across conversations? → **Right column** (a tab in `rightbar.session`, `RG-MF-16` / `RG-MF-17`).
5. Is it really just one preference or a set of settings pages? → go to [Settings page patterns](../guides/en/20-pattern-settings.md).
6. None of the above → it does not belong on this screen.

## 7. Counter-examples: why a file tree and a terminal do not go in the centre column

A file tree and a terminal are the two things most often pushed into the empty band on the right of the centre column. Both are wrong, for different reasons:

- A **file tree** needs its own scale of scrolling and expandable hierarchy; the user stares at it and clicks around. It fails the yield test — the band disappears as the window narrows, and a file tree can neither disappear nor shrink to 0.
- A **terminal** must survive, and must not be taken away by a conversation switch. It fails the lifecycle test — everything in the centre column follows the current conversation.

They are not "without a place"; **their place is the right column**. [Runtime measurement] The start page of an empty-conversation right column already shows a file tree and a new terminal as host actions, and the right column also has in-tab action slots for the file tree and the document preview (`sidebar.right.tab.files.actions`, `sidebar.right.tab.document.actions`). Hunting for a centre-column spot for them is solving a problem that does not exist.

## 8. A hard constraint on the open/close motion

The empty band can be folded away: open, it takes a slice of the centre column and the text yields; closed, that slice goes back.

- `RG-MF-18`: **The reserving side and the track must read the same duration and easing variables.** If the reserving side animates on one duration while the track's own transition uses another, the two drift apart mid-push: the user sees the edge detach and the content jump. The fix is to lift duration and curve into one shared custom property and reference it from both, never hard-code a value on one side. [Proposed here]

Duration and curve steps are in [40 Motion](40-motion.md). **These numbers were frozen on 2026-10-06**: both expand and collapse take **300ms** (the "larger area entering: panels, sidebars, overlays" step), on the standard curve `cubic-bezier(0.40, 0, 0.20, 1)`. `MO-RC-03` requires entry and exit to be symmetrical, so "collapse a touch faster" does not hold here. If you do transition, express those two values as one set of custom properties on a shared ancestor of the placeholder or the track and reference it from both sides rather than writing it twice — that is exactly what `B14` rules on. Degrade per `MO-RC-09`: under reduced motion zero out displacement and scaling, keeping a single opacity switch.

<!-- demo: motion-panels | The same panels opening on different durations, side by side. When the reserving side and the track each use their own, that small difference is what you see. -->

## 9. Known deviations and missing evidence

| Item | Note | Marker |
| --- | --- | --- |
| Whether a third-party registration in `conversation.view` earns a tab chip automatically | The official purpose says it is a registering `list` rendered one at a time, but nothing published says "register and a tab appears"; not measured here | No evidence |
| A third party going all the way through "`sidebar.panellist` icon + `main` full-page panel" | The seat semantics and the official panels are both on record; the third-party path is not | No evidence |
| Symmetric use of the band on the left of the centre column | `RG-AD-05` and `RG-MF-15` hold for both sides, but only the right side has been observed in use here | No evidence |
| The reading column width | 748px comes from a custom property declared in the client stylesheet; the user can change that width in settings, and the slack and band width move with it | [Official source] + [Runtime measurement] |

## 10. Sources

- `data/slots.json`: the `kind` / `scope` / `purpose` text of `main`, `conversation.view`, `conversation.input.dock`, `conversation.composer.dock`, `conversation.input.overlay`, `rightbar`, `sidebar.panellist` and others [Runtime measurement]
- `docs/reference/clean-capture/19-rightbar-empty.png`, `docs/reference/clean-capture-2026-10-05/`: the right column start page and the left sidebar panel entries as captured [Runtime measurement]
- `packages/client/ui-conversation/src/client/skeleton/ConversationRoot.module.css`: reading column width and composer width declared as custom properties [Official source]
- `packages/client/ui-conversation/src/client/chat/ChatView.module.css`: the text column splits its leftover space evenly left and right [Official source]
- `packages/client/ui-frame/src/client/columns*`: right column ratio, floor and yielding order [Official source]
- `spec/05-region-map.md`, `spec/10-frame-layout.md`, `spec/11-slot-seats.md`, `spec/40-motion.md`
