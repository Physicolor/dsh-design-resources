---
source: guides/21-pattern-sidebar-panel.md
source-sha256: bdb99791db9d3254
translated-at: 2026-10-05
---
# Left sidebar, conversation area and rightbar

> First work out whether the content belongs to global navigation, to the current session, or to the separate host rightbar; then choose where to extend.

## What this page gets you

- Read the host regions of the DSH left sidebar and the places where a plugin can register.
- Tell an overlay inside the conversation apart from the separate `rightbar`.
- Describe what a plugin contributes separately from native DSH content.

## What regions the left sidebar is made of

In a clean profile the left sidebar shows, in order, the brand area, the "New session" action, the "Plugins" and "Automated tasks" global panel entries, the workspace/session list, and "Settings" at the bottom. The figure below reproduces only the text actually seen in an isolated profile; the external legend says which region each part belongs to. With no third-party plugin installed, the bottom extension action area is empty.

<!-- demo: sidebar-anatomy | Brand, panel list, workspaces, the empty bottom extension slot and the settings entry; the legend sits outside the frame. -->

| Region | What the clean capture shows | Official seat / ownership | How a plugin author should read it |
| --- | --- | --- | --- |
| Brand row | DeepSeek mark and Harness name | `sidebar.brand.mark`, `sidebar.brand.name`, a single host seat | Keep the host brand; do not treat the brand row as a plugin title area. |
| Global panel entries | `插件`, `自动化任务` | `sidebar.panellist`, a root-scope list | This is the global panel list; an individual entry may come from an official feature or from a plugin, so check the ownership of each one. |
| Workspaces and sessions | `工作区`, `默认工作区`, `新会话` | `sidebar.workspaces`, a host `single` seat | The host owns the list area; an extension child should use the child seats it declares, and must not replace the whole workspace region. |
| Settings and bottom actions | `设置` | `sidebar.settings` is the host entry; `sidebar.footer.action` is the list you can register into beside it | The clean capture shows that registration slot empty; entries such as "Usage centre" in a user screenshot are plugin entries, not default host content. |
| Desktop account / sign-in | The Desktop shell may show an account entry | `settings.launcher` is an optional account entry the host owns | This is a desktop shell feature, not an ordinary plugin menu item; the clean Web capture does not show that Desktop state. |

Apple HIG casts the sidebar as top-level navigation, and warns against confining key actions to the sidebar's bottom. [Borrowed principle] `sidebar.footer.action` therefore suits secondary, optional entries; the main flow still has to be completable somewhere else. This is review advice; the extension capability itself still follows the public DSH seat list.

The whole left column `sidebar` and the workspace `sidebar.workspaces` are both `single` seats the host owns. Plugins should register into appendable lists such as `sidebar.panellist` and `sidebar.footer.action`; do not cover the whole column.

## The host's session view tabs

A real conversation header carries three host tabs: "Conversation", "Trajectory" and "Context". They switch which view of the same session is shown; they are not plugin settings navigation, and they are not the same thing as the dsh-widgets segmented-control example.

<!-- demo: session-tabs | Shows only the host's real session view tabs; it borrows no plugin settings page screenshot. -->

To show the main content of the current session, use a public conversation seat such as `conversation.view`; do not disguise your own view as a host tab.

## Plugin content inside the conversation

The conversation area belongs to the current session. The body view is appended through `conversation.view`; around the input card there are further public spots such as `conversation.composer.dock` and `conversation.input.overlay`.

`dsh-widgets` demonstrates a layout of its own: its right-hand statistics rail registers in `conversation.input.overlay`, its panel toggle sits in `conversation.session.header.utilities`, and its session statistics sit in `conversation.composer.dock`. It hugs the main conversation column and changes with the session. The rail, the stat cards and the buttons are all plugin content, and none of them may be labelled as a component DSH ships. [Plugin example]

The public seat list describes `conversation.input.overlay` as "floating entries rendered inside the resident composer card". `dsh-widgets` uses it as a session panel to the right of the conversation area, which is that plugin's own implementation choice; plugin authors should check stacking and occlusion against their own version, and should not advertise it as a general host rightbar.

## The host rightbar is a separate column

The DSH `rightbar` is a separate rail at the far right of the window; `rightbar.session` is the session content area the host controls. To add content, plugins should use `sidebar.right.pane.tab` with the corresponding title seat, and not replace `rightbar`.

In a clean profile, the rightbar of a blank new session shows the "Start" page, an empty-state icon, and two host actions, "Workspace files" and "New terminal", each with its own description and shortcut. They belong to the DSH start page; the example reproduces only the two actions that appear in the real capture. The rightbar and the dsh-widgets conversation overlay are still two different places.

<!-- demo: frame-rightbar | The host start-page rightbar in a clean profile; it keeps the two real actions and stays apart from the dsh-widgets conversation overlay. -->

## Choosing a location

| What the content relates to | Region to try first | How to decide |
| --- | --- | --- |
| Switching a global page or object | Left sidebar | Pick a panel/workspace child seat the official source declares. |
| Setting a global preference | Host Settings window | One preference goes in `settings.general.item`; a group of settings pages goes in `settings.section`. |
| Showing the main content of the current session | `conversation.session` / `conversation.view` | The content changes with the session, so it belongs to the conversation itself. |
| A persistent auxiliary rail for the current session | A public overlay seat in the conversation area, or `rightbar.session` | First work out whether it belongs to the composer/conversation, then decide whether it needs the host rightbar. |
| A global overlay or notification | `shell.overlay` | Use it only when the content really is cross-region and is not session content. |

The rightbar can be collapsed, so anything it holds is supplementary. Main-flow actions such as Send, Stop and the settings entry have to stay findable after the user collapses the rightbar.

## Coexistence and keyboard operation

- The root sidebar, the workspace region, the rightbar and the session rightbar are all `shadows-shipped-ui` single seats; plugins only append into public child seats with `replaceRisk: none`.
- In `sidebar.footer.action` one entry is one button; the shell handles the shared spacing and alignment.
- The current navigation item needs both a visible state and a semantic state; icon buttons need a readable name, and focus must not be clipped by a parent container.
- A newly mounted sidebar or session panel must not take focus on its own; when it closes, give focus back to the button that opened it.

For sizes and focus rules, see [Page frame layout](../../spec/10-frame-layout.md), [Seat directory and selection](../../spec/11-slot-seats.md) and [Accessibility](../../spec/60-accessibility.md).

## Sources

- `data/slots.json`: the public purposes of the sidebar, rightbar and conversation seats.
- `docs/reference/review-crops/sidebar-top-clean-2026-10-05.png`, `rightbar-clean-2026-10-05.png`: crops of the top of the left sidebar and of the host start-page rightbar from the dedicated official-bundle profile; they contain no conversation body text.
- `dsh-widgets/src/client/index.ts`: how that plugin picks the conversation overlay, the header utility and the composer dock; this is plugin source code, not native DSH UI.
