import { Component, Input } from '@angular/core';
import { Playlist } from '../../../core/models/playlist.model';
import { formatTotalDuration } from '../../../core/utils/format-duration.util';

@Component({
  selector: 'app-playlist-card',
  standalone: true,
  templateUrl: './playlist-card.component.html',
})
export class PlaylistCardComponent {
  @Input({ required: true }) playlist!: Playlist;

  get songCountLabel(): string {
    const count = this.playlist.songs.length;
    return count === 1 ? '1 canción' : `${count} canciones`;
  }

  get totalDurationLabel(): string {
    const totalMs = this.playlist.songs.reduce((sum, song) => sum + song.duration, 0);
    return formatTotalDuration(totalMs);
  }

  get playlistMetaLabel(): string {
    return `${this.songCountLabel} · ${this.totalDurationLabel}`;
  }
}
