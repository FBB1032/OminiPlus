'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  requireReason?: boolean;
  reasonPlaceholder?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  requireReason = false,
  reasonPlaceholder = 'Please enter a reason...',
}: ConfirmDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('Reason is required');
      return;
    }
    setError('');
    onConfirm(requireReason ? reason : undefined);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : variant === 'warning' ? 'secondary' : 'primary'}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.5 }}>{message}</p>
        
        {requireReason && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value.trim()) setError('');
              }}
              placeholder={reasonPlaceholder}
              style={{
                width: '100%',
                height: 80,
                padding: '8px 12px',
                fontSize: 13,
                border: error ? '1px solid #ef4444' : '1px solid #e5e7eb',
                borderRadius: 8,
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
            {error && (
              <p style={{ fontSize: 11.5, color: '#ef4444', fontWeight: 500 }}>{error}</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
