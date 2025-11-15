
'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import StatisticsPage from '@/components/dream-journal/pages/StatisticsPage';
import { useRawInitData } from '@telegram-apps/sdk-react';

/**
 * This is the Next.js page for the /stats route.
 * It wraps the actual page component with the AuthProvider
 * to ensure it has access to the authentication context.
 */
export default function StatsRoute() {
  const initData = useRawInitData();

  return (
    <AuthProvider initDataRaw={initData}>
      <StatisticsPage />
    </AuthProvider>
  );
}
