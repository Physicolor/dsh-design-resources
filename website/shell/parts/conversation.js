/**
 * website/shell/parts/conversation.js — 中栏的会话头部与消息流
 *
 * 几何 ← `docs/reference/top-strip.json`、`conversation-geometry.json` 与截图
 * `02-session.png`（1570×905，右栏收起）：
 *
 *   header      0..50，标题左沿 308（= 中栏左沿 280 + 28），右侧工具右沿 1558
 *               （离视口右沿 12）；chip 高 28、间距 6；页签 13px、间距 25、
 *               选中态蓝色 + 2px 下划线（y 37..38）
 *   工具组      文件夹「打开方式」分段按钮(高 28，带 1px 边框与中缝) → 省略号(28)
 *               → 右侧边栏开关(28)，组内间距 6
 *   消息列      748px 居中（中栏 1290 宽时即 551..1299），左右各 32px 内边距
 *   用户气泡    贴列右沿，圆角 20，padding 10px 16px，底色 rgb(237,243,254)
 *   助手正文    没有气泡，14/24 直接落在背景上
 *   工具调用    一条 16px 图标 + 14px 标题的活动行（min-height 19），下面是内容
 *
 * 头部右上角那几个按钮**用采集下来的真实 SVG / 位图**（`chrome.top`）：省略号、
 * 更多打开方式、打开右侧边栏各有自己的字形，文件夹那颗是产品直接用的系统图标。
 * 靠「名字差不多」的图标顶替，正是这份资源叫别人不要做的事。
 */

window.DSHShellParts = window.DSHShellParts || {}

/**
 * 从采集到的顶栏控件里按 aria-label 取一枚。
 * @param ctx - { chrome }。
 * @param label - 真实界面上的 aria-label。
 * @returns 采集记录，取不到时返回 null。
 */
function harvested(ctx, label) {
    var top = (ctx.chrome && ctx.chrome.top) || []
    for (var i = 0; i < top.length; i++) {
        if (top[i].label === label) return top[i]
    }
    return null
}

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

    /* 头部右上角：真实界面上是「打开方式」分段按钮、省略号、右侧边栏开关。
     * 中间还夹着一枚插件胶囊（组件系统的统计图标），那不属于产品，不画。 */
    var folder = harvested(ctx, '用 文件资源管理器 打开')
    var more = harvested(ctx, '更多打开方式')
    var dots = harvested(ctx, '更多操作')
    var panel = harvested(ctx, '打开右侧边栏')

    var folderIcon = '<img class="sh-open__app" src="assets/explorer.png" width="13" height="13" alt="">'
    var tools = '<span class="sh-open">'
        + '<button class="sh-open__main" type="button" aria-label="用 文件资源管理器 打开">' + folderIcon + '</button>'
        + '<button class="sh-open__more" type="button" aria-label="更多打开方式">'
        + ((more && more.svg) || icon('chevron-down')) + '</button>'
        + '</span>'
        + '<button class="sh-icon-button" type="button" aria-label="更多操作">'
        + ((dots && dots.svg) || icon('ellipsis')) + '</button>'
        + '<button class="sh-icon-button" type="button" data-action="toggle-right" aria-label="打开右侧边栏">'
        + ((panel && panel.svg) || icon('panel-left')) + '</button>'

    return '<header class="sh-head" data-region="conversation.header">'
        + '<span class="sh-head__title">'
        + '<span>' + esc(data.sessions[0].title) + '</span>'
        + icon('chevron-down')
        + '</span>'
        + '<span class="sh-head__chips">' + chips + '</span>'
        + '<span class="sh-head__views">' + views + '</span>'
        + '<span class="sh-head__tools">' + tools + '</span>'
        + '</header>'
}

/**
 * 渲染消息流（含一条工具调用行）。
 * @param ctx - { data, icon, esc }。
 * @returns HTML。
 */
window.DSHShellParts.conversationFlow = function (ctx) {
    var data = ctx.data
    var icon = ctx.icon
    var esc = ctx.esc

    var bubbles = data.messages.map(function (message) {
        var isUser = message.role === 'user'
        /* 只有用户消息有气泡；助手正文是落在背景上的 markdown。 */
        return '<div class="sh-msg' + (isUser ? ' sh-msg--user' : ' sh-msg--assistant') + '">'
            + (isUser
                ? '<div class="sh-msg__bubble"><p>' + esc(message.text) + '</p></div>'
                : '<div class="sh-msg__text"><p>' + esc(message.text) + '</p></div>')
            + '</div>'
    }).join('')

    /* 工具调用 ← 折叠态的活动行：图标 + 标题一条线，内容紧随其后。 */
    var tool = '<div class="sh-tool">'
        + '<button class="sh-tool__title" type="button">'
        + '<span class="sh-tool__leading">' + icon('check') + '</span>'
        + '<span class="sh-tool__label">' + esc(data.tool.label) + '</span>'
        + '</button>'
        + '<div class="sh-tool__body">' + esc(data.tool.detail) + '</div>'
        + '</div>'

    return '<div class="sh-flow" data-region="conversation.view">'
        + '<div class="sh-flow__column">' + bubbles + tool + '</div>'
        + '</div>'
}
