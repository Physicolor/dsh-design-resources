import { forwardRef, type Ref } from 'react';
import styles from './state-dot.module.css';

/** The four outcomes a state dot expresses plus one "no activity". */
export type StateDotState = 'done' | 'warning' | 'ongoing' | 'error' | 'idle';

export interface StateDotProps {
  /** The state to express. `ongoing` renders as an animated square matrix; the rest render as a solid dot. */
  state: StateDotState;
  /** The outer diameter (px), 10 by default — the official default, and the size in Figma. */
  size?: number;
  /** An extra layout class name; the caller decides margin, alignment and the like. */
  className?: string;
}

/**
 * The dot is a `<span>` and the matrix is an `<svg>`, which are not the same element type,
 * so the ref is a union type; the caller narrows it by `state`.
 */
export type StateDotRef = HTMLSpanElement | SVGSVGElement;

/**
 * Where `ongoing`'s eight 2×2 pixel cells sit on the outer ring of the 10×10 grid,
 * clockwise from the top-left corner (screen coordinates run y downwards, so this is clockwise).
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

/** Join class names without pulling in a dependency such as clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * State dot.
 *
 * The geometry follows the official StateDot (default outer diameter 10px, halo `::before` at
 * 0.1 opacity, solid core `::after` at inset 20%, four semantic state colours; `ongoing` is
 * eight 2×2 squares running a 1s chase animation on a 10×10 viewBox, with `animation-delay`
 * 125ms apart from cell to cell), and the implementation is original to this repository.
 *
 * The component itself is `aria-hidden`: it carries no readable text, so the state has to be
 * expressed by the text beside it.
 *
 * @example
 * <span><StateDot state="done" /> Build succeeded</span>
 * <span><StateDot state="ongoing" size={12} /> Generating</span>
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
            // The negative delays line the 8 cells up into a chase ring: index 0 → -1000ms, the last cell → -125ms.
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
