export default function Badge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--color-primary)/0.10)] px-3 py-1 text-xs font-semibold text-[rgb(var(--color-primary))]">
      {children}
    </span>
  );
}
