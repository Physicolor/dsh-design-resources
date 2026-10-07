---
source: components/controls/SegmentedControl/README.md
source-sha256: 8695e27e1b4b8378
translated-at: 2026-10-07
---
# SegmentedControl

> The product does not ship this component. What follows is this repository's implementation advice for plugin authors — it works, and its values are anchored one by one to existing official selectors, but the product has no such interface.

The "List / Grid" toggle in the top-right corner of a document list; pick one and the layout changes at once. The "Day / Week / Month" strip above a chart is the same thing. A few short options sit side by side, and the current segment is filled in.

## When to use it

- There are only a few options and you want all of them visible at once: view switching, time ranges, alignment, units.
- There are too few options to be worth a dropdown menu, and picking one takes effect at once with no confirmation.
- You need to say "this is the one currently selected" on a single row, and a lone pill is too light to carry the row of options.

## When not to use it

- There are too many options, or you cannot keep the label lengths under control: use a dropdown menu instead, or the horizontal space will get away from you.
- The options are not mutually exclusive and can be picked together: use a checkbox group instead.
- Each segment switches a whole content panel in and out: implement that with a tab strip yourself. A segmented control does not own a panel, and forcing it into that role makes a screen reader announce a panel that does not exist.
- Pressing it fires an action (save, delete): use a button instead, since a segmented control does not express "run".
- It only marks a state and cannot be pressed: use a tag instead.
- On and off: use a switch instead — building a switch out of a two-segment segmented control is over-engineering.
- A form may start with nothing selected: a segmented control always looks as if one segment is lit, so a radio group represents "not chosen yet" more honestly.

| Situation | Which one |
| --- | --- |
| A few mutually exclusive options, all visible at once | Segmented control |
| Many options, labels of unpredictable length | Dropdown menu |
| Several can be picked at the same time | Checkbox group |
| Each one maps to a block of content that gets swapped | Tab strip |
| Only two states, and you still need to say "already in effect" | Switch |
| One click runs one thing | Button |

## How to use it well

**Keep the segment count down.** Past five segments in a row, users start reading them one by one and switching gets slower. If you really have that many options, tuck them into a dropdown menu, or switch to a list that scrolls sideways.

**Keep the labels about the same length.** One segment of two characters next to one of eight characters makes the whole row look lopsided. When the labels will not line up, shorten the long one rather than widening that single segment.

**Do not mix two meanings inside one row.** When half the row switches views and half of it clears something, users only find out what they hit after pressing it. A segmented control says "pick one of this group", not "a row of buttons".

**The selected state cannot rest on colour alone.** Besides swapping the background colour, the selected segment carries an inset stroke, so the shape difference still shows in greyscale. If only the shade separates them, users with colour vision deficiency cannot tell which view is current.

**Keyboard navigation has to go the whole way.** When the arrow keys move between segments, focus and selection move together, and only the current segment is a Tab stop. Break that in the middle and keyboard users get stranded halfway.

For implementation details, see SPEC.md.
