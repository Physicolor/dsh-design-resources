import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  /** 可选前置图标节点，会被放进 16×16 的图标容器里（例如搜索、链接图标）。 */
  icon?: ReactNode;
  /** 追加到外层容器的 class，用于外部布局定位。 */
  className?: string;
}

/**
 * 单行文本输入框。
 *
 * 几何参照官方 `Input.module.css` 的 `.wrap`（h32 / padding 0 8px / gap 6px /
 * radius 8px / 0.5px 描边）、`.icon`（16×16）与 `.input`（14-22），
 * 实现为本仓库原创。
 *
 * `ref` 透传到内部原生 `<input>`，其余 input 属性（`value` / `onChange` /
 * `placeholder` / `type` / `disabled` …）也全部透传。
 *
 * @example
 * const ref = useRef<HTMLInputElement>(null);
 * <Input ref={ref} placeholder="搜索会话" onChange={(e) => setQ(e.target.value)} />
 *
 * @example
 * // 带 16×16 前置图标
 * <Input icon={<SearchIcon aria-hidden="true" />} placeholder="搜索" />
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
