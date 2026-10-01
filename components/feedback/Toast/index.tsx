import { useEffect, useLayoutEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './toast.module.css';

/** 停留（全不透明）时长缺省值，与官方 Toast 的 `HOLD_MS = 3000` 一致。 */
export const TOAST_HOLD_MS = 3000;

/** 淡出时长，与 `toast.module.css` 里 `dsh-toast-fade` 的 1000ms 必须一致。 */
export const TOAST_FADE_MS = 1000;

export interface ToastProps {
  /** 提示文案。由调用方给出（已本地化的字符串或任意 React 节点）。 */
  text: ReactNode;
  /**
   * 前置图标节点。会被放进 16×16 的图标容器，容器颜色取警告色。
   * 图标自身请写 `aria-hidden`，语义由文案承担。
   */
  icon?: ReactNode;
  /**
   * 水平中心跟随的锚点元素（例如输入框卡片），缺省时居中于视口。
   * 传入 DOM 节点本身：`anchor={composerRef.current}`。
   */
  anchor?: HTMLElement | null;
  /** 全不透明停留时长（毫秒），缺省 3000。越长留给阅读的时间越多。 */
  holdMs?: number;
  /**
   * 淡出动画结束、并且停留计时也走完时调用一次。
   * 调用方在这里卸载提示（把 `open` 置为 `false` 或把节点从列表里移除）。
   */
  onDone: () => void;
  /** 追加在根节点上的类名。 */
  className?: string;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 顶部居中、自动淡出的瞬时提示条。
 *
 * 职责边界（重要）：本组件只负责「呈现层」——几何、进出场动画、随锚点定位；
 * 「定时关闭」由两条分开的线组成：CSS 用 `--dsh-toast-hold` 驱动淡出动画，
 * 组件用一个 `holdMs + TOAST_FADE_MS` 的定时器在动画走完后回调 `onDone`。
 * 两者共享同一个 `holdMs`，因此不会出现「动画还没放完就被卸载」。
 *
 * 几何参照官方 `Toast.module.css` 的 `.toast` / `.icon`，实现为本仓库原创。
 *
 * @example
 * const [toast, setToast] = useState<string | null>(null);
 * // 保存成功后：
 * setToast('已保存');
 * {toast !== null && (
 *   <Toast key={toast} text={toast} onDone={() => { setToast(null); }} />
 * )}
 *
 * @example
 * // 居中对齐到某个锚点（例如输入框卡片）而不是整个视口：
 * <Toast text="已重新连接" anchor={composerRef.current} holdMs={5000} onDone={hide} />
 */
export function Toast({ text, icon, anchor, holdMs = TOAST_HOLD_MS, onDone, className }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, holdMs + TOAST_FADE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [holdMs, onDone]);

  const [left, setLeft] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (anchor == null) return undefined;
    const measure = () => {
      const rect = anchor.getBoundingClientRect();
      setLeft(rect.left + rect.width / 2);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
    };
  }, [anchor]);

  // 传送到 body：祖先上的 transform / filter 会改变 fixed 的包含块，
  // 提示条会被困在那个祖先的盒子里并被裁掉。缺省 onDone 无所谓，这里只守卫 SSR。
  if (typeof document === 'undefined') return null;

  const style: CSSProperties = {
    ...(left === null ? {} : { left }),
    // 同一个值同时驱动淡出延迟与上面的卸载计时器。
    '--dsh-toast-hold': `${String(holdMs)}ms`,
  } as CSSProperties;

  return createPortal(
    <div className={cx(styles.toast, className)} role="alert" style={style}>
      {icon !== undefined ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.text}>{text}</span>
    </div>,
    document.body,
  );
}

export default Toast;
