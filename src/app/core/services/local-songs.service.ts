import { Injectable } from '@angular/core';
import { FALLBACK_SONGS } from '../constants/fallback-songs.constants';
import { Song } from '../models/song.model';

@Injectable({ providedIn: 'root' })
export class LocalSongsService {
  /** Sin texto devuelve las 20 canciones; con texto filtra por título o artista. */
  filter(query: string): Song[] {
    const normalized = normalize(query);

    if (!normalized) {
      return [...FALLBACK_SONGS];
    }

    return FALLBACK_SONGS.filter(
      (song) =>
        normalize(song.title).includes(normalized) || normalize(song.artist).includes(normalized),
    );
  }
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}
