import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import styles from './pill.module.css';

/**
 * Props shared by interactive pills.
 *
 * `active` is a controlled value: the component only draws the selected state, the state itself lives with the caller.
 */
export interface PillBaseProps {
  /** Whether it is selected (active), defaults to `false`. Controlled. */
  active?: boolean;
  /** Class appended to the root node, for external layout positioning. */
  className?: string;
  /** Pill content, usually a short text or "icon + short text". */
  children?: ReactNode;
}

/**
 * Clickable pill: with `onClick` it renders `<button type="button">`,
 * and can therefore forward every native `button` attribute.
 */
export interface InteractivePillProps extends PillBaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> {
  /** Click callback. Its presence is what makes this an interactive pill. */
  onClick: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
}

/**
 * Static pill: without `onClick` it renders `<span>`,
 * forwards only native `span` attributes, and `onClick` is ruled out at the type level.
 */
export interface StaticPillProps extends PillBaseProps, Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'className'> {
  onClick?: undefined;
}

/**
 * Pill props: a discriminated union.
 *
 * The discriminant key is `onClick` — present → the button branch; absent → the span branch.
 * That guarantees "a clickable pill gets button attributes, a static pill does not".
 */
export type PillProps
  = | (InteractivePillProps & { onClick: NonNullable<InteractivePillProps['onClick']> })
    | StaticPillProps;

/** Join class names, without pulling in a dependency like clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Pill chip. Interactive it is a button, static it is a piece of text.
 *
 * Geometry follows the official `Pill.module.css` `.pill` (h24 / padding 0 8px / gap 4px /
 * radius 12px / 12-18) plus `.interactive:hover` and `.active`; the implementation is original to this repository.
 *
 * The selected state (the official `.active`): the text steps up to `label-primary`, the background becomes
 * `button-ghost-active-fill`, and an `inset 0 0 0 1px` stroke is laid inside.
 *
 * @example
 * // Interactive: renders <button type="button">
 * <Pill active={tab === 'all'} onClick={() => setTab('all')}>All</Pill>
 *
 * @example
 * // Static: renders <span>
 * <Pill>Read only</Pill>
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
