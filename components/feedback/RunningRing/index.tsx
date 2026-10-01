import { forwardRef, type ReactNode, type Ref } from 'react';
import styles from './running-ring.module.css';

export interface RunningRingProps {
  /** 渲染尺寸（px），默认 14 —— 产品在左栏会话行里的实渲尺寸。 */
  size?: number;
  /**
   * 给读屏的说明文字，例如「进行中」。产品在会话行里就是紧挨着环放一段视觉隐藏的
   * 文本；不传则不渲染（此时环对辅助技术完全不存在）。
   */
  label?: ReactNode;
  /** 额外的布局类名，由调用方决定外边距、对齐等。 */
  className?: string;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 运行圆环：一条 25% 不透明度的轨道 + 一段绕圈跑并且自己伸缩的弧。
 *
 * 它表达的是「正在进行，还不知道要多久」——不是进度百分比（那要用进度条），
 * 也不是「完成了」（那是静态状态点）。产品在左栏会话行首用它替代会话字形，
 * 几何逐条来自运行中的界面（见 SPEC 的 geometry-source）。
 *
 * @example
 * <RunningRing label="进行中" />
 */
export const RunningRing = forwardRef<HTMLSpanElement, RunningRingProps>(function RunningRing(
  { size = 14, label, className },
  ref,
) {
  return (
    <span ref={ref} className={cx(styles.root, className)}>
      <svg
        className={styles.ring}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <g className={styles.motion}>
          <circle className={styles.track} cx="12" cy="12" r="9.5" />
          <circle className={styles.arc} cx="12" cy="12" r="9.5" />
        </g>
      </svg>
      {label === undefined ? null : <span className={styles.srOnly}>{label}</span>}
    </span>
  );
});

export default RunningRing;
