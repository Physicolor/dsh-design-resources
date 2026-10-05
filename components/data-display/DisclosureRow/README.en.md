---
source: components/data-display/DisclosureRow/README.md
source-sha256: e8e49b504dccffa2
translated-at: 2026-10-05
---
# DisclosureRow

One line of title text: click it and the detail below opens up, click again and it closes.

A file-change summary reads "3 files modified", and to find out which 3 you have to open this row. The "Advanced options" row in a settings page is the same thing. After a tool call finishes and you want to see what arguments it actually passed, it is this again.

Its place never moves: content that lives elsewhere shows a title line here first, and users pull it open themselves when they want to see it.

## When to use it

- The content is **supplementary**, so keep it collapsed and out of the way: per-file detail, raw arguments, advanced options, history.
- Many items of the same kind fill one screen, and spreading them all out drowns the point: let users pick which ones to look at.
- One row has to say two things at once: there is something to look at here, and whether it is currently open or closed.

## When not to use it

- Users have to see this content every time. Collapsed by default, it hides a road they always take inside a drawer, and they will not find it.
- What expands is the main line, not a supplement. Write it as a heading plus body copy instead, and do not make users click one more time.
- Clicking it is really meant to go elsewhere. That is a link's job: expanding is "see more right here", navigating is "go somewhere else".
- Only one item in a group can be shown at a time. Expandable rows can be open several at once; for mutually exclusive switching, use a tag or a segmented control instead.
- You only want to save space. When the window narrows, the right move is to tuck the entry point into a menu, not to fold the entry point away.
- You want to fit more than "icon + title + one short supplement" into one row. It is one row tall and cannot hold it.

## How to use it well

**This row is short.** It is shorter than a regular button, only as tall as a single line of text. Collapsed, the default is that only the small icon on the left responds to a click, so a finger has to aim. On a touch-first interface, make the whole row clickable.

**The title has to say what opens up.** Write "Files modified", not "Details" or "More". Someone using a screen reader hears only this row and "collapsed" / "expanded"; all the surrounding context is gone.

**Collapsed, the row can carry the current value.** For example, hang a "3" to the right of the title. It disappears once the row is open — the detail below already has it, so there is no need to repeat it.

**On hover the icon turns into an arrow.** With the row collapsed, move the mouse over the whole row and the small icon fades out while an arrow fades in, which amounts to saying "you can click here". This is a hint for the mouse only, so do not let it be the only clue: keyboard and touch users never see it.

**Several rows can be open at once.** It is not mutually exclusive the way tabs are. If what you need is exactly "one at a time", this is not the component for it.

| Situation | Which part takes the click | Why |
| --- | --- | --- |
| Mouse-first, rows packed tightly | Only the small icon on the left | Cleanest visually, and nothing else in the row gets clicked by accident |
| Touch, with rows sitting close together | The whole row | A finger easily misses a small icon |
| The row already carries other clickable elements | Only the icon | So that expanding is not confused with the other things the row does |

One trade-off deserves saying out loud: with only the icon clickable, that icon's clickable area is smaller than a regular button's target, and it only just works because an extra invisible ring of hit area extends it further. The closer the rows sit, the more accidental clicks. When you cannot decide, make the whole row clickable.

Implementation details are in SPEC.md.
