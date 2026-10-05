import { forwardRef, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './modal.module.css';

export interface ModalProps {
  /** Whether to show it. At `false` nothing renders (and no DOM residue is left behind). */
  open: boolean;
  /** Close callback: Escape, a click on the mask and a click on the top-right close button all call it. */
  onClose: () => void;
  /**
   * The dialog title.
   * It has to be a string: the official source names the dialog with
   * `aria-label={title}`, and a node would leave screen readers unable to say
   * what the dialog is called.
   */
  title: string;
  /**
   * The close button's accessible name (required, e.g. `Close`).
   * The close button holds an icon only; without this name a screen reader
   * announces an empty button.
   */
  closeLabel: string;
  /** One line of description below the title; optional. */
  description?: ReactNode;
  /** The main content (forms, lists and so on); optional. */
  children?: ReactNode;
  /** The footer action row (cancel / confirm), right-aligned; optional. */
  footer?: ReactNode;
  /** Class name appended to the dialog itself, to widen it or give it a custom background. */
  className?: string;
}

/** Joins class names, so no dependency such as clsx is needed. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** The elements inside the focus trap that Tab can reach. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Gets the focusable elements currently inside the container.
 * @param root - the focus trap's container.
 * @returns The focusable elements, in DOM order.
 */
function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
  );
}

/** Close icon (14px, the size the official JS passes to the close icon component). */
function CloseIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M4.1 3 8 6.9 11.9 3l1.1 1.1L9.1 8l3.9 3.9-1.1 1.1L8 9.1 4.1 13 3 11.9 6.9 8 3 4.1z" fill="currentColor" />
    </svg>
  );
}

/**
 * Centred dialog: a mask plus a card, portalled to `document.body`.
 *
 * The geometry matches the official Modal item by item (`.root` / `.mask` / `.dialog` /
 * `.header` / `.title` / `.close` / `.description` / `.body` / `.footer`, see the geometry
 * table in the README). On top of that it adds a focus trap the official source does not
 * have (focus moves into the dialog when it opens, Tab cycles inside it, and focus goes
 * back to the trigger when it closes) — that part is proposed here. The implementation is
 * original to this repository.
 *
 * @example
 * <Modal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="New conversation"
 *   closeLabel="Close"
 *   description="The conversation uses the default settings of the current working directory."
 *   footer={<>
 *     <button type="button" onClick={() => setOpen(false)}>Cancel</button>
 *     <button type="button" onClick={create}>Create</button>
 *   </>}
 * >
 *   <input aria-label="Conversation name" />
 * </Modal>
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  { open, onClose, title, closeLabel, description, children, footer, className },
  ref,
) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  /** Feeds both the internal focus trap and the forwarded ref. */
  const setDialogRef = useCallback(
    (node: HTMLDivElement | null) => {
      dialogRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref !== null) ref.current = node;
    },
    [ref],
  );

  // Escape closes: matches the official Modal's document keydown listener.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // § Proposed here: the focus trap. The official Modal has none (it listens for Escape
  // only, so Tab sends focus onto the page behind the mask). aria-modal="true" already
  // promises assistive technology that focus stays inside the dialog; this delivers it.
  useEffect(() => {
    if (!open) return;
    const restore = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;

    // On open, move focus into the dialog: the first focusable element, or the dialog itself when there is none.
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
      // When it closes, give focus back to the trigger, so keyboard users are not dropped at the top of the page.
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
