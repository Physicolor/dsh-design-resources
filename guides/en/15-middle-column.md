---
source: guides/15-middle-column.md
source-sha256: c473566ffd235660
translated-at: 2026-10-07
---
# Can the centre column be used on its own?

> Decide whether a piece of content should fill the centre column, take a conversation tab, or stay a band inside the centre column — and why it should not end up in the right column instead.

## What this page gets you

- Name the three uses of the centre column, and say whether the user can still see the conversation text under each one.
- Put a concrete feature into the right level with a decision order, instead of picking the seat whose name looks closest.
- Recognise how an interface in the wrong level breaks, and which level to move it to.
- Answer "centre column or right column" with five measurable differences, not visual taste.
- Explain why a file tree and a terminal do not belong in the centre column.

## The answer first: the centre column has three uses

You have written a plugin panel and it has to go in the centre column. The next question is how it relates to the conversation text, because the centre column is not one single spot.

- **Fill it**: a left-sidebar entry icon opens your panel as a full page in the centre column. The user leaves the current conversation to see it.
- **Take a tab**: the conversation / trajectory / context strip in the conversation header is extensible. Once you are in it, one view renders at a time, so the user cannot see the text right now.
- **Stay inside it**: a band above, below or inside the composer card. It shares the screen with the text and follows the current turn.

These are not small, medium and large; they are three relationships. Picking the wrong one does not cost you looks, it costs you the feature.

**Make something a tab when the user needs to read it beside the text, and the user ends up switching back and forth.** That is not a style matter: the page renders one view at a time, so the user physically cannot see both.

**Push a workbench unrelated to any conversation into those three bands, and it disappears the moment the user switches conversation.** Everything in the centre column follows the current conversation; that is decided by scope, not by implementation.

## Which level your content belongs to

Ask in order; the first "yes" is the answer.

1. **Does it hold up outside a conversation, and is the user willing to leave the current conversation for it?** Fill the column: register a `main` panel and put an entry icon in the left sidebar's `sidebar.panellist`. Plugin lists, report pages and configuration centres are this kind.
2. **Is it another view of the same conversation, mutually exclusive with the text?** Take a tab: register in `conversation.view`. Trajectory, context, review and export preview are this kind.
3. **Does it need to be seen beside the text, and change with the current turn or input?** Stay inside: permanent content goes in `conversation.input.dock` (above the composer card) or `conversation.composer.dock` (below it); only transient UI — completion, dropdowns, notices — goes in `conversation.input.overlay`.
4. **Must it stay reachable always, or persist across conversations?** It is not centre-column material. It goes in the right column.
5. **Is it really one preference, or a set of settings pages?** Go to [Settings page patterns](20-pattern-settings.md).
6. **None of the above**: it does not belong on this screen.

Question 4 is the one people get wrong most often; the next section is about it.

## Centre column or right column: five differences you can measure

"Which looks better" cannot answer this. These five can be measured, and all five come from official data and official source.

| Question | The band inside the centre column | The right column |
| --- | --- | --- |
| What is it | The slack left over once the text column is centred | The fourth column of the page |
| Who sets the width | A derived remainder, possibly 0 | It sets its own, never narrower than 300px |
| Who yields | The product never ordered it; it vanishes when the text hits its floor | The right column shrinks first, then loses its track, and only then does the centre give way |
| How several coexist | Several fixed layers in one spot, no tabs | One tab each |
| How long it lives | Scrolls with the conversation | One dock face per conversation, and it can be pinned |

Two criteria follow, and these two are enough to remember:

- **Anything that must stay reachable and must not vanish as the window narrows goes in the right column.** The centre-column band goes first.
- **Anything that must persist across conversations, or pin another conversation, goes in the right column.** Everything in the centre column follows the current one.

The width point deserves its own line: the right column has a 300px floor, the centre-column band has no floor. That is why something important placed in the band can suddenly become unreachable in a narrow window.

## Why a file tree and a terminal do not go here

They are the two things most often pushed into the empty band on the right of the centre column. Both are wrong, and for different reasons.

- **A file tree needs its own scale of scrolling and expandable hierarchy.** The user stares at it and clicks around. It fails the yield test: the band disappears first as the window narrows, and a file tree can neither disappear nor shrink to 0.
- **A terminal must survive a conversation switch.** It fails the lifecycle test: everything in the centre column follows the current conversation.

They are not without a place; **their place is the right column**. A clean profile's empty-conversation right column already offers workspace files and a new terminal as host actions, and the right column also reserves in-tab action slots for the file tree and the document preview. Looking for a centre-column spot for them is solving a problem that does not exist.

## Why the edges come apart during open and close

The empty band folds away. Open, it takes a slice of the centre column and the text yields; closed, that slice goes back. It looks like two transitions and done, and it is not.

**The reserving side and the track must read the same duration and easing.** If the reserving side runs 200ms while the track's own transition runs 150ms, the two are at different points of the push, and the user sees the edge detach and the content jump as it closes. Lift duration and curve into one shared custom property and reference it from both; never hard-code a value on one side.

Where an official control ships its own transition, keep the official value rather than overriding it for consistency.

## A real example: the session statistics band

`dsh-widgets` puts its session statistics band in the empty band on the right of the centre column, borrowing `conversation.input.overlay`. By the order above it picked the right level: the statistics change with the conversation, they need to be seen beside the text, and their absence breaks nothing in the main flow — all three fit "stay inside it".

It also shows the price of borrowing: that empty band has no official seat, so whether the band appears at all depends on how the borrowed seat is treated in the next release. The way to borrow, how to declare it, and what the fallback has to do are in [Places the product gives no seat](31-unofficial-regions.md). [Plugin example]

## Check before you ship

| Yes / no | Check | Clause |
| --- | --- | --- |
|  | The interface declares which level it occupies, and that matches where it actually renders | `RG-MF-01` |
|  | A panel that fills the column has a matching left-sidebar entry and does not depend on the current conversation | `RG-MF-10`, `RG-MF-11` |
|  | A view registered in `conversation.view` makes no claim to share the screen with the text | `RG-MF-13` |
|  | Permanent content is not in `conversation.input.overlay` | `RG-MF-14` |
|  | A borrowed band exits at zero width and never narrows the text | `RG-MF-15`, `RG-AD-05` |
|  | Anything that must stay reachable or persist across conversations is in the right column | `RG-MF-16`, `RG-MF-17` |
|  | The reserving side and the track reference the same duration and easing variables | `RG-MF-18` |

The level definitions, where the five structural differences come from, and the missing-evidence items are in [What the centre column can hold](../spec/15-middle-column.md); region-to-seat mapping is in the [Region map](../spec/05-region-map.md).

## Sources

- `data/slots.json`: official purpose text for `main`, `conversation.view`, `conversation.input.dock`, `conversation.composer.dock`, `conversation.input.overlay`, `rightbar`, `sidebar.panellist` (collected 2026-10-01).
- `packages/client/ui-frame/src/client/columns*`: right column ratio, floor and yielding order.
- `packages/client/ui-conversation/src/client/chat/ChatView.module.css`: the text column splits its leftover space evenly.
- `docs/reference/clean-capture-2026-10-05/19-rightbar-empty.png`: the two host actions on the right column's start page.
- `dsh-widgets` client source: which seat its statistics band borrows (plugin source, not native DSH UI).
