import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Song } from '../models/song.model';
import { toHighResArtworkUrl } from '../utils/artwork.util';

interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  trackTimeMillis: number;
  artworkUrl100: string;
  previewUrl?: string;
}

interface ItunesSearchResponse {
  results: ItunesTrack[];
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

    return this.http
      .get<ItunesSearchResponse>('/itunes-api/search', { params })
      .pipe(
        map((response) =>
          response.results
            .filter((track) => !!track.previewUrl)
            .map((track) => ({
              id: track.trackId.toString(),
              title: track.trackName,
              artist: track.artistName,
              duration: track.trackTimeMillis,
              cover: toHighResArtworkUrl(track.artworkUrl100),
              previewUrl: track.previewUrl!,
            })),
        ),
      );
  }
}
