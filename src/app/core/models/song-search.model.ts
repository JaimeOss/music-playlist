import { Song } from './song.model';

export type SongSearchSource = 'itunes' | 'local' | 'local-fallback';

export interface SongSearchResult {
  songs: Song[];
  source: SongSearchSource;
}
