import { createContext, useContext, type ReactNode } from 'react';
import { usePwaInstallPrompt } from '../hooks/usePwaInstallPrompt';

type PwaInstallContextValue = ReturnType<typeof usePwaInstallPrompt>;

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

export const PwaInstallProvider = ({ children }: { children: ReactNode }) => {
  const value = usePwaInstallPrompt();
  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>;
};

export const usePwaInstallContext = (): PwaInstallContextValue => {
  const context = useContext(PwaInstallContext);
  if (!context) {
    throw new Error('usePwaInstallContext must be used within PwaInstallProvider');
  }
  return context;
};
