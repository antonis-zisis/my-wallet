import { createContext, type ReactNode, useContext, useState } from 'react';

interface PrivacyContextType {
  isAmountsHidden: boolean;
  toggleAmountsHidden: () => void;
}

const PrivacyContext = createContext<PrivacyContextType>({
  isAmountsHidden: false,
  toggleAmountsHidden: () => {},
});

function getStoredVisibility(): boolean {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem('amountsHidden') === 'true';
    } catch {
      return false;
    }
  }
  return false;
}

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [isAmountsHidden, setIsAmountsHidden] = useState<boolean>(() =>
    getStoredVisibility()
  );

  const toggleAmountsHidden = () => {
    setIsAmountsHidden((previous) => {
      const next = !previous;
      try {
        localStorage.setItem('amountsHidden', String(next));
      } catch (error) {
        console.error('Failed to save privacy preference: ', error);
      }
      return next;
    });
  };

  return (
    <PrivacyContext.Provider value={{ isAmountsHidden, toggleAmountsHidden }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}
