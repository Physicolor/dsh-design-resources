/**
 * website/shell/parts/rail-right.js — 右栏
 *
 * 产品自身的右栏（`rightbar`）是**可开合**的：中栏为它让出宽度，收起时宽度
 * 归中栏。它自己**没有**关闭按钮——开合由会话头部那个按钮负责，栏内只有
 * tab（`sidebar.right.pane.tab`）与它的标题。先前在这里画了一个关闭按钮，
 * 那是编出来的。
 *
 * 干净 profile 的 2026-10-05 采集确认，宿主「开始」右栏包含“工作区文件”和
 * “新建终端”两个操作。dsh-widgets 的对话区浮层是另一个插件座位，不是这个右栏。
 */

window.DSHShellParts = window.DSHShellParts || {}

/**
 * 渲染右栏。
 * @param ctx - { data, icon, esc }。
 * @returns HTML。
 */
window.DSHShellParts.railRight = function (ctx) {
    var data = ctx.data
    var esc = ctx.esc

    var cards = (data.rightbarActions || []).map(function (action) {
        var shortcut = action.shortcut === undefined ? ''
            : '<kbd class="sh-right__shortcut">' + esc(action.shortcut) + '</kbd>'
        var chevron = action.expandable === true
            ? '<span class="sh-right__chevron" aria-hidden="true">⌄</span>' : ''
        return '<button class="sh-right__card" type="button" data-action="' + esc(action.id) + '">'
            + '<span class="sh-right__copy"><strong>' + esc(action.title) + '</strong>'
            + '<span>' + esc(action.description) + '</span></span>'
            + chevron + shortcut + '</button>'
    }).join('')

    return '<aside class="sh-right" data-region="rightbar">'
        + '<div class="sh-right__head"><span>' + esc(data.rightbarTitle || '') + '</span></div>'
        + '<div class="sh-right__body">' + cards + '</div>'
        + '</aside>'
}
