# Music Playlist

Aplicación web para crear y administrar listas de reproducción de música. Desarrollada con **Angular 21**, **PrimeNG** y **Tailwind CSS**.

Evolución de la **segunda fase** de la prueba técnica: layout con menú lateral, bloqueo de listas, buscador global y detalle en modal, manteniendo la base de la primera fase (auth, reproductor, iTunes, persistencia local).

## Enlaces

| Recurso | URL |
|---------|-----|
| **Demo en vivo** | https://jaime-music-playlist.netlify.app |
| **Repositorio** | https://github.com/JaimeOss/music-playlist |

## Credenciales de prueba

| Campo | Valor |
|-------|--------|
| Correo | `usuario@musicapp.com` |
| Contraseña | `123456` |

> El correo debe usar el dominio `@musicapp.com` (validación del formulario de login).

## Funcionalidades

- Inicio y cierre de sesión con guards de ruta
- **Layout shell** con menú lateral (listas, buscador, opciones en ⋮)
- Vista de listas: grid con card **+**, cards con hover de nombre, sección **Bloqueadas**
- **Bloqueo de listas** con confirmación; solo lectura + reproducción cuando está bloqueada
- **Detalle en modal** (portada, canciones, submodales de búsqueda/renombrar/eliminar)
- **Buscador global** (`/app/search`) con agregar a playlist no bloqueada
- iTunes (por defecto) o catálogo local de respaldo (20 canciones)
- Reproductor global fijo (siempre por encima de modales): play/pausa, anterior/siguiente, shuffle, loop
- Persistencia en `localStorage` (playlists) y `sessionStorage` (sesión)

## Ejecución local

Requisitos: **Node.js 20+** y **npm**.

```bash
npm install
npm start
```

Abre http://localhost:4200

Build de producción:

```bash
npm run build
```

Los artefactos se generan en `dist/music-playlist/browser`.

En desarrollo, el proxy de `proxy.conf.json` reenvía `/api/itunes` a iTunes (misma idea que en Netlify).

## Despliegue en Netlify

El proyecto incluye [`netlify.toml`](./netlify.toml) con build, publish, proxy iTunes y regla SPA.

### Opción A — Desde GitHub (recomendada)

1. Sube los cambios a GitHub (`git push`).
2. [Netlify](https://app.netlify.com) → **Add new site** → **Import an existing project**.
3. Conecta el repositorio.
4. Valores (auto-detectados desde `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist/music-playlist/browser`
5. **Deploy site** → la URL de producción quedará en el panel del sitio.

### Opción B — Deploy manual (CLI)

```bash
npm install -g netlify-cli
npm run build
netlify login
netlify init
netlify deploy --prod
```

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/login` | Inicio de sesión |
| `/app/playlists` | Listas de reproducción (vista por defecto tras login) |
| `/app/search` | Buscador de canciones |
| `/app/playlists?playlist={id}` | Abre el modal de detalle de esa lista |
| `/home` | Redirige a `/app/playlists` |
| `/playlist/:id` | Redirige a `/app/playlists?playlist=:id` |

## Estructura del proyecto

```
src/app/
├── core/           # Servicios, guards, modelos, shell, constantes de rutas
├── features/       # Login, home (playlists), song-search
└── shared/         # Player, cards, playlist-detail-modal, playlist-detail-panel, etc.
```

- **`playlist-detail-modal`**: contenedor del modal (PrimeNG Dialog).
- **`playlist-detail-panel`**: contenido y submodales (buscar, renombrar, bloquear, eliminar).

## Decisiones técnicas (fase 2)

### Layout shell

Tras el login, las vistas autenticadas viven bajo `/app` con un **layout común**: sidebar (iconos + tooltip), avatar del usuario y `router-outlet`. Evita duplicar cabeceras y alinea la app con el mockup de navegación lateral.

### Modales separados por responsabilidad

| Modal | Uso |
|-------|-----|
| Crear playlist | Formulario corto en `home` |
| Detalle de playlist | `PlaylistDetailModal` + panel interno |
| Buscar / renombrar / bloquear / eliminar | Submodales del panel, sin mezclar con el de detalle |

El detalle ya no usa ruta dedicada; la URL `?playlist=id` permite enlazar o refrescar con el modal abierto.

### Bloqueo de playlists

| Acción | Lista desbloqueada | Lista bloqueada |
|--------|-------------------|-----------------|
| Ver lista y canciones | Sí | Sí |
| Reproducir / pausar | Sí | Sí |
| Renombrar / agregar / quitar / reordenar | Sí | No |
| Bloquear / desbloquear | Sí | Sí (desbloquear) |
| Eliminar la playlist completa | Sí | Sí |

- Campo `locked` en el modelo y persistencia en `localStorage`.
- `PlaylistService.canMutatePlaylist()` centraliza las reglas; la UI solo refleja el estado.
- Signal `playlists()` para que el grid y la sección **Bloqueadas** se actualicen al bloquear/desbloquear sin recargar manualmente.

### Búsqueda de canciones

- Vista propia en el menú lateral; reutiliza `SongSearchService` (iTunes + fallback local).
- Al agregar, un segundo modal lista solo playlists **no bloqueadas**.
- Desde el detalle de una lista, la búsqueda sigue disponible en su submodal (contexto de esa playlist).

### Reproductor global

Componente fijo en `app` con `z-index` superior a los overlays de PrimeNG (`--app-z-player: 1300`), para poder controlar la reproducción con modales abiertos.

### Estado y escalabilidad

- Componentes **standalone**, rutas **lazy**, tipado fuerte en modelos y servicios inyectables.
- Carpetas `core` / `features` / `shared` y constantes `APP_ROUTES` para rutas autenticadas.

## Plan de pruebas manual

- [ ] Login con credenciales de prueba y guard de rutas
- [ ] Crear playlist desde card **+** y desde modal
- [ ] Abrir detalle, agregar canción, reordenar, reproducir
- [ ] Bloquear lista → aparece en **Bloqueadas**; no permite editar; sí reproduce
- [ ] Desbloquear y volver al grid principal
- [ ] Buscador global: buscar y agregar a playlist editable
- [ ] Menú ⋮ del sidebar: tema, iTunes on/off, cerrar sesión
- [ ] Reproductor usable con modal de detalle abierto
- [ ] Refrescar en `/app/playlists` y `/app/search` (SPA Netlify)
- [ ] Rutas legacy `/home` y `/playlist/:id`

## Notas

- **iTunes**: activo por defecto; desactivable en el menú ⋮ del sidebar. Si falla la API, se usa el catálogo local.
- **SPA**: `netlify.toml` redirige `/*` a `index.html` para refrescos en rutas internas.
- **Proxy iTunes en producción**: regla `/api/itunes/*` en Netlify evita problemas de CORS en el navegador.

## Tecnologías

- Angular 21 (standalone components, signals, lazy routes)
- Angular CDK (drag & drop)
- PrimeNG + PrimeIcons
- Tailwind CSS 4
- RxJS
