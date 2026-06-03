import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { PlaybackService } from '../../../core/services/playback.service';
import { Playlist } from '../../../core/models/playlist.model';
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

  onCardClick(): void {
    this.cardClick.emit(this.playlist.id);
  }
}
