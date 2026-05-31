import { Component, Input } from '@angular/core';
import { Song } from '../../../core/models/song.model';

const DEFAULT_COVER = '/images/playlist-default.svg';

@Component({
  selector: 'app-playlist-cover',
  standalone: true,
  templateUrl: './playlist-cover.component.html',
})
export class PlaylistCoverComponent {
  @Input({ required: true }) songs!: Song[];
  @Input() alt = 'Playlist';
  @Input() hoverScale = false;

  readonly defaultCover = DEFAULT_COVER;

  get covers(): string[] {
    return this.songs.map((song) => song.cover).filter(Boolean).slice(0, 4);
  }
}
