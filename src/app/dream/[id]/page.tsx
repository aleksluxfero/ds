
'use client';

import DreamDetailPage from '@/components/dream-journal/pages/DreamDetailPage';
import DreamJournalLayout from '@/components/dream-journal/DreamJournalLayout';

/**
 * This is the Next.js page for the /dream/[id] route.
 */
export default function DreamDetailRoute() {
  return (
    <DreamJournalLayout>
      <DreamDetailPage />
    </DreamJournalLayout>
  );
}
