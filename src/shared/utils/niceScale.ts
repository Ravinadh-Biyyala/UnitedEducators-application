export interface NiceScale {
  niceMax: number;
  ticks:   number[];
}

/**
 * Computes a "nice" round-number max + evenly spaced ticks given a data max.
 *
 *   niceScale(22, 5) → { niceMax: 24, ticks: [0, 6, 12, 18, 24] }
 *   niceScale(0,  5) → { niceMax: 10, ticks: [0, 2, 4, 6, 8, 10] }
 *   niceScale(8,  5) → { niceMax: 8,  ticks: [0, 2, 4, 6, 8] }
 */
export function niceScale(maxValue: number, tickCount: number = 5): NiceScale {
  if (maxValue <= 0) {
    const niceMax = 10;
    const step    = niceMax / tickCount;
    const ticks   = Array.from({ length: tickCount + 1 }, (_, i) => i * step);
    return { niceMax, ticks };
  }

  const rawStep   = maxValue / (tickCount - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  // Ceiling to nearest multiple of the magnitude (epsilon avoids fp precision issues on exact multiples)
  const niceStep  = Math.ceil(rawStep / magnitude - 1e-10) * magnitude;
  const niceMax   = niceStep * (tickCount - 1);
  const ticks     = Array.from({ length: tickCount }, (_, i) => i * niceStep);
  return { niceMax, ticks };
}
