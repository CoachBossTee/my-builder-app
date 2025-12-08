import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SupabaseProvider } from './supabase-provider';

export const metadata: Metadata = {
  title: 'My Builder',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          <nav>
            <Link href="/">Home</Link>
            <Link href="/dashboard">Projects</Link>
            <Link href="/tasks">Tasks</Link>
            <Link href="/profile">Profile</Link>
            <Link href="/login">Login</Link>
          </nav>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
