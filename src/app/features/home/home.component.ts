import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { PlaylistService } from '../../core/services/playlist.service';
import { Playlist } from '../../core/models/playlist.model';
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

  activePlaylists: Playlist[] = [];
  blockedPlaylists: Playlist[] = [];
  createDialogVisible = false;
  detailDialogVisible = false;
  selectedPlaylistId: string | null = null;

  readonly createForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    this.loadPlaylists();

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const playlistId = params.get('playlist');

      if (playlistId) {
        this.openDetail(playlistId);
      }
    });
  }

  get detailDialogHeader(): string {
    if (!this.selectedPlaylistId) {
      return 'Detalle de playlist';
    }

    const playlist = this.playlistService.getPlaylistById(this.selectedPlaylistId);
    return playlist?.name ?? 'Detalle de playlist';
  }

  loadPlaylists(): void {
    const all = this.playlistService.getPlaylists();
    this.activePlaylists = all.filter((playlist) => !playlist.locked);
    this.blockedPlaylists = all.filter((playlist) => playlist.locked);
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
    this.loadPlaylists();
    this.openDetail(playlist.id);
  }

  onPlaylistClick(id: string): void {
    this.openDetail(id);
  }

  openDetail(id: string): void {
    if (!this.playlistService.getPlaylistById(id)) {
      return;
    }

    this.selectedPlaylistId = id;
    this.detailDialogVisible = true;
    this.syncPlaylistQueryParam(id);
  }

  onDetailClosed(): void {
    this.detailDialogVisible = false;
    this.selectedPlaylistId = null;
    this.syncPlaylistQueryParam(null);
  }

  onPlaylistsChanged(): void {
    this.loadPlaylists();

    if (this.selectedPlaylistId && !this.playlistService.getPlaylistById(this.selectedPlaylistId)) {
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
