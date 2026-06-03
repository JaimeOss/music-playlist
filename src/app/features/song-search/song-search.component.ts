import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  of,
} from 'rxjs';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SongSearchSource } from '../../core/models/song-search.model';
import { Song } from '../../core/models/song.model';
import { PlaylistService } from '../../core/services/playlist.service';
import { SearchSettingsService } from '../../core/services/search-settings.service';
import { SongSearchService } from '../../core/services/song-search.service';
import { formatDuration } from '../../core/utils/format-duration.util';
import { PlaylistCoverComponent } from '../../shared/components/playlist-cover/playlist-cover.component';

@Component({
  selector: 'app-song-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Button,
    Dialog,
    InputText,
    ProgressSpinner,
    PlaylistCoverComponent,
  ],
  templateUrl: './song-search.component.html',
  styleUrl: './song-search.component.scss',
})
export class SongSearchComponent implements OnInit {
  private readonly songSearchService = inject(SongSearchService);
  private readonly playlistService = inject(PlaylistService);
  readonly searchSettings = inject(SearchSettingsService);
  private readonly destroyRef = inject(DestroyRef);

  searchControl = new FormControl('', { nonNullable: true });
  searchResults: Song[] = [];
  searchSource: SongSearchSource | null = null;
  isSearching = false;
  searchError = false;

  pickerDialogVisible = false;
  readonly songToAdd = signal<Song | null>(null);
  addSuccessMessage: string | null = null;

  readonly editablePlaylists = computed(() =>
    this.playlistService.playlists().filter((playlist) => !playlist.locked),
  );

  constructor() {
    effect(() => {
      const useItunes = this.searchSettings.useItunes();
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
      this.isSearching = false;
    });
  }

  ngOnInit(): void {
    if (!this.searchSettings.useItunes()) {
      this.executeSearch('');
    }

    this.searchControl.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => {
          this.searchError = false;
          this.addSuccessMessage = null;

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
      ? 'Buscador...'
      : 'Filtrar catálogo local...';
  }

  get searchSourceHint(): string | null {
    if (this.searchSource === 'local-fallback') {
      return 'iTunes no disponible. Mostrando catálogo local de respaldo.';
    }

    if (!this.searchSettings.useItunes()) {
      return 'Catálogo local (20 canciones). Escribe para filtrar.';
    }

    if (this.searchControl.value.trim().length < 2) {
      return 'Escribe al menos 2 caracteres para buscar en iTunes.';
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

  get hasEditablePlaylists(): boolean {
    return this.editablePlaylists().length > 0;
  }

  openPlaylistPicker(song: Song): void {
    this.songToAdd.set(song);
    this.addSuccessMessage = null;
    this.pickerDialogVisible = true;
  }

  closePlaylistPicker(): void {
    this.pickerDialogVisible = false;
    this.songToAdd.set(null);
  }

  isSongInPlaylist(playlistId: string, songId: string): boolean {
    return (
      this.playlistService.getPlaylistById(playlistId)?.songs.some((item) => item.id === songId) ??
      false
    );
  }

  confirmAddToPlaylist(playlistId: string): void {
    const song = this.songToAdd();

    if (!song) {
      return;
    }

    if (this.isSongInPlaylist(playlistId, song.id) || !this.playlistService.canMutatePlaylist(playlistId)) {
      return;
    }

    const playlist = this.playlistService.getPlaylistById(playlistId);

    if (!playlist) {
      return;
    }

    this.playlistService.addSong(playlistId, song);
    this.addSuccessMessage = `«${song.title}» se agregó a ${playlist.name}.`;
    this.closePlaylistPicker();
  }

  formatDuration(milliseconds: number): string {
    return formatDuration(milliseconds);
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
}
