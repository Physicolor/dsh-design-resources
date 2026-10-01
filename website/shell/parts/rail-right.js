/**
 * website/shell/parts/rail-right.js — 右栏
 *
 * 产品自身的右栏（`rightbar`）是**可开合**的：中栏为它让出宽度，收起时宽度
 * 归中栏。这里只画它的骨架与职责说明，内容用中性卡片，不模仿任何插件的面板。
 *
 * 注意：真实截图里出现的 707px 宽面板是**插件**渲染的（右侧组件栏），
 * 不属于产品自身的右栏，因此这里按官方 `rightbar` 的语义来画。
 */

window.DSHShellParts = window.DSHShellParts || {}

/**
 * 渲染右栏。
 * @param ctx - { data, icon, esc }。
 * @returns HTML。
 */
window.DSHShellParts.railRight = function (ctx) {
    var icon = ctx.icon
    var esc = ctx.esc

    var cards = [
        { title: '临时查看', body: '上下文占用、文件预览、来源引用——看完就收起来的东西。' },
        { title: '与当前会话弱相关', body: '它常驻可见，但不参与主流程；收起它，主流程照样走得完。' },
    ].map(function (card) {
        return '<div class="sh-right__card"><strong>' + esc(card.title) + '</strong>'
            + '<div>' + esc(card.body) + '</div></div>'
    }).join('')

    return '<aside class="sh-right" data-region="rightbar">'
        + '<div class="sh-right__head">'
        + '<span>右栏</span>'
        + '<span class="sh-logo__spacer"></span>'
        + '<button class="sh-icon-button" type="button" data-action="toggle-right" aria-label="收起右栏">'
        + icon('close') + '</button>'
        + '</div>'
        + '<div class="sh-right__body">' + cards + '</div>'
        + '</aside>'
}
