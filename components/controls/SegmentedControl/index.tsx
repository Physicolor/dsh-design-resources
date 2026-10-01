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

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** 分段尺寸：`md` 为标准 36px 段，`sm` 为紧凑 28px 段。 */
export type SegmentedControlSize = 'md' | 'sm';

/** 一个分段。 */
export interface SegmentedControlOption<Value extends string = string> {
  /** 该段代表的值，组内必须唯一。 */
  value: Value;
  /** 显示文案（可传节点，例如带单位或带角标的文本）。 */
  label: ReactNode;
  /** 可选前置图标，会被放进 16×16 的图标容器；纯装饰，已 `aria-hidden`。 */
  icon?: ReactNode;
}

export interface SegmentedControlProps<Value extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'aria-label' | 'children'> {
  /** 全部分段，顺序即渲染顺序。 */
  options: ReadonlyArray<SegmentedControlOption<Value>>;
  /** 当前选中的值（受控）。 */
  value: Value;
  /** 选中项变化时回调，参数是该段的 `value`。 */
  onChange: (value: Value) => void;
  /** 尺寸，默认 `md`（段高 36px）。 */
  size?: SegmentedControlSize;
  /**
   * 整组禁用。官方没有此控件、任务也未要求，但仓库规范 CT-MF-07 要求每个交互控件
   * 具备 disabled 态，所以补上：按钮用原生 `disabled`，组上用 `aria-disabled`。
   */
  disabled?: boolean;
  /** 可访问名称，必填，落在 `role="radiogroup"` 的容器上。例：`aria-label="视图"`。 */
  'aria-label': string;
}

/**
 * 分段控件：在少量互斥选项中二选一。
 *
 * 容器几何参照官方 Menu 的 `.list`（`padding: 4px` / `gap: 0`）、
 * 外层圆角参照官方 Pill 的 `.pill`（r12），每段高度与内边距参照官方 Button 的
 * `md` 36px 与 `sm` 28px 两组；选中段的填充与描边直接复用官方 Pill `.active` 的
 * `--dsw-alias-button-ghost-active-fill` + `inset 0 0 0 1px --dsw-alias-button-ghost-active-border`。
 * 官方没有此控件，产品形态与键盘模型为本仓库设计。
 *
 * 语义用 `radiogroup` / `radio`（不是 tablist）：它表达的是「在一组互斥值里选一个，
 * 结果通过 onChange 交给宿主」，而 tablist 的每格需要 `aria-controls` 指向一个 tabpanel，
 * 本组件不控制任何面板。
 *
 * @example
 * const [view, setView] = useState<'list' | 'grid'>('list');
 * <SegmentedControl
 *   aria-label="视图"
 *   value={view}
 *   onChange={setView}
 *   options={[
 *     { value: 'list', label: '列表' },
 *     { value: 'grid', label: '网格' },
 *   ]}
 * />
 *
 * @example
 * <SegmentedControl aria-label="区间" size="sm" value={range} onChange={setRange}
 *   options={[{ value: '1d', label: '1 天' }, { value: '7d', label: '7 天' }, { value: '30d', label: '30 天' }]} />
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
  // 选中的那段是唯一的 Tab 落点（roving tabindex）；没有任何一段被选中时落在第一段。
  const focusableIndex = checkedIndex === -1 ? 0 : checkedIndex;

  /**
   * 方向键在组内移动：焦点跟着走，选中也跟着走（radiogroup 的 follow focus 模型）。
   * @param event - 键盘事件。
   * @param index - 触发事件的分段下标。
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
 * 分段控件（对外类型带泛型：`options` 的字面量值会收窄 `value` / `onChange` 的类型）。
 */
export const SegmentedControl = forwardRef(SegmentedControlImpl) as <Value extends string>(
  props: SegmentedControlProps<Value> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement;

export default SegmentedControl;
