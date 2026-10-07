---
source: components/controls/Button/README.md
source-sha256: 429b8ff7f97d88ae
translated-at: 2026-10-07
---
# Button

Click it once and something happens. Save, send, delete, retry — every place in the interface where you finish a step and move on, this is the control.

The highlighted "Send" in the bottom-right corner is one. The "Cancel" and "OK" at the foot of a dialog are one. So is the row of unremarkable icons on a toolbar.

## When to use it

- Trigger an action: submit, save, delete, open a menu, retry.
- One action matters more than the ones beside it, and users need to see that at a glance.
- A toolbar lines up a set of actions, and different weights have to separate the primary one from the rest.

## When not to use it

- You only want to jump to another page. That is a link's job: a button means "run it", not "go somewhere".
- Turn a setting on or off. That is a switch.
- Pick one option out of a set. A button does not say which one is selected — use a pill or a segmented control instead.
- Mark a state. That is a tag, and a tag does not take a click.
- The action cannot happen yet. Gray the button out, do not drop it to a secondary style — users cannot tell "not available" from "not important".

## How to use it well

**Keep one heaviest button per screen.** When highlights cover the screen, users spend their time comparing them to find the main path. One or two per view is enough, and the most important one gets the heaviest style.

**Do not rank buttons by size.** Two same-sized buttons side by side read as a set of equal choices; one big next to one small looks misaligned. To bring the preferred one forward, change the style, not the size.

**A label has to read on its own.** "Save" and "Delete this conversation" both work; use "OK" as little as you can — away from its dialog, there is no telling what it confirms. An icon button needs a description a screen reader can speak, or screen reader users hear nothing at all.

**A button has to look pressed.** With no reaction to a press, users wonder whether the click landed, and then press again and again.

**Buttons too close together get the wrong click.** Leave enough of a gap between two buttons, most of all on touch devices. Small buttons sitting in a row need room against the content beside them too.

**A button that cannot work has to look that way.** Grayed out it still holds its place, so users know it will be clickable later; hiding it makes the interface jump.

| Variant | When to use it |
| --- | --- |
| Solid emphasis | The single most important action on this screen: save, confirm, send |
| No fill | The default style. Secondary actions, text buttons in a toolbar |
| Outlined | Needs to sit a step below a solid button, such as "Cancel" in a dialog |
| Translucent fill | Toolbars floating above content |

| Size | When to use it |
| --- | --- |
| Standard | Regular pages, dialog footers |
| Compact | Dense list rows, small actions in a card corner |

Do not mix the two sizes on one screen unless they really do belong to two structural levels.

Implementation details are in SPEC.md.
