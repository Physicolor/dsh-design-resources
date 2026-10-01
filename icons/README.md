# Icons — 官方图标集

本目录的内容**不是本仓库原创**：全部提取自 DeepSeek 官方客户端包
`@deepseek-ai/dsh-client-ui-primitives`（`lib/index.js` 中的图标组件）。
路径数据逐字保留，未做任何改写、重绘或"清理"。

## 版权与许可

图标版权归 DeepSeek。它们在此以**参考与互操作**的目的收录——让插件作者
能直接复用官方图标，而不是各自画一个"差不多的"关闭按钮。

**本仓库的 MIT 许可不覆盖本目录**。使用前请自行确认官方许可条款。

## 提取方式（可复现）

```sh
node scripts/collect-icons.mjs
```

脚本读取官方客户端包，解析每个图标组件（`IconCloseOutline16` 这类）的
JSDoc 授权名（`ic_ds_close_outline_16`）、viewBox 与全部 `path` 数据，
写出 SVG 文件与 `data/icons.json` 清单。参数 `DSH_PRIMITIVES` 可覆盖来源路径。

## 命名规律（三段式，保持一致）

| 位置 | 形式 | 例子 |
| --- | --- | --- |
| 授权名（设计稿） | `ic_ds_<名称>_<风格>_<尺寸>` | `ic_ds_close_outline_16` |
| 组件名（代码） | `Icon<名称><风格><尺寸>` | `IconCloseOutline16` |
| 文件名（本目录） | `<名称>-<风格>.svg` | `close-outline.svg` |

## 实测统计（2026-10-01，75 个图标）

- 尺寸族：`16×16` 53 个、`14×14` 19 个、`8×14` 1 个、`8.5×10.5` 1 个、`20×20` 1 个；
- **全部**使用 `fill="currentColor"`，**0 个**含 `stroke` 属性——官方图标的"描边"是路径轮廓，不是 CSS stroke；
- 因此**不要照搬 OpenHarmony 的 1.5vp 描边说法**（见 [`../spec/50-icons.md`](../spec/50-icons.md) 的实测说明）。

## 品牌标识

| 文件 | 来源 | 说明 |
| --- | --- | --- |
| `brand/fish.svg` | `FISH_LOGO_PATH` | 鱼形标识，原生 viewBox `0 0 23.16 17.04`，默认宽 24px |
| `brand/wordmark.svg` | `BrandWordmark` 组件 | 完整字标，viewBox `0 0 182 24`（17 条路径） |

两个文件都使用 `currentColor`，因此会跟随所在容器的文字颜色。
