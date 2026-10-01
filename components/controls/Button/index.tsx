import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './button.module.css';

/** 按钮的视觉家族。 */
export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'toolbar';

/** 按钮尺寸：`md` 为标准 36px 胶囊，`sm` 为紧凑 28px。 */
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 视觉家族，默认 `ghost`。 */
  variant?: ButtonVariant;
  /** 尺寸，默认 `md`。 */
  size?: ButtonSize;
  /** 前置图标节点，会被放进 16×16 的图标容器里。 */
  icon?: ReactNode;
  /**
   * 仅图标按钮：渲染成正方形（宽 = 高）。
   * 开启后必须自行提供 `aria-label`，否则屏幕阅读器读不出按钮用途。
   */
  iconOnly?: boolean;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 胶囊按钮。
 *
 * 几何参照官方 Button 组件（h36 / padding 0 14px / gap 4px / radius 18px；
 * 小号 h28 / 12-18 / padding 0 10px / radius 14px），实现为本仓库原创。
 *
 * @example
 * <Button variant="primary" onClick={save}>保存</Button>
 * <Button size="sm" icon={<IconPlus />} aria-label="新建" iconOnly />
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
