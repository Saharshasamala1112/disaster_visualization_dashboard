'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  // Sync React state with the class already set by the flash-prevention script.
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // localStorage unavailable (e.g. private browsing with restrictions)
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center gap-1.5 rounded-full border border-zinc-300/70 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-white/15 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-white/25 dark:hover:bg-white/10 dark:hover:text-white"
    >
      {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
      {isDark ? 'Light' : 'Dark'}
    </button>
  );
}
