---
source: components/patterns/ListRowGroup/README.md
source-sha256: 299184a0101e0395
translated-at: 2026-10-05
---
# ListRowGroup

> The official product does not have this component. What follows is the implementation advice this repository prepared for plugin authors — it works, and every value is anchored to an official selector that already exists, but the product ships no such interface.

A group title on top, a run of neatly aligned rows below, and nothing between the rows but a hairline.

The two options under "Startup behaviour" in a settings page are it. The run of accounts under "Connected accounts" in the rightbar is it. A batch of files listed in a plugin overlay is it as well.

It is about how a long list gets read: once one screen holds many items, gather the ones of the same kind under a group title, and users scan the group titles instead of reading row by row to work out what the pile is.

## When to use it

- A run of items of the same kind belongs together: switch items, navigation items, file items, result items.
- The run needs a name ("Startup behaviour", "Connected accounts") so people know what kind of thing is grouped here.
- You want a hairline between rows rather than a gap, so a column of items reads as one whole.

## When not to use it

- The whole row is one action and needs a button's look and weight. Use a button instead: what this gives you is a list row, not a button's visual weight.
- Only one item in a group can be selected. This does not express "which one is selected"; use a pill or a switch instead.
- It is a floating dropdown menu. A menu has its own card look, its own shadow and up/down arrow-key navigation, none of which is here; inside an overlay, use a menu.
- There are only one or two rows, and they belong to the block above or below. Add a group title for two rows and the group title stands out more than the content.
- Several clickable things have to fit in one row. A clickable row and buttons inside it fight each other; leave the row as a non-clickable layout row and put actions on the right.
- A form row in a settings page, "a name on the left, a control on the right". That is the settings row's job; the rows here carry list and navigation semantics.

## How to use it well

**The grouping follows how users look for things, not how the data is stored.** "Startup behaviour" holds Restore and New, "Appearance" holds theme and font size — what is in users' heads is "which kind do I want to change", not which module these fields belong to in the code. Once a group holds more than six items, rethink the grouping; once there are many group titles, they start to overlap.

**The group title has to say what this kind of thing is.** Write "Startup behaviour", not "Options" or "Other". When someone using a screen reader jumps into this group, these few words are all they hear, so the title has to stand on its own.

**If the whole row is clickable, do not put a button inside it as well.** This is the most common mistake: once the row becomes one big button, the small buttons inside are hard to hit, and the keyboard gets stuck in the same row with no way out. Either the whole row is one action, or the row is layout only and the action sits on the right.

**Truncated text has to be fully recoverable.** When a file name or account name is cut off with an ellipsis, sighted users cannot read all of it while screen reader users can — the two sides end up with information that does not match. Let hover show it in full, or keep the distinguishing characters visible in the row.

**A divider does not express hierarchy.** Whether a line is there or not says nothing about what belongs to what; hierarchy comes from group titles and structure. Of the other two ways to draw the line, use only one: let adjacent rows carry the hairline automatically, or insert a standalone divider yourself — use both and you get a double line.

| Situation | How to set up the row | Why |
| --- | --- | --- |
| The whole row is one action | Make the whole row clickable | The target is big, and the keyboard stops there only once |
| An action hangs off the right of the row | Row not clickable, action on the right | So two click areas do not fight each other |
| Display only, nothing happens on click | Row not clickable | Clickable but doing nothing lies to users |

Implementation details are in SPEC.md.
