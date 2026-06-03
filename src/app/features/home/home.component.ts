import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { PlaylistService } from '../../core/services/playlist.service';
import { PlaylistCardComponent } from '../../shared/components/playlist-card/playlist-card.component';
import { PlaylistCreateCardComponent } from '../../shared/components/playlist-create-card/playlist-create-card.component';
import { PlaylistDetailComponent } from '../playlist-detail/playlist-detail.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Button,
    Dialog,
    InputText,
    PlaylistCardComponent,
    PlaylistCreateCardComponent,
    PlaylistDetailComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly playlistService = inject(PlaylistService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly selectedPlaylistId = signal<string | null>(null);
  createDialogVisible = false;
  detailDialogVisible = false;

  readonly activePlaylists = computed(() =>
    this.playlistService.playlists().filter((playlist) => !playlist.locked),
  );

  readonly blockedPlaylists = computed(() =>
    this.playlistService.playlists().filter((playlist) => playlist.locked),
  );

  readonly detailDialogHeader = computed(() => {
    const id = this.selectedPlaylistId();

    if (!id) {
      return 'Detalle de playlist';
    }

    return this.playlistService.getPlaylistById(id)?.name ?? 'Detalle de playlist';
  });

  readonly createForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const playlistId = params.get('playlist');

      if (playlistId) {
        this.openDetail(playlistId);
      }
    });
  }

  openCreateDialog(): void {
    this.createForm.reset();
    this.createDialogVisible = true;
  }

  createPlaylist(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const name = this.createForm.getRawValue().name!;
    const playlist = this.playlistService.createPlaylist(name);
    this.createDialogVisible = false;
    this.openDetail(playlist.id);
  }

  onPlaylistClick(id: string): void {
    this.openDetail(id);
  }

  openDetail(id: string): void {
    if (!this.playlistService.getPlaylistById(id)) {
      return;
    }

    this.selectedPlaylistId.set(id);
    this.detailDialogVisible = true;
    this.syncPlaylistQueryParam(id);
  }

  onDetailClosed(): void {
    this.detailDialogVisible = false;
    this.selectedPlaylistId.set(null);
    this.syncPlaylistQueryParam(null);
  }

  onPlaylistsChanged(): void {
    const id = this.selectedPlaylistId();

    if (id && !this.playlistService.getPlaylistById(id)) {
      this.onDetailClosed();
    }
  }

  private syncPlaylistQueryParam(playlistId: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { playlist: playlistId ?? null },
      replaceUrl: true,
    });
  }
}
