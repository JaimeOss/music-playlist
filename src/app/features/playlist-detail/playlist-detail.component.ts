import { Component, DestroyRef, ChangeDetectorRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  of,
} from 'rxjs';
import { MenuItem } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';
import { ProgressSpinner } from 'primeng/progressspinner';
import { AuthService } from '../../core/services/auth.service';
import { ItunesService } from '../../core/services/itunes.service';
import { PlaylistService } from '../../core/services/playlist.service';
import { Playlist } from '../../core/models/playlist.model';
import { Song } from '../../core/models/song.model';
import { formatDuration, formatTotalDuration } from '../../core/utils/format-duration.util';
import { SongItemComponent } from '../../shared/components/song-item/song-item.component';
import { AudioPlayerComponent } from '../../shared/components/audio-player/audio-player.component';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DragDropModule,
    Avatar,
    Button,
    Dialog,
    InputText,
    Menu,
    ProgressSpinner,
    SongItemComponent,
    AudioPlayerComponent,
  ],
  templateUrl: './playlist-detail.component.html',
  styleUrl: './playlist-detail.component.scss',
})
export class PlaylistDetailComponent implements OnInit {
  @ViewChild('userMenu') userMenu!: Menu;
  @ViewChild(AudioPlayerComponent) audioPlayer!: AudioPlayerComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly playlistService = inject(PlaylistService);
  private readonly itunesService = inject(ItunesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  playlist: Playlist | null = null;
  playlistId = '';

  currentSong: Song | null = null;
  isPlayerPlaying = false;

  searchDialogVisible = false;
  searchControl = new FormControl('', { nonNullable: true });
  searchResults: Song[] = [];
  isSearching = false;
  searchError = false;

  readonly menuItems: MenuItem[] = [
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  ngOnInit(): void {
    this.playlistId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadPlaylist();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => {
          this.searchError = false;
          this.isSearching = false;
          this.searchResults = [];
        }),
        switchMap((term) => {
          const query = term.trim();

          if (query.length < 2) {
            return of([]);
          }

          this.isSearching = true;
          return this.itunesService.searchSongs(query);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (results) => {
          this.searchResults = results;
          this.isSearching = false;
        },
        error: () => {
          this.searchResults = [];
          this.isSearching = false;
          this.searchError = true;
        },
      });
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

  get songCountLabel(): string {
    const count = this.playlist?.songs.length ?? 0;
    return count === 1 ? '1 canción' : `${count} canciones`;
  }

  get totalDurationLabel(): string {
    const totalMs =
      this.playlist?.songs.reduce((sum, song) => sum + song.duration, 0) ?? 0;

    return formatTotalDuration(totalMs);
  }

  get playlistMetaLabel(): string {
    return `${this.songCountLabel} · ${this.totalDurationLabel}`;
  }

  loadPlaylist(): void {
    const playlist = this.playlistService.getPlaylistById(this.playlistId);

    if (!playlist) {
      this.router.navigate(['/home']);
      return;
    }

    this.playlist = playlist;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  openUserMenu(event: Event): void {
    this.userMenu.toggle(event);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openSearchDialog(): void {
    this.searchControl.setValue('');
    this.searchResults = [];
    this.searchError = false;
    this.searchDialogVisible = true;
  }

  addSong(song: Song): void {
    this.playlistService.addSong(this.playlistId, song);
    this.loadPlaylist();
    this.searchDialogVisible = false;

    const added = this.playlist?.songs.find((item) => item.id === song.id);
    if (added) {
      this.selectAndPlay(added);
    }
  }

  removeSong(song: Song): void {
    this.playlistService.removeSong(this.playlistId, song.id);

    if (this.currentSong?.id === song.id) {
      this.currentSong = null;
      this.isPlayerPlaying = false;
    }

    this.loadPlaylist();
    this.cdr.markForCheck();
  }

  onPlaySong(song: Song): void {
    if (this.currentSong?.id === song.id) {
      this.audioPlayer.toggle();
      return;
    }

    this.selectAndPlay(song);
  }

  isSongSelected(songId: string): boolean {
    return this.currentSong?.id === songId;
  }

  isSongPlaying(songId: string): boolean {
    return this.isPlayerPlaying && this.currentSong?.id === songId;
  }

  onPlayingChange(isPlaying: boolean): void {
    this.isPlayerPlaying = isPlaying;
    this.cdr.markForCheck();
  }

  private selectAndPlay(song: Song): void {
    this.currentSong = song;
    queueMicrotask(() => this.audioPlayer.play());
  }

  onSongDrop(event: CdkDragDrop<Song[]>): void {
    if (!this.playlist || event.previousIndex === event.currentIndex) {
      return;
    }

    const songs = [...this.playlist.songs];
    moveItemInArray(songs, event.previousIndex, event.currentIndex);
    this.playlistService.updatePlaylistSongs(this.playlistId, songs);
    this.loadPlaylist();
    this.cdr.markForCheck();
  }

  formatDuration(milliseconds: number): string {
    return formatDuration(milliseconds);
  }
}
