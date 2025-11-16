
'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import AddDreamPage from '@/components/dream-journal/pages/AddDreamPage';
import { useRawInitData } from '@telegram-apps/sdk-react';
import DreamJournalLayout from '@/components/dream-journal/DreamJournalLayout';

/**
 * This is the Next.js page for the /edit/[id] route.
 * It renders the same component as the add page, because
 * the component itself handles the edit logic based on the URL parameter.
 */
export default function EditDreamRoute() {
  const initData = useRawInitData();

  return (
    <DreamJournalLayout>
      <AuthProvider initDataRaw={initData}>
        <AddDreamPage />
      </AuthProvider>
    </DreamJournalLayout>
  );
}
