---
source: guides/10-principles.md
source-sha256: 1afe059245e3b03e
translated-at: 2026-10-07
---
# Choosing an extension region: decide where it goes first

> An interface belongs in the region that explains how it relates to the host. First decide whether this is a global preference, main-flow content, or a supporting view for the current conversation; then pick the seat and the controls.

## What this page gets you

- Pick a suitable DSH region for a plugin feature.
- Tell the Settings page, the conversation overlay, the host rightbar and the left sidebar apart.
- Say whether an extension area is part of the product as it stands, a public seat, or one plugin's own implementation.

## Ask four questions first

1. **Does it apply to every conversation?** When the preference is global, put it in Settings first; when it only affects the current conversation, keep it in the conversation area.
2. **Is the user changing one value, or a whole group of settings?** One global preference usually needs a single row in General settings; several related settings groups need a settings section.
3. **Does it have to stay visible at all times?** Only supporting content that changes with the current conversation and needs to be watched continuously is a candidate for a permanent region inside the conversation.
4. **Is it for reading information, or for completing the main flow?** The rightbar can be collapsed, so main-flow actions cannot live only there.

## Global preferences and options for the current task

Apple HIG offers a useful cross-platform review question: is this an app preference that persists across tasks, or an action that only affects the current task? Filtering, show/hide or sorting for the current task belongs near the content it affects; global preferences go into the Settings page instead. [Borrowed principle] This is a review method, not a DSH extension API or a mandatory rule.

In a DSH plugin, first see whether the preference applies across conversations, then check the public seat that fits. Do not add `settings.general.item` just for a piece of temporary state in the current view; an in-view entry point still has to be backed by a published seat.

## Choosing a region by relationship

| What you display | Consider first | Do not do this |
| --- | --- | --- |
| One global preference, such as language or appearance | `settings.general.item`, as one row in General settings | Add a whole page menu for a single value |
| Several related settings groups | `settings.section`, adding one section to the host Settings page | Wrap another self-made settings window around it |
| Object, workspace or conversation navigation | The public child seats `sidebar.panellist`, `sidebar.workspaces` | Replace the whole `sidebar` |
| The main content view in the current conversation | `conversation.session` / `conversation.view` | Put it in the rightbar, which is for supporting views only |
| Floating supporting content for the current conversation | Check `conversation.input.overlay` and other public conversation seats, and what each one is for | Call a plugin overlay inside the conversation area a host rightbar |
| Looking at context, files or a preview temporarily | A public tab seat under `rightbar.session` | Build another sidebar |
| A standalone plugin settings window | The current public seat list has no dedicated standalone-window seat | Treat `shell.overlay` as a new-window API |

## One real plugin layout example: dsh-widgets

`dsh-widgets` registers its toolbar toggle at `conversation.session.header.utilities`, registers its statistics rail on the right at `conversation.input.overlay`, and puts conversation statistics in `conversation.composer.dock`. Its rail follows the edge of the main conversation column; it is not the `rightbar`, and these statistics cards are not DSH's own controls either. [Plugin example]

There is a boundary here that needs to be said clearly: the public purpose of `conversation.input.overlay` is described as "showing floating content inside the always-present input card"; `dsh-widgets` uses CSS to place this conversation-level entry point as a panel that hugs the edge inside the conversation area. That proves one plugin implementation, but it does not mean the host guarantees every plugin can treat that seat as a general-purpose sidebar. [Official source] / [Plugin example]

The real host rightbar is the separate `rightbar` column; its conversation content is managed by `rightbar.session`, and additional tabs use `sidebar.right.pane.tab` with the matching title seat. The two differ in layering, visibility conditions and collapse behaviour.

<!-- demo: frame-rightbar | Tell the separate host rightbar apart from the conversation overlay that dsh-widgets uses; annotations go only outside the example frame, and no fake plugin copy appears inside the frame. -->

## A standalone window is not the default option

The public official seat list has host settings sections, conversation tabs, conversation overlays and rightbar tabs, but no seat named "standalone plugin settings window". When a plugin needs more settings, use `settings.section` first; when the content belongs to the current conversation, choose among the public `conversation.*` seats. Only after the host explicitly publishes the matching API can a standalone window be written up as an available option. [Not yet checked]

## Check before you deliver

- Every label and control on the page can be traced to a local clean screenshot, official source, or an explicitly marked plugin example.
- Annotations in region diagrams sit outside the frame; a real UI frame contains only text the product already has.
- The rightbar, the conversation overlay, the left menu and the settings window are named separately, not merged by their screen coordinates.
- When the sources are not enough, hide the HTML state example and say which kind of real capture is still missing.

For control levels and sizes, see [Page frame layout](../../spec/10-frame-layout.md), [Controls spec](../../spec/20-controls.md) and [Accessibility](../../spec/60-accessibility.md).

## Sources

- `data/slots.json`: seat kinds, scopes, replacement risk and public purpose.
- `dsh-widgets/src/client/index.ts`: the plugin's actual seat registrations; this is a plugin implementation, not a native DSH component.
- `docs/reference/clean-capture/`: product screenshots from an isolated profile only; conversation tabs do not appear in an empty conversation.
