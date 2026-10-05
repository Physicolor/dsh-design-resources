---
source: components/brand/Wordmark/README.md
source-sha256: 0411996581edb459
translated-at: 2026-10-05
---
# Wordmark

The line in a document header: a whale, the brand name spelled out in lowercase letters, and a small square reading HARNESS to its right. Where the full brand has to be written out in one go, this is it.

It is one solid graphic, not text. That is what decides when it should be used and when it will cause trouble.

## When to use it

- Launch screens, about pages, exported images, document headers and footers: anywhere the full brand name has to be written out.
- You need the official fixed pairing of mark plus text.
- The space is narrow and you only need the text part: you can turn the leading whale off.

## When not to use it

- There is room for one mark only. Use FishMark.
- Users need to read the brand name. A wordmark has no real text nodes, so screen-reader users cannot hear those letters. When it has to be readable, use real text, or visible text plus FishMark.
- As a page title. A wordmark has no text hierarchy and does not enter the document outline; a title should be a real heading.
- Scaled very small. The strokes smear together; at that size use FishMark alone.
- You need multiple colours, gradients or outlines. It has one layer of colour, plus an inverse colour for the small square.
- As a watermark filling the background, or one on every panel corner. The header has already said it once; saying it again is noise.

## How to use it well

**The brand follows the content; it does not push ahead of it.** Users are here to get work done; the more space the brand takes, the less is left for the content.

**Once per screen.** The header already carries it, so the footer does not need it again.

**Colour inside the small square is managed separately.** That is the one part that does not follow the text colour: when the wordmark sits on a dark block, a gradient or an image, those letters can smear into the background, so give it a colour that reads against it.

**Do not invert the whole thing.** The mark and the small square are two separate colour schemes; flipping both at once throws the contrast off, so recolour only the designated spot.

**If it has to be readable, do not rely on the graphic.** Screen readers differ in how they support graphic names; the brand name written as real text is still the safest.

**Scale with the size parameter.** Stretching it smears both the letter strokes and the letters in the small square.

| Situation | What to use |
| --- | --- |
| The full brand name is needed | Wordmark |
| Room for one mark only | FishMark |
| It has to be read out | Real text, or visible text plus FishMark |
| A page title | A real heading, with FishMark |
| Very small spaces | FishMark alone |

Implementation details are in SPEC.md.
