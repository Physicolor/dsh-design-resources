---
source: guides/00-start.md
source-sha256: 877c8e04c3989773
translated-at: 2026-10-05
---
# Guide overview: choose the spot first, then design the interface

> This guide helps DeepSeek Harness plugin authors decide where an interface belongs and which public extension seat it can use, then build the content from real product copy and controls.

## What this page gets you

- Decide whether a feature is a global preference, a full settings section, or an option that only affects the current task or conversation.
- Filters, show/hide and sorting on the current view go near the content they act on; only cross-session preferences belong in global settings.
- Tell the left sidebar, the conversation overlay and the host rightbar apart; do not read a plugin-drawn interface as native DSH UI.
- Pick controls that actually exist, and say what each one is good for.
- Check a page example item by item against local live screenshots and official source.

## Decide in this order

| What you have | Look at first | Public seat or structure |
| --- | --- | --- |
| One global preference, such as language, appearance or conversation behaviour | [Put the preference in General settings](20-pattern-settings.md#a-preference-in-general-settings) | `settings.general.item` |
| Filters, display or sorting that only affect the current view | Put them near the content they act on; check the public seat for that feature first | Do not write temporary view state as a global `settings.general.item` preference |
| A set of plugin settings that need a page of their own | [Add a section in Settings](20-pattern-settings.md#when-you-need-a-settings-page-of-its-own) | `settings.section`; the host Settings window still hosts the page |
| Persistent supporting content for the current session | [Conversation, overlay and rightbar](21-pattern-sidebar-panel.md#plugin-content-inside-the-conversation) | Pick `conversation.*` or `rightbar.*` from the public API |
| A plugin entry, workspace or action beside the settings entry in the left sidebar | [What the left sidebar is made of](21-pattern-sidebar-panel.md#what-regions-the-left-sidebar-is-made-of) | `sidebar.panellist`, `sidebar.workspaces`, `sidebar.footer.action` |
| A standalone plugin settings window | Read [The boundary of a standalone plugin window](20-pattern-settings.md#the-boundary-of-a-standalone-plugin-window) first | The current public seat list has no dedicated plugin-window seat; do not assume one exists |

`dsh-widgets` works as a community example of plugin content that sits close to the conversation: it registers its panel in `conversation.input.overlay` and puts its data summary in `conversation.composer.dock`. Those cards come from the plugin, not from a DSH default component; it does not occupy the host `rightbar` either. Details in [Conversation, overlay and rightbar](21-pattern-sidebar-panel.md#plugin-content-inside-the-conversation).

## What this guide covers, and what it does not

This guide explains what each region of the native DSH window is for, the public extension seats, and the controls the product really ships. It is not a brand skin, and it does not put personal taste in the place of a judgement about interface hierarchy, region relationships or control semantics. Anything this repository proposes is marked apart from official source or runtime observation.

## How screenshots relate to the HTML

Screenshots of a running DSH serve one-by-one checks only. Review crops live in docs/reference/review-crops/ and are never embedded as images in the generated site; the HTML on the site is a structural example you can inspect on its own. A screenshot cannot prove a state outside the frame, and an example cannot pass community plugin content off as native host UI. The item-by-item mapping is in [Demo evidence](../docs/reference/demo-evidence.md).

Clean screenshots use a separate design-guide-clean profile that loads only the official DeepSeek base, web-app and schedule bundles; it never turns off or alters the plugin configuration you are using. A full-session screenshot can contain personal prose, so only the local crops the current check needs are kept. When a host tab has no clean full-screen capture, it is marked as verified against source or a user reference, never claimed as a clean live shot.

## Evidence markers

| Marker | Meaning |
| --- | --- |
| `[Official source]` | A fact from DSH official source, public documentation or the public seat list |
| `[Runtime measurement]` | Measured in an explicitly recorded DSH profile and version; not generalised to other versions or plugin sets |
| `[Proposed here]` | Community guidance where official material is silent; not a DSH commitment |
| `[Plugin example]` | One plugin's own interface or layout, used only to show the extension relationship |
| `[Not yet checked]` | No clean live shot or official source backs it yet, so it does not count as a spec fact for now |

## Suggested reading order

1. [Choose an extension area](10-principles.md): see whether the content is global, persistent, or belongs only to the current session.
2. [Settings page patterns](20-pattern-settings.md): compare a General settings item, a settings section and the standalone-window boundary.
3. [Sidebar and panel extensions](21-pattern-sidebar-panel.md): see how the left sidebar, conversation area, overlay and rightbar differ.
4. [Controls and layout elements](../components/index.json): reuse the buttons, switches, dropdowns and session view tabs that actually exist.
5. [Seat selection and extension integration](30-seats-integration.md): turn the interface choice into an API, types and coexistence constraints.
6. [Self-check and sources](40-selfcheck-sources.md): check the screenshot mapping, sources and known limits.

## Sources

- `data/slots.json`: public seat names, kinds, scopes, replacement risk and purpose.
- `docs/reference/clean-capture/README.md`: the capture boundary for the clean profile.
- `components/origins.json`: separates product-native elements from what this repository proposes.
