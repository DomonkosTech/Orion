import { useEffect } from 'react';

/**
 * Custom hook to set the page title dynamically.
 * @param title The title to set.
 */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | Orion`;
    
    // Optional: restore title on unmount
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};
