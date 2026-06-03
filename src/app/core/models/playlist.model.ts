import { Song } from './song.model';

export interface Playlist {
  id: string;
  name: string;
  cover: string;
  songs: Song[];
  createdAt: Date;
  locked: boolean;
}
