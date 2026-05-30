import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { Button } from 'primeng/button';
import { Song } from '../../../core/models/song.model';

const PREVIEW_MAX_SECONDS = 30;

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [Button],
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.scss',
})
export class AudioPlayerComponent implements OnDestroy {
  private _song: Song | null = null;

  @Input() set song(value: Song | null) {
    this._song = value;

    if (!value) {
      this.stopPreview();
    }
  }

  get song(): Song | null {
    return this._song;
  }

  @Output() playingChange = new EventEmitter<boolean>();

  isPlaying = false;
  currentTime = 0;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly audio = new Audio();
  private loadedSongId: string | null = null;

  ngOnDestroy(): void {
    this.audio.pause();
    this.audio.src = '';
  }

  get playIcon(): string {
    return this.isPlaying ? 'pi pi-pause' : 'pi pi-play';
  }

  get progressPercent(): number {
    return (this.currentTime / PREVIEW_MAX_SECONDS) * 100;
  }

  get currentTimeLabel(): string {
    return this.formatSeconds(this.currentTime);
  }

  play(): void {
    if (!this.song?.previewUrl) {
      return;
    }

    if (this.loadedSongId !== this.song.id) {
      this.loadSong(this.song);
    }

    this.audio
      .play()
      .then(() => {
        this.isPlaying = true;
        this.playingChange.emit(true);
        this.cdr.markForCheck();
      })
      .catch(() => {
        this.isPlaying = false;
        this.playingChange.emit(false);
        this.cdr.markForCheck();
      });
  }

  toggle(): void {
    if (!this.song?.previewUrl) {
      return;
    }

    if (this.loadedSongId !== this.song.id) {
      this.play();
      return;
    }

    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      this.playingChange.emit(false);
      this.cdr.markForCheck();
      return;
    }

    this.play();
  }

  private loadSong(song: Song): void {
    this.audio.pause();
    this.audio.src = song.previewUrl;
    this.loadedSongId = song.id;
    this.currentTime = 0;

    this.audio.onloadedmetadata = () => {
      this.currentTime = 0;
      this.cdr.markForCheck();
    };

    this.audio.ontimeupdate = () => {
      this.currentTime = Math.min(this.audio.currentTime, PREVIEW_MAX_SECONDS);
      this.cdr.markForCheck();

      if (this.audio.currentTime >= PREVIEW_MAX_SECONDS) {
        this.stopPreview();
      }
    };

    this.audio.onended = () => {
      this.stopPreview();
    };
  }

  private stopPreview(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.currentTime = 0;
    this.isPlaying = false;
    this.playingChange.emit(false);
    this.cdr.markForCheck();
  }

  private formatSeconds(value: number): string {
    const seconds = Math.floor(value);
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;

    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
  }
}
