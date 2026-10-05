---
source: components/layout/PanelHeader/README.md
source-sha256: 71667f51f3686585
translated-at: 2026-10-05
---
# PanelHeader

> The product does not ship this component. What follows is this repository's implementation advice for plugin authors — it works, and every value is anchored to a selector the product already uses, but this surface does not exist in the product itself.

A user opens the "Files" panel on the right, and it has to answer three things at a glance: what this is, what state it is in, and how to close it. The bar across the top of the panel is what takes care of that.

A title on the left, optionally followed by one line of description; the right side is reserved for actions; a thin line underneath separates it from the panel's content.

## When to use it

- The top title area of a closable panel, drawer, sidebar or overlay.
- You need actions such as "close, more, collapse" to the right of the title.
- You are splitting the panel into sections and need a thin divider that matches the ones elsewhere.
- You want one line of state description under the title: how many files changed, which environment this belongs to, when it last synced.

## When not to use it

- A dialog's title. Dialogs come with their own complete title spec — a larger font size and different spacing — so do not put this bar in its place.
- A page-level heading or navigation bar. That is another type scale; this bar fixes the panel-level font size.
- You only want a divider. Just draw a line; there is no need to wrap a header bar around it.
- A whole toolbar that has to stick to the top while the content scrolls. That is the toolbar row, and it supports pinning to the top.
- The title itself has to open or collapse. That is the job of a collapsible control; this header bar carries no interaction at all.

## How to use it well

**One panel, one bar.** Add a second bar of the same kind inside a panel and users will think a second panel has appeared. Use a lighter section header for internal divisions; do not reuse this bar.

**Keep the title to a noun phrase.** "Conversation settings" works; "click here to set up your conversation" does not. A title is a signpost, not a sentence.

**Order the actions on the right by importance.** The most-used one sits closest to the title; dangerous ones (delete, reset) go furthest right and stand apart from the rest. A row of icon buttons with no gap between them is easy for users to misclick.

**The description is a supplement, not body copy.** It uses a lighter colour and a smaller font size; put information there that is fine to skip, such as how many files have changed. Users can still finish the job without reading it.

**Truncate a long title; do not let it wrap.** The header bar has a fixed height, and a wrapped title pushes the row of actions on the right out of the way. Truncation is visual only — screen reader users still hear the full title.

**An icon-only action has to say what it is.** A cross or an ellipsis is silence to a screen reader; the name has to fill it in.

| Situation | Which one to use |
| --- | --- |
| Top of a panel, drawer or sidebar | This one |
| Top of a dialog | The title area the dialog already has |
| Top of a page | A page heading or navigation bar |
| Dividing a panel into sections | A section header |
| A row of actions that sticks while scrolling | The toolbar row |

See SPEC.md for implementation details.
