import { Component, inject, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { Ripple } from 'primeng/ripple';
import { Tooltip } from 'primeng/tooltip';
import { APP_ROUTES } from '../../constants/app-routes.constants';
import { AuthService } from '../../services/auth.service';
import { PlaybackService } from '../../services/playback.service';
import { SearchSettingsService } from '../../services/search-settings.service';
import { ThemeService } from '../../services/theme.service';

interface ShellNavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Avatar,
    Button,
    Menu,
    Ripple,
    Tooltip,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  @ViewChild('settingsMenu') settingsMenu!: Menu;

  private readonly authService = inject(AuthService);
  private readonly playback = inject(PlaybackService);
  private readonly router = inject(Router);
  readonly themeService = inject(ThemeService);
  readonly searchSettings = inject(SearchSettingsService);

  readonly routes = APP_ROUTES;

  readonly navItems: ShellNavItem[] = [
    {
      label: 'Listas de reproducción',
      icon: 'pi pi-list',
      route: APP_ROUTES.playlists,
    },
    {
      label: 'Buscador de canciones',
      icon: 'pi pi-search',
      route: APP_ROUTES.search,
    },
  ];

  readonly settingsMenuItems: MenuItem[] = [
    { id: 'theme' },
    { id: 'itunes' },
    { separator: true },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  get currentUserName(): string {
    return this.authService.getCurrentUser()?.name ?? 'Usuario';
  }

  get userInitials(): string {
    return this.currentUserName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  openSettingsMenu(event: Event): void {
    this.settingsMenu.toggle(event);
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

  logout(): void {
    this.playback.clearOnLogout();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
