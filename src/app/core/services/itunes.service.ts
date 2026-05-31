import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, timeout } from 'rxjs';
import { Song } from '../models/song.model';
import { toHighResArtworkUrl } from '../utils/artwork.util';

const ITUNES_SEARCH_PATH = '/api/itunes/search';
const REQUEST_TIMEOUT_MS = 12_000;

interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  trackTimeMillis: number;
  artworkUrl100: string;
  previewUrl?: string;
}

interface ItunesSearchResponse {
  results?: ItunesTrack[];
}

@Injectable({ providedIn: 'root' })
export class ItunesService {
  private readonly http = inject(HttpClient);

  searchSongs(query: string): Observable<Song[]> {
    const params = new HttpParams()
      .set('term', query)
      .set('media', 'music')
      .set('entity', 'song')
      .set('limit', '10');

    return this.http.get<ItunesSearchResponse>(ITUNES_SEARCH_PATH, { params }).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      map((response) => this.toSongs(response)),
    );
  }

  private toSongs(response: ItunesSearchResponse): Song[] {
    return (response.results ?? [])
      .filter((track) => !!track.previewUrl)
      .map((track) => ({
        id: track.trackId.toString(),
        title: track.trackName,
        artist: track.artistName,
        duration: track.trackTimeMillis,
        cover: toHighResArtworkUrl(track.artworkUrl100),
        previewUrl: track.previewUrl!,
      }));
  }
}
