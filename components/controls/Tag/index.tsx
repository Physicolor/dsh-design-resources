import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import styles from './tag.module.css';

/**
 * 标签调色板。每个 tone 对应一种已发布的固定观感。
 *
 * - `outline`：细描边 + 三级文字，只读场景的默认值。
 * - `solid`：反色填充，一组标签里用来标出当前选中的那一个。
 * - `neutral`：平台灰底，纯中性事实，不带状态含义。
 * - `quiet`：只有文字没有底色，比 `neutral` 更安静。
 * - `success`：绿色淡底，健康 / 已启用。
 * - `info`：蓝色淡底，信息性归类，不代表健康度。
 * - `warning`：琥珀色淡底，需要关注但还没失败。
 * - `danger`：红色淡底，已经失败。
 */
export type TagTone
  = | 'outline'
    | 'solid'
    | 'neutral'
    | 'quiet'
    | 'success'
    | 'info'
    | 'warning'
    | 'danger';

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'className'> {
  /** 调色板，默认 `outline`。 */
  tone?: TagTone;
  /** 追加到根节点的 class，用于外部布局定位。 */
  className?: string;
  /** 标签文案，由调用方负责本地化。 */
  children?: ReactNode;
}

/**
 * 只读标签。全库统一一种几何，只有配色随 `tone` 变化。
 *
 * 几何参照官方 `Tag.module.css` 的 `.tag`（radius 999px / padding 1px 8px /
 * 11-17 / weight 500 / nowrap）与 8 个 `data-tone` 选择器，实现为本仓库原创。
 *
 * 配色一律通过 `data-tone` 属性选择器切换，与官方保持一致，
 * 这样外部仍然可以用自己的 class 调整摆放而不影响配色。
 *
 * @example
 * <Tag>草稿</Tag>
 * <Tag tone="success">已启用</Tag>
 * <Tag tone="danger">构建失败</Tag>
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { tone = 'outline', className, children, ...rest },
  ref,
) {
  return (
    <span {...rest} ref={ref} className={className ? `${styles.tag} ${className}` : styles.tag} data-tone={tone}>
      {children}
    </span>
  );
});

export default Tag;
