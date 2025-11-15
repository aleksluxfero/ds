
'use client';

import { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  initDataRaw: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children, initDataRaw }: { children: ReactNode, initDataRaw: string | undefined }) => {
  return (
    <AuthContext.Provider value={{ initDataRaw }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
