'use client';

import { PropsWithChildren } from 'react';
import { useRawInitData } from '@telegram-apps/sdk-react';
import { AuthProvider } from '@/contexts/AuthContext';

import DreamJournalLayout from './dream-journal/DreamJournalLayout';
import LoadingSpinner from './dream-journal/LoadingSpinner';
import { useEffect, useState } from 'react';

const AuthAndDreamProviders = ({ children }: PropsWithChildren) => {
  const initDataRaw = useRawInitData();
  const [status, setStatus] = useState<'syncing' | 'ready' | 'error'>('syncing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!initDataRaw) {
      setErrorMessage('Telegram initialization data not found. Please launch the app via Telegram.');
      setStatus('error');
      return;
    }

    const syncUser = async () => {
      try {
        const response = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initData: initDataRaw }),
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
  }, [initDataRaw]);

  if (status === 'syncing') {
    return (
      <DreamJournalLayout>
        <LoadingSpinner text="Синхронизация данных..." fullScreen={true} />
      </DreamJournalLayout>
    );
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
    <AuthProvider initDataRaw={initDataRaw}>
      {children}
    </AuthProvider>
  );
};

export default AuthAndDreamProviders;
