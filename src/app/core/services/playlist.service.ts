import { Injectable, signal } from '@angular/core';
import { Playlist } from '../models/playlist.model';
import { Song } from '../models/song.model';
import { toHighResArtworkUrl } from '../utils/artwork.util';

const STORAGE_KEY = 'playlists';
const DEFAULT_COVER = '/images/playlist-default.svg';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  readonly playlists = signal<Playlist[]>(this.readFromStorage());

  getPlaylists(): Playlist[] {
    return this.playlists();
  }

  getPlaylistById(id: string): Playlist | undefined {
    return this.playlists().find((playlist) => playlist.id === id);
  }

  isLocked(id: string): boolean {
    return this.getPlaylistById(id)?.locked ?? false;
  }

  /** Indica si la lista permite editar nombre, canciones u orden. */
  canMutatePlaylist(id: string): boolean {
    const playlist = this.getPlaylistById(id);
    return !!playlist && !playlist.locked;
  }

  toggleLock(id: string): void {
    const playlists = [...this.playlists()];
    const playlist = playlists.find((item) => item.id === id);

    if (!playlist) {
      return;
    }

    playlist.locked = !playlist.locked;
    this.persist(playlists);
  }

  createPlaylist(name: string): Playlist {
    const playlist: Playlist = {
      id: crypto.randomUUID(),
      name: name.trim(),
      cover: DEFAULT_COVER,
      songs: [],
      createdAt: new Date(),
      locked: false,
    };

    this.persist([playlist, ...this.playlists()]);
    return playlist;
  }

  renamePlaylist(id: string, name: string): void {
    const trimmed = name.trim();

    if (trimmed.length < 2 || !this.canMutatePlaylist(id)) {
      return;
    }

    const playlists = [...this.playlists()];
    const playlist = playlists.find((item) => item.id === id);

    if (!playlist) {
      return;
    }

    playlist.name = trimmed;
    this.persist(playlists);
  }

  deletePlaylist(id: string): void {
    this.persist(this.playlists().filter((playlist) => playlist.id !== id));
  }

  addSong(playlistId: string, song: Song): void {
    if (!this.canMutatePlaylist(playlistId)) {
      return;
    }

    const playlists = [...this.playlists()];
    const playlist = playlists.find((item) => item.id === playlistId);

    if (!playlist || playlist.songs.some((existing) => existing.id === song.id)) {
      return;
    }

    playlist.songs.push(song);
    this.persist(playlists);
  }

  removeSong(playlistId: string, songId: string): void {
    if (!this.canMutatePlaylist(playlistId)) {
      return;
    }

    const playlists = [...this.playlists()];
    const playlist = playlists.find((item) => item.id === playlistId);

    if (!playlist) {
      return;
    }

    playlist.songs = playlist.songs.filter((song) => song.id !== songId);
    this.persist(playlists);
  }

  updatePlaylistSongs(playlistId: string, songs: Song[]): void {
    if (!this.canMutatePlaylist(playlistId)) {
      return;
    }

    const playlists = [...this.playlists()];
    const playlist = playlists.find((item) => item.id === playlistId);

    if (!playlist) {
      return;
    }

    playlist.songs = songs;
    this.persist(playlists);
  }

  private persist(playlists: Playlist[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
    this.playlists.set(this.normalizePlaylists(playlists));
  }

  private readFromStorage(): Playlist[] {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as Array<Omit<Playlist, 'createdAt'> & { createdAt: string }>;
      return this.normalizePlaylists(
        parsed.map((playlist) => ({
          ...playlist,
          createdAt: new Date(playlist.createdAt),
        })),
      );
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  private normalizePlaylists(playlists: Playlist[]): Playlist[] {
    return playlists.map((playlist) => ({
      ...playlist,
      songs: playlist.songs.map((song) => ({
        ...song,
        cover: toHighResArtworkUrl(song.cover),
      })),
      locked: playlist.locked ?? false,
    }));
  }
}
