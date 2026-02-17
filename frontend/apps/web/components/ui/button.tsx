import { cn } from "@/lib/cn";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "correct" | "wrong";
}

export default function Button({
  className,
  variant = "default",
  ...props
}: Props) {
  const variants = {
    default:
      "bg-[rgb(var(--color-primary))] text-white hover:opacity-90",
    correct: "bg-emerald-500 text-white",
    wrong: "bg-red-500 text-white",
  };

  return (
    <button
      className={cn(
        "w-full inline-flex items-center justify-center gap-2 rounded-[var(--radius)] px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50",
        "shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))] focus:ring-offset-2",
        "border border-transparent",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
