# Music Playlist

Aplicación web para crear y administrar listas de reproducción de música. Desarrollada con **Angular 21**, **PrimeNG** y **Tailwind CSS**.

## Enlaces

| Recurso | URL |
|---------|-----|
| **Demo en vivo** | _Pendiente: añade aquí la URL de Netlify tras el primer deploy_ |
| **Repositorio** | https://github.com/JaimeOss/music-playlist |

## Credenciales de prueba

| Campo | Valor |
|-------|--------|
| Correo | `usuario@musicapp.com` |
| Contraseña | `123456` |

> El correo debe usar el dominio `@musicapp.com` (validación del formulario de login).

## Funcionalidades

- Inicio y cierre de sesión con guards de ruta
- Creación y eliminación de playlists
- Detalle de playlist con listado de canciones
- Agregar canciones desde la API de iTunes (título, artista, duración, preview)
- Eliminar canciones y reordenar por arrastre
- Reproductor global con play/pausa, anterior/siguiente, shuffle y loop
- Persistencia local (`localStorage` para playlists, `sessionStorage` para sesión)

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

## Despliegue en Netlify

El proyecto incluye [`netlify.toml`](./netlify.toml) con la configuración necesaria.

### Opción A — Desde GitHub (recomendada)

1. Sube los cambios a GitHub (`git push`).
2. Entra en [Netlify](https://app.netlify.com) → **Add new site** → **Import an existing project**.
3. Conecta el repositorio `JaimeOss/music-playlist`.
4. Netlify detectará automáticamente:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist/music-playlist/browser`
5. Pulsa **Deploy site**.
6. Cuando termine, copia la URL (ej. `https://music-playlist-xxxxx.netlify.app`) y actualiza la tabla **Demo en vivo** de este README.

### Opción B — Deploy manual (CLI)

```bash
npm install -g netlify-cli
npm run build
netlify login
netlify init
netlify deploy --prod
```

## Estructura del proyecto

```
src/app/
├── core/           # Servicios, guards, modelos, validadores
├── features/       # Login, home, detalle de playlist
└── shared/         # Componentes reutilizables (player, song-item, etc.)
```

## Notas

- La búsqueda de canciones usa la API pública de iTunes (JSONP). Si falla, desactiva bloqueadores de anuncios o scripts de terceros para `itunes.apple.com`.
- Las canciones demo incluidas en las playlists iniciales no tienen preview de audio; agrega canciones desde iTunes para probar la reproducción.
- Al refrescar la página en rutas internas (`/home`, `/playlist/...`), Netlify redirige a `index.html` gracie a la regla SPA del `netlify.toml`.

## Tecnologías

- Angular 21 (standalone components, signals, lazy routes)
- Angular CDK (drag & drop)
- PrimeNG + PrimeIcons
- Tailwind CSS 4
- RxJS
