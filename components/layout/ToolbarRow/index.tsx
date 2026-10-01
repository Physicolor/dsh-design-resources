import { forwardRef, type HTMLAttributes } from 'react';
import styles from './toolbarrow.module.css';

/** 工具条的底色形态。 */
export type ToolbarRowVariant = 'plain' | 'filled';
/** 工具条尺寸：`md` 行高 32px（默认），`sm` 行高 28px。 */
export type ToolbarRowSize = 'md' | 'sm';

export interface ToolbarRowProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 底色：
   * - `plain`（默认）透明，作为页面/面板内的普通工具分区；
   * - `filled` 官方工具条按钮底 `var(--dsw-alias-button-tool-bar-fill)`，用于浮在内容之上的浮层工具条。
   */
  variant?: ToolbarRowVariant;
  /**
   * 行高：`md` 32px（对齐官方 `ConnectionIndicator.module.css` 的 `.indicator`），
   * `sm` 28px（对齐官方 `Button.module.css` 的 `.sm`，即 `Button size="sm"` 放进来刚好撑满）。
   */
  size?: ToolbarRowSize;
  /**
   * 底部 hairline（`0.5px` + `var(--dsw-alias-border-l1)`），默认 `false`。
   * `sticky` 与它组合使用，可做出「吸顶 + 与下方内容分离」的效果。
   */
  divider?: boolean;
  /** 吸顶：`position: sticky; top: 0`。需要外层滚动容器不要有 `overflow: hidden`。 */
  sticky?: boolean;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 一排按钮 / 控件的容器：水平 flex、垂直居中、自动换行。
 *
 * 几何锚点：行高 32px 取自官方 `ConnectionIndicator.module.css` 的 `.indicator`
 * （`height: 32px`），间距 4px 取自官方 `Button.module.css` 的 `.button`
 * （`gap: 4px`）。零依赖，只用到 `react` 和 CSS Modules。
 *
 * @example
 * <ToolbarRow size="sm" divider sticky>
 *   <Button size="sm" variant="ghost">筛选</Button>
 *   <Button size="sm" variant="ghost">排序</Button>
 * </ToolbarRow>
 *
 * @example
 * // 浮在内容之上的工具条：用官方工具条按钮底
 * <ToolbarRow variant="filled">
 *   <Button variant="toolbar" size="sm">格式化</Button>
 * </ToolbarRow>
 */
export const ToolbarRow = forwardRef<HTMLDivElement, ToolbarRowProps>(function ToolbarRow(
  { variant = 'plain', size = 'md', divider = false, sticky = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        styles.row,
        variant === 'filled' && styles.filled,
        size === 'sm' && styles.sm,
        divider && styles.divider,
        sticky && styles.sticky,
        className,
      )}
    >
      {children}
    </div>
  );
});

export default ToolbarRow;
