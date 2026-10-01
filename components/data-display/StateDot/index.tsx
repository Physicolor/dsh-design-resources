import { forwardRef, type Ref } from 'react';
import styles from './state-dot.module.css';

/** 状态圆点表达的四种结果 + 一种「没有活动」。 */
export type StateDotState = 'done' | 'warning' | 'ongoing' | 'error' | 'idle';

export interface StateDotProps {
  /** 要表达的状态。`ongoing` 会渲染成会动的方块矩阵，其余渲染成实心圆点。 */
  state: StateDotState;
  /** 外径（px），默认 10 —— 官方默认值，也是 Figma 里的尺寸。 */
  size?: number;
  /** 额外的布局类名，由调用方决定外边距、对齐等。 */
  className?: string;
}

/**
 * 圆点是 `<span>`、矩阵是 `<svg>`，两者不是同一个元素类型，
 * 所以 ref 用联合类型；调用方按 `state` 自行收窄。
 */
export type StateDotRef = HTMLSpanElement | SVGSVGElement;

/**
 * `ongoing` 的 8 个 2×2 像素块在 10×10 网格外圈的位置，
 * 从左上角开始顺时针排列（屏幕坐标 y 向下，所以这是顺时针）。
 */
const MATRIX_CELLS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [4, 0],
  [8, 0],
  [8, 4],
  [8, 8],
  [4, 8],
  [0, 8],
  [0, 4],
];

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 状态圆点。
 *
 * 几何参照官方 StateDot（默认外径 10px、光环 `::before` 透明度 0.1、
 * 实心核 `::after` inset 20%、四种语义状态色；`ongoing` 是 10×10 viewBox 上
 * 8 个 2×2 方块跑 1s 追逐动画，逐格 `animation-delay` 相差 125ms），
 * 实现为本仓库原创。
 *
 * 组件本身 `aria-hidden`：它不携带可读文本，状态必须由旁边的文字表达。
 *
 * @example
 * <span><StateDot state="done" /> 构建成功</span>
 * <span><StateDot state="ongoing" size={12} /> 正在生成</span>
 */
export const StateDot = forwardRef<StateDotRef, StateDotProps>(function StateDot(
  { state, size = 10, className },
  ref,
) {
  if (state === 'ongoing') {
    return (
      <svg
        ref={ref as Ref<SVGSVGElement>}
        className={cx(styles.matrix, className)}
        data-state="ongoing"
        width={size}
        height={size}
        viewBox="0 0 10 10"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        {MATRIX_CELLS.map(([x, y], index) => (
          <rect
            key={`${x}-${y}`}
            className={styles.cell}
            x={x}
            y={y}
            width={2}
            height={2}
            // 负延迟把 8 格排成一个追逐环：index 0 → -1000ms，最后一格 → -125ms。
            style={{ animationDelay: `${(index - MATRIX_CELLS.length) * 125}ms` }}
          />
        ))}
      </svg>
    );
  }

  return (
    <span
      ref={ref as Ref<HTMLSpanElement>}
      className={cx(styles.dot, className)}
      data-state={state}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
});

export default StateDot;
