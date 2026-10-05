import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import styles from './empty-state.module.css';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Icon node, rendered in a 32×32 icon slot. When omitted, the whole slot is not rendered. */
  icon?: ReactNode;
  /** Title, 14/22. */
  title: ReactNode;
  /** Supporting description, 13/20, secondary colour. When omitted, it is not rendered. */
  description?: ReactNode;
  /** Action slot, for example a `<Button>`. Sits below the title/description, 16px of space. */
  action?: ReactNode;
}

/** Join class names without pulling in a dependency like clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Empty state: a placeholder explanation plus the next step, for when there is no content.
 *
 * The official set has no component of this name, so every value here is proposed in this
 * repository, but the type scale deliberately follows the official one (title 14/22,
 * description 13/20; see the geometry source in the README).
 * Zero dependencies: only `react` and CSS Modules.
 *
 * @example
 * <EmptyState
 *   icon={<InboxIcon />}
 *   title="No conversations yet"
 *   description="Start a new conversation and ask your first question."
 *   action={<Button variant="primary">New conversation</Button>}
 * />
 *
 * @example
 * // The minimal form, title only
 * <EmptyState title="No matching results" />
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
