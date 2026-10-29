import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  /** id of the element that titles the dialog */
  labelledBy: string;
  onClose: () => void;
  /** When false (e.g. while uploading) Esc and backdrop clicks do nothing. */
  dismissible?: boolean;
  wide?: boolean;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([tabindex="-1"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Dialog with focus trap, Esc to close, backdrop click to close and focus restore. */
export function Modal({ labelledBy, onClose, dismissible = true, wide = false, children }: ModalProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const dismissibleRef = useRef(dismissible);
  onCloseRef.current = onClose;
  dismissibleRef.current = dismissible;

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    box.focus(); // screen readers announce the dialog title first

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (dismissibleRef.current) {
          e.preventDefault();
          onCloseRef.current();
        }
        return;
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(box.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === box)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (opener && opener.isConnected) opener.focus();
    };
  }, []);

  return (
    <div
      className="modal open"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && dismissibleRef.current) onCloseRef.current();
      }}
    >
      <div
        ref={boxRef}
        className={`modal-box${wide ? ' modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        <button type="button" className="close" aria-label="Close" onClick={onClose} disabled={!dismissible}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
