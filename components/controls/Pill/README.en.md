---
source: components/controls/Pill/README.md
source-sha256: df1a88e352d2b38e
translated-at: 2026-10-05
---
# Pill

Open a data panel and the row along the top reads "Today / Last 7 days / Last 30 days" — click a range and the chart switches to it. That row of small pills is this control. The "All / Unread" row at the top of the conversation list is the same thing.

## When to use it

- Picking one of a set of mutually exclusive filters: a time range, a status category, this conversation only.
- A short state you can switch by clicking, such as flipping between "In progress / Done".
- Fitting a whole row of choices into one screen, where each option is only two or three characters.

## When not to use it

- A click has to make something happen (save, delete, retry): use a button instead. A pill says which one is selected; it does not run an action.
- Marking a single state that cannot be clicked: use a tag instead. Add a click to a static pill and users will assume everything is clickable.
- On and off: use a switch instead. A switch is clearly on or off; a pill says "this is the one picked out of a set".
- Selecting several items in the same group at once: a pill expresses one selected item at a time and cannot handle a multi-select case, so use a group of checkboxes instead.
- Using a pill's colour to say "success / failure": that is the tag's job; a pill's selected colour only says it is selected, not that it is good or bad.

| Situation | Which one to use |
| --- | --- |
| One click runs one action | button |
| Picking one of a set of mutually exclusive options, with the interface changing the moment you pick | pill |
| Marking a state that cannot be clicked | tag |
| On and off | switch |

## How to use it well

**Selection cannot ride on colour alone.** The selected state swaps the background colour and draws an inset stroke around it, so it still reads as "this one is selected" in both light and dark themes. Switch the interface to greyscale and check once more — a selected state that differs only in lightness is unreadable for users with colour vision deficiency.

**Let it speak for itself.** "All" and "Unread" can be understood on their own; "More" cannot, once it sits in a filter row. When a row holds four or five pills, users scan the words, not the positions.

**A clickable pill that looks like an unclickable one will cause trouble.** Once you decide this row of pills is clickable, make the whole row clickable; slip one in that does not respond and users will click two or three times before they catch on.

**Do not cram a long sentence into a pill.** Pills are deliberately smaller and quieter than buttons, and a long label stretches the whole row sideways. Past four or five characters, switch to another control, or move the long item into a menu.

**Keyboard users need to see where they are.** A clickable pill is a real button, so give it a visible focus ring when Tab reaches it; without one, keyboard users lose all sense of position in the row.

Implementation details are in SPEC.md.
