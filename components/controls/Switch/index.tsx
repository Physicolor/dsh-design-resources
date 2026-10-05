import { forwardRef, type ButtonHTMLAttributes } from 'react';
import styles from './switch.module.css';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'children' | 'type'> {
  /** Current switch state. Fully controlled — the component keeps no state of its own. */
  checked: boolean;
  /** The state a click asks to switch to (`!checked`). */
  onChange: (next: boolean) => void;
  /** Accessible name, required. The switch has no visible text, so a screen reader has only this to go on. */
  label: string;
  /** Whether to reject input, defaults to `false`. Set it to `true` while a write is in flight too. */
  disabled?: boolean;
  /** Hover tooltip, usually explaining why the switch is locked. */
  title?: string;
  /** Class appended to the root node, for external layout positioning. */
  className?: string;
}

/**
 * Switch. Fully controlled, with just one pair of ports: `checked` + `onChange`.
 *
 * Geometry follows the official `Switch.module.css` `.switch` (36×20 / padding 2px /
 * radius 10px / corner-shape round) and `.thumb` (16×16 circle, `translateX(16px)` when
 * selected, `transition: transform 120ms ease`); the implementation is original to this repository.
 *
 * Appearance hangs off `aria-checked` rather than a separate, parallel class: the visual state and the
 * state assistive technology reads come from the same attribute, so they cannot lie to each other.
 *
 * @example
 * <Switch checked={autoSave} onChange={setAutoSave} label="Auto save" />
 *
 * @example
 * // Locked while a write is in flight, with title explaining why
 * <Switch checked={on} onChange={setOn} label="Dark mode" disabled title="Writing the configuration" />
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, onChange, label, disabled = false, title, className, ...rest },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={title}
      disabled={disabled}
      className={className ? `${styles.switch} ${className}` : styles.switch}
      onClick={() => {
        onChange(!checked);
      }}
    >
      <span className={styles.thumb} />
    </button>
  );
});

export default Switch;
