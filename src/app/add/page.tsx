
'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import AddDreamPage from '@/components/dream-journal/pages/AddDreamPage';
import { useRawInitData } from '@telegram-apps/sdk-react';
import DreamJournalLayout from '@/components/dream-journal/DreamJournalLayout';

/**
 * This is the Next.js page for the /add route.
 * It wraps the actual page component with the AuthProvider
 * to ensure it has access to the authentication context.
 */
export default function AddDreamRoute() {
  const initData = useRawInitData();

  return (
    <DreamJournalLayout>
      <AuthProvider initDataRaw={initData}>
        <AddDreamPage />
      </AuthProvider>
    </DreamJournalLayout>
  );
}
