/** iTunes devuelve URLs pequeñas (100x100). Se puede pedir mayor resolución cambiando el segmento del path. */
export function toHighResArtworkUrl(url: string, size = 600): string {
  if (!url || url.startsWith('/')) {
    return url;
  }

  return url.replace(/\d+x\d+bb(?=\.[a-z]+)/i, `${size}x${size}bb`);
}
