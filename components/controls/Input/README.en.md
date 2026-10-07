---
source: components/controls/Input/README.md
source-sha256: f4e5cfe8947037b6
translated-at: 2026-10-07
---
# Input

A magnifier and a thin outlined box inside a search field — that is this control. Renaming a conversation title, filling in a directory path, pasting a link: the same control does all of them.

## When to use it

- Single-line text entry: search, titles, paths, links.
- It sits in the same row as a small button or pill, and its height has to hold its own.
- What the user types is short enough to take in at a glance.

## When not to use it

- Write more than one line: use a textarea instead. The input's height is fixed, so multi-line content spills straight out.
- Pick one option out of a fixed set: use a pill or a dropdown — do not make users hand-type a word they could have picked.
- Just show a read-only value: use plain text or a tag. A greyed-out input makes people think it is editable.
- Let the user adjust a number: use a stepper instead — the input handles text only.
- Flag a mistake on the spot: this component has no error state, so the container around it has to put the error message below the input.

## How to use it well

**A placeholder alone is not a name.** Placeholder text disappears the moment the user starts typing, and it is not the input's name. Put a label beside it, or give the input a name of its own — otherwise screen reader users cannot tell what goes in this box.

**Focus has to be visible.** When users Tab into the field, changing the colour of the whole border is the simplest signal; stack an extra focus ring on top and the two rings' colours clash.

**A leading icon is decoration, not a name.** The magnifier only says "this is search". Screen readers do not read it, so the input's own name has to carry the meaning.

**Keep the two kinds of "cannot change" apart.** If the input is completely unusable, disable it — it drops out of the keyboard order. If it is only temporarily uneditable while users still need to read the content, make it read-only.

**Do not make it the shortest thing on the row.** Beside a button or a pill, a mismatched height makes the whole row look out of line; when they do not line up, fix the layout first rather than squashing the input.

Implementation details are in SPEC.md.
