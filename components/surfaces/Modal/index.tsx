import { forwardRef, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './modal.module.css';

export interface ModalProps {
  /** 是否显示。为 `false` 时不渲染任何内容（也不会留下 DOM 残留）。 */
  open: boolean;
  /** 关闭回调：Escape、点击遮罩、点击右上角关闭按钮都会调用它。 */
  onClose: () => void;
  /**
   * 对话框标题。
   * 必须是字符串：官方用 `aria-label={title}` 给对话框命名，
   * 传节点会让屏幕阅读器读不出这个对话框叫什么。
   */
  title: string;
  /**
   * 关闭按钮的可访问名（必填，如「关闭」/「Close」）。
   * 关闭按钮里只有一个图标，没有它屏幕阅读器只会读出一个空按钮。
   */
  closeLabel: string;
  /** 标题下方的一句话说明，可不传。 */
  description?: ReactNode;
  /** 主体内容（表单、列表等），可不传。 */
  children?: ReactNode;
  /** 底部操作行（取消 / 确认），右对齐，可不传。 */
  footer?: ReactNode;
  /** 追加到对话框本体的类名，用于拉宽或自定义背景。 */
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
 * 居中对话框：遮罩 + 卡片，portal 到 `document.body`。
 *
 * 几何逐条对齐官方 Modal（`.root` / `.mask` / `.dialog` / `.header` / `.title` /
 * `.close` / `.description` / `.body` / `.footer`，见 README「几何来源」表格）。
 * 在那之上补了一个官方没有的焦点陷阱（打开时把焦点移进对话框、Tab 在其中循环、
 * 关闭后把焦点还给触发元素），这一部分是本仓库建议值。实现为本仓库原创。
 *
 * @example
 * <Modal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="新建会话"
 *   closeLabel="关闭"
 *   description="会话会使用当前工作目录的默认设置。"
 *   footer={<>
 *     <button type="button" onClick={() => setOpen(false)}>取消</button>
 *     <button type="button" onClick={create}>创建</button>
 *   </>}
 * >
 *   <input aria-label="会话名称" />
 * </Modal>
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  { open, onClose, title, closeLabel, description, children, footer, className },
  ref,
) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  /** 同时喂给内部焦点陷阱与外抛的 ref。 */
  const setDialogRef = useCallback(
    (node: HTMLDivElement | null) => {
      dialogRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref !== null) ref.current = node;
    },
    [ref],
  );

  // Escape 关闭：对齐官方 Modal 的 document keydown 监听。
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // § 本仓库建议值：焦点陷阱。官方 Modal 没有做（官方只监听 Escape，
  // 焦点会顺着 Tab 跑到遮罩背后的页面上）。aria-modal="true" 已经向辅助技术
  // 承诺了「焦点被限制在对话框内」，这里把它兑现。
  useEffect(() => {
    if (!open) return;
    const restore = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;

    // 打开时把焦点移进对话框：优先第一个可聚焦元素，没有则落在对话框本体上。
    if (dialog !== null) {
      const first = getFocusable(dialog)[0];
      (first ?? dialog).focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || dialog === null) return;
      const items = getFocusable(dialog);
      if (items.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!dialog.contains(active)) {
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
      // 关闭后把焦点还给触发元素，键盘用户不会被打回页面顶部。
      restore?.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className={styles.root} role="presentation">
      <div className={styles.mask} aria-hidden="true" onClick={onClose} />
      <div
        ref={setDialogRef}
        className={cx(styles.dialog, className)}
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

export default Modal;
