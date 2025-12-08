'use client';

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabaseClient';

const SupabaseContext = createContext<ReturnType<typeof createClient> | null>(
  null
);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) {
    throw new Error('useSupabase must be used inside <SupabaseProvider>');
  }
  return ctx;
}
