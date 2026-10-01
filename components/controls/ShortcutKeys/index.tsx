import { forwardRef, type Ref } from 'react';
import styles from './shortcut-keys.module.css';

/** 按键帽的三种官方形态。 */
export type ShortcutKeysVariant = 'plain' | 'tooltip' | 'joined';

export interface ShortcutKeysProps {
  /**
   * 键位，按书写顺序给。`+` 会渲染成间隔符（官方把分隔符也当一枚 kbd）。
   * 例：`['Ctrl', 'Alt', 'N']` 会渲染成 `Ctrl + Alt + N`。
   */
  keys: string[];
  /** 形态，默认 `plain`。 */
  variant?: ShortcutKeysVariant;
  /** 额外的布局类名。 */
  className?: string;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 快捷键按键帽。
 *
 * 产品里它出现在三处：左栏新会话按钮行尾（`plain`）、工具提示里（`tooltip`）、
 * 一组键要画成一个整体时（`joined`）。几何逐条来自产品客户端 CSS 模块
 * `_keys_38b9q_1`，见 SPEC 的 geometry-source。
 *
 * 组件整体 `aria-hidden`：键位对辅助技术是装饰，真正要读出来的键位写在触发元素的
 * `aria-keyshortcuts` 上（产品就是这么做的）。
 *
 * @example
 * <button aria-keyshortcuts="Control+Alt+N">新会话<ShortcutKeys keys={['Ctrl', 'Alt', 'N']} /></button>
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
