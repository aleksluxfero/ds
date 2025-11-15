
'use client';

import { useEffect, useState } from 'react';
import { useRawInitData } from '@telegram-apps/sdk-react';
import { AuthProvider } from '@/contexts/AuthContext';
import HomePage from './dream-journal/pages/HomePage';
import LoadingSpinner from './dream-journal/LoadingSpinner';
import DreamJournalLayout from './dream-journal/DreamJournalLayout';

/**
 * This component is the main entry point for the Dream Journal application.
 * It handles the initial authentication and user sync with the backend.
 */
const DreamJournalApp = () => {
  const [status, setStatus] = useState<'syncing' | 'ready' | 'error'>('syncing');
  const [errorMessage, setErrorMessage] = useState('');
  const initData = useRawInitData();

  useEffect(() => {
    if (!initData) {
      return;
    }

    const syncUser = async () => {
      try {
        const response = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initData: initData }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to sync user.');
        }
        setStatus('ready');
      } catch (error: any) {
        console.error('User sync failed:', error);
        setErrorMessage(error.message || 'An unknown error occurred.');
        setStatus('error');
      }
    };

    syncUser();
  }, [initData]);

  if (status === 'syncing') {
    return <LoadingSpinner text="Синхронизация пользователя..." />;
  }

  if (status === 'error') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        <h1>Error</h1>
        <p>{errorMessage}</p>
      </div>
    );
  }

  return (
    <DreamJournalLayout>
      <AuthProvider initDataRaw={initData}>
        <HomePage />
      </AuthProvider>
    </DreamJournalLayout>
  );
};

export default DreamJournalApp;
