/**
 * website/shell/parts/composer.js — 输入区
 *
 * 几何 ← docs/reference/geometry.json 与截图 `01-hero.png` / `02-session.png`：
 *   composerSeat  1283 × 238
 *   输入卡        780 × 114，圆角 21px（对 01-hero.png 弧线最小二乘拟合 21.4），
 *                 padding 8px 0，白底 1px 边框
 *   工具行        左侧圆形「+」、权限胶囊、弹性空隙、模型选择、发送圆钮
 *   状态条        卡下方居中一行小字：轮/步 · 吞吐 · 用量 · 缓存 · 花费 · 占用
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

    var status = (data.statusLine || []).map(function (item) {
        return '<span>' + esc(item) + '</span>'
    }).join('<span class="sh-status__sep">·</span>')

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
