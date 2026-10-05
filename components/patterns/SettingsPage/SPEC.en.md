---
source: components/patterns/SettingsPage/SPEC.md
source-sha256: 9dc7d21fc9acd5d7
translated-at: 2026-10-05
---
# SettingsPage · SPEC

- id: settings-page
- category: patterns
- source: `components/patterns/SettingsPage/` (`index.tsx` / `settings-page.module.css`)
- official-counterpart: the official primitives package (`lib/index.js`) has no such component; but **the product does have the settings window itself** — the measured geometry captured from it is in the next section. This component is a skeleton suggestion for plugins, not a statement that "the product has no settings page".

## The product's settings window (measured)

`docs/reference/settings-panel.json` (1570×905 viewport, window box [385, 53, 800, 800]); the demo is rendered from exactly this file.

| Part | Measured value |
| --- | --- |
| Mask | full screen `--dsw-alias-bg-mask-1` (computed value `rgba(0,0,0,.24)`) |
| Window | **800 × 800** · corner radius **28px** · white ground · `box-shadow` = `--dsw-elevation-prominent` (computed value `0 0 0 .5px rgba(0,0,0,.16), 0 3px 8px rgba(0,0,0,.04), 0 0 20px rgba(0,0,0,.05)`) |
| Nav column | **188 wide** · padding `22px 12px 0` · gap 18 between title and list · list row spacing 4 |
| Nav cell | **164 × 40** · corner radius **12** · padding `9px 16px 9px 12px` · gap 8 · selected ground `rgb(235,238,242)` |
| Content column | **612 wide** · header 54 high (padding `20px 14px 8px 10px`) · options area padding `0 24px 24px` |
| Section title | **18/26 · 600** (`h2`) — but this is the look **after the locally installed dsh-ui-harmonizer normalises it**; see the note below |
| Section description | **13/20** · 12 below (also from the harmonizer's normalisation) |
| Settings row | padding `16px 0` · title **14/22** · description **12/18** · one hairline between rows · 48 reserved to the right of the text column |
| Selector | height **36** · corner radius **12** · padding `0 14` · gap 12 · ground `rgb(245,246,247)` · chevron 14×14 |
| Theme tile | **183 × 84** · corner radius **20** · padding `20px 32px` · selected ground `rgb(245,246,247)` |
| Switch | **36 × 20** · corner radius 999 · thumb 16 · `--dsw-alias-brand-primary` when on |
| Number stepper | two **17 × 12** arrows, up and down · corner radius 4 (the font-size row) |

Note two places that disagree with this component's earlier proposed values, with the measurements as the authority: the nav cell corner radius is 12 (not 10), and the settings row description is 12/18 (not 13/20).

**Note: that header row is not what the product itself looks like.** This machine has `dsh-ui-harmonizer` installed, and it normalises the header of every `settings.section` page into `18/26/600` + `13/20` + a bottom hairline (it tags the real title / description nodes with `enhc-page-title` / `enhc-page-intro`, and pads the measured gap between title and description out to 12px). **The official pages' own headers are not consistent** — the model page is `16/500` + `14/22`, and the Agent presets page is another set again. To get the product's own look in a capture, you have to disable the plugin's styles entirely and measure again. Every row in the table above marked "harmonizer normalisation" should be read in the light of this sentence.

### Cards and lists inside a settings page (measured, from the built-in Plugins / Components sections)

| Part | Measured | Geometry |
| --- | --- | --- |
| Settings card (in a row) `rowCard` | 564 × 54 | corner radius **20** · padding `12px 14px` · gap 12 |
| Card body `cardMain` | 274 × 119 | corner radius `20px 20px 0 0` · padding `14px 16px 12px 16px` · gap 12 |
| Card foot `cardFoot` | 274 × 49 | padding `6px 10px` · gap 2 |
| Plugin card `card` (two-column grid) | **277 × 84** | corner radius **20**; content area `cardContent` 275 × 82 · padding `12px 14px` · gap 2 |
| Help button `helpButton` | 60 × 36 | corner radius **12** · padding `5px 6px` · gap 4 · 12/22 |
| Segmented / toggle `switcher` | 166 × 36 | corner radius **12** · padding `0 14px` · gap 12 · 14/22 |
| Group toggle `groupToggle` | 76 × 22 | gap 8 |
| Search row `search` | 564 × 36 | the same width as a settings row (content column 612 − 24 on each side) |
| Secondary button `secondaryButton` | height **28** · corner radius **8** (things like "Edit") | element inventory |
| Add / new button `addButton` | height **44** · corner radius **12** (full row width) | element inventory |
| Settings page input | height **36** | element inventory |
| Status tag `tag` | 49 × 19 | corner radius 999 · padding `1px 8px` · 11/17 · 500 (the primitives step, see `components/controls/Tag/SPEC.md`) |

**Verdict**: cards inside a settings page all take **corner radius 20** (`--dsw-radius-xl`), and the plugin card is a two-column grid with each cell **277 × 84** — not the same step as the window's corner radius (28) above: the window is an overlay, and the cards are content blocks inside it. When a plugin puts cards into a settings page, follow this step; do not use 28 just because the window does.

## geometry-source

Read each row as "value ← file name selector".

| Value | Source |
| --- | --- |
| Nav row `min-height: 40px`, `padding: 8px 10px`, `border-radius: 10px`, `gap: 8px`, `font-size: 14px`, `line-height: 22px` | `Menu.module.css` → `.item` |
| Nav row hover ground `--dsw-alias-interactive-bg-hover` | `Menu.module.css` → `.item:hover:not(:disabled)` |
| Selected row ground `--dsw-alias-interactive-bg-hover` | `Menu.module.css` → `.selectedFill` |
| Nav row disabled `opacity: 0.4` | `Menu.module.css` → `.item:disabled` |
| Nav icon container `16×16` + `--dsw-alias-label-tertiary` | `Menu.module.css` → `.itemIcon` |
| Nav row text truncation (`min-width: 0` / `overflow: hidden` / `text-overflow: ellipsis` / `white-space: nowrap`) | `Menu.module.css` → `.itemLabel` |
| Nav container padding `4px` | `Menu.module.css` → `.list` |
| Nav container corner radius `12px` | `ReadBlock.module.css` → `.block` (`--dsl-read-radius: 12px`) |
| Nav container ground `--dsw-alias-bg-module-platform` | `Tag.module.css` → `.tag[data-tone="neutral"]` (the same token) |
| Page title `font-size: 16px` / `line-height: 24px` / `font-weight: 500` | `Modal.module.css` → `.title` |
| Page description `font-size: 14px` / `line-height: 22px` | `Modal.module.css` → `.description` |
| Page description colour `--dsw-alias-label-secondary` | `Pill.module.css` → `.pill` (`color`) |
| Section title `font-size: 14px` / `line-height: 22px` | `Button.module.css` → `.button` |
| Section title `font-weight: 500` | `Modal.module.css` → `.title` |
| Between section title / description and content, and between title and action area `gap: 8px` | `Modal.module.css` → `.header` / `.footer` (`gap: 8px`) |
| Section description `font-size: 12px` / `line-height: 18px` | `ReadBlock.module.css` → `.label` |
| Section description colour `--dsw-alias-label-tertiary` | `ReadBlock.module.css` → `.count` (`color`) |
| Between title and content block `20px` | `Modal.module.css` → `.dialog` (`gap: 20px`), `.body` (`margin-top: 20px`) |
| Nav column width `218px` | `Menu.module.css` → `.list` (`min-width: 218px`, the official menu card's outer width) |

Everything above except "nav column width" borrows some existing official value into this component's context; "nav column width" borrows the official menu card's outer width to serve as the nav column width.

### Proposed values in this repository (no official source)

- `--dsh-settings-pad: 24px` (page padding): a multiple of 4; the magnitude matches the official `Modal.module.css` `.root { padding: 24px }` and the 24px horizontal padding of `.header/.body/.footer` — a settings page and a dialog are both "a centred content container".
- `--dsh-settings-gap: 32px` (the column gap between the nav column and the content column): a multiple of 4 and of 8; `spec/10-frame-layout.md` `FL-AD-07` sets the minimum spacing between sections at 16px, and the nav column and the content column are two side-by-side sections, so take 2× — 32px — to set the visual weight of "nav" and "content" apart.
- `--dsh-settings-block-gap: 24px` (the distance between sections inside the content column): a multiple of 4, the same value as the page padding, so that one page does not end up with a fourth spacing magnitude.
- `--dsh-settings-content-max: 640px` (maximum content column width): the official `Toast.module.css` `.toast { max-width: min(640px, calc(100vw - 48px)) }` already treats 640px as the readable-width ceiling, and a settings page form is the same; past it the user's eye has to sweep across and the labels stop lining up with their controls.
- Unselected nav row text uses `--dsw-alias-label-secondary`: the official `Menu.module.css` `.item` uses `label-primary` for every row and marks the selection with a trailing tick. This component has no tick slot, so it distinguishes "not the current item" from "the current item" by text colour lightness instead, and the selected item gets `label-primary` as well.
- Setting row description `margin-top: 4px`, section description `margin-top: 4px`, section content `margin-top: 8px`: multiples of 4.
- The nav row's `:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px }`: the official package has no counterpart; the declaration matches the official `Switch.module.css` `:focus-visible` so that keyboard users see the same focus ring on every control.

### Implementation notes

The implementation is original to this repository (geometry carried by CSS variables + a single class switching size); the geometry is equivalent, but this is not a copy of the official CSS.

## api

Three components are exported: `SettingsPage`, `SettingsNavItem`, `SettingsSection`.

`SettingsPageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>`, `forwardRef<HTMLDivElement, SettingsPageProps>`.

| Property | Type | Default | Notes |
| --- | --- | --- | --- |
| `nav` | `ReactNode` | required | The left column's nav content, usually several `SettingsNavItem` |
| `navLabel` | `string` | `'设置分区'` | The accessible name of the nav column, landing on `<nav aria-label>` |
| `title` | `ReactNode` | none | Page title; when it is not passed, the title area is not rendered |
| `description` | `ReactNode` | none | The explanation below the title |
| `titleLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `1` | The semantic level of the page title |
| `navWidth` | `number \| string` | none (CSS default `218px`) | Overrides the left column width; a number is treated as px and written into `--dsh-settings-nav-width` |
| `className` | `string` | none | Concatenated with the internal class name |
| `style` | `CSSProperties` | none | Merged with the variable computed from `navWidth`; `navWidth` wins |
| Everything else | `Omit<HTMLAttributes<HTMLDivElement>, 'title'>` | — | Passed through to the root `<div>` |
| `ref` | `Ref<HTMLDivElement>` | none | Passed through to the root `<div>` |

`SettingsNavItemProps extends HTMLAttributes<HTMLElement>`, `forwardRef<HTMLElement, SettingsNavItemProps>`.

| Property | Type | Default | Notes |
| --- | --- | --- | --- |
| `active` | `boolean` | `false` | Whether this is the current section; when true it carries `aria-current="page"` and the selected ground |
| `href` | `string` | none | When passed, renders `<a>` (an in-page anchor); otherwise renders `<button type="button">` |
| `icon` | `ReactNode` | none | The leading icon node, placed into a 16×16 container |
| `className` | `string` | none | Concatenated with the internal class name |

`SettingsSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'>`, `forwardRef<HTMLElement, SettingsSectionProps>`.

| Property | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `ReactNode` | none | Section title; when it is not passed, the title row is not rendered and no `aria-labelledby` is emitted |
| `description` | `ReactNode` | none | The supplementary explanation below the title |
| `actions` | `ReactNode` | none | The right-aligned action area, usually one `Button` |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | The semantic level of the section title |
| `className` | `string` | none | Concatenated with the internal class name |

`HeadingLevel` is an exported type alias.

## states

| State | Trigger | Behaviour |
| --- | --- | --- |
| Page skeleton | Always | The root `<div>` is `display: flex` + `align-items: flex-start`, `gap` from `--dsh-settings-gap`, `padding` from `--dsh-settings-pad` |
| Nav column | Always | `<nav aria-label={navLabel}>`, width `--dsh-settings-nav-width`, corner radius 12px, padding 4px, ground `--dsw-alias-bg-module-platform` |
| Nav item unselected | `active === false` (default) | `color: var(--dsw-alias-label-secondary)`, transparent ground |
| Nav item selected | `active === true` | `aria-current="page"` + `color: var(--dsw-alias-label-primary)` + `background: var(--dsw-alias-interactive-bg-hover)` |
| Nav item hover | `.navItem:hover:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-hover)` |
| Nav item disabled | `.navItem:disabled` | `opacity: 0.4` + `cursor: not-allowed` (only the `<button>` form can be disabled) |
| Keyboard focus | `.navItem:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px` (`§ proposed values`) |
| Nav item overflow | The title exceeds the column width | `overflow: hidden` + `text-overflow: ellipsis` + `white-space: nowrap` |
| Page title | `title != null` | Renders `<hN>` (`titleLevel`, default `<h1>`), 16/24/500 |
| Page description | `description != null` | Renders `<p>`, 14/22, `margin-top: 4px` (`§ proposed values`) |
| Section with title | `title != null` | The title row renders `<hN>` (default `<h2>`); when `actions` is present it renders a right-aligned action area |
| Section with description | `description != null` | Renders `<p>`, 12/18, `margin-top: 4px` (`§ proposed values`) |
| Content column maximum width | Always | `max-width: var(--dsh-settings-content-max)` |
| Responsive | — | No built-in breakpoint: on narrow screens the nav column stays a fixed width, and the caller adjusts `navWidth` in its own breakpoint |

## tokens

DSH semantic tokens (all of them can be looked up in `data/tokens.json`):

- `--dsw-alias-label-primary` — page title, section title, selected nav item text colour
- `--dsw-alias-label-secondary` — page description colour, unselected nav item text colour (`§ proposed values`)
- `--dsw-alias-label-tertiary` — nav icon colour, section description colour
- `--dsw-alias-bg-module-platform` — nav column ground (`§ proposed values`)
- `--dsw-alias-interactive-bg-hover` — nav item hover and selected ground
- `--dsw-alias-brand-primary` — focus ring colour (`§ proposed values`)

Component-level CSS variables (internal to this repository, not DSH tokens; defined on `.page`, and `navWidth` can override the first one):

- `--dsh-settings-nav-width` = `218px` (`navWidth` can override)
- `--dsh-settings-gap` = `32px`
- `--dsh-settings-pad` = `24px`
- `--dsh-settings-block-gap` = `24px`
- `--dsh-settings-radius` = `12px`
- `--dsh-settings-nav-pad` = `4px`
- `--dsh-settings-content-max` = `640px`

## a11y

- The left column is `<nav aria-label="…">`; when the page has other `<nav>` elements (the host sidebar, for example), always set `navLabel` to a different name, or the screen reader's landmark list shows several navs under the same name.
- The current section uses `aria-current="page"` (added automatically when `active` is true). Do not express "where you are" with the ground colour alone.
- The page title is an `<h1>` (`titleLevel` can demote it); `SettingsSection` defaults to `<h2>` and `ListRowGroup` defaults to `<h3>`; keep the heading hierarchy continuous and do not skip levels.
- When the nav item is a `<button>`, the caller takes over the route change after the click; when it is an in-page anchor, pass `href="#id"` so both the browser's own jump and "back" work.
- The nav column width is fixed, so on narrow screens it squeezes the content column. This component does not do responsive collapsing (that would need the host's breakpoints); in the host's own breakpoint, turn `navWidth` down or switch to horizontal scrolling.
- The content column's `max-width` only caps the upper bound; do not add `overflow: hidden` to the nav column, or the nav row's focus ring gets clipped (`AC-MF-12`).
- The focus ring uses `outline` rather than `box-shadow`, at 2px solid + `--dsw-alias-brand-primary` + a 2px outward offset (`AC-MF-11`).
- The nav row is 40px high, and the hit area is no smaller than `AC-MF-01`'s 28×28 regular control target.

## checks

Machine-checkable binary constraints (a true / false judgement settles each one, and each drops straight into a lint rule).

1. The left column's root element is `<nav>` with a non-empty `aria-label`; `navLabel` defaults to `'设置分区'`.
2. A nav item with `active === true` emits `aria-current="page"`; with `active === false` it emits nothing.
3. When `href` is present it renders `<a href>`; when it is not, it renders `<button type="button">`.
4. `SettingsSection` emits `aria-labelledby` pointing at the title element when `title` is present; when `title` is absent it emits nothing.
5. `titleLevel` defaults to `1`, `SettingsSection`'s `headingLevel` defaults to `2`, and `headingLevel` takes a value in `1`–`6`.
6. A `:focus-visible` focus style exists on the nav item, at `2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px` (`AC-MF-10` / `AC-MF-11`, matching `A48` in `spec/70-checklist.md`).
7. The nav column must not declare `overflow: hidden` (otherwise the focus ring is clipped, `AC-MF-12`).
8. The nav item's hit area is at least 28px high (`AC-MF-01`, matching `A43` in `spec/70-checklist.md`).
9. The content column declares `max-width: var(--dsh-settings-content-max)`, the nav column `flex: none`, and the content column `flex: 1` + `min-width: 0`.
10. The nav item's text container declares `overflow: hidden` / `text-overflow: ellipsis` / `white-space: nowrap` together.
11. When `navWidth` is a number it is written as `px`; when it is a string it is written into `--dsh-settings-nav-width` as is.
12. The vertical spacing between sections comes from `--dsh-settings-block-gap` and must not fall below the 16px of `spec/10-frame-layout.md` `FL-AD-07`.
13. The component imports no other component in the repository (no relative-path import in the source, only `react` and its own CSS Modules).
14. The usage location must belong to the settings area (the plugin's own standalone settings page) and must not be used in the conversation (human review, the cross-region decision table in section 4 of `spec/10-frame-layout.md`).
15. Narrow-screen handling is done by the caller inside the host's breakpoint (turning `navWidth` down or switching to horizontal scrolling), and the documentation example must show one of the two (human review, `AC-MF-16`).

## demo

- `components/patterns/SettingsPage/demo.html`

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist entries: `spec/70-checklist.md` (`A43`, `A48`, `B01`)
- Cross-region decisions and spacing clauses: `spec/10-frame-layout.md` (`FL-AD-07`, `FL-RC-05`)
- Accessibility clauses: `spec/60-accessibility.md` (`AC-MF-01`, `AC-MF-10`, `AC-MF-11`, `AC-MF-12`, `AC-MF-16`)
- Seat documentation: section 4 of `spec/11-slot-seats.md`
