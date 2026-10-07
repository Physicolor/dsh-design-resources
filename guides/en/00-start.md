---
source: guides/00-start.md
source-sha256: 41dee3ad2bade73a
translated-at: 2026-10-07
---
# Guide overview: read the screen first, then the region, then the seat

> This guide helps DeepSeek Harness plugin authors see how one screen is put together, then decide which region an interface belongs to and which public extension seat it can use, and finally build the content from real product copy and controls.

## What this page gets you

- Say what a freshly opened conversation screen is made of, band by band, and tell which bands the product gives a seat to and which it does not.
- Decide whether a feature is a global preference, a full settings section, or an option that only affects the current task or conversation.
- Filters, show/hide and sorting on the current view go near the content they act on; only cross-session preferences belong in global settings.
- Tell the left sidebar, the centre conversation column, the empty bands beside it and the host right column apart; do not read a plugin-drawn interface as native DSH UI.
- Pick controls that actually exist, and say what each one is good for.
- Check a page example item by item against local live screenshots and official source.

## What the screen is made of

<!-- demo: frame-columns | A region map of one screen: the product replica is built from measured sizes (left sidebar 280, centre column fluid, right column openable), and the pointer marks whichever part it sweeps over. The seat behind each band is listed in the table below; the full version is the [region map](../spec/05-region-map.md). -->

The DSH window is **three independent full-height tracks** with no bar spanning the window: the left, centre and right columns each own their own head. So "where does this button go" is first a question about which track, and only then about which band inside it.

| Track | Band, top to bottom | Official seat | Can a plugin mount there |
| --- | --- | --- | --- |
| Left | Brand row | Mark and product name | Host only |
| Left | Global panel entries (`插件`, `自动化任务`) | The panel icon list | Additive |
| Left | Workspace and conversation list | The block belongs to the host; row actions and the "…" menu are additive | Partly additive |
| Left | Foot: settings entry plus an extension action area | The settings entry is the host's; the action area beside it is additive | Partly additive |
| Centre | Resident navigation header (present with no conversation) | Global navigation, left of the conversation title | Host only |
| Centre | Conversation header: title, title-adjacent actions, right-aligned utilities, far corner | Three public seats; the far corner takes **one control only** | Additive |
| Centre | View area (the conversation / trajectory / context tab strip) | The conversation view registry, **rendered one at a time** | Additive |
| Centre | Composer card and the insertion points around it | The composer tool row, above the card, below the card, a layer inside the card | Additive |
| Centre | **The empty bands either side of the conversation column** | **No seat** | Borrow another seat |
| Right | Once open it is its own track, not a floating layer | The track and its session content belong to the host; actions inside a tab are additive | Partly additive |

Three things worth remembering after this page:

1. **The right column is the fourth column of the page; the bands beside the centre column are the remainder after centring.** The right column sets its own width and is never narrower than 300px; the bands can shrink to 0. That is the only reliable line between them.
2. **The tab strip in the centre column is not three hard-coded pages.** The product describes that seat as registered conversation views, rendered one at a time — whoever registers, adds one more switchable view.
3. **Places with no seat exist, and there is more than one.** The bands beside the conversation column, a standalone plugin settings window and a global top bar are all in that class. Use them under a community agreement, and say in your plugin docs that the product has no seat there.

Band-by-band detail, and the list of four places where the product gives no seat, is in the [Region map](../spec/05-region-map.md). Whether to fill the centre column or take a tab is in [Can the centre column be used on its own?](15-middle-column.md).

## Decide in this order

| Your question | Look at first | Public seat or structure |
| --- | --- | --- |
| I am not sure which track or band my content belongs to | [Region map](../spec/05-region-map.md) | Settle the region before the seat |
| I want the centre column, but not whether to fill it, take a tab, or float a layer | [Can the centre column be used on its own?](15-middle-column.md) | `conversation.view` is the tab mechanism; the empty bands have no seat |
| One global preference, such as language, appearance or conversation behaviour | [Put the preference in General settings](20-pattern-settings.md#a-preference-in-general-settings) | `settings.general.item` |
| Filters, display or sorting that only affect the current view | Put them near the content they act on; check the public seat for that feature first | Do not write temporary view state as a global `settings.general.item` preference |
| A set of plugin settings that need a page of their own | [Add a section in Settings](20-pattern-settings.md#when-you-need-a-settings-page-of-its-own) | `settings.section`; the host Settings window still hosts the page |
| Persistent supporting content for the current session | [Conversation, overlay and rightbar](21-pattern-sidebar-panel.md#plugin-content-inside-the-conversation) | Pick `conversation.*` or `rightbar.*` from the public API |
| A plugin entry, workspace or action beside the settings entry in the left sidebar | [What the left sidebar is made of](21-pattern-sidebar-panel.md#what-regions-the-left-sidebar-is-made-of) | `sidebar.panellist`, `sidebar.workspaces`, `sidebar.footer.action` |
| The product has no seat, but I really want to put it there | [Places the product gives no seat](31-unofficial-regions.md) | Borrow an existing seat, and say in your README that the product has no seat there |
| A standalone plugin settings window | Read [The boundary of a standalone plugin window](20-pattern-settings.md#the-boundary-of-a-standalone-plugin-window) first | The current public seat list has no dedicated plugin-window seat; do not assume one exists |

`dsh-widgets` works as a community example of plugin content that sits close to the conversation: its session statistics band occupies the empty band on the right of the centre column, borrowing `conversation.input.overlay`; its panel toggle sits in the conversation header's right-aligned utilities, and its data summary below the composer card. Those cards come from the plugin, not from a DSH default component; it does not occupy the host right column either. The full discipline for borrowing is in [Places the product gives no seat](31-unofficial-regions.md).

## What this guide covers, and what it does not

This guide explains what each region of the native DSH window is for, the public extension seats, the places where the product gives no seat, and the controls the product really ships. It is not a brand skin, and it does not put personal taste in the place of a judgement about interface hierarchy, region relationships or control semantics. Anything this repository proposes is marked apart from official source or runtime observation.

## How screenshots relate to the HTML

Screenshots of a running DSH serve one-by-one checks only. Review crops live in docs/reference/review-crops/ and are never embedded as images in the generated site; the HTML on the site is a structural example you can inspect on its own. A screenshot cannot prove a state outside the frame, and an example cannot pass community plugin content off as native host UI. The item-by-item mapping is in [Demo evidence](../docs/reference/demo-evidence.md).

Clean screenshots use a separate design-guide-clean profile that loads only the official DeepSeek base, web-app and schedule bundles; it never turns off or alters the plugin configuration you are using. A full-session screenshot can contain personal prose, so only the local crops the current check needs are kept. When a host tab has no clean full-screen capture, it is marked as verified against source or a user reference, never claimed as a clean live shot.

## Evidence markers

This repository has exactly five source markers, and every value has to carry one of them. A value with no marker is a defect:

| Marker | Meaning |
| --- | --- |
| `[Official source]` | A fact from DSH official source, public documentation or the public seat list |
| `[Runtime measurement]` | Measured in an explicitly recorded DSH profile and version; not generalised to other versions or plugin sets |
| `[Borrowed principle]` | A clause from an outside guide, rewritten here before it is cited, with no platform-specific values carried over |
| `[Proposed here]` | Community guidance where official material is silent; not a DSH commitment |
| `[Known deviation]` | The official implementation conflicts with this spec, or two pieces of evidence contradict each other; record it, do not override the official |

Older `spec/` documents write a second set (`[DSH-CSS]` / `[measured]` / `[HIG]` / `[OH]` / `[repo-recommendation]`). The two correspond one to one; do not mix them inside one document. The mapping is in [section 4.2 of the Overview](../spec/00-overview.md).

One label is not a source marker: `[Plugin example]` points out that something is a plugin's own implementation or layout. It shows the extension relationship and is not the source of any value.

## Suggested reading order

1. [Region map](../spec/05-region-map.md): what the screen is made of, and which places the product gives no seat to.
2. [Can the centre column be used on its own?](15-middle-column.md): fill it, take a tab, or float a layer.
3. [Choose an extension area](10-principles.md): see whether the content is global, persistent, or belongs only to the current session.
4. [Settings page patterns](20-pattern-settings.md): compare a General settings item, a settings section and the standalone-window boundary.
5. [Sidebar and panel extensions](21-pattern-sidebar-panel.md): see how the left sidebar, the centre column, an overlay and the right column differ.
6. [Controls and layout elements](../components/index.json): reuse the buttons, switches, dropdowns and session view tabs that actually exist.
7. [Seat selection and extension integration](30-seats-integration.md): turn the interface choice into an API, types and coexistence constraints.
8. [Self-check and sources](40-selfcheck-sources.md): check the screenshot mapping, sources and known limits.

## Sources

- `data/slots.json`: public seat names, kinds, scopes, replacement risk and purpose (collected 2026-10-01).
- `docs/reference/clean-capture/README.md`: the capture boundary for the clean profile.
- `components/origins.json`: separates product-native elements from what this repository proposes.
- `packages/client/AGENTS.md`: slot declaration and contribution discipline.
