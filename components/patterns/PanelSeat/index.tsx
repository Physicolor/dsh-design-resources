import { forwardRef, useId, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import styles from './panel-seat.module.css';

/** Join classes without pulling in a dependency like clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Semantic heading level. */
export type PanelHeadingLevel = 2 | 3 | 4 | 5 | 6;

/* Omit the native `title` (the string tooltip attribute) and take a ReactNode title instead. */
export interface PanelSeatProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Title row text. Required: `aria-labelledby` points at it. */
  title: ReactNode;
  /** The action area on the right of the title row (usually one `sm`-sized Button). */
  actions?: ReactNode;
  /** Semantic level of the heading, 3 by default. */
  headingLevel?: PanelHeadingLevel;
  /**
   * Visual elevation:
   * - `plain` (default): transparent background, set apart from its parent by typography alone;
   * - `surface`: filled with the official code block's background, for blocks that need a paper-like feel of their own.
   */
  variant?: 'plain' | 'surface';
  /**
   * Whether to add padding to the container (12px 16px).
   * Defaults to `false`: let the host's existing conversation flow spacing speak, avoiding double
   * white space stacked with adjacent messages.
   */
  inset?: boolean;
}

/**
 * A slot container in the conversation flow: a block skeleton with a title row.
 *
 * It only does layout and typography and imports no other component from the repository; the
 * actions and body content all come in from the caller through the `actions` / `children` slots.
 *
 * The geometry follows the official ReadBlock inline block (radius 12 / banner gap 12 / background)
 * and HoverCard's padding (12px 16px); the implementation is original to this repository.
 *
 * The width shrinks to its content by default (`inline-flex`) and does not fill the conversation flow.
 *
 * @example
 * <PanelSeat title="Build output" actions={<Button size="sm">Copy</Button>}>
 *   <p>3 files, 128 KB in total.</p>
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
      /* § proposed here: default to role="group" rather than letting <section> become a
         region landmark, avoiding dozens of landmarks in one screenful of conversation;
         pass role="region" explicitly when you need a landmark. */
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
