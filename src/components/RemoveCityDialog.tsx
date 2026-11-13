import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import type { GeoCity } from '../types';

interface RemoveCityDialogProps {
  city: GeoCity | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RemoveCityDialog: React.FC<RemoveCityDialogProps> = ({
  city,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Handle native cancel (Esc key)
  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onCancel();
  };

  // Modern-web-guidance light dismiss fallback for browsers without native closedby="any"
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (isOutside) {
      onCancel();
    }
  };

  if (!city) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      aria-labelledby="remove-city-title"
      aria-describedby="remove-city-desc"
      className="m-auto w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl backdrop:bg-black/60 dark:border-neutral-800 dark:bg-[#0c0e14] dark:text-neutral-100"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-800/40">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="touch-target rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4">
        <h2 id="remove-city-title" className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
          Remove {city.name}?
        </h2>
        <p id="remove-city-desc" className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {city.name}, {city.country} will be removed from your quick-access favorites. You can always search and pin it again later.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {/* SAFE ACTION receives autofocus per modern-web-guidance */}
        <button
          type="button"
          autoFocus
          onClick={onCancel}
          className="touch-target rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Keep Location
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="touch-target inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-rose-500 active:scale-95"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>
    </dialog>
  );
};
