---
source: components/controls/Input/SPEC.md
source-sha256: eb4d931ad143d08a
translated-at: 2026-10-05
---
# Input · SPEC

- id: input
- category: controls
- source: `components/controls/Input/` (`index.tsx` / `input.module.css`)
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/Input.module.css` and `function Input` in `lib/index.js`
- human-doc: `README.md` (judgement and trade-offs; this file holds facts only)

## geometry-source

Values are read one by one from the official `Input.module.css`; the notation is "value ← filename selector".

| Value | Source |
| --- | --- |
| `height: 32px` / `padding: 0 8px` / `gap: 6px` / `border-radius: 8px` | `Input.module.css` → `.wrap` |
| `border: 0.5px solid var(--dsw-alias-border-l4)` / `background: var(--dsw-alias-bg-layer-1)` / `display: inline-flex` / `align-items: center` | `Input.module.css` → `.wrap` |
| `border-color: var(--dsw-alias-brand-primary)` | `Input.module.css` → `.wrap:focus-within` |
| `width: 16px` / `height: 16px` / `align-items: center` / `justify-content: center` / `color: var(--dsw-alias-label-tertiary)` | `Input.module.css` → `.icon` |
| `flex: 1` / `min-width: 0` / `border: none` / `outline: none` / `background: transparent` | `Input.module.css` → `.input` |
| `font-size: 14px` / `line-height: 22px` / `color: var(--dsw-alias-label-primary)` | `Input.module.css` → `.input` |
| `color: var(--dsw-alias-label-dimmed)` | `Input.module.css` → `.input::placeholder` |
| Structure: an outer shell `<span class=wrap>`; when `icon` is present a `<span class=icon>` is inserted first, then `<input class=input>`, and every other attribute is spread onto the `<input>` | `lib/index.js` → `function Input({ icon, className, ...rest })` |

### Values proposed by this repository (not official values)

- `.wrap:has(.input:disabled) { opacity: 0.4; cursor: not-allowed; }`: the official `Input.module.css` has no disabled visuals at all, so a disabled input looks exactly like an enabled one and users only find out after they click it. Both values are taken directly from `.button:disabled` in the official `Button.module.css` (`cursor: not-allowed` + `opacity: 0.4`), so that "disabled = 0.4" reads the same way throughout the repository. This relies on `:has()` (Chrome 105+ / Safari 15.4+ / Firefox 121+); if you need to support older runtimes, the caller has to add a class to the shell.
- `flex: none` on `.icon`: the official CSS declares only `display: inline-flex` + 16×16. With no shrink constraint on the container, long content can squash the icon; `flex: none` locks it at 16×16.
- `font-family: inherit` on `.input`: not declared officially. An `<input>` does not inherit the font from its ancestors; without it the browser falls back to the system default font, which does not match the rest of the page.
- `box-sizing: border-box` on `.wrap`: not declared officially. The shell has a `0.5px` border; without `border-box` the rendered height comes out 1px taller.

### Implementation notes

- This implementation is original to this repository: the geometry is carried by component-level CSS variables on `.wrap` (`--dsh-input-height` / `--dsh-input-pad-x` / `--dsh-input-gap` / `--dsh-input-radius` / `--dsh-input-icon-size` / `--dsh-input-font-size` / `--dsh-input-line-height`), and the structure has three parts: shell / icon / input.
- `--dsh-input-*` are internal variables of this repository, not DSH tokens.
- `ref` is forwarded to the inner native `<input>` (not the shell); both `ref.current.focus()` and `selectionStart` work.

## api

`InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>`, `forwardRef<HTMLInputElement, InputProps>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `ReactNode` | none | Optional leading icon node, placed in a 16×16 icon container; when `null` / `undefined` is passed the container is not rendered at all |
| `className` | `string` | none | Class appended to the **outer container**, for layout positioning from the outside |
| Everything else | `InputHTMLAttributes<HTMLInputElement>` | — | `value` / `onChange` / `placeholder` / `type` / `disabled` / `readOnly` / `autoFocus` / `onKeyDown` / `aria-*` and the rest are forwarded to the inner `<input>` unchanged |
| `ref` | `Ref<HTMLInputElement>` | none | Forwarded to the inner `<input>` |

## states

| State | Trigger | Behaviour |
| --- | --- | --- |
| Default | `.wrap` | Border `0.5px solid var(--dsw-alias-border-l4)`; background `var(--dsw-alias-bg-layer-1)`; corner radius 8px |
| Focus (including focus inside the inner input) | `.wrap:focus-within` | `border-color: var(--dsw-alias-brand-primary)`; the inner input itself has `outline: none`, so focus is expressed by the shell alone |
| Placeholder text | `.input::placeholder` | `color: var(--dsw-alias-label-dimmed)` |
| Text entered | `.input` | Text `--dsw-alias-label-primary`, 14 / 22 |
| Disabled | `.wrap:has(.input:disabled)` | `opacity: 0.4` + `cursor: not-allowed` (value proposed by this repository) |
| Read-only | `readOnly` | No separate visuals; `readOnly` does not drop out of the Tab sequence, and the field can still be read out and selected |
| hover / active | — | Not defined. An input has no pressed state, so there is no `:hover` visual |
| Error | — | This component has no error state; the outer container renders the error text, and `aria-invalid` / `aria-describedby` are forwarded by the caller |

## tokens

DSH semantic tokens:

- `--dsw-alias-border-l4` — shell border colour
- `--dsw-alias-bg-layer-1` — shell background
- `--dsw-alias-brand-primary` — border colour when focused
- `--dsw-alias-label-tertiary` — leading icon colour
- `--dsw-alias-label-primary` — entered text colour
- `--dsw-alias-label-dimmed` — placeholder text colour

Component-level CSS variables (internal to this repository, not DSH tokens):

- `--dsh-input-height` (`32px`)
- `--dsh-input-pad-x` (`8px`)
- `--dsh-input-gap` (`6px`)
- `--dsh-input-radius` (`8px`)
- `--dsh-input-icon-size` (`16px`)
- `--dsh-input-font-size` (`14px`)
- `--dsh-input-line-height` (`22px`)

## a11y

- An input needs an accessible name. Placeholder text is not a name (it disappears once you type, and screen readers do not always treat it as a label); provide an `aria-label`, or point an outer `<label htmlFor>` at the inner input's `id`.
- A leading icon should carry `aria-hidden="true"`, or the text nodes inside it get read out; the icon's meaning should be carried by the input's own name (`AC-MF-14`).
- Focus uses one signal only: the inner `<input>` is set to `outline: none`, and focus is expressed by the shell's `:focus-within` border colour. This is the official approach; do not add a second focus ring to the inner input, or two rings appear. Here `outline: none` does not violate `AC-MF-10`, because an alternative focus style exists in the same area; the automatic check for `AC-MF-10` must run on "no alternative on the same selector" rather than "`outline: none` appears".
- The error state is not this component's job: forward `aria-invalid` and `aria-describedby`, and let the outer layer render the error text.
- `disabled` takes the input out of the Tab sequence. If you only want "you cannot change it for now, but it still has to be readable", use `readOnly` with `aria-readonly`.
- Pick `type` by meaning (`email` / `url` / `search`); mobile then offers a more suitable keyboard.
- Hit area: 32px tall, meeting `AC-MF-01`'s 28×28 target for a regular control.

## checks

Binary constraints a machine can check (decidable as true / false, and directly expressible as lint rules).

1. `ref` points at the inner `<input>` (`ref.current` has `focus` and `selectionStart`), not the shell `<span>`.
2. `className` is applied to the shell and does not appear in the inner `<input>`'s class list.
3. When `icon` is `null` / `undefined` the icon container is not rendered; when `icon` is present the container is 16×16 and carries `flex: none`.
4. `box-sizing: border-box` is present on `.wrap` (value proposed by this repository, keeping the 32px height equal to the rendered height).
5. A focus visual exists: the `border-color` of `.wrap:focus-within` is `--dsw-alias-brand-primary`.
6. The inner `<input>` is `outline: none`, and an alternative focus style exists in the same area (the alternative test for `AC-MF-10`).
7. `.input` declares `font-family: inherit` (value proposed by this repository, keeping `<input>` from falling back to the system font).
8. A disabled state visual exists (`opacity: 0.4` + `cursor: not-allowed`), with values matching `.button:disabled` in the official `Button.module.css` (value proposed by this repository).
9. No hard-coded colour values appear in the source (`TK-MF-01`); all six colours come from `--dsw-alias-*`.
10. The height reuses the official 32px geometry per `CT-MF-01`, and must not be overridden externally to 36px or 28px.

## demo

- `components/controls/Input/demo.html`

## Real scenes (reconciled against docs/reference screenshots)

**Not covered by the screenshots**: none of the 7 screenshots shows how this component looks (white `bg-layer-1` + 0.5px `border-l4` + `h32` + `r8`).

Candidates ruled out one by one:

| Candidate | Shot | As captured | Why it is not this component |
| --- | --- | --- | --- |
| Settings · the number box for `字号大小` | `03-settings-open.png` | 72 × 36, light grey fill, **no visible border**, corner radius about 8–10 | Height 36 rather than 32; the background is not `bg-layer-1`; there is no `0.5px border-l4` border |
| Composer card placeholder text `发消息或创建任务…` | `01-hero.png` / `07-composer.png` | Multi-line, borderless | It is the composer card's own multi-line editing area, not a single-line `<input>` |
| Settings panel header `打开配置文件` | `03-settings-open.png` | 94 × 28 | It is a Button (outline / sm) |

Handling rule: every demo uses a **neutral geometry reproduction**, each group is labelled "not covered by the screenshots", and the copy uses only "example text / example value", pointing to no particular use case.

## Related

- Human-readable version: `README.md`
- Two-track writing convention: `docs/WRITING.md`
- Checklist entries: `spec/70-checklist.md` (`A18`, `A19`, `A23`, `A43`, `A48`, `A49`)
