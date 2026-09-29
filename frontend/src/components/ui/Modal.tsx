import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, subtitle, width = 480, children, footer }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const closeButton = (
    <button type="button" className="modal-card__close" onClick={onClose} aria-label="Cerrar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );

  return createPortal(
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ width }} role="dialog" aria-modal="true" aria-label={title}>
        {title ? (
          <div className="modal-card__header">
            <div>
              <div className="modal-card__title">{title}</div>
              {subtitle && <div className="modal-card__subtitle">{subtitle}</div>}
            </div>
            {closeButton}
          </div>
        ) : (
          <div className="modal-card__close-floating">{closeButton}</div>
        )}

        <div className={`modal-card__body${title ? '' : ' modal-card__body--no-header'}`}>{children}</div>

        {footer && <div className="modal-card__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
