import {
  forwardRef,
  useId,
  type ButtonHTMLAttributes,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import styles from './list-row-group.module.css';

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** 语义标题级别。 */
export type ListRowHeadingLevel = 2 | 3 | 4 | 5 | 6;

/** 行组内分隔线的两种承载方式。 */
export type ListRowSeparatorMode = 'hairline' | 'none';

/* -------------------------------------------------------------------- 行 */

export interface ListRowProps extends HTMLAttributes<HTMLElement> {
  /**
   * 让整行成为一个 `<button>`（带键盘焦点与 hover 底色）。
   * 开启后行内不得再放可交互控件（会嵌套按钮）。
   */
  interactive?: boolean;
  /** 仅 `interactive` 时生效。 */
  disabled?: boolean;
  /** 前置内容，会被放进 16×16 的图标容器里。 */
  leading?: ReactNode;
  /** 尾部内容（计数、状态点、chevron）。 */
  trailing?: ReactNode;
}

/**
 * 列表行组里的一行。
 *
 * 行几何参照官方 Menu 的菜单单元（min-height 40 / padding 8px 10px /
 * radius 10px / gap 8px / 14-22），实现为本仓库原创。
 * 默认渲染 `<div>`（纯展示行，行内可以放按钮）；`interactive` 时渲染
 * `<button type="button">`，此时行内不得再有可交互控件。
 *
 * @example
 * <ListRow leading={<IconFolder />} trailing="12 项">工作区</ListRow>
 * <ListRow interactive onClick={open}>打开设置</ListRow>
 */
export const ListRow = forwardRef<HTMLElement, ListRowProps>(function ListRow(
  { interactive = false, disabled = false, leading, trailing, className, children, ...rest },
  ref,
) {
  const cls = cx(styles.row, interactive && styles.rowInteractive, className);
  const body = (
    <>
      {leading != null ? <span className={styles.rowLeading}>{leading}</span> : null}
      <span className={styles.rowLabel}>{children}</span>
      {trailing != null ? <span className={styles.rowTrailing}>{trailing}</span> : null}
    </>
  );

  if (interactive) {
    return (
      <button
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        disabled={disabled}
        className={cls}
      >
        {body}
      </button>
    );
  }

  return (
    <div {...rest} ref={ref as Ref<HTMLDivElement>} className={cls}>
      {body}
    </div>
  );
});

/* --------------------------------------------------------------- 分隔线 */

export type ListRowSeparatorProps = HTMLAttributes<HTMLDivElement>;

/**
 * 行间分隔线：0.5px 高、左右各收 2px、上下各 4px 外边距，颜色用官方
 * 一级描边 token。数值逐条取自官方 Menu 的分隔线单元。
 *
 * 只在 `ListRowGroup` 的 `separator="none"` 模式下自行插入，
 * 与默认的自动 hairline 二选一，同时用会出现双线。
 *
 * @example
 * <ListRowGroup separator="none">
 *   <ListRow>…</ListRow>
 *   <ListRowSeparator />
 *   <ListRow>…</ListRow>
 * </ListRowGroup>
 */
export const ListRowSeparator = forwardRef<HTMLDivElement, ListRowSeparatorProps>(function ListRowSeparator(
  { className, ...rest },
  ref,
) {
  /* 纯装饰线：不进入无障碍树（默认 div 无 role，此处显式写清意图）。 */
  return <div {...rest} ref={ref} aria-hidden="true" className={cx(styles.separator, className)} />;
});

/* ---------------------------------------------------------------- 行组 */

/* Omit 掉原生的 `title`（string 工具提示属性），换成 ReactNode 的分组标题。 */
export interface ListRowGroupProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** 分组标题。不传则不渲染标题行。 */
  title?: ReactNode;
  /** 标题的语义级别，默认 3。 */
  headingLevel?: ListRowHeadingLevel;
  /**
   * 行间分隔线：
   * - `hairline`（默认）：给相邻行之间加 0.5px 的 `--dsw-alias-border-l1` 描边；
   * - `none`：不画，交给调用方自己插 `ListRowSeparator`。
   */
  separator?: ListRowSeparatorMode;
}

/**
 * 列表行组：分组标题 + 一组行 + 行间分隔线。
 *
 * 标题排版逐条取自官方 Menu 的标题行（padding 8px 10px / 12-16 /
 * label-tertiary），行间距 0，分隔线 0.5px + `--dsw-alias-border-l1`。
 * 实现为本仓库原创，未复制官方 CSS 源码。
 *
 * 只做布局与排版，不 import 仓库内任何其它组件；行由调用方通过 `children`
 * 传入（推荐配 `ListRow`）。
 *
 * @example
 * <ListRowGroup title="启动行为">
 *   <ListRow interactive>恢复上次会话</ListRow>
 *   <ListRow interactive>始终新建会话</ListRow>
 * </ListRowGroup>
 */
export const ListRowGroup = forwardRef<HTMLElement, ListRowGroupProps>(function ListRowGroup(
  { title, headingLevel = 3, separator = 'hairline', className, children, ...rest },
  ref,
) {
  const headingId = useId();
  const Heading = `h${headingLevel}` as ElementType;

  return (
    <section {...rest} ref={ref} className={cx(styles.group, className)} aria-labelledby={title != null ? headingId : undefined}>
      {title != null ? (
        <Heading id={headingId} className={styles.groupLabel}>
          {title}
        </Heading>
      ) : null}
      <div className={cx(styles.rows, separator === 'hairline' && styles.rowsHairline)}>{children}</div>
    </section>
  );
});

export default ListRowGroup;
