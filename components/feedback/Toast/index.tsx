import { useEffect, useLayoutEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './toast.module.css';

/** Default hold (fully opaque) duration, matching `HOLD_MS = 3000` in the official Toast. */
export const TOAST_HOLD_MS = 3000;

/** Fade-out duration; it must match the 1000ms of `dsh-toast-fade` in `toast.module.css`. */
export const TOAST_FADE_MS = 1000;

export interface ToastProps {
  /** The toast text. Supplied by the caller (a localised string or any React node). */
  text: ReactNode;
  /**
   * Leading icon node. It goes into a 16×16 icon container whose colour is the warning colour.
   * Give the icon itself `aria-hidden`; the text carries the meaning.
   */
  icon?: ReactNode;
  /**
   * Anchor element whose horizontal centre the toast follows (the composer card, for example);
   * without one it is centred in the viewport. Pass the DOM node itself: `anchor={composerRef.current}`.
   */
  anchor?: HTMLElement | null;
  /** Fully opaque hold duration in milliseconds, default 3000. The longer it is, the more time there is to read. */
  holdMs?: number;
  /**
   * Called once when the fade-out animation has finished and the hold timer has also run out.
   * The caller unmounts the toast here (set `open` to `false` or drop the node from the list).
   */
  onDone: () => void;
  /** Class name appended to the root. */
  className?: string;
}

/** Join class names without pulling in a dependency like clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * A brief toast, centred at the top and fading out on its own.
 *
 * Scope (important): this component owns only the presentation layer — geometry, entry and exit
 * animation, and positioning against an anchor. The timed dismissal is two separate strands: CSS
 * drives the fade-out through `--dsh-toast-hold`, and the component calls `onDone` from a
 * `holdMs + TOAST_FADE_MS` timer once the animation has run. Both share the same `holdMs`, so it
 * can never be unmounted mid-animation.
 *
 * The geometry follows `.toast` / `.icon` in the official `Toast.module.css`; the implementation
 * is original to this repository.
 *
 * @example
 * const [toast, setToast] = useState<string | null>(null);
 * // After a successful save:
 * setToast('Saved');
 * {toast !== null && (
 *   <Toast key={toast} text={toast} onDone={() => { setToast(null); }} />
 * )}
 *
 * @example
 * // Align the centre to an anchor (the composer card, for example) instead of the viewport:
 * <Toast text="Reconnected" anchor={composerRef.current} holdMs={5000} onDone={hide} />
 */
export function Toast({ text, icon, anchor, holdMs = TOAST_HOLD_MS, onDone, className }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, holdMs + TOAST_FADE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [holdMs, onDone]);

  const [left, setLeft] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (anchor == null) return undefined;
    const measure = () => {
      const rect = anchor.getBoundingClientRect();
      setLeft(rect.left + rect.width / 2);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
    };
  }, [anchor]);

  // Portal to the body: a transform / filter on an ancestor changes the containing block for
  // fixed positioning, so the toast would be trapped in that ancestor's box and clipped.
  // A missing onDone does not matter here; this only guards against SSR.
  if (typeof document === 'undefined') return null;

  const style: CSSProperties = {
    ...(left === null ? {} : { left }),
    // One value drives both the fade-out delay and the unmount timer above.
    '--dsh-toast-hold': `${String(holdMs)}ms`,
  } as CSSProperties;

  return createPortal(
    <div className={cx(styles.toast, className)} role="alert" style={style}>
      {icon !== undefined ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.text}>{text}</span>
    </div>,
    document.body,
  );
}

export default Toast;
