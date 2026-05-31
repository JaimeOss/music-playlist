import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

const MIN_DISPLAY_MS = 1200;

@Component({
  selector: 'app-login-loading-screen',
  standalone: true,
  templateUrl: './login-loading-screen.component.html',
  styleUrl: './login-loading-screen.component.scss',
})
export class LoginLoadingScreenComponent implements OnInit, OnDestroy {
  @Output() finished = new EventEmitter<void>();

  private finishTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.finishTimeoutId = setTimeout(() => {
      this.finished.emit();
    }, MIN_DISPLAY_MS);
  }

  ngOnDestroy(): void {
    if (this.finishTimeoutId !== null) {
      clearTimeout(this.finishTimeoutId);
    }
  }
}
