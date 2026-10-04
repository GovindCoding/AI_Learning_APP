import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  readonly theme = signal<Theme>('light');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') {
        this.theme.set(saved);
      }
      this.applyTheme(this.theme());
    }

    // Effect to apply theme changes to <html>
    effect(() => {
      const current = this.theme();
      if (isPlatformBrowser(this.platformId)) {
        this.applyTheme(current);
      }
    });
  }

  private applyTheme(t: Theme): void {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(t);
    localStorage.setItem('theme', t);
  }

  toggleTheme(): void {
    this.theme.update(prev => (prev === 'light' ? 'dark' : 'light'));
  }
}
