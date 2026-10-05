import { forwardRef, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import styles from './inline-notice.module.css';

/** Notice tone. Maps one-to-one onto the official state colours. */
export type InlineNoticeTone = 'info' | 'success' | 'warn' | 'error';

export interface InlineNoticeProps extends HTMLAttributes<HTMLElement> {
  /** Tone, default `info`. */
  tone?: InlineNoticeTone;
  /** Leading status icon node; the container is 14×14 and takes the tone's text colour. */
  icon?: ReactNode;
  /** The text. */
  children?: ReactNode;
  /** Multiline form: height becomes auto and the vertical padding is 6px on each side. The default single line is 32px. */
  multiline?: boolean;
  /** Passing it renders the dismiss control on the right. */
  onDismiss?: () => void;
  /** Accessible name for the dismiss control, defaulting to the label built into the component. */
  dismissLabel?: string;
}

/** Join class names without pulling in a dependency like clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Inline notice: a status message that stays in the document flow; it can carry an icon,
 * be dismissible, and run to multiple lines.
 *
 * The single-line geometry follows `.indicator` / `.icon` in the official
 * `ConnectionIndicator.module.css` (h32 / padding 0 10px / radius 8px / 12-18 / 500 /
 * icon 14×14), and the colours combine the official state tertiary background with the
 * state primary colour. The official set has no variable for the `info` and `error`
 * backgrounds, so they are derived from the primary colour with `color-mix`, following the
 * existing approach in the official `Tag.module.css` (see the README).
 * The implementation is original to this repository.
 *
 * Two forms:
 * - No `onDismiss`: the root is a `<div>`, shown statically.
 * - With `onDismiss`: the root is a `<button>` (the whole bar dismisses on click), and the
 *   dismiss control drops to a `<span>` with `role="button"` — a `<button>` cannot contain
 *   another `<button>`.
 *
 * @example
 * <InlineNotice tone="warn" icon={<WarningIcon />}>Your connection is unstable</InlineNotice>
 *
 * @example
 * <InlineNotice tone="success" onDismiss={() => setSaved(false)}>Saved locally</InlineNotice>
 *
 * @example
 * <InlineNotice tone="error" multiline>
 *   Upload failed: the file is over 20MB. Compress it and try again.
 * </InlineNotice>
 */
export const InlineNotice = forwardRef<HTMLElement, InlineNoticeProps>(function InlineNotice(
  {
    tone = 'info',
    icon,
    children,
    multiline = false,
    onDismiss,
    dismissLabel = '关闭提示',
    className,
    ...rest
  },
  ref,
) {
  const dismissible = onDismiss !== undefined;
  const classes = cx(styles.notice, styles[tone], multiline && styles.multiline, dismissible && styles.actionable, className);

  /** When the dismiss control triggers the dismissal itself, stop it bubbling to the whole bar (otherwise it fires twice). */
  const handleDismissClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    onDismiss?.();
  };

  const handleDismissKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    onDismiss?.();
  };

  const body = (
    <>
      {icon !== undefined ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.text}>{children}</span>
      {dismissible ? (
        <span
          className={styles.dismiss}
          role="button"
          tabIndex={0}
          aria-label={dismissLabel}
          onClick={handleDismissClick}
          onKeyDown={handleDismissKeyDown}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M14.1168 13.197L13.197 14.1167L1.8833 2.80303L2.80309 1.88324L14.1168 13.197Z" fill="currentColor" />
            <path d="M13.197 1.88326L14.1168 2.80305L2.80309 14.1168L1.8833 13.197L13.197 1.88326Z" fill="currentColor" />
          </svg>
        </span>
      ) : null}
    </>
  );

  if (dismissible) {
    return (
      <button {...rest} ref={ref} type="button" className={classes}>
        {body}
      </button>
    );
  }

  return (
    <div {...rest} ref={ref} className={classes}>
      {body}
    </div>
  );
});

export default InlineNotice;
