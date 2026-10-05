---
source: components/controls/Button/SPEC.md
source-sha256: 87052aef31a5d25f
translated-at: 2026-10-05
---
# Button · SPEC

- id: button
- category: controls
- source: components/controls/Button/ (index.tsx / button.module.css)
- official-counterpart: @deepseek-ai/dsh-client-ui-primitives/lib/Button.module.css
- human-doc: README.md

## Official geometry

| Variant | Product value | Official selector |
| --- | --- | --- |
| Standard | height 36px; padding 0 14px; gap 4px; radius var(--dsw-radius-md), resolved to 12px; font 14px / 22px | .md and .button |
| Compact | height 28px; padding 0 10px; radius var(--dsw-radius-sm), resolved to 8px; font 12px / 18px | .sm |
| Leading icon | container 16 × 16 | .icon |
| Outline stroke | 0.5px solid var(--dsw-alias-border-l3) | .outline |
| Disabled | opacity 0.4; native disabled attribute | .button:disabled |

The product package uses the shared radius tokens. Older local copies of DSH primitives reported 18px and 14px; those values do not match the installed product CSS and are not the geometry to reproduce.

## Repository wrapper

This folder implements a small React wrapper around a native button. It reuses the official dimensions and visual tokens; it is not the exported DSH implementation.

| Prop | Type | Default | Use |
| --- | --- | --- | --- |
| variant | primary / ghost / outline / toolbar | ghost | Visual weight |
| size | md / sm | md | Standard 36px or compact 28px |
| icon | ReactNode | none | Leading 16 × 16 icon |
| iconOnly | boolean | false | Repository wrapper option; square wrapper with an accessible label |
| type | button / submit / reset | button | Native form behaviour |
| disabled | boolean | false | Native disabled state |

## States

| State | Source-backed result |
| --- | --- |
| Primary hover | button-primary-hover token |
| Ghost hover / active | interactive-bg-hover / interactive-bg-active |
| Outline hover | interactive-bg-hover |
| Toolbar hover | button-tool-bar-hover |
| Disabled | opacity 0.4 and not-allowed cursor |
| Focus-visible | The local wrapper adds a visible focus ring; this is a repository recommendation, not a rule from the DSH Button module |

## Clean runtime examples

| Visible label | Context | Observed size |
| --- | --- | --- |
| `打开配置文件` | General Settings header, compact outlined DSH Button primitive | 94 × 28 |
| `编辑` | Model provider card action | Screenshot confirms the real label and outlined appearance; no exact dimensions are claimed |

The demo uses labels verified in the clean profile. `编辑快捷键` is also visible in General Settings, but its captured element is a SettingsRow-owned action rather than the exported Button primitive; it is not presented as a Button variant. The screenshots stay in docs/reference/ for local review and are not embedded in the site.

## Checks

1. Keep standard and compact dimensions at 36px and 28px.
2. Use the official radius tokens: md 12px, sm 8px.
3. Keep the icon container at 16 × 16.
4. Use native disabled and button semantics.
5. Do not use a button to represent a link, a setting value, or a selected view.
