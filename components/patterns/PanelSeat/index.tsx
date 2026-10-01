import { forwardRef, useId, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import styles from './panel-seat.module.css';

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** 语义标题级别。 */
export type PanelHeadingLevel = 2 | 3 | 4 | 5 | 6;

/* Omit 掉原生的 `title`（string 工具提示属性），换成 ReactNode 的标题。 */
export interface PanelSeatProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 标题行文本。必填：`aria-labelledby` 指向它。 */
  title: ReactNode;
  /** 标题行右侧的操作区（通常是 1 个 sm 尺寸的 Button）。 */
  actions?: ReactNode;
  /** 标题的语义级别，默认 3。 */
  headingLevel?: PanelHeadingLevel;
  /**
   * 视觉层级：
   * - `plain`（默认）：透明底，靠排版与父容器区分；
   * - `surface`：填官方代码块同款底色，用于需要独立纸面感的区块。
   */
  variant?: 'plain' | 'surface';
  /**
   * 是否给容器加内边距（12px 16px）。
   * 默认 `false`：让宿主既有的会话流间距说话，避免与相邻消息叠加出双层留白。
   */
  inset?: boolean;
}

/**
 * 会话流里的插槽容器：一个带标题行的区块骨架。
 *
 * 只做布局与排版，不 import 仓库内任何其它组件；标题行右侧的操作、正文内容
 * 全部由调用方通过 `actions` / `children` 插槽传入。
 *
 * 几何参照官方 ReadBlock 的内联区块（radius 12 / banner gap 12 / 底色）与
 * HoverCard 的内边距（12px 16px），实现为本仓库原创。
 *
 * 宽度默认按内容收缩（`inline-flex`），不铺满会话流。
 *
 * @example
 * <PanelSeat title="构建产物" actions={<Button size="sm">复制</Button>}>
 *   <p>3 个文件，共 128 KB。</p>
 * </PanelSeat>
 */
export const PanelSeat = forwardRef<HTMLDivElement, PanelSeatProps>(function PanelSeat(
  {
    title,
    actions,
    headingLevel = 3,
    variant = 'plain',
    inset = false,
    className,
    children,
    role,
    ...rest
  },
  ref,
) {
  const headingId = useId();
  const Heading = `h${headingLevel}` as ElementType;

  return (
    <div
      {...rest}
      ref={ref}
      /* § 建议值：默认 role="group" 而不是让 <section> 变成 region landmark，
         避免一屏会话里出现几十个地标；需要地标时显式传 role="region"。 */
      role={role ?? 'group'}
      aria-labelledby={headingId}
      className={cx(styles.seat, inset && styles.inset, variant === 'surface' && styles.surface, className)}
    >
      <div className={styles.header}>
        <Heading id={headingId} className={styles.title}>
          {title}
        </Heading>
        {actions != null ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
});

export default PanelSeat;
