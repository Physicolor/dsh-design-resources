---
source: components/layout/SidebarRow/README.md
source-sha256: da2a7a94ee1ae7c7
translated-at: 2026-10-07
---
# SidebarRow

> The official product does not have this component. What follows is the implementation advice this repository prepared for plugin authors — it works, and its values are anchored one by one to official selectors that already exist, but the product ships no such interface.

The left sidebar is lined with dozens of conversations. One glance has to be enough for a user to tell which one is theirs, which one is open, and which one still has unread messages — all of that in a single row, without the row reading as cramped.

It is a button whose whole row is clickable: an icon at the front, the title in the middle, and room on the right for a count, a shortcut hint, or a tick.

## When to use it

- Conversation, file and page list items in the sidebar.
- A list item needs a little state on its right: an unread count, an item count, a shortcut hint.
- A list that has to show which one is currently selected.
- A list where several rows get ticked at once (batch export, batch delete).

## When not to use it

- A menu item that pops out of a button. That menu brings its own keyboard navigation and submenus; do not build a second set.
- An ordinary link that only goes somewhere else. Use a link — a button loses built-in browser capabilities such as "open in a new tab".
- One row has to carry several layers — a title, a description, a tag. That structure is what a settings row is for; use a settings row.
- A row that only displays and cannot be clicked. A button that is always clickable and does nothing when clicked is a trap for keyboard users.
- The main job is "change a value". That is a settings row: it says "change", not "go somewhere".

## How to use it well

**One row, one thing.** An icon, a title, and at most one trailing element. Hang a count, a shortcut and a tick on the right at the same time and the user's eye jumps between three places.

**Truncate the title rather than letting it wrap.** One conversation name that wraps breaks the rhythm of the whole list; truncation cuts a few characters, but screen reader users still get the complete title.

**Pick one way to draw selection.** A trailing tick matches what menus do; a full-row background fill suits a list people scan. Mix the two in one list and users take them for two different states.

**Do not nest another checkbox inside a multi-select row.** The checkbox in the row only shows state — clicking anywhere in the row toggles it. Layering on a checkbox you can click on its own just leaves people unsure which one to click.

**A group of selectable rows needs a group name.** Without one, screen reader users hear a run of isolated buttons and do not know that they are one set of mutually exclusive choices.

**Disabled means really disabled.** Use the native disabled state rather than fading the colour — a faded row can still be clicked and still takes a Tab stop.

**The less you hang at the trailing edge, the better.** One count or one shortcut is enough. Fill the trailing edge with small text and no row stands out from the next, so scanning stalls.

| What the row has to do | What to use |
| --- | --- |
| Pick one of a group | This row |
| Tick several at once | This row, with checkboxes |
| Change a value in the row | A settings row |
| An item in a pop-up menu | A menu |
| Go somewhere else | A link |

Implementation details are in SPEC.md.
