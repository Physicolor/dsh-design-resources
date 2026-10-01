import { forwardRef, type LabelHTMLAttributes, type ReactNode } from 'react';
import styles from './settingsrow.module.css';

export interface SettingsRowProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** 设置项标题（14/22，`var(--dsw-alias-label-primary)`）。 */
  title: ReactNode;
  /** 可选的说明文字（13/20，官方合成 token `--dsw-font-xs-13`，`var(--dsw-alias-label-tertiary)`）。 */
  description?: ReactNode;
  /** 右侧控件区，通常是 `Switch` / `Input` / `Button` / `<select>`。 */
  control?: ReactNode;
  /** 是否绘制底部 hairline（`0.5px` + `var(--dsw-alias-border-l2)`），默认 `true`。 */
  divider?: boolean;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 设置项行：左侧标题 + 可选说明，右侧控件。
 *
 * 根节点是 `<label>`：把 `Switch` / `<input>` 直接放进 `control`，
 * 点击标题文字即可切换控件，不需要 `htmlFor`。
 * 行距、行高与分隔线全部使用 4 的倍数或官方 `0.5px` hairline。
 *
 * @example
 * <SettingsRow title="自动保存" description="每次编辑后 2 秒写入磁盘" control={<Switch checked={on} onChange={toggle} aria-label="自动保存" />} />
 *
 * @example
 * // 最后一行不要分隔线
 * <SettingsRow divider={false} title="语言" control={<Select value={lang} onChange={pick} />} />
 */
export const SettingsRow = forwardRef<HTMLLabelElement, SettingsRowProps>(function SettingsRow(
  { title, description, control, divider = true, className, children, ...rest },
  ref,
) {
  return (
    <label {...rest} ref={ref} className={cx(styles.row, divider && styles.divider, className)}>
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {description != null ? <span className={styles.description}>{description}</span> : null}
        {children}
      </span>
      {control != null ? <span className={styles.control}>{control}</span> : null}
    </label>
  );
});

export default SettingsRow;
