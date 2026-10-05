import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './button.module.css';

/** The button's visual family. */
export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'toolbar';

/** Button size: `md` is the standard 36px capsule, `sm` the compact 28px one. */
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual family, defaults to `ghost`. */
  variant?: ButtonVariant;
  /** Size, defaults to `md`. */
  size?: ButtonSize;
  /** Leading icon node, placed inside a 16×16 icon container. */
  icon?: ReactNode;
  /**
   * Icon-only button: renders as a square (width = height).
   * With it on you have to supply your own `aria-label`, otherwise screen readers cannot tell what the button does.
   */
  iconOnly?: boolean;
}

/** Join class names, without pulling in a dependency like clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Capsule button.
 *
 * Geometry follows the official Button.module.css the current product loads (h36 / padding 0 14px / gap 4px /
 * radius var(--dsw-radius-md)=12px; compact h28 / 12-18 / padding 0 10px /
 * radius var(--dsw-radius-sm)=8px); the implementation is original to this repository.
 *
 * @example
 * <Button variant="primary" onClick={save}>Save</Button>
 * <Button size="sm" icon={<IconPlus />} aria-label="New" iconOnly />
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'ghost', size = 'md', icon, iconOnly = false, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={cx(styles.button, styles[variant], size === 'sm' && styles.sm, iconOnly && styles.iconOnly, className)}
    >
      {icon != null ? <span className={styles.icon}>{icon}</span> : null}
      {children}
    </button>
  );
});

export default Button;
