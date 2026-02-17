export default function Skeleton({
  className = "",
  shape = "rect",
}: {
  className?: string;
  shape?: "rect" | "circle" | "line";
}) {
  const base =
    "bg-[rgba(2,6,23,0.06)] dark:bg-[rgba(255,255,255,0.03)] skeleton";

  const shapeClass =
    shape === "circle" ? "rounded-full" : shape === "line" ? "rounded-[4px] h-4" : "rounded-[var(--radius)]";

  return <div className={`${base} ${shapeClass} ${className}`} aria-hidden />;
}
