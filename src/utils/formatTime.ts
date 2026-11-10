/**
 * Formats time in seconds to HH:MM:SS or MM:SS
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
    return '00:00';
  }

  const floorSec = Math.floor(seconds);
  const hours = Math.floor(floorSec / 3600);
  const minutes = Math.floor((floorSec % 3600) / 60);
  const remainingSeconds = floorSec % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(remainingSeconds).padStart(2, '0');

  if (hours > 0) {
    const paddedHours = String(hours).padStart(2, '0');
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${paddedMinutes}:${paddedSeconds}`;
}
