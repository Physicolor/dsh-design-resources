---
source: components/data-display/MiniBar/README.md
source-sha256: 12bb3641fb1c7bd0
translated-at: 2026-10-05
---
# MiniBar

> The official set has no such component. What follows is this repository's implementation advice for plugin authors — it works, and every value is anchored item by item to an existing official selector, but the product has no such interface.

A short horizontal track: how far it is filled shows how much has been taken up, and it fits in a list row without taking up room.

How much of the context window is used, how much disk is left, which step a task has reached — any of them can have a bar drawn beside it. It often works as a pair with a metric row: the metric row gives the name and the number, and the bar beside it turns that same number into a length.

It answers one question only: how far it is from full.

## When to use it

- Showing a proportion inside a list row: context usage, cache hits, disk usage, task progress.
- Pairing it with a metric row to give the same metric a visual quantity that can be compared at a glance.
- Making users see immediately that something is nearly full.

## When not to use it

- Comparing the lengths of several groups of data. That needs a bar chart sharing one baseline; here there is only one track.
- The number itself is already enough, and the proportion means nothing. The extra bar is noise.
- Users need to drag it to change the value. This is a read-only display element, not a slider.
- Users need to read an exact number. The percentage next to the bar is rounded, so put the exact value in the text beside it.
- Showing whether a switch is on or off. A length expresses a degree; a switch expresses two states, so use a switch or a status dot instead.

## How to use it well

**The text beside it is where the value is read.** The bar shows roughly how much is taken up; leave the exact value to the number beside it. Drawing only the bar and giving no number leaves users unable to cite it or copy it into a ticket.

**One track pairs with one number.** If you want users to compare two, stack them and share the same full value. When the two have different ranges, their lengths are not comparable — yet they look comparable, and that is the most misleading arrangement of all.

**The closer to full, the more it has to say.** When it nears the limit, change to another colour as a warning, and say it in the text as well. Users may not know what a changed colour means, and anyone who cannot make out the colour gets no signal at all.

**Give the bar a name.** On a bare track, someone using a screen reader hears only a progress value with no owner and cannot tell which metric it refers to.

**The range has to be able to degrade.** Clamp values above the limit to the limit, and when the denominator is zero, do not show it as "zero" — that means "cannot be worked out", and the text has to say so.

| Scenario | Use | Why |
| --- | --- | --- |
| One metric's share | MiniBar | Only one track, expressing a single value's proportion |
| Comparing the lengths of several groups of data | Bar chart | It needs a shared baseline |
| Only an exact value | Metric row | The percentage next to the bar is rounded |
| Letting users drag to adjust the value | Slider | This is a read-only display |

Implementation details are in SPEC.md.
