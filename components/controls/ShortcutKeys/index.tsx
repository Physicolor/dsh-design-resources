import { forwardRef, type Ref } from 'react';
import styles from './shortcut-keys.module.css';

/** The three official forms of the keycap. */
export type ShortcutKeysVariant = 'plain' | 'tooltip' | 'joined';

export interface ShortcutKeysProps {
  /**
   * The keys, in written order. A `+` renders as a separator (the official set treats the separator as a kbd too).
   * Example: `['Ctrl', 'Alt', 'N']` renders as `Ctrl + Alt + N`.
   */
  keys: string[];
  /** Form, defaults to `plain`. */
  variant?: ShortcutKeysVariant;
  /** Extra layout class name. */
  className?: string;
}

/** Join class names, without pulling in a dependency like clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Keyboard shortcut keycaps.
 *
 * The product shows them in three places: at the end of the left sidebar's new-conversation button row (`plain`),
 * inside a tooltip (`tooltip`), and where a group of keys has to read as one piece (`joined`). Every value comes
 * from the product client CSS module `_keys_38b9q_1`, item by item, as set out in the SPEC's geometry-source.
 *
 * The component is `aria-hidden` as a whole: keycaps are decoration to assistive technology, and the combination
 * that actually has to be spoken goes on the trigger element's `aria-keyshortcuts` (which is how the product does it).
 *
 * @example
 * <button aria-keyshortcuts="Control+Alt+N">New conversation<ShortcutKeys keys={['Ctrl', 'Alt', 'N']} /></button>
 */
export const ShortcutKeys = forwardRef<HTMLSpanElement, ShortcutKeysProps>(function ShortcutKeys(
  { keys, variant = 'plain', className },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx(styles.keys, variant === 'tooltip' && styles.tooltip, variant === 'joined' && styles.joined, className)}
      aria-hidden="true"
    >
      {keys.map((key, index) => (
        <kbd key={`${key}-${index}`} className={key === '+' ? styles.separator : styles.key}>
          {key}
        </kbd>
      ))}
    </span>
  );
});

export default ShortcutKeys;
