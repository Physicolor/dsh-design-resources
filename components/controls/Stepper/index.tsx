import {
  forwardRef,
  useState,
  type ChangeEvent,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import styles from './stepper.module.css';

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 取小数位数，用来消除 `0.1 + 0.2` 这类浮点误差。
 * @param value - 任意有限数。
 * @returns 小数点后的位数；整数返回 0。
 */
function decimalsOf(value: number): number {
  const text = String(value);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
}

/**
 * 把值收敛到 `[min, max]`。
 * @param value - 待收敛的数。
 * @param min - 下界；未传表示不限。
 * @param max - 上界；未传表示不限。
 * @returns 收敛后的值。
 */
function clamp(value: number, min: number | undefined, max: number | undefined): number {
  let next = value;
  if (min !== undefined) next = Math.max(min, next);
  if (max !== undefined) next = Math.min(max, next);
  return next;
}

export interface StepperProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'aria-label' | 'children'> {
  /** 当前值，受控；组件自己不保存已提交的值。 */
  value: number;
  /**
   * 值变化回调。收到的值一定已经按 `min` / `max` 收敛，
   * 并且按 `step` 或当前值中更细的小数位取整（消除浮点误差）。
   */
  onChange: (value: number) => void;
  /** 下界（含）。到界时减号按钮变成 `disabled`。 */
  min?: number;
  /** 上界（含）。到界时加号按钮变成 `disabled`。 */
  max?: number;
  /** 每次加减的步长，默认 `1`；非正数或非有限数按 `1` 处理。 */
  step?: number;
  /** 整组禁用：两个按钮与输入框都不可交互。 */
  disabled?: boolean;
  /**
   * 可访问名称，必填，落在内部的数字输入框（`role="spinbutton"`）上。
   * 例：`aria-label="字号"`。
   */
  'aria-label': string;
  /** 减号按钮的可访问名称，默认「减少」。 */
  decreaseLabel?: string;
  /** 加号按钮的可访问名称，默认「增加」。 */
  increaseLabel?: string;
  /**
   * 数字输入框的 id。给外部 `<label htmlFor={id}>` 用；
   * 外壳 `<div>` 不带 id。
   */
  id?: string;
}

/** 减号图标：16×16，`currentColor`，颜色与尺寸都交给外层容器。 */
const MinusIcon = (
  <svg viewBox="0 0 16 16">
    <path d="M1.6 7.2h12.8v1.6H1.6z" fill="currentColor" />
  </svg>
);

/** 加号图标：与减号同一根 1.6 单位粗的横竖条，视觉重量一致。 */
const PlusIcon = (
  <svg viewBox="0 0 16 16">
    <path d="M7.2 1.6h1.6v5.6h5.6v1.6H8.8v5.6H7.2V8.8H1.6V7.2h5.6V1.6z" fill="currentColor" />
  </svg>
);

/**
 * 数字步进器。
 *
 * 外壳几何沿用官方 Input 的 `.wrap`（32px 高 / 0.5px 边框 / r8 / bg-layer-1），
 * 加减按钮的 hover、active、disabled 沿用官方 Button 的 `.ghost` 与 `:disabled`，
 * 图标容器 16×16 取自官方 Button `.icon`。按钮尺寸、数字区宽度等官方没有的数值
 * 在 `stepper.module.css` 里都带 `§` 注释，并在 README 单列。
 *
 * 不做拖动，不做长按连加，不做滑杆；加减只有单击一次走一格。
 *
 * @example
 * const [count, setCount] = useState(1);
 * <Stepper value={count} onChange={setCount} min={1} max={99} aria-label="生成数量" />
 *
 * @example
 * // 带外部 label：id 落在数字输入框上
 * <label htmlFor="font-size">字号</label>
 * <Stepper id="font-size" value={size} onChange={setSize} min={12} max={48} step={2} aria-label="字号" />
 */
export const Stepper = forwardRef<HTMLInputElement, StepperProps>(function Stepper(
  {
    value,
    onChange,
    min,
    max,
    step = 1,
    disabled = false,
    decreaseLabel = '减少',
    increaseLabel = '增加',
    'aria-label': ariaLabel,
    id,
    className,
    ...rest
  },
  ref,
) {
  /** 编辑中间态（空、只有负号、越界）先留在本地，失焦或回车时再收敛。 */
  const [draft, setDraft] = useState<string | null>(null);

  const stepSize = Number.isFinite(step) && step > 0 ? step : 1;
  const decreaseDisabled = disabled || (min !== undefined && value <= min);
  const increaseDisabled = disabled || (max !== undefined && value >= max);

  /**
   * 把本地草稿写成受控值；空或非法输入则丢弃，显示回到当前 `value`。
   */
  const commitDraft = () => {
    if (draft === null) return;
    setDraft(null);
    const text = draft.trim();
    if (text === '') return;
    const parsed = Number(text);
    if (!Number.isFinite(parsed)) return;
    const next = clamp(parsed, min, max);
    if (next !== value) onChange(next);
  };

  /**
   * 按步长加减一格。
   * @param direction - `1` 加，`-1` 减。
   */
  const stepBy = (direction: 1 | -1) => {
    const precision = Math.max(decimalsOf(stepSize), decimalsOf(value));
    const next = clamp(Number((value + direction * stepSize).toFixed(precision)), min, max);
    setDraft(null);
    if (next !== value) onChange(next);
  };

  /**
   * 输入框变化：能解析且在界内就立即提交，否则留作草稿。
   * @param event - 输入事件。
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    // 只接受数字的中间态：可选负号 + 数字 + 可选小数点，其余按键直接丢弃。
    if (!/^-?\d*\.?\d*$/.test(raw)) return;
    if (raw.trim() !== '') {
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && clamp(parsed, min, max) === parsed) {
        setDraft(null);
        if (parsed !== value) onChange(parsed);
        return;
      }
    }
    setDraft(raw);
  };

  /**
   * 键盘：↑/↓ 加减一格，Enter 提交草稿，Esc 丢弃草稿。
   * @param event - 键盘事件。
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      stepBy(1);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      stepBy(-1);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      commitDraft();
      return;
    }
    if (event.key === 'Escape') {
      setDraft(null);
    }
  };

  return (
    <div
      {...rest}
      className={cx(styles.wrap, className)}
      data-disabled={disabled || undefined}
    >
      <button
        type="button"
        className={styles.button}
        aria-label={decreaseLabel}
        disabled={decreaseDisabled}
        onClick={() => stepBy(-1)}
      >
        <span className={styles.icon} aria-hidden="true">{MinusIcon}</span>
      </button>

      <input
        ref={ref}
        id={id}
        className={styles.field}
        type="text"
        role="spinbutton"
        inputMode="numeric"
        autoComplete="off"
        aria-label={ariaLabel}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        disabled={disabled}
        value={draft ?? String(value)}
        onChange={handleChange}
        onBlur={commitDraft}
        onKeyDown={handleKeyDown}
      />

      <button
        type="button"
        className={styles.button}
        aria-label={increaseLabel}
        disabled={increaseDisabled}
        onClick={() => stepBy(1)}
      >
        <span className={styles.icon} aria-hidden="true">{PlusIcon}</span>
      </button>
    </div>
  );
});

export default Stepper;
