---
source: components/layout/ToolbarRow/README.md
source-sha256: 337e8829ad5db882
translated-at: 2026-10-05
---
# ToolbarRow

> The product does not ship this component. What follows is this repository's implementation advice for plugin authors — it works, and every value is anchored to a selector the product already uses, but this interface does not exist in the product itself.

Halfway through a long document, the user wants to jump back to the top; at the end of a table, they want a different sort order. The buttons that do these small things to the content in front of them, lined up in a row along the content's edge — that is this component.

It is not a button itself, only a container: it keeps the controls inside it horizontally aligned and evenly spaced, and can stick to the top when needed.

## When to use it

- A row of side-by-side action buttons: filter, sort, format, refresh.
- A toolbar that has to stay pinned to the top, wherever the user scrolls.
- A floating toolbar above the content.
- Several things can be done around one piece of content, and they need to sit in one place.

## When not to use it

- A set of mutually exclusive options (today, this week, all). That is the semantics of a segmented control or a capsule; a toolbar does not express which one is selected.
- Only one action. Just place a button; do not wrap a container around it.
- A menu that opens level by level. That is a menu's job; a toolbar does not carry menu semantics.
- The full application bar across the top of the page (with a logo and a search box). That is a navigation bar, not a toolbar.
- So many actions that they do not fit on one line and the user has to read the labels to tell them apart. That means they belong in a "More" menu, not spread across a full row of icons.

## How to use it well

**Do not overcrowd one row.** A toolbar is there so the eye finds its target at a glance, not to be a display case of icons. Once there are so many that you have to read each label, move the low-frequency ones into a menu.

**It wraps, but do not count on it.** A narrower window folds it onto a second row and no button gets clipped; but wrapping breaks up the grouping you had, and once it comes to that, collapsing things yourself is better.

**Group by purpose, and pull the groups apart.** Buttons for one thing sit close together; leave a gap between different purposes. Space everything evenly and the user takes them all for one kind.

**When it floats, the fill and the text have to go together.** The floating form uses a dark, semi-transparent fill, so the text on it has to switch to the inverse colour, or in the light theme the two smear into one.

**A pinned bar has to make its edge clear.** Pinned to the top it covers what is underneath, so pair it with a divider or a fill; otherwise, as the user scrolls, there is no telling where the content starts.

**Do not give it the name of a toolbar.** Unless you really do implement moving between the buttons with the arrow keys, do not put that semantics on it — claiming what you cannot deliver is just misleading.

| What that row of things is | What to use |
| --- | --- |
| A set of side-by-side actions | This one |
| A set of mutually exclusive options | A segmented control or a capsule |
| Only one action | A single button |
| A menu that opens in levels | A menu |
| The full application bar at the top of the page | A navigation bar |

Implementation details are in SPEC.md.
