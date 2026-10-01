/**
 * website/shell/parts/rail-left.js — 左栏
 *
 * 几何 ← docs/reference/geometry.json：
 *   sidebarCol        280 × 905
 *   sideRoot          padding 6px 12px
 *   logoRow           256 × 60，padding 8px 0 8px 4px
 *   newSession        252 × 38，圆角 12px
 *   panelRow          252 × 36，padding 7px 8px，行距 4px
 *   sectionHeader     260 × 36，文字 13px
 *   footerAction      260 × 42
 *   settingsTrigger   260 × 34
 *
 * 图标不按名字去包里找，而是用 `chrome.icons` 里那份**从运行中的产品直接采下来
 * 的 SVG**——按名字猜曾经把 `lock` 猜成时钟，也把侧栏图标画得和真界面两样。
 */

window.DSHShellParts = window.DSHShellParts || {}

/**
 * 渲染左栏。
 * @param ctx - { data, icon, chrome, esc, config }。
 * @returns HTML。
 */
window.DSHShellParts.railLeft = function (ctx) {
    var data = ctx.data
    var icon = ctx.icon
    var esc = ctx.esc
    var harvested = (ctx.chrome && ctx.chrome.icons) || {}

    /**
     * 取真实采集到的图标，取不到才退回按名字查。
     * @param label - 该控件在真实界面上的可见文字。
     * @param fallback - 兜底的图标短名。
     * @returns SVG 标记。
     */
    var glyph = function (label, fallback) {
        return harvested[label] || icon(fallback)
    }

    var panels = data.panels.map(function (panel) {
        return '<button class="sh-panel" type="button" data-panel="' + esc(panel.id) + '">'
            + glyph(panel.label, panel.icon)
            + '<span>' + esc(panel.label) + '</span>'
            + '</button>'
    }).join('')

    var sessions = data.sessions.map(function (session, index) {
        return '<button class="sh-session" type="button"' + (index === 0 ? ' aria-current="true"' : '') + '>'
            + '<span class="sh-session__title">' + esc(session.title) + '</span>'
            + '<span class="sh-session__time">' + esc(session.time) + '</span>'
            + '<span class="sh-session__more">···</span>'
            + '</button>'
    }).join('')

    var footer = data.footer.map(function (item) {
        return '<button class="sh-foot__action" type="button" data-foot="' + esc(item.id) + '">'
            + glyph(item.label, item.icon)
            + '<span>' + esc(item.label) + '</span>'
            + '</button>'
    }).join('')

    return '<aside class="sh-side" data-region="sidebar">'
        + '<div class="sh-logo">'
        + '<span class="sh-brand">'
        + '<span class="sh-brand__mark" data-brand-mark></span>'
        + '<span class="sh-brand__name">' + esc(data.brand.name) + '</span>'
        + '<span class="sh-brand__badge">' + esc(data.brand.badge) + '</span>'
        + '</span>'
        + '<span class="sh-logo__spacer"></span>'
        + '<button class="sh-icon-button" type="button" data-action="toggle-left" aria-label="收起侧栏">'
        + icon('panel-left') + '</button>'
        + '</div>'

        + '<button class="sh-new" type="button" data-action="new-session">'
        + glyph('新会话', 'new-chat')
        + '<span>新会话</span>'
        + '<span class="sh-new__keys"><kbd>Ctrl</kbd><kbd>N</kbd></span>'
        + '</button>'

        + '<nav class="sh-panels">' + panels + '</nav>'

        + '<div class="sh-region">'
        + '<div class="sh-section">'
        + '<span>工作区</span>'
        + '<span class="sh-section__spacer"></span>'
        + '<button class="sh-section__action" type="button" aria-label="搜索">' + icon('search') + '</button>'
        + '</div>'
        + '<div class="sh-list">' + sessions + '</div>'
        + '</div>'

        + '<div class="sh-foot">'
        + footer
        + '<button class="sh-settings" type="button" data-foot="' + esc(data.settings.id) + '">'
        + glyph('设置', data.settings.icon)
        + '<span>' + esc(data.settings.label) + '</span>'
        + '</button>'
        + '</div>'
        + '</aside>'
}
