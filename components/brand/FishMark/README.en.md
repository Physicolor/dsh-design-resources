---
source: components/brand/FishMark/README.md
source-sha256: b90456af2ec722d6
translated-at: 2026-10-05
---
# FishMark

The fish on the brand bar. A splash screen, an about page, a loading state — wherever there is room for one shape and no more, it speaks for the product: "This is DeepSeek."

It has one layer of colour and takes the colour of the text beside it — you do not need a separate version for each of the light and dark themes.

## When to use it

- There is room for one shape and nothing else: an avatar slot, the brand slot on a toolbar, the middle of a splash screen.
- It has to be recognisable as DeepSeek at a glance, without spelling the name out.
- You want the shape to follow the text colour: recolouring the wrapper is all it takes.
- Paired with the wordmark, the fish carries the shape and the wordmark carries the readable name.

## When not to use it

- The user has to read the brand name out. Use the wordmark, or write the name as text; the fish contains no readable characters.
- You want one on every page and in every panel corner. The user already knows what they have open — that spot is better spent on useful information.
- You just want a decorative block. Use a skeleton screen or an ordinary icon — the fish carries too much brand weight, and dropping it in changes how the whole area reads.
- You want several colours, a gradient, a duotone. It has one layer of colour and cannot do any of that.
- It is going into a button as a functional icon. You have to draw the shape inside a button yourself, and it still needs a label.
- You are advertising the brand in something that flashes past. That moment is too short to carry anything; wait until the user actually starts using it.

## How to use it well

**Once is enough for the brand.** Show the same fish twice on one screen, and the first one is worth nothing.

**Let it follow the text colour.** Do not hard-code a colour for it: that is what lets it follow light and dark on its own.

**Treat it as decoration by default.** A screen-reader user does not need to hear it, unless it is the only brand information in that spot — only then give it a name.

**Scale with the size parameter, do not stretch it.** Stretching makes the thin strokes go soft, and the points of the fins blur first.

**Where the area has to be clickable, hang the action on a real button or link.** Put a click on the shape itself and a keyboard user can no longer reach it.

| Situation | Should the brand mark appear? |
| --- | --- |
| Splash screen, about page | Yes |
| Documentation header | Once |
| Every block in a content area | No |
| The everyday toolbar | Only when nothing else states the identity |
| A decorative placeholder | No |

Implementation details are in SPEC.md.
