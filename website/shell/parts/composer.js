/**
 * website/shell/parts/composer.js — 输入区
 *
 * 几何 ← docs/reference/composer-geometry.json、conversation-geometry.json 与截图
 * `01-hero.png` / `02-session.png`：
 *   composerSeat   最后贴住视口下沿：卡 → dock 26px → 底 4px
 *   输入卡         780 × 98（会话里单行时），圆角 28px，padding 8px 0 0，
 *                  白底 1px 边框，卡内 gap 12px
 *   工具行         左侧圆形「+」(28)、权限胶囊、弹性空隙、模型选择、发送圆钮(34)
 *   dock           卡下方居中一行小字，高 26px（padding-top 4 + 22px 内容），
 *                  组内 gap 6px、组间 14px，字号 12/20
 *
 * 这里**不再自造标注**。先前用一圈蓝色虚线框去标座位，那是本仓库编出来的视觉
 * 语言，读者不认识；要说明座位，要么用产品自己有的元素，要么把话放到画面外面
 * 的图注里。
 */

window.DSHShellParts = window.DSHShellParts || {}

/**
 * 渲染输入区。
 * @param ctx - { data, icon, esc }。
 * @returns HTML。
 */
window.DSHShellParts.composer = function (ctx) {
    var data = ctx.data
    var icon = ctx.icon
    var esc = ctx.esc

    var status = (data.statusLine || []).map(function (group) {
        var items = group.items.map(function (item) {
            return '<span>' + esc(item) + '</span>'
        }).join('<span class="sh-status__sep">·</span>')
        return '<span class="sh-status__group">'
            + (group.icon ? icon(group.icon) : '')
            + items
            + '</span>'
    }).join('')

    return '<div class="sh-composer" data-region="conversation.composer.bar">'
        + '<div class="sh-card">'
        + '<div class="sh-card__input">' + esc(data.placeholder) + '</div>'
        + '<div class="sh-tools">'
        + '<button class="sh-round" type="button" aria-label="添加附件">' + icon('plus') + '</button>'
        + '<button class="sh-chip" type="button">' + icon('inspect') + '<span>' + esc(data.permission) + '</span>'
        + icon('chevron-down') + '</button>'
        + '<span class="sh-tools__spacer"></span>'
        + '<button class="sh-chip" type="button"><span>' + esc(data.model) + '</span>'
        + icon('chevron-down') + '</button>'
        + '<span class="sh-round sh-round--send" aria-hidden="true">' + icon('send') + '</span>'
        + '</div>'
        + '</div>'
        + '<div class="sh-status">' + status + '</div>'
        + '</div>'
}
