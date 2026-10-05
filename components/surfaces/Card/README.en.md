---
source: components/surfaces/Card/README.md
source-sha256: 0eec880423c23bf2
translated-at: 2026-10-05
---
# Card

> The official codebase has no such component. What follows is this repository's implementation advice for plugin authors — it works, and its values are anchored one by one to selectors the official code already uses, but the product has no such interface.

Conversation stats, plugin details, an empty state description — any block of information that stands on its own on the page is one of these. The little card in the settings page that reads "context usage", with how much has been used marked beside it, is the most typical use.

A sheet of paper stuck onto the page: a faint border all round, a fill one step lighter or darker than the background. It does not float, and it does not say "click me".

## What values make up a card

A card is not some vague "rounded box with a border" — it is a combination of three fixed values, all three taken from the product's own theme layer:

| Part | Value | Source |
| --- | --- | --- |
| Corner radius | 20px (`--dsw-radius-xl`) | The product has six corner-radius tiers: 4 / 8 / 12 / 16 / 20 / 28. The cards in the settings page use 20, input fields and menus use 16, and the composer uses 28. Pick one of the tiers; do not invent a seventh. |
| Stroke | 0.5px `--dsw-alias-settings-card-stroke` | One extremely thin solid line. Every container that sits flush in the product is divided by this line, not by a shadow. |
| Fill | `--dsw-alias-settings-card-fill` | The fill for the same layer, with one set of values for light and one for dark. |

**Floating things do not use this set.** Menus, popovers and panels that fill the screen take the other tier: a corner radius of 16 or 28, plus `backdrop-filter`, plus the chain of shadows in `--dsw-elevation-prominent`. The product's rule is a stroke or a shadow, never both — flush containers use the thin line, floating ones use the shadow. Put both on the same element and it reads as two systems forced together.

## When to use it

- A set of related information that should read as one thing: a stats summary, a settings group, plugin details, an empty state description.
- Several blocks sit side by side on the page and the reader has to see at a glance where each one ends.
- The structure is fixed — a title, one line of description, body, one action at the bottom — and you do not want to re-tune the spacing everywhere.
- You want a hierarchy step between the title and the body that reads at a glance.

## When not to use it

- It has to float above the page. That is a dialog, a drawer or a menu; they use a shadow to say "I am floating", while a card sits flush with only a thin border.
- A long run of items of the same kind. Use a row plus a thin divider instead: a row of cards reads as a pile of boxes side by side, not as a list you can read down.
- The whole block has to be clickable. A card itself does not mean "click me". If you want the whole block to link somewhere, put the content inside a link or a button, or put the action at the bottom of the card.
- You only want a background fill. Give the container a fill directly; wrapping it in a card only adds a border for nothing.
- A card inside a card. Two layers of border make the spacing read wrong; use a small heading plus whitespace inside instead.
- You only want to separate two sections. That is the job of a section header.

## How to use it well

**Say what the block is in the title, not "details".** Users scan headings on a long page, and a vague heading means the card may as well not be there.

**The description is a supplement, not body copy.** The description uses a lighter colour and a smaller font size, and it is the line most easily skipped. Tucking your only status message in there means only people who look closely will see it.

**No content, no card.** An empty box with nothing but a border is worse than putting nothing there at all — users will think the content failed to load.

**One card, one thing.** Related does not mean identical. Give two unrelated summaries a card each, and the reader knows which to read first.

**Cards side by side: align the title lengths.** Uneven lengths make cards in the same row look different heights, and readers take them for two separate groups.

**Keep only the heaviest action at the bottom.** The bottom of a card is where things wrap up; two buttons of equal weight make users stop and compare.

| Situation | How to express it at this layer |
| --- | --- |
| A self-contained block of information on the page | Use a card |
| Floating above the page and covering content | Use a dialog, a drawer or a menu |
| A long run of items of the same kind | Use a row plus a thin divider |
| You only want a background fill | Use a fill directly |
| A group that expands and collapses | Use a collapsible row |

See SPEC.md for implementation details.
