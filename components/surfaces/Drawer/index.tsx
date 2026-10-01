import { forwardRef, useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './drawer.module.css';

/** 抽屉从哪一侧滑出 / 停靠。 */
export type DrawerSide = 'left' | 'right';

export interface DrawerProps {
  /** 是否显示。为 `false` 时不渲染任何内容。 */
  open: boolean;
  /** 关闭回调：Escape、点击遮罩、点击关闭按钮都会调用它。 */
  onClose: () => void;
  /**
   * 抽屉标题。
   * 必须是字符串：它同时是 `<h2>` 文本和抽屉的 `aria-label`。
   */
  title: string;
  /** 关闭按钮的可访问名（必填，如「关闭」/「Close」）。 */
  closeLabel: string;
  /** 停靠方向，默认 `right`。 */
  side?: DrawerSide;
  /**
   * 面板宽度，数字按 px 处理，也可以传 `'40vw'` 之类的字符串。
   * 默认 320px（本仓库建议值，见 README）。
   */
  width?: number | string;
  /** 标题下方的一句话说明，可不传。 */
  description?: ReactNode;
  /** 主体内容，超出高度时在面板内滚动。 */
  children?: ReactNode;
  /** 底部操作行，右对齐，可不传。 */
  footer?: ReactNode;
  /** 追加到面板本体的类名。 */
  className?: string;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** 焦点陷阱里可 Tab 到的元素。 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * 取容器内当前可聚焦的元素。
 * @param root - 焦点陷阱的容器。
 * @returns 按 DOM 顺序排列的可聚焦元素。
 */
function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
  );
}

/** 关闭图标（14px，官方 JS 传给 close 图标组件的 size）。 */
function CloseIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M4.1 3 8 6.9 11.9 3l1.1 1.1L9.1 8l3.9 3.9-1.1 1.1L8 9.1 4.1 13 3 11.9 6.9 8 3 4.1z" fill="currentColor" />
    </svg>
  );
}

/**
 * 侧边抽屉：面板贴边满高，遮罩沿用官方 Modal 的 `.mask` 几何。
 *
 * 面板底色、阴影、遮罩、Escape 关闭都锚定官方已核实的值（`--dsw-alias-bg-layer-2`、
 * `--dsw-elevation-prominent`、`--dsw-alias-bg-mask-1` + `--dsw-mask-blur`），
 * header / title / close / description / body / footer 复用官方 Modal 的几何，
 * 宽度与圆角为本仓库建议值。焦点陷阱在本目录内独立实现（与 Modal 同款，
 * 但不跨目录引用）。实现为本仓库原创。
 *
 * @example
 * <Drawer open={open} onClose={close} title="文件" closeLabel="关闭" side="right" width={320}>
 *   <FileTree />
 * </Drawer>
 */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  { open, onClose, title, closeLabel, side = 'right', width = 320, description, children, footer, className },
  ref,
) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  /** 同时喂给内部焦点陷阱与外抛的 ref。 */
  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref !== null) ref.current = node;
    },
    [ref],
  );

  // Escape 关闭：与官方 Modal 的 document keydown 监听同款。
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // § 本仓库建议值：焦点陷阱（官方没有抽屉这类组件，Modal 也没有做陷阱）。
  // 打开时把焦点移进面板、Tab 在面板内循环、关闭后把焦点还给触发元素。
  useEffect(() => {
    if (!open) return;
    const restore = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;

    if (panel !== null) {
      const first = getFocusable(panel)[0];
      (first ?? panel).focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || panel === null) return;
      const items = getFocusable(panel);
      if (items.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!panel.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restore?.focus();
    };
  }, [open]);

  if (!open) return null;

  const panelStyle = { '--dsh-drawer-width': typeof width === 'number' ? `${width}px` : width } as CSSProperties;

  return createPortal(
    <div className={styles.root} data-side={side} role="presentation">
      <div className={styles.mask} aria-hidden="true" onClick={onClose} />
      <div
        ref={setPanelRef}
        className={cx(styles.panel, className)}
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button type="button" className={styles.close} aria-label={closeLabel} onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
          {description != null && description !== '' ? <p className={styles.description}>{description}</p> : null}
          {children != null ? <div className={styles.body}>{children}</div> : null}
        </div>
        {footer != null ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
});

export default Drawer;
