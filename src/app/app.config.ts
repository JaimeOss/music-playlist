import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { AppThemePreset } from './core/theme/app-theme.preset';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: AppThemePreset,
        options: {
          darkModeSelector: '[data-theme="dark"]',
        },
      },
      zIndex: {
        modal: 1100,
        overlay: 1000,
        menu: 1400,
        tooltip: 1400,
      },
    })
  ]
};
