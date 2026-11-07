/**
 * Geometry for the cover's curve field (viewBox 0 0 1440 720).
 * 34 curves run horizontal on the left, pinch together near (830, 395),
 * then fan out to the right. Shared by the static render and the client
 * script, so the interactive field starts exactly where the HTML left it.
 */
export type Pt = [number, number];

export interface Curve {
  P0: Pt;
  C1: Pt;
  C2: Pt;
  M: Pt;
  C3: Pt;
  C4: Pt;
  P3: Pt;
}

export const CURVE_COUNT = 34;
/** The single Cherokee red line. */
export const RED_CURVE = 22;
export const PINCH: Pt = [830, 407];

export function restCurves(n = CURVE_COUNT): Curve[] {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const P0: Pt = [-40, 40 + 660 * t];
    const C1: Pt = [300, 40 + 660 * t];
    const C2: Pt = [560, 300 + 150 * t];
    const M: Pt = [830, 360 + 70 * t];
    const C3: Pt = [2 * M[0] - C2[0], 2 * M[1] - C2[1]]; // mirror C2 so the curve is smooth at M
    const yEnd = -60 + 820 * Math.pow(t, 1.15);
    const C4: Pt = [1250, yEnd];
    const P3: Pt = [1480, yEnd];
    return { P0, C1, C2, M, C3, C4, P3 };
  });
}

const f = (p: Pt) => `${+p[0].toFixed(1)} ${+p[1].toFixed(1)}`;

export function pathD(c: Curve): string {
  return `M${f(c.P0)}C${f(c.C1)} ${f(c.C2)} ${f(c.M)}C${f(c.C3)} ${f(c.C4)} ${f(c.P3)}`;
}

/** "X 0830.0   Y 0406.7" */
export function readout(x: number, y: number): string {
  const n = (v: number) => Math.max(0, v).toFixed(1).padStart(6, '0');
  return `X ${n(x)}   Y ${n(y)}`;
}
