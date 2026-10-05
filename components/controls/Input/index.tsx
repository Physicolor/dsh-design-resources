import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  /** Optional leading icon node, placed inside a 16×16 icon container (a search or link icon, say). */
  icon?: ReactNode;
  /** Class appended to the outer container, for external layout positioning. */
  className?: string;
}

/**
 * Single-line text input.
 *
 * Geometry follows the official `Input.module.css`: `.wrap` (h32 / padding 0 8px / gap 6px /
 * radius 8px / 0.5px border), `.icon` (16×16) and `.input` (14-22);
 * the implementation is original to this repository.
 *
 * `ref` is forwarded to the inner native `<input>`, and every other input attribute
 * (`value` / `onChange` / `placeholder` / `type` / `disabled` …) is forwarded too.
 *
 * @example
 * const ref = useRef<HTMLInputElement>(null);
 * <Input ref={ref} placeholder="Search conversations" onChange={(e) => setQ(e.target.value)} />
 *
 * @example
 * // With a 16×16 leading icon
 * <Input icon={<SearchIcon aria-hidden="true" />} placeholder="Search" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ icon, className, ...rest }, ref) {
  return (
    <span className={className ? `${styles.wrap} ${className}` : styles.wrap}>
      {icon != null ? <span className={styles.icon}>{icon}</span> : null}
      <input {...rest} ref={ref} className={styles.input} />
    </span>
  );
});

export default Input;
