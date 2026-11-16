"use client";
import { useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };
  return (
    <button onClick={toggle} aria-label="Toggle theme" className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text)]">
      {dark ? "Light" : "Dark"}
    </button>
  );
}
