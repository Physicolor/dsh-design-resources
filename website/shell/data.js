/**
 * Website shell specimen data from the isolated official-only profile.
 * Only the observed “新会话” row is shown; private conversation titles,
 * plugin cards, and usage numbers are omitted.
 */
window.DSHShellData = {
    brand: { name: 'deepseek', badge: 'HARNESS' },
    panels: [
        { id: 'plugins', label: '插件', icon: 'cordis-plugin' },
        { id: 'automation', label: '自动化任务', icon: 'alarm-clock' },
    ],
    workspaces: [
        { id: 'dsh', label: 'DeepSeek-Harness' },
    ],
    sessions: [
        { id: 'new', title: '新会话', selected: true },
    ],
    footer: [],
    settings: { id: 'settings', label: '设置', icon: 'settings' },
    sessionActive: false,
    headerChips: [],
    views: [],
    hero: {
        title: '探索未至之境',
        badge: '预览版',
        workspace: 'DeepSeek-Harness',
        preset: '标准模式',
    },
    model: 'DeepSeek-V4.1-Flash High',
    permission: '工作区内修改',
    statusLine: [],
    messages: [],
    tool: null,
    placeholder: '描述你想要构建的内容，/ 调用指令，@ 文件或对话',
    rightbarTitle: '开始',
    rightbarActions: [
        {
            id: 'workspace-files',
            title: '工作区文件',
            description: '浏览会话工作区的文件',
            shortcut: 'Ctrl + Alt + P',
        },
        {
            id: 'new-terminal',
            title: '新建终端',
            description: '在会话工作区运行命令',
            shortcut: 'Ctrl + `',
            expandable: true,
        },
    ],
};
