import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      { path: '', redirectTo: 'playlists', pathMatch: 'full' },
      {
        path: 'playlists',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./features/song-search/song-search.component').then((m) => m.SongSearchComponent),
      },
    ],
  },
  { path: 'home', redirectTo: 'app/playlists', pathMatch: 'full' },
  {
    path: 'playlist/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/redirects/legacy-playlist-redirect.component').then(
        (m) => m.LegacyPlaylistRedirectComponent,
      ),
  },
  { path: '**', redirectTo: 'login' },
];
