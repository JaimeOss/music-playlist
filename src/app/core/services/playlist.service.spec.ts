import { PlaylistService } from './playlist.service';
import { Song } from '../models/song.model';

const mockSong: Song = {
  id: 'song-1',
  title: 'Test Song',
  artist: 'Test Artist',
  duration: 180000,
  cover: '/images/playlist-default.svg',
  previewUrl: 'https://example.com/preview.m4a',
};

describe('PlaylistService lock rules', () => {
  let service: PlaylistService;

  beforeEach(() => {
    localStorage.clear();
    service = new PlaylistService();
  });

  it('should create unlocked playlists by default', () => {
    const playlist = service.createPlaylist('Mi lista');
    expect(playlist.locked).toBe(false);
    expect(service.canMutatePlaylist(playlist.id)).toBe(true);
  });

  it('should block mutations when playlist is locked', () => {
    const playlist = service.createPlaylist('Bloqueada');
    service.addSong(playlist.id, mockSong);
    service.toggleLock(playlist.id);

    expect(service.isLocked(playlist.id)).toBe(true);
    expect(service.canMutatePlaylist(playlist.id)).toBe(false);

    service.renamePlaylist(playlist.id, 'Nuevo nombre');
    service.addSong(playlist.id, { ...mockSong, id: 'song-2' });
    service.removeSong(playlist.id, mockSong.id);
    service.updatePlaylistSongs(playlist.id, []);

    const stored = service.getPlaylistById(playlist.id)!;
    expect(stored.name).toBe('Bloqueada');
    expect(stored.songs).toHaveLength(1);
  });

  it('should allow mutations again after unlock', () => {
    const playlist = service.createPlaylist('Temporal');
    service.toggleLock(playlist.id);
    service.toggleLock(playlist.id);

    service.renamePlaylist(playlist.id, 'Desbloqueada');
    expect(service.getPlaylistById(playlist.id)?.name).toBe('Desbloqueada');
  });

  it('should still allow deleting a locked playlist', () => {
    const playlist = service.createPlaylist('Eliminar');
    service.toggleLock(playlist.id);
    service.deletePlaylist(playlist.id);

    expect(service.getPlaylistById(playlist.id)).toBeUndefined();
  });
});
