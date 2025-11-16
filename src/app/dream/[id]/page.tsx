
'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { DreamProvider } from '@/contexts/DreamContext';
import DreamDetailPage from '@/components/dream-journal/pages/DreamDetailPage';
import { useRawInitData } from '@telegram-apps/sdk-react';
import DreamJournalLayout from '@/components/dream-journal/DreamJournalLayout';

/**
 * This is the Next.js page for the /dream/[id] route.
 * It wraps the actual page component with the AuthProvider
 * to ensure it has access to the authentication context.
 */
export default function DreamDetailRoute() {
  const initData = useRawInitData();

  return (
    <DreamJournalLayout>
      <AuthProvider initDataRaw={initData}>
        <DreamProvider>
          <DreamDetailPage />
        </DreamProvider>
      </AuthProvider>
    </DreamJournalLayout>
  );
}
