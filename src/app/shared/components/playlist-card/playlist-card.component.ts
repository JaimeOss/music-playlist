import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { PlaybackService } from '../../../core/services/playback.service';
import { Playlist } from '../../../core/models/playlist.model';
import { formatTotalDuration } from '../../../core/utils/format-duration.util';
import { PlaylistCoverComponent } from '../playlist-cover/playlist-cover.component';

@Component({
  selector: 'app-playlist-card',
  standalone: true,
  imports: [PlaylistCoverComponent],
  templateUrl: './playlist-card.component.html',
  styleUrl: './playlist-card.component.scss',
})
export class PlaylistCardComponent {
  @Input({ required: true }) playlist!: Playlist;
  @Output() cardClick = new EventEmitter<string>();

  readonly playback = inject(PlaybackService);
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

  onCardClick(): void {
    this.cardClick.emit(this.playlist.id);
  }
}
