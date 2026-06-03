/** Rutas autenticadas bajo el layout shell (`/app/...`). */
export const APP_ROUTES = {
  root: '/app',
  playlists: '/app/playlists',
  search: '/app/search',
  playlistDetail: (id: string) => `/app/playlists?playlist=${id}`,
} as const;
