import { forwardRef, type LabelHTMLAttributes, type ReactNode } from 'react';
import styles from './settingsrow.module.css';

export interface SettingsRowProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** The settings item's title (14/22, `var(--dsw-alias-label-primary)`). */
  title: ReactNode;
  /** Optional description text (13/20, the official composite token `--dsw-font-xs-13`, `var(--dsw-alias-label-tertiary)`). */
  description?: ReactNode;
  /** The control area on the right, usually a `Switch` / `Input` / `Button` / `<select>`. */
  control?: ReactNode;
  /** Whether to draw the bottom hairline (`0.5px` + `var(--dsw-alias-border-l2)`), default `true`. */
  divider?: boolean;
}

/** Concatenates classes, avoiding a dependency like clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * A settings row: title + optional description on the left, control on the right.
 *
 * The root node is a `<label>`: put the `Switch` / `<input>` straight into `control`,
 * and clicking the title text toggles the control without needing `htmlFor`.
 * The row spacing, line heights and divider all use multiples of 4 or the official `0.5px` hairline.
 *
 * @example
 * <SettingsRow title="Auto-save" description="Writes to disk 2 seconds after every edit" control={<Switch checked={on} onChange={toggle} aria-label="Auto-save" />} />
 *
 * @example
 * // No divider on the last row
 * <SettingsRow divider={false} title="Language" control={<Select value={lang} onChange={pick} />} />
 */
export const SettingsRow = forwardRef<HTMLLabelElement, SettingsRowProps>(function SettingsRow(
  { title, description, control, divider = true, className, children, ...rest },
  ref,
) {
  return (
    <label {...rest} ref={ref} className={cx(styles.row, divider && styles.divider, className)}>
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {description != null ? <span className={styles.description}>{description}</span> : null}
        {children}
      </span>
      {control != null ? <span className={styles.control}>{control}</span> : null}
    </label>
  );
});

export default SettingsRow;
