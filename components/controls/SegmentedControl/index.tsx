import {
  forwardRef,
  useRef,
  type ForwardedRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import styles from './segmentedcontrol.module.css';

/** Join class names, without pulling in a dependency like clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Segment size: `md` is the standard 36px segment, `sm` the compact 28px one. */
export type SegmentedControlSize = 'md' | 'sm';

/** One segment. */
export interface SegmentedControlOption<Value extends string = string> {
  /** The value this segment stands for; unique within the group. */
  value: Value;
  /** Display text (a node is fine, such as text with a unit or a badge). */
  label: ReactNode;
  /** Optional leading icon, placed inside a 16×16 icon container; purely decorative, already `aria-hidden`. */
  icon?: ReactNode;
}

export interface SegmentedControlProps<Value extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'aria-label' | 'children'> {
  /** All segments; their order is the render order. */
  options: ReadonlyArray<SegmentedControlOption<Value>>;
  /** The currently selected value (controlled). */
  value: Value;
  /** Called when the selection changes; the argument is the segment's `value`. */
  onChange: (value: Value) => void;
  /** Size, defaults to `md` (36px segments). */
  size?: SegmentedControlSize;
  /**
   * Disable the whole group. The official set has no such control and the task did not ask for one, but this
   * repository's spec CT-MF-07 requires every interactive control to have a disabled state, so it is added here:
   * the buttons use native `disabled`, the group uses `aria-disabled`.
   */
  disabled?: boolean;
  /** Accessible name, required, landing on the `role="radiogroup"` container. Example: `aria-label="View"`. */
  'aria-label': string;
}

/**
 * Segmented control: pick one of a few mutually exclusive options.
 *
 * The container geometry follows the official Menu `.list` (`padding: 4px` / `gap: 0`), its outer radius
 * follows the official Pill `.pill` (r12), each segment's height and padding follow the two official Button
 * groups `md` 36px and `sm` 28px, and the selected segment's fill and stroke reuse the official Pill `.active`
 * `--dsw-alias-button-ghost-active-fill` + `inset 0 0 0 1px --dsw-alias-button-ghost-active-border`.
 * The official set has no such control; the product form and the keyboard model are designed by this repository.
 *
 * The semantics are `radiogroup` / `radio` (not tablist): it says "pick one out of a set of mutually exclusive
 * values and hand the result to the host through onChange", whereas every tablist cell needs `aria-controls`
 * pointing at a tabpanel, and this component controls no panel.
 *
 * @example
 * const [view, setView] = useState<'list' | 'grid'>('list');
 * <SegmentedControl
 *   aria-label="View"
 *   value={view}
 *   onChange={setView}
 *   options={[
 *     { value: 'list', label: 'List' },
 *     { value: 'grid', label: 'Grid' },
 *   ]}
 * />
 *
 * @example
 * <SegmentedControl aria-label="Range" size="sm" value={range} onChange={setRange}
 *   options={[{ value: '1d', label: '1 day' }, { value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }]} />
 */
function SegmentedControlImpl<Value extends string>(
  {
    options,
    value,
    onChange,
    size = 'md',
    disabled = false,
    'aria-label': ariaLabel,
    className,
    ...rest
  }: SegmentedControlProps<Value>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const checkedIndex = options.findIndex(option => option.value === value);
  // The selected segment is the single Tab stop (roving tabindex); with nothing selected it lands on the first segment.
  const focusableIndex = checkedIndex === -1 ? 0 : checkedIndex;

  /**
   * The arrow keys move within the group: focus follows, and the selection follows with it (the radiogroup follow-focus model).
   * @param event - The keyboard event.
   * @param index - The index of the segment that fired the event.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = options.length - 1;
    if (last < 0) return;

    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = index >= last ? 0 : index + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = index <= 0 ? last : index - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }

    event.preventDefault();
    const target = options[next];
    if (target === undefined) return;
    if (target.value !== value) onChange(target.value);
    optionRefs.current[next]?.focus();
  };

  return (
    <div
      {...rest}
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      aria-disabled={disabled || undefined}
      className={cx(styles.control, size === 'sm' && styles.sm, disabled && styles.disabled, className)}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={node => {
            optionRefs.current[index] = node;
          }}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          disabled={disabled}
          tabIndex={index === focusableIndex ? 0 : -1}
          className={styles.option}
          onClick={() => {
            if (option.value !== value) onChange(option.value);
          }}
          onKeyDown={event => handleKeyDown(event, index)}
        >
          {option.icon != null ? (
            <span className={styles.icon} aria-hidden="true">{option.icon}</span>
          ) : null}
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Segmented control (the public type is generic: the literal values in `options` narrow the types of `value` / `onChange`).
 */
export const SegmentedControl = forwardRef(SegmentedControlImpl) as <Value extends string>(
  props: SegmentedControlProps<Value> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement;

export default SegmentedControl;
