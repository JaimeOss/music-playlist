import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { AuthService } from '../../core/services/auth.service';
import { PlaybackService } from '../../core/services/playback.service';
import { PlaylistService } from '../../core/services/playlist.service';
import { Playlist } from '../../core/models/playlist.model';
import { PlaylistCardComponent } from '../../shared/components/playlist-card/playlist-card.component';
import { UserHeaderMenuComponent } from '../../shared/components/user-header-menu/user-header-menu.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Avatar,
    Button,
    Dialog,
    InputText,
    PlaylistCardComponent,
    UserHeaderMenuComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly playback = inject(PlaybackService);
  private readonly playlistService = inject(PlaylistService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  playlists: Playlist[] = [];
  createDialogVisible = false;

  readonly createForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    this.loadPlaylists();
  }

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

  loadPlaylists(): void {
    this.playlists = this.playlistService.getPlaylists();
  }

  openCreateDialog(): void {
    this.createForm.reset();
    this.createDialogVisible = true;
  }

  createPlaylist(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const name = this.createForm.getRawValue().name!;
    const playlist = this.playlistService.createPlaylist(name);
    this.createDialogVisible = false;
    this.router.navigate(['/playlist', playlist.id]);
  }

  logout(): void {
    this.playback.clearOnLogout();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onPlaylistClick(id: string): void {
    this.router.navigate(['/playlist', id]);
  }
}
