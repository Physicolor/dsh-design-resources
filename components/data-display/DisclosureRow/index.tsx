import { forwardRef, type KeyboardEvent, type ReactNode } from 'react';
import styles from './disclosure-row.module.css';

export interface DisclosureRowProps {
  /** 折叠态里显示的行内图标（16×16 盒子、内部渲染 14×14）。悬停整行时它淡出、箭头淡入。 */
  icon?: ReactNode;
  /** 行标题，通常是一行 13px 文字。 */
  title: ReactNode;
  /** 是否展开。受控属性，组件自己不保存状态。 */
  open: boolean;
  /** 这一行是否可展开。为 `false` 时不渲染箭头、不加交互语义。 */
  expandable: boolean;
  /** 展开 / 收起时回调。键盘（Enter、空格）与点击都走它。 */
  onToggle: () => void;
  /**
   * 整行是否可点击切换。默认 `false` —— 此时只有左侧 16×16 的图标按钮能切换；
   * 打开后整行（24px 高、整行宽）都成为命中区，更符合触控与最小命中区要求。
   */
  expandOnRowClick?: boolean;
  /** 折叠时挂在标题后面的次要信息（例如当前值、状态摘要）。展开后不再渲染。 */
  collapsedContent?: ReactNode;
  /** 展开后渲染在行下方的详情内容。 */
  children?: ReactNode;
  /** 根元素的额外类名，用于外部布局（宽度、外边距等）。 */
  className?: string;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 行内箭头。本仓库自绘：官方用的是 IconChevronDownOutline14（14×14 的填充轮廓形），
 * 这里画同尺寸、1.4px 描边的等价箭头，不复制官方 path 数据。
 * 官方在「折叠悬停」与「已展开」两种状态下用的是同一个方向的箭头（不旋转），本组件保持一致。
 */
function Chevron({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3.4 5.4 7 9l3.6-3.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 可展开行：一行 24px 的紧凑标题，点开后在下方渲染详情。
 *
 * 几何参照官方 DisclosureRow（行高 24px、leading 16×16 且 margin-right 6px、
 * 行内字形 14×14、标题 13px/24px；悬停时图标与箭头各 100ms 淡入淡出），
 * 实现为本仓库原创。官方用 `--dsh-content-font-delta` 让这一行跟随字体偏好缩放，
 * 本仓库固定为官方默认值（delta = 0）。
 *
 * @example
 * <DisclosureRow
 *   icon={<IconFolder />}
 *   title="已修改文件"
 *   open={open}
 *   expandable
 *   expandOnRowClick
 *   collapsedContent="3 个"
 *   onToggle={() => setOpen(!open)}
 * >
 *   <ul>…</ul>
 * </DisclosureRow>
 */
export const DisclosureRow = forwardRef<HTMLDivElement, DisclosureRowProps>(function DisclosureRow(
  {
    icon,
    title,
    open,
    expandable,
    onToggle,
    expandOnRowClick = false,
    collapsedContent,
    children,
    className,
  },
  ref,
) {
  /** 只有「可展开 + 允许点整行」时，整行才是按钮；否则按钮只是左侧那个图标。 */
  const rowExpands = expandable && expandOnRowClick;

  const handleRowKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault(); // 空格默认会滚动页面
    onToggle();
  };

  /**
   * 折叠态的 leading 内容。箭头预览只在「可展开」时出现——官方同名的
   * `previewChevron` 参数默认等于 `expandable`，本仓库不暴露该参数，固定取其默认值。
   */
  const leadingContent = open ? (
    <Chevron />
  ) : expandable ? (
    <>
      <span className={styles.iconIdle}>{icon}</span>
      <Chevron className={styles.chevronHover} />
    </>
  ) : (
    icon
  );

  return (
    <div ref={ref} className={cx(styles.root, className)} data-open={open ? '' : undefined}>
      <div
        className={styles.row}
        data-disclosure-row=""
        data-expandable={rowExpands ? '' : undefined}
        role={rowExpands ? 'button' : undefined}
        tabIndex={rowExpands ? 0 : undefined}
        aria-expanded={rowExpands ? open : undefined}
        onClick={rowExpands ? onToggle : undefined}
        onKeyDown={rowExpands ? handleRowKeyDown : undefined}
      >
        {expandable && !rowExpands ? (
          <button
            type="button"
            className={styles.leading}
            aria-expanded={open}
            onClick={(event) => {
              event.stopPropagation();
              handleLeadingClick();
            }}
          >
            {leadingContent}
          </button>
        ) : (
          <span className={styles.leading}>{leadingContent}</span>
        )}
        <span className={styles.title}>{title}</span>
        {!open ? collapsedContent : null}
      </div>
      {open ? children : null}
    </div>
  );
});

export default DisclosureRow;
