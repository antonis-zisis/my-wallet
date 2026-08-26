type MediaQueryListener = () => void;

type ControllableMatchMedia = {
  restore: () => void;
  setMatchingQueries: (queries: Array<string>) => void;
};

export function installMatchMedia(
  matchingQueries: Array<string> = []
): ControllableMatchMedia {
  const original = window.matchMedia;
  const listeners = new Set<MediaQueryListener>();
  let matching = matchingQueries;

  window.matchMedia = ((query: string) => ({
    matches: matching.includes(query),
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: MediaQueryListener) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: MediaQueryListener) => {
      listeners.delete(listener);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;

  return {
    restore: () => {
      window.matchMedia = original;
    },
    setMatchingQueries: (queries: Array<string>) => {
      matching = queries;
      listeners.forEach((listener) => listener());
    },
  };
}

export const MOBILE_VIEWPORT_QUERY = '(max-width: 767px)';
