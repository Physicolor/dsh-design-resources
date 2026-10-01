import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import styles from './panelheader.module.css';

/** 面板标题栏尺寸。 */
export type PanelHeaderSize = 'md' | 'sm';

export interface PanelHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** 左侧标题文本。 */
  title: ReactNode;
  /**
   * 标题下方的补充说明（12/18，`var(--dsw-alias-label-tertiary)`）。
   * 传入后标题栏高度会由内容撑开，不再锁定 --dsh-ph-height。
   */
  description?: ReactNode;
  /** 右侧动作区内容，通常是若干 `Button`/图标按钮。 */
  actions?: ReactNode;
  /**
   * 尺寸：`md` 高 44px（默认），`sm` 高 36px。
   * 传了 `description` 时高度由内容决定，该属性只影响左右内边距。
   */
  size?: PanelHeaderSize;
  /** 是否绘制底部 hairline，默认 `true`。 */
  divider?: boolean;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 面板 / 抽屉 / 侧栏的标题栏：左侧标题，右侧动作区，底部一条 hairline。
 *
 * 字号体系对齐官方 `Modal.module.css` 的 `.title`（16/24/500）——面板标题栏比
 * 对话框标题低一档，取 14/22/500，与官方 `Button.module.css` 的 `.button`
 * 同级。高度与内边距为 4 的倍数，属本仓库建议值（原因见 README）。
 *
 * @example
 * <PanelHeader title="会话设置" actions={<Button size="sm" icon={<IconClose />} aria-label="关闭" iconOnly />} />
 *
 * @example
 * // 带说明、紧凑尺寸、不要分隔线（自绘边框时）
 * <PanelHeader size="sm" divider={false} title="文件" description="3 个已修改" />
 */
export const PanelHeader = forwardRef<HTMLDivElement, PanelHeaderProps>(function PanelHeader(
  { title, description, actions, size = 'md', divider = true, className, children, ...rest },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cx(styles.header, size === 'sm' && styles.sm, divider && styles.divider, className)}
    >
      <div className={styles.heading}>
        <div className={styles.title}>{title}</div>
        {description != null ? <div className={styles.description}>{description}</div> : null}
        {children}
      </div>
      {actions != null ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
});

export default PanelHeader;
