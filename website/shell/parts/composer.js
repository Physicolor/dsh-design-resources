/**
 * website/shell/parts/composer.js — 输入区
 *
 * 几何 ← docs/reference/geometry.json 与截图 `01-hero.png` / `07-composer.png`：
 *   composerSeat  1283 × 238
 *   输入卡        780 × 114，圆角 28px，padding 8px 0，白底 1px 边框
 *   工具行        左侧圆形「+」、权限胶囊、弹性空隙、模型选择、发送圆钮
 *
 * `config.docks === true` 时额外标出输入卡上下的两个 dock 座位——这是"两侧留白
 * 不是空白"那一条规范的图解，只在讲纵向结构时才显示，平时不干扰画面。
 */

window.DSHShellParts = window.DSHShellParts || {}

/**
 * 渲染输入区。
 * @param ctx - { data, icon, esc, config }。
 * @returns HTML。
 */
window.DSHShellParts.composer = function (ctx) {
    var data = ctx.data
    var icon = ctx.icon
    var esc = ctx.esc
    var docks = ctx.config !== undefined && ctx.config.docks === true

    /**
     * 一个座位标注条。
     * @param seat - 座位名。
     * @param note - 一句话说明。
     * @param extraClass - 附加类名。
     * @returns HTML。
     */
    var dock = function (seat, note, extraClass) {
        return '<div class="sh-dock' + (extraClass === undefined ? '' : ' ' + extraClass) + '">'
            + '<span class="sh-dock__seat">' + esc(seat) + '</span>'
            + '<span class="sh-dock__note">' + esc(note) + '</span>'
            + '</div>'
    }

    return '<div class="sh-composer" data-region="conversation.composer.bar">'
        + (docks ? dock('conversation.input.dock', '输入卡上方：扩展本次输入的能力', '') : '')
        /* 标注一律在卡片**外面**：画进卡片内部会被读成"卡片自己的一部分"，
         * 而它其实是在说明卡片内部有哪些座位。 */
        + (docks ? dock('conversation.input.overlay', '卡片内部的浮层：补全、下拉、提示——不得常驻', '') : '')
        + '<div class="sh-card">'
        + '<div class="sh-card__input">' + esc(data.placeholder) + '</div>'
        + '<div class="sh-tools">'
        + '<button class="sh-round" type="button" aria-label="添加附件">' + icon('plus') + '</button>'
        + '<button class="sh-chip" type="button">' + icon('lock') + '<span>' + esc(data.permission) + '</span>'
        + icon('chevron-down') + '</button>'
        + '<span class="sh-tools__spacer"></span>'
        + '<button class="sh-chip" type="button"><span>' + esc(data.model) + '</span>'
        + icon('chevron-down') + '</button>'
        + '<span class="sh-round sh-round--send" aria-hidden="true">' + icon('send') + '</span>'
        + '</div>'
        + '</div>'
        + (docks ? dock('conversation.composer.dock', '输入卡下方：常驻的会话级入口', '') : '')
        + '</div>'
}
