import { Injectable } from '@angular/core';
import { map, Observable, timeout } from 'rxjs';
import { Song } from '../models/song.model';
import { toHighResArtworkUrl } from '../utils/artwork.util';

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';
const JSONP_TIMEOUT_MS = 12_000;

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
  searchSongs(query: string): Observable<Song[]> {
    const params = new URLSearchParams({
      term: query,
      media: 'music',
      entity: 'song',
      limit: '10',
    });

    return this.jsonp<ItunesSearchResponse>(`${ITUNES_SEARCH_URL}?${params.toString()}`).pipe(
      timeout(JSONP_TIMEOUT_MS),
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

  private jsonp<T>(url: string, callbackParam = 'callback'): Observable<T> {
    return new Observable((observer) => {
      const callbackName = `itunesJsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement('script');
      const jsonpWindow = window as unknown as Record<string, ((data: T) => void) | undefined>;
      let timedOut = false;

      const timeoutId = window.setTimeout(() => {
        timedOut = true;
        observer.error(new Error('Tiempo de espera agotado al consultar iTunes.'));
        cleanup();
      }, JSONP_TIMEOUT_MS);

      const cleanup = (): void => {
        window.clearTimeout(timeoutId);
        delete jsonpWindow[callbackName];
        script.remove();
      };

      jsonpWindow[callbackName] = (data: T) => {
        if (timedOut) {
          return;
        }

        observer.next(data);
        observer.complete();
        cleanup();
      };

      script.onerror = () => {
        if (timedOut) {
          return;
        }

        observer.error(
          new Error(
            'No se pudo cargar iTunes. Si usas Brave u otro bloqueador, permite scripts de itunes.apple.com.',
          ),
        );
        cleanup();
      };

      const separator = url.includes('?') ? '&' : '?';
      script.async = true;
      script.src = `${url}${separator}${callbackParam}=${callbackName}`;
      document.head.appendChild(script);

      return () => cleanup();
    });
  }
}
