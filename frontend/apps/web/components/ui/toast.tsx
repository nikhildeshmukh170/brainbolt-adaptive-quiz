"use client";

import { useEffect } from "react";

export default function Toast({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message?: string;
  onClose?: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose && onClose(), 2600);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="rounded-[var(--radius)] bg-[rgb(var(--color-surface))] px-4 py-2 shadow-md border border-[rgba(2,6,23,0.06)]">
        <div className="text-sm">{message}</div>
      </div>
    </div>
  );
}
