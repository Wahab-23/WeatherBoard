import { useState, useEffect, useCallback } from 'react';
import type { TempUnit, ThemeMode } from '../types';
import { safeStorage } from '../services/safeStorage';

const UNIT_STORAGE_KEY = 'weatherboard_unit';
const THEME_STORAGE_KEY = 'weatherboard_theme';

export function usePreferences() {
  // Temp Unit: 'C' or 'F'
  const [unit, setUnitState] = useState<TempUnit>(() => {
    const saved = safeStorage.getItem(UNIT_STORAGE_KEY);
    return saved === 'F' ? 'F' : 'C';
  });

  // Theme: 'system' | 'light' | 'dark'
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = safeStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = safeStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Apply theme to DOM and meta tag following modern-web-guidance
  const applyTheme = useCallback((mode: ThemeMode) => {
    const isDark =
      mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const resolved = isDark ? 'dark' : 'light';
    setResolvedTheme(resolved);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', mode === 'system' ? 'light dark' : mode);
    }
  }, []);

  // Sync theme changes
  useEffect(() => {
    applyTheme(theme);

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mql.addEventListener('change', handleSystemChange);
    return () => mql.removeEventListener('change', handleSystemChange);
  }, [theme, applyTheme]);

  const setUnit = useCallback((newUnit: TempUnit) => {
    setUnitState(newUnit);
    safeStorage.setItem(UNIT_STORAGE_KEY, newUnit);
  }, []);

  const toggleUnit = useCallback(() => {
    setUnitState((prev) => {
      const next = prev === 'C' ? 'F' : 'C';
      safeStorage.setItem(UNIT_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (newTheme === 'system') {
      safeStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      safeStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      // Toggle between light and dark directly for quick header toggle
      const next = prev === 'dark' || (prev === 'system' && resolvedTheme === 'dark') ? 'light' : 'dark';
      safeStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, [resolvedTheme]);

  return {
    unit,
    setUnit,
    toggleUnit,
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}
