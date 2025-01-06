import { inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private theme$ = new BehaviorSubject<'dark' | 'light' | 'auto'>('auto');
  private systemTheme$ = new BehaviorSubject<'dark' | 'light'>(
    this.detectSystemTheme(),
  );
  private themes: readonly ('dark' | 'light' | 'auto')[] = [
    'dark',
    'light',
    'auto',
  ];
  private renderer: Renderer2;

  constructor() {
    const rendererFactory = inject(RendererFactory2);
    this.renderer = rendererFactory.createRenderer(null, null);

    const storedTheme = this.getStoredTheme();
    this.theme$.next(storedTheme);
    this.applyTheme(storedTheme);

    this.initSystemThemeListener();
  }

  switchTheme(): void {
    const currentTheme = this.theme$.getValue();
    const currentIndex = this.themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    const nextTheme = this.themes[nextIndex];

    this.theme$.next(nextTheme);
    localStorage.setItem('whale-theme', nextTheme);

    this.applyTheme(nextTheme);
  }

  getTheme$(): Observable<'dark' | 'light' | 'auto'> {
    return this.theme$.asObservable();
  }

  private applyTheme(theme: 'dark' | 'light' | 'auto'): void {
    const systemTheme = this.systemTheme$.getValue();
    const appliedTheme = theme === 'auto' ? systemTheme : theme;

    const body = this.renderer.selectRootElement('body', true);
    this.themes.forEach((t) => this.renderer.removeClass(body, t));
    this.renderer.addClass(body, appliedTheme);
  }

  private detectSystemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  private initSystemThemeListener(): void {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    fromEvent<MediaQueryListEvent>(darkModeQuery, 'change').subscribe(
      (event) => {
        const systemTheme = event.matches ? 'dark' : 'light';
        this.systemTheme$.next(systemTheme);

        if (this.theme$.getValue() === 'auto') {
          this.applyTheme('auto');
        }
      },
    );
  }

  private getStoredTheme(): 'dark' | 'light' | 'auto' {
    try {
      const storedTheme = localStorage.getItem('whale-theme');
      return this.themes.includes(storedTheme as 'dark' | 'light' | 'auto')
        ? (storedTheme as 'dark' | 'light' | 'auto')
        : 'auto';
    } catch {
      return 'auto';
    }
  }
}
