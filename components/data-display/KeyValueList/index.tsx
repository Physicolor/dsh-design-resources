import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import styles from './key-value-list.module.css';

/** One key-value pair. */
export interface KeyValueItem {
  /** The key (left side), for example "Model". */
  key: ReactNode;
  /** The value (right side), for example "deepseek-v4". */
  value: ReactNode;
}

/** How the key and the value align vertically within the row: it shows clearly once the value wraps onto several lines. */
export type KeyValueListAlign = 'start' | 'center';

/** Horizontal alignment of the value column: `end` pushes the value to the far right, `start` keeps it right after the key column. */
export type KeyValueListValueAlign = 'start' | 'end';

export interface KeyValueListProps extends HTMLAttributes<HTMLDListElement> {
  /** The key-value pairs, rendered in order, with no sorting and no de-duplication. */
  items: KeyValueItem[];
  /** Vertical alignment, `center` by default. */
  align?: KeyValueListAlign;
  /** Horizontal alignment of the value column, `start` by default. */
  valueAlign?: KeyValueListValueAlign;
  /** Whether to draw a hairline between rows (none before the first row). */
  divider?: boolean;
}

/** Join class names without pulling in a dependency such as clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Key-value list: several `<dt>` / `<dd>` pairs, with the key column at a fixed level and the
 * value column free to wrap.
 *
 * The official `@deepseek-ai/dsh-client-ui-primitives` has no matching component, so the geometry
 * is assembled from these official selectors:
 * key 13/20 + `--dsw-alias-label-tertiary` (the composite token `--dsw-font-xs-13`; the colour is
 * the tertiary text of Menu `.label`), value 14/22 + `--dsw-alias-label-primary` (Button
 * `.button`), divider 0.5px + `--dsw-alias-border-l2` (markdown/MarkdownText `.markdown hr`).
 * The implementation is original to this repository.
 *
 * @example
 * <KeyValueList
 *   items={[
 *     { key: 'Model', value: 'deepseek-v4' },
 *     { key: 'Context window', value: '128K tokens' },
 *   ]}
 * />
 *
 * @example
 * // values sit on the far right, with a divider drawn between rows
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
        // items is static display data; with no stable id, using the index as the key is safe (no reordering, no insertion or removal).
        <div key={index} className={styles.item}>
          <dt className={styles.key}>{item.key}</dt>
          <dd className={styles.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
});

export default KeyValueList;
