'use client';

import { useState } from 'react';
import { useSupabase } from '../supabase-provider';

export default function LoginPage() {
  const supabase = useSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Signed in.');
    }
  }

  async function handleSignUp() {
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email to confirm your account.');
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Login / Sign up</h1>
      <form onSubmit={handleSignIn}>
        <div>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit">Sign in</button>
          <button
            type="button"
            onClick={handleSignUp}
            style={{ marginLeft: 8 }}
          >
            Sign up
          </button>
        </div>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
