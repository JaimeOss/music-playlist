import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MenuItem } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';
import { AuthService } from '../../core/services/auth.service';
import { PlaylistService } from '../../core/services/playlist.service';
import { Playlist } from '../../core/models/playlist.model';
import { PlaylistCardComponent } from '../../shared/components/playlist-card/playlist-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DragDropModule,
    Avatar,
    Button,
    Dialog,
    InputText,
    Menu,
    PlaylistCardComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  @ViewChild('userMenu') userMenu!: Menu;

  private readonly authService = inject(AuthService);
  private readonly playlistService = inject(PlaylistService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  playlists: Playlist[] = [];
  createDialogVisible = false;
  private wasDragged = false;

  readonly createForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  readonly menuItems: MenuItem[] = [
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

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

  openUserMenu(event: Event): void {
    this.userMenu.toggle(event);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onPlaylistClick(id: string): void {
    if (this.wasDragged) {
      this.wasDragged = false;
      return;
    }

    this.router.navigate(['/playlist', id]);
  }

  onDragStarted(): void {
    this.wasDragged = true;
  }

  onPlaylistDrop(event: CdkDragDrop<Playlist[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const playlists = [...this.playlists];
    moveItemInArray(playlists, event.previousIndex, event.currentIndex);
    this.playlistService.updatePlaylistsOrder(playlists);
    this.playlists = playlists;
  }
}
