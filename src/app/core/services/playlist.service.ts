import { Injectable } from '@angular/core';
import { Playlist } from '../models/playlist.model';
import { Song } from '../models/song.model';
import { toHighResArtworkUrl } from '../utils/artwork.util';
const STORAGE_KEY = 'playlists';
const DEFAULT_COVER = '/images/playlist-default.svg';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  getPlaylists(): Playlist[] {
    return this.readFromStorage();
  }

  getPlaylistById(id: string): Playlist | undefined {
    return this.getPlaylists().find((playlist) => playlist.id === id);
  }

  toggleLock(id: string): void {
    const playlists = this.getPlaylists();
    const playlist = playlists.find((item) => item.id === id);

    if (!playlist) {
      return;
    }

    playlist.locked = !playlist.locked;
    this.saveToStorage(playlists);
  }

  isLocked(id: string): boolean {
    return this.getPlaylistById(id)?.locked ?? false;
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

    const playlists = this.getPlaylists();
    playlists.unshift(playlist);
    this.saveToStorage(playlists);

    return playlist;
  }

  renamePlaylist(id: string, name: string): void {
    const trimmed = name.trim();

    if (trimmed.length < 2) {
      return;
    }

    const playlists = this.getPlaylists();
    const playlist = playlists.find((item) => item.id === id);

    if (!playlist || playlist.locked) {
      return;
    }

    playlist.name = trimmed;
    this.saveToStorage(playlists);
  }

  deletePlaylist(id: string): void {
    const playlists = this.getPlaylists().filter((playlist) => playlist.id !== id);
    this.saveToStorage(playlists);
  }

  addSong(playlistId: string, song: Song): void {
    const playlists = this.getPlaylists();
    const playlist = playlists.find((item) => item.id === playlistId);

    if (!playlist || playlist.locked) {
      return;
    }

    if (playlist.songs.some((existing) => existing.id === song.id)) {
      return;
    }

    playlist.songs.push(song);
    this.saveToStorage(playlists);
  }

  removeSong(playlistId: string, songId: string): void {
    const playlists = this.getPlaylists();
    const playlist = playlists.find((item) => item.id === playlistId);

    if (!playlist || playlist.locked) {
      return;
    }

    playlist.songs = playlist.songs.filter((song) => song.id !== songId);
    this.saveToStorage(playlists);
  }

  updatePlaylistSongs(playlistId: string, songs: Song[]): void {
    const playlists = this.getPlaylists();
    const playlist = playlists.find((item) => item.id === playlistId);

    if (!playlist || playlist.locked) {
      return;
    }

    playlist.songs = songs;
    this.saveToStorage(playlists);
  }

  saveToStorage(playlists: Playlist[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
  }

  private readFromStorage(): Playlist[] {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as Array<Omit<Playlist, 'createdAt'> & { createdAt: string }>;
      return parsed.map((playlist) => ({
        ...playlist,
        songs: playlist.songs.map((song) => ({
          ...song,
          cover: toHighResArtworkUrl(song.cover),
        })),
        createdAt: new Date(playlist.createdAt),
        locked: playlist.locked ?? false,
      }));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }
}
