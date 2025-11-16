
'use client';

import AddDreamPage from '@/components/dream-journal/pages/AddDreamPage';
import DreamJournalLayout from '@/components/dream-journal/DreamJournalLayout';

/**
 * This is the Next.js page for the /add route.
 */
export default function AddDreamRoute() {
  return (
    <DreamJournalLayout>
      <AddDreamPage />
    </DreamJournalLayout>
  );
}
