import { forwardRef, type ButtonHTMLAttributes } from 'react';
import styles from './switch.module.css';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'children' | 'type'> {
  /** 当前开关状态。完全受控 —— 组件自己不保存状态。 */
  checked: boolean;
  /** 点击后请求切换到的状态（`!checked`）。 */
  onChange: (next: boolean) => void;
  /** 可访问名，必填。开关没有可见文字，屏幕阅读器只能靠它。 */
  label: string;
  /** 是否拒绝输入，默认 `false`。写入进行中时也应置为 `true`。 */
  disabled?: boolean;
  /** 悬浮提示，通常用来解释开关为什么被锁住。 */
  title?: string;
  /** 追加到根节点的 class，用于外部布局定位。 */
  className?: string;
}

/**
 * 开关。完全受控，只有 `checked` + `onChange` 一对出入口。
 *
 * 几何参照官方 `Switch.module.css` 的 `.switch`（36×20 / padding 2px /
 * radius 10px / corner-shape round）与 `.thumb`（16×16 圆形，选中
 * `translateX(16px)`，`transition: transform 120ms ease`），实现为本仓库原创。
 *
 * 外观挂在 `aria-checked` 而不是另起一个 class：视觉状态和辅助技术读到的
 * 状态来自同一个属性，不可能互相说谎。
 *
 * @example
 * <Switch checked={autoSave} onChange={setAutoSave} label="自动保存" />
 *
 * @example
 * // 写入进行中锁住，并用 title 说明原因
 * <Switch checked={on} onChange={setOn} label="深色模式" disabled title="正在写入配置" />
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
