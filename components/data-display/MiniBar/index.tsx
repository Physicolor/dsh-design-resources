import { forwardRef, type HTMLAttributes } from 'react';
import styles from './mini-bar.module.css';

/** The semantic tone of the fill, taken from the official state-primary tokens. */
export type MiniBarTone = 'business' | 'success' | 'warn' | 'error';

export interface MiniBarProps extends HTMLAttributes<HTMLDivElement> {
  /** The current value. Anything outside `[0, max]` is clamped; a non-finite number counts as 0. */
  value: number;
  /** The full value, 100 by default. At 0 or less it counts as 0 (progress stays at 0). */
  max?: number;
  /** Whether to show a percentage text to the right of the bar (rounded). Hidden by default. */
  showPercent?: boolean;
  /** The semantic colour, `business` by default. */
  tone?: MiniBarTone;
  /** The accessible name of the progress bar, for example "Context usage". */
  label?: string;
}

/** Join class names without pulling in a dependency such as clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Mini bar chart / progress bar: one horizontal track plus a fill.
 *
 * The official `@deepseek-ai/dsh-client-ui-primitives` has no matching component, so the geometry
 * is assembled from these official sources: the 999px corner radius comes from Tag `.tag`
 * (capsule semantics), the fill colour comes from the official state-primary tokens (the same
 * batch Tag's tones use), and the 120ms ease duration comes from Switch `.thumb`.
 * The implementation is original to this repository.
 *
 * @example
 * <MiniBar value={82} label="Cache hit rate" />
 *
 * @example
 * <MiniBar value={41} max={64} tone="warn" showPercent label="Context usage" />
 */
export const MiniBar = forwardRef<HTMLDivElement, MiniBarProps>(function MiniBar(
  {
    value,
    max = 100,
    showPercent = false,
    tone = 'business',
    label,
    className,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
  const safeValue = Number.isFinite(value) ? value : 0;
  const clamped = safeMax > 0 ? Math.min(Math.max(safeValue, 0), safeMax) : 0;
  const percent = safeMax > 0 ? (clamped / safeMax) * 100 : 0;

  return (
    <div
      {...rest}
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clamped}
      aria-label={label ?? ariaLabel}
      className={cx(styles.bar, className)}
    >
      <div className={styles.track}>
        <div className={styles.fill} data-tone={tone} style={{ width: `${percent}%` }} />
      </div>
      {showPercent ? (
        // The value is already exposed through aria-valuenow / aria-valuemax, so this visible text is duplicate information for a screen reader.
        <span className={styles.percent} aria-hidden="true">
          {`${Math.round(percent)}%`}
        </span>
      ) : null}
    </div>
  );
});

export default MiniBar;
