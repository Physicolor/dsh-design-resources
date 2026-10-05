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

/** Join classes without pulling in a dependency like clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Semantic heading level. */
export type ListRowHeadingLevel = 2 | 3 | 4 | 5 | 6;

/** The two ways a row group carries its separators. */
export type ListRowSeparatorMode = 'hairline' | 'none';

/* -------------------------------------------------------------------- row */

export interface ListRowProps extends HTMLAttributes<HTMLElement> {
  /**
   * Makes the whole row a `<button>` (with keyboard focus and a hover background).
   * Once enabled, the row must not hold another interactive control (that would nest buttons).
   */
  interactive?: boolean;
  /** Only has an effect when `interactive` is set. */
  disabled?: boolean;
  /** Leading content, placed inside a 16×16 icon container. */
  leading?: ReactNode;
  /** Trailing content (a count, a status dot, a chevron). */
  trailing?: ReactNode;
}

/**
 * One row in a list row group.
 *
 * The row geometry follows the official Menu's menu item (min-height 40 / padding 8px 10px /
 * radius 10px / gap 8px / 14-22); the implementation is original to this repository.
 * It renders a `<div>` by default (a display-only row, which may hold buttons); with
 * `interactive` it renders `<button type="button">` and must hold no other interactive control.
 *
 * @example
 * <ListRow leading={<IconFolder />} trailing="12 items">Workspace</ListRow>
 * <ListRow interactive onClick={open}>Open settings</ListRow>
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

/* --------------------------------------------------------------- separator */

export type ListRowSeparatorProps = HTMLAttributes<HTMLDivElement>;

/**
 * A separator between rows: 0.5px tall, inset 2px left and right, 4px margin above and
 * below, coloured with the official level-1 border token. Every value comes from the
 * official Menu separator item.
 *
 * Insert it yourself only in `ListRowGroup`'s `separator="none"` mode; it is an
 * alternative to the default automatic hairline, and using both gives a double line.
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
  /* Purely decorative line: it stays out of the accessibility tree (a plain div has no role; this states the intent explicitly). */
  return <div {...rest} ref={ref} aria-hidden="true" className={cx(styles.separator, className)} />;
});

/* ---------------------------------------------------------------- group */

/* Omit the native `title` (the string tooltip attribute) and take a ReactNode group title instead. */
export interface ListRowGroupProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Group title. No title row is rendered when it is omitted. */
  title?: ReactNode;
  /** Semantic level of the heading, 3 by default. */
  headingLevel?: ListRowHeadingLevel;
  /**
   * Separators between rows:
   * - `hairline` (default): adds a 0.5px `--dsw-alias-border-l1` border between adjacent rows;
   * - `none`: draws nothing; the caller inserts `ListRowSeparator` itself.
   */
  separator?: ListRowSeparatorMode;
}

/**
 * A list row group: a group title + a set of rows + separators between rows.
 *
 * Every typographic value for the title comes from the official Menu title row
 * (padding 8px 10px / 12-16 / label-tertiary), the spacing between rows is 0, and the
 * separator is 0.5px + `--dsw-alias-border-l1`.
 * The implementation is original to this repository; the official CSS source was not copied.
 *
 * It only does layout and typography and imports no other component from the repository; the
 * rows come in from the caller through `children` (ideally `ListRow`s).
 *
 * @example
 * <ListRowGroup title="Startup behaviour">
 *   <ListRow interactive>Restore the last session</ListRow>
 *   <ListRow interactive>Always start a new session</ListRow>
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
