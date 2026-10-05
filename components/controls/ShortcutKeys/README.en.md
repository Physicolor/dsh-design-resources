---
source: components/controls/ShortcutKeys/README.md
source-sha256: efe58e4ae16dea96
translated-at: 2026-10-05
---
# ShortcutKeys

> You can see this in the product: the `Ctrl + Alt + N` at the end of the "New conversation" row in the left sidebar, the key at the end of a menu item, the little keys inside a tooltip. The geometry was read out of the product's client CSS module (`_keys_38b9q_1`), and all three variants have real values — see SPEC.

It is not a tag and it is not a button: **it tells you which key to press and does not respond to clicks itself**. The product marks the whole thing `aria-hidden` — to a screen reader a key is decoration; what actually needs to be announced is the `aria-keyshortcuts` on the button that triggers it.

## When to use it

- A button or menu item has a shortcut — put the key at the end of its row. Users will remember it that way.
- A tooltip explains that "pressing this key is faster" — use the `tooltip` variant.
- A set of keys has to appear as one unit in a crowded spot — use the `joined` variant.

## When not to use it

- **A shortcut that is not really implemented.** Writing `⌘K` when the key does nothing is worse than leaving it out.
- **Anywhere other than the end of a button row.** A key is an annotation, not body copy; with two or more sets in one row, readers will read the keys instead of what you asked them to do.
- **A fill on the `plain` variant.** That is what the `tooltip` variant looks like; `plain` is pure text, and a fill makes it read as a row of little buttons (this repository made that mistake early on and has been corrected against the captured values).
- **Using it as a tag.** To mark a state use a Tag; for something clickable use a Pill or a Button.

## How to use it well

**Keep it hidden most of the time.** At the end of a button row the product holds it at `opacity: 0` and only brings it out on hover or focus-visible — a key is there to speed up users who already know it, so it does not have to sit there competing for attention. Always on, it adds a speck of grey text to every row.

**Fade the label when space runs out; do not clip it.** What the product does is lay a `mask-image` over the button label, fading its last 16px, so the text gives way naturally as the key comes in.

**Write keys the way the platform does.** The product spells out key names like `Ctrl` / `Alt` rather than using symbols; do not show `⌘` in one part of the interface and `Ctrl` in another.

| Variant | What it looks like | Where it goes |
| --- | --- | --- |
| `plain` (default) | Pure text, 3px between keys, the `+` standing on its own | End of a button row, end of a menu item |
| `tooltip` | A light fill on each key, 11px | Inside a tooltip |
| `joined` | The whole set shares one fill | When a key combination has to be drawn as a single unit |

Implementation details are in SPEC.md.
