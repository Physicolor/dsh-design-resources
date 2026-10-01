import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import styles from './key-value-list.module.css';

/** 一条键值对。 */
export interface KeyValueItem {
  /** 键（左侧），例如「模型」。 */
  key: ReactNode;
  /** 值（右侧），例如「deepseek-v4」。 */
  value: ReactNode;
}

/** 键与值在行内的垂直对齐方式：值换行成多行时影响明显。 */
export type KeyValueListAlign = 'start' | 'center';

/** 值列的水平对齐方式：`end` 把值推到最右侧，`start` 紧跟键列。 */
export type KeyValueListValueAlign = 'start' | 'end';

export interface KeyValueListProps extends HTMLAttributes<HTMLDListElement> {
  /** 键值对数组，按顺序渲染，不排序、不去重。 */
  items: KeyValueItem[];
  /** 垂直对齐，默认 `center`。 */
  align?: KeyValueListAlign;
  /** 值列水平对齐，默认 `start`。 */
  valueAlign?: KeyValueListValueAlign;
  /** 是否在行与行之间画 hairline（第一行之前不画）。 */
  divider?: boolean;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 键值列表：多行 `<dt>` / `<dd>` 对，键列固定层级、值列可换行。
 *
 * 官方 `@deepseek-ai/dsh-client-ui-primitives` 没有对应组件，几何按以下官方选择器拼装：
 * 键 13/20 + `--dsw-alias-label-tertiary`（合成 token `--dsw-font-xs-13`，色取 Menu `.label` 的三级文字）、
 * 值 14/22 + `--dsw-alias-label-primary`（Button `.button`）、
 * 分隔线 0.5px + `--dsw-alias-border-l2`（markdown/MarkdownText `.markdown hr`）。
 * 实现为本仓库原创。
 *
 * @example
 * <KeyValueList
 *   items={[
 *     { key: '模型', value: 'deepseek-v4' },
 *     { key: '上下文窗口', value: '128K tokens' },
 *   ]}
 * />
 *
 * @example
 * // 值排到最右侧，并在行间画分隔线
 * <KeyValueList valueAlign="end" divider items={rows} />
 */
export const KeyValueList = forwardRef<HTMLDListElement, KeyValueListProps>(function KeyValueList(
  { items, align = 'center', valueAlign = 'start', divider = false, className, ...rest },
  ref,
) {
  return (
    <dl
      {...rest}
      ref={ref}
      data-align={align}
      data-value-align={valueAlign}
      data-divider={divider ? 'true' : undefined}
      className={cx(styles.list, className)}
    >
      {items.map((item, index) => (
        // items 是静态展示数据，没有稳定 id 时用下标做 key 是安全的（不重排、不增删）。
        <div key={index} className={styles.item}>
          <dt className={styles.key}>{item.key}</dt>
          <dd className={styles.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
});

export default KeyValueList;
