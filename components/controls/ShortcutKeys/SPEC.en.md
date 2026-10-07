---
source: components/controls/ShortcutKeys/SPEC.md
source-sha256: d17cd0c2474ed7fc
translated-at: 2026-10-07
---
# ShortcutKeys · SPEC

- id: shortcut-keys
- category: controls
- source: `components/controls/ShortcutKeys/` (`index.tsx` / `shortcut-keys.module.css`)
- official-counterpart: Really exists in the product — the client CSS module `_keys_38b9q_1` (`.keys` / `.key` / `.separator` / `.tooltip` / `.joined`), markup is `<kbd className={key === '+' ? separator : key}>`. The official primitives package has no separate ShortcutKeys entry (the product client carries its own set)
- human-doc: `README.md` (judgement and trade-offs; this file holds facts only)

## geometry-source

Collected item by item from the running product: `docs/reference/plugin-row.json`, `01-hero.png`, and the CSS text of that module in the product bundle.

| Value | Where it comes from |
| --- | --- |
| `.keys { display:inline-flex; flex:none; align-items:center; gap:3px; color: var(--dsw-alias-label-tertiary); font-size:12px; line-height:16px; white-space:nowrap }` | `_keys_38b9q_1 { … }` (measured: keycap 19 × 16, colour rgb(129,133,140)) |
| `.key { box-sizing:border-box; display:inline-flex; align-items:center; justify-content:center; font:inherit }` | `_key_38b9q_1`; measured `background: rgba(0,0,0,0)`, `border-radius: 0`, `padding: 0` — the plain form has no fill |
| `.separator { font:inherit }` | `_separator_38b9q_30`; measured the `+` separator is 8px wide and the same font size as the keys |
| `.tooltip { color:inherit; font-size:11px; line-height:14px; gap:2px }` | `_tooltip_38b9q_20` |
| `.tooltip .key { min-width:16px; height:16px; padding:0 2px; border-radius:4px; background: var(--dsw-alias-tooltip-key-bg) }` | `_tooltip_38b9q_20 ._key_38b9q_1` |
| `.joined { box-sizing:border-box; height:16px; padding:0 4px; border-radius:4px; background: var(--dsw-alias-tooltip-key-bg) }` `.joined .key { min-width:0; height:auto; padding:0; background:transparent }` | `_joined_38b9q_32` and its child selectors |

The show/hide on the consuming side (the product writes it as another module, see `CT-MF-18` in `spec/20-controls.md`):

| Value | Where it comes from |
| --- | --- |
| `newSessionShortcut { opacity: 0; pointer-events: none; flex: none; font-weight: 400; display: inline-flex }` | `_2H3hWW_newSessionShortcut` |
| `newSession:is(:hover, :focus-visible) .newSessionShortcut { opacity: 1 }` | The same module |
| `newSession:is(:hover, :focus-visible) .newSessionLabelMask:has(+ .newSessionShortcut) { overflow:hidden; mask-image: linear-gradient(90deg, #000 calc(100% - 16px), #0000) }` | The same module |
| The container has `aria-hidden="true"`; the key combination is written on the trigger button's `aria-keyshortcuts` | Product markup (such as `Control+Alt+K` for searching conversations, `Control+Alt+O` for adding a workspace) |

### Proposed here (no official source)

- The naming of `ShortcutKeysVariant` (`plain` / `tooltip` / `joined`): the product has only CSS class names, with no public variant enum; these three words are this repository's names for the same set of forms.
- `keys: string[]` plus "`+` renders automatically as a separator": the product passes `+` in as an array element right at the call site (`keys.map(key => key === '+' ? separator : key)`), and this component implements the same convention, offering no extra `join` parameter.
- forwardRef to the outermost `<span>`: in the product that layer is carried by the caller's container; this component exposes it itself, so that the caller can lay out or measure it.

### How it relates to the spec

- `spec/20-controls.md` §6 is this component's spec source (`CT-MF-17` / `18` / `19`).
- `spec/50-icons.md` is about icons and does not apply to keycaps; keycaps are text, not a graphic asset.

## api

`ShortcutKeysProps`, `forwardRef<HTMLSpanElement, ShortcutKeysProps>`.

| Property | Type | Default | Notes |
| --- | --- | --- | --- |
| `keys` | `string[]` | required | The keys, in the order they are written. `+` renders as a separator |
| `variant` | `'plain' \| 'tooltip' \| 'joined'` | `'plain'` | The three official forms |
| `className` | `string` | none | Appended after the outermost `<span>`'s own class name |
| `ref` | `Ref<HTMLSpanElement>` | none | Passed through to the outermost `<span>` |

## states

The component has no interactive states (it accepts no clicks and has no hover / focus styling). The render branches are only `variant` and the contents of `keys`:

| State | Trigger | What it looks like |
| --- | --- | --- |
| Plain | `variant` omitted | Pure text keys, no fill |
| Tooltip | `variant="tooltip"` | 11px, a light fill behind each key |
| Joined | `variant="joined"` | One light fill behind the whole group; the keys themselves have no fill |
| Empty array | `keys=[]` | Renders an empty container (the caller should avoid this; with no keys, render nothing) |
| Contains `+` | `keys` contains `'+'` | That entry renders as `.separator`, at the same font size as the keys |

## tokens

- `--dsw-alias-label-tertiary` — the text colour of the plain form
- `--dsw-alias-tooltip-key-bg` — the key fill of the tooltip / joined forms (resolves to `color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)`)
- `--dsw-alias-tooltip-bg` — the base colour of the above token (the light-theme value #2c2c2e); this component does not use it directly; it is listed so that anyone retheming knows where the key fill comes from

## a11y

- The container is fixed at `aria-hidden="true"`: the keys are decoration, and a screen reader gets them from the trigger element's `aria-keyshortcuts`. **Do not** remove aria-hidden from this container just to make a screen reader speak the keys — that would have the same keys read out twice.
- It carries no interaction: no `tabIndex`, no `onClick`; a keyboard user presses the real button.
- Showing and hiding (`opacity: 0` → shown on hover / focus-visible) is up to the caller's container, not this component — because when to show the keys is that button's call, not the keycap's.
- Colour comes only from `--dsw-alias-label-tertiary`: in the dark theme the token inverts, so the component needs no branch.

## checks

1. The root element is a `<span>` with `aria-hidden="true"`.
2. Each key renders as `<kbd>`; `'+'` renders as `.separator` and the rest as `.key`.
3. `.keys` has a `gap` of `3px`, a `font-size` of `12px` and a `line-height` of `16px` (plain form).
4. In the plain form `.key` has no `background` and no `border-radius` (`CT-MF-17`).
5. With `variant="tooltip"`, `.key` is `min-width:16px; height:16px; padding:0 2px; border-radius:4px` and its fill is `--dsw-alias-tooltip-key-bg`.
6. With `variant="joined"`, the container is `height:16px; padding:0 4px; border-radius:4px`, and the inner `.key` has no fill.
7. The component imports no runtime dependency other than `react` (including `@deepseek-ai/*`).
8. `shortcut-keys.module.css` contains no hexadecimal colour literals, no `rgb(` and no `hsl(`.
9. The source contains no `onClick` / `onKeyDown` / `tabIndex`.

## demo

- `components/controls/ShortcutKeys/demo.html`

## Related

- Human-readable version: `README.md`
- Spec: `spec/20-controls.md` §6 (`CT-MF-17/18/19`)
- Collected from: `docs/reference/plugin-row.json`, `docs/reference/01-hero.png`
