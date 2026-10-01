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

    /* 底部区 ← 真实界面「用量中心 / 上下文洞察 / 设置」 */
    footer: [
        { id: 'usage', label: '用量中心', icon: 'gauge' },
        { id: 'context', label: '上下文洞察', icon: 'data' },
    ],
    settings: { id: 'settings', label: '设置', icon: 'settings' },

    /* 会话头部 ← header 1290×40，含标题、视图切换（对话 / 轨迹 / 上下文）与工具 */
    views: [
        { id: 'chat', label: '对话', current: true },
        { id: 'trajectory', label: '轨迹' },
        { id: 'context', label: '上下文' },
    ],

    model: 'DeepSeek V4.1 Flash 高',
    permission: '完全权限',

    messages: [
        { role: 'user', text: '把这一版接口文档按模块重新组织一下，顺便标出哪些字段是可选的。' },
        {
            role: 'assistant',
            text: '我先看一下现有的文档结构，再按模块重排。',
        },
    ],

    tool: {
        name: 'read',
        summary: '读取 docs/api.md',
        detail: '共 214 行，识别出 6 个模块、38 个字段。',
    },

    /* 输入区 ← 输入卡 780×114、圆角 28px */
    placeholder: '描述你想要构建的内容，/ 调用指令，@ 文件或对话',
};
