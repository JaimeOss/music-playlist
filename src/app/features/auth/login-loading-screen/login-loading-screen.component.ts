import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

const MIN_DISPLAY_MS = 1200;
const FADE_OUT_MS = 450;

@Component({
  selector: 'app-login-loading-screen',
  standalone: true,
  templateUrl: './login-loading-screen.component.html',
  styleUrl: './login-loading-screen.component.scss',
})
export class LoginLoadingScreenComponent implements OnInit, OnDestroy {
  @Output() finished = new EventEmitter<void>();

  isLeaving = false;

  private finishTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    void this.runLoadingSequence();
  }

  ngOnDestroy(): void {
    if (this.finishTimeoutId !== null) {
      clearTimeout(this.finishTimeoutId);
    }
  }

  private async runLoadingSequence(): Promise<void> {
    await this.wait(MIN_DISPLAY_MS);

    this.isLeaving = true;

    this.finishTimeoutId = setTimeout(() => {
      this.finished.emit();
    }, FADE_OUT_MS);
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
