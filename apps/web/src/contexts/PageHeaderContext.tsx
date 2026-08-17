// src/context/PageHeaderContext.tsx
import React, { createContext, useContext, useState } from 'react';

type HeaderOverride = {
  title: React.ReactNode;
  subtext?: React.ReactNode;
  onBack?: () => void;
} | null;

type PageHeaderContextValue = {
  headerOverride: HeaderOverride;
  setHeaderOverride: (override: HeaderOverride) => void;
};

const PageHeaderContext = createContext<PageHeaderContextValue | undefined>(
  undefined,
);

export const PageHeaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [headerOverride, setHeaderOverride] = useState<HeaderOverride>(null);
  return (
    <PageHeaderContext.Provider value={{ headerOverride, setHeaderOverride }}>
      {children}
    </PageHeaderContext.Provider>
  );
};

export const usePageHeader = () => {
  const ctx = useContext(PageHeaderContext);
  if (!ctx)
    throw new Error('usePageHeader must be used within PageHeaderProvider');
  return ctx;
};

// Convenience hook for pages: set on mount, auto-clear on unmount/route change
export const useSetPageHeader = (
  override: HeaderOverride,
  deps: React.DependencyList,
) => {
  const { setHeaderOverride } = usePageHeader();
  React.useEffect(() => {
    setHeaderOverride(override);
    return () => setHeaderOverride(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
