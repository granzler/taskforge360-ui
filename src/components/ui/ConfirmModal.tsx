'use client';

import { useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'default';
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const confirmBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            confirmBtnRef.current?.focus();

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onCancel();
                }
            };

            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onCancel]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
                aria-hidden="true"
            />

            {/* Dialog */}
            <div
                ref={dialogRef}
                className="relative bg-card border border-border/60 rounded-3xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-foreground hover:bg-accent/50 transition-colors focus-visible:outline-2 focus-visible:outline-primary/50 focus-visible:outline-offset-2"
                    aria-label="Cancel"
                >
                    <X size={18} />
                </button>

                {/* Icon */}
                <div className={`
                    mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-5
                    ${variant === 'danger'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-primary/10 text-primary'
                    }
                `}>
                    <AlertTriangle size={28} strokeWidth={2} />
                </div>

                {/* Title */}
                <h2
                    id="confirm-title"
                    className="text-xl font-bold text-center mb-2"
                >
                    {title}
                </h2>

                {/* Message */}
                <p
                    id="confirm-message"
                    className="text-sm text-muted-foreground text-center mb-8 leading-relaxed"
                >
                    {message}
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 text-sm font-bold bg-background border border-border text-foreground rounded-xl hover:bg-accent/50 transition-all focus-visible:outline-2 focus-visible:outline-primary/50 focus-visible:outline-offset-2 disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        ref={confirmBtnRef}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`
                            flex-1 px-4 py-3 text-sm font-bold rounded-xl transition-all
                            focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50
                            ${variant === 'danger'
                                ? 'bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 focus-visible:outline-destructive/50'
                                : 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 focus-visible:outline-primary/50'
                            }
                        `}
                    >
                        {isLoading ? 'Processing...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
