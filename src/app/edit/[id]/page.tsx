
'use client';

import AddDreamPage from '@/components/dream-journal/pages/AddDreamPage';
import DreamJournalLayout from '@/components/dream-journal/DreamJournalLayout';

/**
 * This is the Next.js page for the /edit/[id] route.
 * It renders the same component as the add page, because
 * the component itself handles the edit logic based on the URL parameter.
 */
export default function EditDreamRoute() {
  return (
    <DreamJournalLayout>
      <AddDreamPage />
    </DreamJournalLayout>
  );
}
