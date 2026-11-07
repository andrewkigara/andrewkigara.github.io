/**
 * Key plan wedges are drawn pointing along +x and rotated by `bearing` degrees
 * (SVG rotation: clockwise, 0 = east). Convert that to a compass word.
 */
const POINTS = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];

export function facing(bearing: number): string {
  const compass = (((bearing + 90) % 360) + 360) % 360;
  return POINTS[Math.round(compass / 45) % 8]!;
}
