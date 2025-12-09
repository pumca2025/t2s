import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig } from '../types';

interface AccessibilityContextType extends AppConfig {
  setFontSize: (size: AppConfig['fontSize']) => void;
  toggleHighContrast: () => void;
  setSpeechSpeed: (speed: number) => void;
  getFontSizeClass: () => string;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<AppConfig['fontSize']>('large'); // Default to large for a11y
  const [highContrast, setHighContrast] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);

  const toggleHighContrast = () => setHighContrast(prev => !prev);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'normal': return 'text-base';
      case 'large': return 'text-xl';
      case 'extra-large': return 'text-3xl font-bold';
      default: return 'text-xl';
    }
  };

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('high-contrast');
      document.documentElement.classList.remove('dark');
    }
  }, [highContrast]);

  return (
    <AccessibilityContext.Provider value={{
      fontSize,
      highContrast,
      speechSpeed,
      setFontSize,
      toggleHighContrast,
      setSpeechSpeed,
      getFontSizeClass
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useA11y = () => {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("useA11y must be used within AccessibilityProvider");
  return context;
};