import { forwardRef, type ReactNode, type Ref } from 'react';
import styles from './running-ring.module.css';

export interface RunningRingProps {
  /** Rendered size (px), default 14 — the size the product actually renders in the left sidebar's conversation row. */
  size?: number;
  /**
   * Text for screen readers, for example "Running". In the product the conversation row puts
   * visually hidden text right next to the ring; when omitted nothing is rendered (the ring
   * then does not exist at all for assistive technology).
   */
  label?: ReactNode;
  /** Extra layout class name; the caller decides margins, alignment and so on. */
  className?: string;
}

/** Join class names without pulling in a dependency like clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Running ring: a track at 25% opacity plus an arc that travels around it and stretches on its own.
 *
 * It says "in progress, and there is no telling how long" — not a percentage of progress
 * (that needs a progress bar), and not "done" (that is the static state dot). The product uses it
 * at the start of a conversation row in the left sidebar in place of the conversation glyph, and
 * every value comes from the running interface (see the geometry source in the SPEC).
 *
 * @example
 * <RunningRing label="Running" />
 */
export const RunningRing = forwardRef<HTMLSpanElement, RunningRingProps>(function RunningRing(
  { size = 14, label, className },
  ref,
) {
  return (
    <span ref={ref} className={cx(styles.root, className)}>
      <svg
        className={styles.ring}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <g className={styles.motion}>
          <circle className={styles.track} cx="12" cy="12" r="9.5" />
          <circle className={styles.arc} cx="12" cy="12" r="9.5" />
        </g>
      </svg>
      {label === undefined ? null : <span className={styles.srOnly}>{label}</span>}
    </span>
  );
});

export default RunningRing;
