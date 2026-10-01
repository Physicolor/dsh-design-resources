import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import styles from './sidebarrow.module.css';

/** 选中态的视觉方式。 */
export type SidebarRowSelectionStyle = 'check' | 'fill';

export interface SidebarRowProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 行标题。 */
  children?: ReactNode;
  /**
   * 前置图标。文字类内容会被放进 16×16 的容器，
   * 图标节点请自行给 `aria-hidden="true"`。
   */
  icon?: ReactNode;
  /** 是否选中。配合 `selectionStyle` 决定用尾部对勾还是整行填充。 */
  selected?: boolean;
  /**
   * 多选行的复选框形态：渲染一个真实 `<input type="checkbox">`，
   * 点击行任意位置都会切换它。此时不要再传 `selected`。
   */
  checkbox?: boolean;
  /** `checkbox` 形态下的勾选状态。 */
  checked?: boolean;
  /** 复选框的 `aria-label`（当行内没有可读文本时必填）。 */
  checkboxLabel?: string;
  /**
   * 选中态画法：`check`（默认，官方 `Menu` 的做法：保持透明底，尾部放对勾）
   * 或 `fill`（整行铺 `var(--dsw-alias-interactive-bg-hover)`）。
   */
  selectionStyle?: SidebarRowSelectionStyle;
  /** 尾部节点，如计数、快捷键提示。`check` 选中时会追加对勾。 */
  trailing?: ReactNode;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** 尾部对勾：官方 `Menu` 的选中标记，用 currentColor 上色。 */
function CheckMark() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M13.1 4.6 6.4 11.3 2.9 7.8l1.1-1.1 2.4 2.4 5.6-5.6z" fill="currentColor" />
    </svg>
  );
}

/**
 * 侧边栏 / 列表里可选中、可悬停的一行。
 *
 * 几何直接锚定官方 `Menu.module.css` 的 `.item`（min-height 40px /
 * padding 8px 10px / border-radius 10px / gap 8px / 14-22），悬停与选中填充
 * 也用官方那两条 token。零依赖，只用到 `react` 和 CSS Modules。
 *
 * @example
 * <SidebarRow icon={<IconChat aria-hidden />} selected onClick={select}>今天的对话</SidebarRow>
 *
 * @example
 * // 多选列表：真实复选框
 * <SidebarRow checkbox checked={picked} checkboxLabel="选择 报告.md" onChange={toggle}>报告.md</SidebarRow>
 */
export const SidebarRow = forwardRef<HTMLButtonElement, SidebarRowProps>(function SidebarRow(
  {
    icon,
    selected = false,
    checkbox = false,
    checked = false,
    checkboxLabel,
    selectionStyle = 'check',
    trailing,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  /** 复选框处在按钮内部：拦住冒泡，否则点复选框会再触发一次按钮的 click。 */
  function handleCheckboxClick(event: MouseEvent<HTMLInputElement>) {
    event.stopPropagation();
  }

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      aria-pressed={checkbox ? undefined : selected}
      className={cx(
        styles.row,
        !checkbox && selected && selectionStyle === 'fill' && styles.selectedFill,
        className,
      )}
    >
      {checkbox ? (
        <span className={styles.leading}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={checked}
            readOnly
            tabIndex={-1}
            aria-label={checkboxLabel}
            onClick={handleCheckboxClick}
          />
        </span>
      ) : icon != null ? (
        <span className={styles.leading} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.label}>{children}</span>
      {trailing != null ? <span className={styles.trailing}>{trailing}</span> : null}
      {!checkbox && selected && selectionStyle === 'check' ? (
        <span className={styles.check}>
          <CheckMark />
        </span>
      ) : null}
    </button>
  );
});

export default SidebarRow;
