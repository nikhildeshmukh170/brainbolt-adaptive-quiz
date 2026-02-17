export default function StatPill({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[var(--radius)] bg-[rgb(var(--color-card))] px-3 py-2 text-center shadow-sm border border-[rgba(2,6,23,0.03)]">
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-sm font-semibold text-[rgb(var(--color-text))]">{value}</div>
    </div>
  );
}
