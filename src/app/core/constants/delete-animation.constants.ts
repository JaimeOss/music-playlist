export const DELETE_ANIMATION_MS = 680;

export function runAfterDeleteAnimation(callback: () => void): void {
  window.setTimeout(callback, DELETE_ANIMATION_MS);
}
