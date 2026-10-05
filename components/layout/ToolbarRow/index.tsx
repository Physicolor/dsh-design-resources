import { forwardRef, type HTMLAttributes } from 'react';
import styles from './toolbarrow.module.css';

/** The toolbar's background variant. */
export type ToolbarRowVariant = 'plain' | 'filled';
/** Toolbar size: `md` has a 32px row height (default), `sm` 28px. */
export type ToolbarRowSize = 'md' | 'sm';

export interface ToolbarRowProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Background:
   * - `plain` (default) is transparent, for an ordinary tool section inside a page / panel;
   * - `filled` is the official toolbar-button ground `var(--dsw-alias-button-tool-bar-fill)`, for an overlay toolbar that floats above content.
   */
  variant?: ToolbarRowVariant;
  /**
   * Row height: `md` is 32px (matching `.indicator` in the official `ConnectionIndicator.module.css`),
   * `sm` is 28px (matching the official `Button.module.css`'s `.sm`, i.e. a `Button size="sm"` just fills it).
   */
  size?: ToolbarRowSize;
  /**
   * Bottom hairline (`0.5px` + `var(--dsw-alias-border-l1)`), default `false`.
   * Combined with `sticky` it gives the "pinned to the top + separated from the content below" effect.
   */
  divider?: boolean;
  /** Pinned to the top: `position: sticky; top: 0`. The outer scroll container must not have `overflow: hidden`. */
  sticky?: boolean;
}

/** Concatenates classes, avoiding a dependency like clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * A container for a row of buttons / controls: horizontal flex, vertically centred, wrapping.
 *
 * Geometry anchors: the 32px row height comes from `.indicator` in the official
 * `ConnectionIndicator.module.css` (`height: 32px`), and the 4px spacing comes from `.button`
 * in the official `Button.module.css` (`gap: 4px`). Zero dependencies, using only `react` and CSS Modules.
 *
 * @example
 * <ToolbarRow size="sm" divider sticky>
 *   <Button size="sm" variant="ghost">Filter</Button>
 *   <Button size="sm" variant="ghost">Sort</Button>
 * </ToolbarRow>
 *
 * @example
 * // A toolbar floating above content: use the official toolbar-button ground
 * <ToolbarRow variant="filled">
 *   <Button variant="toolbar" size="sm">Format</Button>
 * </ToolbarRow>
 */
export const ToolbarRow = forwardRef<HTMLDivElement, ToolbarRowProps>(function ToolbarRow(
  { variant = 'plain', size = 'md', divider = false, sticky = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        styles.row,
        variant === 'filled' && styles.filled,
        size === 'sm' && styles.sm,
        divider && styles.divider,
        sticky && styles.sticky,
        className,
      )}
    >
      {children}
    </div>
  );
});

export default ToolbarRow;
