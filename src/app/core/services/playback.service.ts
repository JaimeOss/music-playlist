import { computed, inject, Injectable, signal } from '@angular/core';
import { Song } from '../models/song.model';
import { PlaylistService } from './playlist.service';
import { AudioPlayerComponent } from '../../shared/components/audio-player/audio-player.component';

@Injectable({ providedIn: 'root' })
export class PlaybackService {
  private readonly playlistService = inject(PlaylistService);

  private player: AudioPlayerComponent | null = null;
  private shuffleHistory: string[] = [];
  private shuffleHistoryIndex = -1;
  private suppressPreviewEnded = false;

  readonly currentSong = signal<Song | null>(null);
  readonly playlistId = signal<string | null>(null);
  readonly playlistName = signal('');
  readonly isPlaying = signal(false);
  readonly isShuffleEnabled = signal(false);
  readonly isLoopEnabled = signal(false);

  readonly hasActivePlayback = computed(() => this.currentSong() !== null);

  readonly hasPreviousSong = computed(() => this.computeHasPrevious());
  readonly hasNextSong = computed(() => this.computeHasNext());

  attachPlayer(player: AudioPlayerComponent): void {
    this.player = player;
  }

  detachPlayer(): void {
    this.player = null;
  }

  setPlaylistContext(playlistId: string, playlistName: string): void {
    this.playlistId.set(playlistId);
    this.playlistName.set(playlistName);
  }

  isActiveInPlaylist(playlistId: string): boolean {
    return this.playlistId() === playlistId;
  }

  isSongSelected(playlistId: string, songId: string): boolean {
    return this.isActiveInPlaylist(playlistId) && this.currentSong()?.id === songId;
  }

  isSongPlaying(playlistId: string, songId: string): boolean {
    return this.isSongSelected(playlistId, songId) && this.isPlaying();
  }

  selectAndPlay(
    song: Song,
    options: { updateHistory?: boolean } = { updateHistory: true },
  ): void {
    if (!this.isSongInActivePlaylist(song.id)) {
      return;
    }

    if (this.isShuffleEnabled() && options.updateHistory !== false) {
      this.syncShuffleHistoryForSong(song);
    }

    this.currentSong.set(song);

    if (!song.previewUrl) {
      this.isPlaying.set(false);
      return;
    }

    this.player?.play(song);
  }

  toggleCurrentSong(): void {
    this.player?.toggle();
  }

  playPrevious(): void {
    const playlist = this.getActivePlaylist();
    const currentSong = this.currentSong();

    if (!this.computeHasPrevious() || !playlist || !currentSong) {
      return;
    }

    if (this.isShuffleEnabled()) {
      this.shuffleHistoryIndex--;
      const song = this.findSongById(this.shuffleHistory[this.shuffleHistoryIndex]);
      if (song) {
        this.selectAndPlay(song, { updateHistory: false });
      }
      return;
    }

    const currentIndex = this.getCurrentSongIndex();

    if (currentIndex > 0) {
      this.selectAndPlay(playlist.songs[currentIndex - 1]);
      return;
    }

    if (this.isLoopEnabled()) {
      if (playlist.songs.length === 1) {
        this.selectAndPlay(currentSong);
        return;
      }

      this.selectAndPlay(playlist.songs[playlist.songs.length - 1]);
    }
  }

  playNext(): void {
    const playlist = this.getActivePlaylist();
    const currentSong = this.currentSong();

    if (!this.computeHasNext() || !playlist || !currentSong) {
      return;
    }

    if (this.isShuffleEnabled()) {
      if (this.shuffleHistoryIndex < this.shuffleHistory.length - 1) {
        this.shuffleHistoryIndex++;
        const song = this.findSongById(this.shuffleHistory[this.shuffleHistoryIndex]);
        if (song) {
          this.selectAndPlay(song, { updateHistory: false });
        }
        return;
      }

      this.selectAndPlay(this.pickRandomSong(currentSong.id));
      return;
    }

    const currentIndex = this.getCurrentSongIndex();

    if (currentIndex < playlist.songs.length - 1) {
      this.selectAndPlay(playlist.songs[currentIndex + 1]);
      return;
    }

    if (this.isLoopEnabled()) {
      if (playlist.songs.length === 1) {
        this.selectAndPlay(currentSong);
        return;
      }

      this.selectAndPlay(playlist.songs[0]);
    }
  }

  onPreviewEnded(): void {
    if (this.suppressPreviewEnded || !this.currentSong()) {
      return;
    }

    if (this.computeHasNext()) {
      this.playNext();
      return;
    }

    this.isPlaying.set(false);
  }

  onPlayingChange(isPlaying: boolean): void {
    this.isPlaying.set(isPlaying);
  }

  toggleShuffle(): void {
    const enabled = !this.isShuffleEnabled();
    this.isShuffleEnabled.set(enabled);

    if (enabled && this.currentSong()) {
      this.shuffleHistory = [this.currentSong()!.id];
      this.shuffleHistoryIndex = 0;
    } else {
      this.resetShuffleHistory();
    }
  }

  toggleLoop(): void {
    this.isLoopEnabled.update((value) => !value);
  }

  closePlayer(): void {
    this.suppressPreviewEnded = true;
    this.isPlaying.set(false);
    this.resetShuffleHistory();
    this.player?.stop();
    this.currentSong.set(null);
    this.playlistId.set(null);
    this.playlistName.set('');

    queueMicrotask(() => {
      this.suppressPreviewEnded = false;
    });
  }

  closeIfPlaylist(playlistId: string): void {
    if (this.playlistId() === playlistId) {
      this.closePlayer();
    }
  }

  handleSongRemoved(playlistId: string, songId: string): void {
    this.removeSongFromShuffleHistory(songId);

    if (this.playlistId() === playlistId && this.currentSong()?.id === songId) {
      this.closePlayer();
    }
  }

  clearOnLogout(): void {
    this.closePlayer();
    this.isShuffleEnabled.set(false);
    this.isLoopEnabled.set(false);
  }

  private computeHasPrevious(): boolean {
    const playlist = this.getActivePlaylist();
    const currentSong = this.currentSong();

    if (!playlist || !currentSong) {
      return false;
    }

    if (this.isLoopEnabled() && playlist.songs.length >= 1) {
      return true;
    }

    if (this.isShuffleEnabled()) {
      return this.shuffleHistoryIndex > 0;
    }

    return this.getCurrentSongIndex() > 0;
  }

  private computeHasNext(): boolean {
    const playlist = this.getActivePlaylist();
    const currentSong = this.currentSong();

    if (!playlist || !currentSong) {
      return false;
    }

    if (this.isLoopEnabled() && playlist.songs.length >= 1) {
      return true;
    }

    if (this.isShuffleEnabled()) {
      if (playlist.songs.length <= 1) {
        return false;
      }

      if (this.shuffleHistoryIndex < this.shuffleHistory.length - 1) {
        return true;
      }

      return playlist.songs.length > 1;
    }

    return this.getCurrentSongIndex() < playlist.songs.length - 1;
  }

  private getActivePlaylist() {
    const id = this.playlistId();
    return id ? this.playlistService.getPlaylistById(id) : undefined;
  }

  private getCurrentSongIndex(): number {
    const playlist = this.getActivePlaylist();
    const currentSong = this.currentSong();

    if (!playlist || !currentSong) {
      return -1;
    }

    return playlist.songs.findIndex((song) => song.id === currentSong.id);
  }

  private isSongInActivePlaylist(songId: string): boolean {
    return this.getActivePlaylist()?.songs.some((song) => song.id === songId) ?? false;
  }

  private syncShuffleHistoryForSong(song: Song): void {
    const existingIndex = this.shuffleHistory.indexOf(song.id);

    if (existingIndex >= 0 && existingIndex <= this.shuffleHistoryIndex) {
      this.shuffleHistoryIndex = existingIndex;
      return;
    }

    this.shuffleHistory = [
      ...this.shuffleHistory.slice(0, this.shuffleHistoryIndex + 1),
      song.id,
    ];
    this.shuffleHistoryIndex = this.shuffleHistory.length - 1;
  }

  private removeSongFromShuffleHistory(songId: string): void {
    this.shuffleHistory = this.shuffleHistory.filter((id) => id !== songId);

    if (this.shuffleHistory.length === 0) {
      this.shuffleHistoryIndex = -1;
      return;
    }

    this.shuffleHistoryIndex = Math.min(
      this.shuffleHistoryIndex,
      this.shuffleHistory.length - 1,
    );
  }

  private resetShuffleHistory(): void {
    this.shuffleHistory = [];
    this.shuffleHistoryIndex = -1;
  }

  private findSongById(songId: string): Song | null {
    return this.getActivePlaylist()?.songs.find((song) => song.id === songId) ?? null;
  }

  private pickRandomSong(excludeId?: string): Song {
    const songs = this.getActivePlaylist()?.songs ?? [];
    const candidates = excludeId
      ? songs.filter((song) => song.id !== excludeId)
      : songs;

    if (candidates.length === 0) {
      return songs[0];
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  }
}
