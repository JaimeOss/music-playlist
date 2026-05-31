import { Component, DestroyRef, ChangeDetectorRef, effect, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { SearchSettingsService } from '../../core/services/search-settings.service';
import { SongSearchService } from '../../core/services/song-search.service';
import { PlaybackService } from '../../core/services/playback.service';
import { PlaylistService } from '../../core/services/playlist.service';
import { Playlist } from '../../core/models/playlist.model';
import { SongSearchSource } from '../../core/models/song-search.model';
import { Song } from '../../core/models/song.model';
import { formatDuration, formatTotalDuration } from '../../core/utils/format-duration.util';
import { runAfterDeleteAnimation } from '../../core/constants/delete-animation.constants';
import { DeleteExplosionComponent } from '../../shared/components/delete-explosion/delete-explosion.component';
import { SongItemComponent } from '../../shared/components/song-item/song-item.component';
import { PlaylistCoverComponent } from '../../shared/components/playlist-cover/playlist-cover.component';
import { UserHeaderMenuComponent } from '../../shared/components/user-header-menu/user-header-menu.component';

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
    DeleteExplosionComponent,
    PlaylistCoverComponent,
    UserHeaderMenuComponent,
  ],
  templateUrl: './playlist-detail.component.html',
  styleUrl: './playlist-detail.component.scss',
})
export class PlaylistDetailComponent implements OnInit {
  @ViewChild('playlistMenu') playlistMenu!: Menu;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly playlistService = inject(PlaylistService);
  readonly playback = inject(PlaybackService);
  readonly searchSettings = inject(SearchSettingsService);
  private readonly songSearchService = inject(SongSearchService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);

  playlist: Playlist | null = null;
  playlistId = '';

  private readonly blockedPlaySongIds = new Set<string>();

  searchDialogVisible = false;
  renameDialogVisible = false;
  deleteDialogVisible = false;
  deleteSongDialogVisible = false;
  songToDelete: Song | null = null;
  readonly deletingSongIds = new Set<string>();
  isPlaylistDeleting = false;
  searchControl = new FormControl('', { nonNullable: true });
  searchResults: Song[] = [];
  searchSource: SongSearchSource | null = null;
  isSearching = false;
  searchError = false;

  readonly renameForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  readonly playlistMenuItems: MenuItem[] = [
    {
      label: 'Renombrar',
      icon: 'pi pi-pencil',
      command: () => this.openRenameDialog(),
    },
    {
      label: 'Eliminar playlist',
      icon: 'pi pi-trash',
      command: () => this.openDeleteDialog(),
    },
  ];

  constructor() {
    effect(() => {
      const useItunes = this.searchSettings.useItunes();

      if (!this.searchDialogVisible) {
        return;
      }

      const query = this.searchControl.value.trim();

      if (!useItunes) {
        this.executeSearch(query);
        return;
      }

      if (query.length >= 2) {
        this.executeSearch(query);
        return;
      }

      this.searchResults = [];
      this.searchSource = null;
    });
  }

  ngOnInit(): void {
    this.playlistId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadPlaylist();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => {
          this.searchError = false;

          if (this.searchSettings.useItunes()) {
            this.searchSource = null;
            this.isSearching = false;
            this.searchResults = [];
          }
        }),
        switchMap((term) => {
          const query = term.trim();

          if (!this.searchSettings.useItunes()) {
            return this.songSearchService.search(query);
          }

          if (query.length < 2) {
            return of({ songs: [], source: 'itunes' as const });
          }

          this.isSearching = true;
          return this.songSearchService.search(query);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.searchResults = result.songs;
          this.searchSource = result.source;
          this.isSearching = false;
          this.searchError = false;
        },
        error: () => {
          this.searchResults = [];
          this.searchSource = null;
          this.isSearching = false;
          this.searchError = true;
        },
      });
  }

  get searchPlaceholder(): string {
    return this.searchSettings.useItunes()
      ? 'Buscar en iTunes...'
      : 'Filtrar catálogo local...';
  }

  get searchSourceHint(): string | null {
    if (this.searchSource === 'local-fallback') {
      return 'iTunes no disponible. Mostrando catálogo local de respaldo.';
    }

    if (!this.searchSettings.useItunes()) {
      return 'Catálogo local (20 canciones). Escribe para filtrar.';
    }

    return null;
  }

  get showSearchEmpty(): boolean {
    const query = this.searchControl.value.trim();

    if (this.searchSettings.useItunes()) {
      return query.length >= 2;
    }

    return query.length > 0;
  }

  private applySearchResult(result: { songs: Song[]; source: SongSearchSource }): void {
    this.searchResults = result.songs;
    this.searchSource = result.source;
    this.isSearching = false;
    this.searchError = false;
  }

  private executeSearch(query: string): void {
    if (this.searchSettings.useItunes()) {
      this.isSearching = true;
      this.searchResults = [];
    }

    this.searchError = false;

    this.songSearchService.search(query).subscribe({
      next: (result) => this.applySearchResult(result),
      error: () => {
        this.searchResults = [];
        this.searchSource = null;
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

  openPlaylistMenu(event: Event): void {
    this.playlistMenu.toggle(event);
  }

  openRenameDialog(): void {
    this.renameForm.reset({ name: this.playlist?.name ?? '' });
    this.renameDialogVisible = true;
  }

  confirmRename(): void {
    if (this.renameForm.invalid || !this.playlist) {
      this.renameForm.markAllAsTouched();
      return;
    }

    const name = this.renameForm.getRawValue().name!;
    this.playlistService.renamePlaylist(this.playlistId, name);
    this.loadPlaylist();

    if (this.playback.isActiveInPlaylist(this.playlistId)) {
      this.playback.setPlaylistContext(this.playlistId, name);
    }

    this.renameDialogVisible = false;
  }

  openDeleteDialog(): void {
    this.deleteDialogVisible = true;
  }

  deletePlaylist(): void {
    if (!this.playlist || this.isPlaylistDeleting) {
      return;
    }

    this.deleteDialogVisible = false;
    this.isPlaylistDeleting = true;

    runAfterDeleteAnimation(() => {
      this.playback.closeIfPlaylist(this.playlistId);
      this.playlistService.deletePlaylist(this.playlistId);
      this.router.navigate(['/home']);
    });
  }

  logout(): void {
    this.playback.clearOnLogout();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openSearchDialog(): void {
    this.searchControl.setValue('');
    this.searchError = false;
    this.searchDialogVisible = true;

    if (!this.searchSettings.useItunes()) {
      this.executeSearch('');
      return;
    }

    this.searchResults = [];
    this.searchSource = null;
  }

  addSong(song: Song): void {
    if (this.isSongInPlaylist(song.id)) {
      return;
    }

    this.playlistService.addSong(this.playlistId, song);
    this.loadPlaylist();
    this.searchDialogVisible = false;

    const added = this.playlist?.songs.find((item) => item.id === song.id);
    if (added) {
      this.playback.setPlaylistContext(this.playlistId, this.playlist!.name);
      this.playback.selectAndPlay(added);
    }
  }

  removeSong(song: Song): void {
    this.blockedPlaySongIds.add(song.id);
    this.playback.handleSongRemoved(this.playlistId, song.id);
    this.playlistService.removeSong(this.playlistId, song.id);
    this.loadPlaylist();
    this.cdr.markForCheck();

    queueMicrotask(() => this.blockedPlaySongIds.delete(song.id));
  }

  openDeleteSongDialog(song: Song): void {
    this.songToDelete = song;
    this.deleteSongDialogVisible = true;
  }

  confirmDeleteSong(): void {
    if (!this.songToDelete || this.deletingSongIds.has(this.songToDelete.id)) {
      return;
    }

    const song = this.songToDelete;
    this.deleteSongDialogVisible = false;
    this.songToDelete = null;
    this.deletingSongIds.add(song.id);

    runAfterDeleteAnimation(() => {
      this.removeSong(song);
      this.deletingSongIds.delete(song.id);
    });
  }

  cancelDeleteSong(): void {
    this.songToDelete = null;
    this.deleteSongDialogVisible = false;
  }

  onPlaySong(song: Song): void {
    if (this.blockedPlaySongIds.has(song.id) || !this.isSongInPlaylist(song.id)) {
      return;
    }

    this.playback.setPlaylistContext(this.playlistId, this.playlist!.name);

    if (this.playback.isSongSelected(this.playlistId, song.id)) {
      this.playback.toggleCurrentSong();
      return;
    }

    this.playback.selectAndPlay(song);
  }

  isSongInPlaylist(songId: string): boolean {
    return this.playlist?.songs.some((item) => item.id === songId) ?? false;
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
