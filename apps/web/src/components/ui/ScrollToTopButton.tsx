import { useEffect, useState } from 'react';

import { ChevronUpIcon } from '../icons';

const SCROLL_THRESHOLD = 400;

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > SCROLL_THRESHOLD);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      aria-hidden={!isVisible}
      aria-label="Scroll to top"
      tabIndex={isVisible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`bg-brand-500 hover:bg-brand-600 fixed right-4 bottom-4 z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 sm:right-6 sm:bottom-6 sm:h-10 sm:w-10 ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <ChevronUpIcon className="h-5 w-5" />
    </button>
  );
}
