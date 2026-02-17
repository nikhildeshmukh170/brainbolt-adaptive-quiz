import { cn } from "@/lib/cn";

export default function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] bg-[rgb(var(--color-card))] p-4 shadow-sm border border-[rgba(2,6,23,0.04)]",
        "overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}
