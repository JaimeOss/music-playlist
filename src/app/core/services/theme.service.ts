import { Injectable, signal } from '@angular/core';
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  THEME_TRANSITION_MS,
  ThemeMode,
} from '../constants/theme.constants';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<ThemeMode>(DEFAULT_THEME);

  constructor() {
    this.applyTheme(this.readStoredTheme());
  }

  toggle(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: ThemeMode): void {
    this.theme.set(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    this.applyTheme(theme, true);
  }

  private readStoredTheme(): ThemeMode {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);

    return stored === 'light' || stored === 'dark' ? stored : DEFAULT_THEME;
  }

  private applyTheme(theme: ThemeMode, animate = false): void {
    const root = document.documentElement;

    if (animate) {
      root.classList.add('theme-transition');
    }

    root.setAttribute('data-theme', theme);

    if (animate) {
      window.setTimeout(() => {
        root.classList.remove('theme-transition');
      }, THEME_TRANSITION_MS);
    }
  }
}
