import React, { createContext, useContext, useState, useCallback } from 'react';

interface PreopeningContextType {
  isPreopeningComplete: boolean;
  markPreopeningComplete: () => void;
}

const PreopeningContext = createContext<PreopeningContextType | undefined>(undefined);

export const PreopeningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPreopeningComplete, setIsPreopeningComplete] = useState(false);

  const markPreopeningComplete = useCallback(() => {
    console.log('🎯 PreopeningContext: Marquage du preopening comme terminé - déclenchement des listeners Firestore');
    setIsPreopeningComplete(true);
  }, []);

  return (
    <PreopeningContext.Provider value={{ isPreopeningComplete, markPreopeningComplete }}>
      {children}
    </PreopeningContext.Provider>
  );
};

export const usePreopeningContext = () => {
  const context = useContext(PreopeningContext);
  if (context === undefined) {
    throw new Error('usePreopeningContext must be used within a PreopeningProvider');
  }
  return context;
}; 