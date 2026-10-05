import { forwardRef, type KeyboardEvent, type ReactNode } from 'react';
import styles from './disclosure-row.module.css';

export interface DisclosureRowProps {
  /** The in-row icon shown in the collapsed state (a 16×16 box, rendered at 14×14 inside). It fades out and the chevron fades in while the whole row is hovered. */
  icon?: ReactNode;
  /** The row title, usually one line of 13px text. */
  title: ReactNode;
  /** Whether it is open. Controlled: the component keeps no state of its own. */
  open: boolean;
  /** Whether this row can expand. When `false`, no chevron is rendered and no interaction semantics are added. */
  expandable: boolean;
  /** Called on expand / collapse. Both the keyboard (Enter, Space) and clicks go through it. */
  onToggle: () => void;
  /**
   * Whether the whole row toggles on click. Defaults to `false` — then only the 16×16 icon button
   * on the left toggles; once on, the whole row (24px tall, full width) becomes the hit area,
   * which suits touch and minimum hit-area requirements better.
   */
  expandOnRowClick?: boolean;
  /** Secondary information hung after the title when collapsed (for example the current value or a status summary). Not rendered once the row is open. */
  collapsedContent?: ReactNode;
  /** Detail content rendered below the row once it is open. */
  children?: ReactNode;
  /** Extra class name for the root element, for outside layout (width, margin and the like). */
  className?: string;
}

/** Join class names without pulling in a dependency such as clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * The in-row chevron. Drawn by this repository: the official component uses
 * IconChevronDownOutline14 (a 14×14 filled outline shape), and this draws an equivalent arrow
 * at the same size with a 1.4px stroke, without copying the official path data.
 * Officially the "collapsed, hovered" and the "expanded" state use an arrow pointing the same
 * way (no rotation); this component does the same.
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
 * An expandable row: one 24px line of compact title, and the detail renders below it once opened.
 *
 * The geometry follows the official DisclosureRow (row height 24px, leading 16×16 with
 * margin-right 6px, in-row glyph 14×14, title 13px/24px; on hover the icon and the chevron each
 * fade over 100ms), and the implementation is original to this repository. Officially
 * `--dsh-content-font-delta` makes this row scale with the font preference; this repository
 * fixes it at the official defaults (delta = 0).
 *
 * @example
 * <DisclosureRow
 *   icon={<IconFolder />}
 *   title="Files modified"
 *   open={open}
 *   expandable
 *   expandOnRowClick
 *   collapsedContent="3 items"
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
  /** The whole row is a button only when it is expandable and the whole row is clickable; otherwise the button is just that icon on the left. */
  const rowExpands = expandable && expandOnRowClick;

  const handleRowKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault(); // Space scrolls the page by default
    onToggle();
  };

  /**
   * The leading content of the collapsed state. The chevron preview appears only when the row
   * is expandable — the official parameter of the same name, `previewChevron`, defaults to
   * `expandable`; this repository does not expose that parameter and fixes it at its default.
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
