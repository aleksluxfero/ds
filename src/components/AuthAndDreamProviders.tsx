'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { useRawInitData } from '@telegram-apps/sdk-react';
import { AuthProvider } from '@/contexts/AuthContext';
import { DreamProvider } from '@/contexts/DreamContext';
import DreamJournalLayout from './dream-journal/DreamJournalLayout';
import LoadingSpinner from './dream-journal/LoadingSpinner';
import { getAllDreams } from '@/services/api';
import { Dream } from '@/types/dream';

const AuthAndDreamProviders = ({ children }: PropsWithChildren) => {
  const initDataRaw = useRawInitData();
  const [status, setStatus] = useState<'syncing' | 'ready' | 'error'>('syncing');
  const [errorMessage, setErrorMessage] = useState('');
  const [initialDreams, setInitialDreams] = useState<Dream[]>([]);

  useEffect(() => {
    if (!initDataRaw) {
      setErrorMessage('Telegram initialization data not found. Please launch the app via Telegram.');
      setStatus('error');
      return;
    }

    const syncUser = async () => {
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: initDataRaw }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sync user.');
      }
    };

    const loadDreams = async () => {
      const dreamsFromDB = await getAllDreams(initDataRaw);
      const sortedDreams = dreamsFromDB.sort((a, b) => {
        const sortValueA = a.date ? Number(a.date) : Number(a.created_at);
        const sortValueB = b.date ? Number(b.date) : Number(b.created_at);
        return sortValueB - sortValueA;
      });
      setInitialDreams(sortedDreams);
    };

    const initializeApp = async () => {
      try {
        await Promise.all([syncUser(), loadDreams()]);
        setStatus('ready');
      } catch (error: any) {
        console.error('Initialization failed:', error);
        setErrorMessage(error.message || 'An unknown error occurred during initialization.');
        setStatus('error');
      }
    };

    initializeApp();
  }, [initDataRaw]);

  if (status === 'syncing') {
    return (
      <DreamJournalLayout>
        <LoadingSpinner text="Синхронизация и загрузка..." fullScreen={true} />
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
      <DreamProvider initialDreams={initialDreams}>
        {children}
      </DreamProvider>
    </AuthProvider>
  );
};

export default AuthAndDreamProviders;
