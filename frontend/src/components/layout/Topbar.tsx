import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/features/dashboard/ThemeContext";

export function Topbar({ title, onMenuClick }: { title: string; onMenuClick: () => void }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-ink/8 bg-paper/80 px-4 backdrop-blur dark:border-paper/10 dark:bg-ink/80 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-ink/60 hover:bg-ink/5 dark:text-paper/60 dark:hover:bg-paper/10 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-display text-xl font-medium text-ink dark:text-paper">{title}</h1>
      </div>

      <button
        onClick={toggleTheme}
        aria-label="Alternar tema"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink/60 transition-colors duration-150 hover:bg-ink/5 hover:text-ink dark:text-paper/60 dark:hover:bg-paper/10 dark:hover:text-paper"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
