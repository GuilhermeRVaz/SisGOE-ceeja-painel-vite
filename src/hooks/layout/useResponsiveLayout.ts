// =====================================================================
// HOOK PARA LAYOUT RESPONSIVO
// =====================================================================

import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export const useResponsiveLayout = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [isDocumentPanelVisible, setIsDocumentPanelVisible] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setBreakpoint('mobile');
        setIsDocumentPanelVisible(false);
      } else if (width < 1200) {
        setBreakpoint('tablet');
        setIsDocumentPanelVisible(false);
      } else {
        setBreakpoint('desktop');
        setIsDocumentPanelVisible(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDocumentPanel = () => {
    setIsDocumentPanelVisible(prev => !prev);
  };

  return {
    breakpoint,
    isDocumentPanelVisible,
    toggleDocumentPanel,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop'
  };
};
