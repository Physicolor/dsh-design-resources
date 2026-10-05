import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import styles from './sidebarrow.module.css';

/** The visual treatment of the selected state. */
export type SidebarRowSelectionStyle = 'check' | 'fill';

export interface SidebarRowProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The row label. */
  children?: ReactNode;
  /**
   * The leading icon. Text-like content is placed in a 16×16 container;
   * give an icon node `aria-hidden="true"` yourself.
   */
  icon?: ReactNode;
  /** Whether it is selected. Together with `selectionStyle` this decides between a trailing check and a whole-row fill. */
  selected?: boolean;
  /**
   * The checkbox form of a multi-select row: renders a real `<input type="checkbox">`,
   * and clicking anywhere on the row toggles it. In this case do not pass `selected`.
   */
  checkbox?: boolean;
  /** The checked state in the `checkbox` form. */
  checked?: boolean;
  /** The checkbox's `aria-label` (required when the row holds no readable text). */
  checkboxLabel?: string;
  /**
   * How the selected state is drawn: `check` (default, the official `Menu`'s approach: keep a transparent
   * ground and put a check at the end) or `fill` (the whole row takes `var(--dsw-alias-interactive-bg-hover)`).
   */
  selectionStyle?: SidebarRowSelectionStyle;
  /** Trailing node, such as a count or a shortcut hint. A `check` selection appends the check after it. */
  trailing?: ReactNode;
}

/** Concatenates classes, avoiding a dependency like clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** The trailing check: the official `Menu`'s selection marker, coloured with currentColor. */
function CheckMark() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M13.1 4.6 6.4 11.3 2.9 7.8l1.1-1.1 2.4 2.4 5.6-5.6z" fill="currentColor" />
    </svg>
  );
}

/**
 * A selectable, hoverable row in a sidebar / list.
 *
 * The geometry is anchored directly to `.item` in the official `Menu.module.css` (min-height 40px /
 * padding 8px 10px / border-radius 10px / gap 8px / 14-22), and the hover and selected fills
 * use the same two official tokens. Zero dependencies, using only `react` and CSS Modules.
 *
 * @example
 * <SidebarRow icon={<IconChat aria-hidden />} selected onClick={select}>Today's conversation</SidebarRow>
 *
 * @example
 * // A multi-select list: a real checkbox
 * <SidebarRow checkbox checked={picked} checkboxLabel="Select report.md" onChange={toggle}>report.md</SidebarRow>
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
  /** The checkbox sits inside the button: stop the event, or clicking the checkbox fires the button's click a second time. */
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
