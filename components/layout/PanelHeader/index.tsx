import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import styles from './panelheader.module.css';

/** Panel header bar size. */
export type PanelHeaderSize = 'md' | 'sm';

export interface PanelHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** The title text on the left. */
  title: ReactNode;
  /**
   * Supplementary description below the title (12/18, `var(--dsw-alias-label-tertiary)`).
   * When provided, the header bar's height is set by its content and no longer locked to --dsh-ph-height.
   */
  description?: ReactNode;
  /** The content of the right-hand action area, usually several `Button`s / icon buttons. */
  actions?: ReactNode;
  /**
   * Size: `md` is 44px high (default), `sm` is 36px high.
   * With a `description` the height is set by the content; this property then only affects the left / right padding.
   */
  size?: PanelHeaderSize;
  /** Whether to draw the bottom hairline, default `true`. */
  divider?: boolean;
}

/** Concatenates classes, avoiding a dependency like clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * The header bar of a panel / drawer / sidebar: title on the left, action area on the right, a hairline at the bottom.
 *
 * The type scale follows `.title` in the official `Modal.module.css` (16/24/500) — a panel header bar
 * sits one step below a dialog title, so it takes 14/22/500, the same step as `.button` in the official
 * `Button.module.css`. The height and padding are multiples of 4 and are values proposed here (for why, see the README).
 *
 * @example
 * <PanelHeader title="Session settings" actions={<Button size="sm" icon={<IconClose />} aria-label="Close" iconOnly />} />
 *
 * @example
 * // With a description, compact size, no divider (when drawing your own border)
 * <PanelHeader size="sm" divider={false} title="Files" description="3 modified" />
 */
export const PanelHeader = forwardRef<HTMLDivElement, PanelHeaderProps>(function PanelHeader(
  { title, description, actions, size = 'md', divider = true, className, children, ...rest },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cx(styles.header, size === 'sm' && styles.sm, divider && styles.divider, className)}
    >
      <div className={styles.heading}>
        <div className={styles.title}>{title}</div>
        {description != null ? <div className={styles.description}>{description}</div> : null}
        {children}
      </div>
      {actions != null ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
});

export default PanelHeader;
