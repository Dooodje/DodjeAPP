import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DodjiService } from '../services/businessLogic/DodjiService';

interface WelcomePackContextType {
  showBadge: boolean;
  hideBadge: () => void;
  resetBadge: () => void;
}

const WelcomePackContext = createContext<WelcomePackContextType | undefined>(undefined);

interface WelcomePackProviderProps {
  children: ReactNode;
}

export const WelcomePackProvider: React.FC<WelcomePackProviderProps> = ({ children }) => {
  const [showBadge, setShowBadge] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const checkWelcomePackStatus = async () => {
      if (!user?.uid || !isAuthenticated) {
        setShowBadge(false);
        return;
      }
      
      try {
        const hasReceived = await DodjiService.hasReceivedReward(user.uid, 'welcome_pack');
        setShowBadge(!hasReceived);
      } catch (error) {
        console.error('Erreur lors de la vérification du pack de bienvenue:', error);
        setShowBadge(false);
      }
    };

    checkWelcomePackStatus();
  }, [user?.uid, isAuthenticated]);

  const hideBadge = () => {
    setShowBadge(false);
  };

  const resetBadge = () => {
    setShowBadge(true);
  };

  return (
    <WelcomePackContext.Provider value={{ showBadge, hideBadge, resetBadge }}>
      {children}
    </WelcomePackContext.Provider>
  );
};

export const useWelcomePackBadge = () => {
  const context = useContext(WelcomePackContext);
  if (context === undefined) {
    throw new Error('useWelcomePackBadge must be used within a WelcomePackProvider');
  }
  return context;
}; 