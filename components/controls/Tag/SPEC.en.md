---
source: components/controls/Tag/SPEC.md
source-sha256: 515a066a3d283175
translated-at: 2026-10-07
---
# Tag · SPEC

- id: tag
- category: controls
- source: `components/controls/Tag/` (`index.tsx` / `tag.module.css`)
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/Tag.module.css` and `function Tag` in `lib/index.js`
- human-doc: `README.md` (judgement and trade-offs; this file holds facts only)

## geometry-source

Values are read one by one from the official `Tag.module.css`; the notation is "value ← filename selector".

| Value | Source |
| --- | --- |
| `border-radius: 999px` / `corner-shape: round` / `padding: 1px 8px` / `font-size: 11px` / `line-height: 17px` / `font-weight: 500` / `white-space: nowrap` | `Tag.module.css` → `.tag` |
| `display: inline-flex` / `align-items: center` | `Tag.module.css` → `.tag` |
| `border: 0.5px solid var(--dsw-alias-border-l4)` / `color: var(--dsw-alias-label-tertiary)` | `Tag.module.css` → `.tag[data-tone='outline']` |
| `background: var(--dsw-alias-label-primary)` / `color: var(--dsw-alias-bg-layer-3)` | `Tag.module.css` → `.tag[data-tone='solid']` |
| `background: var(--dsw-alias-bg-module-platform)` / `color: var(--dsw-alias-label-secondary)` | `Tag.module.css` → `.tag[data-tone='neutral']` |
| `color: var(--dsw-alias-label-tertiary)` | `Tag.module.css` → `.tag[data-tone='quiet']` |

### The product's second gear: the compact tag (measured, not primitives)

The product's own Tag (the client module `_tag_brmue_4`, from the same batch as Button / Pill / Tabs) uses the compact gear in dense rows such as the conversation header:

| Value | Source |
| --- | --- |
| `border-radius: 999px` / `padding: 0 4px` / `font-size: 10px` / `line-height: 15px` / `font-weight: 500` | `_tag_brmue_4` (measured: the `当前会话` tag is 48 × 15 @ the conversation header chip panel) |
| `background: color(srgb 0.254902 0.462745 0.901961 / 0.1)` / `color: rgb(65, 118, 230)` | The same place (brand blue text on a 10% brand-blue background, i.e. the `--dsw-alias-state-business-primary` family) |

**Verdict (the official set has two gears of its own)**: the primitives `Tag.module.css` is 11/17 + `padding 1px 8px`, while the product client's own set is 10/15 + `padding 0 4px`. These are not the same gear, and neither is wrong — **use the compact gear in dense rows (conversation header, inside list rows), and the primitives gear when a tag stands on its own**; plugin authors pick one gear for the place the tag sits in, and do not invent a third (a mix such as 10/17, for example).

### Other values (this repository's component implements the primitives gear)
| `color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent)` + text in the same colour | `Tag.module.css` → `.tag[data-tone='success']` |
| `color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent)` + text in the same colour | `Tag.module.css` → `.tag[data-tone='info']` |
| `color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent)` + text in the same colour | `Tag.module.css` → `.tag[data-tone='warning']` |
| `color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent)` + text in the same colour | `Tag.module.css` → `.tag[data-tone='danger']` |
| Render form: `<span>` + `data-tone`, `tone` defaults to `outline`, an external `className` is joined to the official class | `lib/index.js` → `function Tag({ tone = "outline", className, children })` |

The two reasons in the official source comments (the top of `Tag.module.css`): the capsule geometry is fixed (a tag reads as the same size wherever it appears, only the palette changes); a state colour's fill is mixed from its text colour, so when the palette changes the fill and the text move together and no second token is needed. `10%` is the general value, and `warning` stays at `12%` to line up with the conditional tags already in the plugin manifest.

### Values proposed by this repository (not official values)

- `box-sizing: border-box` on `.tag`: the official CSS does not declare it. `outline` is the only tone with a `border` (`0.5px`), and without `border-box` it is 1px taller and 1px wider than the other 7 tones, so a ragged edge shows up in the same row. This line evens out the outer boxes of the 8 tones and does not change any official value of any single tone.
- `font-family: inherit` on `.tag`: not declared officially. A `<span>` inherits it anyway; writing it out is only to stay consistent when the tag is put inside a container such as `<button>` / `<input>` that does not inherit the font automatically.

### Implementation notes

- This implementation is original to this repository: the geometry is carried by component-level CSS variables on `.tag` (`--dsh-tag-radius` / `--dsh-tag-pad-y` / `--dsh-tag-pad-x` / `--dsh-tag-font-size` / `--dsh-tag-line-height` / `--dsh-tag-font-weight`), and the colour scheme is switched by 8 `data-tone` attribute selectors. The selector structure matches the official one, but the official CSS source was not copied.
- `--dsh-tag-*` are internal variables of this repository, not DSH tokens.
- `font-size: 11px` has no matching `--dsw-font-*` token (the smallest value in the verified token list is 12); as `TK-RC-04` defines it, a font size with no matching token should reuse the official component directly, so this repository adopts the official geometry `11px` / `17px` as written and adds no token of its own.

## api

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tone` | `'outline' \| 'solid' \| 'neutral' \| 'quiet' \| 'success' \| 'info' \| 'warning' \| 'danger'` | `'outline'` | Palette; lands on the root node as `data-tone` |
| `children` | `ReactNode` | none | The tag text; localising it is the caller's responsibility |
| `className` | `string` | none | Class appended to the root node, for layout positioning from the outside |
| Everything else | `HTMLAttributes<HTMLSpanElement>` | — | Forwarded to the `<span>` unchanged |
| `ref` | `Ref<HTMLSpanElement>` | none | Forwarded to the root node |

`TagTone` is an exported type alias.

## states

| State | Trigger | What it looks like |
| --- | --- | --- |
| Default | `tone='outline'` | `border: 0.5px solid var(--dsw-alias-border-l4)`; `color: var(--dsw-alias-label-tertiary)` |
| Neutral | `tone='neutral'` | `background: var(--dsw-alias-bg-module-platform)`; `color: var(--dsw-alias-label-secondary)` |
| Quietest | `tone='quiet'` | No background, no border, only `--dsw-alias-label-tertiary` text |
| Inverted | `tone='solid'` | Background `--dsw-alias-label-primary`, text `--dsw-alias-bg-layer-3` |
| success / info / warning / failure | `tone='success' \| 'info' \| 'warning' \| 'danger'` | A `color-mix` fill at 10% (`warning` at 12%) + text in the same colour |
| hover / active / focus-visible / disabled | — | None defined. A Tag is read-only text and has no interactive state |

## tokens

DSH semantic tokens:

- `--dsw-alias-border-l4` — the border colour of `outline`
- `--dsw-alias-label-tertiary` — the text colour of `outline` / `quiet`
- `--dsw-alias-label-secondary` — the text colour of `neutral`
- `--dsw-alias-bg-module-platform` — the background of `neutral`
- `--dsw-alias-label-primary` — the background of `solid`
- `--dsw-alias-bg-layer-3` — the text colour of `solid`
- `--dsw-alias-state-success-primary` — the text colour and fill source of `success`
- `--dsw-alias-state-business-primary` — the text colour and fill source of `info`
- `--dsw-alias-state-warn-primary` — the text colour and fill source of `warning`
- `--dsw-alias-state-error-primary` — the text colour and fill source of `danger`

Component-level CSS variables (internal to this repository, not DSH tokens):

- `--dsh-tag-radius` (`999px`)
- `--dsh-tag-pad-y` (`1px`)
- `--dsh-tag-pad-x` (`8px`)
- `--dsh-tag-font-size` (`11px`)
- `--dsh-tag-line-height` (`17px`)
- `--dsh-tag-font-weight` (`500`)

## a11y

- A Tag is read-only text, not a control: no `role`, no `tabindex`, and that is the correct state. Do not give it an `onClick` to make it "look clickable" (`CT-MF-04`: a Tag must not have a click action bound to it).
- Its visual height is about 19px (a 17px line height plus 1px of padding top and bottom), below the 20×20 minimum hit area of `AC-MF-01`; a pure marker Tag therefore must not be clickable. If you really need a clickable marker, use a Pill or explicitly extend the hot area to at least 20×20 (`AC-MF-02`).
- Colour cannot be the only carrier of information: if the difference between `success` and `danger` rests on red versus green alone, a user with colour vision deficiency cannot read it. Write it out in the text itself (`构建失败` rather than `构建`) (`AC-MF-07`).
- When `solid` marks the current item, the inverted colour is not enough either: within the same group that item should also carry `aria-current="true"` or an equivalent text marker (`AC-MF-07`).
- When a Tag is put inside a clickable parent element, focus belongs to the parent, and the Tag never takes focus on its own.
- Contrast: `quiet` and `outline` use `label-tertiary`, the lowest-contrast gear, so they suit supporting information only and must not carry a critical state (`AC-MF-05`).

## checks

Binary constraints a machine can check (decidable as true / false, and directly expressible as lint rules).

1. The root node is a `<span>` and carries no `role`, `tabIndex`, `onClick` or `onKeyDown` (`CT-MF-04`, `CT-MF-11`).
2. The `data-tone` value falls within the 8 enum members, defaulting to `outline` when not passed.
3. Each of the 8 branches of `tone` declares only `background` / `border` / `color`, and no geometry properties (the geometry is fixed, only the palette changes).
4. The fill and the text of a state tone come from the same `--dsw-alias-state-*-primary` token, and the `color-mix` opacity is 10% (`warning` is 12%).
5. `box-sizing: border-box` is present on `.tag` (a value proposed by this repository; without it the 8 tones' outer boxes differ by 1px).
6. No hard-coded colour values appear in the declarations of the 8 tones (`TK-MF-01`).
7. No literal `font-size` or `line-height` override appears; the geometry stays `11px` / `17px` (`CT-MF-12`).
8. `white-space: nowrap` has not been removed (once removed, a long label runs together with the neighbouring controls and breaks the single-line capsule positioning).
9. Clickable Tag instances are zero; if one appears, its hit area must be at least 20×20 (`AC-MF-01`, `AC-MF-02`).
10. When `solid` marks the current item, that item also carries `aria-current` or an equivalent text marker (human review + attribute scan).

## demo

- `components/controls/Tag/demo.html`

## Real scenes (reconciled against docs/reference screenshots)

| Shot | Region | Context | As captured | tone |
| --- | --- | --- | --- | --- |
| `06-plugins.png` | The official grouped row, after the plugin name | `实验性` | 42 × 18 | `info` |
| `01-hero.png` | After the hero tagline `探索未至之境` | `预览版` | 50 × 19 | `info` |

Reconciliation conclusion: the source geometry `padding 1px 8px` + `line-height 17px` = **19px** tall, matching the 18–19px captured; the captured ink width of the 3 CJK characters is 30px (≈ 11px per character), matching `font-size: 11px`.

### Known deviations (added by the screenshot reconciliation)

- The horizontal padding measures about **6px** (`预览版`: 50 − 36 = 14, so 7 on each side); the source says `8px`. The 1–2px difference is the sort of amount a threshold drops once the edge blends with the light background and antialiasing, so **the source values were not changed**, only recorded.
- Only one tone, `info`, ever appears in the screenshots. The other 7 tones (`outline` / `solid` / `neutral` / `quiet` / `success` / `warning` / `danger`) are marked "not covered by the screenshots" in the demo.
- `官方 8` and `已安装 11` in `06-plugins.png` are count text in a group heading, not Tags.

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist entries: `spec/70-checklist.md` (`A17`, `A43`, `A45`, `A46`)
