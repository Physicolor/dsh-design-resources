---
source: components/surfaces/Card/SPEC.md
source-sha256: 3e5dbc8263782c82
translated-at: 2026-10-05
---
# Card · SPEC

- id: card
- category: surfaces
- source: `components/surfaces/Card/` (`index.tsx` / `card.module.css`)
- official-counterpart: **The product has a counterpart UI**: the product client's CSS modules render a card surface in three places — the settings page, the plugin page and the composer: `.KZf9OG_card { border: .5px solid var(--dsw-alias-settings-card-stroke); border-radius: var(--dsw-radius-xl); background: var(--dsw-alias-settings-card-fill) }` (`--dsw-radius-xl` = 20px), the plugin page row `fO69Vq_card` is 976 × 66 with corner radius 20. The official primitives package has no component of the same name; the remaining geometry is taken one by one from verified selectors (see geometry-source)
- human-doc: `README.md` (judgement and trade-offs; facts only in this file)

## geometry-source

Every value is read item by item from official artefacts (the theme layer inside `app.asar` and the CSS of `@deepseek-ai/dsh-client-ui-primitives`), written as "value ← where it comes from, selector / declaration".

| Value | Source |
| --- | --- |
| `border-radius: var(--dsw-radius-xl)` (20px) | ← official settings page card `settings/*.module.css` `.card` (`border-radius: var(--dsw-radius-xl)`); `--dsw-radius-xl: 20px` ← theme layer `:root`, see the `scale` group in `data/tokens.json` |
| `border: 0.5px solid var(--dsw-alias-settings-card-stroke)` | ← `border: .5px solid var(--dsw-alias-settings-card-stroke)` on the official settings page card `.card` |
| `background: var(--dsw-alias-settings-card-fill)` | ← `background: var(--dsw-alias-settings-card-fill)` on the official settings page card `.card` (that alias resolves to `--dsw-alias-bg-layer-2`) |
| Title `16px` / `line-height: 24px` / `font-weight: 500` | ← `Modal.module.css` `.title` |
| Body `14px` / `line-height: 22px` | ← `Modal.module.css` `.description` |
| Description text colour `var(--dsw-alias-label-secondary)` | ← `Modal.module.css` `.close`, `Pill.module.css` `.pill` (the two places where the official code sets secondary text to that token) |
| Hairline above the footer `0.5px` + `var(--dsw-alias-border-l2)` | ← `Menu.module.css` `.footer` (`border-top: 0.5px solid var(--dsw-alias-border-l2)`) |
| Title colour `var(--dsw-alias-label-primary)` | ← `Modal.module.css` `.title` |

### surface — three tiers of surface (this component takes the first)

The corner radius and the elevation are not arbitrary values: the official code keeps two separate conventions, one for surfaces that sit in the document flow and one for surfaces that float above it, and a shadow and a hairline never stack on the same element. All three tiers come from the theme layer, see the `scale` group in `data/tokens.json`.

| Tier | Corner radius | Fill and stroke | Elevation |
| --- | --- | --- | --- |
| Grounded card (this component) | `--dsw-radius-xl` 20px | `--dsw-alias-settings-card-fill` + `.5px` `--dsw-alias-settings-card-stroke` | no `box-shadow` |
| Overlay (menus, popovers) | `--dsw-radius-lg` 16px | `--dsw-specific-menu` + `backdrop-filter: var(--dsw-menu-backdrop-filter)` | `box-shadow: var(--dsw-elevation-prominent)` |
| Large panel (an overlay filling the screen) | `--dsw-radius-panel` 28px | `--dsw-alias-bg-layer-2` | `box-shadow: var(--dsw-elevation-*)` |

The literal values of the elevation tokens (theme layer, shared by light and dark):

- `--dsw-elevation-stroke: 0 0 0 .5px var(--dsw-elevation-stroke-color)`
- `--dsw-elevation-panel: var(--dsw-elevation-stroke), 0 3px 8px 0 #00000008, 0 0 16px 0 #00000005`
- `--dsw-elevation-prominent: var(--dsw-elevation-stroke), 0 3px 8px 0 #0000000a, 0 0 20px 0 #0000000d`
- `--dsw-elevation-soft: var(--dsw-elevation-stroke), 0 4px 16px 0 #00000008, 0 0 24px 0 #00000008`
- `--dsw-shadow-lv1 / lv2 / lv3`: three tiers of general-purpose drop shadow, for small elements such as buttons and floating pieces

Corner radius comes in only six tiers: `4 / 8 / 12 / 16 / 20 / 28` (`--dsw-radius-xs` → `--dsw-radius-panel`). Invent a seventh and the two look like two different systems side by side.

### Values proposed by this repository (not official values)

- `padding: 16px`: there is no matching inline card in the official code. 16px — it is a multiple of 4, and it sits on the same tier as the `16px` horizontal padding of `.card` in the official `HoverCard.module.css`; anything smaller (12px) reads as cramped under a 16/24 title, and anything larger (24px, the horizontal padding of the Modal dialogue) looks too empty on a card.
- `.card { gap: 12px }` (the vertical spacing between slots): a multiple of 4; 12px because the vertical padding of `.card` in the official `HoverCard.module.css` and the vertical padding of `.body` in `ReadBlock.module.css` are both `12px`, the same spacing tier.
- `.header { gap: 4px }` (between title and description): a multiple of 4, and 4px is the official smallest spacing tier (`gap: 4px` on `.button` in `Button.module.css`, `gap: 4px` on `.pill` in `Pill.module.css`).
- `.footer { padding-top: 12px }`: the same tier as the slot spacing (12px), so the breathing room above and below the hairline stays even.
- **Border or shadow, pick one: this component uses `border: 0.5px solid var(--dsw-alias-settings-card-stroke)`, not `box-shadow`.** The reason: every place the official code uses a shadow is an overlay lifted out of the document flow — menus and popovers use `--dsw-elevation-prominent`, floating pieces use `--dsw-elevation-panel` — whereas the genuinely inline official containers (the settings page card, `.block` in `ReadBlock.module.css`) carry only a fill plus a 0.5px stroke and no elevation. When cards sit side by side, a shadow on every card smears dirty edges where they meet; the hairline is the language of the official inline tier. To use elevation, switch to the overlay tier instead, and never stack a shadow on a card.
- Cost note: under `box-sizing: border-box` a `0.5px` stroke makes the box take 0.5px more on each side (1px in total); this is a deliberate real stroke, not part of the padding.

### Decisions in this repository (rewriting official behaviour)

- None. The official code has no inline card component, so this component is an addition rather than a rewrite; `box-sizing: border-box` is declared explicitly to avoid depending on a global reset in the host (the official `.dialog` / `.close` rely on a host reset too, which this repository does not assume).

The implementation is original to this repository (CSS variables carry the geometry plus a single-class slot structure); the geometry is equivalent but it is not a copy of the official CSS.

## api

`CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'>`, `forwardRef<HTMLElement, CardProps>`. The native `title` (the browser tooltip) is taken over by the title slot, so it is removed from `HTMLAttributes` first and then re-declared.

| Property | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `ReactNode` | none | Card title, rendered as a heading element (the level comes from `titleAs`); when omitted the title row is not rendered |
| `description` | `ReactNode` | none | Supplementary explanation below the title; the same font size as the body, distinguished by `--dsw-alias-label-secondary` |
| `titleAs` | `'h2' \| 'h3' \| 'h4'` | `'h3'` | Which heading level the title is rendered as; changes the tag only, not the visuals |
| `footer` | `ReactNode` | none | Bottom slot (action buttons, links, footnotes); a hairline separates it from the body |
| `children` | `ReactNode` | none | Body |
| `className` | `string` | none | Concatenated with the internal class name, appended last |
| everything else | `HTMLAttributes<HTMLElement>` | -- | Passed through to the root element unchanged, except `title` |
| `ref` | `Ref<HTMLElement>` | none | Passed through to the root element |

`CardTitleAs` is an exported type alias. `hasHeader = title != null || description != null`; when false, `.header` is not rendered.

## states

The component is a pure container with no interaction states; the table below covers every rendering branch.

| State | Trigger | Behaviour |
| --- | --- | --- |
| Empty card | `title` / `description` / `children` / `footer` all empty | The root element is still rendered, leaving an empty box with only a stroke and a fill (callers must avoid this) |
| No title row | both `title` and `description` empty | `.header` is not rendered |
| No title, description present | `title` empty, `description` not empty | `.header` is rendered, containing only `.description` |
| No body | `children` empty | `.body` is not rendered |
| No footer | `footer` empty | `.footer` is not rendered, and so the hairline above the footer does not appear |
| Heading level | `titleAs` | Rendered as `h2` / `h3` / `h4` in turn, with the visuals unchanged |
| Hover / focus / disabled | — | The component defines no `:hover` / `:focus` / `:disabled` styles |

## tokens

DSH semantic tokens:

- `--dsw-alias-settings-card-fill` — `.card` fill (the same alias the official settings page card uses)
- `--dsw-alias-settings-card-stroke` — `.card` stroke colour
- `--dsw-radius-xl` — `.card` corner radius (20px)
- `--dsw-alias-border-l2` — hairline colour above `.footer`
- `--dsw-alias-label-primary` — `.card` base text colour, `.title` colour
- `--dsw-alias-label-secondary` — `.description` colour

This component uses no elevation tokens (`--dsw-elevation-*` / `--dsw-shadow-lv*`); they belong to the overlay tier, and their literal values are in the surface section above.

Component-level CSS variables (internal to this repository, not DSH tokens):

- `--dsh-card-radius` (`var(--dsw-radius-xl)`)
- `--dsh-card-padding` (`16px`)
- `--dsh-card-gap` (`12px`, also used for the `padding-top` of `.footer`)
- `--dsh-card-head-gap` (`4px`)

## a11y

- The root element is `<section>`, and `title` is rendered as `<h3>` by default. The heading level follows the page outline (page title → section → card); do not skip levels for the sake of font size. `titleAs` changes the tag only, not the visuals.
- A card is a pure container and carries no interaction: do not give it an `onClick` without a keyboard exit. A card that is clickable as a whole is unusable for keyboards and screen readers.
- Name the card with a real heading (`title`), not with `aria-label` — the "jump to a section" list in a screen reader reads headings.
- `description` is an explanation rather than required reading: put key information in the body, and do not put the only status message into small secondary-colour text.
- Colour goes through `var(--dsw-*)` only: the card itself hard-codes no colour, so it holds up in both the light and the dark theme.
- The component holds no focusable elements, so it needs no focus style; `AC-MF-10` / `AC-MF-11` do not apply to this component (once a caller puts an interactive element inside the card, that element carries its own focus ring).

## checks

Binary constraints that can be detected automatically (decidable as true / false, ready to become lint rules).

1. The root element tag is `<section>`.
2. The set of `titleAs` values is exactly `h2` / `h3` / `h4`, with `h3` as the default.
3. When `title` is not empty, what is rendered is a heading element; it must not be rendered as a bold `<div>`.
4. `titleAs` affects the tag only: the `font-size` / `line-height` / `font-weight` of `.title` are fixed declarations that do not change with `titleAs`.
5. The card root element binds no `onClick` / `onKeyDown` / `onKeyUp` (there is no interaction handling in the source).
6. Border and shadow, pick one: `.card` carrying both `border` and `box-shadow` is a violation (a value proposed by this repository, for the reason above).
7. `.card` declares `box-sizing: border-box`.
8. The colour of `.description` is `--dsw-alias-label-secondary` and must not be the same colour as `.title`.
9. `card.module.css` contains no hexadecimal colour literals (`#`), `rgb(` or `hsl(`; all colours go through `var(--dsw-*)`.
10. `.card` has no `:focus-visible` (the component holds no interactive elements); adding one must come with a focus style (`AC-MF-10`).
11. Class names are concatenated as "base class + external className", with the external class name appended last so that it can override.
12. Import no runtime dependency other than `react` (including `@deepseek-ai/*`).
13. The `border-radius` of `.card` is one of the six official tiers (`--dsw-radius-xs/sm/md/lg/xl/panel`, i.e. 4 / 8 / 12 / 16 / 20 / 28); no other radius literal appears.
14. `.card` does not use `--dsw-elevation-*` / `--dsw-shadow-lv*` at the same time: a grounded container goes through the hairline only (the rule in the surface section).

## demo

- `components/surfaces/Card/demo.html`

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Related clauses: `spec/60-accessibility.md` (`AC-MF-10`, `AC-MF-11`)
