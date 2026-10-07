---
source: guides/20-pattern-settings.md
source-sha256: 1ea31feb334e1e5f
translated-at: 2026-10-07
---
# Settings page patterns: from one preference to a whole section

> Settings handle global preferences first. Choose the level to place a setting at, then pick the control; the host Settings window, a plugin settings page and a standalone window are different things.

## What this page gets you

- Decide whether a setting belongs in General settings, or needs a new section in the Settings menu.
- Reuse the dropdown selects, appearance options, number steppers, switches and action buttons that really exist on the DSH General settings page.
- Check whether a plugin has a public extension point for a standalone window; when it does not, do not invent a window API.

## A preference in General settings

When a setting is a single global preference that only needs one row, use `settings.general.item`. It is an additive seat inside a settings section; official examples include Language, Appearance and Composer Enter. It suits a switch, a short option, or a single bounded number.

The isolated-profile screenshot shows the real "Language", "Appearance", "Show code workspace view" and "Font size" rows. The example below extracts one real settings row; the annotation outside it says when this structure is the right choice. The frame keeps only the text the product actually renders.

<!-- demo: settings-general-item | one real preference in General settings; the annotation sits outside the frame. -->

## When you need a settings page of its own

When the settings fall into several groups and the user has to get to a particular page from the menu, use `settings.section`. Each list entry corresponds to one page in the Settings window, while the window, the navigation column and the content column still come from the DSH host. A plugin page does not nest another complete settings window inside itself.

The Model page in the clean screenshot shows the host page structure. It is a page DSH ships with; the example does not mix in menu names or content invented by a plugin.

<!-- demo: settings-section | the real menu and content column of the host Settings window; the annotation says which layer a plugin page should hang from. -->

## The boundary of a standalone plugin window

The current public seat list has no dedicated seat for a standalone plugin settings window. `settings.trigger` and `settings.launcher` are host settings entry points; `shell.overlay` is a floating layer that spans regions, so it cannot be used to claim that a plugin has been given a standalone window. Keep settings in `settings.general.item` or `settings.section`; pick conversation-related tools by the public purpose of `conversation.*` and `rightbar.*`.

The HTML below is a decision diagram for public seat boundaries; it does not simulate a DSH standalone window. It marks the case of "needs a dedicated window" as not currently supported and gives the settings seats that do exist; all the text in the diagram explains the rules; none of it is product control copy.

<!-- demo: settings-independent-window | a decision diagram for public seat boundaries; it does not simulate a DSH product window or control. -->

## How to pick a control in General settings

<!-- component: settings-page | a real General settings window shown magnified; the menu and control explanations all sit outside the frame. -->

| Interface elements | The real copy in the clean capture | Use it when |
| --- | --- | --- |
| Settings navigation item | `通用设置`, `模型`, `内置插件`, `Agent 预设` | A menu item only has to name its destination clearly; the menu in this capture has no descriptions, so do not add invented ones. |
| Content title and description | `模型` and `填入各提供商的 API 密钥即可使用其模型。` on the Model page; the General page has no content title or description | When several groups of settings make a page of their own, use a content title to say which section this is; do not write one in when the capture has none. |
| Option title and description | `工作步骤展示`; `选择希望看到多少工具调用细节` | The description only adds an effect or a scope the title does not already state. |
| Dropdown select | `权限`, `语言`, `工作步骤展示`; current values such as `工作区内修改`, `中文`, `详细` | When there are many options, or you need to save horizontal space; the user sees the full list only after clicking. |
| Appearance option group | `浅色`, `深色`, `跟随系统` | When mutually exclusive appearance options need to be compared side by side. Call it an appearance option group; do not refer to it generically as an action button. |
| Number stepper | `字号大小`, `14 px` | When the value has a clear minimum, maximum or step, and the unit has to stay visible at all times. |
| Switch | `显示代码工作视图` | A two-state preference that takes effect immediately; when the action needs Save/Cancel, use a form action instead of a switch. |
| Action button | `编辑快捷键`, `打开配置文件` | It performs an action or opens a follow-up flow; it does not express a value that stays selected. |

<!-- component: settingsrow | shows only the real settings rows that exist in the clean screenshot; the measurement notes sit outside the row. -->

## Limits on use

- Prefer `settings.general.item` for a preference that fits on one line; consider `settings.section` only once there are several groups of settings.
- `settings.section` is a page inside the Settings window, not a standalone plugin window, and not main conversation content either.
- Do not copy `Command Code`, the component tabs or any other plugin-contributed page as if it were a DSH default menu.
- A switch, a dropdown, a number stepper and an action button each express a different relationship; do not swap them around for the sake of layout.
- When there is no clean capture to back the content, the state or the source, hold the HTML back rather than filling in a "sample value" as a placeholder.

## Sources

- `data/slots.json`: the purpose and kind of `settings.general.item` and `settings.section`.
- docs/reference/review-crops/settings-general-clean-2026-10-05.png, settings-models-clean-2026-10-05.png and 14-settings-panel.png: General settings, the Model page and the geometry data from the official core profile.
- `components/patterns/SettingsPage/SPEC.md`, `components/layout/SettingsRow/SPEC.md`: layout extraction and implementation details.
