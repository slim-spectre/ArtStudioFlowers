import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname, state } = useLocation();

  useEffect(() => {
    if (!state || !(state as any).scrollTo) {
      window.scrollTo(0, 0);
    }
  }, [pathname, state]);

  return null;
};