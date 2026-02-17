import Link from "next/link";
import ThemeToggle from "./theme-toggle";

export default function Header() {
  return (
    <header className="border-b border-[rgba(2,6,23,0.04)] bg-[rgb(var(--color-surface))] sticky top-0 z-40">
      <div className="container flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold">
            Brainbolt
          </Link>
          <nav className="hidden items-center gap-3 text-sm opacity-80 md:flex">
            <Link href="/quiz" className="px-2 py-1 rounded hover:bg-[rgb(var(--color-card))]">Quiz</Link>
            <Link href="/leaderboard" className="px-2 py-1 rounded hover:bg-[rgb(var(--color-card))]">Leaderboard</Link>
            <Link href="/stats" className="px-2 py-1 rounded hover:bg-[rgb(var(--color-card))]">Stats</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
