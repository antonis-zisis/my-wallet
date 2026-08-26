import { useMediaQuery } from './useMediaQuery';

// mirrors Tailwind's `md` breakpoint, so a layout switched here and a sibling switched with `md:`
const BELOW_MD_BREAKPOINT = '(max-width: 767px)';

export function useIsMobileViewport(): boolean {
  return useMediaQuery(BELOW_MD_BREAKPOINT);
}
