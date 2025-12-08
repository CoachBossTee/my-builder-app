'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from './supabase-provider';

export default function HomePage() {
  const supabase = useSupabase();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        setUserEmail(data.user.email ?? null);
      } else {
        setUserEmail(null);
      }
      setLoading(false);
    }

    loadUser();
  }, [supabase]);

  async function handleSignOut() {
    setMessage(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage(error.message);
    } else {
      setUserEmail(null);
      setMessage('Signed out.');
    }
  }

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <h1>My Builder Home</h1>
        <p>Checking session…</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>My Builder Home</h1>
      {userEmail ? (
        <>
          <p>Signed in as {userEmail}</p>
          <button onClick={handleSignOut}>Sign out</button>
        </>
      ) : (
        <p>Not signed in. Go to /login.</p>
      )}
      {message && <p>{message}</p>}
    </main>
  );
}
