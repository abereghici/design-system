const decimals = (value: number) => (String(value).split(".")[1] ?? "").length;

/**
 * The nearest value on the grid of steps counted from `min` (or 0), kept within the bounds. It
 * rounds to the decimals of `step` and `min`, so `0.05 + 0.1` reads 0.15, not 0.15000000000000002.
 */
export function snapValueToStep(
  value: number,
  min: number | undefined,
  max: number | undefined,
  step: number,
) {
  const base = min ?? 0;
  const snapped = base + Math.round((value - base) / step) * step;
  const rounded = Number(snapped.toFixed(Math.max(decimals(step), decimals(base))));

  return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, rounded));
}
