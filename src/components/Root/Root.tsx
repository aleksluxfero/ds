'use client';

import { type PropsWithChildren, useEffect } from 'react';
import {
  initData,
  miniApp,
  useLaunchParams,
  useSignal,
} from '@telegram-apps/sdk-react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorPage } from '@/components/ErrorPage';
import { useDidMount } from '@/hooks/useDidMount';
import { setLocale } from '@/core/i18n/locale';
import LoadingSpinner from '../dream-journal/LoadingSpinner'; // Import LoadingSpinner
import DreamJournalLayout from '../dream-journal/DreamJournalLayout';

function RootInner({ children }: PropsWithChildren) {
  const lp = useLaunchParams();

  const isDark = useSignal(miniApp.isDark);
  const initDataUser = useSignal(initData.user);

  // Set the user locale.
  useEffect(() => {
    initDataUser && setLocale(initDataUser.language_code);
  }, [initDataUser]);

  // Expand the Mini App to full screen.
  useEffect(() => {
    // miniApp.expand(); // Removed to allow fullsize instead of fullscreen
    // miniApp.isVerticalSwipesEnabled = false; // Disable vertical swipes
    // miniApp.isClosingConfirmationEnabled = true; // Enable closing confirmation
  }, []);

  return (
    <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
      <AppRoot
        appearance={isDark ? 'dark' : 'light'}
        platform={
          ['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'
        }
      >
        {children}
      </AppRoot>
    </TonConnectUIProvider>
  );
}

export function Root(props: PropsWithChildren) {
  // Unfortunately, Telegram Mini Apps does not allow us to use all features of
  // the Server Side Rendering. That's why we are showing loader on the server
  // side.
  const didMount = useDidMount();

  return didMount ? (
    <ErrorBoundary fallback={ErrorPage}>
      <RootInner {...props} />
    </ErrorBoundary>
  ) : (
    <DreamJournalLayout>
      <LoadingSpinner text="Загрузка..." fullScreen={true} />
    </DreamJournalLayout>
  );
}
