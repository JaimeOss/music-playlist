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
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'playlist/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/playlist-detail/playlist-detail.component').then(
        (m) => m.PlaylistDetailComponent,
      ),
  },
  { path: '**', redirectTo: 'login' },
];
