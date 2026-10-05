---
source: components/layout/SettingsRow/README.md
source-sha256: 136c93ac3b9802cc
translated-at: 2026-10-05
---
# SettingsRow

> The product does not ship this component. What follows is this repository's implementation advice for plugin authors — it works, and every value is anchored, one by one, to selectors the product already uses, but the product itself ships no such interface.

A user opens settings and wants to switch off "Auto-save". They have to find that one row, work out what it does, then find the switch on the right — three things that all have to happen in the same row.

The title sits on the left, with an optional line of explanation under it; the control sits on the right; a hairline separates one row from the next. Clicking the title text activates the control as well.

## When to use it

- A row in a settings panel where one switch governs one thing.
- A setting that needs a title plus a line of explanation.
- A form row with the label on one side and an input or select on the other.
- A group of related settings stacked in a column, where the rows need a visible divider between them.

## When not to use it

- A selectable row in a sidebar or navigation. That is a sidebar row: it is a button, and it carries selection semantics.
- A multi-field form with the label above and the input below. That is a regular form layout; this row puts the label and the control side by side.
- Several unrelated controls crammed into one row. That means there are two things here; split them into two rows.
- Clicking the whole row means "jump somewhere else". That is the sidebar row's job; a settings row means "change one value".
- The user needs to enter a long passage of text. The width left for the control on the right is limited, and wrapped long text makes the row very tall.

## How to use it well

**Put one control per row.** The row's title is a label, and it only associates with the first control inside the row. Add a second and that one has no name — a screen reader user just hears an unlabelled switch.

**The title is a label, not another heading level.** It only needs to be a touch heavier than body text; whether the whole settings block gets a heading is decided outside this row.

**Use the explanation for supporting detail, never for what matters.** Its colour is lighter and its type smaller, and users will very likely skim past it. Anything they have to know before they act belongs in the title.

**Leave breathing room between the label and the control.** Put them too close together and rows with long titles blur into one another, so users cannot tell which phrase describes which control.

**Hovering has to show that the whole row is the target.** The whole row is clickable, so moving the pointer over it needs feedback; otherwise users think only the switch on the right can be clicked.

**A disabled setting has to say why.** Fading it out is not enough — users cannot tell whether they lack permission or a condition has not been met.

**Do not draw a line under the last row.** Dividers exist to group things; one extra at the end makes it look as though more content below has not been shown yet.

| What the row is for | Which one to use |
| --- | --- |
| Change a switch, or fill in a value | This row |
| Pick one row out of a group | A sidebar row |
| Jump somewhere else | A sidebar row or a link |
| A form with the label above the input | Regular form layout |
| Two unrelated things in one row | Split into two rows |

Implementation details are in SPEC.md.
