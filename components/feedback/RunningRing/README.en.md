---
source: components/feedback/RunningRing/README.md
source-sha256: 6e225c23198655d0
translated-at: 2026-10-05
---
# RunningRing

> You can see this in the product: when a conversation in the left sidebar is running, that little ring turning at the head of the row is it. The official primitives package does not ship this component (what the package offers for "in progress" is a different set of pixel-chasing squares), so the values were captured straight off the running interface — the real values are in SPEC.

A grey ring with a short arc running around it, stretching and shrinking as it goes, one lap in 1.5 seconds.

It says one thing: **this is still running, and there is no telling how long it will take**. Not "how much is done" (that is the progress bar's job), and not "it is finished" (that is the status dot).

## When to use it

- The state of a list row is "running": at the head of a conversation row, on the left of a task row.
- Somewhere the space is very small — 14px is enough to say one thing, without taking up a row and without needing any copy.
- The wait cannot be estimated: if it can be, switch to a progress bar.

## When not to use it

- You know how much is left. Use a progress bar. A spinner only answers "is it moving", never "how much longer"; as HIG puts it, when the duration is known, prefer a determinate progress indicator.
- An action that takes a few milliseconds. A flicker instead reads as a hang. Show it only once the wait is longer than about a second.
- Expressing "done / failed / warning". That is a static status dot (`StateDot`) or a tag; the ring vanishes when its spin finishes, and if it stops there, it only reads as "stuck".
- As a loading icon on a button. A button should carry its own loading state (the label turns into "Sending…", or the glyph inside the button changes) — do not hang a ring beside the button as well.
- Several of them on one screen. One "running" on a screen is a state; five on a screen is noise.

## How to use it well

**There has to be something readable beside it.** The ring itself is hidden from screen readers: use `label` to give it a visually hidden "in progress", or have the row it sits in spell out which job this is.

**Do not leave it parked as a full circle.** Under reduced motion it stops — but it comes to rest on the frame where a piece is still missing. Parked as a complete circle, it reads as "finished".

**Let the colour push it into the background.** The product uses the tertiary text colour. Do not dye it brand blue: blue turns it into something clickable, and it is not clickable.

**Leave the duration alone.** 1.5 seconds a lap plus 1.5 seconds of stretching and shrinking is the gear the product uses, recorded in `spec/40-motion.md`; change it to 0.8 seconds on a whim and two spinner speeds coexist across the interface, which reads at a glance as two different products.

| Situation | What to use |
| --- | --- |
| Running, duration cannot be estimated | RunningRing |
| Running, progress can be calculated | A progress bar |
| Done / failed / warning | A static status dot or a tag |
| A brief wait (< 1 second) | Nothing |

Implementation details are in SPEC.md.
