import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import styles from './tag.module.css';

/**
 * Tag palette. Each tone is one published, fixed look.
 *
 * - `outline`: a fine border + tertiary text, the default for read-only places.
 * - `solid`: inverted fill, used to mark the selected one in a group of tags.
 * - `neutral`: the platform grey background, plain neutral fact with no state meaning.
 * - `quiet`: text only, no fill, quieter than `neutral`.
 * - `success`: a pale green fill, healthy / enabled.
 * - `info`: a pale blue fill, informational grouping, says nothing about health.
 * - `warning`: a pale amber fill, needs attention but has not failed yet.
 * - `danger`: a pale red fill, already failed.
 */
export type TagTone
  = | 'outline'
    | 'solid'
    | 'neutral'
    | 'quiet'
    | 'success'
    | 'info'
    | 'warning'
    | 'danger';

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'className'> {
  /** Palette, defaults to `outline`. */
  tone?: TagTone;
  /** Class appended to the root node, for external layout positioning. */
  className?: string;
  /** Tag text; the caller is responsible for localisation. */
  children?: ReactNode;
}

/**
 * Read-only tag. One geometry across the library; only the palette changes with `tone`.
 *
 * Geometry follows the official `Tag.module.css` `.tag` (radius 999px / padding 1px 8px /
 * 11-17 / weight 500 / nowrap) and its 8 `data-tone` selectors; the implementation is original to this repository.
 *
 * Colour always switches through the `data-tone` attribute selector, in step with the official set,
 * so an outside class can still adjust placement without touching the palette.
 *
 * @example
 * <Tag>Draft</Tag>
 * <Tag tone="success">Enabled</Tag>
 * <Tag tone="danger">Build failed</Tag>
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { tone = 'outline', className, children, ...rest },
  ref,
) {
  return (
    <span {...rest} ref={ref} className={className ? `${styles.tag} ${className}` : styles.tag} data-tone={tone}>
      {children}
    </span>
  );
});

export default Tag;
