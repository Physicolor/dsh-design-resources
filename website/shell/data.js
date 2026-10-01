/**
 * website/shell/data.js — 复刻界面用的演示数据
 *
 * 全部是**假数据**：不出现真实会话标题、真实用户名或任何私人内容。
 * 结构与真实界面一致（左栏分组、会话行、消息、工具调用、输入区），
 * 但每一句文案都是占位的。
 */

window.DSHShellData = {
    brand: { name: 'deepseek', badge: 'HARNESS' },

    /* 面板导航 ← 真实界面「插件 / 自动化任务」两项，面板行 252×36 */
    panels: [
        { id: 'plugins', label: '插件', icon: 'cordis-plugin' },
        { id: 'automation', label: '自动化任务', icon: 'alarm-clock' },
    ],

    workspaces: [
        { id: 'alpha', label: '项目 Alpha' },
        { id: 'beta', label: '项目 Beta' },
        { id: 'gamma', label: '示例工作区' },
    ],

    sessions: [
        { id: 's1', title: '示例会话：整理接口文档', time: '2 分钟' },
        { id: 's2', title: '示例会话：重构数据层', time: '1 小时' },
        { id: 's3', title: '示例会话：排查构建失败', time: '3 小时' },
        { id: 's4', title: '示例会话：写一份周报', time: '昨天' },
        { id: 's5', title: '示例会话：对比两种方案', time: '2 天' },
    ],
    sessionsMore: 12,

    /* 底部区 ← 只放产品自己注册的入口。
     * `sidebar.footer.action` 上的占用者里，registrant 为 mf（产品自身 bundle）
     * 的是 cordis-panel；「用量中心」「上下文洞察」是插件注册的，不属于产品，
     * 所以复刻里不出现——复刻只画产品自身有的东西。 */
    footer: [
        { id: 'cordis-panel', label: 'Cordis 插件', icon: 'cordis-plugin' },
    ],
    settings: { id: 'settings', label: '设置', icon: 'settings' },

    /* 会话头部 ← header 1290×40。左侧会话标题、中间状态 chip、右侧视图与工具，
     * 照 `03-settings-open.png` 的真实排布。 */
    headerChips: ['1 个子智能体', '标准模式'],
    views: [
        { id: 'chat', label: '对话', current: true },
        { id: 'trajectory', label: '轨迹' },
        { id: 'context', label: '上下文' },
    ],

    model: 'DeepSeek V4.1 Flash High',
    permission: '完全权限',

    /* 输入卡下方那一行 ← 产品为 `conversation.input.dock` 座位留的盒子。
     *
     * 本机上这个座位的占用者给出轮/步、吞吐、用量、缓存、花费、上下文占用，
     * 并按「轮/步 + 吞吐」「用量 + 缓存 + 花费」「占用」分成三组；组内用 `·`
     * 分隔，组与组之间留白。分组、间距、字号都取自真实渲染
     * （`docs/reference/status-line.json`），数字只是示例值。
     *
     * 图标取官方图标集里语义对得上的三个（refresh / data / gauge）：那三个
     * 字形属于座位的占用者，本仓库不复制插件自己的图标。 */
    statusLine: [
        { icon: 'refresh', items: ['9 轮 279 步', '283 tok/s'] },
        { icon: 'data', items: ['91M tok', '缓存命中 99%', '≈$0.95'] },
        { icon: 'gauge', items: ['57%'] },
    ],

    messages: [
        { role: 'user', text: '把这一版接口文档按模块重新组织一下，顺便标出哪些字段是可选的。' },
        {
            role: 'assistant',
            text: '我先看一下现有的文档结构，再按模块重排。',
        },
    ],

    /* 工具调用 ← 产品里是一条可展开的活动行：16px 图标 + 14px 标题（min-height
     * 19px，`WW4l1q_title`），下面接内容。不是自造的卡片框。 */
    tool: {
        label: '已读取文件',
        summary: 'read · 读取 docs/api.md',
        detail: '共 214 行，识别出 6 个模块、38 个字段。',
    },

    /* 输入区 ← 输入卡 780×114、圆角 28px */
    placeholder: '描述你想要构建的内容，/ 调用指令，@ 文件或对话',
};
