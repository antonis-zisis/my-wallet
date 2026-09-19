import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';

// onboarding links into a page's create flow with ?new=1; the param is consumed
// once so a refresh or a back navigation doesn't reopen the modal
export function useOpenOnParam(onOpen: () => void, param = 'new') {
  const [searchParams, setSearchParams] = useSearchParams();
  const isRequested = searchParams.get(param) !== null;

  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  useEffect(() => {
    if (!isRequested) {
      return;
    }

    onOpenRef.current();

    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete(param);

        return next;
      },
      { replace: true }
    );
  }, [isRequested, param, setSearchParams]);
}
