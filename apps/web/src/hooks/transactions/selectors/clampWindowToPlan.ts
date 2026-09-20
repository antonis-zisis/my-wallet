import { WINDOW_OPTIONS, type WindowOption } from '../useCategoryTrendsData';

export function clampWindowToPlan(
  windowMonths: WindowOption,
  maxMonths: number | null
): WindowOption {
  if (maxMonths === null || windowMonths <= maxMonths) {
    return windowMonths;
  }

  const allowed = WINDOW_OPTIONS.filter((option) => option <= maxMonths);

  return allowed.at(-1) ?? WINDOW_OPTIONS[0];
}
