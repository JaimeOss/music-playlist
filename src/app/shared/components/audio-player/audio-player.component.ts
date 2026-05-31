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
import {
  DEFAULT_PLAYER_VOLUME,
  PLAYER_VOLUME_STORAGE_KEY,
} from '../../../core/constants/player.constants';
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
    const previousId = this._song?.id ?? null;
    this._song = value;

    if (!value) {
      this.stopCurrentTrack();
      return;
    }

    if (previousId !== value.id && this.loadedSongId !== value.id) {
      this.stopCurrentTrack();
    }
  }

  get song(): Song | null {
    return this._song;
  }

  @Input() hasPrevious = false;
  @Input() hasNext = false;
  @Input() shuffleEnabled = false;
  @Input() loopEnabled = false;
  @Input() playlistName = '';

  @Output() playingChange = new EventEmitter<boolean>();
  @Output() previousClick = new EventEmitter<void>();
  @Output() nextClick = new EventEmitter<void>();
  @Output() previewEnded = new EventEmitter<void>();
  @Output() shuffleToggle = new EventEmitter<void>();
  @Output() loopToggle = new EventEmitter<void>();

  isPlaying = false;
  currentTime = 0;
  volume = DEFAULT_PLAYER_VOLUME;

  private volumeBeforeMute = DEFAULT_PLAYER_VOLUME;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly audio = new Audio();
  private loadedSongId: string | null = null;
  private pendingCanPlayHandler: (() => void) | null = null;
  private playbackSession = 0;

  constructor() {
    this.loadVolume();
    this.applyVolume();
  }

  ngOnDestroy(): void {
    this.playbackSession++;
    this.clearPendingCanPlay();
    this.audio.pause();
    this.audio.onloadedmetadata = null;
    this.audio.ontimeupdate = null;
    this.audio.onended = null;
    this.audio.src = '';
    this.audio.load();
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

  get volumePercent(): number {
    return Math.round(this.volume * 100);
  }

  get volumeIcon(): string {
    if (this.volume === 0) {
      return 'pi pi-volume-off';
    }

    if (this.volume < 0.5) {
      return 'pi pi-volume-down';
    }

    return 'pi pi-volume-up';
  }

  get volumeAriaLabel(): string {
    if (this.volume === 0) {
      return 'Activar sonido';
    }

    return `Volumen ${this.volumePercent}%`;
  }

  stop(): void {
    this.playbackSession++;
    this.stopCurrentTrack();
    this._song = null;
    this.cdr.markForCheck();
  }

  play(targetSong?: Song): void {
    const song = targetSong ?? this.song;

    if (!song?.previewUrl) {
      return;
    }

    if (targetSong) {
      this._song = targetSong;
      this.cdr.markForCheck();
    }

    if (this.loadedSongId !== song.id) {
      this.startSong(song);
      return;
    }

    this.resumePlayback(this.playbackSession);
  }

  toggle(): void {
    if (!this.song?.previewUrl) {
      return;
    }

    if (this.loadedSongId !== this.song.id) {
      this.startSong(this.song);
      return;
    }

    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      this.playingChange.emit(false);
      this.cdr.markForCheck();
      return;
    }

    this.resumePlayback(this.playbackSession);
  }

  private startSong(song: Song): void {
    const session = this.playbackSession;
    this.clearPendingCanPlay();
    this.stopCurrentTrack();
    this.loadedSongId = song.id;
    this.bindAudioEvents(session);
    this.audio.src = song.previewUrl;
    this.audio.load();

    const onCanPlay = (): void => {
      this.clearPendingCanPlay();

      if (session !== this.playbackSession) {
        return;
      }

      if (this.song?.id !== song.id) {
        return;
      }

      this.resumePlayback(session);
    };

    this.pendingCanPlayHandler = onCanPlay;
    this.audio.addEventListener('canplay', onCanPlay);

    if (this.audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      onCanPlay();
    }
  }

  private resumePlayback(session: number): void {
    if (session !== this.playbackSession) {
      return;
    }

    this.audio
      .play()
      .then(() => {
        if (session !== this.playbackSession) {
          this.audio.pause();
          return;
        }

        this.isPlaying = true;
        this.playingChange.emit(true);
        this.cdr.markForCheck();
      })
      .catch(() => {
        if (session !== this.playbackSession) {
          return;
        }

        this.isPlaying = false;
        this.playingChange.emit(false);
        this.cdr.markForCheck();
      });
  }

  private bindAudioEvents(session: number): void {
    this.audio.onloadedmetadata = () => {
      if (session !== this.playbackSession) {
        return;
      }

      this.currentTime = 0;
      this.cdr.markForCheck();
    };

    this.audio.ontimeupdate = () => {
      if (session !== this.playbackSession) {
        return;
      }

      this.currentTime = Math.min(this.audio.currentTime, PREVIEW_MAX_SECONDS);
      this.cdr.markForCheck();

      if (this.audio.currentTime >= PREVIEW_MAX_SECONDS) {
        this.stopPreview(true);
      }
    };

    this.audio.onended = () => {
      if (session !== this.playbackSession) {
        return;
      }

      this.stopPreview(true);
    };
  }

  private stopCurrentTrack(): void {
    this.clearPendingCanPlay();
    this.audio.onloadedmetadata = null;
    this.audio.ontimeupdate = null;
    this.audio.onended = null;
    this.audio.pause();
    this.audio.src = '';
    this.audio.load();
    this.currentTime = 0;
    this.isPlaying = false;
    this.loadedSongId = null;
    this.playingChange.emit(false);
    this.cdr.markForCheck();
  }

  private clearPendingCanPlay(): void {
    if (!this.pendingCanPlayHandler) {
      return;
    }

    this.audio.removeEventListener('canplay', this.pendingCanPlayHandler);
    this.pendingCanPlayHandler = null;
  }

  previous(): void {
    if (this.hasPrevious) {
      this.previousClick.emit();
    }
  }

  next(): void {
    if (this.hasNext) {
      this.nextClick.emit();
    }
  }

  onShuffleToggle(): void {
    this.shuffleToggle.emit();
  }

  onLoopToggle(): void {
    this.loopToggle.emit();
  }

  toggleMute(): void {
    if (this.volume > 0) {
      this.volumeBeforeMute = this.volume;
      this.volume = 0;
    } else {
      this.volume = this.volumeBeforeMute > 0 ? this.volumeBeforeMute : DEFAULT_PLAYER_VOLUME;
    }

    this.applyVolume();
    this.cdr.markForCheck();
  }

  onVolumeChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);

    this.volume = Math.min(100, Math.max(0, value)) / 100;

    if (this.volume > 0) {
      this.volumeBeforeMute = this.volume;
    }

    this.applyVolume();
    this.cdr.markForCheck();
  }

  private loadVolume(): void {
    const stored = localStorage.getItem(PLAYER_VOLUME_STORAGE_KEY);

    if (stored === null) {
      return;
    }

    const parsed = Number(stored);

    if (Number.isNaN(parsed) || parsed < 0 || parsed > 1) {
      return;
    }

    this.volume = parsed;
    this.volumeBeforeMute = parsed > 0 ? parsed : DEFAULT_PLAYER_VOLUME;
  }

  private applyVolume(): void {
    this.audio.volume = this.volume;
    localStorage.setItem(PLAYER_VOLUME_STORAGE_KEY, String(this.volume));
  }

  private stopPreview(emitEnded = false): void {
    if (emitEnded && !this.isPlaying && this.audio.currentTime === 0) {
      return;
    }

    this.audio.pause();
    this.audio.currentTime = 0;
    this.currentTime = 0;
    this.isPlaying = false;
    this.playingChange.emit(false);
    this.cdr.markForCheck();

    if (emitEnded) {
      this.previewEnded.emit();
    }
  }

  private formatSeconds(value: number): string {
    const seconds = Math.floor(value);
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;

    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
  }
}
