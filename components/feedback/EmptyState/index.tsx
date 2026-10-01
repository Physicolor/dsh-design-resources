import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import styles from './empty-state.module.css';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** 图标节点，渲染在 32×32 的图标位里。缺省则整个图标位不渲染。 */
  icon?: ReactNode;
  /** 标题，14/22。 */
  title: ReactNode;
  /** 补充说明，13/20，颜色次级。缺省则不渲染。 */
  description?: ReactNode;
  /** 动作插槽，例如一个 `<Button>`。放在标题/说明下方，间距 16px。 */
  action?: ReactNode;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 空状态：没有内容时给用户的占位说明 + 下一步入口。
 *
 * 官方没有同名组件，本文全部数值为本仓库建议值，但排版层级刻意对齐官方
 * 文字层级（标题 14/22、说明 13/20，见 README 的「几何来源」）。
 * 零依赖，只用到 `react` 和 CSS Modules。
 *
 * @example
 * <EmptyState
 *   icon={<InboxIcon />}
 *   title="还没有会话"
 *   description="新建一个会话，问第一个问题。"
 *   action={<Button variant="primary">新建会话</Button>}
 * />
 *
 * @example
 * // 只有标题的极简用法
 * <EmptyState title="没有匹配的结果" />
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { icon, title, description, action, className, ...rest },
  ref,
) {
  return (
    <div {...rest} ref={ref} className={cx(styles.empty, className)}>
      {icon !== undefined ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <p className={styles.title}>{title}</p>
      {description !== undefined ? <p className={styles.description}>{description}</p> : null}
      {action !== undefined ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
});

export default EmptyState;
