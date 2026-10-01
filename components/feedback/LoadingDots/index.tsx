import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import styles from './loading-dots.module.css';

export interface LoadingDotsProps extends HTMLAttributes<HTMLSpanElement> {
  /** 每个点的直径，默认 4px。按本仓库规则取 4 的倍数。 */
  dotSize?: number;
  /** 点间距，默认 4px。 */
  gap?: number;
  /**
   * 无障碍名称。渲染成视觉隐藏文本，屏幕阅读器会读它。
   * 默认「加载中」。
   */
  label?: string;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 三点加载指示器。
 *
 * 「三点依次出现」这件事派生自官方 `ConnectionIndicator.module.css` 的
 * `.dots` / `.secondDot` / `.thirdDot`（1.5s step-end infinite，第二个点在
 * 33.33%、第三个点在 66.66% 处出现）。点的大小、间距与容器为本仓库建议值，
 * 实现（用 CSS 变量 + 自定义关键帧做位移）为本仓库原创。
 *
 * 无障碍：组件本体 `aria-hidden="true"`，只暴露一段视觉隐藏的文本给屏幕阅读器，
 * 因此不会读出一串无意义的点。需要「加载中」状态被播报时，调用方把 `role="status"`
 * 传进来即可。
 *
 * @example
 * <LoadingDots />
 *
 * @example
 * // 想让屏幕阅读器播报状态变化：
 * <LoadingDots role="status" label="正在生成回复" dotSize={8} />
 */
export const LoadingDots = forwardRef<HTMLSpanElement, LoadingDotsProps>(function LoadingDots(
  { dotSize = 4, gap = 4, label = '加载中', className, style, ...rest },
  ref,
) {
  // 只暴露三个自由度给 CSS：点直径、间距、单个动画周期。
  const vars = {
    '--dsh-dots-size': `${String(dotSize)}px`,
    '--dsh-dots-gap': `${String(gap)}px`,
    '--dsh-dots-cycle': '1500ms',
    ...style,
  } as CSSProperties;

  return (
    <span {...rest} ref={ref} className={cx(styles.dots, className)} style={vars}>
      <span className={styles.visual} aria-hidden="true">
        <span className={styles.dot} />
        <span className={cx(styles.dot, styles.dotSecond)} />
        <span className={cx(styles.dot, styles.dotThird)} />
      </span>
      <span className={styles.srOnly}>{label}</span>
    </span>
  );
});

export default LoadingDots;
