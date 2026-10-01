import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import styles from './stat-row.module.css';

/** 变化量的语义色调；`neutral` 表示中性（无好坏倾向）变化。 */
export type StatRowDeltaTone = 'success' | 'danger' | 'warn' | 'neutral';

export interface StatRowProps extends HTMLAttributes<HTMLDivElement> {
  /** 左侧标签，例如「缓存命中率」。 */
  label: ReactNode;
  /** 右侧数值，例如 `92.4`。 */
  value: ReactNode;
  /** 数值单位，例如 `%` / `GB` / `ms`。单位会以更小字号贴在数值右侧。 */
  unit?: ReactNode;
  /**
   * 变化量文本，例如 `+3.1%` / `-12ms`。
   * 请让文本自带符号（`+`/`-`），不要只靠颜色区分涨跌。
   */
  delta?: ReactNode;
  /** 变化量色调，默认 `neutral`。 */
  deltaTone?: StatRowDeltaTone;
  /** 是否在本行上方画一条 hairline，用于行与行之间的分隔。 */
  divider?: boolean;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 指标行：左侧标签、右侧数值（可带单位与变化量）。
 *
 * 官方 `@deepseek-ai/dsh-client-ui-primitives` 没有对应组件，几何按以下官方选择器拼装：
 * 标签 13/24 + `--dsw-alias-label-secondary`（DisclosureRow `.title`）、
 * 数值 14/22 + `--dsw-alias-label-primary`（Button `.button`）、
 * 单位与变化量 12/18（Button `.sm`）、
 * 分隔线 0.5px + `--dsw-alias-border-l2`（markdown/MarkdownText `.markdown hr`）。
 * 实现为本仓库原创。
 *
 * @example
 * <StatRow label="缓存命中率" value="92.4" unit="%" />
 *
 * @example
 * <StatRow label="首字延迟" value="418" unit="ms" delta="+26ms" deltaTone="warn" divider />
 */
export const StatRow = forwardRef<HTMLDivElement, StatRowProps>(function StatRow(
  { label, value, unit, delta, deltaTone = 'neutral', divider = false, className, ...rest },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      data-divider={divider ? 'true' : undefined}
      className={cx(styles.row, className)}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.valueGroup}>
        <span className={styles.value}>{value}</span>
        {unit != null ? <span className={styles.unit}>{unit}</span> : null}
      </span>
      {delta != null ? <span className={cx(styles.delta, styles[deltaTone])}>{delta}</span> : null}
    </div>
  );
});

export default StatRow;
