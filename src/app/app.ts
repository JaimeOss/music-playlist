import { AfterViewInit, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlaybackService } from './core/services/playback.service';
import { AudioPlayerComponent } from './shared/components/audio-player/audio-player.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AudioPlayerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit, OnDestroy {
  readonly playback = inject(PlaybackService);

  @ViewChild(AudioPlayerComponent) private audioPlayer?: AudioPlayerComponent;

  ngAfterViewInit(): void {
    if (this.audioPlayer) {
      this.playback.attachPlayer(this.audioPlayer);
    }
  }

  ngOnDestroy(): void {
    this.playback.detachPlayer();
  }
}
