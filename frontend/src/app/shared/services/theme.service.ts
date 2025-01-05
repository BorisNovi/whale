import { inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private theme$ = new BehaviorSubject<string>('auto');
  private themes = ['dark', 'light', 'auto'] as const;
  private renderer: Renderer2;

  private rendererFactory = inject(RendererFactory2);

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);

    const storedTheme = localStorage.getItem('whale-theme');
    const currentTheme = this.themes.includes(
      storedTheme as (typeof this.themes)[number],
    )
      ? (storedTheme as (typeof this.themes)[number])
      : this.themes[2];

    this.theme$.next(currentTheme);
    this.applyTheme(currentTheme);
  }

  switchTheme(): void {
    const currentTheme = (localStorage.getItem('whale-theme') ||
      this.themes[2]) as (typeof this.themes)[number];
    const currentIndex = this.themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    const nextTheme = this.themes[nextIndex];

    this.theme$.next(nextTheme);
    localStorage.setItem('whale-theme', nextTheme);

    this.applyTheme(nextTheme);
  }

  private applyTheme(theme: string): void {
    const systemTheme = this.detectSystemTheme();
    const appliedTheme = theme === 'auto' ? systemTheme : theme;

    this.themes.forEach((t) => this.renderer.removeClass(document.body, t));
    this.renderer.addClass(document.body, appliedTheme);
  }

  private detectSystemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  getTheme$(): Observable<string> {
    return this.theme$.asObservable();
  }
}
