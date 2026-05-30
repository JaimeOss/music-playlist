import { Injectable } from '@angular/core';
import { Playlist } from '../models/playlist.model';
import { Song } from '../models/song.model';
import { toHighResArtworkUrl } from '../utils/artwork.util';
const STORAGE_KEY = 'playlists';
const DEFAULT_COVER = '/images/playlist-default.svg';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  getPlaylists(): Playlist[] {
    const stored = this.readFromStorage();

    if (stored.length === 0) {
      const seed = this.createSeedPlaylists();
      this.saveToStorage(seed);
      return seed;
    }

    return stored;
  }

  getPlaylistById(id: string): Playlist | undefined {
    return this.getPlaylists().find((playlist) => playlist.id === id);
  }

  createPlaylist(name: string): Playlist {
    const playlist: Playlist = {
      id: crypto.randomUUID(),
      name: name.trim(),
      cover: DEFAULT_COVER,
      songs: [],
      createdAt: new Date(),
    };

    const playlists = this.getPlaylists();
    playlists.unshift(playlist);
    this.saveToStorage(playlists);

    return playlist;
  }

  deletePlaylist(id: string): void {
    const playlists = this.getPlaylists().filter((playlist) => playlist.id !== id);
    this.saveToStorage(playlists);
  }

  updatePlaylistsOrder(playlists: Playlist[]): void {
    this.saveToStorage(playlists);
  }

  addSong(playlistId: string, song: Song): void {
    const playlists = this.getPlaylists();
    const playlist = playlists.find((item) => item.id === playlistId);

    if (!playlist) {
      return;
    }

    if (playlist.songs.some((existing) => existing.id === song.id)) {
      return;
    }

    playlist.songs.push(song);
    this.syncCover(playlist);
    this.saveToStorage(playlists);
  }

  removeSong(playlistId: string, songId: string): void {
    const playlists = this.getPlaylists();
    const playlist = playlists.find((item) => item.id === playlistId);

    if (!playlist) {
      return;
    }

    playlist.songs = playlist.songs.filter((song) => song.id !== songId);
    this.syncCover(playlist);
    this.saveToStorage(playlists);
  }

  updatePlaylistSongs(playlistId: string, songs: Song[]): void {
    const playlists = this.getPlaylists();
    const playlist = playlists.find((item) => item.id === playlistId);

    if (!playlist) {
      return;
    }

    playlist.songs = songs;
    this.syncCover(playlist);
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
      return parsed.map((playlist) => {
        const mapped: Playlist = {
          ...playlist,
          songs: playlist.songs.map((song) => ({
            ...song,
            cover: toHighResArtworkUrl(song.cover),
          })),
          createdAt: new Date(playlist.createdAt),
        };
        this.syncCover(mapped);
        return mapped;
      });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  private createSeedPlaylists(): Playlist[] {
    const rockSongs: Song[] = [
      {
        id: '1001',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        duration: 200040,
        cover: DEFAULT_COVER,
        previewUrl: '',
      },
      {
        id: '1002',
        title: 'Levitating',
        artist: 'Dua Lipa',
        duration: 203064,
        cover: DEFAULT_COVER,
        previewUrl: '',
      },
    ];

    const chillSongs: Song[] = [
      {
        id: '2001',
        title: 'Sunflower',
        artist: 'Post Malone',
        duration: 157560,
        cover: DEFAULT_COVER,
        previewUrl: '',
      },
    ];

    return [
      {
        id: crypto.randomUUID(),
        name: 'Rock Mix',
        cover: DEFAULT_COVER,
        songs: rockSongs,
        createdAt: new Date('2025-01-15'),
      },
      {
        id: crypto.randomUUID(),
        name: 'Chill Vibes',
        cover: DEFAULT_COVER,
        songs: chillSongs,
        createdAt: new Date('2025-02-20'),
      },
    ].map((playlist) => {
      this.syncCover(playlist);
      return playlist;
    });
  }

  private syncCover(playlist: Playlist): void {
    playlist.cover =
      playlist.songs.length > 0 ? playlist.songs[0].cover : DEFAULT_COVER;
  }
}
