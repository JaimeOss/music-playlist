import { Component, effect, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { Ripple } from 'primeng/ripple';
import { SearchSettingsService } from '../../../core/services/search-settings.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-user-header-menu',
  standalone: true,
  imports: [Button, Menu, Ripple],
  templateUrl: './user-header-menu.component.html',
  styleUrl: './user-header-menu.component.scss',
})
export class UserHeaderMenuComponent {
  @Input({ required: true }) menuTriggerClass = '';
  @Output() logout = new EventEmitter<void>();

  @ViewChild('userMenu') userMenu!: Menu;

  readonly themeService = inject(ThemeService);
  readonly searchSettings = inject(SearchSettingsService);

  readonly menuItems: MenuItem[] = [
    { id: 'theme' },
    { id: 'itunes' },
    { separator: true },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout.emit(),
    },
  ];

  openUserMenu(event: Event): void {
    this.userMenu.toggle(event);
  }

  onThemeClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.themeService.toggle();
  }

  onItunesClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.searchSettings.toggleUseItunes();
  }
}
