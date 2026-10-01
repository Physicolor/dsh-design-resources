import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import styles from './pill.module.css';

/**
 * 可交互胶囊的公共属性。
 *
 * `active` 为受控值：组件只负责把选中态画出来，状态本身由调用方持有。
 */
export interface PillBaseProps {
  /** 是否处于选中（激活）态，默认 `false`。受控。 */
  active?: boolean;
  /** 追加到根节点的 class，用于外部布局定位。 */
  className?: string;
  /** 胶囊内容，通常是短文本或「图标 + 短文本」。 */
  children?: ReactNode;
}

/**
 * 可点击胶囊：有 `onClick` 时渲染 `<button type="button">`，
 * 因此可以透传全部 `button` 原生属性。
 */
export interface InteractivePillProps extends PillBaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> {
  /** 点击回调。存在即代表这是一枚可交互胶囊。 */
  onClick: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
}

/**
 * 静态胶囊：没有 `onClick` 时渲染 `<span>`，
 * 只能透传 `span` 原生属性，`onClick` 被类型层面禁掉。
 */
export interface StaticPillProps extends PillBaseProps, Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'className'> {
  onClick?: undefined;
}

/**
 * 胶囊属性：判别联合。
 *
 * 判别键就是 `onClick` —— 有它 → button 分支；没有 → span 分支。
 * 这样可以保证「能点的胶囊拿得到 button 属性，静态胶囊拿不到 button 属性」。
 */
export type PillProps
  = | (InteractivePillProps & { onClick: NonNullable<InteractivePillProps['onClick']> })
    | StaticPillProps;

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 胶囊小标签（chip）。可交互时是一枚按钮，静态时是一段文本。
 *
 * 几何参照官方 `Pill.module.css` 的 `.pill`（h24 / padding 0 8px / gap 4px /
 * radius 12px / 12-18）与 `.interactive:hover`、`.active`，实现为本仓库原创。
 *
 * 选中态画法（官方 `.active`）：文字升到 `label-primary`，底色换成
 * `button-ghost-active-fill`，并叠一圈 `inset 0 0 0 1px` 的内描边。
 *
 * @example
 * // 可交互：渲染 <button type="button">
 * <Pill active={tab === 'all'} onClick={() => setTab('all')}>全部</Pill>
 *
 * @example
 * // 静态：渲染 <span>
 * <Pill>只读</Pill>
 */
export const Pill = forwardRef<HTMLButtonElement | HTMLSpanElement, PillProps>(function Pill(props, ref) {
  const { active = false, className, children } = props;
  const rootClass = cx(styles.pill, active && styles.active);

  if (props.onClick === undefined) {
    const { active: _active, className: _className, children: _children, onClick: _onClick, ...spanRest } = props;
    return (
      <span {...spanRest} ref={ref as Ref<HTMLSpanElement>} className={rootClass}>
        {children}
      </span>
    );
  }

  const { active: _active, className: _className, children: _children, onClick, ...buttonRest } = props;
  return (
    <button
      {...buttonRest}
      ref={ref as Ref<HTMLButtonElement>}
      type={buttonRest.type ?? 'button'}
      className={cx(rootClass, styles.interactive, className)}
      onClick={onClick}
    >
      {children}
    </button>
  );
});

export default Pill;
