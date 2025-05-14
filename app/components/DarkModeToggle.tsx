'use client';
import { useState, useEffect } from 'react';

export default function DarkModeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark]     = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      className="text-xl"
      onClick={() => {
        document.documentElement.classList.toggle('dark');
        setDark(!dark);
      }}>
      {dark ? '🌞' : '🌙'}
    </button>
  );
}
