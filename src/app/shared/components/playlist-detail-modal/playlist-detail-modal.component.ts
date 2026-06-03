import { Component, computed, DestroyRef, effect, inject, input, model, output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { PlaylistService } from '../../../core/services/playlist.service';
import { PlaylistDetailPanelComponent } from '../playlist-detail-panel/playlist-detail-panel.component';

/** Modal de detalle de playlist (contenedor + panel interno). */
@Component({
  selector: 'app-playlist-detail-modal',
  standalone: true,
  imports: [Dialog, PlaylistDetailPanelComponent],
  templateUrl: './playlist-detail-modal.component.html',
  styleUrl: './playlist-detail-modal.component.scss',
})
export class PlaylistDetailModalComponent {
  private readonly playlistService = inject(PlaylistService);
  private readonly destroyRef = inject(DestroyRef);

  readonly visible = model(false);
  readonly playlistId = input<string | null>(null);

  readonly closed = output<void>();
  readonly playlistsChanged = output<void>();

  readonly dialogHeader = computed(() => {
    const id = this.playlistId();

    if (!id) {
      return 'Detalle de playlist';
    }

    return this.playlistService.getPlaylistById(id)?.name ?? 'Detalle de playlist';
  });

  constructor() {
    effect(() => {
      document.body.classList.toggle('playlist-detail-modal-open', this.visible());
    });

    this.destroyRef.onDestroy(() => {
      document.body.classList.remove('playlist-detail-modal-open');
    });
  }

  onDialogHide(): void {
    this.visible.set(false);
    this.closed.emit();
  }

  onPanelClosed(): void {
    this.visible.set(false);
    this.closed.emit();
  }
}
