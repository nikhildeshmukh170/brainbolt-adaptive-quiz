"use client";

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      <div className="relative w-full max-w-md rounded-[var(--radius)] bg-[rgb(var(--color-surface))] p-6 shadow-lg">
        <h3 className="text-lg font-semibold">{title ?? "Confirm"}</h3>
        <p className="mt-2 text-sm opacity-80">{message ?? "Are you sure?"}</p>

        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-2 rounded-[var(--radius)] bg-[rgb(var(--color-card))]" onClick={onCancel}>Cancel</button>
          <button className="px-3 py-2 rounded-[var(--radius)] bg-[rgb(var(--color-primary))] text-white" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
