import React from 'react';
import { useFirstConnection } from '../contexts/FirstConnectionContext';
import FirstConnectionQuestionnaire from '../first-connection-questionnaire';

interface FirstConnectionWrapperProps {
  children: React.ReactNode;
}

export default function FirstConnectionWrapper({ children }: FirstConnectionWrapperProps) {
  const { showQuestionnaire, completeQuestionnaire } = useFirstConnection();

  return (
    <>
      {children}
      <FirstConnectionQuestionnaire
        visible={showQuestionnaire}
        onComplete={completeQuestionnaire}
      />
    </>
  );
} 