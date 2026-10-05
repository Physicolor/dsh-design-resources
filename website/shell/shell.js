/**
 * website/shell/shell.js — 装配与交互
 *
 * 这个模块把 `parts/` 里的四块拼成一个**可操作的产品界面复刻**，供规范文档
 * 当实例用。它是普通的经典脚本（不是 ES module），挂到 `window.DSHShell`，
 * 这样规范文档里的演示可以用一行声明就把它挂起来。
 *
 * 用法：
 *   var shadow = DSHShell.mount(hostElement, {
 *     css: shellCss,           // 由 gen-site 内联进数据的样式文本
 *     icon: function (n) {},   // 短名 → 官方 SVG
 *     esc: function (s) {},    // HTML 转义
 *     brandMark: '<svg…>',
 *     left: 'open', right: 'closed',
 *     highlight: 'composer',   // 固定高亮某一块；也可用 highlightOnHover
 *   })
 */

window.DSHShell = (function () {
    'use strict'

    /** 区域短名 ↔ 选择器，用于高亮与说明。 */
    var REGIONS = [
        ['.sh-side', 'side'],
        ['.sh-head', 'head'],
        ['.sh-flow', 'flow'],
        ['.sh-composer', 'composer'],
        ['.sh-right', 'right'],
    ]

    /**
     * 生成复刻界面的 HTML。
     * @param config - 见文件头。
     * @returns HTML 字符串。
     */
    function render(config) {
        var ctx = {
            data: window.DSHShellData,
            icon: config.icon,
            /* Real chrome harvested from the running product; `icon` is the
             * fallback for anything the harvest did not cover. */
            chrome: config.chrome || { icons: {}, header: [] },
            esc: config.esc,
            config: config,
        }
        var parts = window.DSHShellParts

        var sidebarOnly = config.sidebarOnly === true
        return '<div class="sh-stage"' + (sidebarOnly ? ' data-sidebar-only="true"' : '') + '>'
            + '<div class="sh-root" data-demo="true"' + (sidebarOnly ? ' data-sidebar-only="true"' : '')
            + ' data-left="' + (config.left === 'closed' ? 'closed' : 'open') + '"'
            + ' data-right="' + (config.right === 'open' ? 'open' : 'closed') + '"'
            + (config.highlight ? ' data-hl="' + config.highlight + '"' : '')
            + '>'
            + '<div class="sh-handle" data-handle></div>'
            + parts.railLeft(ctx)
            + '<div class="sh-center">'
            + parts.conversationHead(ctx)
            + '<div class="sh-body">'
            + parts.conversationFlow(ctx)
            + parts.composer(ctx)
            + '</div>'
            + '</div>'
            + parts.railRight(ctx)
            + '</div></div>'
    }

    /**
     * 给渲染好的复刻界面接上交互。
     * @param root - shadow root 或任意容器。
     * @param config - 见文件头。
     */
    function wire(root, config) {
        var stage = root.querySelector('.sh-stage')
        var shell = root.querySelector('.sh-root')
        if (shell === null || stage === null) return

        /**
         * Fit the reproduction into its container by scaling.
         *
         * The shell is drawn at the real viewport size (1570×905) and then scaled
         * to whatever width the page gives it. Stretching the layout instead
         * would break the one thing it exists to show: at 1570px the left rail is
         * 280px, which is 17.8% — squeeze the container to 888px and a fixed
         * 280px rail becomes 31.5%, i.e. a different layout from the product's.
         */
        function fit() {
            if (config.sidebarOnly === true) return
            var width = stage.clientWidth
            if (width > 0) stage.style.setProperty('--sh-scale', String(width / 1570))
        }
        fit()
        if (window.ResizeObserver !== undefined) new ResizeObserver(fit).observe(stage)
        window.addEventListener('resize', fit)

        /**
         * 切换一侧栏的开合，并同步所有相关按钮的说明文字。
         * @param side - `left` 或 `right`。
         */
        function toggle(side) {
            var attr = side === 'left' ? 'data-left' : 'data-right'
            var open = shell.getAttribute(attr) === 'open'
            shell.setAttribute(attr, open ? 'closed' : 'open')
            var labels = side === 'left'
                ? ['显示或隐藏侧栏', '显示或隐藏右栏']
                : ['显示或隐藏右栏', '显示或隐藏侧栏']
            Array.prototype.forEach.call(root.querySelectorAll('[data-action="toggle-' + side + '"]'), function (button) {
                button.setAttribute('aria-label', (open ? labels[0] : labels[1]))
            })
        }

        Array.prototype.forEach.call(root.querySelectorAll('[data-action="toggle-left"]'), function (button) {
            button.addEventListener('click', function () { toggle('left') })
        })
        Array.prototype.forEach.call(root.querySelectorAll('[data-action="toggle-right"]'), function (button) {
            button.addEventListener('click', function () { toggle('right') })
        })

        /* 侧栏宽度可拖动 ← 真实界面的 handle 就是 8px 宽的拖拽带 */
        var handle = root.querySelector('[data-handle]')
        if (handle !== null) {
            handle.addEventListener('pointerdown', function (event) {
                if (shell.getAttribute('data-left') === 'closed') return
                event.preventDefault()
                var startX = event.clientX
                var startWidth = parseFloat(getComputedStyle(shell).getPropertyValue('--sh-side-w')) || 280
                handle.setAttribute('data-active', 'true')
                handle.setPointerCapture(event.pointerId)
                var move = function (ev) {
                    /* The shell is scaled to fit its container, so a screen pixel
                     * is not a shell pixel: divide by the current scale or the
                     * rail lags behind the pointer. */
                    var scale = (stage.clientWidth / 1570) || 1
                    var width = Math.min(420, Math.max(200, startWidth + (ev.clientX - startX) / scale))
                    shell.style.setProperty('--sh-side-w', width + 'px')
                }
                var up = function () {
                    window.removeEventListener('pointermove', move)
                    window.removeEventListener('pointerup', up)
                    handle.removeAttribute('data-active')
                }
                window.addEventListener('pointermove', move)
                window.addEventListener('pointerup', up)
            })
        }

        /* 会话行可选中 */
        Array.prototype.forEach.call(root.querySelectorAll('.sh-session'), function (row) {
            row.addEventListener('click', function () {
                Array.prototype.forEach.call(root.querySelectorAll('.sh-session'), function (other) {
                    other.removeAttribute('aria-current')
                })
                row.setAttribute('aria-current', 'true')
            })
        })

        /* 演示模式：指针进入哪一块，哪一块被标出来 */
        if (config.highlightOnHover === true) {
            REGIONS.forEach(function (pair) {
                var el = root.querySelector(pair[0])
                if (el === null) return
                el.addEventListener('pointerenter', function () { shell.setAttribute('data-hl', pair[1]) })
                el.addEventListener('pointerleave', function () { shell.removeAttribute('data-hl') })
            })
        }
    }

    /**
     * 把复刻界面挂到一个宿主元素上（自带 shadow root 与样式）。
     * @param host - 宿主元素。
     * @param config - 见文件头。
     * @returns 建好的 shadow root。
     */
    function mount(host, config) {
        var shadow = host.attachShadow({ mode: 'open' })
        shadow.innerHTML = '<style>' + config.css + '</style>' + render(config)
        var mark = shadow.querySelector('[data-brand-mark]')
        if (mark !== null && config.brandMark) mark.innerHTML = config.brandMark
        wire(shadow, config)
        return shadow
    }

    return { render: render, wire: wire, mount: mount, regions: REGIONS }
})()
