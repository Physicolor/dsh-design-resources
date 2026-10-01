import { forwardRef, type HTMLAttributes } from 'react';
import styles from './mini-bar.module.css';

/** 填充色的语义色调，取官方状态主色 token。 */
export type MiniBarTone = 'business' | 'success' | 'warn' | 'error';

export interface MiniBarProps extends HTMLAttributes<HTMLDivElement> {
  /** 当前值。超出 `[0, max]` 会被夹紧；非有限数按 0 处理。 */
  value: number;
  /** 满值，默认 100。小于等于 0 时按 0 处理（进度恒为 0）。 */
  max?: number;
  /** 是否在条形右侧显示百分比文本（取整）。默认不显示。 */
  showPercent?: boolean;
  /** 语义色，默认 `business`。 */
  tone?: MiniBarTone;
  /** 进度条的可访问名称，例如「上下文占用」。 */
  label?: string;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 迷你条形图 / 进度条：一条水平轨道 + 填充。
 *
 * 官方 `@deepseek-ai/dsh-client-ui-primitives` 没有对应组件，几何按以下官方出处拼装：
 * 圆角 999px 来自 Tag `.tag`（胶囊语义），
 * 填充色取官方状态主色 token（Tag 的 tone 用的是同一批），
 * 过渡时长 120ms ease 来自 Switch `.thumb`。
 * 实现为本仓库原创。
 *
 * @example
 * <MiniBar value={82} label="缓存命中率" />
 *
 * @example
 * <MiniBar value={41} max={64} tone="warn" showPercent label="上下文占用" />
 */
export const MiniBar = forwardRef<HTMLDivElement, MiniBarProps>(function MiniBar(
  {
    value,
    max = 100,
    showPercent = false,
    tone = 'business',
    label,
    className,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
  const safeValue = Number.isFinite(value) ? value : 0;
  const clamped = safeMax > 0 ? Math.min(Math.max(safeValue, 0), safeMax) : 0;
  const percent = safeMax > 0 ? (clamped / safeMax) * 100 : 0;

  return (
    <div
      {...rest}
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clamped}
      aria-label={label ?? ariaLabel}
      className={cx(styles.bar, className)}
    >
      <div className={styles.track}>
        <div className={styles.fill} data-tone={tone} style={{ width: `${percent}%` }} />
      </div>
      {showPercent ? (
        // 数值已经通过 aria-valuenow / aria-valuemax 暴露，这行可见文本对读屏是重复信息。
        <span className={styles.percent} aria-hidden="true">
          {`${Math.round(percent)}%`}
        </span>
      ) : null}
    </div>
  );
});

export default MiniBar;
