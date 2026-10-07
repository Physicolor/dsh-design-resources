---
source: components/data-display/StateDot/README.md
source-sha256: 7bf4cec6a1aa5b8f
translated-at: 2026-10-07
---
# StateDot

A small dot that says "done, something went wrong, still running" with colour and shape.

It is the dot on the left of every row in a list of build results. It is the mark each task in a timeline carries. It is also the little moving square that sits beside a conversation title and means "still generating".

It is a marker, not a sentence — the text beside it has to finish the thought; the dot is there only to line up a column of states and make it quick to scan.

## When to use it

- Marking state on the left of a list row, a timeline or a step bar.
- The running state of a task, a conversation or a tool call: running, done, done with a warning, failed.
- You need the dots aligned vertically in one column, and you want the colour to follow the theme.

## When not to use it

- **On its own.** It is completely invisible to screen readers: when the screen shows a dot and no text, the user hears nothing at all. With no text to go beside it, use a tag, or a connection status indicator that carries text.
- Expressing a switch, or a clickable selected state. That is the job of a switch and a pill; a dot cannot be clicked.
- Expressing progress. A dot holds only a few discrete states and cannot say "half way"; use a MiniBar instead.
- Expressing a file type. That is the job of a file-type icon.
- Decorating a place that only ever holds one state. That is pure decoration — a style does the job, and there is no need to drag in a component.

## How to use it well

**There has to be text beside the dot.** It is an adjective at best; the row's text still has to finish the sentence: write "build failed" rather than leaving a lone red dot to be guessed at. It will not survive greyscale either — put the success and idle colours side by side and anyone reading colour alone cannot tell them apart. Put the outcome in the text, and let the dot line up the column and make it quick to scan.

**Only "still running" may keep moving.** The spinning square is the only state allowed continuous animation, because that is exactly what it expresses: "under way, no verdict yet". Do not animate the other states: something that sits still while claiming to be running makes users think it has got stuck.

**Do not count on a bigger dot for emphasis.** A larger size does not make it more noticeable; it only leaves it out of line with the text beside it. To emphasise something, set the text heavier, or use a tag instead.

**"Idle" is not a fourth outcome.** Its colour is deliberately lighter than the other three, meaning "nothing is happening here". If it turns up too often, this column has picked up things that should not be marked.

**When you put it at the head of a row, check for yourself that it lines up with the text.** Scaling up changes only the outer ring; the solid core inside follows in proportion, so the dot itself does not distort. Whether it lines up with the line height of the text on the same line, though, is a case the official source has never given beyond the default size — look at it in place before you decide.

| Scenario | Use | Why |
| --- | --- | --- |
| The state of a column of tasks | StateDot | The states are a few discrete ones, and a dot takes the least room |
| A switch on or off | Switch | It has to be clickable and show its current state |
| Half way through | MiniBar | Progress is continuous; a dot has only a few steps |
| A static category mark | Tag | A tag carries its own text; a dot does not |

Implementation details are in SPEC.md.
