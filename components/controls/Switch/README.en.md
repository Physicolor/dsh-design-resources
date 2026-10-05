---
source: components/controls/Switch/README.md
source-sha256: c9c47a26a96e1d21
translated-at: 2026-10-05
---
# Switch

The "Auto-save" row in a settings panel — click it and the change is already live, no Save button to press afterwards. That little switch on the right that slides across is this control. Dark mode, experimental features, update on launch: the same control does all of them.

## When to use it

- A two-state setting that takes effect the moment it changes: auto-save, dark mode, experimental features.
- Users click it and expect it to be live already, with no second confirmation to press.
- One row says one thing, label on the left and switch on the right, so a glance tells users what it changes.

## When not to use it

- A form that only takes effect on Save or Submit: use a checkbox instead. A switch means "already live", and inside a form it reads as though the change has landed.
- Picking one of two mutually exclusive options (list or grid, light or dark): use a pill or a segmented control instead — that is a choice, not a toggle.
- A click that makes something happen (delete, retry, sync now): use a button instead.
- Showing a state that cannot be changed: use a tag or plain text — do not park a permanently greyed-out switch there.
- One switch governing a whole group of settings: the hierarchy is muddled — either split it into several switches or express it another way.

| Situation | Which one to use |
| --- | --- |
| Takes effect the moment it changes | Switch |
| Only takes effect on Save | Checkbox |
| Pick one of two mutually exclusive options | Pill or segmented control |
| Click runs an action | Button |
| A read-only state | Tag or text |

## How to use it well

**Write what it turns on beside it.** The switch itself carries no words, so the only way users learn its meaning is from the row to its left. Park one on its own and whoever clicks it is guessing.

**On and off cannot differ by colour alone.** The knob slides across and the track changes its fill colour — give both signals at once. Change colour only and users with colour vision deficiency see one switch in two shades.

**When the write takes time, say so before you lock it.** Users watch it flip the instant they click, and if it then fails and springs back on its own they will think the interface is broken. Locking it while the write runs, with a tooltip to explain, is far more honest than lighting up and going dark.

**Do not mix it with checkboxes.** When half a form is switches and half is checkboxes, users cannot tell which change takes effect sooner. One form, one meaning.

**Small as it is, the pointer still has to reach it.** Give the switch a hit area one size larger than it looks and leave a gap around it, so users do not land on the switch in the row next door.

Implementation details are in SPEC.md.
