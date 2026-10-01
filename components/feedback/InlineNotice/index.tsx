import { forwardRef, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import styles from './inline-notice.module.css';

/** 提示语气。与官方状态色一一对应。 */
export type InlineNoticeTone = 'info' | 'success' | 'warn' | 'error';

export interface InlineNoticeProps extends HTMLAttributes<HTMLElement> {
  /** 语气，默认 `info`。 */
  tone?: InlineNoticeTone;
  /** 前置状态图标节点；容器 14×14，颜色跟随语气文字色。 */
  icon?: ReactNode;
  /** 文案。 */
  children?: ReactNode;
  /** 多行形态：高度改为 auto、上下内边距各 6px。默认单行为 32px。 */
  multiline?: boolean;
  /** 传入即渲染右侧关闭控件。 */
  onDismiss?: () => void;
  /** 关闭控件的无障碍名称，默认「关闭提示」。 */
  dismissLabel?: string;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 内联提示条：留在文档流里的状态说明，可带图标、可关闭、可多行。
 *
 * 单行几何参照官方 `ConnectionIndicator.module.css` 的 `.indicator` / `.icon`
 * （h32 / padding 0 10px / radius 8px / 12-18 / 500 / 图标 14×14），
 * 配色取官方状态三级底 + 状态主色的组合；`info` 与 `error` 的底色官方无对应
 * 变量，按官方 `Tag.module.css` 的既有手法用 `color-mix` 从主色派生（见 README）。
 * 实现为本仓库原创。
 *
 * 两个形态：
 * - 不传 `onDismiss`：根节点是 `<div>`，静态展示。
 * - 传 `onDismiss`：根节点是 `<button>`（整条可点关闭），此时关闭控件降级为
 *   `role="button"` 的 `<span>`——`<button>` 里不能再嵌 `<button>`。
 *
 * @example
 * <InlineNotice tone="warn" icon={<WarningIcon />}>当前网络不稳定</InlineNotice>
 *
 * @example
 * <InlineNotice tone="success" onDismiss={() => setSaved(false)}>已保存到本地</InlineNotice>
 *
 * @example
 * <InlineNotice tone="error" multiline>
 *   上传失败：文件超过 20MB。请压缩后重试。
 * </InlineNotice>
 */
export const InlineNotice = forwardRef<HTMLElement, InlineNoticeProps>(function InlineNotice(
  {
    tone = 'info',
    icon,
    children,
    multiline = false,
    onDismiss,
    dismissLabel = '关闭提示',
    className,
    ...rest
  },
  ref,
) {
  const dismissible = onDismiss !== undefined;
  const classes = cx(styles.notice, styles[tone], multiline && styles.multiline, dismissible && styles.actionable, className);

  /** 关闭控件自身触发关闭时，不要再冒泡给整条（否则会触发两次）。 */
  const handleDismissClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    onDismiss?.();
  };

  const handleDismissKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    onDismiss?.();
  };

  const body = (
    <>
      {icon !== undefined ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.text}>{children}</span>
      {dismissible ? (
        <span
          className={styles.dismiss}
          role="button"
          tabIndex={0}
          aria-label={dismissLabel}
          onClick={handleDismissClick}
          onKeyDown={handleDismissKeyDown}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M14.1168 13.197L13.197 14.1167L1.8833 2.80303L2.80309 1.88324L14.1168 13.197Z" fill="currentColor" />
            <path d="M13.197 1.88326L14.1168 2.80305L2.80309 14.1168L1.8833 13.197L13.197 1.88326Z" fill="currentColor" />
          </svg>
        </span>
      ) : null}
    </>
  );

  if (dismissible) {
    return (
      <button {...rest} ref={ref} type="button" className={classes}>
        {body}
      </button>
    );
  }

  return (
    <div {...rest} ref={ref} className={classes}>
      {body}
    </div>
  );
});

export default InlineNotice;
