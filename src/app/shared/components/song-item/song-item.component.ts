import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { Song } from '../../../core/models/song.model';
import { formatDuration } from '../../../core/utils/format-duration.util';

@Component({
  selector: 'app-song-item',
  standalone: true,
  imports: [CdkDragHandle, Button, Menu],
  templateUrl: './song-item.component.html',
  styleUrl: './song-item.component.scss',
})
export class SongItemComponent {
  @ViewChild('songMenu') songMenu!: Menu;

  @Input({ required: true }) song!: Song;
  @Input() reorderable = false;
  @Input() isSelected = false;
  @Input() isPlaying = false;
  @Output() onPlay = new EventEmitter<Song>();
  @Output() onDelete = new EventEmitter<Song>();

  readonly menuItems: MenuItem[] = [
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      command: (event: MenuItemCommandEvent) => this.handleDelete(event),
    },
  ];

  get durationLabel(): string {
    return formatDuration(this.song.duration);
  }

  get playIcon(): string {
    return this.isPlaying ? 'pi pi-pause' : 'pi pi-play';
  }

  handleDelete(event: MenuItemCommandEvent): void {
    event.originalEvent?.preventDefault();
    event.originalEvent?.stopPropagation();
    event.originalEvent?.stopImmediatePropagation?.();
    this.onDelete.emit(this.song);
  }

  handlePlay(event: Event): void {
    event.stopPropagation();
    this.onPlay.emit(this.song);
  }

  handleRowClick(): void {
    this.onPlay.emit(this.song);
  }

  openMenu(event: Event): void {
    event.stopPropagation();
    this.songMenu.toggle(event);
  }

  stopDragClick(event: Event): void {
    event.stopPropagation();
  }
}
