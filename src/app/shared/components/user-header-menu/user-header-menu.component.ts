import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { Ripple } from 'primeng/ripple';
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

  readonly menuItems: MenuItem[] = [
    { id: 'theme' },
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
}
