'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../supabase-provider';

export default function ProfilePage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/login');
        return;
      }
      setUserEmail(data.user.email ?? null);
      setChecking(false);
    }

    loadUser();
  }, [supabase, router]);

  if (checking) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Profile</h1>
        <p>Checking access…</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Profile</h1>
      <p>Email: {userEmail}</p>
    </main>
  );
}
