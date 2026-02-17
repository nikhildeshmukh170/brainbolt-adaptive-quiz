export default function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-[rgb(var(--color-card))] overflow-hidden">
      <div
        style={{ width: `${value}%` }}
        className="h-2 rounded-full bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] transition-all duration-300"
      />
    </div>
  );
}
