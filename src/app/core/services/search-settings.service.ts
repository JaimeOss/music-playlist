import { Injectable, signal } from '@angular/core';
import {
  DEFAULT_USE_ITUNES,
  USE_ITUNES_STORAGE_KEY,
} from '../constants/search-settings.constants';

@Injectable({ providedIn: 'root' })
export class SearchSettingsService {
  readonly useItunes = signal(this.readStoredPreference());

  toggleUseItunes(): void {
    this.setUseItunes(!this.useItunes());
  }

  setUseItunes(enabled: boolean): void {
    this.useItunes.set(enabled);
    localStorage.setItem(USE_ITUNES_STORAGE_KEY, String(enabled));
  }

  private readStoredPreference(): boolean {
    const stored = localStorage.getItem(USE_ITUNES_STORAGE_KEY);

    if (stored === null) {
      return DEFAULT_USE_ITUNES;
    }

    return stored === 'true';
  }
}
