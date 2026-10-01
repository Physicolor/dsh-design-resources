/**
 * website/shell/parts/conversation.js — 中栏的会话头部与消息流
 *
 * 几何 ← docs/reference/geometry.json：
 *   centerCol  1290 × 905
 *   header     1290 × 40，padding 10px 28px 0 20px
 *   body       1290 × 865（自 header 之下开始）
 *
 * 头部的内容按真实截图 `03-settings-open.png` 排：左边会话标题、中间一排状态
 * chip（子智能体 / 模式 / 后台任务）、右边视图切换与工具按钮。少了这些，复刻
 * 出来的头部就只有一半。
 */

window.DSHShellParts = window.DSHShellParts || {}

/**
 * 渲染会话头部。
 * @param ctx - { data, icon, chrome, esc }。
 * @returns HTML。
 */
window.DSHShellParts.conversationHead = function (ctx) {
    var data = ctx.data
    var icon = ctx.icon
    var esc = ctx.esc

    var views = data.views.map(function (view) {
        return '<span class="sh-head__view"' + (view.current === true ? ' aria-current="true"' : '') + '>'
            + esc(view.label) + '</span>'
    }).join('')

    var chips = data.headerChips.map(function (chip) {
        return '<span class="sh-chip sh-chip--meta">' + esc(chip) + icon('chevron-down') + '</span>'
    }).join('')

    return '<header class="sh-head" data-region="conversation.header">'
        + '<span class="sh-head__title">'
        + '<span>' + esc(data.sessions[0].title) + '</span>'
        + icon('chevron-down')
        + '</span>'
        + '<span class="sh-head__chips">' + chips + '</span>'
        + '<span class="sh-head__views">' + views + '</span>'
        + '<span class="sh-head__tools">'
        + '<button class="sh-icon-button" type="button" aria-label="更多">' + icon('ellipsis') + '</button>'
        + '<button class="sh-icon-button" type="button" data-action="toggle-right" aria-label="打开右侧边栏">'
        + icon('panel-left') + '</button>'
        + '</span>'
        + '</header>'
}

/**
 * 渲染消息流（含一条工具调用卡）。
 * @param ctx - { data, icon, esc }。
 * @returns HTML。
 */
window.DSHShellParts.conversationFlow = function (ctx) {
    var data = ctx.data
    var esc = ctx.esc

    var bubbles = data.messages.map(function (message) {
        var isUser = message.role === 'user'
        return '<div class="sh-msg' + (isUser ? ' sh-msg--user' : '') + '">'
            + '<div class="sh-msg__bubble"><p>' + esc(message.text) + '</p></div>'
            + '</div>'
    }).join('')

    var tool = '<div class="sh-tool">'
        + '<div class="sh-tool__head">' + esc(data.tool.name) + ' · ' + esc(data.tool.summary) + '</div>'
        + '<div class="sh-tool__body">' + esc(data.tool.detail) + '</div>'
        + '</div>'

    return '<div class="sh-flow" data-region="conversation.view">' + bubbles + tool + '</div>'
}
