/**
 * ThemeSwitcher Component
 * 
 * Toggles between light and dark themes by adding/removing the 'dark' class
 * from the document element, which works with Tailwind's class-based dark mode.
 */
import { useState, useEffect } from 'react';
import { Button } from '@heroui/react';

export default function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(() => {
    // Check if dark mode is already set in localStorage or system preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) {
        return stored === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <Button
      isIconOnly
      variant="flat"
      aria-label="Toggle theme"
      onPress={toggleTheme}
    >
      {isDark ? '🌙' : '☀️'}
    </Button>
  );
}

