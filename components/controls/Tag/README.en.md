---
source: components/controls/Tag/README.md
source-sha256: e1ae450e5dc71503
translated-at: 2026-10-07
---
# Tag

The small print on a plugin detail page — version number, licence, "Enabled" — are tags. So is the little red pill at the end of a table row that reads "Build failed".

## When to use it

- To add a scrap of metadata to a list item, card or table row: version, size, runtime.
- To pin a status on something: shipped, queued, the last run failed.
- In a group of tags of the same kind, to mark the selected one with the heaviest tone.

## When not to use it

- You want it clickable: use a pill instead. A tag is read-only text — clicking it does nothing, and it has no keyboard stop.
- You are expressing on and off: use a switch instead. A tag says "this is how it is", not "you can change this".
- It has to carry an action (delete, retry, export): use a button instead. Hanging a click handler on a tag makes a fake button that the keyboard cannot reach.
- You need a whole sentence: a tag is a single-line pill that does not wrap, so long copy stretches the line it sits in. Cut the text off yourself, or use plain text.
- You want colour alone to do the talking: it cannot. Green and red look like one colour to a minority of users, so the copy has to say "Enabled" or "Build failed".

| Situation | Which look to use |
| --- | --- |
| Mark the selected one in a group | The heaviest tone |
| A neutral fact, no good or bad | Platform-grey fill |
| So secondary it can sit in the background | Text only, no fill |
| Nothing has changed, you just want a default | Thin outline |
| It is running fine | Green |
| A grouping only, no good or bad | Blue |
| Worth a glance, but nothing has gone wrong | Amber |
| Something has gone wrong | Red |

## How to get it right

**The copy has to make the point before the colour does.** A tag has only so much room, and colour is just the accelerator — the word is what people actually read. "Enabled", "Build failed" and "Pending" each stand on their own; write "Status" on its own and no colour will save it.

**Do not pile up too many in one row.** A row of red, yellow and green packed together makes users start ranking the colours, and the one status you meant to communicate drowns it out. Drop the supporting ones to the no-fill look, or put them in the body copy.

**One meaning gets one colour across the whole interface.** Use amber for "Pending" here and amber for "Archived" on another page, and users will stop trusting what the colours say — then stop reading them at all.

**Do not put a tag inside a clickable row and expect it to answer on its own.** A tag is text, and focus belongs to the row around it. Clicking the tag should do the same thing as clicking anywhere else in that row.

**Looking at them for a long time gets tiring.** The two low-contrast looks are for supporting information, not for states that matter; give a state that matters one of the higher-contrast looks so screen-reader and low-vision users can tell it apart.

Implementation details are in SPEC.md.
