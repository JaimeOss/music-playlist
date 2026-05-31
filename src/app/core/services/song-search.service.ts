import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { SongSearchResult } from '../models/song-search.model';
import { ItunesService } from './itunes.service';
import { LocalSongsService } from './local-songs.service';
import { SearchSettingsService } from './search-settings.service';

@Injectable({ providedIn: 'root' })
export class SongSearchService {
  private readonly itunesService = inject(ItunesService);
  private readonly localSongsService = inject(LocalSongsService);
  private readonly searchSettings = inject(SearchSettingsService);

  search(query: string): Observable<SongSearchResult> {
    const term = query.trim();

    if (!this.searchSettings.useItunes()) {
      return of({
        songs: this.localSongsService.filter(term),
        source: 'local',
      });
    }

    if (term.length < 2) {
      return of({ songs: [], source: 'itunes' });
    }

    return this.itunesService.searchSongs(term).pipe(
      map((songs) => {
        if (songs.length > 0) {
          return { songs, source: 'itunes' as const };
        }

        const localSongs = this.localSongsService.filter(term);

        if (localSongs.length > 0) {
          return { songs: localSongs, source: 'local-fallback' as const };
        }

        return { songs: [], source: 'itunes' as const };
      }),
      catchError(() =>
        of({
          songs: this.localSongsService.filter(term),
          source: 'local-fallback' as const,
        }),
      ),
    );
  }
}
