import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-playlist-create-card',
  standalone: true,
  templateUrl: './playlist-create-card.component.html',
  styleUrl: './playlist-create-card.component.scss',
})
export class PlaylistCreateCardComponent {
  @Output() createClick = new EventEmitter<void>();
}
